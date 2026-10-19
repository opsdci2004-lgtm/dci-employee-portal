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
    description: "Standard weekly timesheet for recording hours worked, overtime and leave taken.",
    category: "Finance & Payroll",
    fileType: "XLSX",
    icon: "🗒️",
    file: "assets/docs/timesheet-template.txt"
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
    title: "Expense Claim Form",
    description: "Submit reimbursable business expenses with receipts attached for Finance approval.",
    category: "Finance & Payroll",
    fileType: "XLSX",
    icon: "💳",
    file: "assets/docs/expense-claim-form.txt"
  },
  {
    id: "onboarding-checklist",
    title: "Onboarding Checklist",
    description: "A step-by-step checklist for new contract employees during their first two weeks.",
    category: "HR",
    fileType: "PDF",
    icon: "✅",
    file: "assets/docs/onboarding-checklist.txt"
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
    updated: "2026-10-01",
    summary: "The standard of conduct DCI expects everywhere we work — our offices, remote work and client sites.",
    body: [
      "We keep this Code in plain, everyday language on purpose — a policy only works if people can actually understand it, not just sign it.",
      "It applies to everyone acting for DCI Consultants: employees, contract and assigned staff, recruiters, finance staff, and professionals placed at a client site. Contractors, agents and business partners representing DCI are expected to meet the same standard.",
      "<strong>Two organisations, one standard.</strong> DCI remains your employer of record and handles pay, CPF, leave and contractual matters. A client may direct your day-to-day work and set site-specific rules, but cannot change your DCI salary, contract or work-pass terms on their own. If a client instruction and DCI's standards ever conflict, raise it with DCI before proceeding.",
      "<strong>Our five values:</strong> Integrity (tell the truth, keep accurate records), Respect (treat colleagues, candidates and clients with dignity), Care (put safety and well-being first), Security (protect client systems, data and property) and Service (deliver dependable work and honour commitments).",
      "<strong>What it covers:</strong> fair treatment and workplace safety; professional conduct at client sites; confidentiality, data protection and safe use of AI/online tools; zero tolerance for bribery, kickbacks and falsified records (timesheets, invoices, CVs); responsible public conduct and social media use; and how to speak up if something looks wrong.",
      "A quick test for any grey area: Is it lawful? Is it safe? Would DCI and the client both agree it's authorised? Are the records accurate? Would you be comfortable explaining the decision to your manager?",
      "Suspected breaches — of this Code, a policy, or the law — can be reported through DCI's confidential reporting channel. Reports may be made without giving your name where possible, are handled discreetly, and anyone reporting in good faith is protected from retaliation.",
      "[PLACEHOLDER] Confirm the named reporting contact, escalation channel and effective/next-review dates before this Code is issued to staff.",
      "<a href=\"assets/docs/code-of-business-conduct-and-ethics.txt\" download>📄 Download the full Code of Business Conduct &amp; Ethics</a>"
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
      "[PLACEHOLDER] Confirm entitlement days per contract type (short-term vs long-term contractors)."
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
      "Payments are processed on a [PLACEHOLDER: weekly / bi-weekly / monthly] cycle, typically 5 business days after approval.",
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
      "[PLACEHOLDER] Add local office emergency evacuation procedure and assembly point."
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
      "Once approved, HR will update your leave balance within 2 business days."
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
      "Approved claims are reimbursed in the next payroll cycle."
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
      "Payroll or payment issues → Finance Team, finance@[PLACEHOLDER-company-domain].com",
      "Leave, contracts or workplace concerns → HR Team, hr@[PLACEHOLDER-company-domain].com",
      "Laptop, access or software issues → IT Service Desk, itsupport@[PLACEHOLDER-company-domain].com",
      "Project-specific questions → your assigned Project Lead or Manager."
    ],
    tip: "Save these contacts to your phone during your first week so help is always within reach."
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
    a: "[PLACEHOLDER] Confirm remote-work and cross-border work policy with HR before making arrangements."
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
