const checkboxes = document.querySelectorAll("input[type='checkbox']");
const gymBoxes = document.querySelectorAll(".gym");
const notes = document.getElementById("notes");

const heatmap = document.getElementById("heatmap");
const heatmapMonths = document.getElementById("heatmapMonths");

let gymLog = JSON.parse(localStorage.getItem("gymHeatmap") || "{}");

/* SAVE */
function getCurrentWeekStart() {
  const today = new Date();
  const monday = new Date(today);
  const dayIndex = (monday.getDay() + 6) % 7; // Monday = 0
  monday.setDate(monday.getDate() - dayIndex);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function syncCurrentWeekGymHeatmap() {
  const weekStart = getCurrentWeekStart();

  gymBoxes.forEach(checkbox => {
    const dayOffset = Number(checkbox.dataset.day);
    if (!Number.isFinite(dayOffset)) return;

    const targetDate = new Date(weekStart);
    targetDate.setDate(targetDate.getDate() + dayOffset);

    const dateKey = getDateKey(targetDate);
    if (checkbox.checked) {
      gymLog[dateKey] = true;
    } else {
      delete gymLog[dateKey];
    }
  });

  localStorage.setItem("gymHeatmap", JSON.stringify(gymLog));
}

function updateCurrentWeekGymCheckboxes() {
  const weekStart = getCurrentWeekStart();

  gymBoxes.forEach(checkbox => {
    const dayOffset = Number(checkbox.dataset.day);
    if (!Number.isFinite(dayOffset)) return;

    const targetDate = new Date(weekStart);
    targetDate.setDate(targetDate.getDate() + dayOffset);

    const dateKey = getDateKey(targetDate);
    checkbox.checked = !!gymLog[dateKey];
  });
}

function save() {
  const data = {
    checks: [...checkboxes].map(c => c.checked),
    notes: notes.value
  };

  localStorage.setItem("gymData", JSON.stringify(data));
  syncCurrentWeekGymHeatmap();
  updateStats();
  renderHeatmap();
}

/* LOAD */
function load() {
  const data = JSON.parse(localStorage.getItem("gymData"));

  if (data) {
    checkboxes.forEach((c, i) => {
      if (!c.classList.contains("gym")) {
        c.checked = data.checks?.[i] || false;
      }
    });
    notes.value = data.notes || "";
  }

  updateCurrentWeekGymCheckboxes();
  syncCurrentWeekGymHeatmap();
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
    cell.title = `${currentDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

    if (gymLog[dateKey]) cell.classList.add("active");

    cell.onclick = () => {
      if (gymLog[dateKey]) {
        delete gymLog[dateKey];
      } else {
        gymLog[dateKey] = true;
      }
      localStorage.setItem("gymHeatmap", JSON.stringify(gymLog));
      renderHeatmap();
      updateCurrentWeekGymCheckboxes();
      updateStats();
    };

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
  const blob = new Blob([localStorage.getItem("gymData")], {
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
    localStorage.setItem("gymData", reader.result);
    location.reload();
  };

  reader.readAsText(e.target.files[0]);
};

/* EVENTS */
checkboxes.forEach(c => c.addEventListener("change", save));
notes.addEventListener("input", save);

/* INIT */
load();
renderHeatmap();