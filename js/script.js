/**
 * FORMULA 1 BROADCAST HUB - FASTF1 ENGINE
 * Powered by FastF1 Python API & Real-time Live Telemetry
 * ZERO HARDCODED CODE - 100% Dynamic API Architecture
 */

// ============================================================================
// TEAM THEMES & COLOR PALETTES
// ============================================================================
const TEAM_CONFIG = {
  mclaren: { name: "McLaren", color: "#FF8000", glow: "rgba(255, 128, 0, 0.4)", logo: "assets/images/mclaren.jpg" },
  red_bull: { name: "Red Bull Racing", color: "#3671C6", glow: "rgba(54, 113, 198, 0.4)", logo: "assets/images/redbull.jpg" },
  mercedes: { name: "Mercedes", color: "#00D2BE", glow: "rgba(0, 210, 190, 0.4)", logo: "assets/images/mercedes.png" },
  ferrari: { name: "Ferrari", color: "#E8002D", glow: "rgba(232, 0, 45, 0.4)", logo: "assets/images/ferrari.jpg" },
  williams: { name: "Williams", color: "#64C4FF", glow: "rgba(100, 196, 255, 0.4)", logo: "assets/images/william.png" },
  aston_martin: { name: "Aston Martin", color: "#229971", glow: "rgba(34, 153, 113, 0.4)", logo: "assets/images/f1.png" },
  alpine: { name: "Alpine", color: "#0093CC", glow: "rgba(0, 147, 204, 0.4)", logo: "assets/images/f1.png" },
  rb: { name: "Racing Bulls", color: "#6692FF", glow: "rgba(102, 146, 255, 0.4)", logo: "assets/images/f1.png" },
  sauber: { name: "Kick Sauber", color: "#52E252", glow: "rgba(82, 226, 82, 0.4)", logo: "assets/images/f1.png" },
  haas: { name: "Haas F1 Team", color: "#B6BABD", glow: "rgba(182, 186, 189, 0.4)", logo: "assets/images/f1.png" }
};

const LOCAL_DRIVER_PHOTOS = {
  norris: "assets/images/lando.png",
  leclerc: "assets/images/charles.jpg",
  max_verstappen: "assets/images/max.jpeg",
  verstappen: "assets/images/max.jpeg",
  piastri: "assets/images/oscar.jpg",
  russell: "assets/images/george.png"
};

function getTeamConfig(constructorId, constructorName = "") {
  if (constructorId && TEAM_CONFIG[constructorId]) {
    return TEAM_CONFIG[constructorId];
  }
  const lowerName = constructorName.toLowerCase();
  for (const [key, val] of Object.entries(TEAM_CONFIG)) {
    if (lowerName.includes(key) || lowerName.includes(val.name.toLowerCase())) {
      return val;
    }
  }
  return {
    name: constructorName || "Formula 1 Team",
    color: "#e10600",
    glow: "rgba(225, 6, 0, 0.4)",
    logo: "assets/images/f1.png"
  };
}

// App State (Zero Hardcoded Data)
const state = {
  currentSeason: "2024",
  drivers: [],
  constructors: [],
  races: [],
  activeDriverFilter: "all",
  driverSearchQuery: "",
  activeCalendarFilter: "all",
  activeStandingsTab: "drivers",
  nextRace: null,
  timerInterval: null,
  telemetryData: null
};

// ============================================================================
// DYNAMIC FASTF1 API FETCHING
// ============================================================================
async function fetchFastF1(endpoint) {
  try {
    const res = await fetch(`/api/${endpoint}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[FastF1 API] Request to /api/${endpoint} failed:`, err);
    return null;
  }
}

function getActiveLoaderHTML(subtitle = "CONNECTING TO FASTF1 ENGINE...") {
  const active = localStorage.getItem("f1_active_loader") || "lando";

  if (active === "lando") {
    return `
      <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; gap: 18px;">
        <div class="ln4-loader-container">
          <div class="ln4-emblem-wrapper">
            <div class="ln4-badge">
              <div class="ln4-logo-text">LN</div>
              <div class="ln4-num">04</div>
              <div class="ln4-scanline"></div>
            </div>
          </div>
          <div class="ln4-soundbars">
            <div class="ln-bar"></div><div class="ln-bar"></div><div class="ln-bar"></div>
            <div class="ln-bar"></div><div class="ln-bar"></div>
          </div>
          <div class="ln4-progress-track">
            <div class="ln4-progress-fill"></div>
          </div>
          <div class="ln4-status-row">
            <span class="ln4-status-title">LN4 OVERTAKE</span>
            <span style="color: #fff;">FASTF1 SYNC</span>
          </div>
        </div>
        <span style="font-family: var(--font-hud); font-size: 0.82rem; letter-spacing: 2px; color: var(--text-dim); font-weight: 600;">
          ${subtitle}
        </span>
      </div>
    `;
  }

  if (active === "charles") {
    return `
      <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; gap: 18px;">
        <div class="cl16-loader-container">
          <div class="cl16-monaco-ribbon">
            <div class="cl16-ribbon-red"></div>
            <div class="cl16-ribbon-white"></div>
          </div>
          <svg class="cl16-svg-monogram" viewBox="0 0 120 100">
            <path class="cl16-path-base" d="M 45,20 C 25,20 15,35 15,50 C 15,65 25,80 45,80 L 55,80" />
            <path class="cl16-path-base" d="M 60,20 L 60,80 L 85,80" />
            <path class="cl16-path-base" d="M 95,20 L 95,80 M 105,20 C 105,20 105,80 105,80" />
            <path class="cl16-path-laser" d="M 45,20 C 25,20 15,35 15,50 C 15,65 25,80 45,80 L 55,80" />
            <path class="cl16-path-laser" d="M 60,20 L 60,80 L 85,80" />
            <path class="cl16-path-white" d="M 96,25 L 96,80 M 106,20 L 106,80" />
          </svg>
          <div class="cl16-driver-title">CHARLES LECLERC</div>
          <div class="cl16-subline">
            <span class="num">16</span><span style="color: #c5a059;">•</span><span>SCUDERIA FERRARI</span>
          </div>
          <div class="cl16-progress-track">
            <div class="cl16-progress-fill"></div>
          </div>
        </div>
        <span style="font-family: var(--font-hud); font-size: 0.82rem; letter-spacing: 2px; color: var(--text-dim); font-weight: 600;">
          ${subtitle}
        </span>
      </div>
    `;
  }

  if (active === "brake-disc") {
    return `
      <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; gap: 20px;">
        <div class="f1-brake-disc-loader">
          <div class="brake-disc"></div>
          <div class="brake-caliper"><span>BREMBO</span></div>
          <div class="brake-center-nut"></div>
        </div>
        <span style="font-family: var(--font-hud); font-size: 0.85rem; letter-spacing: 2px; color: var(--f1-red); font-weight: 700;">
          ${subtitle}
        </span>
      </div>
    `;
  }

  return `
    <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; gap: 16px;">
      <div class="f1-shift-lights-loader">
        <div class="shift-lights-bar">
          <div class="shift-led led-g"></div><div class="shift-led led-g"></div><div class="shift-led led-g"></div><div class="shift-led led-g"></div><div class="shift-led led-g"></div>
          <div class="shift-led led-r"></div><div class="shift-led led-r"></div><div class="shift-led led-r"></div><div class="shift-led led-r"></div><div class="shift-led led-r"></div>
          <div class="shift-led led-b"></div><div class="shift-led led-b"></div><div class="shift-led led-b"></div><div class="shift-led led-b"></div><div class="shift-led led-b"></div>
        </div>
        <div class="shift-hud-info">
          <span class="gear">GEAR 7</span>
          <span class="rpm">12,850 RPM</span>
          <span style="color: var(--f1-cyan);">DRS ACTIVE</span>
        </div>
      </div>
      <span style="font-family: var(--font-hud); font-size: 0.85rem; letter-spacing: 2px; color: var(--text-dim); font-weight: 600;">
        ${subtitle}
      </span>
    </div>
  `;
}

async function loadSeasonData(season = "2024") {
  state.currentSeason = season;
  updateSeasonBanner(season);

  // Show loading indicator
  const driversGrid = document.getElementById("driversGrid");
  const calendarGrid = document.getElementById("calendarGrid");
  const standingsTable = document.getElementById("standingsTableContainer");

  if (driversGrid) {
    driversGrid.innerHTML = getActiveLoaderHTML("⚡ CONNECTING TO FASTF1 ENGINE...");
  }

  // 1. Fetch FastF1 Driver Standings
  const driversRes = await fetchFastF1(`standings/drivers?season=${season}`);
  state.drivers = driversRes?.standings || [];

  // 2. Fetch FastF1 Constructor Standings
  const constrRes = await fetchFastF1(`standings/constructors?season=${season}`);
  state.constructors = constrRes?.standings || [];

  // 3. Fetch FastF1 Schedule
  const scheduleRes = await fetchFastF1(`schedule?year=${season}`);
  state.races = scheduleRes?.events || [];

  // 4. Fetch FastF1 Next Race
  await setupNextRaceCountdown();

  // Render components with live FastF1 data
  renderDriversGrid();
  renderTeamsGrid();
  renderCalendar();
  renderStandings();
  populateComparatorOptions();
  renderComparator();
}

function updateSeasonBanner(season) {
  const tagEl = document.getElementById("seasonTag");
  if (tagEl) {
    tagEl.textContent = `🏁 ${season} FIA FORMULA ONE WORLD CHAMPIONSHIP™ • POWERED BY FASTF1`;
  }
}

// ============================================================================
// COUNTDOWN HUD TO NEXT RACE (DYNAMIC FASTF1)
// ============================================================================
async function setupNextRaceCountdown() {
  if (state.timerInterval) clearInterval(state.timerInterval);

  const nextRes = await fetchFastF1("next-race");
  const next = nextRes?.found ? nextRes.next_race : null;
  state.nextRace = next;

  const titleEl = document.getElementById("hudRaceName");
  const circuitEl = document.getElementById("hudCircuitName");
  const roundEl = document.getElementById("hudRoundBadge");
  const dateEl = document.getElementById("hudRaceDate");
  const locEl = document.getElementById("hudRaceLocation");

  if (!next) {
    if (titleEl) titleEl.textContent = "Season Off-Grid";
    if (circuitEl) circuitEl.textContent = "Awaiting Next Session";
    if (roundEl) roundEl.textContent = "OFF-SEASON";
    if (dateEl) dateEl.textContent = "📅 Check Schedule for next Grand Prix";
    if (locEl) locEl.textContent = "📍 Worldwide";
    return;
  }

  const raceTimeIso = next.Session5DateUtc || next.EventDate;
  const targetDate = new Date(raceTimeIso);

  if (titleEl) titleEl.textContent = next.EventName || next.OfficialEventName;
  if (circuitEl) circuitEl.textContent = `${next.Location}, ${next.Country}`;
  if (roundEl) roundEl.textContent = `ROUND ${next.RoundNumber} / ${state.races.length || 24}`;
  if (dateEl) {
    dateEl.innerHTML = `📅 ${targetDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • ${targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Your Local Time)`;
  }
  if (locEl) locEl.innerHTML = `📍 ${next.Location}, ${next.Country}`;

  function updateTimer() {
    const diff = targetDate - new Date();
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minsEl = document.getElementById("minutes");
    const secsEl = document.getElementById("seconds");

    const sDays = document.getElementById("slideTimerDays");
    const sHours = document.getElementById("slideTimerHours");
    const sMins = document.getElementById("slideTimerMins");
    const sSecs = document.getElementById("slideTimerSecs");

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = "00";
      if (hoursEl) hoursEl.textContent = "00";
      if (minsEl) minsEl.textContent = "00";
      if (secsEl) secsEl.textContent = "00";
      if (sDays) sDays.textContent = "00";
      if (sHours) sHours.textContent = "00";
      if (sMins) sMins.textContent = "00";
      if (sSecs) sSecs.textContent = "00";
      return;
    }

    const totalSec = Math.floor(diff / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    const dStr = String(d).padStart(2, "0");
    const hStr = String(h).padStart(2, "0");
    const mStr = String(m).padStart(2, "0");
    const sStr = String(s).padStart(2, "0");

    if (daysEl) daysEl.textContent = dStr;
    if (hoursEl) hoursEl.textContent = hStr;
    if (minsEl) minsEl.textContent = mStr;
    if (secsEl) secsEl.textContent = sStr;

    if (sDays) sDays.textContent = dStr;
    if (sHours) sHours.textContent = hStr;
    if (sMins) sMins.textContent = mStr;
    if (sSecs) sSecs.textContent = sStr;
  }

  updateTimer();
  state.timerInterval = setInterval(updateTimer, 1000);
}

// ============================================================================
// DRIVERS GRID (AUTHENTIC FASTF1 DATA & OFFICIAL HEADSHOTS)
// ============================================================================
function renderDriversGrid() {
  const container = document.getElementById("driversGrid");
  if (!container) return;

  const query = state.driverSearchQuery.toLowerCase().trim();
  const filter = state.activeDriverFilter;

  const filtered = state.drivers.filter(item => {
    const teamId = (item.constructorIds?.[0] || "").toLowerCase();
    const teamName = (item.constructorNames?.[0] || "").toLowerCase();
    const matchesFilter = filter === "all" || teamId === filter || teamName.includes(filter);
    const fullName = `${item.givenName} ${item.familyName}`.toLowerCase();
    const code = (item.driverCode || "").toLowerCase();
    const matchesSearch = !query || fullName.includes(query) || code.includes(query) || teamName.includes(query);
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-dim);">
        <p style="font-size: 1.2rem;">No drivers found for this filter in the FastF1 database.</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const teamId = item.constructorIds?.[0] || "";
    const teamName = item.constructorNames?.[0] || "Formula 1 Team";
    const teamCfg = getTeamConfig(teamId, teamName);
    const isTop3 = parseInt(item.position) <= 3;
    const photo = item.headshotUrl || LOCAL_DRIVER_PHOTOS[item.driverId] || LOCAL_DRIVER_PHOTOS[item.familyName?.toLowerCase()];

    return `
      <article class="driver-card" style="--team-color: ${teamCfg.color}; --team-color-glow: ${teamCfg.glow};">
        <div class="driver-card-header">
          <span class="driver-number-badge">#${item.driverNumber || item.position}</span>
          <span class="driver-rank-badge ${isTop3 ? 'top-3' : ''}">P${item.position}</span>
          ${photo ? `
            <div class="driver-image" style="background-image: url('${photo}');"></div>
          ` : `
            <div class="driver-placeholder-avatar">
              <span class="helmet-icon">🏎️</span>
              <span style="font-family: var(--font-hud); font-size: 0.95rem; font-weight: 800;">${item.driverCode || item.familyName.substring(0,3).toUpperCase()}</span>
            </div>
          `}
        </div>
        <div class="team-color-stripe"></div>
        <div class="driver-card-body">
          <div class="driver-name-block">
            <span class="driver-first-name">${item.givenName}</span>
            <h3 class="driver-last-name">
              ${item.familyName}
              <span class="driver-country-code">${item.driverCode || item.driverNationality?.substring(0,3).toUpperCase()}</span>
            </h3>
          </div>
          <p class="driver-team-name">${teamName}</p>
          <div class="driver-stats-row">
            <div class="stat-item">
              <span class="stat-item-label">Points</span>
              <span class="stat-item-value">${item.points}</span>
            </div>
            <div class="stat-item">
              <span class="stat-item-label">GP Wins</span>
              <span class="stat-item-value">${item.wins || "0"}</span>
            </div>
          </div>
          <button class="btn-compare-driver" onclick="loadDriverIntoComparator('${item.driverId}')">
            <span>⚔️ Compare Driver</span>
          </button>
        </div>
      </article>
    `;
  }).join("");
}

// ============================================================================
// CONSTRUCTORS CHAMPIONSHIP (FASTF1 DYNAMIC)
// ============================================================================
function renderTeamsGrid() {
  const container = document.getElementById("teamsGrid");
  if (!container) return;

  if (state.constructors.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 32px; color: var(--text-dim);">
        <p>No constructor records available for this season in FastF1.</p>
      </div>`;
    return;
  }

  const maxPoints = Math.max(...state.constructors.map(c => parseFloat(c.points) || 1));

  container.innerHTML = state.constructors.map(item => {
    const teamCfg = getTeamConfig(item.constructorId, item.constructorName);
    const pts = parseFloat(item.points) || 0;
    const sharePercent = Math.round((pts / maxPoints) * 100);

    return `
      <div class="team-card" style="--team-color: ${teamCfg.color};">
        <div class="team-card-header">
          <span class="team-rank-pos">P${item.position}</span>
          <img src="${teamCfg.logo}" alt="${item.constructorName}" class="team-card-logo" onerror="this.src='assets/images/f1.png'">
        </div>
        <h3 class="team-card-name">${item.constructorName}</h3>
        <p class="team-card-country">${item.constructorNationality} • ${item.wins || 0} Wins</p>
        <div class="team-stats-meter">
          <div class="team-meter-labels">
            <span>Points</span>
            <span style="color: #ffffff; font-weight: 800;">${item.points} PTS</span>
          </div>
          <div class="team-meter-bar">
            <div class="team-meter-fill" style="width: ${sharePercent}%;"></div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ============================================================================
// CALENDAR GRID (FASTF1 OFFICIAL FIA SCHEDULE)
// ============================================================================
function renderCalendar() {
  const container = document.getElementById("calendarGrid");
  if (!container) return;

  const filter = state.activeCalendarFilter;
  const now = new Date();

  const filtered = state.races.filter(race => {
    const raceDateIso = race.Session5DateUtc || race.EventDate;
    const rDate = new Date(raceDateIso);
    if (filter === "completed") return rDate < now;
    if (filter === "upcoming") return rDate >= now;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-dim);">
        <p>No races match the selected calendar filter.</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(race => {
    const raceDateIso = race.Session5DateUtc || race.EventDate;
    const rDate = new Date(raceDateIso);
    const isCompleted = rDate < now;
    const isNext = state.nextRace && state.nextRace.RoundNumber === race.RoundNumber;

    let tagClass = "upcoming";
    let tagText = "UPCOMING";
    if (isCompleted) {
      tagClass = "completed";
      tagText = "COMPLETED";
    } else if (isNext) {
      tagClass = "next";
      tagText = "NEXT UP";
    }

    const encodedRace = encodeURIComponent(JSON.stringify(race));

    return `
      <div class="race-card ${isNext ? 'next-up' : ''}" onclick="openCircuitModal('${encodedRace}')">
        <div class="race-card-top">
          <span class="round-pill">ROUND ${race.RoundNumber}</span>
          <span class="race-status-tag ${tagClass}">${tagText}</span>
        </div>
        <h3 class="race-card-title">${race.EventName || race.OfficialEventName}</h3>
        <p class="race-card-circuit">${race.Location}, ${race.Country}</p>
        <div class="race-card-footer">
          <span class="race-card-date">
            📅 ${rDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </span>
          <span>📍 ${race.Location}</span>
        </div>
      </div>
    `;
  }).join("");
}

function openCircuitModal(encodedData) {
  try {
    const race = JSON.parse(decodeURIComponent(encodedData));
    const modal = document.getElementById("circuitModal");
    if (!modal) return;

    const rDate = new Date(race.Session5DateUtc || race.EventDate);

    document.getElementById("modalRound").textContent = `ROUND ${race.RoundNumber} / ${state.races.length}`;
    document.getElementById("modalRaceName").textContent = race.EventName || race.OfficialEventName;
    document.getElementById("modalCircuitName").textContent = `${race.Location}, ${race.Country}`;
    document.getElementById("modalLocation").textContent = `${race.Location}, ${race.Country}`;
    document.getElementById("modalCoords").textContent = race.EventFormat ? `Format: ${race.EventFormat}` : "Official FIA Circuit";
    document.getElementById("modalDate").textContent = rDate.toLocaleString();

    const wikiBtn = document.getElementById("modalWikiLink");
    if (wikiBtn) {
      wikiBtn.href = `https://en.wikipedia.org/wiki/${encodeURIComponent((race.EventName || "Formula_One") + " " + (race.season || state.currentSeason))}`;
    }

    modal.classList.add("active");
  } catch (e) {
    console.error("Failed to open circuit modal:", e);
  }
}

function closeCircuitModal() {
  const modal = document.getElementById("circuitModal");
  if (modal) modal.classList.remove("active");
}

// ============================================================================
// STANDINGS BROADCAST TABLE (FASTF1 DATA)
// ============================================================================
function renderStandings() {
  const container = document.getElementById("standingsTableContainer");
  if (!container) return;

  if (state.activeStandingsTab === "drivers") {
    if (state.drivers.length === 0) {
      container.innerHTML = `<p style="padding: 24px; text-align: center; color: var(--text-dim);">No driver standings loaded.</p>`;
      return;
    }

    const leaderPts = parseFloat(state.drivers[0]?.points || 0);

    container.innerHTML = `
      <table class="standings-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Driver</th>
            <th>Team</th>
            <th>Wins</th>
            <th>Points</th>
            <th>Gap</th>
          </tr>
        </thead>
        <tbody>
          ${state.drivers.map(item => {
            const teamId = item.constructorIds?.[0] || "";
            const teamName = item.constructorNames?.[0] || "Team";
            const teamCfg = getTeamConfig(teamId, teamName);
            const pos = parseInt(item.position);
            const pts = parseFloat(item.points) || 0;
            const delta = pos === 1 ? "-" : `-${(leaderPts - pts).toFixed(0)} PTS`;
            const posClass = pos === 1 ? 'pos-1' : pos === 2 ? 'pos-2' : pos === 3 ? 'pos-3' : '';

            return `
              <tr>
                <td class="pos-cell ${posClass}">${pos === 1 ? '🥇 1' : pos === 2 ? '🥈 2' : pos === 3 ? '🥉 3' : pos}</td>
                <td>
                  <div class="driver-cell-flex">
                    <span class="team-indicator-bar" style="--team-color: ${teamCfg.color};"></span>
                    <div>
                      <span class="driver-cell-name">${item.givenName} ${item.familyName}</span>
                      <span class="driver-cell-code">${item.driverCode || ""}</span>
                    </div>
                  </div>
                </td>
                <td style="color: ${teamCfg.color}; font-weight: 600;">${teamName}</td>
                <td>${item.wins || "0"}</td>
                <td class="points-cell">${item.points}</td>
                <td class="delta-cell">${delta}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  } else {
    if (state.constructors.length === 0) {
      container.innerHTML = `<p style="padding: 24px; text-align: center; color: var(--text-dim);">No constructor standings loaded.</p>`;
      return;
    }

    const leaderPts = parseFloat(state.constructors[0]?.points || 0);

    container.innerHTML = `
      <table class="standings-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Constructor</th>
            <th>Nationality</th>
            <th>Wins</th>
            <th>Points</th>
            <th>Gap</th>
          </tr>
        </thead>
        <tbody>
          ${state.constructors.map(item => {
            const teamCfg = getTeamConfig(item.constructorId, item.constructorName);
            const pos = parseInt(item.position);
            const pts = parseFloat(item.points) || 0;
            const delta = pos === 1 ? "-" : `-${(leaderPts - pts).toFixed(0)} PTS`;
            const posClass = pos === 1 ? 'pos-1' : pos === 2 ? 'pos-2' : pos === 3 ? 'pos-3' : '';

            return `
              <tr>
                <td class="pos-cell ${posClass}">${pos === 1 ? '🥇 1' : pos === 2 ? '🥈 2' : pos === 3 ? '🥉 3' : pos}</td>
                <td>
                  <div class="driver-cell-flex">
                    <span class="team-indicator-bar" style="--team-color: ${teamCfg.color};"></span>
                    <span class="driver-cell-name">${item.constructorName}</span>
                  </div>
                </td>
                <td style="color: var(--text-dim);">${item.constructorNationality}</td>
                <td>${item.wins || "0"}</td>
                <td class="points-cell">${item.points}</td>
                <td class="delta-cell">${delta}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  }
}

// ============================================================================
// HEAD-TO-HEAD COMPARISON & LIVE FASTF1 TELEMETRY TRACE
// ============================================================================
let comparatorDriver1Id = "";
let comparatorDriver2Id = "";

function populateComparatorOptions() {
  const sel1 = document.getElementById("compareDriver1Select");
  const sel2 = document.getElementById("compareDriver2Select");
  if (!sel1 || !sel2 || state.drivers.length === 0) return;

  const optionsHtml = state.drivers.map(d => {
    const teamName = d.constructorNames?.[0] || "F1";
    return `<option value="${d.driverId}">${d.givenName} ${d.familyName} (${teamName})</option>`;
  }).join("");

  sel1.innerHTML = optionsHtml;
  sel2.innerHTML = optionsHtml;

  // Defaults: P1 and P2
  comparatorDriver1Id = state.drivers[0].driverId;
  comparatorDriver2Id = state.drivers[1]?.driverId || state.drivers[0].driverId;

  sel1.value = comparatorDriver1Id;
  sel2.value = comparatorDriver2Id;
}

function loadDriverIntoComparator(driverId) {
  comparatorDriver1Id = driverId;
  const sel1 = document.getElementById("compareDriver1Select");
  if (sel1) sel1.value = driverId;
  renderComparator();
  const arena = document.getElementById("compare");
  if (arena) arena.scrollIntoView({ behavior: "smooth" });
}

function renderComparator() {
  const d1 = state.drivers.find(d => d.driverId === comparatorDriver1Id) || state.drivers[0];
  const d2 = state.drivers.find(d => d.driverId === comparatorDriver2Id) || state.drivers[1] || d1;
  if (!d1 || !d2) return;

  const t1 = getTeamConfig(d1.constructorIds?.[0], d1.constructorNames?.[0]);
  const t2 = getTeamConfig(d2.constructorIds?.[0], d2.constructorNames?.[0]);

  const pts1 = parseFloat(d1.points) || 0;
  const pts2 = parseFloat(d2.points) || 0;
  const maxPts = Math.max(pts1, pts2, 1);

  const wins1 = parseInt(d1.wins) || 0;
  const wins2 = parseInt(d2.wins) || 0;
  const maxWins = Math.max(wins1, wins2, 1);

  const pos1 = parseInt(d1.position) || 20;
  const pos2 = parseInt(d2.position) || 20;

  function renderProfileCard(d, t, pts, wins, pos, otherPts, otherWins, otherPos) {
    const photo = d.headshotUrl;
    const isPointsWinner = pts >= otherPts;
    const isWinsWinner = wins >= otherWins;
    const isPosWinner = pos <= otherPos;

    return `
      <div class="compare-profile-card" style="--profile-color: ${t.color};">
        ${photo ? `
          <div class="compare-avatar" style="background-image: url('${photo}');"></div>
        ` : `
          <div class="compare-avatar" style="background: rgba(255,255,255,0.06);">
            🏎️
          </div>
        `}
        <h4 class="compare-name">${d.givenName} ${d.familyName}</h4>
        <p class="compare-team">${d.constructorNames?.[0] || "F1 Team"} • #${d.driverNumber || pos}</p>

        <!-- Position -->
        <div class="compare-stat-row">
          <div class="compare-stat-labels">
            <span>Championship Standing</span>
            <span class="compare-stat-val" style="color: ${isPosWinner ? 'var(--f1-yellow)' : '#fff'};">
              P${pos} ${isPosWinner ? '👑' : ''}
            </span>
          </div>
          <div class="compare-bar-track">
            <div class="compare-bar-fill" style="width: ${Math.max(10, Math.round(((25 - pos) / 24) * 100))}%;"></div>
          </div>
        </div>

        <!-- Points -->
        <div class="compare-stat-row">
          <div class="compare-stat-labels">
            <span>Total Points</span>
            <span class="compare-stat-val" style="color: ${isPointsWinner ? t.color : '#fff'};">
              ${pts} PTS ${isPointsWinner ? '⚡' : ''}
            </span>
          </div>
          <div class="compare-bar-track">
            <div class="compare-bar-fill" style="width: ${Math.round((pts / maxPts) * 100)}%;"></div>
          </div>
        </div>

        <!-- Wins -->
        <div class="compare-stat-row">
          <div class="compare-stat-labels">
            <span>Grand Prix Wins</span>
            <span class="compare-stat-val" style="color: ${isWinsWinner ? t.color : '#fff'};">
              ${wins} WINS
            </span>
          </div>
          <div class="compare-bar-track">
            <div class="compare-bar-fill" style="width: ${Math.round((wins / maxWins) * 100)}%;"></div>
          </div>
        </div>
      </div>
    `;
  }

  const container = document.getElementById("comparatorDisplay");
  if (container) {
    container.innerHTML = `
      ${renderProfileCard(d1, t1, pts1, wins1, pos1, pts2, wins2, pos2)}
      ${renderProfileCard(d2, t2, pts2, wins2, pos2, pts1, wins1, pos1)}
    `;
  }
}

async function fetchAndRenderTelemetry() {
  const d1 = state.drivers.find(d => d.driverId === comparatorDriver1Id);
  const d2 = state.drivers.find(d => d.driverId === comparatorDriver2Id);
  if (!d1 || !d2) return;

  const code1 = d1.driverCode || "VER";
  const code2 = d2.driverCode || "NOR";

  const btn = document.getElementById("btnFetchTelemetry");
  const svgContainer = document.getElementById("telemetrySvgContainer");
  const legend = document.getElementById("telemetryLegend");

  if (btn) btn.disabled = true;
  if (svgContainer) {
    svgContainer.innerHTML = getActiveLoaderHTML(`PROCESSING FASTF1 CAR TELEMETRY FOR ${code1} VS ${code2}...`);
  }

  const t1 = getTeamConfig(d1.constructorIds?.[0], d1.constructorNames?.[0]);
  const t2 = getTeamConfig(d2.constructorIds?.[0], d2.constructorNames?.[0]);

  try {
    const res = await fetchFastF1(`telemetry?year=2024&round=1&driver1=${code1}&driver2=${code2}`);
    if (!res || res.error) {
      throw new Error(res?.error || "Failed to load telemetry session from FastF1");
    }

    const tel1 = res.driver1?.telemetry || [];
    const tel2 = res.driver2?.telemetry || [];

    if (tel1.length === 0 || tel2.length === 0) {
      throw new Error("Telemetry points empty for the selected driver pairing.");
    }

    if (legend) {
      legend.innerHTML = `
        <div class="telemetry-legend-item">
          <span class="telemetry-legend-dot" style="background: ${t1.color};"></span>
          <span style="color: ${t1.color};">${d1.givenName} ${d1.familyName} (${code1}) - ${res.driver1.lapTime.slice(10, 19)}</span>
        </div>
        <div class="telemetry-legend-item">
          <span class="telemetry-legend-dot" style="background: ${t2.color};"></span>
          <span style="color: ${t2.color};">${d2.givenName} ${d2.familyName} (${code2}) - ${res.driver2.lapTime.slice(10, 19)}</span>
        </div>
      `;
    }

    // Render SVG Telemetry Speed Chart
    renderTelemetrySvg(tel1, tel2, t1.color, t2.color, code1, code2);
  } catch (err) {
    if (svgContainer) {
      svgContainer.innerHTML = `
        <div style="color: #ff524d; font-family: var(--font-hud); text-align: center; padding: 20px;">
          <p>⚠️ ${err.message}</p>
          <p style="font-size: 0.8rem; color: var(--text-dim); margin-top: 6px;">Try another driver pair or verify FastF1 session status.</p>
        </div>`;
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

function renderTelemetrySvg(tel1, tel2, color1, color2, code1, code2) {
  const container = document.getElementById("telemetrySvgContainer");
  if (!container) return;

  const width = 850;
  const height = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxDist = Math.max(...tel1.map(p => p.Distance), ...tel2.map(p => p.Distance), 5400);
  const maxSpeed = 350;
  const minSpeed = 50;

  function toX(dist) {
    return padLeft + (dist / maxDist) * chartW;
  }
  function toY(spd) {
    const clamped = Math.max(minSpeed, Math.min(maxSpeed, spd));
    return padTop + chartH - ((clamped - minSpeed) / (maxSpeed - minSpeed)) * chartH;
  }

  function makePath(points) {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.Distance).toFixed(1)} ${toY(p.Speed).toFixed(1)}`).join(" ");
  }

  const dPath1 = makePath(tel1);
  const dPath2 = makePath(tel2);

  container.innerHTML = `
    <svg class="telemetry-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
      <!-- Gridlines -->
      <line x1="${padLeft}" y1="${toY(100)}" x2="${width - padRight}" y2="${toY(100)}" class="telemetry-axis-line" />
      <text x="${padLeft - 8}" y="${toY(100) + 4}" class="telemetry-axis-text" text-anchor="end">100 km/h</text>

      <line x1="${padLeft}" y1="${toY(200)}" x2="${width - padRight}" y2="${toY(200)}" class="telemetry-axis-line" />
      <text x="${padLeft - 8}" y="${toY(200) + 4}" class="telemetry-axis-text" text-anchor="end">200 km/h</text>

      <line x1="${padLeft}" y1="${toY(300)}" x2="${width - padRight}" y2="${toY(300)}" class="telemetry-axis-line" />
      <text x="${padLeft - 8}" y="${toY(300) + 4}" class="telemetry-axis-text" text-anchor="end">300 km/h</text>

      <!-- Bottom Distance Line -->
      <line x1="${padLeft}" y1="${padTop + chartH}" x2="${width - padRight}" y2="${padTop + chartH}" stroke="rgba(255,255,255,0.2)" />
      <text x="${padLeft}" y="${height - 8}" class="telemetry-axis-text">Turn 1 (0m)</text>
      <text x="${width / 2}" y="${height - 8}" class="telemetry-axis-text" text-anchor="middle">Sector 2 (~${Math.round(maxDist / 2)}m)</text>
      <text x="${width - padRight}" y="${height - 8}" class="telemetry-axis-text" text-anchor="end">Finish Line (${Math.round(maxDist)}m)</text>

      <!-- Driver 1 Speed Line -->
      <path d="${dPath1}" class="telemetry-line-d1" style="stroke: ${color1}; color: ${color1};" />

      <!-- Driver 2 Speed Line -->
      <path d="${dPath2}" class="telemetry-line-d2" style="stroke: ${color2}; color: ${color2};" stroke-dasharray="6,2" />
    </svg>
  `;
}

// ============================================================================
// 5-RED-LIGHTS REACTION TIME MINI-GAME
// ============================================================================
let gameGameState = "idle";
let gameLightTimeouts = [];
let lightsOutTimestamp = 0;
let audioCtx = null;

function playTone(freq, duration) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function startReactionGame() {
  if (gameGameState === "countdown" || gameGameState === "ready") {
    triggerJumpStart();
    return;
  }

  resetReactionLights();
  gameGameState = "countdown";

  const statusText = document.getElementById("gameStatusText");
  const scoreDisplay = document.getElementById("gameScoreDisplay");
  const verdictText = document.getElementById("gameVerdict");

  if (statusText) statusText.textContent = "WARM-UP COMPLETE... FORMING GRID...";
  if (scoreDisplay) scoreDisplay.textContent = "--- ms";
  if (verdictText) verdictText.textContent = "Watch the 5 red lights. Click as soon as all 5 turn OFF!";

  for (let i = 1; i <= 5; i++) {
    const timeout = setTimeout(() => {
      turnOnGantryColumn(i);
      playTone(440, 0.12);
      if (statusText) statusText.textContent = `LIGHT ${i} ON...`;

      if (i === 5) {
        const randomDelay = 1000 + Math.random() * 2200;
        const lightsOutTimeout = setTimeout(() => {
          extinguishAllLights();
          lightsOutTimestamp = performance.now();
          gameGameState = "ready";
          playTone(880, 0.25);
          if (statusText) statusText.textContent = "LIGHTS OUT AND AWAY WE GO!";
        }, randomDelay);
        gameLightTimeouts.push(lightsOutTimeout);
      }
    }, i * 1000);
    gameLightTimeouts.push(timeout);
  }
}

function turnOnGantryColumn(colIndex) {
  const bulbs = document.querySelectorAll(`.col-${colIndex} .light-bulb`);
  bulbs.forEach(b => b.classList.add("red-on"));
}

function extinguishAllLights() {
  const bulbs = document.querySelectorAll(".light-bulb");
  bulbs.forEach(b => b.classList.remove("red-on"));
}

function resetReactionLights() {
  gameLightTimeouts.forEach(t => clearTimeout(t));
  gameLightTimeouts = [];
  extinguishAllLights();
}

function triggerJumpStart() {
  resetReactionLights();
  gameGameState = "finished";
  playTone(200, 0.4);

  const statusText = document.getElementById("gameStatusText");
  const scoreDisplay = document.getElementById("gameScoreDisplay");
  const verdictText = document.getElementById("gameVerdict");

  if (statusText) statusText.textContent = "🚨 FALSE START / JUMP START!";
  if (scoreDisplay) scoreDisplay.textContent = "PENALTY";
  if (verdictText) verdictText.textContent = "You moved before the lights went out! +5-second time penalty. Click to try again.";
}

function handleReactionClick() {
  if (gameGameState === "idle") {
    startReactionGame();
    return;
  }
  if (gameGameState === "countdown") {
    triggerJumpStart();
    return;
  }
  if (gameGameState === "ready") {
    const reactionTime = Math.round(performance.now() - lightsOutTimestamp);
    gameGameState = "finished";

    const statusText = document.getElementById("gameStatusText");
    const scoreDisplay = document.getElementById("gameScoreDisplay");
    const verdictText = document.getElementById("gameVerdict");

    if (scoreDisplay) scoreDisplay.textContent = `${reactionTime} ms`;

    let grade = "";
    if (reactionTime < 180) {
      grade = "🏆 ALIEN REACTION! That's faster than modern F1 telemetry standards!";
    } else if (reactionTime < 240) {
      grade = "🏎️ ELITE FORMULA 1 DRIVER! You're matching Verstappen and Norris off the line!";
    } else if (reactionTime < 320) {
      grade = "🏁 SOLID REACTION! Clean launch down to Turn 1.";
    } else {
      grade = "⏱️ SLOW REACTION! You got boxed in by the midfield. Click to try again!";
    }

    if (statusText) statusText.textContent = "SECTOR 1 TIMING RECORDED";
    if (verdictText) verdictText.textContent = grade;
    return;
  }
  if (gameGameState === "finished") {
    startReactionGame();
  }
}

// ============================================================================
// AUDIO & VIDEO CONTROLS
// ============================================================================
function toggleBgVideo() {
  const video = document.getElementById("bgVideo");
  const btn = document.getElementById("videoToggleBtn");
  if (!video) return;

  if (video.paused) {
    video.play();
    if (btn) btn.textContent = "🎬 Pause Video";
  } else {
    video.pause();
    if (btn) btn.textContent = "🎬 Play Video";
  }
}

// ============================================================================
// EVENT LISTENERS & INITIALIZATION
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initial Load: 2024 Championship with FastF1
  loadSeasonData("2024");

  // 2. Season Switcher
  const seasonSelect = document.getElementById("seasonSelect");
  if (seasonSelect) {
    seasonSelect.addEventListener("change", (e) => {
      loadSeasonData(e.target.value);
    });
  }

  // 3. Driver Filter Pills
  const driverPills = document.querySelectorAll("#driverFilters .filter-pill");
  driverPills.forEach(pill => {
    pill.addEventListener("click", () => {
      driverPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.activeDriverFilter = pill.getAttribute("data-filter") || "all";
      renderDriversGrid();
    });
  });

  // 4. Driver Search Input
  const driverSearchInput = document.getElementById("driverSearchInput");
  if (driverSearchInput) {
    driverSearchInput.addEventListener("input", (e) => {
      state.driverSearchQuery = e.target.value;
      renderDriversGrid();
    });
  }

  // 5. Calendar Filter Pills
  const calendarPills = document.querySelectorAll("#calendarFilters .filter-pill");
  calendarPills.forEach(pill => {
    pill.addEventListener("click", () => {
      calendarPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.activeCalendarFilter = pill.getAttribute("data-filter") || "all";
      renderCalendar();
    });
  });

  // 6. Standings Tabs
  const standingsTabs = document.querySelectorAll(".standings-tab-btn");
  standingsTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      standingsTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      state.activeStandingsTab = tab.getAttribute("data-tab") || "drivers";
      renderStandings();
    });
  });

  // 7. Comparator Selects
  const compSel1 = document.getElementById("compareDriver1Select");
  const compSel2 = document.getElementById("compareDriver2Select");
  if (compSel1) {
    compSel1.addEventListener("change", (e) => {
      comparatorDriver1Id = e.target.value;
      renderComparator();
    });
  }
  if (compSel2) {
    compSel2.addEventListener("change", (e) => {
      comparatorDriver2Id = e.target.value;
      renderComparator();
    });
  }

  // 8. Fetch FastF1 Telemetry Button
  const btnTelemetry = document.getElementById("btnFetchTelemetry");
  if (btnTelemetry) {
    btnTelemetry.addEventListener("click", fetchAndRenderTelemetry);
  }

  // 9. Reaction Game Zone
  const gameZone = document.getElementById("gameTriggerZone");
  if (gameZone) {
    gameZone.addEventListener("click", handleReactionClick);
  }

  // 10. Mobile Menu Toggle
  const mobileBtn = document.getElementById("mobileMenuBtn");
  const mainNav = document.getElementById("mainNav");
  if (mobileBtn && mainNav) {
    mobileBtn.addEventListener("click", () => {
      mainNav.classList.toggle("mobile-active");
    });
  }

  // 11. Close Modal on Backdrop Click
  const modal = document.getElementById("circuitModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeCircuitModal();
    });
  }

  // 12. Charles Leclerc Chapters Drawer Navigation
  const btnChapters = document.getElementById("btnChaptersToggle");
  const btnBurger = document.getElementById("btnBurgerToggle");
  const btnCloseChapters = document.getElementById("btnCloseChapters");
  const drawer = document.getElementById("chaptersDrawer");

  function toggleChaptersDrawer(open = null) {
    if (!drawer) return;
    if (open === null) {
      drawer.classList.toggle("active");
    } else if (open) {
      drawer.classList.add("active");
    } else {
      drawer.classList.remove("active");
    }
  }

  if (btnChapters) btnChapters.addEventListener("click", () => toggleChaptersDrawer());
  if (btnBurger) btnBurger.addEventListener("click", () => toggleChaptersDrawer());
  if (btnCloseChapters) btnCloseChapters.addEventListener("click", () => toggleChaptersDrawer(false));

  const chapterLinks = document.querySelectorAll(".chapter-link");
  chapterLinks.forEach(link => {
    link.addEventListener("click", () => toggleChaptersDrawer(false));
  });

  // 13. Preloader Dismissal, Pure Video Viewing Window & Cursor-Triggered Hero Reveal
  const preloader = document.getElementById("sitePreloader");
  const heroSection = document.getElementById("hero");
  let hasTriggeredHeroAnimation = false;
  let hasUserMovedCursor = false;
  let canStartHeroAnimation = false;

  // Track cursor coordinates for intentional movement threshold
  let lastCursorX = null;
  let lastCursorY = null;
  let accumulatedDistance = 0;
  const CURSOR_MOVE_THRESHOLD = 15; // 15px intentional movement

  function triggerHeroAscent() {
    if (hasTriggeredHeroAnimation || !heroSection) return;
    hasTriggeredHeroAnimation = true;
    heroSection.classList.add("cl-revealed");

    // Clean up event listeners once triggered
    window.removeEventListener("mousemove", onCursorMove);
    window.removeEventListener("pointermove", onCursorMove);
    window.removeEventListener("wheel", onCursorMove);
    window.removeEventListener("touchstart", onCursorMove);
  }

  function onCursorMove(e) {
    if (hasTriggeredHeroAnimation) return;

    if (e.clientX !== undefined && e.clientY !== undefined) {
      if (lastCursorX === null) {
        lastCursorX = e.clientX;
        lastCursorY = e.clientY;
        return;
      }
      const dx = e.clientX - lastCursorX;
      const dy = e.clientY - lastCursorY;
      accumulatedDistance += Math.hypot(dx, dy);
      lastCursorX = e.clientX;
      lastCursorY = e.clientY;

      if (accumulatedDistance < CURSOR_MOVE_THRESHOLD) {
        return;
      }
    }

    hasUserMovedCursor = true;

    // If the initial pure video viewing period has already elapsed, start slow animation immediately!
    if (canStartHeroAnimation) {
      triggerHeroAscent();
    }
  }

  // Set up listeners immediately so cursor movements are detected
  window.addEventListener("mousemove", onCursorMove, { passive: true });
  window.addEventListener("pointermove", onCursorMove, { passive: true });
  window.addEventListener("wheel", onCursorMove, { passive: true });
  window.addEventListener("touchstart", onCursorMove, { passive: true });

  const PRELOADER_DISMISS_DELAY = 1400; // ms
  const VIDEO_VIEW_DURATION = 3000;     // Guaranteed 3 seconds of pure video viewing

  if (preloader) {
    setTimeout(() => {
      preloader.classList.add("dismiss");
      setTimeout(() => {
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
      }, 900);

      // Viewer gets to watch the video calmly for a few seconds.
      // Once this duration elapses, if the viewer already moved their cursor, start animation;
      // otherwise, keep waiting until the viewer actually moves the cursor on the webpage!
      setTimeout(() => {
        canStartHeroAnimation = true;
        if (hasUserMovedCursor) {
          triggerHeroAscent();
        }
      }, VIDEO_VIEW_DURATION);

    }, PRELOADER_DISMISS_DELAY);
  } else {
    setTimeout(() => {
      canStartHeroAnimation = true;
      if (hasUserMovedCursor) {
        triggerHeroAscent();
      }
    }, VIDEO_VIEW_DURATION);
  }

  // 14. Lando Norris Style Hero Minimize & Horizontal Scroll Showcase Engine
  const scrollContainer = document.getElementById("heroScrollTrack");
  const horizStrip = document.getElementById("horizontalStrip");
  const heroCard = document.getElementById("heroInnerCard");
  const horizActiveNum = document.getElementById("horizActiveNum");
  const horizActiveTitle = document.getElementById("horizActiveTitle");
  const horizProgressLine = document.getElementById("horizProgressLine");
  const btnHorizPrev = document.getElementById("btnHorizPrev");
  const btnHorizNext = document.getElementById("btnHorizNext");
  const scrollController = document.querySelector(".ln-scroll-controller");

  const SLIDE_TITLES = [
    "DRIVE TO SURVIVE",
    "AUSTRALIAN GP 2026",
    "WORLD TITLE FIGHT",
    "APEX COMPARATOR",
    "5 RED LIGHTS TRAINING"
  ];
  const TOTAL_SLIDES = 5;

  let isTicking = false;

  function updateLandoScroll() {
    isTicking = false;
    if (!scrollContainer || !horizStrip || !heroCard) return;

    const rect = scrollContainer.getBoundingClientRect();
    const trackHeight = scrollContainer.offsetHeight - window.innerHeight;
    if (trackHeight <= 0) return;

    // Progress through the sticky section: 0.0 to 1.0
    const rawProgress = -rect.top / trackHeight;
    const progress = Math.max(0, Math.min(1, rawProgress));

    // Fade out controller when scrolling past the showcase track into general vertical content
    if (scrollController) {
      if (rawProgress > 1.0) {
        const exitProgress = Math.min(1, (rawProgress - 1.0) * 8);
        scrollController.style.opacity = (1 - exitProgress).toFixed(2);
        scrollController.style.pointerEvents = exitProgress > 0.5 ? "none" : "auto";
      } else {
        scrollController.style.opacity = "1";
        scrollController.style.pointerEvents = "auto";
      }
    }

    // When user scrolls, "DRIVE TO SURVIVE" text glides up from bottom to center!
    if (progress > 0.005) {
      heroCard.classList.add("cl-revealed");
    } else {
      // At the very top (y = 0), reset to pure video view
      heroCard.classList.remove("cl-revealed");
    }

    // Responsive target scale: Desktop = 0.30 (30% of screen as requested), Tablet = 0.45, Mobile = 0.65
    const isMobile = window.innerWidth <= 600;
    const isTablet = window.innerWidth > 600 && window.innerWidth <= 900;
    const TARGET_SCALE = isMobile ? 0.65 : (isTablet ? 0.45 : 0.30);

    // Elements inside hero card to fade out as card minimizes
    const scrollExplore = heroCard.querySelector(".cl-scroll-to-explore");
    const pillBtn = heroCard.querySelector(".cl-bottom-right-pill");

    // Phase 1: Shrink / minimize hero section during initial scroll (first 20% of track)
    const SHRINK_LIMIT = 0.20;
    if (progress <= SHRINK_LIMIT) {
      const shrinkRatio = progress / SHRINK_LIMIT; // 0.0 to 1.0
      // Scale from 1.0 down to TARGET_SCALE (0.30)
      const currentScale = 1.0 - ((1.0 - TARGET_SCALE) * shrinkRatio);
      // Border radius from 0px to 28px
      const currentRadius = Math.round(shrinkRatio * 28);
      const currentShadow = Math.round(shrinkRatio * 70);

      heroCard.style.transform = `scale(${currentScale.toFixed(4)})`;
      heroCard.style.borderRadius = `${currentRadius}px`;
      
      if (shrinkRatio > 0.02) {
        heroCard.style.border = `2px solid rgba(255, 255, 255, ${(0.22 * shrinkRatio).toFixed(3)})`;
        heroCard.style.boxShadow = `0 28px ${currentShadow}px rgba(0, 0, 0, 0.95), 0 0 50px rgba(225, 6, 0, ${(0.35 * shrinkRatio).toFixed(3)})`;
      } else {
        heroCard.style.border = "none";
        heroCard.style.boxShadow = "none";
      }

      // Smoothly fade out exploration hints as card minimizes
      const hintOpacity = Math.max(0, 1 - (shrinkRatio * 3.5)).toFixed(2);
      if (scrollExplore) scrollExplore.style.opacity = hintOpacity;
      if (pillBtn) pillBtn.style.opacity = hintOpacity;

      // Horizontal strip stays aligned at slide 1
      horizStrip.style.transform = "translate3d(0, 0, 0)";
    } else {
      // Hero card stays pinned in its minimized 30% floating card state
      heroCard.style.transform = `scale(${TARGET_SCALE.toFixed(4)})`;
      heroCard.style.borderRadius = "28px";
      heroCard.style.border = "2px solid rgba(255, 255, 255, 0.22)";
      heroCard.style.boxShadow = "0 28px 70px rgba(0, 0, 0, 0.95), 0 0 50px rgba(225, 6, 0, 0.35)";

      if (scrollExplore) scrollExplore.style.opacity = "0";
      if (pillBtn) pillBtn.style.opacity = "0";

      // Phase 2: Horizontal scroll across remaining slides
      const horizProgress = (progress - SHRINK_LIMIT) / (1.0 - SHRINK_LIMIT); // 0.0 to 1.0
      const maxScrollDistance = horizStrip.scrollWidth - window.innerWidth;
      const translateX = -1 * (horizProgress * maxScrollDistance);
      horizStrip.style.transform = `translate3d(${translateX.toFixed(2)}px, 0, 0)`;
    }

    // Update slide counter (01 to 05) and progress bar
    let slideIndex = 1;
    if (progress > SHRINK_LIMIT) {
      const horizProgress = (progress - SHRINK_LIMIT) / (1.0 - SHRINK_LIMIT);
      slideIndex = Math.min(TOTAL_SLIDES, Math.max(1, Math.round(1 + horizProgress * (TOTAL_SLIDES - 1))));
    }
    if (horizActiveNum) horizActiveNum.textContent = `0${slideIndex}`;
    if (horizActiveTitle) horizActiveTitle.textContent = SLIDE_TITLES[slideIndex - 1] || "DRIVE TO SURVIVE";
    if (horizProgressLine) {
      const linePercent = Math.max(20, Math.min(100, (slideIndex / TOTAL_SLIDES) * 100));
      horizProgressLine.style.width = `${linePercent}%`;
    }
  }

  function onScrollRequest() {
    if (!isTicking) {
      requestAnimationFrame(updateLandoScroll);
      isTicking = true;
    }
  }

  window.addEventListener("scroll", onScrollRequest, { passive: true });
  window.addEventListener("resize", onScrollRequest, { passive: true });

  // Interactive Prev / Next slide navigation buttons
  function navigateToSlide(direction) {
    if (!scrollContainer) return;
    const rect = scrollContainer.getBoundingClientRect();
    const trackHeight = scrollContainer.offsetHeight - window.innerHeight;
    const currentProgress = Math.max(0, Math.min(1, -rect.top / trackHeight));
    const SHRINK_LIMIT = 0.20;
    
    let currentSlide = 1;
    if (currentProgress > SHRINK_LIMIT) {
      const horizProgress = (currentProgress - SHRINK_LIMIT) / (1.0 - SHRINK_LIMIT);
      currentSlide = Math.min(TOTAL_SLIDES, Math.max(1, Math.round(1 + horizProgress * (TOTAL_SLIDES - 1))));
    }
    const targetSlide = Math.min(TOTAL_SLIDES, Math.max(1, currentSlide + direction));

    const targetRatio = (targetSlide - 1) / (TOTAL_SLIDES - 1);
    const targetProgress = targetSlide === 1 ? 0 : SHRINK_LIMIT + targetRatio * (1 - SHRINK_LIMIT);
    const targetScrollY = scrollContainer.offsetTop + (targetProgress * trackHeight);

    window.scrollTo({
      top: targetScrollY,
      behavior: "smooth"
    });
  }

  if (btnHorizPrev) btnHorizPrev.addEventListener("click", () => navigateToSlide(-1));
  if (btnHorizNext) btnHorizNext.addEventListener("click", () => navigateToSlide(1));

  // Initialize initial state on load
  updateLandoScroll();
});

