/* =====================================================
   DCI Consultants — Expense Claim Form (data entry only)
   No login, no database — everything lives in the browser tab
   while you fill the form in, purely to populate a printable
   copy of the official "Approved Company Expense CLAIM FORM".
   Nothing is saved; refreshing the page clears it. Once a
   supervisor has signed the printed form, use the Infotech link
   to log the approved claim.
   ===================================================== */

const MILEAGE_RATE = 0.25; // S$ per km, DCI's official car/motorcycle rate
const MILEAGE_TAXI_CAP = 250; // S$ per employee per month, mileage + taxi claims combined

let claimRows = [];
let claimRowSeq = 0;

document.addEventListener("DOMContentLoaded", () => {
  addClaimRow();

  document.getElementById("add-row-btn").addEventListener("click", () => addClaimRow());

  // One delegated listener on the container — row cards are created once
  // and never rebuilt while the user is typing in them, so focus and any
  // open date picker survive every keystroke.
  const rowsEditor = document.getElementById("rows-editor");
  rowsEditor.addEventListener("input", handleClaimFieldChange);
  rowsEditor.addEventListener("change", handleClaimFieldChange);
  rowsEditor.addEventListener("click", handleClaimRowClick);

  ["cf-name", "cf-site", "cf-period"].forEach((id) => {
    document.getElementById(id).addEventListener("input", renderClaimPreview);
  });

  const now = new Date();
  document.getElementById("cf-period").value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  renderClaimPreview();
});

function addClaimRow() {
  claimRowSeq++;
  const row = {
    id: claimRowSeq,
    category: "mileage",
    date: "",
    from: "",
    to: "",
    purpose: "",
    mileageKm: "",
    amount: ""
  };
  claimRows.push(row);
  document.getElementById("rows-editor").insertAdjacentHTML("beforeend", claimRowCardHtml(row));
  renderClaimPreview();
}

function removeClaimRow(id) {
  claimRows = claimRows.filter((r) => r.id !== id);
  const card = document.querySelector(`.leave-row-card[data-row="${id}"]`);
  if (card) card.remove();
  if (claimRows.length === 0) addClaimRow();
  renderClaimPreview();
}

function handleClaimFieldChange(e) {
  const el = e.target;
  const field = el.getAttribute("data-field");
  if (!field) return;
  const id = Number(el.getAttribute("data-row"));
  const row = claimRows.find((r) => r.id === id);
  if (!row) return;

  row[field] = el.value;

  if (field === "category") {
    const mileageField = document.querySelector(`[data-mileage-wrap-for="${id}"]`);
    if (mileageField) mileageField.style.display = row.category === "mileage" ? "block" : "none";
    if (row.category !== "mileage") row.mileageKm = "";
  }

  if (field === "mileageKm") {
    const km = Number(row.mileageKm);
    const hint = document.querySelector(`[data-mileage-hint-for="${id}"]`);
    if (km > 0) {
      const suggested = Math.round(km * MILEAGE_RATE * 100) / 100;
      if (hint) hint.textContent = `Suggested at S$${MILEAGE_RATE.toFixed(2)}/km: S$${suggested.toFixed(2)}`;
      // Only auto-fill amount if the staff hasn't typed one in yet.
      if (!row.amount) {
        row.amount = String(suggested);
        const amountInput = document.querySelector(`[data-field="amount"][data-row="${id}"]`);
        if (amountInput) amountInput.value = row.amount;
      }
    } else if (hint) {
      hint.textContent = "";
    }
  }

  renderClaimPreview();
}

function handleClaimRowClick(e) {
  const removeId = e.target.getAttribute("data-remove");
  if (removeId) removeClaimRow(Number(removeId));
}

function claimRowCardHtml(row) {
  return `
      <div class="leave-row-card" data-row="${row.id}">
        <div class="form-row">
          <div class="field" style="margin-bottom:10px;">
            <label>Category</label>
            <select data-field="category" data-row="${row.id}">
              <option value="mileage" ${row.category === "mileage" ? "selected" : ""}>Mileage (car/motorcycle)</option>
              <option value="taxi" ${row.category === "taxi" ? "selected" : ""}>Taxi / ride-hail</option>
              <option value="other" ${row.category === "other" ? "selected" : ""}>Other expense</option>
            </select>
          </div>
          <div class="field" style="margin-bottom:10px;">
            <label>Date</label>
            <input type="date" data-field="date" data-row="${row.id}" value="${row.date}">
          </div>
        </div>
        <div class="field" style="margin-bottom:10px;">
          <label>Purpose of Trip</label>
          <input type="text" data-field="purpose" data-row="${row.id}" value="${escapeAttrClaim(row.purpose)}" placeholder="e.g. Client site visit">
        </div>
        <div class="form-row">
          <div class="field" style="margin-bottom:10px;">
            <label>From</label>
            <input type="text" data-field="from" data-row="${row.id}" value="${escapeAttrClaim(row.from)}" placeholder="Starting point">
          </div>
          <div class="field" style="margin-bottom:10px;">
            <label>To</label>
            <input type="text" data-field="to" data-row="${row.id}" value="${escapeAttrClaim(row.to)}" placeholder="Destination">
          </div>
        </div>
        <div class="form-row">
          <div class="field" data-mileage-wrap-for="${row.id}" style="margin-bottom:4px;display:${row.category === "mileage" ? "block" : "none"};">
            <label>Mileage (km)</label>
            <input type="number" min="0" step="0.1" data-field="mileageKm" data-row="${row.id}" value="${row.mileageKm}">
            <span class="form-hint" data-mileage-hint-for="${row.id}" style="margin:4px 0 0;"></span>
          </div>
          <div class="field" style="margin-bottom:4px;">
            <label>Amount (S$)</label>
            <input type="number" min="0" step="0.01" data-field="amount" data-row="${row.id}" value="${row.amount}">
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:flex-end;margin-top:6px;">
          <button type="button" class="btn btn-outline btn-sm" data-remove="${row.id}">Remove row</button>
        </div>
      </div>`;
}

function renderClaimPreview() {
  const staffName = document.getElementById("cf-name").value.trim();
  const site = document.getElementById("cf-site").value.trim();
  const periodVal = document.getElementById("cf-period").value;
  const periodLabel = periodVal
    ? (() => {
        const [y, m] = periodVal.split("-");
        return `${m}/${y}`;
      })()
    : "";

  const printRows = claimRows.filter((r) => r.date || r.from || r.to || r.purpose || r.mileageKm || r.amount);
  const total = printRows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const mileageTaxiTotal = printRows
    .filter((r) => r.category === "mileage" || r.category === "taxi")
    .reduce((s, r) => s + (Number(r.amount) || 0), 0);

  const totalEl = document.getElementById("claim-total");
  if (!printRows.length) {
    totalEl.innerHTML = "";
  } else {
    const overCap = mileageTaxiTotal > MILEAGE_TAXI_CAP;
    totalEl.innerHTML =
      `Running total: S$${total.toFixed(2)}` +
      ` &nbsp;·&nbsp; Mileage + taxi this period: ` +
      `<span style="color:${overCap ? "#a4241c" : "inherit"};">S$${mileageTaxiTotal.toFixed(2)} of S$${MILEAGE_TAXI_CAP.toFixed(2)} cap</span>` +
      (overCap ? " ⚠ over the monthly cap — the excess may not be reimbursed" : "");
  }

  document.getElementById("claimFormPrint").innerHTML = buildClaimFormHtml({
    staffName,
    site,
    periodLabel,
    rows: printRows,
    total,
    mileageTaxiTotal
  });
}

function escapeAttrClaim(str) {
  return escapeHtmlClaim(str).replace(/"/g, "&quot;");
}

function escapeHtmlClaim(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function formatClaimDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;
}

function buildClaimFormHtml({ staffName, site, periodLabel, rows, total, mileageTaxiTotal }) {
  const categoryTag = { mileage: "Mileage", taxi: "Taxi" };
  const tableRows = rows
    .map((r) => {
      const tag = categoryTag[r.category] ? `[${categoryTag[r.category]}] ` : "";
      return `
      <tr>
        <td class="lf-num">${formatClaimDate(r.date)}</td>
        <td>${escapeHtmlClaim(r.from)}</td>
        <td>${escapeHtmlClaim(r.to)}</td>
        <td>${tag}${escapeHtmlClaim(r.purpose)}</td>
        <td class="lf-num">${r.mileageKm || ""}</td>
        <td class="lf-num">${r.amount ? Number(r.amount).toFixed(2) : ""}</td>
      </tr>`;
    })
    .join("");
  const overCap = (mileageTaxiTotal || 0) > MILEAGE_TAXI_CAP;

  const blankRows = Array.from({ length: Math.max(0, 10 - rows.length) })
    .map(() => `<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>`)
    .join("");

  return `
  <div class="leave-form-doc">
    <h1>Approved Company Expense CLAIM FORM</h1>

    <div class="lf-meta">
      <div><span class="lf-label">Period (MM/YYYY):</span> ${escapeHtmlClaim(periodLabel)}</div>
      <div><span class="lf-label">SITE:</span> ${escapeHtmlClaim(site)}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>From</th>
          <th>To</th>
          <th>Purpose of Trip</th>
          <th>Mileage (km)</th>
          <th>Amount (S$)</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        ${blankRows}
        <tr>
          <td colspan="4"></td>
          <td style="text-align:right;"><strong>Total:</strong></td>
          <td class="lf-num"><strong>${total.toFixed(2)}</strong></td>
        </tr>
      </tbody>
    </table>

    <p style="font-size:12px;">I declared that I have incurred the above expenses on behalf of the Company.</p>
    <p style="font-size:12px;${overCap ? " color:#a4241c; font-weight:bold;" : ""}">Mileage + taxi claims this period: S$${(mileageTaxiTotal || 0).toFixed(2)} of the S$${MILEAGE_TAXI_CAP.toFixed(2)} monthly cap.${overCap ? " This exceeds the cap — the excess may not be reimbursed." : ""}</p>

    <div class="lf-sign-block">
      <div>
        <div class="lf-caption">Requested by</div>
        <div class="lf-field-row"><span class="lf-field-label">Staff's Signature:</span><span class="lf-line"></span></div>
        <div class="lf-field-row"><span class="lf-field-label">Staff's Name:</span><span class="lf-line">${escapeHtmlClaim(staffName || "")}</span></div>
        <div class="lf-field-row"><span class="lf-field-label">Date:</span><span class="lf-line"></span></div>
      </div>
      <div>
        <div class="lf-caption">Approved by</div>
        <div class="lf-field-row"><span class="lf-field-label">Supervisor's Signature:</span><span class="lf-line"></span></div>
        <div class="lf-field-row"><span class="lf-field-label">Supervisor's Name:</span><span class="lf-line"></span></div>
        <div class="lf-field-row"><span class="lf-field-label">Date:</span><span class="lf-line"></span></div>
      </div>
    </div>

    <div class="lf-remarks">
      <strong>Remarks</strong>
      <div>1. Please get the form signed by your supervisor.</div>
      <div>2. Email this approved claim form with supporting receipts to allen@dci-consultants.com and ong.beehoon@outlook.com</div>
      <div>3. Go to Infotech (Claims) to apply the claims and upload the receipts.</div>
      <div>4. Submit this form together with the signed timesheet.</div>
    </div>

    <div class="lf-footer">
      DCI Consultants Pte Ltd<br>
      No 25 International Business Park #02-53 Singapore 609916
    </div>
  </div>`;
}
