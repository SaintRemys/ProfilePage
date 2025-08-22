import requests
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow cross-origin requests

@app.route("/")
def home():
    return "Render proxy running! Visit /profile to get Guns.lol HTML."

@app.route("/profile")
def get_profile():
    url = "https://guns.lol/saintremy"
    headers = {"User-Agent": "Mozilla/5.0"}  # prevent blocks
    try:
        r = requests.get(url, headers=headers, timeout=10)
        r.raise_for_status()
        html = r.text
        return jsonify({"html": html})
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
