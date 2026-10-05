requireLogin();

const user = getUser();
document.getElementById("userName").textContent = `${user.name} (${user.role})`;

const title = document.getElementById("dashboardTitle");
const subtitle = document.getElementById("dashboardSubtitle");
const createBtn = document.getElementById("createBtn");
const createSection = document.getElementById("createSection");

if (user.role === "customer") {
  title.textContent = "My Shipments";
  subtitle.textContent = "Create and track your parcels.";
  createBtn.classList.remove("hidden");
  createSection.classList.remove("hidden");
} else if (user.role === "delivery") {
  title.textContent = "Delivery Dashboard";
  subtitle.textContent = "View assigned shipments and update their status.";
  createBtn.classList.add("hidden");
  createSection.classList.add("hidden");
} else {
  title.textContent = "Admin Dashboard";
  subtitle.textContent = "Manage shipments and assign delivery staff.";
  createBtn.classList.add("hidden");
  createSection.classList.add("hidden");
}

document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("refreshBtn").addEventListener("click", loadShipments);

if (createBtn) {
  createBtn.addEventListener("click", () => {
    createSection.classList.toggle("hidden");
  });
}

document.getElementById("shipmentForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const msg = document.getElementById("formMessage");

  try {
    const body = {
      senderName: document.getElementById("senderName").value.trim(),
      senderPhone: document.getElementById("senderPhone").value.trim(),
      pickupAddress: document.getElementById("pickupAddress").value.trim(),
      receiverName: document.getElementById("receiverName").value.trim(),
      receiverPhone: document.getElementById("receiverPhone").value.trim(),
      deliveryAddress: document.getElementById("deliveryAddress").value.trim(),
      packageType: document.getElementById("packageType").value,
      weight: Number(document.getElementById("weight").value)
    };

    const data = await api("/api/shipments", {
      method: "POST",
      body: JSON.stringify(body)
    });

    msg.textContent = `Shipment created! Tracking ID: ${data.shipment.trackingId}`;
    msg.className = "message show";

    event.target.reset();
    loadShipments();
  } catch (error) {
    msg.textContent = error.message;
    msg.className = "message show error";
  }
});

async function loadShipments() {
  const list = document.getElementById("shipmentList");
  list.innerHTML = "<p class='muted'>Loading...</p>";

  try {
    const data = await api("/api/shipments");
    const shipments = data.shipments;

    renderStats(shipments);

    if (!shipments.length) {
      list.innerHTML = "<p class='muted'>No shipments yet.</p>";
      return;
    }

    list.innerHTML = shipments.map(renderShipment).join("");

    document.querySelectorAll("[data-status-id]").forEach((select) => {
      select.addEventListener("change", async () => {
        const id = select.dataset.statusId;

        try {
          await api(`/api/shipments/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: select.value })
          });
          loadShipments();
        } catch (error) {
          alert(error.message);
        }
      });
    });
  } catch (error) {
    list.innerHTML = `<p class="message show error">${escapeHtml(error.message)}</p>`;
  }
}

function renderStats(shipments) {
  const total = shipments.length;
  const transit = shipments.filter(s => ["PICKED_UP", "IN_TRANSIT"].includes(s.status)).length;
  const out = shipments.filter(s => s.status === "OUT_FOR_DELIVERY").length;
  const delivered = shipments.filter(s => s.status === "DELIVERED").length;

  document.getElementById("stats").innerHTML = `
    <div class="stat"><span class="muted">Total</span><strong>${total}</strong></div>
    <div class="stat"><span class="muted">In Transit</span><strong>${transit}</strong></div>
    <div class="stat"><span class="muted">Out for Delivery</span><strong>${out}</strong></div>
    <div class="stat"><span class="muted">Delivered</span><strong>${delivered}</strong></div>
  `;
}

function renderShipment(s) {
  const canUpdate = user.role === "delivery" || user.role === "admin";

  const statusControl = canUpdate
    ? `<select data-status-id="${s._id}">
        ${["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"]
          .map(status => `<option ${status === s.status ? "selected" : ""}>${status}</option>`).join("")}
       </select>`
    : `<span class="status">${escapeHtml(s.status.replaceAll("_", " "))}</span>`;

  return `
    <div class="shipment">
      <div class="shipment-top">
        <div>
          <div class="shipment-id">${escapeHtml(s.trackingId)}</div>
          <div class="shipment-route">${escapeHtml(s.pickupAddress)} → ${escapeHtml(s.deliveryAddress)}</div>
        </div>
        ${statusControl}
      </div>
      <p class="muted">
        ${escapeHtml(s.packageType)} • ${escapeHtml(s.weight)} kg
        ${s.deliveryPerson ? `• Delivery: ${escapeHtml(s.deliveryPerson.name)}` : ""}
      </p>
      <a class="btn small secondary" href="/tracking.html?id=${encodeURIComponent(s.trackingId)}">Track</a>
    </div>
  `;
}

loadShipments();
