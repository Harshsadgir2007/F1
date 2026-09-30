import os
import sys
import json
import datetime
import threading
import requests
import pandas as pd
from flask import Flask, jsonify, request, send_from_directory
import fastf1
import fastf1.ergast

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Initialize cache directory for FastF1
CACHE_DIR = os.path.join(os.path.dirname(__file__), ".fastf1_cache")
os.makedirs(CACHE_DIR, exist_ok=True)
fastf1.Cache.enable_cache(CACHE_DIR)

app = Flask(__name__, static_folder=".", static_url_path="")
ergast = fastf1.ergast.Ergast()

# Cache driver headshots from OpenF1 / Formula 1 CDN
DRIVER_HEADSHOTS = {}

def update_headshots_async():
    def _fetch():
        global DRIVER_HEADSHOTS
        try:
            r = requests.get("https://api.openf1.org/v1/drivers?session_key=latest", timeout=8)
            if r.ok:
                data = r.json()
                for d in data:
                    code = d.get("name_acronym")
                    url = d.get("headshot_url")
                    if code and url:
                        DRIVER_HEADSHOTS[code] = url
                        DRIVER_HEADSHOTS[code.lower()] = url
                    last_name = d.get("last_name", "").lower()
                    if last_name and url:
                        DRIVER_HEADSHOTS[last_name] = url
        except Exception as e:
            print("[FastF1 Server] Headshots fetch background warning:", e)
    
    t = threading.Thread(target=_fetch, daemon=True)
    t.start()

update_headshots_async()

def serialize_val(v):
    if isinstance(v, (list, tuple)):
        return [serialize_val(x) for x in v]
    if isinstance(v, dict):
        return {k: serialize_val(val) for k, val in v.items()}
    if not isinstance(v, (list, tuple, dict)) and pd.isna(v):
        return None
    if isinstance(v, (pd.Timestamp, datetime.date, datetime.datetime)):
        return v.isoformat()
    if isinstance(v, (pd.Timedelta, datetime.time)):
        return str(v)
    return v

def clean_df(df):
    records = df.to_dict(orient="records")
    return [{k: serialize_val(v) for k, v in r.items()} for r in records]

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    if os.path.exists(path):
        return send_from_directory(".", path)
    return jsonify({"error": "File not found"}), 404

@app.route("/api/status")
def api_status():
    return jsonify({
        "status": "online",
        "engine": "FastF1",
        "version": fastf1.__version__,
        "cache_enabled": True
    })

@app.route("/api/headshots")
def api_headshots():
    return jsonify(DRIVER_HEADSHOTS)

@app.route("/api/schedule")
def api_schedule():
    year = request.args.get("year", default=datetime.datetime.now().year, type=int)
    try:
        sched = fastf1.get_event_schedule(year)
        # Exclude pre-season testing (RoundNumber == 0)
        championship_events = sched[sched["RoundNumber"] > 0]
        cleaned = clean_df(championship_events)
        return jsonify({"year": year, "total": len(cleaned), "events": cleaned})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/next-race")
def api_next_race():
    now = datetime.datetime.now(datetime.timezone.utc)
    current_year = now.year
    try:
        sched = fastf1.get_event_schedule(current_year)
        championship_events = sched[sched["RoundNumber"] > 0]
        
        next_event = None
        for _, ev in championship_events.iterrows():
            session_time = ev.get("Session5DateUtc")
            if pd.isna(session_time):
                session_time = ev.get("EventDate")
            if pd.notna(session_time):
                if isinstance(session_time, pd.Timestamp):
                    if session_time.tzinfo is None:
                        session_time = session_time.tz_localize("UTC")
                if session_time > now:
                    next_event = ev
                    break
        
        # If all events in current year completed, check next year's opener
        if next_event is None:
            next_sched = fastf1.get_event_schedule(current_year + 1)
            next_champ = next_sched[next_sched["RoundNumber"] > 0]
            if not next_champ.empty:
                next_event = next_champ.iloc[0]

        if next_event is not None:
            clean_rec = {k: serialize_val(v) for k, v in next_event.to_dict().items()}
            return jsonify({"found": True, "next_race": clean_rec})
        else:
            return jsonify({"found": False, "message": "No upcoming race found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/standings/drivers")
def api_driver_standings():
    season = request.args.get("season", default="current")
    if season == "current":
        season = 2024
    else:
        try:
            season = int(season)
        except ValueError:
            season = 2024

    try:
        res = ergast.get_driver_standings(season=season)
        if hasattr(res, "content") and len(res.content) > 0:
            df = res.content[0]
            records = clean_df(df)
            
            # Enrich records with official headshots from FastF1/OpenF1
            for r in records:
                code = r.get("driverCode")
                f_name = r.get("familyName", "").lower()
                headshot = DRIVER_HEADSHOTS.get(code) or DRIVER_HEADSHOTS.get(f_name)
                r["headshotUrl"] = headshot
                
            return jsonify({"season": season, "total": len(records), "standings": records})
        return jsonify({"season": season, "standings": []})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/standings/constructors")
def api_constructor_standings():
    season = request.args.get("season", default="current")
    if season == "current":
        season = 2024
    else:
        try:
            season = int(season)
        except ValueError:
            season = 2024

    try:
        res = ergast.get_constructor_standings(season=season)
        if hasattr(res, "content") and len(res.content) > 0:
            df = res.content[0]
            records = clean_df(df)
            return jsonify({"season": season, "total": len(records), "standings": records})
        return jsonify({"season": season, "standings": []})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/telemetry")
def api_telemetry():
    """
    Real-time FastF1 speed telemetry trace comparison between two drivers.
    Returns sampled distance (m) and speed (km/h) across their fastest laps.
    """
    year = request.args.get("year", default=2024, type=int)
    gp_round = request.args.get("round", default=1, type=int)
    driver1 = request.args.get("driver1", default="VER").upper()
    driver2 = request.args.get("driver2", default="NOR").upper()

    try:
        session = fastf1.get_session(year, gp_round, "Q")
        session.load(telemetry=True, laps=True, weather=False, messages=False)

        laps1 = session.laps.pick_driver(driver1)
        laps2 = session.laps.pick_driver(driver2)

        if laps1.empty or laps2.empty:
            return jsonify({"error": f"Laps not found for one or both drivers ({driver1}, {driver2})"}), 404

        fastest1 = laps1.pick_fastest()
        fastest2 = laps2.pick_fastest()

        tel1 = fastest1.get_car_data().add_distance()
        tel2 = fastest2.get_car_data().add_distance()

        # Downsample to ~60 points for ultra-fast frontend rendering
        step1 = max(1, len(tel1) // 60)
        step2 = max(1, len(tel2) // 60)

        data1 = tel1.iloc[::step1][["Distance", "Speed", "Throttle", "nGear"]].to_dict(orient="records")
        data2 = tel2.iloc[::step2][["Distance", "Speed", "Throttle", "nGear"]].to_dict(orient="records")

        return jsonify({
            "circuit": session.event["EventName"],
            "year": year,
            "round": gp_round,
            "driver1": {
                "code": driver1,
                "lapTime": str(fastest1["LapTime"]),
                "telemetry": [{k: serialize_val(v) for k, v in row.items()} for row in data1]
            },
            "driver2": {
                "code": driver2,
                "lapTime": str(fastest2["LapTime"]),
                "telemetry": [{k: serialize_val(v) for k, v in row.items()} for row in data2]
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"FastF1 Engine running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
