const BASE_URL = "http://127.0.0.1:8000/api";
let isLogin = true;

function toggleForm() {
  isLogin = !isLogin;
  document.getElementById("login-form").classList.toggle("hidden", !isLogin);
  document.getElementById("register-form").classList.toggle("hidden", isLogin);
  document.querySelector(".switch-link").textContent = isLogin
    ? "Don't have an account? Register"
    : "Already have an account? Login";
  document.getElementById("form-title").textContent = isLogin ? "Login" : "Register";
}

function registerUser() {
  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  fetch(`${BASE_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  })
    .then(res => res.json())
    .then(data => {
      alert("Registration successful!");
      toggleForm();
    })
    .catch(error => console.error("Registration error:", error));
}

function loginUser() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  fetch(`${BASE_URL}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.access) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        alert("Login successful!");
        showTasksUI();
        getTasks();
      } else {
        alert("Login failed!");
      }
    })
    .catch(error => console.error("Login error:", error));
}

function showTasksUI() {
  document.getElementById("auth-section").classList.add("hidden");
  document.getElementById("task-section").classList.remove("hidden");
}

function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("tasks");
  document.getElementById("task-section").classList.add("hidden");
  document.getElementById("auth-section").classList.remove("hidden");
}

function getTasks() {
  const token = localStorage.getItem("access");
  if (!token) return;

  fetch(`${BASE_URL}/tasks/`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(tasks => {
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks(tasks);
    })
    .catch(err => {
      alert("Session expired. Please log in again.");
      logout();
    });
}
function renderTasks(tasks) {
  const list = document.getElementById("task-list");
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.style.marginBottom = "8px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.style.marginRight = "10px";
    checkbox.onchange = () => toggleTaskCompletion(task.id, checkbox.checked);

    const span = document.createElement("span");
    span.textContent = task.title;
    span.style.marginRight = "10px";
    span.style.textDecoration = task.completed ? "line-through" : "none";

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = task.title;
    editInput.style.display = "none";
    editInput.style.marginRight = "10px";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => {
      const isEditing = editInput.style.display === "inline-block";

      if (isEditing) {
        updateTask(task.id, editInput.value);
        span.textContent = editInput.value;
        span.style.display = "inline";
        editInput.style.display = "none";
        editBtn.textContent = "Edit";
      } else {
        editInput.style.display = "inline-block";
        span.style.display = "none";
        editBtn.textContent = "Save";
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.marginLeft = "5px";
    deleteBtn.onclick = () => deleteTask(task.id);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editInput);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}
function addTask() {
  const title = document.getElementById("new-task-title").value.trim();
  const token = localStorage.getItem("access");

  if (!title || !token) return;

  fetch(`${BASE_URL}/tasks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title })
  })
    .then(res => res.json())
    .then(task => {
      document.getElementById("new-task-title").value = "";
      getTasks();
    });
}

function deleteTask(id) {
  const token = localStorage.getItem("access");

  fetch(`${BASE_URL}/tasks/${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  }).then(() => getTasks());
}

function updateTask(id, newTitle) {
  const token = localStorage.getItem("access");

  fetch(`${BASE_URL}/tasks/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title: newTitle })
  })
    .then(() => getTasks());
}
window.onload = () => {
  const token = localStorage.getItem("access");
  const tasks = localStorage.getItem("tasks");
  if (token && tasks) {
    showTasksUI();
    renderTasks(JSON.parse(tasks));
    getTasks();
  }
  document.getElementById("login-password").addEventListener("keydown", e => {
    if (e.key === "Enter") loginUser();
  });
  document.getElementById("register-password").addEventListener("keydown", e => {
    if (e.key === "Enter") registerUser();
  });
  document.getElementById("new-task-title").addEventListener("keydown", e => {
    if (e.key === "Enter") addTask();
  });
};
