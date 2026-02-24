import cv2
import mediapipe as mp
import numpy as np 


def count_fingers(hand_landmarks, hand_label):
    fingers = []
    tip_ids = [4, 8, 12, 16, 20]  # Thumb, Index, Middle, Ring, Pinky

    # Improved Thumb Detection
    thumb_tip_x = hand_landmarks.landmark[tip_ids[0]].x
    thumb_ip_x = hand_landmarks.landmark[3].x  # More stable reference point

    if hand_label == "Left":
        fingers.append(thumb_tip_x > thumb_ip_x)  # Left hand: thumb extends right
    else:
        fingers.append(thumb_tip_x < thumb_ip_x)  # Right hand: thumb extends left

    # Improved Finger Counting with Wrist Orientation
    wrist_y = hand_landmarks.landmark[0].y
    for i in range(1, 5):
        tip_y = hand_landmarks.landmark[tip_ids[i]].y
        pip_y = hand_landmarks.landmark[tip_ids[i] - 2].y  # PIP joint

        # Adjust logic if wrist is positioned above fingers
        if wrist_y < tip_y:  # Hand is flipped
            fingers.append(tip_y > pip_y)  # Reverse condition
        else:
            fingers.append(tip_y < pip_y)  # Normal condition
    
    return fingers.count(True)

def main():
    mp_hands = mp.solutions.hands
    mp_drawing = mp.solutions.drawing_utils
    cap = cv2.VideoCapture(0)
    
    previous_counts = []
    smoothing_window = 5  # Stabilizes the count

    with mp_hands.Hands(min_detection_confidence=0.75, min_tracking_confidence=0.75, max_num_hands=2) as hands:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(rgb_frame)

            fingers_count = 0
            if results.multi_hand_landmarks:
                for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
                    hand_label = results.multi_handedness[idx].classification[0].label  # Get "Left" or "Right"
                    mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                    fingers_count += count_fingers(hand_landmarks, hand_label)  # Count fingers per hand

            # Apply smoothing
            previous_counts.append(fingers_count)
            if len(previous_counts) > smoothing_window:
                previous_counts.pop(0)
            smoothed_count = round(sum(previous_counts) / len(previous_counts))

            cv2.putText(frame, f'Fingers: {smoothed_count}', (50, 50), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

            cv2.imshow('Finger Counter', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
