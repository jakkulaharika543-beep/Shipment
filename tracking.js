const form = document.getElementById("trackForm");
const result = document.getElementById("result");
const message = document.getElementById("message");

function showMessage(text, error = false) {
  message.textContent = text;
  message.className = "message show" + (error ? " error" : "");
}

function renderTracking(s) {
  const statuses = ["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];
  const currentIndex = statuses.indexOf(s.status);

  result.classList.remove("hidden");

  result.innerHTML = `
    <div class="section-row">
      <div>
        <span class="pill">TRACKING ID</span>
        <h2>${escapeHtml(s.trackingId)}</h2>
        <p class="muted">${escapeHtml(s.pickupAddress)} → ${escapeHtml(s.deliveryAddress)}</p>
      </div>
      <span class="status">${escapeHtml(s.status.replaceAll("_", " "))}</span>
    </div>

    <div class="card" style="margin-top:20px">
      <h3>Shipment details</h3>
      <p><b>Receiver:</b> ${escapeHtml(s.receiverName)}</p>
      <p><b>Package:</b> ${escapeHtml(s.packageType)} (${escapeHtml(s.weight)} kg)</p>
      <p><b>Estimated delivery:</b> ${s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleString() : "Not available"}</p>
      ${s.deliveryPerson ? `<p><b>Delivery person:</b> ${escapeHtml(s.deliveryPerson.name)}</p>` : ""}
    </div>

    <h3 style="margin-top:30px">Tracking timeline</h3>
    <div class="timeline">
      ${statuses.map((status, index) => {
        const historyItem = [...(s.history || [])].reverse().find(h => h.status === status);
        const done = index <= currentIndex;
        return `
          <div class="timeline-item">
            <div class="timeline-dot ${done ? "done" : ""}"></div>
            <div>
              <strong>${escapeHtml(status.replaceAll("_", " "))}</strong>
              <small>
                ${historyItem ? new Date(historyItem.updatedAt).toLocaleString() : "Waiting"}
                ${historyItem?.note ? ` — ${escapeHtml(historyItem.note)}` : ""}
              </small>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

async function track(id) {
  try {
    result.classList.add("hidden");
    showMessage("Searching...");
    const data = await api(`/api/shipments/track/${encodeURIComponent(id.trim())}`);
    showMessage("");
    message.className = "message";
    renderTracking(data.shipment);
  } catch (error) {
    result.classList.add("hidden");
    showMessage(error.message, true);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  track(document.getElementById("trackingId").value);
});

const params = new URLSearchParams(window.location.search);
const initialId = params.get("id");
if (initialId) {
  document.getElementById("trackingId").value = initialId;
  track(initialId);
}
