# main_surveillance.py
"""
Final integrated surveillance script:
- Uses YOLOv8 weapon detector (your existing module)
- Audio thread, pose module, proximity logic as before
- Automatically acquires laptop location (IP-based) and sends WhatsApp alert via Wasender on DANGER
- Emergency number can be provided via:
    * CLI: --emergency +919.... OR
    * ENV: EMERGENCY_NUMBER OR
    * Interactive prompt (TTY only)
"""

import os
import sys
import time
import traceback
import re
import logging

# Reduce noisy logs early
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
logging.getLogger("urllib3").setLevel(logging.WARNING)

import cv2

# local helpers & modules
from audio_thread import AudioThread
from weapon_detector import get_weapon_score
from proximity_logic import get_proximity_score
from location_helper import get_live_location
from whatsapp_wasender import send_wasender_alert_async

# Wasender sender
try:
    from whatsapp_wasender import send_wasender_alert_async
except Exception as e:
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] WARNING: whatsapp_wasender import failed: {e}")
    def send_wasender_alert_async(*args, **kwargs):
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] [wasender_stub] called")
        return False, "wasender missing"

try:
    from pose_module import get_pose_score
except ImportError:
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] WARNING: pose_module not found; pose scoring disabled.")
    def get_pose_score(f): return 0

# CONFIG
ALERT_THRESHOLD = 60
TARGET_WIDTH = 480
TARGET_HEIGHT = 360
SKIP_RATE = 5

def safe_print(*args, **kwargs):
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] ", *args, **kwargs)

def _validate_e164(number: str) -> bool:
    return bool(number and re.match(r"^\+\d{8,15}$", number.strip()))

def get_emergency_number_from_sources() -> str:
    # CLI arg: --emergency +91...
    for i, a in enumerate(sys.argv):
        if a.startswith("--emergency="):
            return a.split("=",1)[1].strip()
        if a == "--emergency" and i+1 < len(sys.argv):
            return sys.argv[i+1].strip()
    # ENV
    env_val = os.getenv("EMERGENCY_NUMBER", "").strip()
    if env_val:
        return env_val
    return ""

def prompt_emergency_contact_interactive() -> str:
    if not sys.stdin or not sys.stdin.isatty():
        safe_print("Non-interactive; skipping emergency prompt.")
        return ""
    safe_print("Enter emergency WhatsApp number in E.164 format (e.g. +919876543210) or press Enter to skip.")
    while True:
        try:
            num = input("Emergency WhatsApp number (E.164): ").strip()
        except Exception:
            return ""
        if num == "":
            return ""
        if _validate_e164(num):
            safe_print(f"Using emergency number: {num}")
            return num
        # try normalize 10-digit Indian number
        digits = re.sub(r"\D", "", num)
        if len(digits) == 10:
            candidate = "+91" + digits
            safe_print(f"Interpreting short number as {candidate}")
            return candidate
        safe_print("Invalid format. Use +919876543210 or press Enter to skip.")

def prompt_fixed_location_interactive():
    """
    Non-blocking startup behavior:
      - If CLI arg '--coords lat,lon' provided, parse and return it.
      - Else if ENV EMERGENCY_COORDS set (e.g. "19.07,72.87"), parse and return it.
      - Else DO NOT prompt at startup; return (None, None).
    """
    # 1) CLI arg support
    for i, a in enumerate(sys.argv):
        if a.startswith("--coords="):
            val = a.split("=", 1)[1].strip()
            return _parse_coords_string(val)
        if a == "--coords" and i + 1 < len(sys.argv):
            return _parse_coords_string(sys.argv[i+1].strip())

    # 2) Environment variable
    env_coords = os.getenv("EMERGENCY_COORDS", "").strip()
    if env_coords:
        return _parse_coords_string(env_coords)

    # 3) Non-interactive default
    safe_print("No fixed coords provided via --coords or EMERGENCY_COORDS; skipping startup prompt.")
    return (None, None)


def _parse_coords_string(s: str):
    """Helper to parse 'lat,lon', '(lat,lon)', 'lat lon' or Google Maps URLs."""
    import re
    from urllib.parse import urlparse, parse_qs

    s = (s or "").strip()
    if not s:
        return (None, None)

    # Google Maps URL support
    if s.startswith("http"):
        try:
            parsed = urlparse(s)
            q = parse_qs(parsed.query).get("q")
            if q:
                parts = q[0].split(",")
                return float(parts[0]), float(parts[1])
            m = re.search(r"/@(-?\d+\.\d+),(-?\d+\.\d+)", parsed.path)
            if m:
                return float(m.group(1)), float(m.group(2))
        except:
            return (None, None)

    # remove parentheses
    s2 = s.lstrip("(").rstrip(")")

    # "lat lon" → "lat,lon"
    if re.match(r"^-?\d+(\.\d+)?\s+-?\d+(\.\d+)?$", s2):
        s2 = ",".join(s2.split())

    if "," in s2:
        try:
            lat, lon = s2.split(",", 1)
            return float(lat.strip()), float(lon.strip())
        except:
            return (None, None)

    return (None, None)

def main():
    # emergency number from CLI/env first
    emergency_number = get_emergency_number_from_sources()
    if emergency_number and not _validate_e164(emergency_number):
        safe_print("Provided emergency number invalid; will prompt interactively if available.")
        emergency_number = ""

    fixed_lat, fixed_lon = prompt_fixed_location_interactive()
    if not emergency_number:
        emergency_number = prompt_emergency_contact_interactive()

    # camera
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        safe_print("Could not open webcam — retrying...")
        retries = 0
        while retries < 5 and not cap.isOpened():
            time.sleep(1)
            try:
                cap.open(0, cv2.CAP_DSHOW)
            except Exception:
                pass
            retries += 1
            safe_print(f"Retry {retries}, opened: {cap.isOpened()}")
        if not cap.isOpened():
            safe_print("Fatal: camera not available. Exiting.")
            return

    # state
    frame_count = 0
    current_weapon_score = 0
    current_proximity_score = 0
    current_pose_score = 0
    current_weapons_detected = []
    last_status = "SAFE"

    # audio thread
    audio_checker = AudioThread(1)
    audio_checker.daemon = True
    try:
        audio_checker.start()
    except Exception as e:
        safe_print("Audio thread start warning:", e)

    safe_print(f"System Armed. Threshold: {ALERT_THRESHOLD}")

    running = True
    try:
        while running:
            try:
                ret, frame = cap.read()
            except Exception as e:
                safe_print("Camera read error:", e)
                ret = False
                frame = None

            if not ret or frame is None:
                time.sleep(0.2)
                if not cap.isOpened():
                    try:
                        cap.open(0, cv2.CAP_DSHOW)
                    except Exception:
                        pass
                continue

            frame_count += 1
            try:
                frame = cv2.resize(frame, (TARGET_WIDTH, TARGET_HEIGHT))
            except Exception as e:
                safe_print("Frame resize error:", e)
                continue

            # processing every SKIP_RATE frames
            if frame_count % SKIP_RATE == 0:
                try:
                    result_data = get_weapon_score(frame)
                except Exception as e:
                    safe_print("Weapon detection error:", e)
                    result_data = None

                if isinstance(result_data, tuple):
                    try:
                        w_score = result_data[0]
                        raw_list = result_data[1]
                        raw_results = result_data[2]
                    except Exception:
                        w_score = 0; raw_list = []; raw_results = None
                    current_weapon_score = 45 if w_score > 0 else 0
                    current_weapons_detected = []
                    for item in raw_list:
                        try:
                            if item in ["baseball bat", "scissors", "knife"]:
                                current_weapons_detected.append("WEAPON")
                            else:
                                current_weapons_detected.append(item)
                        except Exception:
                            continue
                else:
                    current_weapon_score = 0
                    current_weapons_detected = []
                    raw_results = None

                try:
                    current_proximity_score = get_proximity_score(raw_results)
                except Exception as e:
                    safe_print("Proximity error:", e)
                    current_proximity_score = 0

                try:
                    current_pose_score = get_pose_score(frame)
                except Exception as e:
                    safe_print("Pose error:", e)
                    current_pose_score = 0

            try:
                last_audio_pts = audio_checker.get_score()
            except Exception as e:
                safe_print("Audio error:", e)
                last_audio_pts = 0

            total_score = (int(current_pose_score) + int(last_audio_pts) +
                           int(current_weapon_score) + int(current_proximity_score))

            # visualization
            color = (0,255,0)
            status = "SAFE"
            if total_score >= ALERT_THRESHOLD:
                color = (0,0,255); status = "DANGER DETECTED"
            elif total_score >= 35:
                color = (0,255,255); status = "WARNING"

            info_text = f"Aud:{last_audio_pts} Wpn:{current_weapon_score} Pose:{current_pose_score} Prox:{current_proximity_score} = {total_score}"
            try:
                cv2.putText(frame, f"STATUS: {status}", (10,25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                cv2.putText(frame, f"SCORE: {total_score}/{ALERT_THRESHOLD}", (10,50), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                if current_weapons_detected:
                    cv2.putText(frame, f"Weapon: {current_weapons_detected[0]}", (10,80), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,165,255), 2)
                cv2.putText(frame, info_text, (5, TARGET_HEIGHT - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200,200,200), 1)
            except Exception:
                pass

            try:
                cv2.imshow("Surveillance System", frame)
            except Exception:
                pass

            # alert trigger - send to emergency_number (prompt if interactive and missing)
            try:
                if status == "DANGER DETECTED" and last_status != "DANGER DETECTED":
                    weapons_txt = ", ".join(current_weapons_detected) if current_weapons_detected else ""
                    extra = f"Weapons: {weapons_txt}\n{info_text}" if weapons_txt else info_text

                    lat, lon = get_live_location(fixed_lat, fixed_lon)

                    if not emergency_number and sys.stdin and sys.stdin.isatty():
                        emergency_number = prompt_emergency_contact_interactive()

                    if not emergency_number:
                        safe_print("No emergency number; skipping WhatsApp alert.")
                    else:
                        try:
                            sent, msg = send_wasender_alert_async(
                                to_number=emergency_number,
                                lat=lat, lon=lon,
                                event_label=status,
                                extra_text=extra,
                                send_to_all=False
                            )
                            safe_print(f"[ALERT] Wasender dispatch -> {sent}: {msg}")
                        except Exception as e:
                            safe_print("Wasender send exception:", e)
            except Exception as e:
                safe_print("Error in alert trigger:", e)

            last_status = status

            # key handling
            try:
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    safe_print("Quit pressed; exiting.")
                    running = False
            except Exception:
                pass

            time.sleep(0.001)

    except Exception as e:
        safe_print("Unhandled exception:", e)
        traceback.print_exc()
    finally:
        safe_print("Shutting down...")
        try:
            audio_checker.stop()
        except Exception:
            pass
        try:
            if cap and cap.isOpened():
                cap.release()
        except Exception:
            pass
        try:
            cv2.destroyAllWindows()
        except Exception:
            pass
        safe_print("Exited cleanly.")
        sys.exit(0)

if __name__ == "__main__":
    main()
