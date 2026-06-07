const checkboxes = document.querySelectorAll("input[type='checkbox']");
const taskCheckboxes = document.querySelectorAll("input[type='checkbox'][data-task]");
const gymBoxes = document.querySelectorAll(".gym");
const notes = document.getElementById("notes");

const heatmap = document.getElementById("heatmap");
const heatmapMonths = document.getElementById("heatmapMonths");

let dailyStatus = JSON.parse(localStorage.getItem("dailyStatus") || "{}");
let currentWeekKey = getWeekKey();

/* SAVE */
function getCurrentWeekStart(date = new Date()) {
  const monday = new Date(date);
  const dayIndex = (monday.getDay() + 6) % 7; // Monday = 0
  monday.setDate(monday.getDate() - dayIndex);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getWeekKey(date = new Date()) {
  return getDateKey(getCurrentWeekStart(date));
}

function syncCurrentWeekHeatmapData() {
  const weekStart = getCurrentWeekStart();

  taskCheckboxes.forEach(checkbox => {
    const dayOffset = Number(checkbox.dataset.day);
    const task = checkbox.dataset.task;
    if (!Number.isFinite(dayOffset) || !task) return;

    const targetDate = new Date(weekStart);
    targetDate.setDate(targetDate.getDate() + dayOffset);

    const dateKey = getDateKey(targetDate);
    dailyStatus[dateKey] = dailyStatus[dateKey] || { gym: false, sleep: false, protein: false };
    dailyStatus[dateKey][task] = checkbox.checked;
  });

  localStorage.setItem("dailyStatus", JSON.stringify(dailyStatus));
}

function updateCurrentWeekTaskCheckboxes() {
  const weekStart = getCurrentWeekStart();

  taskCheckboxes.forEach(checkbox => {
    const dayOffset = Number(checkbox.dataset.day);
    const task = checkbox.dataset.task;
    if (!Number.isFinite(dayOffset) || !task) return;

    const targetDate = new Date(weekStart);
    targetDate.setDate(targetDate.getDate() + dayOffset);

    const dateKey = getDateKey(targetDate);
    checkbox.checked = !!dailyStatus[dateKey]?.[task];
  });
}

function refreshIfWeekChanged() {
  const newWeekKey = getWeekKey();
  if (newWeekKey === currentWeekKey) return;

  currentWeekKey = newWeekKey;
  updateCurrentWeekTaskCheckboxes();
  updateStats();
  renderHeatmap();
}

function save() {
  const data = {
    notes: notes.value
  };

  localStorage.setItem("gymData", JSON.stringify(data));
  syncCurrentWeekHeatmapData();
  updateStats();
  renderHeatmap();
}

/* LOAD */
function load() {
  const data = JSON.parse(localStorage.getItem("gymData"));

  if (data) {
    notes.value = data.notes || "";
  }

  updateCurrentWeekTaskCheckboxes();
  syncCurrentWeekHeatmapData();
  updateStats();
}

/* STATS */
function updateStats() {
  const gymBoxes = document.querySelectorAll(".gym");

  const gymDone = [...gymBoxes].filter(c => c.checked).length;
  const gymTotal = gymBoxes.length;

  // Weekly progress (% gym completion)
  document.getElementById("progress").innerText =
    Math.round((gymDone / gymTotal) * 100) + "%";

  // Gym days is the number of gym checkboxes checked this week
  document.getElementById("streak").innerText = gymDone;
}

/* HEATMAP */
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/*
function isRestDate(date) {
  const day = date.getDay();
  return day === 0 || day === 4; // Sunday and Thursday
}
*/

function renderHeatmap() {
  const year = new Date().getFullYear();
  const startDate = new Date(year, 0, 1);
  const startDay = (startDate.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const daysInYear = 365 + (isLeapYear(year) ? 1 : 0);
  const weeks = 53;
  const totalCells = weeks * 7;

  heatmap.innerHTML = "";
  heatmapMonths.innerHTML = "";

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  monthNames.forEach((name, month) => {
    const monthDate = new Date(year, month, 1);
    const dayIndex = Math.round((monthDate - startDate) / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor((dayIndex + startDay) / 7);

    if (weekIndex < weeks) {
      const label = document.createElement("span");
      label.textContent = name;
      label.style.gridColumnStart = weekIndex + 1;
      label.style.justifySelf = "start";
      heatmapMonths.appendChild(label);
    }
  });

  for (let cellIndex = 0; cellIndex < totalCells; cellIndex++) {
    const dayIndex = cellIndex - startDay;
    const cell = document.createElement("div");
    cell.classList.add("day");

    if (dayIndex < 0 || dayIndex >= daysInYear) {
      cell.classList.add("blank");
      heatmap.appendChild(cell);
      continue;
    }

    const currentDate = new Date(year, 0, dayIndex + 1);
    const dateKey = getDateKey(currentDate);
    const completedCount = Object.values(dailyStatus[dateKey] || {}).filter(Boolean).length;
    cell.title = `${currentDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

    // Rest-day logic is currently disabled, but preserved here for future use.
    // if (isRestDate(currentDate)) {
    //   cell.classList.add("rest");
    //   cell.title += " — Rest day";
    // } else {
    if (completedCount > 0) {
      cell.classList.add(`level-${completedCount}`);
      cell.title += ` — ${completedCount} of 3 tasks`;
    } else {
      cell.title += " — 0 of 3 tasks";
    }

    heatmap.appendChild(cell);
  }
}

/* DARK MODE */
document.getElementById("darkToggle").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("dark", document.body.classList.contains("dark"));
};

if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
}

/* EXPORT */
document.getElementById("exportBtn").onclick = () => {
  const exportData = {
    notes: JSON.parse(localStorage.getItem("gymData") || "{}")?.notes || "",
    dailyStatus
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gym-data.json";
  a.click();
};

/* IMPORT */
document.getElementById("importFile").onchange = (e) => {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      localStorage.setItem("gymData", JSON.stringify({ notes: imported.notes || "" }));
      localStorage.setItem("dailyStatus", JSON.stringify(imported.dailyStatus || {}));
      location.reload();
    } catch (err) {
      console.error("Invalid import file", err);
      alert("Import failed: invalid JSON file.");
    }
  };

  reader.readAsText(e.target.files[0]);
};

/* EVENTS */
checkboxes.forEach(c => c.addEventListener("change", save));
notes.addEventListener("input", save);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    refreshIfWeekChanged();
  }
});

setInterval(refreshIfWeekChanged, 60 * 1000); // refresh once per minute if the week changes

/* INIT */
load();
renderHeatmap();