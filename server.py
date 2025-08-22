import requests
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/profile")
def get_profile():
    url = "https://guns.lol/saintremy"
    headers = {"User-Agent": "Mozilla/5.0"}
    r = requests.get(url, headers=headers)
    html = r.text
    return jsonify({"html": html})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
