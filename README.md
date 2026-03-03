
# Automatic Timetable — Full Dashboard

A full-stack intelligent timetable generation system designed to automate school schedule planning using a constraint-aware greedy scheduling algorithm.

The backend is built using Flask, providing RESTful APIs for timetable generation, health monitoring, and data processing. The frontend is developed using React and Vite, offering an interactive dashboard where users can input class details, subjects, teachers, and scheduling constraints, and instantly visualize generated timetables.

The system demonstrates strong software engineering principles including separation of concerns, modular architecture, and efficient algorithmic scheduling logic. The project also supports production-style deployment where the React frontend is served as static assets through the Flask backend.

Future improvements may include advanced conflict detection, optimization-based scheduling algorithms, database persistence, and multi-user authentication support.


# System Architecture
```mermaid
## 🏗 System Architecture

```mermaid
flowchart TD

U["User (Teacher/Admin)"]:::external

subgraph "Development Mode"
DEV_BROWSER["Browser (Dev)"]:::external

subgraph "Frontend Dev Server"
VITE["Vite Dev Server"]:::runtime
SPA_DEV["React SPA"]:::frontend
end

subgraph "Backend API Server"
FLASK_DEV["Flask API"]:::runtime
API_ROUTES_DEV["API Routes"]:::api
SCHED_DEV["Greedy Scheduler"]:::domain
end
end

subgraph "Production Mode"
PROD_BROWSER["Browser (Prod)"]:::external

subgraph "Flask Production Server"
FLASK_PROD["Flask App Server"]:::runtime
STATIC_SERVE["Serve Static Assets"]:::artifact
DIST["Frontend Build Dist"]:::artifact
end
end

U --> DEV_BROWSER
U --> PROD_BROWSER

DEV_BROWSER --> VITE
VITE --> SPA_DEV
SPA_DEV --> API_ROUTES_DEV
API_ROUTES_DEV --> SCHED_DEV
SCHED_DEV --> API_ROUTES_DEV

PROD_BROWSER --> STATIC_SERVE
STATIC_SERVE --> DIST

classDef external fill:#e5e7eb,stroke:#6b7280
classDef runtime fill:#fff7ed,stroke:#c2410c
classDef frontend fill:#dbeafe,stroke:#1d4ed8
classDef backend fill:#dcfce7,stroke:#15803d
classDef api fill:#bbf7d0,stroke:#166534
classDef domain fill:#a7f3d0,stroke:#047857
classDef artifact fill:#f3e8ff,stroke:#7e22ce
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
