This backend is a small proxy that forwards requests from the frontend to OpenRouteService (ORS).

Setup

1. Create a virtual environment and install dependencies:

```bash
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

2. Create a `.env` (or set environment variable) with your ORS API key:

```
ORS_KEY=your_openrouteservice_api_key_here
```

On Windows Powershell:

```powershell
$env:ORS_KEY = "your_openrouteservice_api_key_here"
python app.py
```

3. Run the backend:

```bash
python app.py
```

Frontend

- The frontend (`Shortest_path/frontend/index.html`) calls the proxy at `http://localhost:5000/ors/...` so the API key is never exposed in the browser.

Notes

- This proxy simply forwards requests to ORS and adds the Authorization header server-side.
- For production, secure the backend and restrict usage of the API key (IP restrictions, rate-limiting, etc.).
