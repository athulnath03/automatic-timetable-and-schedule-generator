# 🗓️ Automatic Timetable Generator — Full Dashboard

A full-stack intelligent timetable generation system designed to automate school schedule planning using a constraint-aware greedy scheduling algorithm.

The backend is built using Flask, providing RESTful APIs for timetable generation, health monitoring, and data processing. The frontend is developed using React and Vite, offering an interactive dashboard where users can input class details, subjects, teachers, and scheduling constraints, and instantly visualize generated timetables.

The system demonstrates strong software engineering principles including separation of concerns, modular architecture, and efficient algorithmic scheduling logic. The project also supports production-style deployment where the React frontend is served as static assets through the Flask backend.

---

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
SAVED["SavedPage\nSaved timetables"]:::frontend

STATE["React State\n(In-memory)"]:::state
BSTORE[("Browser Storage\n(LocalStorage?)")]:::optional
end

%% =========================================================
%% Shared Backend Internal Decomposition (source modules)
%% =========================================================
subgraph "Backend Modules (Source)"
direction TB
APP_PY["app.py\nTransport layer"]:::backend
SCHED_PY["scheduler.py\nDomain logic"]:::domain
REQS["requirements.txt\nBackend dependencies"]:::artifact
end

%% =========================================================
%% Primary User Flows / Connections
%% =========================================================

U -->|"uses"| DEV_BROWSER
U -->|"uses"| PROD_BROWSER

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

PROD_BROWSER -->|"HTTP GET / (Port 5000)"| STATIC_SERVE
STATIC_SERVE -->|"serves"| DIST
DIST -->|"loads SPA"| APP

PROD_BROWSER -->|"HTTP JSON\nPOST /api/generate"| API_ROUTES_PROD
API_ROUTES_PROD -->|"calls scheduler"| SCHED_PROD
SCHED_PROD -->|"returns timetable"| API_ROUTES_PROD

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

```

---

## 🚀 Getting Started

### 1. Prerequisites

* Python 3.x
* Node.js & npm

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd automatic-timetable-full-dashboard

# Install backend dependencies
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r backend/requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..

```

### 3. Start Development Servers

**Backend:**

```bash
.venv/bin/python backend/app.py

```

*Runs on: http://127.0.0.1:5000*

**Frontend:**

```bash
cd frontend
npm run dev

```

*Runs on: http://localhost:5173/*

---

## 🛠️ Build for Production

To serve the app as a single unit via Flask:

1. **Build Frontend:**
```bash
cd frontend
npm run build

```


2. **Run Flask:**
```bash
cd ..
.venv/bin/python backend/app.py

```



The Flask server will now serve the static files from `frontend/dist` at `http://127.0.0.1:5000`.

---

## 📡 API Endpoints

* `GET /api/health` — Service health check.
* `POST /api/generate` — Generate a timetable.

**Example Request Body:**

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

---

## 📂 Files of Interest

* `backend/app.py`: Flask entry point and static file serving.
* `backend/scheduler.py`: The core Greedy Algorithm logic.
* `frontend/src/`: React source code (components and dashboard logic).

## 🆘 Troubleshooting

* **CORS Errors:** Ensure you are using the Vite server (5173) to access the UI during development; CORS is pre-configured in `app.py`.
* **Backend Not Starting:** Check if port 5000 is already in use by another process (like macOS AirPlay Receiver).
* **Process Management:** Use the provided `run` script to easily manage background processes.


**Would you like me to help you create a specific "Greedy Algorithm" explanation section to show off how the scheduling logic actually handles conflicts?**

```
