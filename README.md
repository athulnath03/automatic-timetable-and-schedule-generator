
# Automatic Timetable Generator — Full Dashboard

A full-stack intelligent timetable generation system designed to automate school schedule planning using a constraint-aware greedy scheduling algorithm.

The backend is built using Flask, providing RESTful APIs for timetable generation, health monitoring, and data processing. The frontend is developed using React and Vite, offering an interactive dashboard where users can input class details, subjects, teachers, and scheduling constraints, and instantly visualize generated timetables.

The system demonstrates strong software engineering principles including separation of concerns, modular architecture, and efficient algorithmic scheduling logic. The project also supports production-style deployment where the React frontend is served as static assets through the Flask backend.


## 🏗️ System Architecture

The following diagram outlines the dual-mode operation of the system, illustrating how the **Vite Dev Server** interacts with the **Flask API** during development, and how they merge into a single origin for production.

```mermaid
flowchart TD

%% =========================================================
%% External Actor
%% =========================================================
U["User (Teacher/Admin)\nBrowser"]:::external

%% =========================================================
%% Development Runtime (2-process)
%% =========================================================
subgraph "Development Mode (two origins)"
direction TB

DEV_BROWSER["Browser Session\n(Dev)"]:::external

subgraph "Frontend Dev Server"
direction TB
VITE["Vite Dev Server\nServes React SPA\nlocalhost:5173"]:::runtime
SPA_DEV["React SPA (Dev)\nUI + Client State"]:::frontend
end

subgraph "Backend API Server"
direction TB
FLASK_DEV["Flask API Server (Dev)\nCORS enabled\n127.0.0.1:5000"]:::runtime
API_ROUTES_DEV["API Routes\nGET /api/health\nPOST /api/generate"]:::api
SCHED_DEV["Timetable Generator\nGreedy Scheduler"]:::domain
end

DEV_NOTE["Dev Routing\n5173 → 5000 (CORS)\nJSON over HTTP"]:::note
end

%% =========================================================
%% Production Runtime (1-process, same origin)
%% =========================================================
subgraph "Production Mode (single origin)"
direction TB

PROD_BROWSER["Browser Session\n(Prod)"]:::external

subgraph "Flask Server (Serves SPA + API)"
direction TB
FLASK_PROD["Flask App Server (Prod)\nSingle Origin :5000"]:::runtime
STATIC_SERVE["Static Hosting\nServes built assets"]:::artifact
DIST["Built Frontend Assets\n(frontend/dist)"]:::artifact
API_ROUTES_PROD["API Routes\nGET /api/health\nPOST /api/generate"]:::api
SCHED_PROD["Timetable Generator\nGreedy Scheduler"]:::domain
end

PROD_NOTE["Prod Routing\n/: serves SPA\n/api/*: serves JSON\nSame origin"]:::note
end

%% =========================================================
%% Frontend Component / Page Flow (logical UI mapping)
%% =========================================================
subgraph "Frontend UI Composition (React)"
direction TB
APP["App Layout + Navigation"]:::frontend
TOPBAR["Topbar"]:::frontend
SIDEBAR["Sidebar"]:::frontend
HOME["DashboardHome"]:::frontend

GEN["GeneratePage\nCollect inputs:\n- days, periods\n- classes\n- subjects"]:::frontend
VIEW["TimetableView\nRender generated timetable"]:::frontend
SAVED["SavedPage\nSaved timetables (client-side)"]:::frontend

STATE["React State\n(In-memory)"]:::state
BSTORE[("Browser Storage\n(LocalStorage?)")]:::optional
end

%% =========================================================
%% Shared Backend Internal Decomposition (source modules)
%% =========================================================
subgraph "Backend Modules (Source)"
direction TB
APP_PY["app.py\nTransport layer:\n- Routes\n- CORS (dev)\n- Static serve (prod)"]:::backend
SCHED_PY["scheduler.py\nDomain logic:\nGreedy timetable generator"]:::domain
REQS["requirements.txt\nBackend dependencies"]:::artifact
end

%% =========================================================
%% Primary User Flows / Connections
%% =========================================================

U -->|"uses"| DEV_BROWSER
U -->|"uses"| PROD_BROWSER

%% Dev: serve SPA + call API
DEV_BROWSER -->|"HTTP GET / (SPA)\n:5173"| VITE
VITE -->|"serves HTML/JS/CSS"| SPA_DEV

SPA_DEV -->|"renders"| APP
APP -->|"layout"| TOPBAR
APP -->|"layout"| SIDEBAR
APP -->|"routes"| HOME
APP -->|"routes"| GEN
APP -->|"routes"| SAVED
GEN -->|"updates"| STATE
STATE -->|"drives UI"| VIEW

GEN -->|"fetch(JSON)\nPOST /api/generate\n5173 → 5000"| API_ROUTES_DEV
API_ROUTES_DEV -->|"calls generate()"| SCHED_DEV
SCHED_DEV -->|"returns timetable"| API_ROUTES_DEV
API_ROUTES_DEV -->|"HTTP 200 JSON"| GEN
GEN -->|"stores result"| STATE

DEV_BROWSER -->|"HTTP GET\n/api/health"| API_ROUTES_DEV
DEV_NOTE --- VITE
DEV_NOTE --- FLASK_DEV

%% Dev backend wiring
FLASK_DEV -->|"implemented in"| APP_PY
API_ROUTES_DEV -->|"defined in"| APP_PY
SCHED_DEV -->|"implemented in"| SCHED_PY
APP_PY -->|"imports/calls"| SCHED_PY
APP_PY -->|"uses deps"| REQS

%% Prod wiring
PROD_BROWSER -->|"HTTP GET / (Port 5000)"| STATIC_SERVE
STATIC_SERVE -->|"serves"| DIST
DIST -->|"loads SPA"| APP

PROD_BROWSER -->|"HTTP JSON\nPOST /api/generate"| API_ROUTES_PROD
API_ROUTES_PROD -->|"calls scheduler"| SCHED_PROD
SCHED_PROD -->|"returns timetable"| API_ROUTES_PROD

PROD_BROWSER -->|"HTTP GET\n/api/health"| API_ROUTES_PROD
PROD_NOTE --- FLASK_PROD
FLASK_PROD -->|"serves static from"| DIST
FLASK_PROD -->|"implemented in"| APP_PY

SAVED -->|"read/write"| BSTORE

%% =========================================================
%% Styles
%% =========================================================
classDef external fill:#e5e7eb,stroke:#6b7280,color:#111827,stroke-width:1px
classDef runtime fill:#fff7ed,stroke:#c2410c,color:#111827,stroke-width:2px
classDef frontend fill:#dbeafe,stroke:#1d4ed8,color:#0b1220,stroke-width:1px
classDef backend fill:#dcfce7,stroke:#15803d,color:#0b1220,stroke-width:1px
classDef api fill:#bbf7d0,stroke:#166534,color:#0b1220,stroke-width:1px
classDef domain fill:#a7f3d0,stroke:#047857,color:#0b1220,stroke-width:1px
classDef artifact fill:#f3e8ff,stroke:#7e22ce,color:#0b1220,stroke-width:1px
classDef state fill:#cffafe,stroke:#0891b2,color:#0b1220,stroke-width:1px
classDef optional fill:#ffffff,stroke:#6b7280,color:#111827,stroke-width:1px,stroke-dasharray: 5 5
classDef note fill:#fef9c3,stroke:#a16207,color:#111827,stroke-width:1px,stroke-dasharray: 3 3
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
