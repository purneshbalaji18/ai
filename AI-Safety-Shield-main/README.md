# 🛡️ AI Safety Shield

A real-time, multimodal surveillance system designed to enhance safety by detecting threats using Computer Vision and Audio Analysis. This system utilizes "Consensus Logic" to minimize false alarms by requiring multiple threat indicators (e.g., a weapon visible + a scream detected) to trigger a danger alert.

## ✨ Key Features

* **🔪 Weapon Detection**: Utilizes the YOLOv8 model to detect knives, scissors, and baseball bats in real-time.
* **🎤 Audio Distress Detection**: Listens for sustained, high-volume sounds (screams/shouts) using a background thread to prevent video lag.
* **🙌 Pose Analysis**: Uses MediaPipe to detect "Hands Up" (surrender) gestures that may indicate distress.
* **📏 Proximity Check**: Calculates the physical distance between detected individuals to identify aggressive crowding.
* **🧠 Intelligent Consensus Logic**:
    * **WARNING (Yellow)**: Triggered by a single feature (e.g., just a loud noise).
    * **DANGER DETECTED (Red)**: Triggered by two or more features (e.g., Weapon + Scream, or Weapon + Surrender Pose).

## 🛠️ Prerequisites

* Python 3.8 or newer
* A Webcam
* A Microphone

## 📦 Installation

1.  **Clone or Download the Project**: Ensure all project files are in the same directory.

2.  **Install Dependencies**: Run the following command in your terminal to install the required libraries:
    ```bash
    pip install opencv-python mediapipe ultralytics sounddevice numpy torch
    ```

3.  **Verify Hardware**:
    * Ensure your webcam is connected.
    * The system attempts to automatically detect your microphone. If audio fails, you may need to update the device index in `audio_module.py`.

## 🚀 How to Run

1.  Open your terminal or command prompt in the project folder.
2.  Run the main controller script:
    ```bash
    python main_surveillance.py
    ```
3.  **Controls**:
    * Press **`q`** in the video window to quit.
    * Press **`Ctrl+C`** in the terminal to force quit if necessary.

## 📂 Project Structure

* **`main_surveillance.py`**: The central controller that integrates visual and audio data, calculates the consensus score, and displays the status on the video feed.
* **`weapon_detector.py`**: Loads the YOLOv8 model to perform object detection for weapons.
* **`audio_thread.py`**: Runs audio analysis in a separate, non-blocking background thread to ensure the video feed remains smooth.
* **`audio_module.py`**: The low-level driver that handles recording audio from the microphone.
* **`proximity_logic.py`**: Contains the logic to calculate distances between detected people to check for proximity threats.

## ⚙️ Configuration

You can adjust sensitivity and performance settings in `main_surveillance.py`:

* **`ALERT_THRESHOLD` (Default: 60)**: The total score required to trigger a RED danger alert.
* **`SKIP_RATE` (Default: 5)**: Determines how often the heavy AI models run (e.g., every 5th frame). Increase this number if you experience video lag.
* **`TARGET_WIDTH` / `TARGET_HEIGHT`**: Adjust the resolution (Default: 480x360) to balance between detection accuracy and processing speed.

## ⚠️ Troubleshooting

* **Video is lagging**: The system is optimized for CPU usage by resizing frames to 480x360. Ensure your environment is well-lit, as low light can cause the camera's shutter speed to drop, increasing lag.
* **Audio not working**:
    1.  Check the terminal output for microphone errors.
    2.  Open `audio_module.py` and verify the `device` index matches your system's microphone ID.
    3.  You can use a script like `find_mic.py` (if available) to list your audio devices and find the correct index.
* **False Alarms**: The system uses a temporal filter for audio, requiring a "sustained" noise (approx. 1 second) to register as a scream. Short noises like claps should be ignored.

---
*Built for the purpose of enhancing safety through AI.*
