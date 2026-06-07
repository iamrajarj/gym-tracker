const checkboxes = document.querySelectorAll("input[type='checkbox']");
const notes = document.getElementById("notes");

const heatmap = document.getElementById("heatmap");

let gymLog = JSON.parse(localStorage.getItem("gymHeatmap") || "{}");

/* SAVE */
function save() {
  const data = {
    checks: [...checkboxes].map(c => c.checked),
    notes: notes.value
  };

  localStorage.setItem("gymData", JSON.stringify(data));
  updateStats();
}

/* LOAD */
function load() {
  const data = JSON.parse(localStorage.getItem("gymData"));

  if (data) {
    checkboxes.forEach((c, i) => c.checked = data.checks?.[i] || false);
    notes.value = data.notes || "";
  }

  updateStats();
}

/* STATS */
function updateStats() {
  const gymBoxes = document.querySelectorAll(".gym");
  const done = [...gymBoxes].filter(c => c.checked).length;

  document.getElementById("streak").innerText =
    Object.keys(gymLog).length;

  document.getElementById("progress").innerText =
    Math.round((done / gymBoxes.length) * 100) + "%";
}

/* HEATMAP */
function renderHeatmap() {
  heatmap.innerHTML = "";

  for (let i = 0; i < 365; i++) {
    const cell = document.createElement("div");
    cell.classList.add("day");

    if (gymLog[i]) cell.classList.add("active");

    cell.onclick = () => {
      gymLog[i] = !gymLog[i];

      if (!gymLog[i]) delete gymLog[i];

      localStorage.setItem("gymHeatmap", JSON.stringify(gymLog));
      renderHeatmap();
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