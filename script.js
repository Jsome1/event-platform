const API_URL = "http://localhost:3000/api/events";
let selectedEventId = null;
let isEditMode = false;

window.onload = () => {
  const lastSearch = localStorage.getItem("lastSearch");
  if (lastSearch) document.getElementById("searchInput").value = lastSearch;
  loadEvents();
};

async function loadEvents() {
  const search = document.getElementById("searchInput").value;
  const categoryFilter = document.getElementById("categoryFilter")?.value.toLowerCase() || "";
  localStorage.setItem("lastSearch", search);
  
  const container = document.getElementById("events");
  
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const filteredData = data.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = e.category.toLowerCase().includes(categoryFilter);
      return matchesSearch && matchesCategory;
    });

    container.innerHTML = filteredData.length ? "" : "<p class='empty'>No events found.</p>";

    filteredData.forEach(e => {
      const div = document.createElement("div");
      div.className = "event-card";
      div.innerHTML = `
        <h3>${e.title}</h3>
        <p>📅 ${e.date} | 🏷️ ${e.category}</p>
        <div class="actions">
          <button onclick="openDetails(${e.id})">Details</button>
          <button onclick="openRegister(${e.id})">Register</button>
          <button onclick="viewAttendees(${e.id})">Attendees</button>
          <button onclick="editEvent(${JSON.stringify(e).replace(/"/g, '&quot;')})">Edit</button>
          <button onclick="deleteEvent(${e.id})">Delete</button>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = "<p>Server Connection Error</p>";
  }
}

async function handleSaveEvent() {
  const eventData = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    location: document.getElementById("location").value,
    category: document.getElementById("category").value,
    capacity: parseInt(document.getElementById("capacity").value)
  };

  if (!eventData.title || !eventData.date || isNaN(eventData.capacity)) {
    alert("Please fill in all required fields!");
    return;
  }

  const method = isEditMode ? "PUT" : "POST";
  const url = isEditMode ? `${API_URL}/${selectedEventId}` : API_URL;

  try {
    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData)
    });
    
    if (res.ok) {
      resetForm();
      loadEvents();
    }
  } catch (err) {
    alert("Error saving event");
  }
}

function editEvent(e) {
  isEditMode = true;
  selectedEventId = e.id;
  document.getElementById("title").value = e.title;
  document.getElementById("description").value = e.description;
  document.getElementById("date").value = e.date;
  document.getElementById("time").value = e.time;
  document.getElementById("location").value = e.location;
  document.getElementById("category").value = e.category;
  document.getElementById("capacity").value = e.capacity;
  document.querySelector(".card button").innerText = "Update Event";
}

function resetForm() {
  isEditMode = false;
  selectedEventId = null;
  document.querySelectorAll(".card input").forEach(i => i.value = "");
  document.querySelector(".card button").innerText = "Create Event";
}

async function deleteEvent(id) {
  if (confirm("Delete event?")) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadEvents();
  }
}

function openRegister(id) {
  selectedEventId = id;
  document.getElementById("registerModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("registerModal").classList.add("hidden");
  document.querySelectorAll("#registerModal input").forEach(i => i.value = "");
}

async function submitRegistration() {
  const regData = {
    fullName: document.getElementById("regName").value,
    email: document.getElementById("regEmail").value,
    phone: document.getElementById("regPhone").value
  };

  if (!regData.fullName || !regData.email) {
    alert("Name and Email are required!");
    return;
  }

  const res = await fetch(`${API_URL}/${selectedEventId}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(regData)
  });

  const result = await res.json();
  if (res.ok) {
    alert("✅ Success!");
    closeModal();
  } else {
    alert("❌ " + result.message);
  }
}

async function openDetails(id) {
  const res = await fetch(`${API_URL}/${id}`);
  const e = await res.json();
  document.getElementById("eventDetails").innerHTML = `
    <h2>${e.title}</h2>
    <p><strong>Description:</strong> ${e.description}</p>
    <p><strong>Location:</strong> ${e.location} at ${e.time}</p>
    <p><strong>Category:</strong> ${e.category}</p>
  `;
  document.getElementById("detailsModal").classList.remove("hidden");
}

function closeDetails() { document.getElementById("detailsModal").classList.add("hidden"); }

async function viewAttendees(id) {
  const res = await fetch(`${API_URL}/${id}/attendees`);
  const data = await res.json();
  const list = data.length ? data.map(a => `<div>👤 ${a.fullName} (${a.email})</div>`).join("") : "No attendees yet.";
  document.getElementById("attendeesList").innerHTML = `<h3>Attendees</h3>` + list;
  document.getElementById("attendeesModal").classList.remove("hidden");
}

function closeAttendees() { document.getElementById("attendeesModal").classList.add("hidden"); }