import os
import threading
from flask import Flask, jsonify
from flask_cors import CORS
import discord

intents = discord.Intents.none()
intents.guilds = True
intents.members = True
intents.presences = True

client = discord.Client(intents=intents)
app = Flask(__name__)
CORS(app)  # Allow all origins
user_cache = {}

def activity_to_dict(acts):
    if not acts:
        return None
    for a in acts:
        if a.name.lower() == "spotify":
            artists = getattr(a, "artist", "")
            if isinstance(artists, str):
                artists = artists.replace(";", ",")
            return {
                "type": "listening",
                "name": a.name,
                "details": getattr(a, "title", None),
                "state": artists,
                "image_url": f"https://i.scdn.co/image/{a.assets.large_image[8:]}" 
                              if getattr(a, "assets", None) and getattr(a.assets, "large_image", None) else None
            }
        elif a.type.name.lower() != "custom":
            return {
                "type": a.type.name.lower(),
                "name": a.name,
                "details": getattr(a, "details", None),
                "state": getattr(a, "state", None)
            }
    a = acts[0]
    return {
        "type": a.type.name.lower(),
        "name": a.name,
        "details": getattr(a, "details", None),
        "state": getattr(a, "state", None)
    }

@client.event
async def on_ready():
    for g in client.guilds:
        try:
            await g.chunk(cache=True)
        except Exception:
            pass
        for m in g.members:
            user_cache[m.id] = {
                "status": str(m.status),
                "activity": activity_to_dict(m.activities)
            }

@client.event
async def on_presence_update(before, after):
    user_cache[after.id] = {
        "status": str(after.status),
        "activity": activity_to_dict(after.activities)
    }

@app.route("/")
def index():
    return "Discord API is running!"

@app.route("/status/<int:user_id>")
def get_status(user_id):
    return jsonify(user_cache.get(user_id, {"status": "unknown"}))

@app.route("/health")
def health():
    return "ok"

def run_http():
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8080")))

threading.Thread(target=run_http, daemon=True).start()
client.run(os.environ["BOT_TOKEN"])
