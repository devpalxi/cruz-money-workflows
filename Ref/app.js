// Mock Database of Payouts
let payouts = [];

// Exact First Page data from screenshot (Page 1)
const screenshotData = [
  { id: "572", created: "Jul 13, 2026 11:47AM", venue: "Riverside RSL Club", idv: "None", amount: 6000, eta: "-", status: "Draft" },
  { id: "570", created: "Jul 13, 2026 06:31AM", venue: "Riverside RSL Club", idv: "Fail", amount: 400, eta: "13h 20m", status: "Payment Delayed" },
  { id: "569", created: "Jul 10, 2026 11:10AM", venue: "Riverside RSL Club", idv: "Pass", amount: 999, eta: "-", status: "Payment Completed" },
  { id: "567", created: "Jul 09, 2026 12:31PM", venue: "Riverside RSL Club", idv: "Manual verification", amount: 56, eta: "-", status: "Pending Authorisation" },
  { id: "566", created: "Jul 09, 2026 10:22AM", venue: "Riverside RSL Club", idv: "Manual verification", amount: 200, eta: "-", status: "Awaiting Approval" },
  { id: "565", created: "Jul 09, 2026 10:10AM", venue: "Riverside RSL Club", idv: "Fail", amount: 230, eta: "-", status: "Draft" },
  { id: "564", created: "Jul 09, 2026 09:24AM", venue: "Riverside RSL Club", idv: "None", amount: 34, eta: "-", status: "Draft" },
  { id: "563", created: "Jul 09, 2026 09:13AM", venue: "Riverside RSL Club", idv: "Fail", amount: 25000, eta: "-", status: "Failed" },
  { id: "562", created: "Jul 09, 2026 06:57AM", venue: "Riverside RSL Club", idv: "Fail", amount: 25000, eta: "-", status: "Rejected" },
  { id: "560", created: "Jul 08, 2026 12:50PM", venue: "Riverside RSL Club", idv: "Manual verification", amount: 760, eta: "-", status: "Awaiting Approval" },
  { id: "559", created: "Jul 07, 2026 04:21PM", venue: "Riverside RSL Club", idv: "Fail", amount: 30, eta: "-", status: "Payment Completed" },
  { id: "558", created: "Jul 07, 2026 04:12PM", venue: "Riverside RSL Club", idv: "Pass", amount: 6500.05, eta: "-", status: "Draft" },
  { id: "557", created: "Jul 07, 2026 04:10PM", venue: "Riverside RSL Club", idv: "Pass", amount: 35000, eta: "-", status: "Draft" },
  { id: "556", created: "Jul 07, 2026 12:17PM", venue: "Riverside RSL Club", idv: "Manual verification", amount: 5000.99, eta: "-", status: "Awaiting Approval" },
  { id: "555", created: "Jul 07, 2026 10:50AM", venue: "Riverside RSL Club", idv: "Fail", amount: 800, eta: "-", status: "Payment Completed" },
  { id: "554", created: "Jul 07, 2026 07:50AM", venue: "Riverside RSL Club", idv: "Fail", amount: 25000, eta: "-", status: "Awaiting Approval" },
  { id: "553", created: "Jul 07, 2026 07:06AM", venue: "Riverside RSL Club", idv: "Fail", amount: 25000, eta: "-", status: "Failed" },
  { id: "551", created: "Jul 06, 2026 12:59PM", venue: "Riverside RSL Club", idv: "Manual verification", amount: 51.4, eta: "-", status: "Draft" },
  { id: "550", created: "Jul 06, 2026 11:20AM", venue: "Riverside RSL Club", idv: "Manual verification", amount: 536, eta: "-", status: "Payment Completed" },
  { id: "549", created: "Jul 06, 2026 10:48AM", venue: "Riverside RSL Club", idv: "Pass", amount: 350, eta: "-", status: "Awaiting Approval" }
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
    const eta = (status === "Payment Delayed") ? `${Math.floor(Math.random() * 20) + 2}h ${Math.floor(Math.random() * 59)}m` : "-";
    
    let risk = "High";
    if (randomIdv === "Pass") risk = "Low";
    else if (randomIdv === "Manual verification") risk = "Medium";
    
    payouts.push({
      id: currentId.toString(),
      created: formattedDate,
      venue: randomVenue,
      idv: randomIdv,
      risk: risk,
      amount: parseFloat(amount),
      eta: eta,
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
const statusSelect = document.getElementById("status-select");
const searchInput = document.getElementById("search-input");
const applyBtn = document.getElementById("apply-filters-btn");
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


// Render Table Function
function renderTable() {
  tableBody.innerHTML = "";
  
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredPayouts.length);
  const pageData = filteredPayouts.slice(startIndex, endIndex);
  
  if (pageData.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="7" style="text-align: center; padding: 48px; color: var(--text-muted); font-weight: 600;">No payout transactions match your search criteria.</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  pageData.forEach(p => {
    const row = document.createElement("tr");
    
    // Status modifier class
    const statusClass = p.status.toLowerCase().replace(/\s+/g, "-");
    const amountFormatted = formatCurrency(p.amount);
    
    // KYC badge mapping
    let kycBadge = "";
    if (p.idv === "Pass") {
      kycBadge = '<span class="kyc-badge pass">KYC PASSED</span>';
    } else if (p.idv === "Fail") {
      kycBadge = '<span class="kyc-badge fail">KYC FAILED</span>';
    } else if (p.idv === "Manual verification") {
      kycBadge = '<span class="kyc-badge manual">MANUAL VERIFY</span>';
    } else {
      kycBadge = '<span class="kyc-badge none">UNVERIFIED</span>';
    }
    
    // Risk badge mapping
    let riskBadge = "";
    if (p.risk === "Low") {
      riskBadge = '<span class="risk-badge low">LOW RISK</span>';
    } else if (p.risk === "Medium") {
      riskBadge = '<span class="risk-badge medium">MEDIUM RISK</span>';
    } else {
      riskBadge = '<span class="risk-badge high">HIGH RISK</span>';
    }
    
    row.innerHTML = `
      <td class="payout-id-cell">${p.id}</td>
      <td class="font-mono" style="font-size: 13px;">${p.created}</td>
      <td>${p.venue}</td>
      <td>${kycBadge}</td>
      <td>${riskBadge}</td>
      <td class="payout-amount-cell">${amountFormatted}</td>
      <td class="font-mono" style="font-size: 13px;">${p.eta}</td>
      <td><span class="status-pill ${statusClass}">${p.status}</span></td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Render Pagination Function
function renderPagination() {
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
  resultCountText.textContent = `Showing ${filteredPayouts.length} results`;
}

// Filter core logic
function applyFilters() {
  const selectedStatus = statusSelect.value;
  const searchQuery = searchInput.value.toLowerCase().trim();
  
  filteredPayouts = payouts.filter(p => {
    const matchesStatus = (selectedStatus === "All" || p.status === selectedStatus);
    const matchesSearch = p.id.toLowerCase().includes(searchQuery) || p.venue.toLowerCase().includes(searchQuery);
    return matchesStatus && matchesSearch;
  });
  
  currentPage = 1; // Reset to page 1 on filter
  updateUI();
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
      <td><div class="skeleton-text" style="width: 40%;"></div></td>
      <td><div class="skeleton-text" style="width: 40%;"></div></td>
      <td><div class="skeleton-text" style="width: 60%;"></div></td>
      <td><div class="skeleton-text" style="width: 30%;"></div></td>
      <td><div class="skeleton-text" style="width: 80px; height: 24px; border-radius: 4px;"></div></td>
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
  
  const headers = ["PAYOUT ID", "CREATED", "VENUE", "KYC (IDV)", "RISK RATING", "AMOUNT", "PAYMENT ETA", "STATUS"];
  const csvRows = [headers.join(",")];
  
  filteredPayouts.forEach(p => {
    const values = [
      p.id,
      `"${p.created}"`, // Encapsulate in quotes for comma safety in date string
      `"${p.venue}"`,
      p.idv,
      p.risk,
      p.amount,
      p.eta,
      p.status
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
  statusSelect.value = "All";
  searchInput.value = "";
  applyFilters();
}

// Modal open/close actions
function openModal() {
  modalOverlay.classList.add("active");
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
  const eta = document.getElementById("payout-eta").value.trim() || "-";
  const status = document.getElementById("payout-status").value;
  
  if (isNaN(amountVal) || amountVal <= 0) {
    alert("Please enter a valid amount greater than 0.");
    return;
  }
  
  // Find highest ID
  const allIds = payouts.map(p => parseInt(p.id)).filter(id => !isNaN(id));
  const newId = (allIds.length > 0 ? Math.max(...allIds) + 1 : 1).toString();
  
  // Calculate risk
  let risk = "High";
  if (idv === "Pass") risk = "Low";
  else if (idv === "Manual verification") risk = "Medium";
  
  const newPayout = {
    id: newId,
    created: formatDateString(new Date()),
    venue: venue,
    idv: idv,
    risk: risk,
    amount: amountVal,
    eta: eta,
    status: status
  };
  
  // Prepend to database
  payouts.unshift(newPayout);
  
  closeModal();
  
  // Reset filters to show the new item at the top
  statusSelect.value = "All";
  searchInput.value = "";
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

// Bind Listeners
applyBtn.addEventListener("click", applyFilters);
clearBtn.addEventListener("click", clearFilters);
refreshBtn.addEventListener("click", handleRefresh);
exportCsvBtn.addEventListener("click", exportToCSV);

// Listen for enter key in search
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    applyFilters();
  }
});

// Modal Listeners
newPayoutBtn.addEventListener("click", openModal);
modalCloseBtn.addEventListener("click", closeModal);
modalCancelBtn.addEventListener("click", closeModal);

// Close modal if user clicks outside the modal card
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

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

newPayoutForm.addEventListener("submit", handleNewPayoutSubmit);

// Init Execution
initMockData();
filteredPayouts = [...payouts];
updateUI();
initScrollAnimations();
console.log("Payouts dashboard application loaded successfully!");
