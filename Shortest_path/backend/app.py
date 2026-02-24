# from flask import Flask, request, jsonify
# import requests

# app = Flask(__name__)

# API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjZjZDRiMzVmYWU0OTQ0NGE5ZDYxM2JhODlkZTI0MmQzIiwiaCI6Im11cm11cjY0In0="

# @app.route("/route", methods=["POST"])
# def get_route():
#     data = request.json
#     start = data["start"]
#     end = data["end"]

#     url = f"https://api.openrouteservice.org/v2/directions/driving-car"

#     headers = {
#         "Authorization": API_KEY,
#         "Content-Type": "application/json"
#     }

#     body = {
#         "coordinates": [start, end]
#     }

#     response = requests.post(url, json=body, headers=headers)
#     return jsonify(response.json())

# if __name__ == "__main__":
#     app.run(debug=True)