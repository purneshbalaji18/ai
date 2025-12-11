# whatsapp_wasender.py
"""
Minimal Wasender-only WhatsApp sender module (no SMS fallback).

Environment variables (optional):
- WASENDER_SEND_URL    : override default Wasender endpoint.
- EMERGENCY_NUMBERS    : CSV of E.164 numbers (not required if you pass to_number to the send function).
- COOLDOWN_SECONDS     : seconds between sends (default 60)
- HTTP_TIMEOUT         : request timeout seconds (default 10)

This file contains the Wasender API key provided by you and will use it directly.
"""
import os
import time
import threading
import requests
import urllib.parse

# ---------- CONFIG ----------
# Embedded Wasender API key (from user)
WASENDER_API_KEY = "adefb719563cb46ddc99646284c3abd90f0a7d739e58185c792ce349fa3d5ed5"

# Endpoint (can be overridden via env)
WASENDER_SEND_URL = os.getenv("WASENDER_SEND_URL", "https://www.wasenderapi.com/api/send-message").strip()

# Optional emergency numbers read from env (CSV). Not required if you supply to_number.
EMERGENCY_NUMBERS = [n.strip() for n in os.getenv("EMERGENCY_NUMBERS", "").split(",") if n.strip()]

COOLDOWN_SECONDS = int(os.getenv("COOLDOWN_SECONDS", "60"))
HTTP_TIMEOUT = int(os.getenv("HTTP_TIMEOUT", "10"))

# Retry/backoff settings
MAX_RETRIES = 2
BACKOFF_SECONDS = 1
# ----------------------------

# Internal state for cooldown
_last_sent_ts = 0
_lock = threading.Lock()

def _now_ts():
    return int(time.time())

def _can_send():
    with _lock:
        return (_now_ts() - _last_sent_ts) >= COOLDOWN_SECONDS

def _mark_sent():
    global _last_sent_ts
    with _lock:
        _last_sent_ts = _now_ts()

def _make_maps_link(lat, lon, label=None):
    if lat is None or lon is None:
        return "Location unavailable"
    q = f"{lat},{lon}"
    if label:
        q = f"{lat},{lon} ({label})"
    return f"https://www.google.com/maps/?q={urllib.parse.quote(q)}"

def _send_wasender_blocking(number: str, message: str):
    """
    Blocking call to Wasender API.
    Payload: {"to": "<number>", "text": "<message>"}
    """
    if not WASENDER_API_KEY:
        raise RuntimeError("WASENDER_API_KEY is not configured")

    headers = {
        "Authorization": f"Bearer {WASENDER_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "to": number,
        "text": message
    }
    resp = requests.post(WASENDER_SEND_URL, json=payload, headers=headers, timeout=HTTP_TIMEOUT)
    return resp.status_code, resp.text

def send_wasender_alert_async(to_number: str = None,
                              lat: float = None,
                              lon: float = None,
                              event_label: str = "DANGER DETECTED",
                              extra_text: str = None,
                              send_to_all: bool = True):
    """
    Asynchronously send a WhatsApp alert via Wasender (non-blocking).
    - to_number: single recipient (overrides EMERGENCY_NUMBERS if provided).
    - send_to_all: if True and EMERGENCY_NUMBERS present, send to all numbers.
    Returns: (True, msg) or (False, reason)
    """
    # Determine targets
    if to_number:
        targets = [to_number]
    elif send_to_all and EMERGENCY_NUMBERS:
        targets = EMERGENCY_NUMBERS.copy()
    elif EMERGENCY_NUMBERS:
        targets = [EMERGENCY_NUMBERS[0]]
    else:
        return False, "No emergency numbers configured (provide to_number or set EMERGENCY_NUMBERS env var)"

    if not _can_send():
        return False, "Cooldown active"

    maps_link = _make_maps_link(lat, lon, event_label)
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    parts = [f"⚠️ {event_label}"]
    if extra_text:
        parts.append(extra_text)
    parts.append(f"Location: {maps_link}")
    parts.append(f"Time: {timestamp}")
    final_msg = "\n".join(p for p in parts if p)

    def _worker(targets_list, message_text):
        _mark_sent()
        for number in targets_list:
            last_resp = None
            sent_ok = False
            for attempt in range(MAX_RETRIES + 1):
                try:
                    status, resp_text = _send_wasender_blocking(number, message_text)
                    last_resp = (status, resp_text)
                    if 200 <= status < 300:
                        print(f"[wasender] Sent to {number} (status {status})")
                        sent_ok = True
                        break
                    else:
                        print(f"[wasender] Non-2xx response to {number}: {status} / {resp_text}")
                except Exception as e:
                    last_resp = ("exception", str(e))
                    print(f"[wasender] Exception sending to {number}: {e}")
                time.sleep(BACKOFF_SECONDS)
            print(f"[wasender] Final result for {number}: {last_resp}")

    thread = threading.Thread(target=_worker, args=(targets, final_msg), daemon=True)
    thread.start()
    return True, f"Dispatched to {len(targets)} target(s)"
