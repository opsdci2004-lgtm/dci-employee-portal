/* =====================================================
   DCI Consultants — Leave Application Form (data entry only)
   No login, no database — everything lives in the browser tab
   while you fill the form in, purely to populate a printable
   copy of the official leave form. Nothing is saved; refreshing
   the page clears it. Once a manager has signed the printed
   form, use the Infotech link to log the approved leave.
   ===================================================== */

const SG_PUBLIC_HOLIDAYS_2026 = new Set([
  "2026-01-01", "2026-02-17", "2026-02-18", "2026-03-21", "2026-04-03",
  "2026-05-01", "2026-05-27", "2026-05-31", "2026-08-09", "2026-11-08",
  "2026-12-25"
]);

let rows = [];
let rowSeq = 0;

document.addEventListener("DOMContentLoaded", () => {
  addRow();

  document.getElementById("add-row-btn").addEventListener("click", () => addRow());

  // One delegated listener on the container — row cards are created once
  // and never rebuilt while the user is typing/picking a date in them.
  // Rebuilding on every keystroke (the earlier version did this) destroys
  // and recreates the focused input, which drops focus after one
  // character and closes an open date picker mid-selection.
  const rowsEditor = document.getElementById("rows-editor");
  rowsEditor.addEventListener("input", handleRowFieldChange);
  rowsEditor.addEventListener("change", handleRowFieldChange);
  rowsEditor.addEventListener("click", handleRowClick);

  ["lf-name", "lf-department", "lf-supervisor", "lf-month", "lf-al-earned", "lf-al-taken", "lf-mc-earned", "lf-mc-taken"].forEach((id) => {
    document.getElementById(id).addEventListener("input", renderPreview);
  });

  const now = new Date();
  document.getElementById("lf-month").value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  renderPreview();
});

function addRow() {
  rowSeq++;
  const row = {
    id: rowSeq,
    leaveType: "annual",
    startDate: "",
    endDate: "",
    halfDay: false,
    halfPeriod: "AM",
    reason: ""
  };
  rows.push(row);
  document.getElementById("rows-editor").insertAdjacentHTML("beforeend", rowCardHtml(row));
  renderPreview();
}

function removeRow(id) {
  rows = rows.filter((r) => r.id !== id);
  const card = document.querySelector(`.leave-row-card[data-row="${id}"]`);
  if (card) card.remove();
  if (rows.length === 0) addRow();
  renderPreview();
}

function handleRowFieldChange(e) {
  const el = e.target;
  const field = el.getAttribute("data-field");
  if (!field) return;
  const id = Number(el.getAttribute("data-row"));
  const row = rows.find((r) => r.id === id);
  if (!row) return;

  row[field] = el.type === "checkbox" ? el.checked : el.value;

  if (field === "halfDay") {
    const periodEl = document.querySelector(`[data-half-period-for="${id}"]`);
    if (periodEl) periodEl.style.display = row.halfDay ? "block" : "none";
  }
  if (field === "startDate" || field === "endDate") {
    updateRowHalfVisibility(row);
  }

  updateRowDaysLabel(row);
  renderPreview();
}

function handleRowClick(e) {
  const removeId = e.target.getAttribute("data-remove");
  if (removeId) removeRow(Number(removeId));
}

function updateRowHalfVisibility(row) {
  const wrap = document.querySelector(`[data-half-wrap-for="${row.id}"]`);
  if (!wrap) return;
  const sameDay = row.startDate && row.endDate && row.startDate === row.endDate;
  wrap.style.display = sameDay ? "block" : "none";
  if (!sameDay && row.halfDay) {
    row.halfDay = false;
    const checkbox = document.querySelector(`[data-field="halfDay"][data-row="${row.id}"]`);
    if (checkbox) checkbox.checked = false;
    const periodEl = document.querySelector(`[data-half-period-for="${row.id}"]`);
    if (periodEl) periodEl.style.display = "none";
  }
}

function updateRowDaysLabel(row) {
  const { days, warning } = rowWorkingDays(row);
  const label = document.querySelector(`[data-days-for="${row.id}"]`);
  if (label) {
    label.textContent = `${days ? `${days} working day${days === 1 ? "" : "s"}` : ""}${warning ? ` ⚠ ${warning}` : ""}`;
  }
}

function rowCardHtml(row) {
  const sameDay = row.startDate && row.endDate && row.startDate === row.endDate;
  return `
      <div class="leave-row-card" data-row="${row.id}">
        <div class="form-row">
          <div class="field" style="margin-bottom:10px;">
            <label>Leave type</label>
            <select data-field="leaveType" data-row="${row.id}">
              <option value="annual" ${row.leaveType === "annual" ? "selected" : ""}>Annual Leave</option>
              <option value="medical" ${row.leaveType === "medical" ? "selected" : ""}>Medical Leave</option>
              <option value="hospitalisation" ${row.leaveType === "hospitalisation" ? "selected" : ""}>Hospitalisation Leave</option>
              <option value="childcare" ${row.leaveType === "childcare" ? "selected" : ""}>Childcare Leave (GPCL/ECL)</option>
              <option value="ns" ${row.leaveType === "ns" ? "selected" : ""}>NS / Reservist Leave</option>
              <option value="compassionate" ${row.leaveType === "compassionate" ? "selected" : ""}>Compassionate Leave</option>
              <option value="marriage" ${row.leaveType === "marriage" ? "selected" : ""}>Marriage Leave</option>
              <option value="offinlieu" ${row.leaveType === "offinlieu" ? "selected" : ""}>Off-in-lieu</option>
              <option value="unpaid" ${row.leaveType === "unpaid" ? "selected" : ""}>Unpaid Leave</option>
            </select>
          </div>
          <div class="field" style="margin-bottom:10px;">
            <label>Reason</label>
            <input type="text" data-field="reason" data-row="${row.id}" value="${escapeAttr(row.reason)}" placeholder="e.g. Home leave">
          </div>
        </div>
        <div class="form-row">
          <div class="field" style="margin-bottom:10px;">
            <label>Start date</label>
            <input type="date" data-field="startDate" data-row="${row.id}" value="${row.startDate}">
          </div>
          <div class="field" style="margin-bottom:10px;">
            <label>End date</label>
            <input type="date" data-field="endDate" data-row="${row.id}" value="${row.endDate}">
          </div>
        </div>
        <div class="field" data-half-wrap-for="${row.id}" style="margin-bottom:6px;display:${sameDay ? "block" : "none"};">
          <label style="display:flex;align-items:center;gap:8px;font-weight:600;">
            <input type="checkbox" data-field="halfDay" data-row="${row.id}" style="width:auto;" ${row.halfDay ? "checked" : ""}>
            Half day only
          </label>
          <select data-field="halfPeriod" data-row="${row.id}" data-half-period-for="${row.id}" style="margin-top:8px;display:${row.halfDay ? "block" : "none"};">
            <option value="AM" ${row.halfPeriod === "AM" ? "selected" : ""}>Morning (08:30–12:00)</option>
            <option value="PM" ${row.halfPeriod === "PM" ? "selected" : ""}>Afternoon (13:30–18:00)</option>
          </select>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">
          <span class="form-hint" data-days-for="${row.id}" style="margin:0;"></span>
          <button type="button" class="btn btn-outline btn-sm" data-remove="${row.id}">Remove row</button>
        </div>
      </div>`;
}

function calcWorkingDays(startStr, endStr) {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");
  if (end < start) return 0;
  let count = 0;
  const d = new Date(start);
  while (d <= end) {
    const day = d.getDay();
    const iso = toISO(d);
    if (day !== 0 && day !== 6 && !SG_PUBLIC_HOLIDAYS_2026.has(iso)) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

function rowWorkingDays(row) {
  if (!row.startDate || !row.endDate) return { days: 0, warning: "" };
  if (row.halfDay && row.startDate === row.endDate) {
    const day = new Date(row.startDate + "T00:00:00").getDay();
    if (day === 0 || day === 6 || SG_PUBLIC_HOLIDAYS_2026.has(row.startDate)) {
      return { days: 0, warning: "Weekend/holiday" };
    }
    return { days: 0.5, warning: "" };
  }
  const days = calcWorkingDays(row.startDate, row.endDate);
  return { days, warning: days === 0 ? "No working days" : "" };
}

function renderPreview() {
  const staffName = document.getElementById("lf-name").value.trim();
  const department = document.getElementById("lf-department").value.trim();
  const supervisorName = document.getElementById("lf-supervisor").value.trim();
  const monthVal = document.getElementById("lf-month").value;
  const alEarned = Number(document.getElementById("lf-al-earned").value) || 0;
  const alTaken = Number(document.getElementById("lf-al-taken").value) || 0;
  const mcEarned = Number(document.getElementById("lf-mc-earned").value) || 0;
  const mcTaken = Number(document.getElementById("lf-mc-taken").value) || 0;

  const monthLabel = monthVal
    ? new Date(`${monthVal}-01T00:00:00`).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "—";

  const printRows = rows
    .filter((r) => r.startDate && r.endDate)
    .map((r) => {
      const { days } = rowWorkingDays(r);
      return {
        leave_type: r.leaveType,
        working_days: days,
        start_date: r.startDate,
        end_date: r.endDate,
        reason: r.reason,
        half_day_period: r.halfDay && r.startDate === r.endDate ? r.halfPeriod : null
      };
    });

  const appliedAnnual = printRows.filter((r) => r.leave_type === "annual").reduce((s, r) => s + r.working_days, 0);
  const appliedMedical = printRows.filter((r) => r.leave_type === "medical").reduce((s, r) => s + r.working_days, 0);

  const summary = {
    annual: { earned: alEarned, taken: alTaken, applied: appliedAnnual, balance: alEarned - alTaken - appliedAnnual },
    medical: { earned: mcEarned, taken: mcTaken, applied: appliedMedical, balance: mcEarned - mcTaken - appliedMedical }
  };

  document.getElementById("leaveFormPrint").innerHTML = buildLeaveFormHtml({
    staffName,
    department,
    supervisorName,
    monthLabel,
    rows: printRows,
    summary
  });
}

function toISO(d) {
  // Deliberately NOT toISOString() — that converts to UTC and silently
  // shifts the calendar date by a day in any timezone ahead of UTC
  // (including Singapore), which would exclude public holidays on the
  // wrong day. These Date objects represent local calendar days, so we
  // serialize them back using the local getters.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatLfDate(iso) {
  const d = new Date(iso + "T00:00:00");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;
}

function lfTimes(row) {
  if (row.half_day_period === "AM") return { from: "0830", to: "1200" };
  if (row.half_day_period === "PM") return { from: "1330", to: "1800" };
  return { from: "0830", to: "1800" };
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, "&quot;");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function buildLeaveFormHtml({ staffName, department, supervisorName, monthLabel, rows, summary }) {
  const typeLabel = {
    annual: "Annual Leave",
    medical: "Medical Leave",
    hospitalisation: "Hospitalisation Leave",
    childcare: "Childcare Leave (GPCL/ECL)",
    ns: "NS / Reservist Leave",
    compassionate: "Compassionate Leave",
    marriage: "Marriage Leave",
    offinlieu: "Off-in-lieu",
    unpaid: "Unpaid Leave"
  };

  const tableRows = rows
    .map((r) => {
      const t = lfTimes(r);
      return `
      <tr>
        <td>${typeLabel[r.leave_type]}</td>
        <td class="lf-num">${r.working_days}</td>
        <td class="lf-num">${formatLfDate(r.start_date)}<br>${t.from}</td>
        <td class="lf-num">${formatLfDate(r.end_date)}<br>${t.to}</td>
        <td>${escapeHtml(r.reason)}</td>
      </tr>`;
    })
    .join("");

  const blankRows = Array.from({ length: Math.max(0, 6 - rows.length) })
    .map(() => `<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>`)
    .join("");

  return `
  <div class="leave-form-doc">
    <h1>LEAVE APPLICATION FORM</h1>

    <div class="lf-meta">
      <div><span class="lf-label">Name of Staff:</span> ${escapeHtml(staffName || "")}</div>
      <div><span class="lf-label">Department:</span> ${escapeHtml(department || "")}</div>
    </div>
    <div class="lf-month">Leave Applied for the Month of: ${monthLabel}</div>

    <table>
      <thead>
        <tr>
          <th>Type of Leave</th>
          <th>Number of Days</th>
          <th>Period of Leave<br>From</th>
          <th>Period of Leave<br>To</th>
          <th>Reason</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        ${blankRows}
      </tbody>
    </table>

    <div class="lf-contact">
      During overseas/long leave period, please state contact details:<br>
      Landline:<span class="lf-line-inline"></span> &nbsp; Mobile:<span class="lf-line-inline"></span>
    </div>

    <div class="lf-two-col">
      <div>
        <table class="lf-legend-table">
          <tr><td colspan="2"><strong>Type of Leave *</strong></td></tr>
          <tr><td>MC</td><td>Medical Leave</td></tr>
          <tr><td>AL</td><td>Annual Leave</td></tr>
          <tr><td>AML</td><td>Taking Leave in the Morning</td></tr>
          <tr><td>PML</td><td>Taking Leave in the Afternoon</td></tr>
          <tr><td>UPL</td><td>Unpaid Leave</td></tr>
          <tr><td>RSV</td><td>Reservist Medical Leave</td></tr>
          <tr><td>CL</td><td>Childcare Leave</td></tr>
          <tr><td>PL</td><td>Paternity Leave</td></tr>
          <tr><td>HSP</td><td>Hospitalisation Leave</td></tr>
        </table>
      </div>
      <div>
        <table class="lf-summary-table">
          <tr><td>AL Earned</td><td>${summary.annual.earned}</td></tr>
          <tr><td>AL Taken</td><td>${summary.annual.taken}</td></tr>
          <tr><td>AL Applied</td><td>${summary.annual.applied}</td></tr>
          <tr><td>AL Balance</td><td>${summary.annual.balance}</td></tr>
          <tr><td>MC Earned</td><td>${summary.medical.earned}</td></tr>
          <tr><td>MC Taken</td><td>${summary.medical.taken}</td></tr>
          <tr><td>MC Applied</td><td>${summary.medical.applied}</td></tr>
          <tr><td>MC Balance</td><td>${summary.medical.balance}</td></tr>
        </table>
      </div>
    </div>

    <div class="lf-sign-block">
      <div>
        <div class="lf-caption">Applied By</div>
        <div class="lf-field-row"><span class="lf-field-label">Staff's Signature:</span><span class="lf-line"></span></div>
        <div class="lf-field-row"><span class="lf-field-label">Staff's Name:</span><span class="lf-line">${escapeHtml(staffName || "")}</span></div>
        <div class="lf-field-row"><span class="lf-field-label">Date:</span><span class="lf-line"></span></div>
      </div>
      <div>
        <div class="lf-caption">Approved by</div>
        <div class="lf-field-row"><span class="lf-field-label">Supervisor's Signature:</span><span class="lf-line"></span></div>
        <div class="lf-field-row"><span class="lf-field-label">Supervisor's Name:</span><span class="lf-line">${escapeHtml(supervisorName || "")}</span></div>
        <div class="lf-field-row"><span class="lf-field-label">Date:</span><span class="lf-line"></span></div>
      </div>
    </div>

    <div class="lf-remarks">
      <strong>Remarks</strong>
      <div>After your leave has been approved, please apply the same in Infotech – Leave portal</div>
      <div>For Medical Leave, please upload Medical Certificate in Infotech – Leave portal</div>
      <div>For Medical Claim, please upload Medical Receipt in Infotech – Claims portal</div>
      <div>For Childcare Leave (GPCL/ECL), also complete the official Form GPCL1 (available on the Company Templates page) and submit it to DCI HR with your child's supporting documents</div>
    </div>

    <div class="lf-footer">
      DCI Consultants Pte Ltd<br>
      No 25 International Business Park #02-53 Singapore 609916
    </div>
  </div>`;
}
