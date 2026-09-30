# 🏎️ F1 Hub — Official Live Telemetry & Championship Dashboard

A high-performance Formula 1 broadcast hub and telemetry analytics suite. Powered by real-time FIA data via **FastF1** and the **Jolpica/Ergast API**, featuring bespoke design systems inspired by Lando Norris (LN4) and Charles Leclerc (CL16).

---

## 🌟 Key Features

- **🔴 Live Standings & Championships**: Real-time Drivers and Constructors World Championship points, positions, nationality, and team details.
- **📅 Official 24-Race Grand Prix Calendar**: Interactive race schedule filterable into Upcoming, Completed, and Sprint weekends with local countdowns.
- **⚡ FastF1 Telemetry Engine & Driver Comparator**: Compare driver speed traces, throttle curves, gears, and sector delta times over synchronized circuit distances.
- **🚦 Reaction Time Training**: Professional 5-red-lights starting gantry simulator with millisecond-accuracy reaction tracking and false-start detection.
- **🎬 Bespoke Preloaders & Design Systems**:
  - **Charles Leclerc (CL16)** 3D twin-block tumbling cubes with dynamic gold/scarlet lighting and custom editorial typography (`Coign Pro` & `Leclerc Sans`).
  - **Lando Norris (LN4)** Volt-yellow speed bar and neon accents with athletic headlines (`Brier Bold` & `Mona Sans Variable`).
  - Standalone showcase available at `loaders.html`.

---

## 📂 Repository Structure

```text
├── assets/
│   ├── fonts/                  # Custom typography (Brier, Mona Sans, Coign Pro, Leclerc Sans)
│   ├── images/                 # Team insignias, driver portraits, and app icons
│   └── videos/                 # High-definition video backdrops
├── css/
│   └── styles.css              # Core styling, responsive layouts, glassmorphism & animations
├── js/
│   ├── script.js               # Main application controller, FastF1 client & API bindings
│   └── script2.js              # Dedicated timer & parallax script
├── index.html                  # Main application entry point
├── loaders.html                # Interactive showroom for driver preloaders & loaders
├── server.py                   # Python Flask backend bridging FastF1 caching & telemetry APIs
├── requirements.txt            # Python dependencies
└── .gitignore                  # Git exclusions for virtual environments & telemetry cache
```

---

## 🚀 Quick Start

### 1. Static Web View (Frontend Only)
You can directly open `index.html` in any modern web browser or run with any static server:
```bash
# Using Python built-in server
python -m http.server 3000

# Or using Node.js npx serve
npx serve .
```

### 2. Full Live FastF1 Telemetry Backend
For synchronized live session telemetry, lap traces, and headshot caching:

1. **Create and activate a virtual environment**:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Launch the FastF1 backend server**:
   ```bash
   python server.py
   ```
   Open `http://localhost:8080` in your browser.

---

## 🛠️ Tech Stack

- **Frontend**: Semantic HTML5, Vanilla Modern CSS3 (Grid, Flexbox, Custom Properties, Glassmorphism, 3D Transforms), Vanilla ES6+ JavaScript.
- **Backend / Telemetry**: Python 3.10+, Flask, FastF1, Pandas, Requests.
- **Data APIs**: FastF1 FIA Timing Feed, OpenF1 CDN, Jolpica / Ergast F1 API.

---

## 📄 Disclaimer
This project is an independent non-commercial fan application built for educational and telemetry visualization purposes. F1, FORMULA 1, GRAND PRIX, and related marks are trademarks of Formula One Licensing B.V.
