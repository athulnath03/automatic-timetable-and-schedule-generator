
# Automatic Timetable — Full Dashboard

A small full-stack app that generates simple school timetables (backend in Flask) and a React + Vite dashboard (frontend).

## What this repo contains
- `backend/` — Flask API and a simple scheduler (`app.py`, `scheduler.py`).
- `frontend/` — React + Vite UI (source in `frontend/src`).

## Prerequisites
- Node.js (v16+ recommended) and npm
- Python 3.10+ (project venv uses Python 3.10.12 in this workspace)
- Optional: `curl` for quick endpoint checks

## Quick start (development)
1. From project root, create/activate a Python venv (if not already present):

```bash
# from project root
python3 -m venv .venv
source .venv/bin/activate
```

2. Install backend requirements:

```bash
.venv/bin/python -m pip install -r backend/requirements.txt
```

3. Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

4. Start the backend (development Flask server):

```bash
# run from project root (uses the workspace .venv)
.venv/bin/python backend/app.py
```

The backend runs by default on: http://127.0.0.1:5000
Health check: http://127.0.0.1:5000/api/health

5. Start the frontend (Vite dev server):

```bash
cd frontend
npm run dev
```

The frontend dev server runs on: http://localhost:5173/

Note: In development you typically run both the Flask backend and the Vite dev server. The frontend will call the backend API (CORS is enabled in `backend/app.py`).

## Quick start (run as I did during setup)
I started both servers in background (so they persist across terminal sessions) and logged output:

```bash
# start backend (logs -> backend.log)
cd "/home/user/Downloads/Mini project/automatic-timetable-full-dashboard"
nohup .venv/bin/python backend/app.py > backend.log 2>&1 &

# start frontend dev server (logs -> vite-dev.log)
cd frontend
nohup npm run dev > ../vite-dev.log 2>&1 &
```

Check logs if something doesn't respond:
- `backend.log`
- `vite-dev.log`

## Build for production and serve via Flask
1. Build frontend:

```bash
cd frontend
npm run build
```

This outputs static files to `frontend/dist`.

2. Serve the built frontend with the Flask app
The `backend/app.py` is already configured to serve static files from `../frontend/dist`. From the project root you can run:

```bash
.venv/bin/python backend/app.py
```

For a production-grade Python server, use `gunicorn` (example):

```bash
# from project root
# install gunicorn into your venv first: .venv/bin/python -m pip install gunicorn
cd backend
../../.venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

Adjust paths as needed depending on your shell cwd and venv location.

## API endpoints
- `GET /api/health` — quick health check
- `POST /api/generate` — send a JSON body with classes/subjects to generate a timetable. `backend/scheduler.py` contains the generator logic.

Example request body for `/api/generate` (JSON):

```json
{
   "days": ["Mon","Tue","Wed","Thu","Fri"],
   "periods_per_day": 6,
   "classes": ["Class A", "Class B"],
   "subjects": [
      {"name":"Math","teacher":"T1","periods_per_week":5},
      {"name":"English","teacher":"T2","periods_per_week":4}
   ]
}
```

## Files of interest
- `backend/app.py` — Flask app + static serving
- `backend/scheduler.py` — simple greedy timetable generator
- `frontend/src/` — React app source (entry `src/main.jsx`, components in `src/components`)

## Troubleshooting
- If the backend is not responding:
   - Ensure the venv is activated or use `.venv/bin/python` explicitly.
   - Check `backend.log` for stack traces.
- If the frontend dev server isn't reachable:
   - Ensure `npm install` completed successfully in `frontend/`.
   - Check `vite-dev.log` or console output for errors.
- If you get CORS errors during development: CORS is enabled in `backend/app.py`, but ensure your frontend is requesting the correct backend URL (dev: port 5173 front -> 5000 back).

## Stopping the servers
Find the process and kill it (example):

```bash
pgrep -af app.py
kill <pid>

pgrep -af vite
kill <pid>
```

Or use `pkill` with care.

## Next steps / Suggestions
- Add a `Makefile` or `scripts/start.sh` to orchestrate both servers.
- Add a small `README` section that documents the `generate` request body format and a couple of examples.
- Add tests for the `scheduler.py` algorithm and a simple integration test for the `/api/generate` endpoint.

---

Created and verified locally. If you'd like, I can also add a `Makefile` or `scripts/` to simplify the dev commands.




#################################################################

#!/usr/bin/env bash
# Simple runner to start/stop frontend (Vite) and backend (Flask) from project root.
set -u

ROOT="$(cd "$(dirname "$0")" && pwd)"
VENV="$ROOT/.venv"
LOG_BACK="$ROOT/backend.log"
LOG_FRONT="$ROOT/vite-dev.log"
PID_FILE="$ROOT/.run_pids"

usage() {
  cat <<EOF
Usage: $0 {app|stop|status}
  app    Start backend and frontend (tails logs)
  stop   Stop processes started by this script
  status Show status and listening ports
EOF
  exit 1
}

start() {
  if [ ! -x "$VENV/bin/python" ]; then
    echo "ERROR: venv python not found at $VENV/bin/python. Create/activate venv first."
    exit 1
  fi

  # ensure old pid file removed
  rm -f "$PID_FILE"

  echo "Starting backend..."
  (cd "$ROOT" && nohup "$VENV/bin/python" backend/app.py > "$LOG_BACK" 2>&1 &)
  echo $! >> "$PID_FILE"
  echo "backend pid: $!"

  echo "Starting frontend..."
  (cd "$ROOT/frontend" && nohup npm run dev > "$ROOT/$LOG_FRONT" 2>&1 &)
  echo $! >> "$PID_FILE"
  echo "frontend pid: $!"

  echo "PIDs saved to $PID_FILE"
  echo "Tailing logs (Ctrl-C to detach, processes continue in background)..."
  tail -n +1 -f "$LOG_BACK" "$LOG_FRONT"
}

stop() {
  if [ ! -f "$PID_FILE" ]; then
    echo "No PID file ($PID_FILE). Nothing to stop."
    exit 0
  fi
  echo "Stopping PIDs from $PID_FILE..."
  while read -r pid; do
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" && echo "killed $pid"
    else
      echo "pid $pid not running"
    fi
  done < "$PID_FILE"
  rm -f "$PID_FILE"
  echo "Stopped."
}

status() {
  echo "Listening TCP ports (5000 backend, 5173 frontend):"
  ss -ltnp 2>/dev/null | egrep ':5000|:5173' || echo "no listener found on 5000/5173"
  if [ -f "$PID_FILE" ]; then
    echo
    echo "PIDs recorded in $PID_FILE:"
    cat "$PID_FILE"
  fi
}

if [ $# -ne 1 ]; then
  usage
fi

case "$1" in
  app) start ;;
  stop) stop ;;
  status) status ;;
  *) usage ;;
esac

Make it executable:
cd "/home/user/Downloads/Mini project/automatic-timetable-full-dashboard"
chmod +x run


sudo ln -s "$(pwd)/run" /usr/local/bin/run
# then you can run:
run app