// On Farm Services - Paddocks + Jobs + Feed + Stock + Equipment + Crops + Inventory + Map

let paddocks = JSON.parse(localStorage.getItem("paddocks")) || [];
let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
let feedRecords = JSON.parse(localStorage.getItem("feedRecords")) || [];
let stockMovements = JSON.parse(localStorage.getItem("stockMovements")) || [];
let equipment = JSON.parse(localStorage.getItem("equipment")) || [];
let cropRecords = JSON.parse(localStorage.getItem("cropRecords")) || [];
let inventoryItems = JSON.parse(localStorage.getItem("inventoryItems")) || [];

let currentFilter = "All";
let mapReturnPaddockName = "";

function formatDate(dateValue) {
  if (!dateValue) return "";

  const parts = String(dateValue).split("-");

  if (parts.length !== 3) {
    return dateValue;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function savePaddocks() {
  localStorage.setItem("paddocks", JSON.stringify(paddocks));
}

function saveJobs() {
  localStorage.setItem("jobs", JSON.stringify(jobs));
}

function saveFeedRecords() {
  localStorage.setItem("feedRecords", JSON.stringify(feedRecords));
}

function saveStockMovements() {
  localStorage.setItem("stockMovements", JSON.stringify(stockMovements));
}

function saveEquipment() {
  localStorage.setItem("equipment", JSON.stringify(equipment));
}

function saveCropRecords() {
  localStorage.setItem("cropRecords", JSON.stringify(cropRecords));
}

function saveInventoryItems() {
  localStorage.setItem("inventoryItems", JSON.stringify(inventoryItems));
}

function parseAmountNumber(value) {
  const number = parseFloat(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isNaN(number) ? null : number;
}

function getAmountUnit(value) {
  const text = String(value || "").trim();
  const match = text.match(/[a-zA-Z]+/g);
  return match ? match.join(" ") : "";
}

function formatAmountWithUnit(amount, fallbackUnit) {
  const roundedAmount = Math.round(amount * 100) / 100;
  return fallbackUnit ? `${roundedAmount} ${fallbackUnit}` : `${roundedAmount}`;
}

function isLowStock(item) {
  const current = parseAmountNumber(item.amount);
  const reorder = parseAmountNumber(item.reorderLevel);

  if (current === null || reorder === null) {
    return false;
  }

  return current <= reorder;
}

function deductInventoryAmount(index, amountUsedText) {
  const item = inventoryItems[index];
  if (!item) return "";

  const current = parseAmountNumber(item.amount);
  const used = parseAmountNumber(amountUsedText);

  if (current === null || used === null) {
    return "";
  }

  const unit = getAmountUnit(item.amount) || getAmountUnit(amountUsedText);
  const remaining = current - used;

  item.amount = formatAmountWithUnit(remaining, unit);
  saveInventoryItems();

  return item.name;
}

function returnToMapPaddockDetail(paddockName) {
  if (!mapReturnPaddockName || mapReturnPaddockName !== paddockName) {
    return false;
  }

  const paddockIndex = paddocks.findIndex((p) => p.name === paddockName);

  mapReturnPaddockName = "";

  if (paddockIndex < 0) {
    return false;
  }

  showSection("map");
  showPaddockDetail(paddockIndex);
  return true;
}

function showSection(sectionName) {
  const paddocksSection = document.getElementById("paddocksSection");
  const jobsSection = document.getElementById("jobsSection");
  const feedSection = document.getElementById("feedSection");
  const stockSection = document.getElementById("stockSection");
  const equipmentSection = document.getElementById("equipmentSection");
  const cropsSection = document.getElementById("cropsSection");
  const inventorySection = document.getElementById("inventorySection");
  const mapSection = document.getElementById("mapSection");

  paddocksSection.style.display = "none";
  jobsSection.style.display = "none";
  feedSection.style.display = "none";
  stockSection.style.display = "none";
  equipmentSection.style.display = "none";
  cropsSection.style.display = "none";
  inventorySection.style.display = "none";
  mapSection.style.display = "none";

  if (sectionName === "jobs") {
    jobsSection.style.display = "block";
    renderJobPaddockDropdown();
    renderJobs();
    return;
  }

  if (sectionName === "feed") {
    feedSection.style.display = "block";
    renderFeedPaddockDropdown();
    renderFeedRecords();
    return;
  }

  if (sectionName === "stock") {
    stockSection.style.display = "block";
    renderStockPaddockDropdowns();
    renderStockMovements();
    return;
  }

  if (sectionName === "equipment") {
    equipmentSection.style.display = "block";
    renderEquipment();
    return;
  }

  if (sectionName === "crops") {
    cropsSection.style.display = "block";
    renderCropPaddockDropdown();
    renderCropInventoryDropdown();
    renderCropRecords();
    return;
  }

  if (sectionName === "inventory") {
    inventorySection.style.display = "block";
    renderInventoryItems();
    return;
  }

  if (sectionName === "map") {
    mapSection.style.display = "block";
    renderMap();
    return;
  }

  paddocksSection.style.display = "block";
}

function addPaddock() {
  const name = document.getElementById("name").value;
  const area = document.getElementById("area").value;
  const use = document.getElementById("use").value;
  const notes = document.getElementById("notes").value;

  if (!name) {
    alert("Paddock name required");
    return;
  }

  paddocks.push({ name, area, use, notes });
  savePaddocks();
  renderPaddocks();
  renderBulkActionPaddockList();
  renderJobPaddockDropdown();
  renderFeedPaddockDropdown();
  renderStockPaddockDropdowns();
  renderCropPaddockDropdown();
  renderMap();
  clearPaddockForm();
}

function bulkAddPaddocks() {
  const bulkInput = document.getElementById("bulkPaddocks");

  if (!bulkInput) {
    return;
  }

  const rawText = bulkInput.value;

  if (!rawText.trim()) {
    alert("Paste at least one paddock name");
    return;
  }

  const existingNames = paddocks.map((p) => String(p.name || "").trim().toLowerCase());

  const names = rawText
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  let addedCount = 0;
  let skippedCount = 0;

  names.forEach((name) => {
    const cleanName = name.trim();
    const lowerName = cleanName.toLowerCase();

    if (!cleanName || existingNames.includes(lowerName)) {
      skippedCount += 1;
      return;
    }

    paddocks.push({
      name: cleanName,
      area: "",
      use: "",
      notes: ""
    });

    existingNames.push(lowerName);
    addedCount += 1;
  });

  savePaddocks();
  renderPaddocks();
  renderBulkActionPaddockList();
  renderJobPaddockDropdown();
  renderFeedPaddockDropdown();
  renderStockPaddockDropdowns();
  renderCropPaddockDropdown();
  renderMap();

  bulkInput.value = "";

  if (addedCount > 0 && skippedCount > 0) {
    alert(`${addedCount} paddocks added. ${skippedCount} duplicate/blank entries skipped.`);
    return;
  }

  if (addedCount > 0) {
    alert(`${addedCount} paddocks added.`);
    return;
  }

  alert("No new paddocks added. They may already exist.");
}

function renderBulkActionPaddockList() {
  const container = document.getElementById("bulkActionPaddockList");
  if (!container) return;

  container.innerHTML = "";

  if (paddocks.length === 0) {
    container.innerHTML = `<p>No paddocks available yet.</p>`;
    return;
  }

  paddocks.forEach((p, index) => {
    const label = document.createElement("label");
    label.style.display = "block";
    label.style.padding = "8px";
    label.style.marginBottom = "6px";
    label.style.border = "1px solid #ddd";
    label.style.borderRadius = "8px";
    label.style.background = "#fff";

    label.innerHTML = `
      <input type="checkbox" class="bulk-paddock-checkbox" value="${index}" />
      ${p.name}
    `;

    container.appendChild(label);
  });
}

function handleBulkActionTypeChange() {
  const actionType = document.getElementById("bulkActionType").value;
  const bulkJobType = document.getElementById("bulkJobType");
  const bulkFeedType = document.getElementById("bulkFeedType");
  const bulkFeedAmount = document.getElementById("bulkFeedAmount");
  const bulkStockUnit = document.getElementById("bulkStockUnit");
  const bulkJobStatus = document.getElementById("bulkJobStatus");
  const bulkJobPriority = document.getElementById("bulkJobPriority");

  bulkJobType.style.display = "none";
  bulkFeedType.style.display = "none";
  bulkFeedAmount.style.display = "none";
  bulkStockUnit.style.display = "none";
  bulkJobStatus.style.display = "none";
  bulkJobPriority.style.display = "none";

  if (actionType === "Job") {
    bulkJobType.style.display = "block";
    bulkJobStatus.style.display = "block";
    bulkJobPriority.style.display = "block";
    return;
  }

  if (actionType === "Feed") {
    bulkFeedType.style.display = "block";
    bulkFeedAmount.style.display = "block";
    return;
  }

  if (actionType === "Break Feeding") {
    bulkFeedType.style.display = "block";
    bulkFeedAmount.style.display = "block";
    bulkStockUnit.style.display = "block";
    bulkJobStatus.style.display = "block";
    bulkJobPriority.style.display = "block";
  }
}

function getSelectedBulkPaddocks() {
  const selected = Array.from(document.querySelectorAll(".bulk-paddock-checkbox:checked"));

  return selected
    .map((checkbox) => Number(checkbox.value))
    .filter((index) => !Number.isNaN(index) && paddocks[index]);
}

function applyBulkPaddockAction() {
  const selectedIndexes = getSelectedBulkPaddocks();
  const date = document.getElementById("bulkActionDate").value;
  const actionType = document.getElementById("bulkActionType").value;
  const bulkJobType = document.getElementById("bulkJobType").value;
  const bulkFeedType = document.getElementById("bulkFeedType").value;
  const bulkFeedAmount = document.getElementById("bulkFeedAmount").value;
  const bulkStockUnit = document.getElementById("bulkStockUnit").value;
  const bulkJobStatus = document.getElementById("bulkJobStatus").value;
  const bulkJobPriority = document.getElementById("bulkJobPriority").value;
  const notes = document.getElementById("bulkActionNotes").value;

  if (selectedIndexes.length === 0) {
    alert("Select at least one paddock");
    return;
  }

  if (!actionType) {
    alert("Select a bulk action");
    return;
  }

  if (actionType === "Job" && !bulkJobType) {
    alert("Select a job type");
    return;
  }

  if ((actionType === "Feed" || actionType === "Break Feeding") && !bulkFeedType) {
    alert("Select a feed type");
    return;
  }

  selectedIndexes.forEach((index) => {
    const paddockName = paddocks[index]?.name || "Unknown";

    if (actionType === "Job") {
      jobs.push({
        date,
        paddock: paddockName,
        type: bulkJobType,
        feedType: bulkJobType === "Feeding" ? bulkFeedType : "",
        feedAmount: "",
        stockUnit: "",
        status: bulkJobStatus || "Planned",
        priority: bulkJobPriority,
        notes
      });
    }

    if (actionType === "Feed") {
      feedRecords.push({
        date,
        paddock: paddockName,
        feedType: bulkFeedType,
        amount: bulkFeedAmount,
        notes
      });
    }

    if (actionType === "Break Feeding") {
      jobs.push({
        date,
        paddock: paddockName,
        type: "Break Feeding",
        feedType: bulkFeedType,
        feedAmount: bulkFeedAmount,
        stockUnit: bulkStockUnit,
        status: bulkJobStatus || "Planned",
        priority: bulkJobPriority,
        notes
      });

      const feedNotes = [
        bulkStockUnit ? `Stock Unit: ${bulkStockUnit}` : "",
        notes || ""
      ].filter(Boolean).join(" | ");

      feedRecords.push({
        date,
        paddock: paddockName,
        feedType: `Break Feeding - ${bulkFeedType}`,
        amount: bulkFeedAmount,
        notes: feedNotes
      });
    }
  });

  saveJobs();
  saveFeedRecords();

  renderJobs();
  renderFeedRecords();
  renderMap();
  clearBulkPaddockActionForm();

  alert(`Bulk action applied to ${selectedIndexes.length} paddock(s).`);
}

function clearBulkPaddockActionForm() {
  const checkboxes = document.querySelectorAll(".bulk-paddock-checkbox");

  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  document.getElementById("bulkActionDate").value = "";
  document.getElementById("bulkActionType").value = "";
  document.getElementById("bulkJobType").value = "";
  document.getElementById("bulkFeedType").value = "";
  document.getElementById("bulkFeedAmount").value = "";
  document.getElementById("bulkStockUnit").value = "";
  document.getElementById("bulkJobStatus").value = "";
  document.getElementById("bulkJobPriority").value = "";
  document.getElementById("bulkActionNotes").value = "";

  handleBulkActionTypeChange();
}

function clearPaddockForm() {
  document.getElementById("name").value = "";
  document.getElementById("area").value = "";
  document.getElementById("use").value = "";
  document.getElementById("notes").value = "";
}

function deletePaddock(index) {
  if (!confirm("Delete this paddock?")) return;

  paddocks.splice(index, 1);
  savePaddocks();
  renderPaddocks();
  renderBulkActionPaddockList();
  renderJobPaddockDropdown();
  renderFeedPaddockDropdown();
  renderStockPaddockDropdowns();
  renderCropPaddockDropdown();
  renderMap();
}

function editPaddock(index) {
  const p = paddocks[index];

  const name = prompt("Edit name:", p.name);
  if (name === null) return;

  const area = prompt("Edit area:", p.area);
  if (area === null) return;

  const use = prompt("Edit use:", p.use);
  if (use === null) return;

  const notes = prompt("Edit notes:", p.notes);
  if (notes === null) return;

  paddocks[index] = { name, area, use, notes };

  savePaddocks();
  renderPaddocks();
  renderBulkActionPaddockList();
  renderJobPaddockDropdown();
  renderFeedPaddockDropdown();
  renderStockPaddockDropdowns();
  renderCropPaddockDropdown();
  renderMap();
}

function renderPaddocks() {
  const container = document.getElementById("paddockList");
  container.innerHTML = "";

  paddocks.forEach((p, index) => {
    const div = document.createElement("div");
    div.className = "paddock-item";
    div.innerHTML = `
      <strong>${p.name}</strong><br>
      Area: ${p.area || "-"} ha<br>
      Use: ${p.use || "-"}<br>
      Notes: ${p.notes || "-"}<br>
      <button onclick="editPaddock(${index})">Edit</button>
      <button onclick="deletePaddock(${index})">Delete</button>
    `;
    container.appendChild(div);
  });
}

function renderJobPaddockDropdown() {
  const dropdown = document.getElementById("jobPaddock");
  if (!dropdown) return;

  dropdown.innerHTML = `<option value="">Select Paddock</option>`;

  paddocks.forEach((p, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = p.name;
    dropdown.appendChild(option);
  });
}

function renderFeedPaddockDropdown() {
  const dropdown = document.getElementById("feedPaddock");
  if (!dropdown) return;

  dropdown.innerHTML = `<option value="">Select Paddock</option>`;

  paddocks.forEach((p, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = p.name;
    dropdown.appendChild(option);
  });
}

function renderStockPaddockDropdowns() {
  const fromDropdown = document.getElementById("stockFromPaddock");
  const toDropdown = document.getElementById("stockToPaddock");

  if (!fromDropdown || !toDropdown) return;

  fromDropdown.innerHTML = `<option value="">From Paddock</option>`;
  toDropdown.innerHTML = `<option value="">To Paddock</option>`;

  paddocks.forEach((p, index) => {
    const fromOption = document.createElement("option");
    fromOption.value = index;
    fromOption.textContent = p.name;
    fromDropdown.appendChild(fromOption);

    const toOption = document.createElement("option");
    toOption.value = index;
    toOption.textContent = p.name;
    toDropdown.appendChild(toOption);
  });
}

function renderCropPaddockDropdown() {
  const dropdown = document.getElementById("cropPaddock");
  if (!dropdown) return;

  dropdown.innerHTML = `<option value="">Select Paddock</option>`;

  paddocks.forEach((p, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = p.name;
    dropdown.appendChild(option);
  });
}

function renderCropInventoryDropdown() {
  const dropdown = document.getElementById("cropInventoryItem");
  if (!dropdown) return;

  dropdown.innerHTML = `<option value="">Select Inventory Item (optional)</option>`;

  inventoryItems.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${item.name} (${item.amount || "-"})`;
    dropdown.appendChild(option);
  });
}

function setDropdownByPaddockName(dropdownId, paddockName) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  const index = paddocks.findIndex((p) => p.name === paddockName);

  if (index >= 0) {
    dropdown.value = String(index);
  }
}

function goToAddJobFromMap(paddockName) {
  mapReturnPaddockName = paddockName;
  showSection("jobs");
  setDropdownByPaddockName("jobPaddock", paddockName);
  document.getElementById("jobType").focus();
}

function goToAddFeedFromMap(paddockName) {
  mapReturnPaddockName = paddockName;
  showSection("feed");
  setDropdownByPaddockName("feedPaddock", paddockName);
  document.getElementById("feedRecordType").focus();
}

function goToMoveStockFromMap(paddockName) {
  mapReturnPaddockName = paddockName;
  showSection("stock");
  setDropdownByPaddockName("stockFromPaddock", paddockName);
  document.getElementById("stockUnit").focus();
}

function handleJobTypeChange() {
  const jobType = document.getElementById("jobType").value;
  const feedType = document.getElementById("feedType");
  const jobFeedAmount = document.getElementById("jobFeedAmount");
  const jobStockUnit = document.getElementById("jobStockUnit");

  if (!feedType) return;

  if (jobType === "Feeding" || jobType === "Break Feeding") {
    feedType.style.display = "block";
  } else {
    feedType.style.display = "none";
    feedType.value = "";
  }

  if (jobFeedAmount && jobStockUnit) {
    if (jobType === "Break Feeding") {
      jobFeedAmount.style.display = "block";
      jobStockUnit.style.display = "block";
    } else {
      jobFeedAmount.style.display = "none";
      jobFeedAmount.value = "";
      jobStockUnit.style.display = "none";
      jobStockUnit.value = "";
    }
  }
}

function addJob() {
  const date = document.getElementById("jobDate").value;
  const paddockIndex = document.getElementById("jobPaddock").value;
  const type = document.getElementById("jobType").value;
  const feedType = document.getElementById("feedType").value;
  const jobFeedAmount = document.getElementById("jobFeedAmount").value;
  const jobStockUnit = document.getElementById("jobStockUnit").value;
  const status = document.getElementById("jobStatus").value;
  const priority = document.getElementById("jobPriority").value;
  const notes = document.getElementById("jobNotes").value;

  if (paddockIndex === "" || !type) {
    alert("Select paddock and job type");
    return;
  }

  if (type === "Break Feeding" && !feedType) {
    alert("Select feed type for break feeding");
    return;
  }

  const paddockName = paddocks[paddockIndex]?.name || "Unknown";

  jobs.push({
    date,
    paddock: paddockName,
    type,
    feedType,
    feedAmount: jobFeedAmount,
    stockUnit: jobStockUnit,
    status: status || "Planned",
    priority,
    notes
  });

  if (type === "Break Feeding") {
    const feedNotes = [
      jobStockUnit ? `Stock Unit: ${jobStockUnit}` : "",
      notes || ""
    ].filter(Boolean).join(" | ");

    feedRecords.push({
      date,
      paddock: paddockName,
      feedType: `Break Feeding - ${feedType}`,
      amount: jobFeedAmount,
      notes: feedNotes
    });

    saveFeedRecords();
    renderFeedRecords();
  }

  saveJobs();
  renderJobs();
  clearJobForm();

  if (returnToMapPaddockDetail(paddockName)) {
    return;
  }
}

function clearJobForm() {
  document.getElementById("jobDate").value = "";
  document.getElementById("jobPaddock").value = "";
  document.getElementById("jobType").value = "";
  document.getElementById("feedType").value = "";
  document.getElementById("feedType").style.display = "none";
  document.getElementById("jobFeedAmount").value = "";
  document.getElementById("jobFeedAmount").style.display = "none";
  document.getElementById("jobStockUnit").value = "";
  document.getElementById("jobStockUnit").style.display = "none";
  document.getElementById("jobStatus").value = "";
  document.getElementById("jobPriority").value = "";
  document.getElementById("jobNotes").value = "";
}

function markJobDone(index) {
  jobs[index].status = "Done";
  saveJobs();
  renderJobs();
}

function reopenJob(index) {
  jobs[index].status = "In Progress";
  saveJobs();
  renderJobs();
}

function getStatusClass(status) {
  if (status === "Done") return "status-done";
  if (status === "In Progress") return "status-in-progress";
  return "status-planned";
}

function getPriorityValue(priority) {
  if (priority === "High") return 1;
  if (priority === "Medium") return 2;
  if (priority === "Low") return 3;
  return 4;
}

function sortJobs(list) {
  return list.sort((a, b) => {
    const pA = getPriorityValue(a.job.priority);
    const pB = getPriorityValue(b.job.priority);

    if (pA !== pB) {
      return pA - pB;
    }

    const dA = a.job.date || "9999-12-31";
    const dB = b.job.date || "9999-12-31";

    return dA.localeCompare(dB);
  });
}

function renderJobs() {
  const container = document.querySelector("#jobsSection .list-card");
  container.innerHTML = `<h3>Saved Jobs</h3>`;

  container.innerHTML += `
    <div style="margin-bottom:10px;">
      <button onclick="setFilter('All')">All</button>
      <button onclick="setFilter('Planned')">Planned</button>
      <button onclick="setFilter('In Progress')">In Progress</button>
      <button onclick="setFilter('Done')">Done</button>
    </div>
  `;

  if (jobs.length === 0) {
    container.innerHTML += `<p>No jobs saved yet.</p>`;
    return;
  }

  let filteredJobs = jobs;
  if (currentFilter !== "All") {
    filteredJobs = jobs.filter(j => (j.status || "Planned") === currentFilter);
  }

  const sortedJobs = sortJobs(
    filteredJobs.map((job) => ({
      job,
      originalIndex: jobs.indexOf(job)
    }))
  );

  sortedJobs.forEach((item) => {
    const j = item.job;
    const originalIndex = item.originalIndex;

    const div = document.createElement("div");
    div.className = "paddock-item";

    const feedLine = j.feedType ? `Feed: ${j.feedType}<br>` : "";
    const feedAmountLine = j.feedAmount ? `Feed Amount: ${j.feedAmount}<br>` : "";
    const stockUnitLine = j.stockUnit ? `Stock Unit: ${j.stockUnit}<br>` : "";
    const dateLine = j.date ? `Date: ${formatDate(j.date)}<br>` : "";
    const statusText = j.status || "Planned";
    const statusClass = getStatusClass(statusText);

    const actionButton = statusText === "Done"
      ? `<button onclick="reopenJob(${originalIndex})">Reopen Job</button>`
      : `<button onclick="markJobDone(${originalIndex})">Mark as Done</button>`;

    div.innerHTML = `
      <strong>${j.type}</strong> (${j.paddock})<br>
      ${dateLine}
      ${feedLine}
      ${feedAmountLine}
      ${stockUnitLine}
      Status: <span class="status-badge ${statusClass}">${statusText}</span><br>
      Priority: ${j.priority || "-"}<br>
      Notes: ${j.notes || "-"}<br>
      ${actionButton}
    `;

    container.appendChild(div);
  });
}

function setFilter(filter) {
  currentFilter = filter;
  renderJobs();
}

function addFeedRecord() {
  const date = document.getElementById("feedDate").value;
  const paddockIndex = document.getElementById("feedPaddock").value;
  const feedType = document.getElementById("feedRecordType").value;
  const amount = document.getElementById("feedAmount").value;
  const notes = document.getElementById("feedNotes").value;

  if (paddockIndex === "" || !feedType) {
    alert("Select paddock and feed type");
    return;
  }

  const paddockName = paddocks[paddockIndex]?.name || "Unknown";

  feedRecords.push({
    date,
    paddock: paddockName,
    feedType,
    amount,
    notes
  });

  saveFeedRecords();
  renderFeedRecords();
  clearFeedForm();

  if (returnToMapPaddockDetail(paddockName)) {
    return;
  }
}

function clearFeedForm() {
  document.getElementById("feedDate").value = "";
  document.getElementById("feedPaddock").value = "";
  document.getElementById("feedRecordType").value = "";
  document.getElementById("feedAmount").value = "";
  document.getElementById("feedNotes").value = "";
}

function deleteFeedRecord(index) {
  if (!confirm("Delete this feed record?")) return;

  feedRecords.splice(index, 1);
  saveFeedRecords();
  renderFeedRecords();
}

function renderFeedRecords() {
  const container = document.getElementById("feedList");
  container.innerHTML = "";

  if (feedRecords.length === 0) {
    container.innerHTML = `<p>No feed records saved yet.</p>`;
    return;
  }

  feedRecords.forEach((record, index) => {
    const div = document.createElement("div");
    div.className = "paddock-item";

    const dateLine = record.date ? `Date: ${formatDate(record.date)}<br>` : "";
    const amountLine = record.amount ? `Amount: ${record.amount}<br>` : "";

    div.innerHTML = `
      <strong>${record.feedType}</strong> (${record.paddock})<br>
      ${dateLine}
      ${amountLine}
      Notes: ${record.notes || "-"}<br>
      <button onclick="deleteFeedRecord(${index})">Delete</button>
    `;

    container.appendChild(div);
  });
}

function addStockMovement() {
  const date = document.getElementById("stockDate").value;
  const stockUnit = document.getElementById("stockUnit").value;
  const stockDescription = document.getElementById("stockDescription").value;
  const fromPaddockIndex = document.getElementById("stockFromPaddock").value;
  const toPaddockIndex = document.getElementById("stockToPaddock").value;
  const reason = document.getElementById("stockReason").value;
  const notes = document.getElementById("stockNotes").value;

  if (!stockUnit || !stockDescription || fromPaddockIndex === "" || toPaddockIndex === "") {
    alert("Enter stock unit, description, from paddock, and to paddock");
    return;
  }

  const fromPaddockName = paddocks[fromPaddockIndex]?.name || "Unknown";
  const toPaddockName = paddocks[toPaddockIndex]?.name || "Unknown";

  stockMovements.push({
    date,
    stockUnit,
    stockDescription,
    fromPaddock: fromPaddockName,
    toPaddock: toPaddockName,
    reason,
    notes
  });

  saveStockMovements();
  renderStockMovements();
  clearStockForm();

  if (returnToMapPaddockDetail(fromPaddockName)) {
    return;
  }
}

function clearStockForm() {
  document.getElementById("stockDate").value = "";
  document.getElementById("stockUnit").value = "";
  document.getElementById("stockDescription").value = "";
  document.getElementById("stockFromPaddock").value = "";
  document.getElementById("stockToPaddock").value = "";
  document.getElementById("stockReason").value = "";
  document.getElementById("stockNotes").value = "";
}

function deleteStockMovement(index) {
  if (!confirm("Delete this stock movement?")) return;

  stockMovements.splice(index, 1);
  saveStockMovements();
  renderStockMovements();
}

function renderStockMovements() {
  const container = document.getElementById("stockList");
  container.innerHTML = "";

  if (stockMovements.length === 0) {
    container.innerHTML = `<p>No stock movements saved yet.</p>`;
    return;
  }

  stockMovements.forEach((movement, index) => {
    const div = document.createElement("div");
    div.className = "paddock-item";

    const dateLine = movement.date ? `Date: ${formatDate(movement.date)}<br>` : "";
    const reasonLine = movement.reason ? `Reason: ${movement.reason}<br>` : "";

    div.innerHTML = `
      <strong>${movement.stockUnit}</strong> - ${movement.stockDescription}<br>
      ${dateLine}
      From: ${movement.fromPaddock}<br>
      To: ${movement.toPaddock}<br>
      ${reasonLine}
      Notes: ${movement.notes || "-"}<br>
      <button onclick="deleteStockMovement(${index})">Delete</button>
    `;

    container.appendChild(div);
  });
}

function addEquipment() {
  const name = document.getElementById("equipmentName").value;
  const type = document.getElementById("equipmentType").value;
  const status = document.getElementById("equipmentStatus").value;
  const notes = document.getElementById("equipmentNotes").value;

  if (!name || !type) {
    alert("Enter equipment name and type");
    return;
  }

  equipment.push({
    name,
    type,
    status: status || "Available",
    notes
  });

  saveEquipment();
  renderEquipment();
  clearEquipmentForm();
}

function clearEquipmentForm() {
  document.getElementById("equipmentName").value = "";
  document.getElementById("equipmentType").value = "";
  document.getElementById("equipmentStatus").value = "";
  document.getElementById("equipmentNotes").value = "";
}

function deleteEquipment(index) {
  if (!confirm("Delete this equipment?")) return;

  equipment.splice(index, 1);
  saveEquipment();
  renderEquipment();
}

function renderEquipment() {
  const container = document.getElementById("equipmentList");
  container.innerHTML = "";

  if (equipment.length === 0) {
    container.innerHTML = `<p>No equipment saved yet.</p>`;
    return;
  }

  equipment.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "paddock-item";

    div.innerHTML = `
      <strong>${item.name}</strong><br>
      Type: ${item.type || "-"}<br>
      Status: ${item.status || "Available"}<br>
      Notes: ${item.notes || "-"}<br>
      <button onclick="deleteEquipment(${index})">Delete</button>
    `;

    container.appendChild(div);
  });
}

function addCropRecord() {
  const date = document.getElementById("cropDate").value;
  const paddockIndex = document.getElementById("cropPaddock").value;
  const activity = document.getElementById("cropActivity").value;
  const cropName = document.getElementById("cropName").value;
  const inventoryIndex = document.getElementById("cropInventoryItem").value;
  const amountUsed = document.getElementById("cropAmountUsed").value;
  const status = document.getElementById("cropStatus").value;
  const notes = document.getElementById("cropNotes").value;

  if (paddockIndex === "" || !activity) {
    alert("Select paddock and activity");
    return;
  }

  const paddockName = paddocks[paddockIndex]?.name || "Unknown";
  let inventoryItemName = "";

  if (activity === "Fertilising" && inventoryIndex !== "" && amountUsed) {
    inventoryItemName = deductInventoryAmount(inventoryIndex, amountUsed);
  }

  cropRecords.push({
    date,
    paddock: paddockName,
    activity,
    cropName,
    inventoryItemName,
    amountUsed,
    status: status || "Planned",
    notes
  });

  saveCropRecords();
  renderCropRecords();
  renderInventoryItems();
  renderCropInventoryDropdown();
  clearCropForm();
}

function clearCropForm() {
  document.getElementById("cropDate").value = "";
  document.getElementById("cropPaddock").value = "";
  document.getElementById("cropActivity").value = "";
  document.getElementById("cropName").value = "";
  document.getElementById("cropInventoryItem").value = "";
  document.getElementById("cropAmountUsed").value = "";
  document.getElementById("cropStatus").value = "";
  document.getElementById("cropNotes").value = "";
}

function deleteCropRecord(index) {
  if (!confirm("Delete this crop record?")) return;

  cropRecords.splice(index, 1);
  saveCropRecords();
  renderCropRecords();
}

function renderCropRecords() {
  const container = document.getElementById("cropList");
  container.innerHTML = "";

  if (cropRecords.length === 0) {
    container.innerHTML = `<p>No crop records saved yet.</p>`;
    return;
  }

  cropRecords.forEach((record, index) => {
    const div = document.createElement("div");
    div.className = "paddock-item";

    const dateLine = record.date ? `Date: ${formatDate(record.date)}<br>` : "";
    const cropLine = record.cropName ? `Crop: ${record.cropName}<br>` : "";
    const inventoryLine = record.inventoryItemName ? `Product: ${record.inventoryItemName}<br>` : "";
    const amountUsedLine = record.amountUsed ? `Amount Used: ${record.amountUsed}<br>` : "";

    div.innerHTML = `
      <strong>${record.activity}</strong> (${record.paddock})<br>
      ${dateLine}
      ${cropLine}
      ${inventoryLine}
      ${amountUsedLine}
      Status: ${record.status || "Planned"}<br>
      Notes: ${record.notes || "-"}<br>
      <button onclick="deleteCropRecord(${index})">Delete</button>
    `;

    container.appendChild(div);
  });
}

function addInventoryItem() {
  const name = document.getElementById("inventoryName").value;
  const category = document.getElementById("inventoryCategory").value;
  const amount = document.getElementById("inventoryAmount").value;
  const reorderLevel = document.getElementById("inventoryReorderLevel").value;
  const notes = document.getElementById("inventoryNotes").value;

  if (!name || !category) {
    alert("Enter item name and category");
    return;
  }

  inventoryItems.push({
    name,
    category,
    amount,
    reorderLevel,
    notes
  });

  saveInventoryItems();
  renderInventoryItems();
  renderCropInventoryDropdown();
  clearInventoryForm();
}

function clearInventoryForm() {
  document.getElementById("inventoryName").value = "";
  document.getElementById("inventoryCategory").value = "";
  document.getElementById("inventoryAmount").value = "";
  document.getElementById("inventoryReorderLevel").value = "";
  document.getElementById("inventoryNotes").value = "";
}

function deleteInventoryItem(index) {
  if (!confirm("Delete this inventory item?")) return;

  inventoryItems.splice(index, 1);
  saveInventoryItems();
  renderInventoryItems();
  renderCropInventoryDropdown();
}

function renderInventoryItems() {
  const container = document.getElementById("inventoryList");
  container.innerHTML = "";

  if (inventoryItems.length === 0) {
    container.innerHTML = `<p>No inventory saved yet.</p>`;
    return;
  }

  inventoryItems.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "paddock-item";

    const amountLine = item.amount ? `Current Stock: ${item.amount}<br>` : "";
    const reorderLine = item.reorderLevel ? `Reorder Level: ${item.reorderLevel}<br>` : "";
    const lowStockLine = isLowStock(item)
      ? `<span class="low-stock-warning">⚠ Low Stock - order more</span><br>`
      : "";

    div.innerHTML = `
      <strong>${item.name}</strong><br>
      Category: ${item.category || "-"}<br>
      ${amountLine}
      ${reorderLine}
      ${lowStockLine}
      Notes: ${item.notes || "-"}<br>
      <button onclick="deleteInventoryItem(${index})">Delete</button>
    `;

    container.appendChild(div);
  });
}

function renderMap() {
  const grid = document.getElementById("mapGrid");
  const detail = document.getElementById("mapDetail");

  if (!grid) return;

  grid.innerHTML = "";

  if (detail) {
    detail.style.display = "none";
  }

  if (paddocks.length === 0) {
    grid.innerHTML = `<p>No paddocks to display yet.</p>`;
    return;
  }

  paddocks.forEach((p, index) => {
    const button = document.createElement("button");
    button.className = "map-paddock-button";
    button.textContent = p.name;
    button.onclick = function () {
      showPaddockDetail(index);
    };

    grid.appendChild(button);
  });
}

function getRecentItems(list, fieldName, paddockName, limit) {
  return list
    .filter((item) => item[fieldName] === paddockName)
    .slice()
    .reverse()
    .slice(0, limit);
}

function renderMapList(title, items, emptyText, renderItem) {
  if (items.length === 0) {
    return `<strong>${title}</strong><br>${emptyText}<br><br>`;
  }

  const rows = items.map(renderItem).join("");

  return `
    <strong>${title}</strong><br>
    ${rows}
    <br>
  `;
}

function showPaddockDetail(index) {
  const p = paddocks[index];

  const detail = document.getElementById("mapDetail");
  const name = document.getElementById("mapPaddockName");
  const info = document.getElementById("mapPaddockInfo");

  if (!detail || !name || !info) return;

  const paddockJobs = getRecentItems(jobs, "paddock", p.name, 3);
  const paddockFeed = getRecentItems(feedRecords, "paddock", p.name, 3);
  const paddockCrops = getRecentItems(cropRecords, "paddock", p.name, 3);

  const paddockStock = stockMovements
    .filter((movement) => movement.fromPaddock === p.name || movement.toPaddock === p.name)
    .slice()
    .reverse()
    .slice(0, 3);

  detail.style.display = "block";
  name.textContent = p.name;

  info.innerHTML = `
    <strong>Paddock Details</strong><br>
    Area: ${p.area || "-"} ha<br>
    Use: ${p.use || "-"}<br>
    Notes: ${p.notes || "-"}<br><br>

    <strong>Actions</strong><br>
    <button onclick="goToAddJobFromMap('${p.name}')">Add Job</button>
    <button onclick="goToAddFeedFromMap('${p.name}')">Add Feed</button>
    <button onclick="goToMoveStockFromMap('${p.name}')">Move Stock</button>
    <br><br>

    ${renderMapList(
      "Recent Jobs",
      paddockJobs,
      "No jobs recorded.",
      (job) => `• ${job.type || "-"} — ${job.status || "Planned"}${job.date ? ` — ${formatDate(job.date)}` : ""}<br>`
    )}

    ${renderMapList(
      "Recent Feed",
      paddockFeed,
      "No feed recorded.",
      (feed) => `• ${feed.feedType || "-"}${feed.amount ? ` — ${feed.amount}` : ""}${feed.date ? ` — ${formatDate(feed.date)}` : ""}<br>`
    )}

    ${renderMapList(
      "Recent Stock Movements",
      paddockStock,
      "No stock movements recorded.",
      (movement) => `• ${movement.stockUnit || "-"} — ${movement.fromPaddock || "-"} to ${movement.toPaddock || "-"}${movement.date ? ` — ${formatDate(movement.date)}` : ""}<br>`
    )}

    ${renderMapList(
      "Recent Crop Records",
      paddockCrops,
      "No crop records recorded.",
      (crop) => `• ${crop.activity || "-"}${crop.cropName ? ` — ${crop.cropName}` : ""}${crop.date ? ` — ${formatDate(crop.date)}` : ""}<br>`
    )}
  `;
}

renderPaddocks();
renderBulkActionPaddockList();
renderJobPaddockDropdown();
renderFeedPaddockDropdown();
renderStockPaddockDropdowns();
renderCropPaddockDropdown();
renderCropInventoryDropdown();
renderJobs();
renderFeedRecords();
renderStockMovements();
renderEquipment();
renderCropRecords();
renderInventoryItems();
renderMap();
handleBulkActionTypeChange();