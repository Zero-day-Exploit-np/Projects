# finger_count
A real-time finger counting app using Mediapipe and OpenCV

===========================================
REAL-TIME FINGER COUNTING APP
===========================================

Author: Bikram Kumar Das  
Project Type: Computer Vision  
Technologies Used: Python, OpenCV, Mediapipe, NumPy  
Run Mode: Webcam-based Real-time App

-------------------------------------------
DESCRIPTION
-------------------------------------------
This is a real-time finger counting application that detects hands using Mediapipe and counts the number of fingers held up using hand landmark analysis. The count is displayed live on the webcam feed using OpenCV.

The app includes logic for both left and right hands and is able to stabilize fluctuating counts using a moving average.

-------------------------------------------
FEATURES
-------------------------------------------
✅ Real-time webcam capture  
✅ Finger counting for both hands  
✅ Robust thumb detection based on hand orientation  
✅ Stabilized count using a smoothing window  
✅ Real-time annotation using OpenCV

-------------------------------------------
REQUIREMENTS
-------------------------------------------
- Python 3.7+
- OpenCV
- Mediapipe
- NumPy

To install the required libraries, run:

    pip install opencv-python mediapipe numpy

-------------------------------------------
HOW TO RUN
-------------------------------------------
1. Make sure your webcam is connected.
2. Run the script:

    python finger_counter.py

3. Show your hand(s) in front of the webcam.
4. The app will display the number of fingers raised.
5. Press 'q' to quit.

-------------------------------------------
NOTES
-------------------------------------------
- The app uses both hand label ("Left"/"Right") and wrist position for robust orientation detection.
- It supports up to 2 hands.
- You can adjust the `smoothing_window` variable to fine-tune how stable the output is.

-------------------------------------------
FILE STRUCTURE
-------------------------------------------
finger_counter.py        # Main script

-------------------------------------------
CREDITS
-------------------------------------------
- Mediapipe by Google
- OpenCV Community

