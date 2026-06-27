const credentials = {
  "tester001@qscope": "test001",
  "admin@qscope": "admin",
};

const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");
const currentUserLabel = document.getElementById("currentUserLabel");
const projectForm = document.getElementById("projectForm");
const trackerSelect = document.getElementById("trackerSelect");
const trackerBody = document.getElementById("trackerBody");
const totalProjects = document.getElementById("totalProjects");
const planningCount = document.getElementById("planningCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");
const selectedTrackerName = document.getElementById("selectedTrackerName");
const selectedTrackerMeta = document.getElementById("selectedTrackerMeta");

const projectsStorageKey = "qscope-projects";
let projects = loadProjects();

function statusClass(status) {
  switch (status) {
    case "Planning":
      return "status-planning";
    case "In Progress":
      return "status-progress";
    case "Blocked":
      return "status-blocked";
    case "Completed":
      return "status-completed";
    default:
      return "";
  }
}

function loadProjects() {
  try {
    const storedProjects = JSON.parse(localStorage.getItem(projectsStorageKey) || "[]");
    return Array.isArray(storedProjects) ? storedProjects : [];
  } catch {
    return [];
  }
}

function createTrackerId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `tracker-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function saveProjects() {
  localStorage.setItem(projectsStorageKey, JSON.stringify(projects));
}

function selectedProject() {
  const selectedId = trackerSelect.value;
  return projects.find((project) => project.id === selectedId) || null;
}

function renderTrackerSelector() {
  const currentSelection = trackerSelect.value;
  trackerSelect.innerHTML = '<option value="">No tracker selected</option>';

  projects.forEach((project) => {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = `${project.project} - ${project.owner}`;
    trackerSelect.appendChild(option);
  });

  if (projects.some((project) => project.id === currentSelection)) {
    trackerSelect.value = currentSelection;
  } else if (projects.length > 0) {
    trackerSelect.value = projects[0].id;
  }
}

function renderSelectedTracker() {
  const project = selectedProject();

  if (!project) {
    selectedTrackerName.textContent = projects.length > 0 ? "Showing all trackers" : "No tracker yet";
    selectedTrackerMeta.textContent = projects.length > 0
      ? "Pick a tracker from the list to inspect a single task."
      : "Add tasks, then choose one to inspect.";
    return;
  }

  selectedTrackerName.textContent = project.project;
  selectedTrackerMeta.textContent = `${project.owner} · ${project.status} · ${project.progress}% · Due ${project.dueDate}`;
}

function renderDashboard() {
  renderTrackerSelector();
  const selected = selectedProject();
  const displayProjects = selected ? [selected] : projects;

  if (projects.length === 0) {
    trackerBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5">No trackers added yet.</td>
      </tr>
    `;
  } else {
    trackerBody.innerHTML = displayProjects
      .map(
        (project) => `
        <tr>
          <td>${project.project}</td>
          <td>${project.owner}</td>
          <td><span class="status-pill ${statusClass(project.status)}">${project.status}</span></td>
          <td>${project.progress}%</td>
          <td>${project.dueDate}</td>
        </tr>
      `,
      )
      .join("");
  }

  totalProjects.textContent = projects.length;
  planningCount.textContent = projects.filter((project) => project.status === "Planning").length;
  activeCount.textContent = projects.filter((project) => project.status === "In Progress").length;
  completedCount.textContent = projects.filter((project) => project.status === "Completed").length;
  renderSelectedTracker();
}

function showDashboard(email) {
  loginScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");
  dashboardScreen.setAttribute("aria-hidden", "false");
  currentUserLabel.textContent = `Signed in as ${email}`;
  renderDashboard();
}

function showLogin() {
  dashboardScreen.classList.add("hidden");
  dashboardScreen.setAttribute("aria-hidden", "true");
  loginScreen.classList.remove("hidden");
  loginForm.reset();
}

const savedUser = sessionStorage.getItem("qscope-user");
if (savedUser && credentials[savedUser]) {
  showDashboard(savedUser);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  if (credentials[email] && credentials[email] === password) {
    loginError.textContent = "";
    sessionStorage.setItem("qscope-user", email);
    showDashboard(email);
    return;
  }

  loginError.textContent = "Invalid email or password. Try the tester or admin account.";
});

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("qscope-user");
  showLogin();
});

trackerSelect.addEventListener("change", renderSelectedTracker);

projectForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const trackerId = createTrackerId();
  const projectName = document.getElementById("projectName").value.trim();
  const ownerName = document.getElementById("ownerName").value.trim();
  const projectStatus = document.getElementById("projectStatus").value;
  const progressValue = Number(document.getElementById("progressValue").value);
  const dueDate = document.getElementById("dueDate").value;

  projects = [
    {
      id: trackerId,
      project: projectName,
      owner: ownerName,
      status: projectStatus,
      progress: progressValue,
      dueDate,
    },
    ...projects,
  ];

  saveProjects();
  projectForm.reset();
  document.getElementById("projectStatus").value = "Planning";
  trackerSelect.value = trackerId;
  renderDashboard();
});

renderDashboard();
