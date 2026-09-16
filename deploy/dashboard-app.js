// Mock Database of Payouts
let payouts = [];

// Exact First Page data from screenshot (Page 1) with PEP, Sanctions, and CoP status
const screenshotData = [
  { id: "572", created: "Jul 13, 2026 11:47AM", venue: "Riverside RSL Club", idv: "None", pep: "—", sanctions: "—", cop: "—", amount: 6000, status: "Draft" },
  { id: "570", created: "Jul 13, 2026 06:31AM", venue: "Riverside RSL Club", idv: "Fail", pep: "Clear", sanctions: "Clear", cop: "No match", amount: 400, status: "Payment Delayed" },
  { id: "569", created: "Jul 10, 2026 11:10AM", venue: "Riverside RSL Club", idv: "Pass", pep: "Clear", sanctions: "Clear", cop: "Match", amount: 999, status: "Payment Completed" },
  { id: "567", created: "Jul 09, 2026 12:31PM", venue: "Riverside RSL Club", idv: "Manual verification", pep: "Clear", sanctions: "Clear", cop: "Close match", amount: 56, status: "Pending Authorisation" },
  { id: "566", created: "Jul 09, 2026 10:22AM", venue: "Riverside RSL Club", idv: "Manual verification", pep: "Pending", sanctions: "Clear", cop: "Close match", amount: 200, status: "Awaiting Approval" },
  { id: "565", created: "Jul 09, 2026 10:10AM", venue: "Riverside RSL Club", idv: "Fail", pep: "Clear", sanctions: "Clear", cop: "No match", amount: 230, status: "Draft" },
  { id: "564", created: "Jul 09, 2026 09:24AM", venue: "Riverside RSL Club", idv: "None", pep: "—", sanctions: "—", cop: "—", amount: 34, status: "Draft" },
  { id: "563", created: "Jul 09, 2026 09:13AM", venue: "Riverside RSL Club", idv: "Fail", pep: "Hit", sanctions: "Clear", cop: "No match", amount: 25000, status: "Failed" },
  { id: "562", created: "Jul 09, 2026 06:57AM", venue: "Riverside RSL Club", idv: "Fail", pep: "Clear", sanctions: "Hit", cop: "No match", amount: 25000, status: "Rejected" },
  { id: "560", created: "Jul 08, 2026 12:50PM", venue: "Riverside RSL Club", idv: "Manual verification", pep: "Clear", sanctions: "Clear", cop: "Close match", amount: 760, status: "Awaiting Approval" },
  { id: "559", created: "Jul 07, 2026 04:21PM", venue: "Riverside RSL Club", idv: "Fail", pep: "Clear", sanctions: "Clear", cop: "Match", amount: 30, status: "Payment Completed" },
  { id: "558", created: "Jul 07, 2026 04:12PM", venue: "Riverside RSL Club", idv: "Pass", pep: "Clear", sanctions: "Clear", cop: "Match", amount: 6500.05, status: "Draft" },
  { id: "557", created: "Jul 07, 2026 04:10PM", venue: "Riverside RSL Club", idv: "Pass", pep: "Clear", sanctions: "Clear", cop: "Match", amount: 35000, status: "Draft" },
  { id: "556", created: "Jul 07, 2026 12:17PM", venue: "Riverside RSL Club", idv: "Manual verification", pep: "Clear", sanctions: "Clear", cop: "Close match", amount: 5000.99, status: "Awaiting Approval" },
  { id: "555", created: "Jul 07, 2026 10:50AM", venue: "Riverside RSL Club", idv: "Fail", pep: "Clear", sanctions: "Clear", cop: "Match", amount: 800, status: "Payment Completed" },
  { id: "554", created: "Jul 07, 2026 07:50AM", venue: "Riverside RSL Club", idv: "Fail", pep: "Hit", sanctions: "Clear", cop: "Close match", amount: 25000, status: "Awaiting Approval" },
  { id: "553", created: "Jul 07, 2026 07:06AM", venue: "Riverside RSL Club", idv: "Fail", pep: "Clear", sanctions: "Hit", cop: "No match", amount: 25000, status: "Failed" },
  { id: "551", created: "Jul 06, 2026 12:59PM", venue: "Riverside RSL Club", idv: "Manual verification", pep: "Clear", sanctions: "Clear", cop: "Close match", amount: 51.4, status: "Draft" },
  { id: "550", created: "Jul 06, 2026 11:20AM", venue: "Riverside RSL Club", idv: "Manual verification", pep: "Clear", sanctions: "Clear", cop: "Match", amount: 536, status: "Payment Completed" },
  { id: "549", created: "Jul 06, 2026 10:48AM", venue: "Riverside RSL Club", idv: "Pass", pep: "Clear", sanctions: "Clear", cop: "Match", amount: 350, status: "Awaiting Approval" }
];

// Initialize and generate rest of the 96 rows
function initMockData() {
  payouts = screenshotData.map(p => {
    let risk = "High";
    if (p.idv === "Pass") risk = "Low";
    else if (p.idv === "Manual verification") risk = "Medium";
    return { ...p, risk };
  });
  
  let currentId = 548;
  const venues = ["Riverside RSL Club", "Riverside Grand Bistro", "Riverside Lounge & Bar", "Riverside Leisure Center"];
  const idvOptions = ["None", "Pass", "Fail", "Manual verification"];
  const statuses = ["Draft", "Payment Delayed", "Payment Completed", "Pending Authorisation", "Awaiting Approval", "Failed", "Rejected"];
  
  // Starting date for generated entries
  let date = new Date(2026, 6, 6, 10, 0); // July 6, 2026 10:00 AM
  
  while (payouts.length < 96) {
    currentId -= Math.floor(Math.random() * 3) + 1; // Decrement IDs organically
    
    // Decrement date organically
    date.setMinutes(date.getMinutes() - (Math.floor(Math.random() * 240) + 30));
    
    const formattedDate = formatDateString(date);
    const randomVenue = venues[Math.floor(Math.random() * venues.length)];
    const randomIdv = idvOptions[Math.floor(Math.random() * idvOptions.length)];
    
    // Amounts: some random values, sometimes round, sometimes decimals
    let amount = Math.floor(Math.random() * 2000) + 15;
    if (Math.random() > 0.8) amount = amount * 10;
    if (Math.random() > 0.9) amount += 0.55;
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    let risk = "High";
    if (randomIdv === "Pass") risk = "Low";
    else if (randomIdv === "Manual verification") risk = "Medium";

    let pep = "Clear";
    let sanctions = "Clear";
    let cop = "Match";

    if (randomIdv === "Pass") {
      pep = "Clear";
      sanctions = "Clear";
      cop = "Match";
    } else if (randomIdv === "Manual verification") {
      pep = Math.random() > 0.8 ? "Pending" : "Clear";
      sanctions = "Clear";
      cop = Math.random() > 0.35 ? "Close match" : "Match";
    } else if (randomIdv === "Fail") {
      const r = Math.random();
      pep = r > 0.7 ? "Hit" : (r > 0.5 ? "Pending" : "Clear");
      sanctions = r > 0.8 ? "Hit" : "Clear";
      cop = Math.random() > 0.25 ? "No match" : "Close match";
    } else { // None
      pep = "—";
      sanctions = "—";
      cop = "—";
    }
    
    payouts.push({
      id: currentId.toString(),
      created: formattedDate,
      venue: randomVenue,
      idv: randomIdv,
      pep: pep,
      sanctions: sanctions,
      cop: cop,
      risk: risk,
      amount: parseFloat(amount),
      status: status
    });
  }
}

// Helpers for dates
function formatDateString(date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = months[date.getMonth()];
  const d = date.getDate().toString().padStart(2, "0");
  const y = date.getFullYear();
  let hr = date.getHours();
  const min = date.getMinutes().toString().padStart(2, "0");
  const ampm = hr >= 12 ? "PM" : "AM";
  hr = hr % 12;
  hr = hr ? hr : 12; // 0 should be 12
  const hrStr = hr.toString().padStart(2, "0");
  return `${m} ${d}, ${y} ${hrStr}:${min}${ampm}`;
}

// State management
let filteredPayouts = [];
let currentPage = 1;
const rowsPerPage = 20;

// Elements
const tableBody = document.getElementById("payouts-table-body");

// Filter UI State
function getCheckedValues(groupName) {
  const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-group="${groupName}"]:checked`);
  return Array.from(checkboxes).map(cb => cb.value);
}

function updateFilterBadge() {
  const badge = document.getElementById("filter-badge");
  if (!badge) return;
  const count = document.querySelectorAll('#filter-popup input[type="checkbox"]:checked').length;
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = "inline-flex";
  } else {
    badge.textContent = "0";
    badge.style.display = "none";
  }
}

const searchInput = document.getElementById("search-input");
const clearBtn = document.getElementById("clear-filters-btn");
const resultCountText = document.getElementById("showing-results");
const paginationContainer = document.getElementById("pagination-container");
const refreshBtn = document.getElementById("refresh-btn");
const refreshIcon = document.getElementById("refresh-icon");
const exportCsvBtn = document.getElementById("export-csv-btn");
const payoutIdvSelect = document.getElementById("payout-idv");
const manualVerifyWrapper = document.getElementById("manual-verify-wrapper");
const consentManualVerify = document.getElementById("consent-manual-verify");

// Modal Elements
const newPayoutBtn = document.getElementById("nav-new-payout");
const modalOverlay = document.getElementById("new-payout-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const newPayoutForm = document.getElementById("new-payout-form");

// Format Currency Utility
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Badge Helpers
function renderIdMatchBadge(idv) {
  if (idv === "Pass") return '<span class="pill pass">Passed</span>';
  if (idv === "Fail") return '<span class="pill fail">Failed</span>';
  if (idv === "Manual verification") return '<span class="pill warn">Manual</span>';
  return '<span class="pill neutral">None</span>';
}

function renderPepSanctionsBadge(val) {
  if (val === "Clear") return '<span class="pill pass">Clear</span>';
  if (val === "Hit") return '<span class="pill fail">Hit</span>';
  if (val === "Pending") return '<span class="pill warn">Pending</span>';
  return '<span class="pill neutral">—</span>';
}

function renderCopBadge(val) {
  if (val === "Match") return '<span class="pill pass">Match</span>';
  if (val === "Close match") return '<span class="pill warn">Close match</span>';
  if (val === "No match") return '<span class="pill fail">No match</span>';
  return '<span class="pill neutral">—</span>';
}

function renderRiskBadge(risk) {
  if (risk === "Low") return '<span class="risk-badge low">Low</span>';
  if (risk === "Medium") return '<span class="risk-badge medium">Medium</span>';
  return '<span class="risk-badge high">High</span>';
}

// Render Table Function
function renderTable() {
  if (!tableBody) return;
  tableBody.innerHTML = "";
  
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredPayouts.length);
  const pageData = filteredPayouts.slice(startIndex, endIndex);
  
  if (pageData.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="10" style="text-align: center; padding: 48px; color: var(--text-muted); font-weight: 600;">No payout transactions match your search criteria.</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  pageData.forEach(p => {
    const row = document.createElement("tr");
    
    // Status modifier class
    const statusClass = p.status.toLowerCase().replace(/\s+/g, "-");
    const amountFormatted = formatCurrency(p.amount);
    
    const idMatchBadge = renderIdMatchBadge(p.idv);
    const pepBadge = renderPepSanctionsBadge(p.pep);
    const sanctionsBadge = renderPepSanctionsBadge(p.sanctions);
    const copBadge = renderCopBadge(p.cop);
    const riskBadge = renderRiskBadge(p.risk);
    
    row.innerHTML = `
      <td class="payout-id-cell">${p.id}</td>
      <td class="font-mono date-cell">${p.created}</td>
      <td class="venue-cell" title="${p.venue}">${p.venue}</td>
      <td>${idMatchBadge}</td>
      <td>${pepBadge}</td>
      <td>${sanctionsBadge}</td>
      <td>${copBadge}</td>
      <td>${riskBadge}</td>
      <td class="payout-amount-cell">${amountFormatted}</td>
      <td><span class="status-pill ${statusClass}">${p.status}</span></td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Render Pagination Function
function renderPagination() {
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";
  
  const totalPages = Math.ceil(filteredPayouts.length / rowsPerPage);
  if (totalPages <= 1) return;
  
  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.className = "pagination-btn";
  prevBtn.innerHTML = "&lt; Previous";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      updateUI();
    }
  });
  paginationContainer.appendChild(prevBtn);
  
  // Number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageNumBtn = document.createElement("button");
    pageNumBtn.className = `pagination-btn ${currentPage === i ? "active" : ""}`;
    pageNumBtn.textContent = i;
    pageNumBtn.addEventListener("click", () => {
      currentPage = i;
      updateUI();
    });
    paginationContainer.appendChild(pageNumBtn);
  }
  
  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.className = "pagination-btn";
  nextBtn.innerHTML = "Next &gt;";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      updateUI();
    }
  });
  paginationContainer.appendChild(nextBtn);
}

// Update Result Count text
function updateResultCount() {
  if (resultCountText) {
    resultCountText.textContent = `Showing ${filteredPayouts.length} results`;
  }
}

// Filter core logic
function applyFilters() {
  const selectedStatus = getCheckedValues("status");
  const selectedKYC = getCheckedValues("kyc");
  const selectedPEP = getCheckedValues("pep");
  const selectedSanctions = getCheckedValues("sanctions");
  const selectedCOP = getCheckedValues("cop");
  const selectedRisk = getCheckedValues("risk");
  const searchQuery = (searchInput && typeof searchInput.value === "string") ? searchInput.value.toLowerCase().trim() : "";
  const isAustracReports = Boolean(document.getElementById("venue-title"));
  
  const payoutVenueFilter = document.getElementById("payoutVenueFilter") || document.getElementById("venue-filter-select");
  const selectedVenue = (payoutVenueFilter && payoutVenueFilter.value !== "all") ? payoutVenueFilter.value : null;

  filteredPayouts = payouts.filter(p => {
    const matchesAustracRisk = !isAustracReports || ["high", "medium"].includes(String(p.risk || "").toLowerCase());
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(p.status);
    const matchesKYC = selectedKYC.length === 0 || selectedKYC.includes(p.idv);
    const matchesPEP = selectedPEP.length === 0 || selectedPEP.includes(p.pep);
    const matchesSanctions = selectedSanctions.length === 0 || selectedSanctions.includes(p.sanctions);
    const matchesCOP = selectedCOP.length === 0 || selectedCOP.includes(p.cop);
    const matchesRisk = selectedRisk.length === 0 || selectedRisk.includes(p.risk);
    const matchesVenue = !selectedVenue || p.venue === selectedVenue;
    const matchesSearch = p.id.toLowerCase().includes(searchQuery) || p.venue.toLowerCase().includes(searchQuery);
    return matchesAustracRisk && matchesStatus && matchesKYC && matchesPEP && matchesSanctions && matchesCOP && matchesRisk && matchesVenue && matchesSearch;
  });
  
  currentPage = 1; // Reset to page 1 on filter
  updateUI();
  updateFilterBadge();
}

function updateUI() {
  renderTable();
  renderPagination();
  updateResultCount();
}

// Refresh logic with loading state
function handleRefresh() {
  // Add animation class
  refreshIcon.classList.add("rotate-anim");
  refreshBtn.disabled = true;
  
  // Render skeleton rows
  tableBody.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const skeletonRow = document.createElement("tr");
    skeletonRow.className = "skeleton-row";
    skeletonRow.innerHTML = `
      <td><div class="skeleton-text" style="width: 50%;"></div></td>
      <td><div class="skeleton-text" style="width: 80%;"></div></td>
      <td><div class="skeleton-text" style="width: 70%;"></div></td>
      <td><div class="skeleton-text" style="width: 55px; height: 22px; border-radius: 20px;"></div></td>
      <td><div class="skeleton-text" style="width: 45px; height: 22px; border-radius: 20px;"></div></td>
      <td><div class="skeleton-text" style="width: 45px; height: 22px; border-radius: 20px;"></div></td>
      <td><div class="skeleton-text" style="width: 60px; height: 22px; border-radius: 20px;"></div></td>
      <td><div class="skeleton-text" style="width: 50px; height: 22px; border-radius: 20px;"></div></td>
      <td><div class="skeleton-text" style="width: 60%;"></div></td>
      <td><div class="skeleton-text" style="width: 80px; height: 24px; border-radius: 20px;"></div></td>
    `;
    tableBody.appendChild(skeletonRow);
  }
  
  setTimeout(() => {
    refreshIcon.classList.remove("rotate-anim");
    refreshBtn.disabled = false;
    applyFilters();
  }, 600);
}

// Export CSV implementation
function exportToCSV() {
  if (filteredPayouts.length === 0) {
    alert("No data available to export.");
    return;
  }
  
  const headers = ["PAYOUT ID", "CREATED", "VENUE", "ID MATCH", "PEP", "SANCTIONS", "COP STATUS", "RISK RATING", "AMOUNT", "STATUS"];
  const csvRows = [headers.join(",")];
  
  filteredPayouts.forEach(p => {
    const values = [
      p.id,
      `"${p.created}"`, // Encapsulate in quotes for comma safety in date string
      `"${p.venue}"`,
      `"${p.idv}"`,
      `"${p.pep}"`,
      `"${p.sanctions}"`,
      `"${p.cop}"`,
      `"${p.risk}"`,
      p.amount,
      `"${p.status}"`
    ];
    csvRows.push(values.join(","));
  });
  
  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `riverside_payouts_export_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Clear all inputs
function clearFilters() {
  document.querySelectorAll('#filter-popup input[type="checkbox"]').forEach(cb => cb.checked = false);
  if (searchInput) searchInput.value = "";
  const payoutVenueFilter = document.getElementById("payoutVenueFilter") || document.getElementById("venue-filter-select");
  if (payoutVenueFilter) payoutVenueFilter.value = "all";
  applyFilters();
}

// Modal open/close actions
function openModal() {
  modalOverlay.classList.add("active");
  const methodSelect = document.getElementById("payout-disbursement-method");
  const methodOptions = {
    cash: ["cash"], bank_transfer: ["bank_transfer"], cheque: ["cheque"],
    cash_and_bank_transfer: ["cash", "bank_transfer"], cash_and_cheque: ["cash", "cheque"]
  };
  const policy = window.RiversideDisbursement ? RiversideDisbursement.readVenuePolicy("Riverside RSL Club") : { allowedMethods: ["cash", "bank_transfer"] };
  [...methodSelect.options].forEach(option => {
    option.disabled = !(methodOptions[option.value] || []).every(method => policy.allowedMethods.includes(method));
  });
  if (methodSelect.selectedOptions[0]?.disabled) methodSelect.value = [...methodSelect.options].find(option => !option.disabled)?.value || "cash";
  document.getElementById("payout-disbursement-hint").textContent = `Venue policy: ${policy.allowedMethods.map(RiversideDisbursement.methodLabel).join(" + ")}.`;
  document.getElementById("payout-amount").focus();
}

function closeModal() {
  modalOverlay.classList.remove("active");
  newPayoutForm.reset();
  manualVerifyWrapper.style.display = "none";
  consentManualVerify.required = false;
}

// Add new payout submit handler
function handleNewPayoutSubmit(e) {
  e.preventDefault();
  
  const venue = document.getElementById("payout-venue").value.trim();
  const idv = document.getElementById("payout-idv").value;
  const amountVal = parseFloat(document.getElementById("payout-amount").value);
  const status = document.getElementById("payout-status").value;
  const disbursementMethod = document.getElementById("payout-disbursement-method").value;
  
  if (isNaN(amountVal) || amountVal <= 0) {
    alert("Please enter a valid amount greater than 0.");
    return;
  }
  
  // Find highest ID
  const allIds = payouts.map(p => parseInt(p.id)).filter(id => !isNaN(id));
  const newId = (allIds.length > 0 ? Math.max(...allIds) + 1 : 1).toString();
  
  // Calculate risk and screening values
  let risk = "High";
  let pep = "Clear";
  let sanctions = "Clear";
  let cop = "Match";

  if (idv === "Pass") {
    risk = "Low";
    cop = "Match";
  } else if (idv === "Manual verification") {
    risk = "Medium";
    cop = "Close match";
  } else if (idv === "Fail") {
    risk = "High";
    cop = "No match";
  } else {
    risk = "High";
    pep = "—";
    sanctions = "—";
    cop = "—";
  }
  
  const newPayout = {
    id: newId,
    created: formatDateString(new Date()),
    venue: venue,
    idv: idv,
    pep: pep,
    sanctions: sanctions,
    cop: cop,
    risk: risk,
    amount: amountVal,
    disbursementMethod,
    status: status
  };
  
  // Prepend to database
  payouts.unshift(newPayout);
  
  closeModal();
  
  // Reset filters to show the new item at the top
  document.querySelectorAll('#filter-popup input[type="checkbox"]').forEach(cb => cb.checked = false);
  if (searchInput) searchInput.value = "";
  applyFilters();
}

// Scroll Entry Animation Observer Init
function initScrollAnimations() {
  const sections = document.querySelectorAll('.fade-in-section');
  const observerOptions = {
    root: null,
    threshold: 0.05,
    rootMargin: "0px 0px -40px 0px"
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  sections.forEach(section => {
    observer.observe(section);
  });
}

// Popup Toggle Logic
const filterBtn = document.getElementById("filter-btn");
const filterPopup = document.getElementById("filter-popup");

if (filterBtn && filterPopup) {
  filterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    filterPopup.classList.toggle("is-open");
  });

  filterPopup.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent closing when clicking inside popup
  });

  document.addEventListener("click", () => {
    filterPopup.classList.remove("is-open");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") filterPopup.classList.remove("is-open");
  });
}

// Checkbox Change Listeners
const filterCheckboxes = document.querySelectorAll('#filter-popup input[type="checkbox"]');
filterCheckboxes.forEach(cb => {
  cb.addEventListener("change", applyFilters);
});

const popupSelectAll = document.getElementById("popup-select-all");
const popupClear = document.getElementById("popup-clear");

if (popupSelectAll) {
  popupSelectAll.addEventListener("click", () => {
    filterCheckboxes.forEach(cb => cb.checked = true);
    applyFilters();
  });
}

if (popupClear) {
  popupClear.addEventListener("click", () => {
    filterCheckboxes.forEach(cb => cb.checked = false);
    applyFilters();
  });
}

// Bind Listeners
if (clearBtn) clearBtn.addEventListener("click", clearFilters);
if (refreshBtn) refreshBtn.addEventListener("click", handleRefresh);
if (exportCsvBtn) exportCsvBtn.addEventListener("click", exportToCSV);

// Instant search (trigger filter on input)
if (searchInput) searchInput.addEventListener("input", applyFilters);

const payoutVenueSelectEl = document.getElementById("payoutVenueFilter") || document.getElementById("venue-filter-select");
if (payoutVenueSelectEl) payoutVenueSelectEl.addEventListener("change", applyFilters);

// Modal Listeners
if (newPayoutBtn) newPayoutBtn.addEventListener("click", openModal);
if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
if (modalCancelBtn) modalCancelBtn.addEventListener("click", closeModal);

// Close modal if user clicks outside the modal card
if (modalOverlay) {
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
}

if (payoutIdvSelect) {
  payoutIdvSelect.addEventListener("change", () => {
    if (payoutIdvSelect.value === "Manual verification" || payoutIdvSelect.value === "Fail") {
      manualVerifyWrapper.style.display = "block";
      consentManualVerify.required = true;
    } else {
      manualVerifyWrapper.style.display = "none";
      consentManualVerify.required = false;
      consentManualVerify.checked = false;
    }
  });
}

if (newPayoutForm) newPayoutForm.addEventListener("submit", handleNewPayoutSubmit);

// Init Execution
initMockData();

// If on venue-transactions page, filter payouts by venue
const venueStorage = sessionStorage.getItem('selectedVenueContext') || sessionStorage.getItem('venueConfigData');
let venueFilter = null;
if (venueStorage && window.location.pathname.includes('venue-transactions')) {
  try {
    const venueData = JSON.parse(venueStorage);
    venueFilter = venueData.venueName || venueData.name;
    if (venueFilter) {
      payouts = payouts.filter(p => p.venue === venueFilter);
      const prefillVenue = document.getElementById("payout-venue");
      if (prefillVenue) prefillVenue.value = venueFilter;
    }
  } catch(e) {}
}

// If on austrac-transactions or super-admin-smr page, filter out Low risk payouts
if (window.location.pathname.includes('austrac-transactions') || window.location.pathname.includes('super-admin-smr')) {
  payouts = payouts.filter(p => p.risk === 'High' || p.risk === 'Medium');
}

filteredPayouts = [...payouts];
if (tableBody) {
  updateUI();
}
initScrollAnimations();
console.log("Payouts dashboard application loaded successfully!");

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const headerNav = document.querySelector('.header-nav');
  if(menuBtn && headerNav && !document.body.classList.contains('admin-shell-page')) {
    menuBtn.addEventListener('click', () => {
      headerNav.classList.toggle('is-open');
    });
  }

  // Row click handler for table entries
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      const tr = e.target.closest('tr');
      if (!tr || tr.classList.contains('skeleton-row')) return;
      
      const idCell = tr.querySelector('.payout-id-cell');
      if (!idCell) return;
      
      const isAustracPage = window.location.pathname.includes('austrac-transactions') || window.location.pathname.includes('super-admin-smr');
      if (isAustracPage) {
        const payoutId = idCell.textContent.trim();
        const payout = filteredPayouts.find(p => p.id === payoutId);
        if (payout) {
          sessionStorage.setItem('austracTransactionData', JSON.stringify({
            id: payout.id,
            venue: payout.venue,
            created: payout.created,
            amount: payout.amount,
            risk: payout.risk,
            idv: payout.idv,
            pep: payout.pep,
            sanctions: payout.sanctions,
            cop: payout.cop
          }));
        }
        window.location.href = 'austrac-report-helper.html';
      } else {
        // Dashboard / Payouts entry -> Route to Authoriser view
        window.location.href = 'authoriser_v3.html';
      }
    });
  }
});
