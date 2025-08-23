import os
import threading
from flask import Flask, jsonify
import discord

# Discord intents
intents = discord.Intents.none()
intents.guilds = True
intents.members = True
intents.presences = True

client = discord.Client(intents=intents)
app = Flask(__name__)
user_cache = {}

# Convert activities to dictionary
def activity_to_dict(acts):
    if not acts:
        return None
    for a in acts:
        if a.type.name.lower() != "custom":
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

# Discord event: bot ready
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

# Discord event: presence update
@client.event
async def on_presence_update(before, after):
    user_cache[after.id] = {
        "status": str(after.status),
        "activity": activity_to_dict(after.activities)
    }

# Flask root endpoint
@app.route("/")
def index():
    return "Discord API is running!"

# Flask user status endpoint
@app.route("/status/<int:user_id>")
def get_status(user_id):
    return jsonify(user_cache.get(user_id, {"status": "unknown"}))

# Flask healthcheck
@app.route("/health")
def health():
    return "ok"

# Run Flask in a separate thread
def run_http():
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8080")))

threading.Thread(target=run_http, daemon=True).start()

# Run Discord bot
client.run(os.environ["BOT_TOKEN"])
