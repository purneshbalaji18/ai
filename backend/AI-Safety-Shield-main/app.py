import cv2
import numpy as np
import base64
from flask import Flask, render_template, request, redirect, url_for, session, jsonify

# Import your existing AI modules
# NOTE: We removed audio_thread because the browser will handle audio listening now.
from weapon_detector import get_weapon_score
from proximity_logic import get_proximity_score
from whatsapp_wasender import send_wasender_alert_async

# Optional modules
try:
    from pose_module import get_pose_score
except ImportError:
    def get_pose_score(f): return 0

app = Flask(__name__)
app.secret_key = "secret_safety_key"

# --- GLOBAL VARIABLES ---
# In a real SaaS, these would be in a database.
last_alert_time = 0

def decode_image(image_data):
    """Convert raw upload data to OpenCV image"""
    np_img = np.frombuffer(image_data.read(), np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    return img

@app.route('/')
def step1_home():
    return render_template('1_home.html')

@app.route('/details', methods=['GET', 'POST'])
def step3_details():
    if request.method == 'POST':
        session['user_name'] = request.form.get('name')
        session['address'] = request.form.get('address')
        return redirect(url_for('step4_emergency'))
    return render_template('3_details.html')

@app.route('/emergency', methods=['GET', 'POST'])
def step4_emergency():
    if request.method == 'POST':
        session['emergency_contact'] = request.form.get('phone')
        return redirect(url_for('step5_monitor'))
    return render_template('4_emergency.html')

@app.route('/monitor')
def step5_monitor():
    if 'user_name' not in session:
        return redirect(url_for('step1_home'))
    
    return render_template('5_monitor.html', 
                         name=session.get('user_name'),
                         contact=session.get('emergency_contact'))

# --- NEW API: PROCESS FRAME ---
@app.route('/api/analyze', methods=['POST'])
def analyze_frame():
    global last_alert_time
    
    # 1. Get Data from Browser
    if 'image' not in request.files:
        return jsonify({"error": "No image"}), 400
    
    # Audio level comes from the browser now (0 to 100)
    client_audio_level = float(request.form.get('audio_level', 0))
    
    # 2. Decode Image
    frame = decode_image(request.files['image'])
    frame = cv2.resize(frame, (480, 360))

    # 3. AI Detection Logic
    # Weapon
    try:
        w_res = get_weapon_score(frame)
        if isinstance(w_res, tuple):
            w_score = 45 if w_res[0] > 0 else 0
            weapons_list = [x for x in w_res[1] if x in ["knife", "baseball bat", "scissors"]]
        else:
            w_score = 0; weapons_list = []
    except: w_score = 0; weapons_list = []

    # Pose
    p_score = get_pose_score(frame)
    
    # Audio (Mapped from client 0-100 to our score system)
    # If client audio is loud (>50), give it points
    a_score = 40 if client_audio_level > 50 else 0

    # 4. Calculate Total
    total_score = w_score + a_score + p_score
    
    status = "SAFE"
    if total_score >= 60:
        status = "DANGER"
        # Send Alert Logic (with cooldown)
        # (In production, use time.time() to prevent spamming)
        if session.get('emergency_contact'):
             # Trigger WhatsApp (Async)
             # print(f"Sending alert to {session['emergency_contact']}")
             pass # Enable your wasender here
    elif total_score >= 35:
        status = "WARNING"

    return jsonify({
        "status": status,
        "score": total_score,
        "weapons": weapons_list,
        "audio_val": client_audio_level
    })

if __name__ == '__main__':
    app.run(debug=True)