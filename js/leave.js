/* =====================================================
   DCI Consultants — Leave Monitoring App
   Talks to Supabase (see js/leave-config.js for connection
   details and supabase/leave-schema.sql for the database
   schema + access-control policies).
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.supabase === "undefined" || typeof SUPABASE_URL === "undefined") {
    console.error("Supabase client library or config failed to load.");
    return;
  }
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  new LeaveApp(sb).init();
});

class LeaveApp {
  constructor(sb) {
    this.sb = sb;
    this.user = null;
    this.profile = null;
    this.holidaySet = new Set();
    this.profilesById = new Map();
    const now = new Date();
    this.calYear = now.getFullYear();
    this.calMonth = now.getMonth();
    this.els = this.cacheEls();
  }

  cacheEls() {
    const byId = (id) => document.getElementById(id);
    return {
      authWrap: byId("auth-wrap"),
      appWrap: byId("app-wrap"),
      signinForm: byId("signin-form"),
      signupForm: byId("signup-form"),
      tabSignin: byId("tab-signin"),
      tabSignup: byId("tab-signup"),
      authMsg: byId("auth-msg"),
      topbarName: byId("topbar-name"),
      topbarRole: byId("topbar-role"),
      topbarAvatar: byId("topbar-avatar"),
      signoutBtn: byId("signout-btn"),
      detailsForm: byId("details-form"),
      detailsName: byId("details-name"),
      detailsDepartment: byId("details-department"),
      detailsMsg: byId("details-msg"),
      balanceGrid: byId("balance-grid"),
      applyForm: byId("apply-form"),
      applyMsg: byId("apply-msg"),
      halfDayField: byId("half-day-field"),
      halfDayCheckbox: byId("leave-half-day"),
      halfPeriodSelect: byId("leave-half-period"),
      workingDaysPreview: byId("working-days-preview"),
      requestList: byId("request-list"),
      requestEmpty: byId("request-empty"),
      formMonth: byId("form-month"),
      generateFormBtn: byId("generate-form-btn"),
      formGenMsg: byId("form-gen-msg"),
      leaveFormWrap: byId("leave-form-wrap"),
      leaveFormPrint: byId("leaveFormPrint"),
      closeFormBtn: byId("close-form-btn"),
      managerSection: byId("manager-section"),
      queueList: byId("queue-list"),
      queueEmpty: byId("queue-empty"),
      calendarGrid: byId("calendar-grid"),
      calendarLabel: byId("calendar-label"),
      calPrev: byId("cal-prev"),
      calNext: byId("cal-next")
    };
  }

  init() {
    this.wireAuthForms();
    this.els.signoutBtn.addEventListener("click", () => this.signOut());
    this.els.detailsForm.addEventListener("submit", (e) => this.saveDetails(e));
    this.els.applyForm.addEventListener("submit", (e) => this.submitLeaveRequest(e));
    ["leave-start", "leave-end"].forEach((id) => {
      document.getElementById(id).addEventListener("change", () => {
        this.toggleHalfDayField();
        this.updateWorkingDaysPreview();
      });
    });
    this.els.halfDayCheckbox.addEventListener("change", () => {
      this.els.halfPeriodSelect.style.display = this.els.halfDayCheckbox.checked ? "block" : "none";
      this.updateWorkingDaysPreview();
    });
    this.els.halfPeriodSelect.addEventListener("change", () => this.updateWorkingDaysPreview());
    this.els.calPrev.addEventListener("click", () => this.shiftMonth(-1));
    this.els.calNext.addEventListener("click", () => this.shiftMonth(1));
    this.els.generateFormBtn.addEventListener("click", () => this.generateLeaveForm());
    this.els.closeFormBtn.addEventListener("click", () => this.els.leaveFormWrap.classList.add("hidden"));

    const now = new Date();
    this.els.formMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    this.sb.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        this.loadForUser(session.user);
      } else {
        this.showAuth();
      }
    });

    this.sb.auth.getSession().then(({ data }) => {
      if (data.session && data.session.user) {
        this.loadForUser(data.session.user);
      } else {
        this.showAuth();
      }
    });
  }

  showAuth() {
    this.user = null;
    this.profile = null;
    this.els.authWrap.classList.remove("hidden");
    this.els.appWrap.classList.add("hidden");
  }

  wireAuthForms() {
    this.els.tabSignin.addEventListener("click", () => this.switchAuthTab("signin"));
    this.els.tabSignup.addEventListener("click", () => this.switchAuthTab("signup"));

    this.els.signinForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.setAuthMsg("");
      const email = document.getElementById("signin-email").value.trim();
      const password = document.getElementById("signin-password").value;
      const { error } = await this.sb.auth.signInWithPassword({ email, password });
      if (error) this.setAuthMsg(error.message, "error");
    });

    this.els.signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.setAuthMsg("");
      const fullName = document.getElementById("signup-name").value.trim();
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value;
      if (password.length < 6) {
        this.setAuthMsg("Password must be at least 6 characters.", "error");
        return;
      }
      const { data, error } = await this.sb.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) {
        this.setAuthMsg(error.message, "error");
        return;
      }
      if (!data.session) {
        this.setAuthMsg("Account created. Check your email to confirm it, then sign in.", "success");
        this.switchAuthTab("signin");
      }
    });
  }

  switchAuthTab(tab) {
    const isSignin = tab === "signin";
    this.els.signinForm.classList.toggle("hidden", !isSignin);
    this.els.signupForm.classList.toggle("hidden", isSignin);
    this.els.tabSignin.setAttribute("aria-selected", String(isSignin));
    this.els.tabSignup.setAttribute("aria-selected", String(!isSignin));
    this.setAuthMsg("");
  }

  setAuthMsg(msg, type) {
    this.els.authMsg.textContent = msg || "";
    this.els.authMsg.className = "form-msg" + (type ? " " + type : "") + (msg ? "" : " hidden");
  }

  async signOut() {
    await this.sb.auth.signOut();
  }

  async loadForUser(user) {
    this.user = user;
    this.els.authWrap.classList.add("hidden");
    this.els.appWrap.classList.remove("hidden");

    let profile = await this.fetchOwnProfile();
    if (!profile) {
      await new Promise((r) => setTimeout(r, 800));
      profile = await this.fetchOwnProfile();
    }
    if (!profile) {
      this.els.appWrap.innerHTML = '<p class="form-msg error">Could not load your profile. Please refresh the page.</p>';
      return;
    }
    this.profile = profile;

    this.renderTopbar();
    this.els.detailsName.value = this.profile.full_name || "";
    this.els.detailsDepartment.value = this.profile.department || "";
    await this.loadHolidays();
    await this.refreshBalances();
    await this.refreshMyRequests();

    if (this.profile.role === "manager") {
      this.els.managerSection.classList.remove("hidden");
      await this.loadAllProfiles();
      await this.refreshQueue();
      await this.refreshCalendar();
    } else {
      this.els.managerSection.classList.add("hidden");
    }
  }

  async fetchOwnProfile() {
    const { data, error } = await this.sb.from("profiles").select("*").eq("id", this.user.id).maybeSingle();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  }

  renderTopbar() {
    const name = this.profile.full_name || this.profile.email;
    this.els.topbarName.textContent = name;
    this.els.topbarAvatar.textContent = name.slice(0, 1).toUpperCase();
    this.els.topbarRole.textContent = this.profile.role;
    this.els.topbarRole.classList.toggle("is-manager", this.profile.role === "manager");
  }

  async saveDetails(e) {
    e.preventDefault();
    const fullName = this.els.detailsName.value.trim();
    const department = this.els.detailsDepartment.value.trim();
    const { error } = await this.sb.rpc("update_my_profile", {
      p_full_name: fullName,
      p_department: department || null
    });
    if (error) {
      this.els.detailsMsg.textContent = error.message;
      this.els.detailsMsg.style.color = "#a4241c";
      return;
    }
    this.profile.full_name = fullName || this.profile.full_name;
    this.profile.department = department || null;
    this.renderTopbar();
    this.els.detailsMsg.textContent = "Saved.";
    this.els.detailsMsg.style.color = "#1a7a43";
    setTimeout(() => { this.els.detailsMsg.textContent = ""; }, 2500);
  }

  toggleHalfDayField() {
    const start = document.getElementById("leave-start").value;
    const end = document.getElementById("leave-end").value;
    const sameDay = start && end && start === end;
    this.els.halfDayField.style.display = sameDay ? "block" : "none";
    if (!sameDay) {
      this.els.halfDayCheckbox.checked = false;
      this.els.halfPeriodSelect.style.display = "none";
    }
  }

  async loadHolidays() {
    const { data, error } = await this.sb.from("public_holidays").select("holiday_date");
    if (error) {
      console.error(error);
      return;
    }
    this.holidaySet = new Set((data || []).map((h) => h.holiday_date));
  }

  calcWorkingDays(startStr, endStr) {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr + "T00:00:00");
    const end = new Date(endStr + "T00:00:00");
    if (end < start) return 0;
    let count = 0;
    const d = new Date(start);
    while (d <= end) {
      const day = d.getDay();
      const iso = toISO(d);
      if (day !== 0 && day !== 6 && !this.holidaySet.has(iso)) count++;
      d.setDate(d.getDate() + 1);
    }
    return count;
  }

  updateWorkingDaysPreview() {
    const start = document.getElementById("leave-start").value;
    const end = document.getElementById("leave-end").value;
    if (!start || !end) {
      this.els.workingDaysPreview.textContent = "";
      return;
    }
    if (end < start) {
      this.els.workingDaysPreview.textContent = "End date must be on or after the start date.";
      return;
    }
    if (this.els.halfDayCheckbox.checked && start === end) {
      const day = new Date(start + "T00:00:00").getDay();
      if (day === 0 || day === 6 || this.holidaySet.has(start)) {
        this.els.workingDaysPreview.textContent = "That date is a weekend or public holiday — half-day leave isn't applicable.";
        return;
      }
      this.els.workingDaysPreview.textContent = "0.5 working day";
      return;
    }
    const days = this.calcWorkingDays(start, end);
    this.els.workingDaysPreview.textContent = `${days} working day${days === 1 ? "" : "s"} (weekends & public holidays excluded)`;
  }

  async submitLeaveRequest(e) {
    e.preventDefault();
    this.setFormMsg(this.els.applyMsg, "");
    const leaveType = document.getElementById("leave-type").value;
    const start = document.getElementById("leave-start").value;
    const end = document.getElementById("leave-end").value;
    const reason = document.getElementById("leave-reason").value.trim();

    if (!start || !end || end < start) {
      this.setFormMsg(this.els.applyMsg, "Please choose a valid date range.", "error");
      return;
    }
    if (!reason) {
      this.setFormMsg(this.els.applyMsg, "Please add a short reason.", "error");
      return;
    }

    const isHalfDay = this.els.halfDayCheckbox.checked && start === end;
    let workingDays;
    let halfDayPeriod = null;

    if (isHalfDay) {
      const day = new Date(start + "T00:00:00").getDay();
      if (day === 0 || day === 6 || this.holidaySet.has(start)) {
        this.setFormMsg(this.els.applyMsg, "That date is a weekend or public holiday.", "error");
        return;
      }
      workingDays = 0.5;
      halfDayPeriod = this.els.halfPeriodSelect.value;
    } else {
      workingDays = this.calcWorkingDays(start, end);
      if (workingDays === 0) {
        this.setFormMsg(this.els.applyMsg, "That date range contains no working days.", "error");
        return;
      }
    }

    const { error } = await this.sb.from("leave_requests").insert({
      employee_id: this.user.id,
      leave_type: leaveType,
      start_date: start,
      end_date: end,
      working_days: workingDays,
      half_day_period: halfDayPeriod,
      reason
    });

    if (error) {
      this.setFormMsg(this.els.applyMsg, error.message, "error");
      return;
    }

    this.setFormMsg(this.els.applyMsg, "Leave request submitted.", "success");
    this.els.applyForm.reset();
    this.els.halfDayField.style.display = "none";
    this.els.halfPeriodSelect.style.display = "none";
    this.els.workingDaysPreview.textContent = "";
    await this.refreshMyRequests();
    if (this.profile.role === "manager") {
      await this.refreshQueue();
      await this.refreshCalendar();
    }
  }

  setFormMsg(el, msg, type) {
    el.textContent = msg || "";
    el.className = "form-msg" + (type ? " " + type : "") + (msg ? "" : " hidden");
  }

  async refreshBalances() {
    const yearStart = `${this.calYear}-01-01`;
    const yearEnd = `${this.calYear}-12-31`;
    const { data, error } = await this.sb
      .from("leave_requests")
      .select("leave_type, working_days, status")
      .eq("employee_id", this.user.id)
      .in("status", ["approved", "pending"])
      .gte("start_date", yearStart)
      .lte("start_date", yearEnd);

    if (error) console.error(error);

    const taken = { annual: 0, medical: 0, unpaid: 0 };
    const applied = { annual: 0, medical: 0, unpaid: 0 };
    (data || []).forEach((r) => {
      const bucket = r.status === "approved" ? taken : applied;
      bucket[r.leave_type] = (bucket[r.leave_type] || 0) + Number(r.working_days);
    });

    const cards = [
      { type: "annual", label: "Annual Leave", entitlement: this.profile.annual_entitlement },
      { type: "medical", label: "Medical Leave", entitlement: this.profile.medical_entitlement },
      { type: "unpaid", label: "Unpaid Leave", entitlement: null }
    ];

    this.els.balanceGrid.innerHTML = cards
      .map((c) => {
        if (c.entitlement === null) {
          return `
          <div class="balance-card">
            <h3>${c.label}</h3>
            <div class="balance-remaining">${taken[c.type]}</div>
            <div class="balance-row"><span>Days taken this year</span></div>
            <div class="balance-row"><span>Days pending approval</span><strong>${applied[c.type]}</strong></div>
            <div class="balance-row"><span>No fixed entitlement — subject to approval</span></div>
          </div>`;
        }
        const remaining = c.entitlement - taken[c.type] - applied[c.type];
        return `
        <div class="balance-card">
          <h3>${c.label}</h3>
          <div class="balance-remaining">${remaining}</div>
          <div class="balance-row"><span>Remaining of</span><strong>${c.entitlement} days</strong></div>
          <div class="balance-row"><span>Taken this year</span><strong>${taken[c.type]} days</strong></div>
          <div class="balance-row"><span>Pending approval</span><strong>${applied[c.type]} days</strong></div>
        </div>`;
      })
      .join("");
  }

  async refreshMyRequests() {
    const { data, error } = await this.sb
      .from("leave_requests")
      .select("*")
      .eq("employee_id", this.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    const list = data || [];
    this.els.requestEmpty.classList.toggle("visible", list.length === 0);
    this.els.requestList.innerHTML = list.map((r) => this.renderRequestItem(r)).join("");

    this.els.requestList.querySelectorAll("[data-cancel]").forEach((btn) => {
      btn.addEventListener("click", () => this.cancelRequest(btn.getAttribute("data-cancel")));
    });
  }

  renderRequestItem(r) {
    return `
      <div class="request-item">
        <div class="request-item-top">
          <div>
            <h4>${this.leaveTypeLabel(r.leave_type)} · ${r.working_days} day${r.working_days == 1 ? "" : "s"}${r.half_day_period ? ` (${r.half_day_period})` : ""}</h4>
            <div class="request-meta">${formatDateRange(r.start_date, r.end_date)}</div>
          </div>
          <span class="status-pill ${r.status}">${r.status}</span>
        </div>
        <p class="request-reason">${escapeHtml(r.reason)}</p>
        ${r.manager_comment ? `<div class="manager-comment"><strong>Manager comment:</strong> ${escapeHtml(r.manager_comment)}</div>` : ""}
        ${r.status === "pending" ? `<div class="queue-actions"><button class="btn btn-outline btn-sm" data-cancel="${r.id}">Cancel request</button></div>` : ""}
      </div>`;
  }

  async cancelRequest(id) {
    if (!confirm("Cancel this leave request?")) return;
    const { error } = await this.sb.from("leave_requests").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    await this.refreshMyRequests();
    await this.refreshBalances();
    if (this.profile.role === "manager") {
      await this.refreshQueue();
      await this.refreshCalendar();
    }
  }

  leaveTypeLabel(t) {
    return { annual: "Annual Leave", medical: "Medical Leave", unpaid: "Unpaid Leave" }[t] || t;
  }

  async generateLeaveForm() {
    this.els.formGenMsg.textContent = "Generating...";
    const monthVal = this.els.formMonth.value; // "YYYY-MM"
    if (!monthVal) {
      this.els.formGenMsg.textContent = "Please pick a month first.";
      return;
    }
    const [y, m] = monthVal.split("-").map(Number);
    const monthStart = `${monthVal}-01`;
    const monthEndDate = new Date(y, m, 0); // last day of month
    const monthEnd = toISO(monthEndDate);
    const yearStart = `${y}-01-01`;

    // Rows for the selected month (what's being applied for / already on record this month).
    const { data: monthRows, error: monthErr } = await this.sb
      .from("leave_requests")
      .select("*")
      .eq("employee_id", this.user.id)
      .in("status", ["pending", "approved"])
      .gte("start_date", monthStart)
      .lte("start_date", monthEnd)
      .order("start_date", { ascending: true });

    if (monthErr) {
      this.els.formGenMsg.textContent = monthErr.message;
      return;
    }

    // Approved leave earlier in the year, outside this month (= "already taken").
    const { data: priorApproved, error: priorErr } = await this.sb
      .from("leave_requests")
      .select("leave_type, working_days")
      .eq("employee_id", this.user.id)
      .eq("status", "approved")
      .gte("start_date", yearStart)
      .lte("start_date", `${y}-12-31`)
      .or(`start_date.lt.${monthStart},start_date.gt.${monthEnd}`);

    if (priorErr) console.error(priorErr);

    const takenYtd = { annual: 0, medical: 0 };
    (priorApproved || []).forEach((r) => {
      if (takenYtd[r.leave_type] !== undefined) {
        takenYtd[r.leave_type] += Number(r.working_days);
      }
    });

    const appliedThisMonth = { annual: 0, medical: 0 };
    (monthRows || []).forEach((r) => {
      if (appliedThisMonth[r.leave_type] !== undefined) {
        appliedThisMonth[r.leave_type] += Number(r.working_days);
      }
    });

    const summary = {
      annual: {
        earned: this.profile.annual_entitlement,
        taken: takenYtd.annual,
        applied: appliedThisMonth.annual,
        balance: this.profile.annual_entitlement - takenYtd.annual - appliedThisMonth.annual
      },
      medical: {
        earned: this.profile.medical_entitlement,
        taken: takenYtd.medical,
        applied: appliedThisMonth.medical,
        balance: this.profile.medical_entitlement - takenYtd.medical - appliedThisMonth.medical
      }
    };

    const monthLabel = monthEndDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });

    this.els.leaveFormPrint.innerHTML = buildLeaveFormHtml({
      staffName: this.profile.full_name,
      department: this.profile.department,
      monthLabel,
      rows: monthRows || [],
      summary
    });
    this.els.leaveFormWrap.classList.remove("hidden");
    this.els.formGenMsg.textContent = (monthRows || []).length === 0
      ? "No leave requests found for that month — a blank form has been generated."
      : "";
    this.els.leaveFormWrap.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async loadAllProfiles() {
    const { data, error } = await this.sb.from("profiles").select("id, full_name, team");
    if (error) {
      console.error(error);
      return;
    }
    this.profilesById = new Map((data || []).map((p) => [p.id, p]));
  }

  async refreshQueue() {
    const { data, error } = await this.sb
      .from("leave_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }
    const list = data || [];
    this.els.queueEmpty.classList.toggle("visible", list.length === 0);
    this.els.queueList.innerHTML = list.map((r) => this.renderQueueItem(r)).join("");

    this.els.queueList.querySelectorAll("[data-approve]").forEach((btn) => {
      btn.addEventListener("click", () => this.decide(btn.getAttribute("data-approve"), "approved"));
    });
    this.els.queueList.querySelectorAll("[data-reject]").forEach((btn) => {
      btn.addEventListener("click", () => this.decide(btn.getAttribute("data-reject"), "rejected"));
    });
  }

  renderQueueItem(r) {
    const employee = this.profilesById.get(r.employee_id);
    const name = employee ? employee.full_name : "Unknown employee";
    const team = employee ? employee.team : "";
    return `
      <div class="queue-item" data-request-id="${r.id}">
        <div class="queue-item-top">
          <div>
            <h4>${escapeHtml(name)} <span style="font-weight:400;color:var(--color-text-muted);">· ${escapeHtml(team)}</span></h4>
            <div class="queue-meta">${this.leaveTypeLabel(r.leave_type)} · ${formatDateRange(r.start_date, r.end_date)} · ${r.working_days} working day${r.working_days == 1 ? "" : "s"}</div>
          </div>
          <span class="status-pill pending">pending</span>
        </div>
        <p class="queue-reason">${escapeHtml(r.reason)}</p>
        <div class="queue-actions">
          <textarea placeholder="Optional comment for the employee..." id="comment-${r.id}"></textarea>
          <button class="btn btn-primary btn-sm" data-approve="${r.id}">Approve</button>
          <button class="btn btn-outline btn-sm" data-reject="${r.id}">Reject</button>
        </div>
      </div>`;
  }

  async decide(id, status) {
    const commentEl = document.getElementById(`comment-${id}`);
    const comment = commentEl ? commentEl.value.trim() : "";
    const { error } = await this.sb
      .from("leave_requests")
      .update({
        status,
        manager_comment: comment || null,
        decided_by: this.user.id,
        decided_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }
    await this.refreshQueue();
    await this.refreshCalendar();
  }

  shiftMonth(delta) {
    this.calMonth += delta;
    if (this.calMonth < 0) {
      this.calMonth = 11;
      this.calYear--;
    }
    if (this.calMonth > 11) {
      this.calMonth = 0;
      this.calYear++;
    }
    this.refreshCalendar();
  }

  async refreshCalendar() {
    const monthStart = new Date(this.calYear, this.calMonth, 1);
    const monthEnd = new Date(this.calYear, this.calMonth + 1, 0);
    const gridStart = new Date(monthStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());
    const gridEnd = new Date(monthEnd);
    gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

    const monthStartStr = toISO(monthStart);
    const monthEndStr = toISO(monthEnd);

    const { data, error } = await this.sb
      .from("leave_requests")
      .select("*")
      .in("status", ["approved", "pending"])
      .lte("start_date", monthEndStr)
      .gte("end_date", monthStartStr);

    if (error) {
      console.error(error);
      return;
    }
    const requests = data || [];

    this.els.calendarLabel.textContent = monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });

    let html = "";
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d) => {
      html += `<div class="calendar-dow">${d}</div>`;
    });

    const d = new Date(gridStart);
    while (d <= gridEnd) {
      const iso = toISO(d);
      const isOtherMonth = d.getMonth() !== this.calMonth;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const isHoliday = this.holidaySet.has(iso);
      const dayRequests = requests.filter((r) => iso >= r.start_date && iso <= r.end_date);

      let cellClass = "calendar-cell";
      if (isOtherMonth) cellClass += " other-month";
      else if (isHoliday) cellClass += " is-holiday";
      else if (isWeekend) cellClass += " is-weekend";

      const chips = dayRequests
        .slice(0, 3)
        .map((r) => {
          const employee = this.profilesById.get(r.employee_id);
          const name = employee ? employee.full_name.split(" ")[0] : "?";
          const pendingClass = r.status === "pending" ? " is-pending" : "";
          return `<span class="leave-chip ${r.leave_type}${pendingClass}" title="${escapeHtml(name)} — ${this.leaveTypeLabel(r.leave_type)} (${r.status})">${escapeHtml(name)}</span>`;
        })
        .join("");
      const more = dayRequests.length > 3 ? `<span class="leave-chip unpaid">+${dayRequests.length - 3} more</span>` : "";

      html += `<div class="${cellClass}"><span class="calendar-date">${d.getDate()}</span>${chips}${more}</div>`;
      d.setDate(d.getDate() + 1);
    }

    this.els.calendarGrid.innerHTML = html;
  }
}

function toISO(d) {
  return d.toISOString().slice(0, 10);
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

function buildLeaveFormHtml({ staffName, department, monthLabel, rows, summary }) {
  const typeLabel = { annual: "Annual Leave", medical: "Medical Leave", unpaid: "Unpaid Leave" };

  const tableRows = rows
    .map((r) => {
      const t = lfTimes(r);
      return `
      <tr>
        <td>${typeLabel[r.leave_type]}${r.status === "pending" ? " (pending)" : ""}</td>
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
    <p class="lf-sample-note">${rows.length === 0 ? "No requests recorded for this month — blank form for manual use." : "Generated from the DCI Consultants Employee Portal."}</p>

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
        <div class="lf-field-row"><span class="lf-field-label">Supervisor's Name:</span><span class="lf-line"></span></div>
        <div class="lf-field-row"><span class="lf-field-label">Date:</span><span class="lf-line"></span></div>
      </div>
    </div>

    <div class="lf-remarks">
      <strong>Remarks</strong>
      <div>After your leave has been approved, please apply the same in Infotech – Leave portal</div>
      <div>For Medical Leave, please upload Medical Certificate in Infotech – Leave portal</div>
      <div>For Medical Claim, please upload Medical Receipt in Infotech – Claims portal</div>
    </div>

    <div class="lf-footer">
      DCI Consultants Pte Ltd<br>
      25 International Business Park #02-35 German Centre Singapore 609915
    </div>
  </div>`;
}

function formatDateRange(startIso, endIso) {
  const opts = { month: "short", day: "numeric", year: "numeric" };
  const start = new Date(startIso + "T00:00:00").toLocaleDateString(undefined, opts);
  const end = new Date(endIso + "T00:00:00").toLocaleDateString(undefined, opts);
  return startIso === endIso ? start : `${start} – ${end}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}
