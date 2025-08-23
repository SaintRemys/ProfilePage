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
CORS(app)
user_cache = {}

def activities_to_dict(acts):
    if not acts:
        return {}
    result = {}
    for i, a in enumerate(acts, start=1):
        image_url = None
        if getattr(a, "assets", None):
            large_image = getattr(a.assets, "large_image", None)
            if large_image:
                if a.name.lower() == "spotify" and large_image.startswith("spotify:"):
                    image_url = f"https://i.scdn.co/image/{large_image.split(':')[1]}"
                else:
                    app_id = getattr(a, "application_id", None)
                    if app_id:
                        image_url = f"https://cdn.discordapp.com/app-assets/{app_id}/{large_image}.png"
            elif getattr(a.assets, "small_image", None):
                app_id = getattr(a, "application_id", None)
                if app_id:
                    image_url = f"https://cdn.discordapp.com/app-assets/{app_id}/{a.assets.small_image}.png"

        # Normalize artist/players info
        state = getattr(a, "state", None)
        details = getattr(a, "details", None)
        if a.name.lower() == "spotify":
            artists = getattr(a, "artist", "") or ""
            if isinstance(artists, list):
                artists = ", ".join(artists)
            state = artists
            details = getattr(a, "title", None)

        if a.type.name.lower() != "custom" or a.name.lower() == "spotify":
            result[f"activity{i}"] = {
                "type": a.type.name.lower() if a.name.lower() != "spotify" else "listening",
                "name": a.name,
                "details": details,
                "state": state,
                "image_url": image_url,
                "start": getattr(a, "start", None).isoformat() if getattr(a, "start", None) else None,
                "end": getattr(a, "end", None).isoformat() if getattr(a, "end", None) else None
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
    return jsonify(user_cache.get(user_id, {"status": "unknown"}))

@app.route("/health")
def health():
    return "ok"

def run_http():
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8080")))

threading.Thread(target=run_http, daemon=True).start()
client.run(os.environ["BOT_TOKEN"])
