/* ===================== AUSTRALIAN GP COUNTDOWN ===================== */
/* Set the exact date & time for the next Australian GP here.
   Use format: YYYY-MM-DDTHH:MM:SS
   Example time below: 6 April 2025 • 15:00 local time
*/

const nextRaceDate = new Date("2025-04-06T15:00:00");

// Update visible labels in the panel
const raceNameEl = document.getElementById("raceName");
const raceDateEl = document.getElementById("raceDate");

if (raceNameEl) raceNameEl.textContent = "Australian Grand Prix";
if (raceDateEl) raceDateEl.textContent = "06 April 2025 • 15:00 (Local Time)";

// Timer DOM elements
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

function updateCountdown() {
    const now = new Date();
    const diff = nextRaceDate - now;

    if (diff <= 0) {
        daysEl.textContent = "90";
        hoursEl.textContent = "02";
        minutesEl.textContent = "03";
        secondsEl.textContent = "55";
        return;
    }

    const totalSeconds = Math.floor(diff / 1000);

    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
}

// Start countdown
updateCountdown();
setInterval(updateCountdown, 1000);


/* ===================== PARALLAX HERO MOVEMENT ===================== */

const hero = document.querySelector(".hero");

if (hero) {
    document.addEventListener("mousemove", (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 16;
        const y = (e.clientY / window.innerHeight - 0.5) * 10;
        hero.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    document.addEventListener("mouseleave", () => {
        hero.style.transform = "translate3d(0,0,0)";
    });
}


/* ===================== REVEAL ANIMATION ON SCROLL ===================== */

window.addEventListener("load", () => {
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((el, i) => {
        if (!el.style.animationDelay) {
            el.style.animationDelay = `${i * 0.06}s`;
        }
        el.getBoundingClientRect(); // trigger reflow
        el.classList.add("visible");
    });
});
