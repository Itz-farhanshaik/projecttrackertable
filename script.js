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
const blockedCount = document.getElementById("blockedCount");
const selectedTrackerName = document.getElementById("selectedTrackerName");
const selectedTrackerMeta = document.getElementById("selectedTrackerMeta");

// Edit modal elements
const editModal = document.getElementById("editModal");
const modalClose = document.getElementById("modalClose");
const editForm = document.getElementById("editForm");
const editStatus = document.getElementById("editStatus");
const editProgress = document.getElementById("editProgress");
const editOwner = document.getElementById("editOwner");
const editDueDate = document.getElementById("editDueDate");
const cancelEdit = document.getElementById("cancelEdit");

const projectsStorageKey = "qscope-projects";
let projects = loadProjects();
let currentEditId = null;

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
  // default option now indicates All trackers and uses empty value
  trackerSelect.innerHTML = '<option value="">All trackers</option>';

  projects.forEach((project) => {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = `${project.project} - ${project.owner}`;
    trackerSelect.appendChild(option);
  });

  // If the previously selected tracker still exists, keep it.
  if (projects.some((project) => project.id === currentSelection)) {
    trackerSelect.value = currentSelection;
  } else {
    // Otherwise leave it empty so the dashboard shows all projects.
    trackerSelect.value = "";
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

function openEditModal(id) {
  const project = projects.find((p) => p.id === id);
  if (!project) return;
  currentEditId = id;
  // Pre-fill owner and due date in the modal
  if (editOwner) editOwner.value = project.owner || "";
  if (editDueDate) editDueDate.value = project.dueDate || "";
  editStatus.value = project.status;
  editProgress.value = project.progress;
  editModal.classList.add("active");
  editModal.setAttribute("aria-hidden", "false");
}

function closeEditModal() {
  currentEditId = null;
  editForm.reset();
  editModal.classList.remove("active");
  editModal.setAttribute("aria-hidden", "true");
}

function renderDashboard() {
  renderTrackerSelector();
  const selected = selectedProject();
  const displayProjects = selected ? [selected] : projects;

  if (projects.length === 0) {
    trackerBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">No trackers added yet.</td>
      </tr>
    `;
  } else {
    trackerBody.innerHTML = displayProjects
      .map(
        (project) => `
        <tr data-id="${project.id}">
          <td>${project.project}</td>
          <td>${project.owner}</td>
          <td><span class="status-pill ${statusClass(project.status)}">${project.status}</span></td>
          <td>${project.progress}%</td>
          <td>${project.dueDate}</td>
          <td><button class="edit-btn" data-id="${project.id}" type="button">Edit</button></td>
        </tr>
      `,
      )
      .join("");
  }

  // Attach handlers to the newly rendered edit buttons
  trackerBody.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      openEditModal(id);
    });
  });

  totalProjects.textContent = projects.length;
  planningCount.textContent = projects.filter((project) => project.status === "Planning").length;
  activeCount.textContent = projects.filter((project) => project.status === "In Progress").length;
  blockedCount.textContent = projects.filter((project) => project.status === "Blocked").length;
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

// Modal handlers
modalClose.addEventListener("click", closeEditModal);
cancelEdit.addEventListener("click", closeEditModal);
editModal.addEventListener("click", (e) => {
  // Close when clicking outside modal content
  if (e.target === editModal) closeEditModal();
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentEditId) return;

  const owner = editOwner ? editOwner.value.trim() : "";
  const dueDate = editDueDate ? editDueDate.value : "";
  const status = editStatus.value;
  const progress = Number(editProgress.value);

  const idx = projects.findIndex((p) => p.id === currentEditId);
  if (idx === -1) return;

  projects[idx].owner = owner || projects[idx].owner;
  projects[idx].dueDate = dueDate || projects[idx].dueDate;
  projects[idx].status = status;
  projects[idx].progress = Number.isFinite(progress) ? progress : projects[idx].progress;

  saveProjects();
  renderDashboard();
  closeEditModal();
});

renderDashboard();
