# location_helper.py
"""
Location helper for laptop + phone integration.

Provides:
- get_gps_coordinates(timeout_seconds=5) -> (lat, lon)
    * tries gpsd/serial (if available), then multiple IP providers (ipapi/ipinfo/ipgeolocation)
- _read_latest_from_file(max_age=30) -> (lat, lon)
    * reads latest_location.json written by a phone POST server (if you use phone_receiver)
- get_live_location(fixed_lat, fixed_lon) -> (lat, lon)
    * Priority:
       1) latest_location.json (phone push) if recent
       2) gpsd / serial NMEA
       3) multi-provider IP geolocation
       4) fixed_lat/fixed_lon (if provided)
       5) (None, None)
Notes:
- Requires `requests` for IP lookups (pip install requests).
- Optional libs for gps/serial: gps3, pyserial, pynmea2 (only used if installed).
"""

import os
import time
from typing import Tuple

# ---------- configurable ----------
LATEST_LOCATION_FILE = "latest_location.json"   # file written by phone_receiver.py (optional)
LATEST_MAX_AGE = 30     # seconds: consider phone location recent if written within this many seconds
# ----------------------------------

def _read_latest_from_file(max_age: int = LATEST_MAX_AGE) -> Tuple[float, float]:
    """Return (lat, lon) from latest_location.json if present and recent, else (None, None)."""
    fn = LATEST_LOCATION_FILE
    if not os.path.exists(fn):
        return (None, None)
    try:
        import json
        with open(fn, "r") as f:
            j = json.load(f)
        ts = j.get("ts")
        if ts and (time.time() - ts) <= max_age:
            lat = j.get("lat")
            lon = j.get("lon")
            if lat is not None and lon is not None:
                return float(lat), float(lon)
    except Exception:
        # any error -> treat as not available
        return (None, None)
    return (None, None)


def _query_ipapi() -> Tuple[float, float]:
    try:
        import requests
        r = requests.get("https://ipapi.co/json/", timeout=4)
        if r.status_code == 200:
            j = r.json()
            lat = j.get("latitude") or j.get("lat")
            lon = j.get("longitude") or j.get("lon")
            if lat is not None and lon is not None:
                return float(lat), float(lon)
    except Exception:
        pass
    return (None, None)


def _query_ipinfo() -> Tuple[float, float]:
    try:
        import requests
        r = requests.get("https://ipinfo.io/json", timeout=4)
        if r.status_code == 200:
            j = r.json()
            loc = j.get("loc")
            if loc:
                lat_str, lon_str = loc.split(",")
                return float(lat_str), float(lon_str)
    except Exception:
        pass
    return (None, None)


def _query_ipgeolocation() -> Tuple[float, float]:
    try:
        import requests
        # free endpoint may exist without key; if you have a key you can modify the URL/params
        r = requests.get("https://api.ipgeolocation.io/ipgeo", timeout=4)
        if r.status_code == 200:
            j = r.json()
            lat = j.get("latitude")
            lon = j.get("longitude")
            if lat is not None and lon is not None:
                return float(lat), float(lon)
    except Exception:
        pass
    return (None, None)


def get_gps_coordinates(timeout_seconds: int = 5) -> Tuple[float, float]:
    """
    Try to obtain live coordinates. Order:
      - gpsd via gps3 (if available)
      - serial NMEA via pyserial + pynmea2 (if available)
      - multi-provider IP geolocation (ipapi > ipinfo > ipgeolocation)
    Returns (lat, lon) or (None, None).
    """
    # 1) gpsd via gps3
    try:
        from gps3 import gps3
        start = time.time()
        gps_socket = gps3.GPSDSocket()
        data_stream = gps3.DataStream()
        gps_socket.connect()
        gps_socket.watch()
        for new_data in gps_socket:
            if new_data:
                data_stream.unpack(new_data)
                lat = getattr(data_stream.TPV, "lat", None)
                lon = getattr(data_stream.TPV, "lon", None)
                if lat is not None and lon is not None:
                    try:
                        return float(lat), float(lon)
                    except Exception:
                        pass
            if time.time() - start > timeout_seconds:
                break
    except Exception:
        pass

    # 2) Serial NMEA (pyserial + pynmea2)
    try:
        import serial
        import pynmea2
        candidates = [
            '/dev/ttyUSB0', '/dev/ttyUSB1', '/dev/ttyACM0', '/dev/ttyAMA0',
            '/dev/ttyS0', 'COM3', 'COM4', 'COM5'
        ]
        start_all = time.time()
        for port in candidates:
            try:
                ser = serial.Serial(port, baudrate=9600, timeout=1)
            except Exception:
                continue
            start = time.time()
            try:
                while time.time() - start < min(2, timeout_seconds):
                    line = ser.readline().decode('ascii', errors='ignore').strip()
                    if not line:
                        continue
                    if line.startswith('$GPGGA') or line.startswith('$GNGGA') or line.startswith('$GPRMC') or line.startswith('$GNRMC'):
                        try:
                            msg = pynmea2.parse(line)
                            if hasattr(msg, 'latitude') and hasattr(msg, 'longitude'):
                                latf = msg.latitude
                                lonf = msg.longitude
                                if latf is not None and lonf is not None:
                                    return float(latf), float(lonf)
                        except Exception:
                            continue
            finally:
                try:
                    ser.close()
                except Exception:
                    pass
            if time.time() - start_all > timeout_seconds * 2:
                break
    except Exception:
        pass

    # 3) IP geolocation multi-provider (best-effort)
    lat, lon = _query_ipapi()
    if lat is not None and lon is not None:
        return lat, lon
    lat, lon = _query_ipinfo()
    if lat is not None and lon is not None:
        return lat, lon
    lat, lon = _query_ipgeolocation()
    if lat is not None and lon is not None:
        return lat, lon

    return (None, None)


def get_live_location(fixed_lat: float = None, fixed_lon: float = None) -> Tuple[float, float]:
    """
    Return the best available live coordinates, prioritizing:
     1) latest_location.json (phone push) if recent
     2) gpsd / serial NMEA
     3) multi-provider IP geolocation
     4) fixed_lat/fixed_lon (if provided)
     5) (None, None)
    This function signature matches main_surveillance.py expectations.
    """
    try:
        # 1) phone pushed file
        lat, lon = _read_latest_from_file()
        if lat is not None and lon is not None:
            return lat, lon
    except Exception:
        pass

    try:
        # 2/3) GPS or IP
        lat, lon = get_gps_coordinates()
        if lat is not None and lon is not None:
            return lat, lon
    except Exception:
        pass

    # 4) fixed coordinates if user provided at startup
    if fixed_lat is not None and fixed_lon is not None:
        try:
            return float(fixed_lat), float(fixed_lon)
        except Exception:
            pass

    return (None, None)


# Quick manual test when run directly
if __name__ == "__main__":
    print("Reading latest file:", _read_latest_from_file())
    print("GPS/IP attempt (may be slow):", get_gps_coordinates())
    print("get_live_location(None,None):", get_live_location(None, None))
