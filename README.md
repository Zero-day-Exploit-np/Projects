# 🚀 Shortest Path Finder (API Based)

## 📌 Project Overview

The Shortest Path Finder is a real-world DSA-based web application that calculates the shortest route between two locations using live map data.

This project integrates Graph Theory with real-time routing APIs to demonstrate how shortest path algorithms are used in modern navigation systems like Google Maps.

---

## 🧠 DSA Concepts Used

* Graph Representation
* Dijkstra’s Algorithm
* A* Algorithm (future scope)
* Priority Queue (Min Heap)
* Time Complexity: O(E log V)

---

## 🌍 Features

* Interactive map
* Select source & destination using mouse
* Real-time shortest path
* Distance & route visualization
* API-based live routing

---

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript
* Leaflet.js

### Backend

* Python
* Flask

### API

* OpenRouteService API

### Map Data

* OpenStreetMap

---

## 📂 Project Structure

```
shortest-path-finder
│── backend
│   ├── app.py
│   ├── graph_algo.py
│   ├── requirements.txt
│
│── frontend
│   ├── index.html
│   ├── script.js
│   ├── style.css
│
│── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/shortest-path-finder.git
cd shortest-path-finder
```

### 2️⃣ Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 3️⃣ Add API Key

Open `app.py` and replace:

```
API_KEY = "YOUR_API_KEY"
```

### 4️⃣ Run Backend

```bash
python app.py
```

### 5️⃣ Run Frontend

Open `index.html` in your browser.

---

## ▶️ How to Use

1. Click on map to select start location
2. Click again to select destination
3. Press **Find Route**
4. Shortest path will be displayed

---

## 📸 Output

* Displays the optimal route between two points
* Uses real-world road network

---

## 🔮 Future Enhancements

* Custom Dijkstra implementation on real map data
* Traffic-aware routing
* Voice navigation
* Multiple transport modes
* Mobile responsive UI

---

## 🎯 Learning Outcomes

* Real-world application of Graph Theory
* API integration
* Full-stack development
* Map-based visualization

---

## 📚 References

* OpenStreetMap
* OpenRouteService API
* Leaflet.js Documentation

---

## 👨‍💻 Author

Your Name
BSc Computer Science
DSA Project
