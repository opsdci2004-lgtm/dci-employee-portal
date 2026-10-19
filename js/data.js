/* =====================================================
   DCI Consultants — Employee Portal
   Content data for Templates, Policies and Guides pages.

   HOW TO ADD AN ITEM (no coding knowledge needed):
   1. Copy one of the objects below (the part between { and }).
   2. Paste it as a new entry in the same array, just before the
      closing "]" of that array.
   3. Change the text inside the quotes "" to your new content.
   4. Save the file. The page updates automatically — no other
      file needs to change.
   ===================================================== */

/* ---------- Company Templates ---------- */
const TEMPLATES = [
  {
    id: "timesheet",
    title: "Weekly Timesheet",
    description: "Standard timesheet for recording daily time in/out, overtime and leave taken, with a public holiday reference sheet.",
    category: "Finance & Payroll",
    fileType: "XLSX",
    icon: "🗒️",
    file: "assets/docs/weekly-timesheet-template.xlsx"
  },
  {
    id: "leave-application",
    title: "Leave Application Form",
    description: "Use this form to request annual leave, sick leave or unpaid leave for approval.",
    category: "HR",
    fileType: "DOCX",
    icon: "🌴",
    file: "assets/docs/leave-application-form.txt"
  },
  {
    id: "expense-claim",
    title: "Company Expense Claim Form",
    description: "Approved expense claim form — get it signed by your supervisor, then email it with receipts and submit the claim in Infotech.",
    category: "Finance & Payroll",
    fileType: "DOCX",
    icon: "💳",
    file: "assets/docs/company-expense-claim-form.docx"
  },
  {
    id: "mileage-claim",
    title: "Monthly Mileage Claim Form",
    description: "For staff using their own car or motorcycle on approved business travel only — S$0.25/km, capped at S$250 (1,000 km) per employee per month. Distance and claim amount calculate automatically.",
    category: "Finance & Payroll",
    fileType: "XLSX",
    icon: "🏍️",
    file: "assets/docs/mileage-claim-form.xlsx"
  },
  {
    id: "onboarding-checklist",
    title: "New Employee Onboarding Checklist (First Two Weeks)",
    description: "Day-by-day checklist for new contract employees and DCI HR — before Day 1 through the Week 2 review.",
    category: "HR",
    fileType: "PDF",
    icon: "✅",
    file: "assets/docs/onboarding-checklist.pdf"
  },
  {
    id: "nda-acknowledgement",
    title: "NDA Acknowledgement",
    description: "Non-disclosure agreement acknowledgement required for all contract staff.",
    category: "Legal & Compliance",
    fileType: "PDF",
    icon: "🔒",
    file: "assets/docs/nda-acknowledgement.txt"
  },
  {
    id: "equipment-request",
    title: "IT Equipment Request",
    description: "Request a laptop, monitor or other equipment needed to perform your role.",
    category: "IT",
    fileType: "DOCX",
    icon: "💻",
    file: "assets/docs/equipment-request-form.txt"
  }
];

/* ---------- Company Policies ---------- */
const POLICIES = [
  {
    id: "code-of-conduct",
    title: "Code of Business Conduct & Ethics",
    category: "Workplace",
    updated: "2026-10-19",
    summary: "The standard of conduct DCI expects everywhere we work — our offices, remote work and client sites.",
    body: [
      "We keep this Code in plain, everyday language on purpose — a policy only works if people can actually understand it, not just sign it.",
      "It applies to everyone acting for DCI Consultants: employees, contract and assigned staff, recruiters, finance staff, and professionals placed at a client site. Contractors, agents and business partners representing DCI are expected to meet the same standard.",
      "<strong>Two organisations, one standard.</strong> DCI remains your employer of record and handles pay, CPF, leave and contractual matters. A client may direct your day-to-day work and set site-specific rules, but cannot change your DCI salary, contract or work-pass terms on their own. If a client instruction and DCI's standards ever conflict, raise it with DCI before proceeding.",
      "<strong>Our five values:</strong> Integrity (tell the truth, keep accurate records), Respect (treat colleagues, candidates and clients with dignity), Care (put safety and well-being first), Security (protect client systems, data and property) and Service (deliver dependable work and honour commitments).",
      "<strong>What it covers:</strong> fair treatment and workplace safety; professional conduct at client sites; confidentiality, data protection and safe use of AI/online tools; zero tolerance for bribery, kickbacks and falsified records (timesheets, invoices, CVs); responsible public conduct and social media use; and how to speak up if something looks wrong.",
      "A quick test for any grey area: Is it lawful? Is it safe? Would DCI and the client both agree it's authorised? Are the records accurate? Would you be comfortable explaining the decision to your manager?",
      "Suspected breaches — of this Code, a policy, or the law — can be reported through DCI's confidential reporting channel. Reports may be made without giving your name where possible, are handled discreetly, and anyone reporting in good faith is protected from retaliation.",
      "Effective 19 October 2026 (next review 19 October 2030), approved by the Director of DCI Consultants Pte Ltd. To report a concern, contact sale@dci-consultants.com, or escalate to Ong Bee Hoon if it involves your immediate reporting line.",
      "<a href=\"assets/docs/code-of-business-conduct-and-ethics.pdf\" download>📄 Download the full Code of Business Conduct &amp; Ethics (PDF)</a>"
    ]
  },
  {
    id: "leave-attendance",
    title: "Leave & Attendance Policy",
    category: "HR",
    updated: "2026-02-01",
    summary: "Rules for requesting leave, recording attendance and notifying your manager of absence.",
    body: [
      "Leave requests must be submitted at least 3 business days in advance using the Leave Application Form on the Templates page, except for emergency or sick leave.",
      "Unplanned absences must be reported to your direct manager before 9:00 AM local time.",
      "Entitlement days can vary by contract type (short-term vs long-term contractors) — contact sale@dci-consultants.com or Ms Ong Bee Hoon (9176 8147 / 9879 8085) for your specific terms."
    ]
  },
  {
    id: "statutory-leave-sg",
    title: "Leave Policy Guideline (Singapore) — Parental, NS & Medical Leave",
    category: "HR",
    updated: "2026-10-04",
    summary: "Maternity, paternity, Shared Parental Leave, National Service and medical/hospitalisation leave entitlements under Singapore law.",
    body: [
      "Sets out how the company grants maternity, paternity, Shared Parental Leave (SPL), National Service (NS) and medical/hospitalisation leave in line with the Employment Act, the Child Development Co-Savings Act and the Enlistment Act. Where our policy is more generous than the statutory minimum, the more generous term applies. No employee is dismissed, demoted or disadvantaged for taking leave they're entitled to, and medical/family information is shared only with HR and the approving manager on a need-to-know basis.",
      "<strong>Maternity leave:</strong> 16 weeks paid for a Singapore citizen child (12 weeks if not a citizen), for mothers legally married to the child's father with at least 3 continuous months of service. The company pays salary during leave and claims reimbursement from the Government, capped at S$10,000 per 4 weeks (inclusive of CPF). Inform HR as early as possible with the expected delivery date; you return to the same role or an equivalent one on no less favourable terms.",
      "<strong>Paternity leave &amp; Shared Parental Leave:</strong> 4 weeks of Government-Paid Paternity Leave for fathers, plus 10 weeks of SPL shared between both parents (5 weeks each by default, adjustable by agreement) for children born on or after 1 April 2026 — 6 weeks (3 each by default) for children born between 1 April 2025 and 31 March 2026. Both must be taken within 12 months of birth; pay is capped at S$2,500 per week (inclusive of CPF), reimbursed by the Government.",
      "<strong>National Service (NS) leave:</strong> protected leave for in-camp training and call-ups, separate from annual leave. Salary continues and the company claims support from MINDEF; there's no dismissal, demotion or loss of benefits for NS duty, and you resume the same or an equivalent role afterward. Employees may apply to MINDEF to defer where there's a genuine business or personal need, with HR's support.",
      "<strong>Medical &amp; hospitalisation leave</strong> scales with length of service: 5 days outpatient / 15 days total at 3 months' service, rising to 14 days outpatient / 60 days total (inclusive of hospitalisation, not on top of it) from 6 months onward. A medical certificate from a registered doctor or dentist is required for any paid sick leave; notify your manager or HR within 48 hours of the absence. A false MC is a disciplinary matter.",
      "<strong>Applying:</strong> submit the leave form to your manager and HR with supporting proof (MC, call-up notice or expected delivery date). Your manager confirms cover arrangements within 3 working days, then HR checks eligibility/balance and confirms approval in writing. For parental leave, HR also files the government reimbursement claim.",
      "<strong>Quick answers:</strong> sick leave does not carry forward unless stated otherwise; parents may split SPL unevenly if both agree and register the change; NS leave does not reduce your annual leave balance.",
      "Before this guideline is finalised, DCI still needs to confirm NS pay-claim rates/steps with MINDEF, which sick leave rules apply to managers and executives with MOM, and the maternity pay reimbursement caps with MSF/MOM, and have the final policy reviewed by legal/HR counsel.",
      "<a href=\"assets/docs/leave-policy-guideline-singapore.pdf\" download>📄 Download the full Leave Policy Guideline (PDF)</a>"
    ]
  },
  {
    id: "timesheet-payment",
    title: "Timesheet & Payment Schedule",
    category: "Finance & Payroll",
    updated: "2026-01-20",
    summary: "When timesheets are due and how often contractors are paid.",
    body: [
      "Timesheets are due by 5:00 PM every Friday and must be approved by your project lead before payroll processing.",
      "Payments are processed on a monthly cycle, typically 5 business days after approval.",
      "Late or unapproved timesheets may delay payment to the following cycle."
    ]
  },
  {
    id: "data-protection",
    title: "Data Protection & Confidentiality",
    category: "Legal & Compliance",
    updated: "2026-03-05",
    summary: "How client and company data must be handled, stored and shared.",
    body: [
      "Confidential client and company information must never be stored on personal devices or shared via personal email or messaging apps.",
      "All contract employees must sign the NDA Acknowledgement before accessing client systems or data.",
      "Report any suspected data breach to IT Security immediately — do not attempt to resolve it yourself."
    ]
  },
  {
    id: "it-acceptable-use",
    title: "IT Acceptable Use Policy",
    category: "IT",
    updated: "2026-02-18",
    summary: "Guidelines for appropriate use of company devices, accounts and networks.",
    body: [
      "Company devices and accounts are provided for business use; limited personal use is permitted if it does not interfere with work or breach policy.",
      "Installing unauthorised software or connecting personal storage devices to company equipment is not permitted without IT approval.",
      "Use strong, unique passwords and enable multi-factor authentication on all company accounts."
    ]
  },
  {
    id: "workplace-safety",
    title: "Workplace Safety Policy",
    category: "Workplace",
    updated: "2025-12-10",
    summary: "Health and safety expectations for office-based and remote contract employees.",
    body: [
      "Report any workplace hazard, injury or near-miss to your site supervisor or HR within 24 hours.",
      "Remote workers are responsible for maintaining a safe, ergonomic home workstation.",
      "Check your site noticeboard or ask your client site supervisor for the local emergency evacuation procedure and assembly point, since these vary by location."
    ]
  }
];

/* ---------- Employee User Guides ---------- */
const GUIDES = [
  {
    id: "submit-timesheet",
    title: "How to Submit a Timesheet",
    steps: [
      "Download the Weekly Timesheet template from the Company Templates page.",
      "Fill in your hours worked for each day, including any overtime or leave taken.",
      "Save the file using the format LastName_Timesheet_WeekEnding.xlsx.",
      "Email the completed timesheet to your project lead for approval before Friday 5:00 PM.",
      "Keep a copy for your own records."
    ],
    tip: "Submit your timesheet a day early during public-holiday weeks, since approvals may take longer."
  },
  {
    id: "apply-for-leave",
    title: "How to Apply for Leave",
    steps: [
      "Download the Leave Application Form from the Company Templates page.",
      "Complete your details, leave type and requested dates.",
      "Submit the form to your manager at least 3 business days before the leave start date.",
      "Wait for written approval before confirming any travel or personal plans.",
      "Once approved, HR will update your leave balance within 2 business days.",
      "After your client's supervisor has signed off your leave form, log in to the Infotech Leave System to apply for the leave and upload the approved, signed documents."
    ],
    tip: "For sick leave, notify your manager as early as possible on the day of absence — the form can be submitted afterward."
  },
  {
    id: "claim-expenses",
    title: "How to Claim Expenses",
    steps: [
      "Keep all original receipts for business-related purchases.",
      "Download the Expense Claim Form from the Company Templates page.",
      "List each expense with date, amount, category and attach a scanned receipt.",
      "Submit the form and receipts to Finance within 30 days of the expense.",
      "Approved claims are reimbursed in the next payroll cycle.",
      "After your client's supervisor has signed off your claim form, log in to the Infotech Claims System to apply for the claim and upload the approved, signed documents.",
      "Claims submitted more than 2 months after the expense date will not be accepted or processed."
    ],
    tip: "Claims submitted without receipts may be delayed or rejected — always attach proof of purchase."
  },
  {
    id: "access-systems",
    title: "How to Access Company Systems",
    steps: [
      "Use the credentials provided by IT in your onboarding email to log in to the company portal.",
      "Set up multi-factor authentication (MFA) on your first login.",
      "Request access to additional systems (e.g. project tools, shared drives) via the IT Equipment Request form.",
      "Contact the IT Service Desk if you are locked out or need a password reset."
    ],
    tip: "Never share your login credentials with anyone, including colleagues or your manager."
  },
  {
    id: "who-to-contact",
    title: "Who to Contact for What",
    steps: [
      "Payroll, leave, contracts, equipment or any other workplace question → sale@dci-consultants.com",
      "Direct line → Ms Ong Bee Hoon, 9176 8147 / 9879 8085",
      "Project-specific questions → your assigned Project Lead or Manager."
    ],
    tip: "Save these contacts to your phone during your first week so help is always within reach."
  },
  {
    id: "infotech-leave-guide",
    title: "Infotech Leave System User Guide",
    steps: [
      "Log in to Infotech HRMS using your company credentials.",
      "On any page, look for the <strong>?</strong> (question mark) Help button near the top of the screen.",
      "Click it to open the Infotech Help Portal (\"Hello. How can we help you?\").",
      "Use the search bar — or the topic dropdown — to search articles, topics or keywords, including leave management, applying for leave, and leave balances.",
      "Browse the \"Highest Rated Articles\" section for commonly needed how-tos, or search directly for the leave topic you need."
    ],
    tip: "Infotech's own Help Portal is kept up to date directly by Infotech, so it's the most current source for exact, step-by-step leave-module instructions. If you still can't find what you need, ask your DCI reporting manager or HR contact.<br><br>📄 <a href=\"assets/docs/infotech-user-guide.pdf\" download>Download the Infotech User Guide (PDF)</a>"
  },
  {
    id: "onboarding-first-two-weeks",
    title: "Your First Two Weeks: Onboarding Checklist",
    steps: [
      "<strong>Before Day 1:</strong> sign and return your employment agreement, read your employment terms (salary, allowances, hours, leave), submit onboarding documents through DCI's secure channel, and confirm your reporting location, time and dress code.",
      "<strong>Day 1 — Reporting:</strong> report to your assigned client location, meet your supervisor and team, complete security registration/pass application, attend workplace orientation and safety briefing, and confirm your successful first day with DCI HR.",
      "<strong>Day 2 — Employment admin:</strong> confirm your contract and written employment terms, verify payroll and emergency contact details, understand your leave/absence-reporting process, and review DCI's Code of Business Conduct and Ethics.",
      "<strong>Day 3 — IT &amp; security:</strong> receive your equipment and activate system accounts, complete MFA and cybersecurity training, and learn the approved way to store, transfer and access client information.",
      "<strong>Day 4 — Job scope:</strong> review your job description and expected deliverables with your supervisor, learn key processes/tools, and know how to escalate job-related problems.",
      "<strong>Day 5 — Week 1 review:</strong> review progress and outstanding issues with your supervisor, confirm access/equipment/training are complete, and send DCI HR a short first-week status update.",
      "<strong>Days 6–8 — Settling in:</strong> take on assigned tasks with appropriate supervision, join team meetings, and keep your work within the agreed job scope, security and safety requirements.",
      "<strong>Days 9–10 — Final review:</strong> get feedback from your supervisor on strengths and areas to develop, confirm deliverables going forward, raise any unresolved issues with DCI HR, and complete your two-week onboarding check-in."
    ],
    tip: "Throughout onboarding: tell both your client supervisor and DCI HR promptly if you can't report for work, apply for leave and submit MCs through the proper channel, follow the Code of Business Conduct and client safety rules, and inform DCI HR before agreeing to any significant change in duties, hours, location or contract terms. The full day-by-day checklist (including DCI HR's own follow-up checklist) is downloadable from the Company Templates page."
  }
];

/* ---------- FAQ (used on Employee User Guides page) ---------- */
const FAQS = [
  {
    q: "What do I do if I forget to submit my timesheet on time?",
    a: "Submit it as soon as possible and notify your project lead directly — late timesheets may delay payment to the next cycle."
  },
  {
    q: "Can I work from a location outside my usual city or country?",
    a: "Check with sale@dci-consultants.com before making remote-work or cross-border arrangements, since this depends on your contract and work-pass conditions."
  },
  {
    q: "How long does an IT equipment request take to process?",
    a: "Standard requests are typically fulfilled within 3–5 business days, subject to equipment availability."
  },
  {
    q: "Who approves my leave application?",
    a: "Your direct manager approves leave requests. HR will confirm the updated balance once approved."
  }
];
