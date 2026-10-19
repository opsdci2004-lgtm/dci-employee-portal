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
      balanceGrid: byId("balance-grid"),
      applyForm: byId("apply-form"),
      applyMsg: byId("apply-msg"),
      workingDaysPreview: byId("working-days-preview"),
      requestList: byId("request-list"),
      requestEmpty: byId("request-empty"),
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
    this.els.applyForm.addEventListener("submit", (e) => this.submitLeaveRequest(e));
    ["leave-start", "leave-end"].forEach((id) => {
      document.getElementById(id).addEventListener("change", () => this.updateWorkingDaysPreview());
    });
    this.els.calPrev.addEventListener("click", () => this.shiftMonth(-1));
    this.els.calNext.addEventListener("click", () => this.shiftMonth(1));

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
    const workingDays = this.calcWorkingDays(start, end);
    if (workingDays === 0) {
      this.setFormMsg(this.els.applyMsg, "That date range contains no working days.", "error");
      return;
    }

    const { error } = await this.sb.from("leave_requests").insert({
      employee_id: this.user.id,
      leave_type: leaveType,
      start_date: start,
      end_date: end,
      working_days: workingDays,
      reason
    });

    if (error) {
      this.setFormMsg(this.els.applyMsg, error.message, "error");
      return;
    }

    this.setFormMsg(this.els.applyMsg, "Leave request submitted.", "success");
    this.els.applyForm.reset();
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
      .select("leave_type, working_days")
      .eq("employee_id", this.user.id)
      .eq("status", "approved")
      .gte("start_date", yearStart)
      .lte("start_date", yearEnd);

    if (error) console.error(error);

    const taken = { annual: 0, medical: 0, unpaid: 0 };
    (data || []).forEach((r) => {
      taken[r.leave_type] = (taken[r.leave_type] || 0) + Number(r.working_days);
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
            <div class="balance-row"><span>No fixed entitlement — subject to approval</span></div>
          </div>`;
        }
        const remaining = c.entitlement - taken[c.type];
        return `
        <div class="balance-card">
          <h3>${c.label}</h3>
          <div class="balance-remaining">${remaining}</div>
          <div class="balance-row"><span>Remaining of</span><strong>${c.entitlement} days</strong></div>
          <div class="balance-row"><span>Taken this year</span><strong>${taken[c.type]} days</strong></div>
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
            <h4>${this.leaveTypeLabel(r.leave_type)} · ${r.working_days} day${r.working_days == 1 ? "" : "s"}</h4>
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
