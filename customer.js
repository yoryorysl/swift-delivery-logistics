/* =========================================
   SWIFT DELIVERY LOGISTICS
   CUSTOMER DASHBOARD
   customer.js
========================================= */

const API_BASE =
  "https://swift-delivery-api.ypbp7sc2wp.workers.dev";

const TOKEN_KEY = "swift_customer_token";

let customerToken = localStorage.getItem(TOKEN_KEY);
let customerData = null;
let customerShipments = [];
let customerQuotes = [];


/* =========================================
   DOM HELPERS
========================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


/* =========================================
   API HELPER
========================================= */

async function apiRequest(
  endpoint,
  options = {},
  requiresAuth = true
) {
  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  };

  if (requiresAuth && customerToken) {
    config.headers.Authorization =
      `Bearer ${customerToken}`;
  }

  if (options.body !== undefined) {
    config.body =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
  }

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    config
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}


/* =========================================
   LOGIN
========================================= */

async function loginCustomer(email, password) {

  const loginButton = $("#loginButton");
  const loginMessage = $("#loginMessage");

  loginMessage.textContent = "";
  loginMessage.className = "form-message";

  loginButton.disabled = true;
  loginButton.innerHTML = `
    <span>Signing in...</span>
  `;

  try {

    const data = await apiRequest(
      "/api/auth/login",
      {
        method: "POST",
        body: {
          email,
          password
        }
      },
      false
    );

    if (!data?.token) {
      throw new Error(
        "Login succeeded but no session token was returned."
      );
    }

    customerToken = data.token;

    localStorage.setItem(
      TOKEN_KEY,
      customerToken
    );

    customerData =
      data.user ||
      data.customer ||
      null;

    showCustomerApp();

    await initializeDashboard();

  } catch (error) {

    loginMessage.textContent =
      error.message ||
      "Unable to sign in.";

    loginMessage.className =
      "form-message error";

  } finally {

    loginButton.disabled = false;

    loginButton.innerHTML = `
      <span>Sign In</span>
      <span class="button-arrow">→</span>
    `;
  }
}


/* =========================================
   LOGOUT
========================================= */

async function logoutCustomer() {

  try {

    if (customerToken) {
      await apiRequest(
        "/api/auth/logout",
        {
          method: "POST"
        },
        true
      );
    }

  } catch {
    // Local logout still happens if API logout fails.
  }

  customerToken = null;
  customerData = null;

  localStorage.removeItem(TOKEN_KEY);

  $("#customerApp")?.classList.add("hidden");
  $("#customerLogin")?.classList.remove("hidden");

  if ($("#customerPassword")) {
    $("#customerPassword").value = "";
  }

  if ($("#customerEmail")) {
    $("#customerEmail").focus();
  }
}


/* =========================================
   AUTH CHECK
========================================= */

async function checkExistingSession() {

  if (!customerToken) {
    showLoginScreen();
    return;
  }

  try {

    /*
      The API may expose /api/auth/me.
      If available, use it to restore the account.
    */

    const data = await apiRequest(
      "/api/auth/me",
      {
        method: "GET"
      },
      true
    );

    customerData =
      data?.user ||
      data?.customer ||
      data ||
      null;

    showCustomerApp();

    await initializeDashboard();

  } catch {

    /*
      If the current backend does not expose /api/auth/me,
      we do not keep an unverifiable session.
    */

    customerToken = null;
    customerData = null;

    localStorage.removeItem(TOKEN_KEY);

    showLoginScreen();
  }
}


/* =========================================
   SHOW LOGIN
========================================= */

function showLoginScreen() {

  $("#customerLogin")?.classList.remove("hidden");
  $("#customerApp")?.classList.add("hidden");
}


/* =========================================
   SHOW APPLICATION
========================================= */

function showCustomerApp() {

  $("#customerLogin")?.classList.add("hidden");
  $("#customerApp")?.classList.remove("hidden");
}


/* =========================================
   CUSTOMER INFORMATION
========================================= */

function getCustomerName() {

  if (!customerData) {
    return "Customer";
  }

  return (
    customerData.name ||
    customerData.full_name ||
    customerData.fullName ||
    customerData.customer_name ||
    customerData.customerName ||
    customerData.email?.split("@")[0] ||
    "Customer"
  );
}


function getCustomerEmail() {

  if (!customerData) {
    return "";
  }

  return (
    customerData.email ||
    customerData.customer_email ||
    ""
  );
}


function getCustomerPhone() {

  if (!customerData) {
    return "";
  }

  return (
    customerData.phone ||
    customerData.customer_phone ||
    ""
  );
}


function getCustomerAddress() {

  if (!customerData) {
    return "";
  }

  return (
    customerData.address ||
    customerData.customer_address ||
    ""
  );
}


/* =========================================
   INITIALIZE DASHBOARD
========================================= */

async function initializeDashboard() {

  updateCustomerIdentity();

  updateYear();

  setupNavigation();

  setupForms();

  setupMobileMenu();

  setupNotifications();

  await loadCustomerData();

  await loadShipments();

  await loadQuotes();

  updateStats();

  renderRecentShipments();

  renderShipmentsTable();

  renderQuotes();

}


/* =========================================
   UPDATE CUSTOMER IDENTITY
========================================= */

function updateCustomerIdentity() {

  const name =
    getCustomerName();

  const email =
    getCustomerEmail();

  const phone =
    getCustomerPhone();

  const address =
    getCustomerAddress();

  const firstLetter =
    name.trim().charAt(0).toUpperCase() || "C";


  if ($("#welcomeName")) {
    $("#welcomeName").textContent =
      name.split(" ")[0] || name;
  }

  if ($("#headerCustomerName")) {
    $("#headerCustomerName").textContent =
      name;
  }

  if ($("#summaryName")) {
    $("#summaryName").textContent =
      name;
  }

  if ($("#summaryEmail")) {
    $("#summaryEmail").textContent =
      email || "No email available";
  }

  if ($("#profileAvatar")) {
    $("#profileAvatar").textContent =
      firstLetter;
  }

  if ($("#miniAvatar")) {
    $("#miniAvatar").textContent =
      firstLetter;
  }

  if ($("#accountName")) {
    $("#accountName").value =
      name;
  }

  if ($("#accountEmail")) {
    $("#accountEmail").value =
      email;
  }

  if ($("#accountPhone")) {
    $("#accountPhone").value =
      phone;
  }

  if ($("#accountAddress")) {
    $("#accountAddress").value =
      address;
  }
}


/* =========================================
   LOAD CUSTOMER DATA
========================================= */

async function loadCustomerData() {

  const endpoints = [
    "/api/customer/profile",
    "/api/customer/me",
    "/api/customer/account"
  ];

  for (const endpoint of endpoints) {

    try {

      const data = await apiRequest(
        endpoint,
        {
          method: "GET"
        },
        true
      );

      if (data) {

        customerData =
          data.customer ||
          data.user ||
          data.profile ||
          data;

        updateCustomerIdentity();

        return;
      }

    } catch {
      // Try next compatible endpoint.
    }
  }
}


/* =========================================
   LOAD SHIPMENTS
========================================= */

async function loadShipments() {

  const containers = [
    "#recentShipments",
    "#shipmentsTable"
  ];

  containers.forEach(selector => {

    const element = $(selector);

    if (element) {
      element.innerHTML = `
        <div class="loading-state">
          Loading shipments...
        </div>
      `;
    }

  });


  const endpoints = [
    "/api/customer/shipments",
    "/api/shipments/mine",
    "/api/customer/my-shipments"
  ];


  for (const endpoint of endpoints) {

    try {

      const data = await apiRequest(
        endpoint,
        {
          method: "GET"
        },
        true
      );

      customerShipments =
        data?.shipments ||
        data?.data ||
        (Array.isArray(data) ? data : []);

      if (!Array.isArray(customerShipments)) {
        customerShipments = [];
      }

      return;

    } catch {
      // Try next endpoint.
    }
  }


  customerShipments = [];

  const recent =
    $("#recentShipments");

  if (recent) {
    recent.innerHTML = `
      <div class="empty-state">
        No shipments are currently available.
      </div>
    `;
  }
}


/* =========================================
   LOAD QUOTES
========================================= */

async function loadQuotes() {

  const container =
    $("#quotesList");

  if (container) {
    container.innerHTML = `
      <div class="loading-state">
        Loading quotes...
      </div>
    `;
  }


  const endpoints = [
    "/api/customer/quotes",
    "/api/quotes/mine",
    "/api/customer/my-quotes"
  ];


  for (const endpoint of endpoints) {

    try {

      const data = await apiRequest(
        endpoint,
        {
          method: "GET"
        },
        true
      );

      customerQuotes =
        data?.quotes ||
        data?.data ||
        (Array.isArray(data) ? data : []);

      if (!Array.isArray(customerQuotes)) {
        customerQuotes = [];
      }

      return;

    } catch {
      // Try next compatible endpoint.
    }
  }


  customerQuotes = [];
}


/* =========================================
   UPDATE STATS
========================================= */

function updateStats() {

  const total =
    customerShipments.length;

  const active =
    customerShipments.filter(
      shipment =>
        normalizeStatus(shipment.status) !== "delivered"
    ).length;

  const delivered =
    customerShipments.filter(
      shipment =>
        normalizeStatus(shipment.status) === "delivered"
    ).length;

  const activeQuotes =
    customerQuotes.filter(
      quote =>
        normalizeStatus(quote.status) !== "closed" &&
        normalizeStatus(quote.status) !== "completed"
    ).length;


  if ($("#totalShipments")) {
    $("#totalShipments").textContent =
      total;
  }

  if ($("#activeShipments")) {
    $("#activeShipments").textContent =
      active;
  }

  if ($("#deliveredShipments")) {
    $("#deliveredShipments").textContent =
      delivered;
  }

  if ($("#activeQuotes")) {
    $("#activeQuotes").textContent =
      activeQuotes;
  }
}


/* =========================================
   STATUS HELPERS
========================================= */

function normalizeStatus(status) {

  return String(
    status || "Processing"
  )
    .trim()
    .toLowerCase();
}


function statusClass(status) {

  const normalized =
    normalizeStatus(status);

  return (
    "status-" +
    normalized
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
  );
}


function statusStepIndex(status) {

  const steps = [
    "processing",
    "picked up",
    "in transit",
    "out for delivery",
    "delivered"
  ];

  const current =
    normalizeStatus(status);

  const index =
    steps.indexOf(current);

  return index >= 0 ? index : 0;
}


/* =========================================
   SHIPMENT HELPERS
========================================= */

function shipmentTracking(shipment) {

  return (
    shipment.tracking_number ||
    shipment.trackingNumber ||
    shipment.tracking ||
    shipment.number ||
    "—"
  );
}


function shipmentOrigin(shipment) {

  return (
    shipment.pickup_address ||
    shipment.pickupAddress ||
    shipment.origin ||
    "—"
  );
}


function shipmentDestination(shipment) {

  return (
    shipment.destination_address ||
    shipment.destinationAddress ||
    shipment.destination ||
    "—"
  );
}


function shipmentService(shipment) {

  return (
    shipment.service_type ||
    shipment.serviceType ||
    shipment.service ||
    "—"
  );
}


function shipmentPackage(shipment) {

  return (
    shipment.package_type ||
    shipment.packageType ||
    "Package"
  );
}


function shipmentWeight(shipment) {

  const weight =
    shipment.weight;

  if (
    weight === undefined ||
    weight === null ||
    weight === ""
  ) {
    return "—";
  }

  return `${weight} kg`;
}


function shipmentDelivery(shipment) {

  const value =
    shipment.estimated_delivery ||
    shipment.estimatedDelivery ||
    shipment.delivery_date ||
    shipment.deliveryDate;

  return formatDate(value);
}


function formatDate(value) {

  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  );
}


/* =========================================
   RECENT SHIPMENTS
========================================= */

function renderRecentShipments() {

  const container =
    $("#recentShipments");

  if (!container) {
    return;
  }

  if (!customerShipments.length) {

    container.innerHTML = `
      <div class="empty-state">
        No shipments yet.
      </div>
    `;

    return;
  }


  const recent =
    [...customerShipments]
      .sort(
        (a, b) =>
          new Date(
            b.created_at ||
            b.createdAt ||
            0
          ) -
          new Date(
            a.created_at ||
            a.createdAt ||
            0
          )
      )
      .slice(0, 5);


  container.innerHTML =
    recent.map(shipment => {

      const tracking =
        shipmentTracking(shipment);

      const status =
        shipment.status ||
        "Processing";

      return `
        <div class="shipment-row">

          <div class="shipment-main">

            <strong>
              ${escapeHTML(tracking)}
            </strong>

            <span>
              ${escapeHTML(
                shipmentService(shipment)
              )}
            </span>

          </div>


          <div class="shipment-location">

            <strong>
              ${escapeHTML(
                shipmentDestination(shipment)
              )}
            </strong>

            <span>
              Destination
            </span>

          </div>


          <div class="shipment-location">

            <strong>
              ${escapeHTML(
                shipmentDelivery(shipment)
              )}
            </strong>

            <span>
              Est. delivery
            </span>

          </div>


          <span class="status-badge ${statusClass(status)}">
            ${escapeHTML(status)}
          </span>

        </div>
      `;

    }).join("");
}


/* =========================================
   SHIPMENTS TABLE
========================================= */

function renderShipmentsTable() {

  const container =
    $("#shipmentsTable");

  if (!container) {
    return;
  }

  if (!customerShipments.length) {

    container.innerHTML = `
      <div class="empty-state">
        You don't have any shipments yet.
      </div>
    `;

    return;
  }


  const search =
    (
      $("#shipmentSearch")?.value ||
      ""
    )
      .trim()
      .toLowerCase();

  const filter =
    $("#shipmentStatusFilter")?.value ||
    "all";


  const filtered =
    customerShipments.filter(shipment => {

      const tracking =
        shipmentTracking(shipment)
          .toLowerCase();

      const status =
        shipment.status ||
        "Processing";


      const matchesSearch =
        !search ||
        tracking.includes(search);


      const matchesStatus =
        filter === "all" ||
        normalizeStatus(status) ===
          normalizeStatus(filter);


      return (
        matchesSearch &&
        matchesStatus
      );
    });


  if (!filtered.length) {

    container.innerHTML = `
      <div class="empty-state">
        No shipments match your search.
      </div>
    `;

    return;
  }


  container.innerHTML = `
    <table class="data-table">

      <thead>

        <tr>

          <th>
            Tracking
          </th>

          <th>
            Service
          </th>

          <th>
            Destination
          </th>

          <th>
            Estimated delivery
          </th>

          <th>
            Status
          </th>

          <th>
            Action
          </th>

        </tr>

      </thead>

      <tbody>

        ${filtered.map(shipment => {

          const tracking =
            shipmentTracking(shipment);

          const status =
            shipment.status ||
            "Processing";

          return `
            <tr>

              <td class="tracking-cell">
                ${escapeHTML(tracking)}
              </td>

              <td>
                ${escapeHTML(
                  shipmentService(shipment)
                )}
              </td>

              <td>
                ${escapeHTML(
                  shipmentDestination(shipment)
                )}
              </td>

              <td>
                ${escapeHTML(
                  shipmentDelivery(shipment)
                )}
              </td>

              <td>
                <span class="status-badge ${statusClass(status)}">
                  ${escapeHTML(status)}
                </span>
              </td>

              <td>
                <button
                  class="view-button"
                  data-track="${escapeAttribute(tracking)}"
                >
                  Track →
                </button>
              </td>

            </tr>
          `;

        }).join("")}

      </tbody>

    </table>
  `;


  container
    .querySelectorAll("[data-track]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const tracking =
            button.dataset.track;

          openTracking(
            tracking
          );

        }
      );

    });
}


/* =========================================
   TRACKING
========================================= */

async function trackShipment(trackingNumber) {

  const message =
    $("#trackingMessage");

  const result =
    $("#trackingResult");

  const button =
    $("#trackingButton");


  if (message) {
    message.textContent =
      "Searching for shipment...";
    message.className =
      "track-message";
  }

  if (result) {
    result.classList.add("hidden");
  }

  if (button) {
    button.disabled = true;
    button.innerHTML = `
      <span>Tracking...</span>
    `;
  }


  try {

    const encoded =
      encodeURIComponent(
        trackingNumber.trim()
      );


    const data =
      await apiRequest(
        `/api/track/${encoded}`,
        {
          method: "GET"
        },
        false
      );


    const shipment =
      data?.shipment ||
      data?.data ||
      data;


    if (!shipment) {
      throw new Error(
        "Shipment could not be found."
      );
    }


    renderTrackingResult(
      shipment
    );


    if (message) {
      message.textContent =
        "Shipment found.";
      message.className =
        "track-message success";
    }


  } catch (error) {

    if (message) {

      message.textContent =
        error.message ||
        "Shipment not found.";

      message.className =
        "track-message error";
    }

  } finally {

    if (button) {

      button.disabled = false;

      button.innerHTML = `
        Track Shipment
        <span>→</span>
      `;
    }

  }
}


/* =========================================
   RENDER TRACKING RESULT
========================================= */

function renderTrackingResult(
  shipment
) {

  const result =
    $("#trackingResult");

  if (!result) {
    return;
  }


  const tracking =
    shipmentTracking(shipment);

  const status =
    shipment.status ||
    "Processing";


  $("#trackingResultNumber").textContent =
    tracking;

  $("#trackingResultStatus").textContent =
    status;

  $("#trackingResultStatus").className =
    `status-badge ${statusClass(status)}`;


  $("#trackingOrigin").textContent =
    shipmentOrigin(shipment);

  $("#trackingDestination").textContent =
    shipmentDestination(shipment);

  $("#trackingService").textContent =
    shipmentService(shipment);

  $("#trackingPackage").textContent =
    shipmentPackage(shipment);

  $("#trackingWeight").textContent =
    shipmentWeight(shipment);

  $("#trackingDelivery").textContent =
    shipmentDelivery(shipment);


  updateTimeline(status);


  result.classList.remove(
    "hidden"
  );

  result.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


/* =========================================
   TIMELINE
========================================= */

function updateTimeline(status) {

  const currentIndex =
    statusStepIndex(status);

  const items =
    $$(
      ".timeline-item"
    );


  items.forEach(
    (item, index) => {

      item.classList.remove(
        "completed",
        "current"
      );


      if (index < currentIndex) {

        item.classList.add(
          "completed"
        );

      } else if (
        index === currentIndex
      ) {

        item.classList.add(
          "current"
        );

      }

    }
  );
}


/* =========================================
   OPEN TRACKING
========================================= */

function openTracking(
  trackingNumber
) {

  navigateTo(
    "tracking"
  );

  if ($("#trackingNumber")) {

    $("#trackingNumber").value =
      trackingNumber;
  }

  trackShipment(
    trackingNumber
  );
}


/* =========================================
   NAVIGATION
========================================= */

function setupNavigation() {

  $$(".nav-item")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const section =
            button.dataset.section;

          navigateTo(section);

          closeSidebar();

        }
      );

    });


  $$("[data-section-link]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          navigateTo(
            button.dataset.sectionLink
          );

          closeSidebar();

        }
      );

    });
}


function navigateTo(
  sectionName
) {

  const sections =
    $$(".dashboard-section");

  sections.forEach(section => {
    section.classList.remove(
      "active-section"
    );
  });


  const target =
    $(`#section-${sectionName}`);

  if (target) {
    target.classList.add(
      "active-section"
    );
  }


  $$(".nav-item")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.section ===
          sectionName
      );

    });


  const titles = {
    overview: "Overview",
    shipments: "My Shipments",
    tracking: "Track Shipment",
    quotes: "My Quotes",
    account: "My Account"
  };


  if ($("#pageTitle")) {

    $("#pageTitle").textContent =
      titles[sectionName] ||
      "Customer Portal";
  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================
   FORMS
========================================= */

function setupForms() {

  $("#customerLoginForm")
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        const email =
          $("#customerEmail")
            .value
            .trim();

        const password =
          $("#customerPassword")
            .value;

        loginCustomer(
          email,
          password
        );

      }
    );


  $("#quickTrackForm")
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        const tracking =
          $("#quickTrackingNumber")
            .value
            .trim();

        if (!tracking) {
          return;
        }

        openTracking(
          tracking
        );

      }
    );


  $("#trackingForm")
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        const tracking =
          $("#trackingNumber")
            .value
            .trim();

        if (!tracking) {
          return;
        }

        trackShipment(
          tracking
        );

      }
    );


  $("#shipmentSearch")
    ?.addEventListener(
      "input",
      renderShipmentsTable
    );


  $("#shipmentStatusFilter")
    ?.addEventListener(
      "change",
      renderShipmentsTable
    );


  $("#logoutButton")
    ?.addEventListener(
      "click",
      logoutCustomer
    );


  $("#togglePassword")
    ?.addEventListener(
      "click",
      togglePassword
    );
}


/* =========================================
   PASSWORD TOGGLE
========================================= */

function togglePassword() {

  const input =
    $("#customerPassword");

  const button =
    $("#togglePassword");

  if (!input || !button) {
    return;
  }


  if (input.type === "password") {

    input.type = "text";

    button.textContent =
      "Hide";

  } else {

    input.type = "password";

    button.textContent =
      "Show";
  }
}


/* =========================================
   MOBILE MENU
========================================= */

function setupMobileMenu() {

  $("#openSidebar")
    ?.addEventListener(
      "click",
      openSidebar
    );

  $("#closeSidebar")
    ?.addEventListener(
      "click",
      closeSidebar
    );

  $("#sidebarOverlay")
    ?.addEventListener(
      "click",
      closeSidebar
    );
}


function openSidebar() {

  $("#customerSidebar")
    ?.classList.add("open");

  $("#sidebarOverlay")
    ?.classList.add("active");
}


function closeSidebar() {

  $("#customerSidebar")
    ?.classList.remove("open");

  $("#sidebarOverlay")
    ?.classList.remove("active");
}


/* =========================================
   NOTIFICATIONS
========================================= */

function setupNotifications() {

  const button =
    $("#notificationButton");

  const panel =
    $("#notificationPanel");

  const close =
    $("#closeNotifications");


  button?.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      panel?.classList.toggle(
        "hidden"
      );

    }
  );


  close?.addEventListener(
    "click",
    () => {

      panel?.classList.add(
        "hidden"
      );

    }
  );


  document.addEventListener(
    "click",
    event => {

      if (
        panel &&
        !panel.contains(event.target) &&
        !button?.contains(event.target)
      ) {

        panel.classList.add(
          "hidden"
        );

      }

    }
  );
}


/* =========================================
   QUOTES
========================================= */

function renderQuotes() {

  const container =
    $("#quotesList");

  if (!container) {
    return;
  }


  if (!customerQuotes.length) {

    container.innerHTML = `
      <div class="empty-state">
        You don't have any quote requests yet.
      </div>
    `;

    return;
  }


  container.innerHTML =
    customerQuotes
      .map(quote => {

        const status =
          quote.status ||
          "New";

        const origin =
          quote.origin ||
          "—";

        const destination =
          quote.destination ||
          "—";

        const message =
          quote.message ||
          "No additional details.";

        return `
          <div class="quote-card">

            <div class="quote-top">

              <div class="quote-name">
                Quote request
              </div>

              <div class="quote-date">
                ${escapeHTML(
                  formatDate(
                    quote.created_at ||
                    quote.createdAt
                  )
                )}
              </div>

            </div>


            <div class="quote-route">

              ${escapeHTML(origin)}
              →

              ${escapeHTML(destination)}

            </div>


            <div class="quote-message">
              ${escapeHTML(message)}
            </div>


            <div style="margin-top:10px">

              <span class="status-badge ${statusClass(status)}">
                ${escapeHTML(status)}
              </span>

            </div>

          </div>
        `;

      })
      .join("");
}


/* =========================================
   YEAR
========================================= */

function updateYear() {

  const year =
    $("#currentYear");

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }
}


/* =========================================
   SECURITY HELPERS
========================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

  return escapeHTML(value)
    .replace(/`/g, "&#096;");
}


/* =========================================
   GLOBAL FUNCTIONS
========================================= */

window.logoutCustomer =
  logoutCustomer;

window.trackShipment =
  trackShipment;

window.openTracking =
  openTracking;

window.navigateTo =
  navigateTo;


/* =========================================
   START APPLICATION
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    updateYear();

    checkExistingSession();

  }
);
