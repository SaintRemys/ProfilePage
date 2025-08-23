import os
import threading
from datetime import datetime, timezone
from flask import Flask, jsonify
from flask_cors import CORS
import discord

intents = discord.Intents.none()
intents.guilds = True
intents.members = True
intents.presences = True

client = discord.Client(intents=intents)
app = Flask(__name__)
CORS(app)
user_cache = {}

def activities_to_dict(acts):
    if not acts:
        return {}
    result = {}
    for i, a in enumerate(acts, start=1):
        image_url = None
        if a.name.lower() == "spotify":
            image_url = getattr(a, "album_cover_url", None)
            if not image_url and getattr(a, "assets", None):
                large_image = getattr(a.assets, "large_image", None)
                if large_image and large_image.startswith("spotify:"):
                    image_url = f"https://i.scdn.co/image/{large_image.split(':')[1]}"
            artists = getattr(a, "artist", "") or ""
            if isinstance(artists, list):
                artists = ", ".join(artists)
            elif isinstance(artists, str):
                artists = artists.replace(";", ",")
            state = artists
            details = getattr(a, "title", None)
        else:
            state = getattr(a, "state", None)
            details = getattr(a, "details", None)
            assets = getattr(a, "assets", None)
            app_id = getattr(a, "application_id", None)
            if assets and app_id:
                if getattr(assets, "large_image", None):
                    image_url = f"https://cdn.discordapp.com/app-assets/{app_id}/{assets.large_image}.png"
                elif getattr(assets, "small_image", None):
                    image_url = f"https://cdn.discordapp.com/app-assets/{app_id}/{assets.small_image}.png"

        start_time = getattr(a, "start", None)
        duration_seconds = getattr(a, "duration_seconds", None)
        if start_time and not duration_seconds:
            now = datetime.now(timezone.utc)
            duration_seconds = int((now - start_time).total_seconds())

        if a.type.name.lower() != "custom" or a.name.lower() == "spotify":
            result[f"activity{i}"] = {
                "type": a.type.name.lower() if a.name.lower() != "spotify" else "listening",
                "name": a.name,
                "details": details,
                "state": state,
                "image_url": image_url,
                "start": start_time.isoformat() if start_time else None,
                "end": getattr(a, "end", None).isoformat() if getattr(a, "end", None) else None,
                "duration_seconds": duration_seconds
            }
    return result

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
                **activities_to_dict(m.activities)
            }

@client.event
async def on_presence_update(before, after):
    user_cache[after.id] = {
        "status": str(after.status),
        **activities_to_dict(after.activities)
    }

@app.route("/")
def index():
    return "Discord API is running!"

@app.route("/status/<int:user_id>")
def get_status(user_id):
    user = user_cache.get(user_id, {"status": "unknown"})
    if user.get("status") != "unknown":
        now = datetime.now(timezone.utc)
        for key in user.keys():
            if key.startswith("activity"):
                activity = user[key]
                start = activity.get("start")
                if start:
                    start_dt = datetime.fromisoformat(start)
                    activity["duration_seconds"] = int((now - start_dt).total_seconds())
    return jsonify(user)

@app.route("/health")
def health():
    return "ok"

def run_http():
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8080")))

threading.Thread(target=run_http, daemon=True).start()
client.run(os.environ["BOT_TOKEN"])