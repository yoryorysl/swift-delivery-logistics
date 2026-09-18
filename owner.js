/* =========================================================
   SWIFT DELIVERY LOGISTICS
   OWNER DASHBOARD — FINAL FRONTEND CONTROLLER
   Connects owner.html → swift-delivery-api → D1
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
   ========================================================= */

const API_BASE =
  "https://swift-delivery-api.ypbp7sc2wp.workers.dev";

/* =========================================================
   STATE
   ========================================================= */

let authToken = localStorage.getItem("sdl_owner_token") || "";
let currentOwner = JSON.parse(
  localStorage.getItem("sdl_owner_user") || "null"
);

let shipmentsCache = [];
let bookingsCache = [];
let quotesCache = [];
let messagesCache = [];
let customersCache = [];

/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);

function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

function escapeHTML(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatMoney(value) {
  const number = Number(value || 0);

  return number.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

/* =========================================================
   API REQUEST
   ========================================================= */

async function apiRequest(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      logout(false);
    }

    throw new Error(
      data.message ||
      data.error ||
      `Request failed (${response.status})`
    );
  }

  return data;
}

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function showToast(message, type = "success") {
  let toast = $("ownerToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "ownerToast";

    toast.style.position = "fixed";
    toast.style.right = "20px";
    toast.style.bottom = "20px";
    toast.style.zIndex = "99999";
    toast.style.maxWidth = "360px";
    toast.style.padding = "14px 18px";
    toast.style.borderRadius = "12px";
    toast.style.background = "#111827";
    toast.style.color = "#fff";
    toast.style.boxShadow = "0 15px 40px rgba(0,0,0,.25)";
    toast.style.fontSize = "14px";

    document.body.appendChild(toast);
  }

  toast.textContent = message;

  if (type === "error") {
    toast.style.border = "1px solid #ef4444";
  } else {
    toast.style.border = "1px solid rgba(255,255,255,.12)";
  }

  toast.style.opacity = "1";

  clearTimeout(window.ownerToastTimer);

  window.ownerToastTimer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 3500);
}

/* =========================================================
   LOGIN
   ========================================================= */

function showLogin() {
  const loginScreen = $("loginScreen");
  const dashboardApp = $("dashboardApp");

  if (loginScreen) {
    loginScreen.classList.remove("hidden");
    loginScreen.style.display = "";
  }

  if (dashboardApp) {
    dashboardApp.classList.add("hidden");
    dashboardApp.style.display = "none";
  }
}

function showDashboard() {
  const loginScreen = $("loginScreen");
  const dashboardApp = $("dashboardApp");

  if (loginScreen) {
    loginScreen.classList.add("hidden");
    loginScreen.style.display = "none";
  }

  if (dashboardApp) {
    dashboardApp.classList.remove("hidden");
    dashboardApp.style.display = "";
  }
}

async function login(event) {
  if (event) event.preventDefault();

  const form = event?.target || $("loginForm");

  if (!form) return;

  const emailInput =
    $("loginEmail") ||
    qs('input[type="email"]', form);

  const passwordInput =
    $("loginPassword") ||
    qs('input[type="password"]', form);

  const email = emailInput?.value.trim();
  const password = passwordInput?.value;

  if (!email || !password) {
    showToast("Enter your email and password.", "error");
    return;
  }

  const submitButton =
    qs('button[type="submit"]', form);

  const originalText = submitButton?.textContent;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Signing in...";
  }

  try {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password
      })
    });

    authToken =
      data.token ||
      data.session_token ||
      data.access_token ||
      "";

    currentOwner =
      data.user ||
      data.owner ||
      {
        name: "Owner",
        email
      };

    if (!authToken) {
      throw new Error("The server did not return a login token.");
    }

    localStorage.setItem(
      "sdl_owner_token",
      authToken
    );

    localStorage.setItem(
      "sdl_owner_user",
      JSON.stringify(currentOwner)
    );

    showDashboard();

    updateOwnerIdentity();

    await loadDashboard();

    showToast("Welcome back.");
  } catch (error) {
    console.error(error);
    showToast(
      error.message || "Unable to sign in.",
      "error"
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent =
        originalText || "Sign In";
    }
  }
}

/* =========================================================
   LOGOUT
   ========================================================= */

async function logout(showMessage = true) {
  try {
    if (authToken) {
      await apiRequest("/api/auth/logout", {
        method: "POST"
      });
    }
  } catch {
    // Local logout still continues.
  }

  authToken = "";
  currentOwner = null;

  localStorage.removeItem("sdl_owner_token");
  localStorage.removeItem("sdl_owner_user");

  showLogin();

  if (showMessage) {
    showToast("You have been signed out.");
  }
}

/* =========================================================
   OWNER IDENTITY
   ========================================================= */

function updateOwnerIdentity() {
  if (!currentOwner) return;

  const name =
    currentOwner.name ||
    currentOwner.full_name ||
    "Owner";

  const email =
    currentOwner.email ||
    "";

  const possibleNameElements = [
    $("ownerName"),
    $("profileName"),
    $("settingsName"),
    $("userName")
  ];

  possibleNameElements.forEach((element) => {
    if (element) element.textContent = name;
  });

  const possibleEmailElements = [
    $("ownerEmail"),
    $("profileEmail"),
    $("settingsEmail"),
    $("userEmail")
  ];

  possibleEmailElements.forEach((element) => {
    if (element) element.textContent = email;
  });

  const nameInputs = [
    $("profileNameInput"),
    $("ownerProfileName")
  ];

  nameInputs.forEach((input) => {
    if (input && !input.value) {
      input.value = name;
    }
  });

  const emailInputs = [
    $("profileEmailInput"),
    $("ownerProfileEmail")
  ];

  emailInputs.forEach((input) => {
    if (input && !input.value) {
      input.value = email;
    }
  });
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {
  const navItems = qsa(
    "[data-section], [data-page], .nav-item, .sidebar-link"
  );

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const target =
        item.dataset.section ||
        item.dataset.page ||
        item.getAttribute("href")?.replace("#", "");

      if (!target) return;

      if (
        target === "logout" ||
        target === "signout"
      ) {
        logout();
        return;
      }

      navigateTo(target);
    });
  });
}

function navigateTo(sectionName) {
  const sections = qsa(
    ".dashboard-section, .page-section, [data-dashboard-section]"
  );

  let found = false;

  sections.forEach((section) => {
    const name =
      section.dataset.section ||
      section.dataset.page ||
      section.id;

    const active =
      name === sectionName ||
      name === `section-${sectionName}`;

    section.classList.toggle("active", active);

    if (active) {
      section.style.display = "";
      found = true;
    } else {
      section.style.display = "none";
    }
  });

  const navItems = qsa(
    "[data-section], [data-page], .nav-item, .sidebar-link"
  );

  navItems.forEach((item) => {
    const target =
      item.dataset.section ||
      item.dataset.page ||
      item.getAttribute("href")?.replace("#", "");

    item.classList.toggle(
      "active",
      target === sectionName
    );
  });

  if (found) {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}

/* =========================================================
   DASHBOARD DATA
   ========================================================= */

async function loadDashboard() {
  await Promise.allSettled([
    loadStats(),
    loadShipments(),
    loadBookings(),
    loadQuotes(),
    loadMessages(),
    loadCustomers()
  ]);

  updateOwnerIdentity();
}

/* =========================================================
   STATS
   ========================================================= */

async function loadStats() {
  try {
    const data = await apiRequest(
      "/api/owner/stats"
    );

    const stats =
      data.stats ||
      data.data ||
      data;

    setText(
      ["totalShipments", "statShipments"],
      stats.total_shipments ??
      stats.shipments ??
      0
    );

    setText(
      ["totalBookings", "statBookings"],
      stats.total_bookings ??
      stats.bookings ??
      0
    );

    setText(
      ["totalQuotes", "statQuotes"],
      stats.total_quotes ??
      stats.quotes ??
      0
    );

    setText(
      ["totalMessages", "statMessages"],
      stats.total_messages ??
      stats.messages ??
      0
    );

    setText(
      ["totalCustomers", "statCustomers"],
      stats.total_customers ??
      stats.customers ??
      0
    );

    setText(
      ["processingShipments"],
      stats.processing_shipments ??
      stats.processing ??
      0
    );

    setText(
      ["deliveredShipments"],
      stats.delivered_shipments ??
      stats.delivered ??
      0
    );

    setText(
      ["pendingBookings"],
      stats.pending_bookings ??
      stats.pending ??
      0
    );
  } catch (error) {
    console.error("Stats:", error);
  }
}

/* =========================================================
   SHIPMENTS
   ========================================================= */

async function loadShipments() {
  try {
    const data = await apiRequest(
      "/api/owner/shipments"
    );

    shipmentsCache =
      data.shipments ||
      data.data ||
      data.results ||
      [];

    renderShipments(shipmentsCache);
    renderRecentShipments(shipmentsCache);
  } catch (error) {
    console.error("Shipments:", error);
    showTableError(
      ["shipmentsTableBody", "recentShipmentsBody"],
      "Unable to load shipments."
    );
  }
}

function renderShipments(shipments) {
  const body =
    $("shipmentsTableBody") ||
    $("shipmentTableBody");

  if (!body) return;

  if (!shipments.length) {
    body.innerHTML = emptyRow(
      8,
      "No shipments have been created yet."
    );
    return;
  }

  body.innerHTML = shipments
    .map((shipment) => {
      return `
        <tr>
          <td>
            <strong>
              ${escapeHTML(
                shipment.tracking_number || "—"
              )}
            </strong>
          </td>

          <td>
            ${escapeHTML(
              shipment.customer_name || "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              shipment.destination_address ||
              shipment.delivery_address ||
              "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              shipment.service_type || "—"
            )}
          </td>

          <td>
            ${formatMoney(shipment.price)}
          </td>

          <td>
            ${statusBadge(shipment.status)}
          </td>

          <td>
            ${formatDate(
              shipment.created_at
            )}
          </td>

          <td>
            <button
              class="table-action"
              type="button"
              onclick="openShipmentEditor(${Number(
                shipment.id
              )})"
            >
              Manage
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderRecentShipments(shipments) {
  const body =
    $("recentShipmentsBody") ||
    $("recentTableBody");

  if (!body) return;

  const recent = [...shipments]
    .sort(
      (a, b) =>
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
    )
    .slice(0, 6);

  if (!recent.length) {
    body.innerHTML = emptyRow(
      6,
      "No recent shipments."
    );
    return;
  }

  body.innerHTML = recent
    .map(
      (shipment) => `
        <tr>
          <td>
            <strong>
              ${escapeHTML(
                shipment.tracking_number || "—"
              )}
            </strong>
          </td>

          <td>
            ${escapeHTML(
              shipment.customer_name || "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              shipment.service_type || "—"
            )}
          </td>

          <td>
            ${statusBadge(shipment.status)}
          </td>

          <td>
            ${formatDate(
              shipment.created_at
            )}
          </td>
        </tr>
      `
    )
    .join("");
}

/* =========================================================
   CREATE SHIPMENT
   ========================================================= */

async function createShipment(event) {
  if (event) event.preventDefault();

  const form =
    event?.target ||
    $("shipmentForm") ||
    $("createShipmentForm");

  if (!form) return;

  const payload = {
    customer_name: valueOf(
      ["customerName", "shipmentCustomerName"],
      form
    ),

    customer_email: valueOf(
      ["customerEmail", "shipmentCustomerEmail"],
      form
    ),

    customer_phone: valueOf(
      ["customerPhone", "shipmentCustomerPhone"],
      form
    ),

    sender_name: valueOf(
      ["senderName", "shipmentSenderName"],
      form
    ),

    pickup_address: valueOf(
      ["pickupAddress", "shipmentPickupAddress"],
      form
    ),

    recipient_name: valueOf(
      ["recipientName", "shipmentRecipientName"],
      form
    ),

    destination_address: valueOf(
      [
        "destinationAddress",
        "deliveryAddress",
        "shipmentDestinationAddress"
      ],
      form
    ),

    package_type: valueOf(
      ["packageType", "shipmentPackageType"],
      form
    ),

    weight: numberValue(
      ["weight", "packageWeight"],
      form
    ),

    service_type: valueOf(
      ["serviceType", "shippingMethod"],
      form
    ),

    price: numberValue(
      ["price", "shipmentPrice"],
      form
    ),

    pickup_date: valueOf(
      ["pickupDate", "shipmentPickupDate"],
      form
    ),

    estimated_delivery: valueOf(
      [
        "estimatedDelivery",
        "shipmentEstimatedDelivery"
      ],
      form
    ),

    status:
      valueOf(
        ["status", "shipmentStatus"],
        form
      ) || "Processing"
  };

  if (!payload.customer_name) {
    showToast(
      "Customer name is required.",
      "error"
    );
    return;
  }

  if (!payload.destination_address) {
    showToast(
      "Destination address is required.",
      "error"
    );
    return;
  }

  const button =
    qs('button[type="submit"]', form);

  const originalText = button?.textContent;

  if (button) {
    button.disabled = true;
    button.textContent = "Creating...";
  }

  try {
    const data = await apiRequest(
      "/api/owner/shipments",
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );

    const shipment =
      data.shipment ||
      data.data ||
      data;

    closeModal();

    form.reset();

    showToast(
      shipment.tracking_number
        ? `Shipment created. Tracking number: ${shipment.tracking_number}`
        : "Shipment created successfully."
    );

    await loadDashboard();
  } catch (error) {
    console.error(error);

    showToast(
      error.message ||
      "Unable to create shipment.",
      "error"
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent =
        originalText ||
        "Create Shipment";
    }
  }
}

/* =========================================================
   UPDATE SHIPMENT STATUS
   ========================================================= */

async function updateShipmentStatus(
  shipmentId,
  status
) {
  if (!shipmentId || !status) return;

  try {
    await apiRequest(
      `/api/owner/shipments/${shipmentId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status
        })
      }
    );

    showToast(
      "Shipment status updated."
    );

    await loadDashboard();
  } catch (error) {
    console.error(error);

    showToast(
      error.message ||
      "Unable to update shipment status.",
      "error"
    );
  }
}

/* =========================================================
   SHIPMENT EDITOR
   ========================================================= */

function openShipmentEditor(id) {
  const shipment =
    shipmentsCache.find(
      (item) => Number(item.id) === Number(id)
    );

  if (!shipment) {
    showToast(
      "Shipment could not be found.",
      "error"
    );
    return;
  }

  const modal =
    $("shipmentEditorModal") ||
    $("shipmentModal");

  if (!modal) {
    showToast(
      `Tracking number: ${
        shipment.tracking_number || "—"
      }`
    );
    return;
  }

  const tracking =
    $("editTrackingNumber");

  const customer =
    $("editCustomerName");

  const status =
    $("editShipmentStatus");

  if (tracking) {
    tracking.value =
      shipment.tracking_number || "";
  }

  if (customer) {
    customer.value =
      shipment.customer_name || "";
  }

  if (status) {
    status.value =
      shipment.status || "Processing";
  }

  modal.dataset.shipmentId =
    shipment.id;

  modal.classList.add("active");
  modal.style.display = "";
}

/* =========================================================
   BOOKINGS
   ========================================================= */

async function loadBookings() {
  try {
    const data = await apiRequest(
      "/api/owner/bookings"
    );

    bookingsCache =
      data.bookings ||
      data.data ||
      data.results ||
      [];

    renderBookings(bookingsCache);
  } catch (error) {
    console.error("Bookings:", error);

    showTableError(
      ["bookingsTableBody"],
      "Unable to load bookings."
    );
  }
}

function renderBookings(bookings) {
  const body = $("bookingsTableBody");

  if (!body) return;

  if (!bookings.length) {
    body.innerHTML = emptyRow(
      7,
      "No bookings yet."
    );
    return;
  }

  body.innerHTML = bookings
    .map(
      (booking) => `
        <tr>
          <td>
            ${escapeHTML(
              booking.sender_name || "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              booking.recipient_name || "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              booking.pickup_address || "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              booking.destination_address ||
              "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              booking.package_type || "—"
            )}
          </td>

          <td>
            ${statusBadge(booking.status)}
          </td>

          <td>
            ${formatDate(
              booking.created_at
            )}
          </td>
        </tr>
      `
    )
    .join("");
}

/* =========================================================
   QUOTES
   ========================================================= */

async function loadQuotes() {
  try {
    const data = await apiRequest(
      "/api/owner/quotes"
    );

    quotesCache =
      data.quotes ||
      data.data ||
      data.results ||
      [];

    renderQuotes(quotesCache);
  } catch (error) {
    console.error("Quotes:", error);

    showTableError(
      ["quotesTableBody"],
      "Unable to load quotes."
    );
  }
}

function renderQuotes(quotes) {
  const body = $("quotesTableBody");

  if (!body) return;

  if (!quotes.length) {
    body.innerHTML = emptyRow(
      6,
      "No quote requests yet."
    );
    return;
  }

  body.innerHTML = quotes
    .map(
      (quote) => `
        <tr>
          <td>
            ${escapeHTML(
              quote.name || "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              quote.email || "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              quote.origin || "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              quote.destination || "—"
            )}
          </td>

          <td>
            ${statusBadge(quote.status)}
          </td>

          <td>
            ${formatDate(
              quote.created_at
            )}
          </td>
        </tr>
      `
    )
    .join("");
}

/* =========================================================
   MESSAGES
   ========================================================= */

async function loadMessages() {
  try {
    const data = await apiRequest(
      "/api/owner/messages"
    );

    messagesCache =
      data.messages ||
      data.data ||
      data.results ||
      [];

    renderMessages(messagesCache);
  } catch (error) {
    console.error("Messages:", error);

    showTableError(
      ["messagesTableBody"],
      "Unable to load messages."
    );
  }
}

function renderMessages(messages) {
  const body = $("messagesTableBody");

  if (!body) return;

  if (!messages.length) {
    body.innerHTML = emptyRow(
      5,
      "No messages yet."
    );
    return;
  }

  body.innerHTML = messages
    .map(
      (message) => `
        <tr>
          <td>
            ${escapeHTML(
              message.name || "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              message.email || "—"
            )}
          </td>

          <td class="message-preview">
            ${escapeHTML(
              message.message || "—"
            )}
          </td>

          <td>
            ${statusBadge(message.status)}
          </td>

          <td>
            ${formatDate(
              message.created_at
            )}
          </td>
        </tr>
      `
    )
    .join("");
}

/* =========================================================
   CUSTOMERS
   ========================================================= */

async function loadCustomers() {
  try {
    const data = await apiRequest(
      "/api/owner/customers"
    );

    customersCache =
      data.customers ||
      data.data ||
      data.results ||
      [];

    renderCustomers(customersCache);
  } catch (error) {
    console.error("Customers:", error);

    showTableError(
      ["customersTableBody"],
      "Unable to load customers."
    );
  }
}

function renderCustomers(customers) {
  const body = $("customersTableBody");

  if (!body) return;

  if (!customers.length) {
    body.innerHTML = emptyRow(
      5,
      "No customers yet."
    );
    return;
  }

  body.innerHTML = customers
    .map(
      (customer) => `
        <tr>
          <td>
            <strong>
              ${escapeHTML(
                customer.name || "—"
              )}
            </strong>
          </td>

          <td>
            ${escapeHTML(
              customer.email || "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              customer.phone || "—"
            )}
          </td>

          <td>
            ${escapeHTML(
              customer.address || "—"
            )}
          </td>

          <td>
            ${formatDate(
              customer.created_at
            )}
          </td>
        </tr>
      `
    )
    .join("");
}

/* =========================================================
   SEARCH / FILTER
   ========================================================= */

function setupShipmentSearch() {
  const searchInput =
    $("shipmentSearch") ||
    $("searchShipments");

  const statusFilter =
    $("shipmentStatusFilter") ||
    $("statusFilter");

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      filterShipments
    );
  }

  if (statusFilter) {
    statusFilter.addEventListener(
      "change",
      filterShipments
    );
  }
}

function filterShipments() {
  const searchInput =
    $("shipmentSearch") ||
    $("searchShipments");

  const statusFilter =
    $("shipmentStatusFilter") ||
    $("statusFilter");

  const search =
    searchInput?.value
      .trim()
      .toLowerCase() || "";

  const status =
    statusFilter?.value || "";

  const filtered =
    shipmentsCache.filter((shipment) => {
      const searchable = [
        shipment.tracking_number,
        shipment.customer_name,
        shipment.customer_email,
        shipment.customer_phone,
        shipment.sender_name,
        shipment.recipient_name,
        shipment.destination_address,
        shipment.service_type,
        shipment.status
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search ||
        searchable.includes(search);

      const matchesStatus =
        !status ||
        status === "all" ||
        String(shipment.status)
          .toLowerCase() ===
          status.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  renderShipments(filtered);
}

/* =========================================================
   MODALS
   ========================================================= */

function openModal(id = "shipmentModal") {
  const modal = $(id);

  if (!modal) return;

  modal.classList.add("active");
  modal.style.display = "";
}

function closeModal(id = null) {
  const modal =
    id
      ? $(id)
      : qs(
          ".modal.active, .modal.open"
        );

  if (!modal) return;

  modal.classList.remove("active");
  modal.classList.remove("open");

  modal.style.display = "none";
}

function setupModalClosing() {
  document.addEventListener(
    "click",
    (event) => {
      const target =
        event.target.closest(
          "[data-close-modal], .modal-close, .close-modal"
        );

      if (target) {
        const modal =
          target.closest(".modal");

        closeModal(
          modal?.id || null
        );
      }

      if (
        event.target.classList.contains(
          "modal"
        )
      ) {
        closeModal(
          event.target.id
        );
      }
    }
  );
}

/* =========================================================
   PROFILE SETTINGS
   ========================================================= */

async function updateProfile(event) {
  if (event) event.preventDefault();

  const form = event.target;

  const name =
    valueOf(
      [
        "profileNameInput",
        "ownerProfileName",
        "settingsName"
      ],
      form
    );

  const email =
    valueOf(
      [
        "profileEmailInput",
        "ownerProfileEmail",
        "settingsEmail"
      ],
      form
    );

  if (!name || !email) {
    showToast(
      "Name and email are required.",
      "error"
    );
    return;
  }

  try {
    const data = await apiRequest(
      "/api/owner/profile",
      {
        method: "PATCH",
        body: JSON.stringify({
          name,
          email
        })
      }
    );

    currentOwner =
      data.user ||
      data.owner ||
      {
        ...(currentOwner || {}),
        name,
        email
      };

    localStorage.setItem(
      "sdl_owner_user",
      JSON.stringify(currentOwner)
    );

    updateOwnerIdentity();

    showToast(
      "Profile updated successfully."
    );
  } catch (error) {
    showToast(
      error.message ||
      "Profile update is not available yet.",
      "error"
    );
  }
}

/* =========================================================
   PASSWORD CHANGE
   ========================================================= */

async function updatePassword(event) {
  if (event) event.preventDefault();

  const form = event.target;

  const currentPassword =
    valueOf(
      [
        "currentPassword",
        "oldPassword"
      ],
      form
    );

  const newPassword =
    valueOf(
      [
        "newPassword",
        "password"
      ],
      form
    );

  const confirmPassword =
    valueOf(
      [
        "confirmPassword",
        "passwordConfirm"
      ],
      form
    );

  if (!currentPassword || !newPassword) {
    showToast(
      "Complete all password fields.",
      "error"
    );
    return;
  }

  if (
    confirmPassword &&
    newPassword !== confirmPassword
  ) {
    showToast(
      "New passwords do not match.",
      "error"
    );
    return;
  }

  if (newPassword.length < 8) {
    showToast(
      "Password must contain at least 8 characters.",
      "error"
    );
    return;
  }

  try {
    await apiRequest(
      "/api/owner/password",
      {
        method: "PATCH",
        body: JSON.stringify({
          current_password:
            currentPassword,
          new_password:
            newPassword
        })
      }
    );

    form.reset();

    showToast(
      "Password changed successfully."
    );
  } catch (error) {
    showToast(
      error.message ||
      "Password change is not available yet.",
      "error"
    );
  }
}

/* =========================================================
   EVENT BINDING
   ========================================================= */

function setupForms() {
  const loginForm =
    $("loginForm");

  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      login
    );
  }

  const shipmentForm =
    $("shipmentForm") ||
    $("createShipmentForm");

  if (shipmentForm) {
    shipmentForm.addEventListener(
      "submit",
      createShipment
    );
  }

  const profileForm =
    $("profileForm");

  if (profileForm) {
    profileForm.addEventListener(
      "submit",
      updateProfile
    );
  }

  const passwordForm =
    $("passwordForm");

  if (passwordForm) {
    passwordForm.addEventListener(
      "submit",
      updatePassword
    );
  }

  const logoutButtons =
    qsa(
      "#logoutBtn, .logout-btn, [data-action='logout']"
    );

  logoutButtons.forEach((button) => {
    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        logout();
      }
    );
  });
}

/* =========================================================
   HELPERS
   ========================================================= */

function setText(ids, value) {
  ids.forEach((id) => {
    const element = $(id);

    if (element) {
      element.textContent =
        value ?? 0;
    }
  });
}

function valueOf(ids, parent = document) {
  for (const id of ids) {
    const element =
      $(id) ||
      parent.querySelector?.(`#${id}`);

    if (element) {
      return element.value?.trim() || "";
    }
  }

  return "";
}

function numberValue(ids, parent = document) {
  const value =
    valueOf(ids, parent);

  if (value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function statusBadge(status) {
  const clean =
    status || "Processing";

  const normalized =
    String(clean)
      .toLowerCase()
      .replace(/\s+/g, "-");

  return `
    <span class="status-badge status-${escapeHTML(
      normalized
    )}">
      ${escapeHTML(clean)}
    </span>
  `;
}

function emptyRow(
  colspan,
  message
) {
  return `
    <tr>
      <td
        colspan="${colspan}"
        style="text-align:center;padding:30px;"
      >
        ${escapeHTML(message)}
      </td>
    </tr>
  `;
}

function showTableError(
  ids,
  message
) {
  ids.forEach((id) => {
    const body = $(id);

    if (body) {
      body.innerHTML =
        emptyRow(
          8,
          message
        );
    }
  });
}

/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function setupMobileMenu() {
  const menuButton =
    $("mobileMenuButton") ||
    $("menuToggle") ||
    $(".mobile-menu-button");

  const sidebar =
    $("sidebar") ||
    qs(".sidebar");

  if (!menuButton || !sidebar) {
    return;
  }

  menuButton.addEventListener(
    "click",
    () => {
      sidebar.classList.toggle(
        "mobile-open"
      );
    }
  );
}

/* =========================================================
   QUICK ACTIONS
   ========================================================= */

function setupQuickActions() {
  qsa(
    "[data-action='create-shipment'], #createShipmentBtn, #newShipmentBtn"
  ).forEach((button) => {
    button.addEventListener(
      "click",
      () => openModal()
    );
  });

  qsa(
    "[data-action='refresh'], #refreshDashboard"
  ).forEach((button) => {
    button.addEventListener(
      "click",
      async () => {
        button.disabled = true;

        try {
          await loadDashboard();
          showToast(
            "Dashboard refreshed."
          );
        } finally {
          button.disabled = false;
        }
      }
    );
  });
}

/* =========================================================
   AUTH CHECK
   ========================================================= */

async function checkAuthentication() {
  if (!authToken) {
    showLogin();
    return false;
  }

  try {
    const data = await apiRequest(
      "/api/auth/me"
    );

    currentOwner =
      data.user ||
      data.owner ||
      currentOwner;

    localStorage.setItem(
      "sdl_owner_user",
      JSON.stringify(
        currentOwner || {}
      )
    );

    showDashboard();
    updateOwnerIdentity();

    return true;
  } catch (error) {
    console.warn(
      "Authentication check:",
      error
    );

    logout(false);

    return false;
  }
}

/* =========================================================
   KEYBOARD SUPPORT
   ========================================================= */

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape"
    ) {
      closeModal();
    }
  }
);

/* =========================================================
   INITIALIZATION
   ========================================================= */

async function initializeOwnerDashboard() {
  setupForms();
  setupNavigation();
  setupShipmentSearch();
  setupModalClosing();
  setupMobileMenu();
  setupQuickActions();

  const authenticated =
    await checkAuthentication();

  if (!authenticated) {
    return;
  }

  await loadDashboard();

  /*
    Default page.
  */
  navigateTo("overview");
}

/* =========================================================
   GLOBAL FUNCTIONS
   =========================================================
   These are intentionally exposed so buttons already
   present in owner.html can call them directly.
   ========================================================= */

window.login = login;
window.logout = logout;

window.openModal = openModal;
window.closeModal = closeModal;

window.openShipmentEditor =
  openShipmentEditor;

window.updateShipmentStatus =
  updateShipmentStatus;

window.createShipment =
  createShipment;

window.loadDashboard =
  loadDashboard;

window.filterShipments =
  filterShipments;

/* =========================================================
   START
   ========================================================= */

if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializeOwnerDashboard
  );
} else {
  initializeOwnerDashboard();
}
