const ORS_KEY =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjZjZDRiMzVmYWU0OTQ0NGE5ZDYxM2JhODlkZTI0MmQzIiwiaCI6Im11cm11cjY0In0=";
const ORS_BASE = "https://api.openrouteservice.org";
const map = L.map("map", { zoomControl: false }).setView(
  [22.5726, 88.3639],
  11,
);
L.control.zoom({ position: "bottomleft" }).addTo(map);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);
let startMarker = null,
  endMarker = null,
  straightLayer = null,
  gpsMarker = null;
let routeLayers = [];
let allRoutes = [];
let selectedRouteIndex = 0;
let startCoords = null,
  endCoords = null,
  clickState = "start";
let voiceEnabled = true,
  navSteps = [],
  navIndex = 0;
let watchId = null,
  liveTracking = false,
  routeLatLngs = [],
  userTrail = [],
  userTrailLayer = null;
let lastSpokenStep = -1,
  hasArrived = false,
  rerouting = false,
  lastOffRouteWarning = 0;
let stepVoiceStage = {},
  currentLiveCoords = null;
let reroutingNow = false;
let routeSummary = null;
let currentInstructionIndex = 0;

let lastLivePosition = null;
let currentHeading = 0;
let mapRotation = 0;

let snappedUserCoords = null;
let totalRouteDistance = 0;
let smoothedHeading = 0;

map.on("click", (e) => {
  const { lat, lng } = e.latlng;
  if (clickState === "start") {
    setStart([lat, lng], `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    clickState = "end";
    setStatus("Origin set. Click map to place destination.");
  } else {
    setEnd([lat, lng], `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    clickState = "start";
    setStatus("Destination set — press ▶ ROUTE.");
  }
});
function setStart(c, l) {
  startCoords = c;
  document.getElementById("startInp").value = l;
  placeMarker("start", c[0], c[1]);
}
function setEnd(c, l) {
  endCoords = c;
  document.getElementById("endInp").value = l;
  placeMarker("end", c[0], c[1]);
}
function swapLocations() {
  const [tc, ts, ec, es] = [
    startCoords,
    document.getElementById("startInp").value,
    endCoords,
    document.getElementById("endInp").value,
  ];
  startCoords = ec;
  document.getElementById("startInp").value = es;
  endCoords = tc;
  document.getElementById("endInp").value = ts;
  if (startCoords) placeMarker("start", startCoords[0], startCoords[1]);
  else {
    if (startMarker) {
      map.removeLayer(startMarker);
      startMarker = null;
    }
  }
  if (endCoords) placeMarker("end", endCoords[0], endCoords[1]);
  else {
    if (endMarker) {
      map.removeLayer(endMarker);
      endMarker = null;
    }
  }
}
function gpsArrowIcon(heading = 0) {
  return L.divIcon({
    className: "",
    html: `
        <div style="
            position: relative;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <div style="
                position:absolute;
                width:44px;
                height:44px;
                border-radius:50%;
                background:rgba(59,130,246,.15);
                border:2px solid rgba(59,130,246,.35);
                animation:gps-pulse 1.6s ease-out infinite;
            "></div>

            <div style="
                width: 0;
                height: 0;
                border-left: 11px solid transparent;
                border-right: 11px solid transparent;
                border-bottom: 24px solid #3b82f6;
                transform: rotate(${heading}deg);
                transform-origin: center 75%;
                filter: drop-shadow(0 2px 8px rgba(59,130,246,.8));
            "></div>

            <div style="
                position:absolute;
                width:8px;
                height:8px;
                border-radius:50%;
                background:#fff;
                bottom:10px;
                left:50%;
                transform:translateX(-50%);
            "></div>
        </div>
        `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function gpsIcon() {
  return L.divIcon({
    className: "",
    html: `
        <div style="position:relative;width:24px;height:24px">
            <div style="position:absolute;inset:0;border-radius:50%;
                background:rgba(59,130,246,.2);border:2px solid #3b82f6;
                animation:gps-pulse 1.6s ease-out infinite"></div>
            <div style="position:absolute;top:50%;left:50%;
                transform:translate(-50%,-50%);width:10px;height:10px;
                border-radius:50%;background:#3b82f6;border:2px solid #fff;
                box-shadow:0 1px 8px rgba(59,130,246,.8)"></div>
        </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function useMyLocation() {
  if (!navigator.geolocation) {
    setStatus("Geolocation not supported.", "err");
    return;
  }

  const btn = document.getElementById("gpsBtn");
  btn.classList.add("locating");
  btn.innerHTML = '<i class="fa-solid fa-spinner"></i>';

  setStatus("Acquiring location…", "", true);

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      btn.classList.remove("locating");
      btn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';

      const { latitude: lat, longitude: lon, accuracy } = pos.coords;
      let label = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;

      try {
        const r = await fetch(
          `${ORS_BASE}/geocode/reverse?api_key=${ORS_KEY}&point.lat=${lat}&point.lon=${lon}&size=1`,
        );
        if (r.ok) {
          const d = await r.json();
          if (d.features && d.features[0]) {
            label = d.features[0].properties.label || label;
          }
        }
      } catch (_) {}

      setStart([lat, lon], label);
      map.setView([lat, lon], 14);

      if (gpsMarker) map.removeLayer(gpsMarker);

      gpsMarker = L.marker([lat, lon], {
        icon: gpsIcon(),
      })
        .bindPopup(
          `<b>Your location</b><br><small>±${Math.round(accuracy)}m</small>`,
        )
        .addTo(map);

      setStatus(`Located (±${Math.round(accuracy)}m) — set as origin.`, "ok");
    },
    (err) => {
      btn.classList.remove("locating");
      btn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';

      const m = {
        1: "Permission denied.",
        2: "Location unavailable.",
        3: "Timed out.",
      };

      setStatus(m[err.code] || "Could not get location.", "err");
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    },
  );
}
function placeMarker(type, lat, lon) {
  const color = type === "start" ? "#22c55e" : "#ff5c1a";
  const ic = L.divIcon({
    className: "",
    html: `<div style="width:15px;height:15px;border-radius:50%;background:${color};border:3px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.6)"></div>`,
    iconSize: [15, 15],
    iconAnchor: [7, 7],
  });
  if (type === "start") {
    if (startMarker) map.removeLayer(startMarker);
    startMarker = L.marker([lat, lon], { icon: ic })
      .bindTooltip("<b>ORIGIN</b>")
      .addTo(map);
  } else {
    if (endMarker) map.removeLayer(endMarker);
    endMarker = L.marker([lat, lon], { icon: ic })
      .bindTooltip("<b>DESTINATION</b>")
      .addTo(map);
  }
}
function toggleTheme() {
  const html = document.documentElement;
  const themeBtn = document.getElementById("themeBtn");

  const isDark = html.getAttribute("data-theme") === "dark";
  const newTheme = isDark ? "light" : "dark";

  html.setAttribute("data-theme", newTheme);

  themeBtn.innerHTML =
    newTheme === "dark"
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
}
function toggleVoice() {
  const btn = document.getElementById("voiceBtn");

  voiceEnabled = !voiceEnabled;
  btn.classList.toggle("active", !voiceEnabled);

  btn.innerHTML = voiceEnabled
    ? '<i class="fa-solid fa-volume-high"></i>'
    : '<i class="fa-solid fa-volume-xmark"></i>';

  setStatus(
    voiceEnabled ? "Voice enabled." : "Voice disabled.",
    voiceEnabled ? "ok" : "warn",
  );

  if (!voiceEnabled) {
    window.speechSynthesis.cancel();
  }
}
function speakText(text) {
  if (!voiceEnabled || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1;
  u.pitch = 1;
  u.volume = 1;
  u.lang = "en-US";
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) {
    const v =
      voices.find((v) => v.lang === "en-US") ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];
    if (v) u.voice = v;
  }
  window.speechSynthesis.speak(u);
}
window.speechSynthesis.onvoiceschanged = () =>
  window.speechSynthesis.getVoices();
function cleanInstruction(t) {
  return t
    .replace(/<[^>]*>/g, "")
    .replace(/\bonto\b/gi, "on to")
    .replace(/\brd\b/gi, "road")
    .replace(/\bst\b/gi, "street")
    .replace(/\bave\b/gi, "avenue")
    .replace(/\s+/g, " ")
    .trim();
}
function nextVoiceStep() {
  if (!navSteps.length) {
    setStatus("No route available.", "err");
    return;
  }
  navIndex++;
  if (navIndex >= navSteps.length) {
    speakText("You have reached the final step.");
    setStatus("No more steps.", "warn");
    return;
  }
  highlightCurrentStep(navIndex);
  const s = navSteps[navIndex];
  speakText(
    `${cleanInstruction(s.instruction)}. Continue for ${fmtDist(s.distance * 1000)}.`,
  );
}
function startLiveNavigation() {
  document.body.classList.add("nav-mode");

  if (liveTracking) {
    stopLiveNavigation();
    setStatus("Navigation stopped.", "warn");
    speakText("Navigation stopped.");
    document.getElementById("navBtn").innerHTML =
      '<i class="fa-solid fa-location-arrow"></i> NAVIGATION';
    return;
  }

  if (!routeLatLngs.length || !navSteps.length) {
    setStatus("Please generate a route first.", "err");
    return;
  }

  if (!navigator.geolocation) {
    setStatus("Geolocation not supported.", "err");
    return;
  }

  stopLiveNavigation();

  liveTracking = true;
  navIndex = 0;
  lastSpokenStep = -1;
  hasArrived = false;
  stepVoiceStage = {};
  userTrail = [];
  lastLivePosition = null;
  smoothedHeading = 0;
  currentHeading = 0;

  document.getElementById("navBtn").innerHTML =
    '<i class="fa-solid fa-stop"></i> STOP NAV';

  if (userTrailLayer) {
    map.removeLayer(userTrailLayer);
    userTrailLayer = null;
  }

  setStatus("Live navigation started…", "ok");
  speakText("Live navigation started.");
  showNavBanner();

  if (navSteps.length > 0) {
    const first = navSteps[0];
    updateNavBanner(
      cleanInstruction(first.instruction),
      first.name !== "-" ? first.name : "Continue on route",
      ICONS[first.type] || "↑",
      routeSummary ? fmtDist(routeSummary.distance * 1000) : "—",
      routeSummary ? fmtDur(routeSummary.duration) : "—",
      "0%",
    );
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;

      // Immediately show real current position
      updateLivePosition(lat, lon, accuracy);

      // If user is far from typed start, reroute from live location
      if (endCoords) {
        const distFromStart = startCoords
          ? distanceMeters(lat, lon, startCoords[0], startCoords[1])
          : Infinity;

        if (distFromStart > 100) {
          startCoords = [lat, lon];
          document.getElementById("startInp").value =
            `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
          placeMarker("start", lat, lon);

          setStatus("Using your live location as origin…", "warn", true);
          await findPath();
        }
      }

      watchId = navigator.geolocation.watchPosition(
        (pos) =>
          updateLivePosition(
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.accuracy,
          ),
        (err) => setStatus("GPS error: " + err.message, "err"),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 },
      );
    },
    (err) => {
      setStatus("GPS error: " + err.message, "err");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  );
}

function stopLiveNavigation() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  liveTracking = false;
  document.body.classList.remove("nav-mode");
  document.getElementById("navBtn").innerHTML =
    '<i class="fa-solid fa-location-arrow"></i> NAVIGATION';
  hideNavBanner();

  // Reset map rotation
  document.getElementById("map").style.transform = "rotate(0deg)";
}

function updateLivePosition(lat, lon, accuracy) {
  if (!liveTracking) return;

  // 1) Calculate movement heading from REAL GPS
  if (lastLivePosition) {
    const [prevLat, prevLon] = lastLivePosition;
    const moveDist = distanceMeters(prevLat, prevLon, lat, lon);

    if (moveDist > 3) {
      const rawHeading = calculateHeading(prevLat, prevLon, lat, lon);
      currentHeading = smoothHeading(rawHeading);
    }
  }

  lastLivePosition = [lat, lon];

  // 2) Keep real live coords
  currentLiveCoords = [lat, lon];

  // 3) Snap ONLY for navigation calculations (not for marker display)
  if (routeLatLngs.length > 0) {
    snappedUserCoords = snapToRoute(lat, lon);
  } else {
    snappedUserCoords = [lat, lon];
  }

  // 4) Show REAL GPS marker (not snapped marker)
  if (gpsMarker) map.removeLayer(gpsMarker);

  gpsMarker = L.marker([lat, lon], {
    icon: gpsArrowIcon(currentHeading),
  })
    .bindPopup(
      `<b>Live location</b><br><small>±${Math.round(accuracy)}m</small>`,
    )
    .addTo(map);

  // 5) Trail should also use REAL movement
  userTrail.push([lat, lon]);

  if (userTrailLayer) map.removeLayer(userTrailLayer);
  userTrailLayer = L.polyline(userTrail, {
    color: "#22c55e",
    weight: 4,
    opacity: 0.85,
  }).addTo(map);

  // 6) Follow real user
  map.setView([lat, lon], 17);
  rotateMapToHeading(currentHeading);

  // 7) Navigation logic can still use real GPS
  checkNavigationProgress(lat, lon);
}
function distanceToStepEnd(uLat, uLon, step) {
  if (!step.way_points || step.way_points.length < 2) return Infinity;
  const ep = step.way_points[1];
  if (!routeLatLngs[ep]) return Infinity;
  const [sLat, sLon] = routeLatLngs[ep];
  return distanceMeters(uLat, uLon, sLat, sLon);
}
function handleStepVoiceGuidance(uLat, uLon) {
  if (navIndex >= navSteps.length) return;

  const step = navSteps[navIndex];
  const key = `step_${navIndex}`;
  const remainingRoute = getRemainingRouteDistance(uLat, uLon);
  const progressPercent =
    totalRouteDistance > 0
      ? Math.min(
          100,
          Math.max(
            0,
            ((totalRouteDistance - remainingRoute) / totalRouteDistance) * 100,
          ),
        )
      : 0;

  const avgSpeedMps = routeSummary
    ? (routeSummary.distance * 1000) / routeSummary.duration
    : 0;
  const remainingEtaSec = avgSpeedMps > 0 ? remainingRoute / avgSpeedMps : 0;

  if (!stepVoiceStage[key]) {
    stepVoiceStage[key] = {
      intro: false,
      m100: false,
      m50: false,
      now: false,
    };
  }

  const st = stepVoiceStage[key];
  const spoken = cleanInstruction(step.instruction);
  const dist = distanceToStepEnd(uLat, uLon, step);

  // Live banner update
  const remainingEta = routeSummary
    ? fmtDur(Math.max(0, routeSummary.duration - navIndex * 30))
    : "—";

  updateNavBanner(
    spoken,
    step.name !== "-" ? step.name : "Continue on route",
    ICONS[step.type] || "↑",
    fmtDist(remainingRoute),
    fmtDur(remainingEtaSec),
    `${Math.round(progressPercent)}%`,
  );

  setStatus(`Next: ${spoken} in ${fmtDist(dist)}`, "ok");

  if (!st.intro) {
    speakText(`${spoken}. Continue for ${fmtDist(step.distance * 1000)}.`);
    highlightCurrentStep(navIndex);
    st.intro = true;
    return;
  }

  if (dist <= 100 && dist > 50 && !st.m100) {
    speakText(`In 100 meters, ${spoken}`);
    st.m100 = true;
    return;
  }

  if (dist <= 50 && dist > 15 && !st.m50) {
    speakText(`In 50 meters, ${spoken}`);
    st.m50 = true;
    return;
  }

  if (dist <= 15 && !st.now) {
    speakText(`${spoken} now`);
    st.now = true;
    return;
  }
}
async function autoReroute(uLat, uLon) {
  if (rerouting || !endCoords) return;
  rerouting = true;
  setStatus("Off route. Re-routing…", "warn");
  speakText("You are off route. Re-routing now.");
  try {
    startCoords = [uLat, uLon];
    document.getElementById("startInp").value =
      `${uLat.toFixed(5)}, ${uLon.toFixed(5)}`;
    placeMarker("start", uLat, uLon);
    navIndex = 0;
    lastSpokenStep = -1;
    stepVoiceStage = {};
    hasArrived = false;
    await findPath();
    setTimeout(() => {
      if (liveTracking) speakText("New route ready.");
    }, 1200);
  } catch (err) {
    console.error("Reroute failed:", err);
    setStatus("Re-routing failed.", "err");
  }
  rerouting = false;
}
function checkNavigationProgress(uLat, uLon) {
  if (!routeLatLngs.length || !navSteps.length || hasArrived) return;

  currentLiveCoords = [uLat, uLon];

  const navLat = snappedUserCoords ? snappedUserCoords[0] : uLat;
  const navLon = snappedUserCoords ? snappedUserCoords[1] : uLon;

  // Check if user is off-route
  const { minDist } = nearestRoutePointIndex(uLat, uLon, routeLatLngs);
  if (minDist > 60) {
    const now = Date.now();
    if (now - lastOffRouteWarning > 8000) {
      lastOffRouteWarning = now;
      autoReroute(uLat, uLon);
    }
    return;
  }

  // Check if destination reached
  const destDist = distanceToDestination(navLat, navLon);
  if (destDist < 25) {
    hasArrived = true;

    updateNavBanner(
      "You have arrived",
      "Destination reached successfully",
      "🏁",
      "0 m",
      "0 min",
      "100%",
    );

    setStatus("You have arrived!", "ok");
    speakText("You have arrived at your destination.");

    setTimeout(() => stopLiveNavigation(), 2500);
    return;
  }

  // Voice guidance + banner updates
  handleStepVoiceGuidance(navLat, navLon);

  // Step auto advance
  if (navIndex < navSteps.length) {
    const step = navSteps[navIndex];

    if (shouldAdvanceStep(navLat, navLon, step)) {
      navIndex++;
      highlightCurrentStep(navIndex);

      if (navIndex < navSteps.length) {
        const nx = navSteps[navIndex];

        const remainingRoute = getRemainingRouteDistance(navLat, navLon);
        const progressPercent =
          totalRouteDistance > 0
            ? Math.min(
                100,
                Math.max(
                  0,
                  ((totalRouteDistance - remainingRoute) / totalRouteDistance) *
                    100,
                ),
              )
            : 0;

        const avgSpeedMps = routeSummary
          ? (routeSummary.distance * 1000) / routeSummary.duration
          : 0;
        const remainingEtaSec =
          avgSpeedMps > 0 ? remainingRoute / avgSpeedMps : 0;

        updateNavBanner(
          cleanInstruction(nx.instruction),
          nx.name !== "-" ? nx.name : "Continue on route",
          ICONS[nx.type] || "↑",
          fmtDist(remainingRoute),
          fmtDur(remainingEtaSec),
          `${Math.round(progressPercent)}%`,
        );

        setTimeout(() => {
          speakText(`Next: ${cleanInstruction(nx.instruction)}`);
        }, 1000);
      }
    }
  }
}
function shouldAdvanceStep(uLat, uLon, step) {
  if (!step.way_points || step.way_points.length < 2) return false;
  const ep = step.way_points[1];
  if (!routeLatLngs[ep]) return false;
  const [sLat, sLon] = routeLatLngs[ep];
  return distanceMeters(uLat, uLon, sLat, sLon) < 30;
}
function highlightCurrentStep(idx) {
  document.querySelectorAll(".step").forEach((el, i) => {
    el.style.background = i === idx ? "rgba(59,130,246,.15)" : "";
    el.style.borderLeft = i === idx ? "3px solid #3b82f6" : "";
  });
}
function haversine(la1, lo1, la2, lo2) {
  const R = 6371,
    dL = ((la2 - la1) * Math.PI) / 180,
    dO = ((lo2 - lo1) * Math.PI) / 180;
  const a =
    Math.sin(dL / 2) ** 2 +
    Math.cos((la1 * Math.PI) / 180) *
      Math.cos((la2 * Math.PI) / 180) *
      Math.sin(dO / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function distanceMeters(la1, lo1, la2, lo2) {
  return haversine(la1, lo1, la2, lo2) * 1000;
}
function calculateHeading(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);
  lat1 = toRad(lat1);
  lat2 = toRad(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}
function smoothHeading(newHeading) {
  const diff = ((((newHeading - smoothedHeading) % 360) + 540) % 360) - 180;
  smoothedHeading = (smoothedHeading + diff * 0.22 + 360) % 360;
  return smoothedHeading;
}
function rotateMapToHeading(heading) {
  const mapEl = document.getElementById("map");
  mapRotation = -heading;
  mapEl.style.transform = `rotate(${mapRotation}deg)`;
}
function nearestRoutePointIndex(uLat, uLon, route) {
  let minDist = Infinity,
    nearestIndex = 0;
  for (let i = 0; i < route.length; i++) {
    const [lat, lon] = route[i];
    const d = distanceMeters(uLat, uLon, lat, lon);
    if (d < minDist) {
      minDist = d;
      nearestIndex = i;
    }
  }
  return { nearestIndex, minDist };
}
function snapToRoute(uLat, uLon) {
  if (!routeLatLngs.length) return [uLat, uLon];

  const { nearestIndex } = nearestRoutePointIndex(uLat, uLon, routeLatLngs);
  return routeLatLngs[nearestIndex] || [uLat, uLon];
}
function distanceToDestination(uLat, uLon) {
  if (!endCoords) return Infinity;
  return distanceMeters(uLat, uLon, endCoords[0], endCoords[1]);
}
function getRemainingRouteDistance(uLat, uLon) {
  if (!routeLatLngs.length) return 0;

  const { nearestIndex } = nearestRoutePointIndex(uLat, uLon, routeLatLngs);

  let remaining = 0;

  for (let i = nearestIndex; i < routeLatLngs.length - 1; i++) {
    const [lat1, lon1] = routeLatLngs[i];
    const [lat2, lon2] = routeLatLngs[i + 1];
    remaining += distanceMeters(lat1, lon1, lat2, lon2);
  }

  return remaining;
}
class MinHeap {
  constructor() {
    this.h = [];
  }
  push(p, v) {
    this.h.push([p, v]);
    this._up(this.h.length - 1);
  }
  pop() {
    const t = this.h[0],
      l = this.h.pop();
    if (this.h.length) {
      this.h[0] = l;
      this._down(0);
    }
    return t;
  }
  get size() {
    return this.h.length;
  }
  _up(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.h[p][0] > this.h[i][0]) {
        [this.h[p], this.h[i]] = [this.h[i], this.h[p]];
        i = p;
      } else break;
    }
  }
  _down(i) {
    const n = this.h.length;
    while (true) {
      let s = i,
        l = 2 * i + 1,
        r = 2 * i + 2;
      if (l < n && this.h[l][0] < this.h[s][0]) s = l;
      if (r < n && this.h[r][0] < this.h[s][0]) s = r;
      if (s !== i) {
        [this.h[s], this.h[i]] = [this.h[i], this.h[s]];
        i = s;
      } else break;
    }
  }
}

function dijkstra(adj, src, dst) {
  const dist = new Map(),
    prev = new Map(),
    vis = new Set(),
    pq = new MinHeap();
  dist.set(src, 0);
  pq.push(0, src);
  while (pq.size) {
    const [d, u] = pq.pop();
    if (vis.has(u)) continue;
    vis.add(u);
    if (u === dst) break;
    for (const [v, w] of adj.get(u) || []) {
      const nd = d + w;
      if (!dist.has(v) || nd < dist.get(v)) {
        dist.set(v, nd);
        prev.set(v, u);
        pq.push(nd, v);
      }
    }
  }
  return { prev, visited: vis.size };
}
function astar(adj, src, dst, coords) {
  const g = new Map(),
    prev = new Map(),
    vis = new Set(),
    pq = new MinHeap();
  const h = (id) => {
    const a = coords.get(id),
      b = coords.get(dst);
    return a && b ? haversine(a[0], a[1], b[0], b[1]) : 0;
  };
  g.set(src, 0);
  pq.push(h(src), src);
  while (pq.size) {
    const [, u] = pq.pop();
    if (vis.has(u)) continue;
    vis.add(u);
    if (u === dst) break;
    for (const [v, w] of adj.get(u) || []) {
      const ng = (g.get(u) || 0) + w;
      if (!g.has(v) || ng < g.get(v)) {
        g.set(v, ng);
        prev.set(v, u);
        pq.push(ng + h(v), v);
      }
    }
  }
  return { prev, visited: vis.size };
}
function bfs(adj, src, dst) {
  const prev = new Map(),
    vis = new Set([src]),
    q = [src];
  let head = 0;
  while (head < q.length) {
    const u = q[head++];
    if (u === dst) break;
    for (const [v] of adj.get(u) || []) {
      if (!vis.has(v)) {
        vis.add(v);
        prev.set(v, u);
        q.push(v);
      }
    }
  }
  return { prev, visited: vis.size };
}
function reconstructPath(prev, src, dst) {
  const p = [];
  let c = dst;
  while (c !== undefined) {
    p.unshift(c);
    if (c === src) return p;
    c = prev.get(c);
  }
  return null;
}
const acT = {};
function setupAC(inpId, dropId, onPick) {
  const inp = document.getElementById(inpId),
    drop = document.getElementById(dropId);
  inp.addEventListener("input", () => {
    clearTimeout(acT[inpId]);
    const q = inp.value.trim();
    if (q.length < 2) {
      drop.style.display = "none";
      return;
    }
    acT[inpId] = setTimeout(async () => {
      try {
        const r = await fetch(
          `${ORS_BASE}/geocode/autocomplete?api_key=${ORS_KEY}&text=${encodeURIComponent(q)}&size=6`,
        );
        if (!r.ok) throw new Error(`AC ${r.status}`);
        const data = await r.json(),
          feats = data.features || [];
        drop.innerHTML = "";
        if (!feats.length) {
          drop.style.display = "none";
          return;
        }
        for (const f of feats) {
          const name = f.properties.name || "",
            label = f.properties.label || "";
          const [lon, lat] = f.geometry.coordinates;
          const div = document.createElement("div");
          div.className = "ac-item";
          div.innerHTML = `<b>${name}</b><span>${label}</span>`;
          div.addEventListener("mousedown", (e) => {
            e.preventDefault();
            inp.value = label;
            onPick([lat, lon]);
            drop.style.display = "none";
          });
          drop.appendChild(div);
        }
        drop.style.display = "block";
      } catch (e) {
        drop.style.display = "none";
        console.error("Autocomplete failed:", e);
      }
    }, 350);
  });
  inp.addEventListener("blur", () =>
    setTimeout(() => (drop.style.display = "none"), 200),
  );
  inp.addEventListener("focus", () => {
    if (drop.children.length) drop.style.display = "block";
  });
}
setupAC("startInp", "startDrop", (c) => {
  startCoords = c;
  placeMarker("start", c[0], c[1]);
  map.setView(c, 13);
});
setupAC("endInp", "endDrop", (c) => {
  endCoords = c;
  placeMarker("end", c[0], c[1]);
});
async function geocodeFallback(text) {
  const r = await fetch(
    `${ORS_BASE}/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(text)}&size=1`,
  );
  if (!r.ok) throw new Error(`Geocoding failed (${r.status})`);
  const data = await r.json();
  if (!data.features || !data.features.length)
    throw new Error(`Cannot find: "${text}"`);
  const f = data.features[0];
  return [f.geometry.coordinates[1], f.geometry.coordinates[0]];
}
async function callOrs(body, mode) {
  const res = await fetch(`${ORS_BASE}/v2/directions/${mode}/geojson`, {
    method: "POST",
    headers: {
      Authorization: ORS_KEY,
      "Content-Type": "application/json",
      Accept: "application/json,application/geo+json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Invalid API key.");
    if (res.status === 403) throw new Error("Access denied or quota exceeded.");
    if (res.status === 429)
      throw new Error("Too many requests. Try again later.");
    if (res.status >= 500)
      throw new Error("Routing server temporarily unavailable.");
    const ed = await res.json().catch(() => ({}));
    throw new Error(
      ed.error?.message || ed.message || `ORS error ${res.status}`,
    );
  }
  return res;
}
function fmtDist(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}
function fmtDur(s) {
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m} min`;
  return `${Math.round(s)}s`;
}
const ICONS = {
  0: "🏁",
  1: "↑",
  2: "↗",
  3: "→",
  4: "↘",
  5: "↓",
  6: "↙",
  7: "←",
  8: "↖",
  10: "⤴",
  11: "⤵",
  12: "🔄",
  13: "↑",
  14: "⛴",
  15: "⛳",
};
function showNavBanner() {
  document.getElementById("navBanner").classList.add("active");
}

function hideNavBanner() {
  document.getElementById("navBanner").classList.remove("active");
}

function updateNavBanner(
  primary,
  secondary = "",
  icon = "↑",
  dist = "—",
  eta = "—",
  progress = "0%",
) {
  document.getElementById("navPrimary").textContent = primary || "Continue";
  document.getElementById("navSecondary").textContent = secondary || "";
  document.getElementById("navIcon").textContent = icon || "↑";
  document.getElementById("navDistChip").textContent = dist || "—";
  document.getElementById("navEtaChip").textContent = eta || "—";
  document.getElementById("navProgressChip").textContent = progress || "0%";
}

async function findPath() {
  const startTxt = document.getElementById("startInp").value.trim();
  const endTxt = document.getElementById("endInp").value.trim();
  const algo = document.getElementById("algoSel").value;
  const mode = document.getElementById("modeSel").value;
  const pref = document.getElementById("prefSel").value;
  if (!startTxt || !endTxt) {
    setStatus("Enter both origin and destination.", "err");
    return;
  }
  document.getElementById("findBtn").disabled = true;
  window.speechSynthesis.cancel();
  stopLiveNavigation();
  document.getElementById("infoBar").style.display = "none";
  routeLayers.forEach((l) => map.removeLayer(l));
  routeLayers = [];
  allRoutes = [];
  selectedRouteIndex = 0;
  if (straightLayer) {
    map.removeLayer(straightLayer);
    straightLayer = null;
  }
  try {
    setStatus("Geocoding locations…", "", true);
    if (!startCoords) {
      startCoords = await geocodeFallback(startTxt);
      placeMarker("start", startCoords[0], startCoords[1]);
    }
    if (!endCoords) {
      endCoords = await geocodeFallback(endTxt);
      placeMarker("end", endCoords[0], endCoords[1]);
    }
    const [sLat, sLon] = startCoords,
      [eLat, eLon] = endCoords;
    const crow = haversine(sLat, sLon, eLat, eLon);
    straightLayer = L.polyline(
      [
        [sLat, sLon],
        [eLat, eLon],
      ],
      { color: "#ff5c1a", weight: 2, dashArray: "6 5", opacity: 0.4 },
    ).addTo(map);
    map.fitBounds(
      [
        [sLat, sLon],
        [eLat, eLon],
      ],
      { padding: [60, 60] },
    );
    setStatus(
      `Crow-flies: ${crow.toFixed(1)} km — Fetching road route…`,
      "",
      true,
    );

    const orsBody = {
      coordinates: [
        [sLon, sLat],
        [eLon, eLat],
      ],
      preference: pref,
      geometry: true,
      instructions: true,
      units: "km",
      language: "en",
    };

    if (crow <= 120) {
      orsBody.alternative_routes = {
        target_count: 2,
        share_factor: 0.6,
        weight_factor: 1.4,
      };
    }
    // const orsRes = await callOrs(orsBody, mode); const orsData = await orsRes.json();
    let orsRes, orsData;

    try {
      orsRes = await callOrs(orsBody, mode);
      orsData = await orsRes.json();
    } catch (err) {
      // Retry without alternative routes if server rejects long request
      if (orsBody.alternative_routes) {
        delete orsBody.alternative_routes;
        setStatus(
          "Alternative routes too long. Retrying with main route only…",
          "warn",
          true,
        );

        orsRes = await callOrs(orsBody, mode);
        orsData = await orsRes.json();
      } else {
        throw err;
      }
    }
    const features = orsData.features;
    if (!features || !features.length) throw new Error("No route found.");

    allRoutes = features.map((feature, idx) => {
      const summary = feature.properties.summary;
      const segments = feature.properties.segments;
      const rawCoords = feature.geometry.coordinates;
      const latLngs = rawCoords.map(([lon, lat]) => [lat, lon]);

      return {
        summary,
        segments,
        rawCoords,
        latLngs,
        feature,
        idx,
      };
    });

    const primaryRoute = allRoutes[0];
    const summary = primaryRoute.summary;
    const rawCoords = primaryRoute.rawCoords;

    routeSummary = summary;
    totalRouteDistance = summary.distance * 1000;

    const algoNames = { dijkstra: "Dijkstra", astar: "A*", bfs: "BFS" };
    setStatus(
      `${rawCoords.length.toLocaleString()} pts — running ${algoNames[algo]}…`,
      "",
      true,
    );

    const adj = new Map(),
      coords = new Map();

    for (let i = 0; i < rawCoords.length; i++) {
      const [lon, lat] = rawCoords[i];
      coords.set(i, [lat, lon]);
      adj.set(i, []);
    }

    for (let i = 0; i < rawCoords.length - 1; i++) {
      const [aL, aO] = coords.get(i),
        [bL, bO] = coords.get(i + 1);
      const d = haversine(aL, aO, bL, bO);
      adj.get(i).push([i + 1, d]);
      adj.get(i + 1).push([i, d]);
    }

    const t0 = performance.now();
    let result;

    if (algo === "dijkstra") result = dijkstra(adj, 0, rawCoords.length - 1);
    else if (algo === "astar")
      result = astar(adj, 0, rawCoords.length - 1, coords);
    else result = bfs(adj, 0, rawCoords.length - 1);

    const execMs = (performance.now() - t0).toFixed(2);
    const path = reconstructPath(result.prev, 0, rawCoords.length - 1);

    if (!path) throw new Error("Could not reconstruct path.");
    routeLayers.forEach((l) => map.removeLayer(l));
    routeLayers = [];

    allRoutes.forEach((r, i) => {
      const layer = L.polyline(r.latLngs, {
        color: i === 0 ? "#3b82f6" : i === 1 ? "#22c55e" : "#f59e0b",
        weight: i === 0 ? 6 : 4,
        opacity: i === 0 ? 0.95 : 0.55,
        lineJoin: "round",
        lineCap: "round",
        dashArray: i === 0 ? null : "8 8",
      }).addTo(map);

      layer.on("click", () => selectRoute(i));
      routeLayers.push(layer);
    });

    routeLatLngs = allRoutes[0].latLngs;
    map.fitBounds(routeLayers[0].getBounds(), { padding: [50, 50] });

    document.getElementById("routeOptions").style.display = "flex";
    updateRouteButtons();
    buildRouteCards();
    document.getElementById("i-algo").textContent = algoNames[algo];
    document.getElementById("i-dist").textContent =
      `${summary.distance.toFixed(2)} km`;
    document.getElementById("i-dur").textContent = fmtDur(summary.duration);
    document.getElementById("i-seg").textContent =
      rawCoords.length.toLocaleString();

    document.getElementById("i-seg").textContent =
      rawCoords.length.toLocaleString();

    document.getElementById("i-nodes").textContent =
      result.visited.toLocaleString();
    document.getElementById("i-exec").textContent = `${execMs}ms`;
    document.getElementById("infoBar").style.display = "block";

    buildRouteInstructions(allRoutes[0]);
    const n = rawCoords.length;
    const descs = {
      dijkstra: `<b>DIJKSTRA'S ALGORITHM</b><br>Expands minimum-cost frontier via <span class="tag">Min-Heap PQ</span>. Guarantees globally optimal path. Explored <b>${result.visited.toLocaleString()}</b>/${n.toLocaleString()} nodes. <span class="tag">O((V+E) log V)</span>`,
      astar: `<b>A* SEARCH ALGORITHM</b><br>Combines Dijkstra's cost with a <span class="tag">Haversine heuristic</span> to guide toward destination. Usually explores fewer nodes. Explored <b>${result.visited.toLocaleString()}</b>/${n.toLocaleString()} nodes.`,
      bfs: `<b>BFS — BREADTH-FIRST SEARCH</b><br>Finds path with fewest <span class="tag">segments</span>, not minimum distance. Explored <b>${result.visited.toLocaleString()}</b>/${n.toLocaleString()} nodes. <span class="tag">O(V+E)</span>`,
    };
    document.getElementById("algoBox").innerHTML = descs[algo];
    setStatus(
      `✓ ${summary.distance.toFixed(2)} km · ${fmtDur(summary.duration)} · ${algoNames[algo]} · ${execMs}ms`,
      "ok",
    );
    if (voiceEnabled)
      speakText(
        `Route ready. ${summary.distance.toFixed(1)} kilometers. ${fmtDur(summary.duration)}.`,
      );
    if (window.innerWidth <= 1000) autoOpenSidebar();
  } catch (err) {
    setStatus(`✕ ${err.message}`, "err");
    console.error(err);
  }

  document.getElementById("findBtn").disabled = false;
  if (window.innerWidth <= 650) {
    document.getElementById("mapFullscreenBtn").style.display = "flex";
  }
}
function updateRouteButtons() {
  document.querySelectorAll(".routeOptBtn").forEach((btn, i) => {
    btn.classList.toggle("active", i === selectedRouteIndex);
    btn.style.display = allRoutes[i] ? "inline-flex" : "none";
  });
}
function selectRoute(index) {
  if (!allRoutes.length || !allRoutes[index]) return;

  selectedRouteIndex = index;

  // Remove old route layers
  routeLayers.forEach((l) => map.removeLayer(l));
  routeLayers = [];

  // Draw all routes again
  allRoutes.forEach((r, i) => {
    const isSelected = i === selectedRouteIndex;

    const layer = L.polyline(r.latLngs, {
      color: isSelected ? "#3b82f6" : i === 1 ? "#22c55e" : "#f59e0b",
      weight: isSelected ? 7 : 4,
      opacity: isSelected ? 0.95 : 0.4,
      lineJoin: "round",
      lineCap: "round",
      dashArray: isSelected ? null : "8 8",
    }).addTo(map);

    layer.on("click", () => selectRoute(i));
    routeLayers.push(layer);
  });

  const chosen = allRoutes[index];

  routeLatLngs = chosen.latLngs;
  routeSummary = chosen.summary;
  totalRouteDistance = chosen.summary.distance * 1000;

  // Update route info
  document.getElementById("i-dist").textContent =
    `${chosen.summary.distance.toFixed(2)} km`;
  document.getElementById("i-dur").textContent = fmtDur(
    chosen.summary.duration,
  );

  // Update instructions for selected route
  buildRouteInstructions(chosen);

  // Update button active state
  updateRouteButtons();

  // Update card active state
  document.querySelectorAll(".route-card").forEach((card, i) => {
    card.classList.toggle("active", i === selectedRouteIndex);
  });

  // Fit map to selected route
  map.fitBounds(routeLayers[index].getBounds(), { padding: [50, 50] });

  setStatus(`Selected Route ${index + 1}`, "ok");
}

function buildRouteCards() {
  const box = document.getElementById("routeCards");
  box.innerHTML = "";

  if (!allRoutes.length) {
    box.style.display = "none";
    return;
  }

  box.style.display = "flex";

  allRoutes.forEach((route, i) => {
    const card = document.createElement("div");
    card.className = `route-card ${i === selectedRouteIndex ? "active" : ""}`;

    const mins = Math.round(route.summary.duration / 60);
    const dist = route.summary.distance.toFixed(1);

    let badge = "Alternative";
    let desc = "Good route option";

    if (i === 0) {
      badge = "Recommended";
      desc = "Best overall route";
    } else if (i === 1) {
      badge = "Faster";
      desc = "Possible time-saving route";
    } else if (i === 2) {
      badge = "Scenic";
      desc = "Alternative route option";
    }

    card.innerHTML = `
            <div class="route-top">
                <div class="route-name">Route ${i + 1}</div>
                <div class="route-badge">${badge}</div>
            </div>
            <div class="route-time">${mins} min</div>
            <div class="route-distance">${dist} km</div>
            <div class="route-desc">${desc}</div>
        `;

    card.onclick = () => selectRoute(i);
    box.appendChild(card);
  });
}
function buildRouteInstructions(route) {
  const stepList = document.getElementById("stepList");
  stepList.innerHTML = "";
  navSteps = [];
  navIndex = 0;
  stepVoiceStage = {};

  let stepNum = 0;

  for (const seg of route.segments) {
    for (const step of seg.steps) {
      navSteps.push(step);
      stepNum++;

      const div = document.createElement("div");
      div.className = "step";
      div.innerHTML = `
                <div class="step-num">${String(stepNum).padStart(2, "0")}</div>
                <div class="step-icon">${ICONS[step.type] || "↑"}</div>
                <div class="step-body">
                    <div class="step-instr">${step.instruction}</div>
                    <div class="step-meta">
                        ${fmtDist(step.distance * 1000)} · ${fmtDur(step.duration)} · ${step.name !== "-" ? step.name : "Unnamed road"}
                    </div>
                </div>
            `;

      const wp = step.way_points;
      div.addEventListener("click", () => {
        if (wp && wp.length >= 2) {
          const c1 = route.latLngs[wp[0]];
          const c2 = route.latLngs[wp[1] || wp[0]];
          if (c1 && c2) {
            map.fitBounds([c1, c2], { padding: [60, 60], maxZoom: 17 });
          }
        }

        speakText(
          `${cleanInstruction(step.instruction)}. Continue for ${fmtDist(step.distance * 1000)}.`,
        );
      });

      stepList.appendChild(div);
    }
  }

  document.getElementById("stepBadge").textContent = `${stepNum} STEPS`;

  document.getElementById("i-dist").textContent =
    `${route.summary.distance.toFixed(2)} km`;
  document.getElementById("i-dur").textContent = fmtDur(route.summary.duration);
}
function clearAll() {
  stopLiveNavigation();
  [straightLayer, startMarker, endMarker, gpsMarker, userTrailLayer].forEach(
    (l) => {
      if (l) map.removeLayer(l);
    },
  );

  routeLayers.forEach((l) => map.removeLayer(l));

  straightLayer = startMarker = endMarker = gpsMarker = userTrailLayer = null;
  routeLayers = [];
  startCoords = endCoords = null;
  navSteps = [];
  navIndex = 0;
  stepVoiceStage = {};
  routeLayers = [];
  allRoutes = [];
  selectedRouteIndex = 0;
  document.getElementById("routeOptions").style.display = "none";
  window.speechSynthesis.cancel();
  document.getElementById("startInp").value = "";
  document.getElementById("endInp").value = "";
  document.getElementById("infoBar").style.display = "none";
  document.getElementById("stepBadge").textContent = "0 STEPS";
  document.getElementById("routeCards").style.display = "none";
  document.getElementById("routeCards").innerHTML = "";
  document.getElementById("stepList").innerHTML =
    '<div class="empty-state"><div class="icon">🗺</div><p>Set origin &amp; destination,<br>then hit <b>▶ ROUTE</b><br>to compute the optimal path.</p></div>';
  document.getElementById("algoBox").innerHTML =
    '<b>DIJKSTRA\'S ALGORITHM</b><br>Explores nodes by always expanding the lowest-cost frontier via a <span class="tag">Min-Heap PQ</span>. Guarantees globally optimal path. <span class="tag">O((V+E) log V)</span>';
  document.body.classList.remove("nav-mode");
  document.body.classList.remove("map-fullscreen");
  document.getElementById("mapFullscreenBtn").style.display = "";

  const fsBtn = document.getElementById("mapFullscreenBtn");
  fsBtn.classList.remove("active");
  fsBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
  clickState = "start";
  setStatus("Cleared. Enter new locations or click the map.");
}
function setStatus(msg, cls = "", loading = false) {
  const bar = document.getElementById("statusBar");
  bar.className = "";
  if (cls) bar.classList.add(cls);
  document.getElementById("statusTxt").textContent = msg;
  document.getElementById("spinner").style.display = loading ? "block" : "none";
}
function toggleSidebar() {
  const sb = document.getElementById("sidebar"),
    ov = document.getElementById("sidebarOverlay"),
    btn = document.getElementById("sidebarToggle");
  const isOpen = sb.classList.toggle("open");
  ov.classList.toggle("visible", isOpen);
  btn.textContent = isOpen ? "✕ CLOSE" : "🗺 DIRECTIONS";
  setTimeout(() => map.invalidateSize(), 310);
}
let isMapFullscreen = false;

function toggleMapFullscreen() {
  // if (window.innerWidth > 650) return; // mobile only

  isMapFullscreen = !isMapFullscreen;
  document.body.classList.toggle("map-fullscreen", isMapFullscreen);

  const btn = document.getElementById("mapFullscreenBtn");
  btn.classList.toggle("active", isMapFullscreen);
  // btn.innerHTML = isMapFullscreen ? "🡼" : "⛶";
  btn.innerHTML = isMapFullscreen
    ? '<i class="fa-solid fa-compress"></i>'
    : '<i class="fa-solid fa-expand"></i>';

  // important: refresh Leaflet map after layout change
  setTimeout(() => {
    if (typeof map !== "undefined") {
      map.invalidateSize();
    }
  }, 300);
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("visible");
  document.getElementById("sidebarToggle").textContent = "🗺 DIRECTIONS";
  setTimeout(() => map.invalidateSize(), 310);
}
function autoOpenSidebar() {
  if (!document.getElementById("sidebar").classList.contains("open")) {
    document.getElementById("sidebar").classList.add("open");
    document.getElementById("sidebarOverlay").classList.add("visible");
    document.getElementById("sidebarToggle").textContent = "✕ CLOSE";
    setTimeout(() => map.invalidateSize(), 310);
  }
}
(function () {
  const sb = document.getElementById("sidebar");
  let sY = 0;
  sb.addEventListener(
    "touchstart",
    (e) => {
      sY = e.touches[0].clientY;
    },
    { passive: true },
  );
  sb.addEventListener(
    "touchend",
    (e) => {
      if (e.changedTouches[0].clientY - sY > 60) closeSidebar();
    },
    { passive: true },
  );
})();
const gStyle = document.createElement("style");
gStyle.textContent =
  "@keyframes gps-pulse{0%{transform:scale(.3);opacity:1}100%{transform:scale(2.5);opacity:0}}";
document.head.appendChild(gStyle);
