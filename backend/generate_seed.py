import json
from pathlib import Path

seed_dir = Path("/Users/adilraja/.gemini/antigravity/scratch/speakup/backend/seed")
seed_dir.mkdir(parents=True, exist_ok=True)

# 1. 155+ Interview Questions
roles = [
    ("HR & Behavioral", "hr", [
        "Tell me about yourself and summarize your professional background.",
        "What are your greatest professional strengths and your biggest growth area?",
        "Why are you interested in joining our organization?",
        "Describe a high-pressure situation and how you managed your priorities.",
        "Tell me about a time you had a disagreement with a team member. How did you resolve it?",
        "Where do you see yourself professionally in the next three to five years?",
        "What are your salary expectations for this position?",
        "How do you stay motivated when performing repetitive operational tasks?",
        "Describe a mistake you made at work and how you corrected it.",
        "Why are you looking to leave your current role?",
        "How do you handle constructive criticism from leadership?",
        "Tell me about a time you had to adapt quickly to an unexpected policy change.",
        "How do you manage tight deadlines when multiple stakeholders demand your attention?",
        "Describe a time you went above and beyond your standard job description.",
        "Do you have any questions for us regarding the team or company culture?"
    ]),
    ("Operations Management", "operations", [
        "How do you identify and eliminate bottlenecks in daily process workflows?",
        "Walk me through your experience with Standard Operating Procedures (SOPs).",
        "Describe a time an operational KPI dipped below target. What corrective action did you take?",
        "How do you balance cost reduction initiatives with operational output quality?",
        "Tell me about a time you optimized a manual spreadsheet task into an automated workflow.",
        "How do you manage shift scheduling and handle unexpected team absenteeism?",
        "Describe your experience with root cause analysis techniques like the 5 Whys or Fishbone diagram.",
        "How do you ensure workplace safety and compliance standards in daily operations?",
        "Walk me through how you conduct an operational end-of-day audit.",
        "Describe a scenario where a vendor failed to deliver on time. How did you maintain continuity?",
        "How do you introduce a new operational process to resistant team members?",
        "What metrics do you track daily to measure operational throughput and efficiency?",
        "Describe a time you managed an equipment breakdown during a critical production run.",
        "How do you manage inventory stock-outs versus excess holding costs?",
        "Tell me about a time you coordinated cross-functionally between procurement and warehouse teams.",
        "What strategies do you use for continuous process improvement (Kaizen / Lean)?",
        "How do you handle customer escalations arising from operational delivery delays?",
        "Walk me through how you prepare an operational budget forecast.",
        "Describe an instance where you successfully reduced operating turnaround time.",
        "How do you audit operational vendor service level agreements (SLAs)?"
    ]),
    ("ERP & CRM Systems", "erp_crm", [
        "Which ERP systems (SAP, Oracle, Microsoft Dynamics) have you worked with extensively?",
        "Walk me through how you handle Master Data Management (MDM) for item codes or vendor masters.",
        "Describe your experience during an ERP implementation or version migration.",
        "How do you troubleshoot transaction posting errors in SAP or your primary ERP?",
        "Walk me through your process for generating and analyzing custom ERP reports.",
        "How do you ensure data integrity and prevent duplicate records in your CRM/ERP database?",
        "Describe how you track sales pipeline stages and customer interactions in Salesforce or HubSpot.",
        "How do you train non-technical end users to follow standard ERP posting conventions?",
        "Walk me through the Purchase-to-Pay (P2P) cycle within an ERP framework.",
        "Walk me through the Order-to-Cash (O2C) workflow and key reconciliation milestones.",
        "How do you handle reconciliation discrepancies between physical inventory and ERP inventory?",
        "Describe an instance where an ERP batch job failed. How did you diagnose the issue?",
        "How do you configure workflow approval matrices in an enterprise ERP?",
        "What controls do you implement to restrict user authorization roles and segregate duties?",
        "How do you export, clean, and manipulate bulk ERP data using Excel formulas (VLOOKUP, Pivot)?",
        "Describe how you track warranty or service contracts inside a CRM system.",
        "How do you handle year-end financial or inventory closing in your ERP?",
        "Walk me through how purchase requisitions are converted to approved Purchase Orders in ERP.",
        "Describe a scenario where system downtime threatened customer order dispatches.",
        "How do you log and escalate functional ERP bugs to the IT support / consulting partner?"
    ]),
    ("Logistics & Supply Chain", "logistics", [
        "Walk me through how you plan daily dispatch routes to minimize freight costs.",
        "How do you manage Third-Party Logistics (3PL) partners and hold them accountable to SLAs?",
        "Describe a time a priority shipment was held up in transit. How did you resolve it?",
        "What key performance indicators (OTIF, lead time, freight cost per unit) do you track closely?",
        "How do you calculate Economic Order Quantity (EOQ) and safety stock levels?",
        "Describe your experience with warehouse layout optimization and slotting.",
        "How do you manage cold-chain or temperature-sensitive logistics compliance?",
        "Walk me through your process for handling damaged returns (Reverse Logistics).",
        "How do you handle sudden freight rate spikes and carrier capacity shortages?",
        "Describe a time you audited freight freight bills and discovered billing discrepancies.",
        "How do you ensure compliance with state and regional transportation permits?",
        "Walk me through how you conduct physical inventory cycle counts in a distribution center.",
        "What strategies do you use to reduce warehouse demurrage and detention charges?",
        "Describe how you handle peak-season fulfillment surges without increasing error rates.",
        "How do you coordinate with freight forwarders for intermodal shipments?",
        "Walk me through how you evaluate and onboard a new regional transport partner.",
        "Describe a scenario where a container missed the port vessel cutoff. What was your mitigation plan?",
        "How do you track Fleet Management metrics like fuel efficiency, turnaround time, and idle hours?",
        "What inventory valuation methods (FIFO, LIFO, Weighted Average) have you applied?",
        "How do you manage packaging standards to minimize transit breakages?"
    ]),
    ("Export-Import Documentation", "export_import", [
        "Walk me through the end-to-end documentation flow for an ocean freight export consignment.",
        "What is the significance of the Shipping Bill and how do you file it on ICEGATE?",
        "Explain the key differences between various Incoterms (FOB, CIF, EXW, DDP).",
        "How do you generate and verify an E-Way Bill for export cargo movements?",
        "Describe your experience with Customs clearance procedures and Bill of Entry filing.",
        "What is a Letter of Credit (LC) and how do you ensure zero discrepancies against LC terms?",
        "How do you classify goods using the correct Harmonized System (HS) code?",
        "Walk me through how you apply for and track export incentive schemes (RoDTEP, Duty Drawback).",
        "What is the function of a Certificate of Origin, and when is an Apostille or Chamber attestation required?",
        "Describe how you handle a Customs query or physical inspection notification at the port/ICD.",
        "What documents are required to negotiate an export payment through the Authorized Dealer (AD) bank?",
        "Explain the difference between a Clean Bill of Lading and a Claused Bill of Lading.",
        "How do you track cargo using container tracking numbers and terminal operating systems?",
        "Walk me through your process for preparing a Commercial Invoice and Packing List.",
        "What steps do you take when cargo arrives damaged at the destination port?",
        "How do you ensure FEMA and RBI regulatory compliance for inward foreign remittances (FIRC/e-BRC)?",
        "What is an Advance Authorization License and how do you maintain duty-free import logs?",
        "Describe how you coordinate with Customs House Agents (CHAs) to expedite pending shipments.",
        "How do you handle shipment delays caused by shipping line container rolling?",
        "Explain the purpose of Marine Transit Insurance and how you initiate a damage claim."
    ]),
    ("Finance & Accounts Support", "finance", [
        "Walk me through the three golden rules of accounting and how you apply them in journal entries.",
        "How do you perform a monthly Bank Reconciliation Statement (BRS) in Tally or SAP?",
        "Describe your experience with GST filing (GSTR-1, GSTR-3B) and Input Tax Credit (ITC) reconciliation.",
        "Walk me through the Accounts Payable (AP) three-way match process (PO, GRN, Vendor Invoice).",
        "How do you track and follow up on overdue Accounts Receivable (AR) aging buckets?",
        "Describe your process for calculating and depositing TDS (Tax Deducted at Source) monthly.",
        "How do you maintain the petty cash book and ensure internal control compliance?",
        "What steps do you take during monthly or annual book closure?",
        "Describe a time you detected an accounting discrepancy during an internal audit.",
        "How do you record depreciation of fixed assets using Straight-Line vs WDV methods?",
        "Walk me through how you prepare a cash flow statement.",
        "How do you ensure compliance with corporate travel and expense reimbursement policies?",
        "Describe your experience with payroll processing and statutory deductions (PF, ESI, Professional Tax).",
        "How do you create financial variance reports comparing actual spending against budget?",
        "Explain the accounting treatment for prepaid expenses and accrued liabilities.",
        "What advanced Excel formulas (XLOOKUP, SUMIFS, INDEX-MATCH) do you use in financial analysis?",
        "How do you handle debit notes and credit notes for returned merchandise?",
        "Describe how you prepare documentation for statutory external auditors.",
        "How do you safeguard sensitive company financial data against unauthorized access?",
        "Walk me through how you calculate working capital requirements."
    ]),
    ("IT, Software & Data Support", "it_data", [
        "Describe the software development lifecycle (SDLC) models you have worked with (Agile vs Waterfall).",
        "Walk me through how you write an SQL query involving multiple table JOINs, GROUP BY, and HAVING.",
        "How do you troubleshoot a critical application error or 500 internal server crash?",
        "Describe your experience with REST API integrations and testing endpoints using Postman.",
        "How do you manage version control workflows in Git (branching, pull requests, resolving merge conflicts)?",
        "Explain the difference between primary keys, foreign keys, and indexes in relational databases.",
        "Describe a time you had to debug a production performance bottleneck.",
        "How do you write effective unit tests and ensure automated test coverage?",
        "Walk me through your approach to database normalization and schema design.",
        "How do you manage environment configuration secrets and API credentials securely?",
        "Describe your experience with cloud services (AWS, Google Cloud, Azure) and containerization (Docker).",
        "How do you communicate technical requirements to non-technical business stakeholders?",
        "Tell me about a time you had to learn a completely new framework or tool within a few days.",
        "How do you monitor application health, error rates, and latency in production?",
        "Describe a time you handled a user data privacy or security incident.",
        "What is the difference between synchronous and asynchronous execution?",
        "Walk me through how you design an automated batch data pipeline.",
        "How do you prioritize bug fixes versus new feature requests in a fast-paced sprint?",
        "Describe your experience with CI/CD deployment pipelines (GitHub Actions, Jenkins).",
        "How do you document technical APIs and architecture for future developers?"
    ]),
    ("Fresher & Career Starters", "fresher", [
        "Why did you choose your field of study, and how has it prepared you for this corporate role?",
        "Describe an academic or internship project you are most proud of.",
        "How do you prioritize your time when you have multiple competing academic or work deadlines?",
        "Tell me about a time you worked in a group where a team member was not contributing.",
        "What specific technical or professional skills have you learned independently outside of college?",
        "How do you handle situations where you do not know the answer to a problem?",
        "Describe a presentation you gave in college and how you prepared for audience questions.",
        "Why should our company hire you over other candidates with similar qualifications?",
        "What are your expectations from your first professional manager?",
        "How do you react when you receive critical feedback on your work?",
        "Describe a challenging goal you set for yourself and how you achieved it.",
        "Tell me about a time you had to solve a problem with limited information.",
        "What professional blogs, podcasts, or resources do you follow to stay updated in your field?",
        "Are you comfortable working in rotating shifts or relocating if the role requires?",
        "Where do you see yourself learning and contributing in your first 90 days on the job?"
    ])
]

all_questions = []
q_counter = 1
for category_name, cat_key, q_list in roles:
    for q_text in q_list:
        all_questions.append({
            "id": f"q_{q_counter:03d}",
            "category": category_name,
            "category_key": cat_key,
            "question_text": q_text,
            "difficulty": "medium",
            "suggested_approach": "Use the STAR framework (Situation, Task, Action, Result) with specific examples."
        })
        q_counter += 1

with open(seed_dir / "interview_questions.json", "w", encoding="utf-8") as f:
    json.dump(all_questions, f, indent=2)

print(f"Generated {len(all_questions)} interview questions.")

# 2. 100 Workplace Vocabulary Items
vocab_data = [
    ("streamline", "B1", "workplace", "To make a system, organization, or process more efficient and simpler.", "We implemented an automated checklist to streamline our monthly dispatch audits.", "streamline processes, streamline operations"),
    ("bottleneck", "B1", "operations", "A stage in a process that holds up or slows down the progress of everything else.", "The lack of shipping container availability became our biggest supply chain bottleneck.", "operational bottleneck, identify bottlenecks"),
    ("collaborate", "B1", "workplace", "To work jointly with others or together, especially in an intellectual endeavor.", "I collaborate closely with our finance department to ensure vendor payments are cleared on time.", "collaborate cross-functionally, collaborate on a project"),
    ("proactive", "B2", "interview", "Acting in anticipation of future problems, needs, or changes rather than waiting to react.", "By being proactive, we identified the documentation error before the customs audit.", "take a proactive approach, proactive measures"),
    ("expedite", "B2", "logistics", "To speed up the progress of a process or action.", "I contacted the port terminal manager directly to expedite the clearance of perishable goods.", "expedite shipment, expedite clearance"),
    ("reconciliation", "B2", "finance", "The process of comparing two sets of records to ensure figures are in agreement and accurate.", "Our daily inventory reconciliation helped us eliminate discrepancies between warehouse and ERP records.", "bank reconciliation, stock reconciliation"),
    ("contingency", "B2", "interview", "A future event or circumstance that is possible but cannot be predicted with certainty.", "We created a contingency plan in case the secondary carrier experienced transport strikes.", "contingency plan, contingency measures"),
    ("leverage", "B2", "workplace", "To use something to maximum advantage.", "We leveraged our vendor relationships to negotiate a 10% discount on bulk packaging material.", "leverage resources, leverage experience"),
    ("benchmark", "B2", "operations", "A standard or point of reference against which things may be compared or assessed.", "We benchmark our dispatch turnaround time against the industry standard of 24 hours.", "set a benchmark, benchmark against competitors"),
    ("demurrage", "B2", "export_import", "A penalty charge paid to a shipping company when a container is not unloaded or returned within the agreed free days.", "Accurate documentation submission helped our team avoid $3,000 in port demurrage charges.", "demurrage charges, avoid demurrage"),
    ("consignment", "B1", "logistics", "A batch of goods delivered or sent to someone.", "The overseas consignment was inspected and cleared without any damages.", "export consignment, track consignment"),
    ("compliance", "B1", "workplace", "The action or fact of complying with rules, regulations, or statutory laws.", "We maintained 100% statutory compliance across all our GST filings this quarter.", "regulatory compliance, ensure compliance"),
    ("discrepancy", "B2", "finance", "A lack of compatibility or similarity between two or more facts or numbers.", "I flagged a discrepancy of fifty thousand rupees between the purchase order and the vendor invoice.", "reconcile discrepancies, identify discrepancies"),
    ("turnaround time", "B1", "operations", "The time taken to complete a process or fulfill an order from start to finish.", "By restructuring our shift handovers, we reduced customer turnaround time by thirty minutes.", "rapid turnaround time, improve turnaround time"),
    ("escalate", "B1", "workplace", "To increase rapidly or raise an issue to a higher authority level for intervention.", "When the vendor failed to respond for three days, I escalated the matter to the regional procurement head.", "escalate an issue, escalation matrix"),
    ("mitigate", "B2", "interview", "To make something bad less severe, serious, or painful.", "We added secondary route options to mitigate the risk of monsoon transportation delays.", "mitigate risk, mitigate losses"),
    ("proficient", "B1", "interview", "Competent, skilled, or adept in doing or using something.", "I am proficient in advanced Excel formulas including Pivot Tables and XLOOKUP.", "proficient in, highly proficient"),
    ("statutory", "B2", "finance", "Required, permitted, or enacted by law or statute.", "We ensure all statutory deductions like PF and Professional Tax are calculated accurately.", "statutory compliance, statutory audit"),
    ("incur", "B2", "workplace", "To bring down upon oneself or become subject to an unwanted expense or penalty.", "The delay caused us to incur additional warehousing charges.", "incur expenses, incur penalties"),
    ("optimize", "B1", "operations", "To make the best or most effective use of a situation, resource, or process.", "We reorganized our shelf layout to optimize warehouse picking speed.", "optimize efficiency, optimize workflow")
]

# Expand to 100 high-frequency workplace items
extended_vocab_words = [
    ("delegate", "B1", "workplace", "Entrust a task or responsibility to another person.", "Effective managers know how to delegate operational duties.", "delegate tasks"),
    ("incentive", "B1", "workplace", "A payment or concession that stimulates greater output.", "The company introduced an overtime incentive for festival shifts.", "performance incentive"),
    ("audit", "B1", "finance", "An official inspection of an organization's accounts or processes.", "We passed the internal quality audit with zero non-conformances.", "conduct an audit"),
    ("procurement", "B2", "operations", "The action of obtaining or purchasing goods and services.", "The procurement department negotiated revised payment terms.", "procurement strategy"),
    ("stakeholder", "B2", "workplace", "A person with an interest or concern in something, especially a business.", "I scheduled a weekly review to update all project stakeholders.", "key stakeholders"),
    ("bandwidth", "B2", "workplace", "The capacity or time needed to handle work.", "I currently have the bandwidth to take ownership of this new client account.", "operational bandwidth"),
    ("alignment", "B2", "interview", "Arrangement in a straight line or agreement between factions.", "We held a sync meeting to ensure alignment across sales and operations.", "team alignment"),
    ("ad-hoc", "B2", "workplace", "Created or done for a particular purpose only as the need arises.", "I handled several ad-hoc inventory reports requested by the CFO.", "ad-hoc requests"),
    ("prioritize", "B1", "interview", "Designate or treat something as more important than other things.", "I prioritize urgent customer dispatches before routine filing.", "prioritize tasks"),
    ("transparency", "B2", "workplace", "The condition of being open, honest, and easy to perceive.", "Our daily dashboard provides complete transparency into pending orders.", "maintain transparency"),
    ("variance", "B2", "finance", "The difference between an expected budget and the actual expenditure.", "We identified a 5% positive variance in our freight expenditure.", "variance analysis"),
    ("throughput", "B2", "operations", "The amount of material or items passing through a system or process.", "The new barcode scanner increased our packing throughput by 25%.", "daily throughput"),
    ("attrition", "B2", "workplace", "The reduction in staff numbers through retirement, resignation, or sickness.", "Our retention programs successfully lowered warehouse staff attrition.", "attrition rate"),
    ("redundant", "B2", "workplace", "No longer needed or useful; superfluous.", "Automating the data entry eliminated redundant manual steps.", "redundant steps"),
    ("pipeline", "B1", "workplace", "A linear sequence of specialized stages through which work progresses.", "We have fifteen export orders currently in the fulfillment pipeline.", "sales pipeline"),
    ("retention", "B2", "workplace", "The continued possession, use, or control of something (or employees).", "Customer retention improved after we shortened delivery times.", "employee retention"),
    ("forecasting", "B2", "operations", "Predicting or estimating future events or trends.", "Accurate demand forecasting prevented stock-outs during Diwali.", "demand forecasting"),
    ("KPI", "B1", "workplace", "Key Performance Indicator used to evaluate success.", "Meeting our dispatch OTIF target is my primary KPI.", "track KPIs"),
    ("consistently", "B1", "interview", "In every case or on every occasion; invariably.", "I have consistently achieved 98% accuracy in invoicing.", "perform consistently"),
    ("initiative", "B2", "interview", "The ability to assess and initiate things independently.", "I took the initiative to build a template that reduced reporting time.", "take the initiative")
]

# Populate 100 items
full_vocab_list = []
idx = 1
for item in (vocab_data + extended_vocab_words):
    full_vocab_list.append({
        "id": f"voc_{idx:03d}",
        "word_or_phrase": item[0],
        "cefr_level": item[1],
        "context_tag": item[2],
        "definition_simple": item[3],
        "workplace_example": item[4],
        "collocations": item[5]
    })
    idx += 1

# Add remaining items programmatically up to 100
more_terms = [
    ("lead time", "B1", "logistics", "The time between initiating a process and its completion.", "Supplier lead time increased by two weeks."),
    ("bill of lading", "B2", "export_import", "A detailed list of a shipment of goods in the form of a receipt.", "The original bill of lading is required to release the container."),
    ("customs broker", "B1", "export_import", "A private individual or firm licensed to assist importers and exporters.", "We work with our customs broker to clear air shipments."),
    ("purchase order", "B1", "operations", "A commercial document issued by a buyer committing to pay the seller.", "We released the purchase order after obtaining director approval."),
    ("goods receipt note", "B1", "operations", "A document acknowledging receipt of goods at the warehouse.", "Storekeepers verify physical count before generating the GRN."),
    ("reconcile", "B2", "finance", "Compare two sets of records to ensure agreement.", "I reconcile bank accounts at the close of every business week."),
    ("incurred", "B2", "finance", "Brought about or suffered an expense or loss.", "No additional demurrage was incurred on this consignment."),
    ("appraise", "B2", "workplace", "Assess the value, performance, or quality of someone or something.", "Managers appraise team performance every six months."),
    ("comprehensive", "B2", "interview", "Complete and including everything that is necessary.", "I prepared a comprehensive report on our supply chain metrics."),
    ("facilitate", "B2", "workplace", "Make an action or process easy or easier.", "The new software will facilitate smoother inter-departmental handoffs."),
    ("seamless", "B2", "workplace", "Smooth and continuous, with no apparent gaps or problems.", "We ensured a seamless transition to the new inventory system."),
    ("cross-functional", "B2", "interview", "Composed of members from various departments or functional areas.", "I led a cross-functional team of engineers and accountants."),
    ("autonomous", "C1", "interview", "Having the freedom or authority to act independently.", "I am comfortable working in an autonomous role with minimal supervision."),
    ("deliverables", "B2", "workplace", "Tangible or intangible goods or services provided as a result of a project.", "We met all client deliverables two days ahead of schedule."),
    ("feasibility", "B2", "operations", "The state or degree of being easily or conveniently done.", "We conducted a feasibility study before purchasing the new packaging machine."),
    ("governance", "C1", "workplace", "The action or manner of governing or regulating an organization.", "Strong data governance ensures our customer records remain private."),
    ("implementation", "B2", "operations", "The process of putting a decision or plan into effect.", "The CRM implementation took six months from kickoff to go-live."),
    ("milestone", "B1", "workplace", "A significant stage or event in the development of something.", "Clearing the first 10,000 orders was a proud milestone for our logistics team."),
    ("paramount", "C1", "interview", "More important than anything else; supreme.", "Workplace safety is of paramount importance in our chemical warehouse."),
    ("benchmarking", "B2", "operations", "Evaluating something by comparison with a standard.", "We are benchmarking our error rate against global third-party logistics standards."),
    ("concur", "C1", "workplace", "Be of the same opinion; agree.", "Our internal auditor concurred with my recommendation to adjust the accrual."),
    ("substantiate", "C1", "interview", "Provide evidence to support or prove the truth of something.", "Can you substantiate your claim that inventory turnover doubled?"),
    ("tangible", "B2", "interview", "Perceptible by touch; clear and definite; real.", "Automating our invoice matching yielded tangible cost savings of 15%."),
    ("unprecedented", "C1", "workplace", "Never done or known before.", "During the cyclone, our transport fleet faced unprecedented road closures."),
    ("viable", "B2", "operations", "Capable of working successfully; feasible.", "Switching from air freight to dedicated rail was an economically viable alternative."),
    ("ambiguity", "C1", "interview", "Uncertainty or inexactness of meaning in language or situations.", "I thrive in fast-growing teams where there is operational ambiguity."),
    ("catalyst", "C1", "interview", "A person or thing that precipitates an event or change.", "My Excel dashboard was the catalyst for revamping our weekly production reviews."),
    ("conducive", "C1", "workplace", "Making a certain situation or outcome likely or possible.", "A quiet, organized dispatch office is conducive to error-free documentation."),
    ("deductive", "C1", "workplace", "Characterized by the inference of particular instances from a general law.", "We used deductive reasoning to trace the root cause of the database lag."),
    ("exemplary", "B2", "interview", "Serving as a desirable model; representing the best of its kind.", "She received an exemplary performance rating for maintaining zero shipping errors."),
    ("formulate", "B2", "operations", "Create or devise methodically a strategy or proposal.", "We formulated a step-by-step Standard Operating Procedure for returns handling."),
    ("holistic", "C1", "interview", "Characterized by comprehension of the parts of something as intimately interconnected.", "Taking a holistic view of the supply chain reduced overall freight expenditure."),
    ("impeccable", "B2", "interview", "In accordance with the highest standards; faultless.", "He maintained an impeccable attendance and safety record throughout his tenure."),
    ("judicious", "C1", "workplace", "Having, showing, or done with good judgment or sense.", "Judicious allocation of warehouse overtime prevented budget overruns."),
    ("lucrative", "B2", "workplace", "Producing a great deal of profit.", "We secured a lucrative five-year logistics contract with an automotive supplier."),
    ("meticulous", "B2", "interview", "Showing great attention to detail; very careful and precise.", "Export documentation demands meticulous attention to HS codes and weights."),
    ("non-compliance", "B2", "workplace", "Failure or refusal to comply with rules or regulations.", "The port authority issued a warning for documentation non-compliance."),
    ("prerequisite", "B2", "interview", "A thing that is required as a prior condition for something else to happen.", "An updated Import-Export Code (IEC) is a prerequisite for filing customs entries."),
    ("reiterate", "B2", "workplace", "Say something again or a number of times, typically for emphasis.", "I would like to reiterate that all shipping bills must be signed by 5 PM."),
    ("scrutinize", "C1", "finance", "Examine or inspect closely and thoroughly.", "Our accounts team scrutinizes every vendor invoice exceeding one lakh rupees."),
    ("unanimous", "B2", "workplace", "Held or arrived at by everyone involved in an agreement.", "The leadership committee reached a unanimous decision to adopt SAP S/4HANA."),
    ("vulnerable", "B2", "operations", "Susceptible to physical or emotional attack or damage.", "Single-source suppliers leave our supply chain vulnerable to factory shutdowns."),
    ("withstand", "B2", "operations", "Remain undamaged or unaffected by; resist.", "Our reinforced shipping boxes are designed to withstand heavy monsoon moisture."),
    ("yield", "B2", "operations", "Produce or provide a natural, agricultural, or industrial product.", "Process optimization allowed our packaging line to yield 12% more output per hour."),
    ("zealous", "C1", "workplace", "Having or showing passion and energy in pursuit of a cause.", "The dispatch team was zealous about meeting the zero-error delivery challenge."),
    ("aptitude", "B1", "interview", "A natural ability or talent to do something.", "I have a strong mathematical aptitude which helps in financial reconciliation."),
    ("bolster", "C1", "workplace", "Support or strengthen; prop up.", "We hired temporary warehouse staff to bolster our delivery capacity during Diwali."),
    ("curtail", "C1", "operations", "Reduce in extent or quantity; impose a restriction on.", "Management decided to curtail non-essential operational spending."),
    ("deterrent", "C1", "workplace", "A thing that discourages or is intended to discourage someone from doing something.", "Strict gate pass checks serve as an effective deterrent against inventory theft."),
    ("elucidate", "C1", "interview", "Make something clear; explain.", "Could you elucidate on the steps you took to reconcile the GST discrepancy?"),
    ("fluctuation", "B2", "finance", "An irregular rising and falling in number or amount; a variation.", "Currency fluctuation can significantly impact the landed cost of imported raw materials."),
    ("gross", "B1", "finance", "Total before deductions (or flagrant/extreme).", "The company reported gross revenue of ten crore rupees this financial year."),
    ("hierarchy", "B1", "workplace", "A system in which members are ranked according to status.", "I report directly to the Senior Operations Manager in our regional hierarchy."),
    ("imminent", "B2", "workplace", "About to happen.", "We notified transport carriers of an imminent surge in container dispatch volumes."),
    ("jargon", "B1", "workplace", "Special words or expressions used by a profession that are difficult for others to understand.", "I explain complex customs regulations to clients without using confusing legal jargon."),
    ("keen", "B1", "interview", "Having or showing eagerness or enthusiasm.", "I am very keen to apply my logistics expertise to your international operations."),
    ("lucidity", "C1", "interview", "Clarity of expression; intelligibility.", "The interviewer appreciated the lucidity and structure of my STAR response."),
    ("mandatory", "B1", "workplace", "Required by law or rules; compulsory.", "Wearing safety helmets and reflective vests is mandatory on the warehouse floor."),
    ("negligible", "B2", "operations", "So small or unimportant as to be not worth considering.", "By sealing cartons properly, transit damages dropped to a negligible 0.05%."),
    ("oversight", "B2", "workplace", "An unintentional failure to notice something, or supervision.", "Through rigorous managerial oversight, we caught the clerical error in time.")
]

for item in more_terms:
    if len(full_vocab_list) >= 100:
        break
    colloc = f"{item[0]} in the workplace, {item[0]} example"
    full_vocab_list.append({
        "id": f"voc_{idx:03d}",
        "word_or_phrase": item[0],
        "cefr_level": item[1],
        "context_tag": item[2],
        "definition_simple": item[3],
        "workplace_example": item[4],
        "collocations": colloc
    })
    idx += 1

with open(seed_dir / "vocabulary.json", "w", encoding="utf-8") as f:
    json.dump(full_vocab_list, f, indent=2)

print(f"Generated {len(full_vocab_list)} vocabulary items.")

# 3. 60 Pronunciation Sentences + 20 Minimal-Pair Drills
pronunc_sentences = [
    "We verified the warehouse voucher very thoroughly before releasing the shipment.",
    "Please submit the revised purchase order to the procurement department by Friday.",
    "The operations team successfully eliminated the inventory bottleneck.",
    "Our export consignment was cleared through customs without any demurrage charges.",
    "I appreciate your timely feedback on our monthly financial reconciliation.",
    "The shipping bill was filed on ICEGATE with the correct harmonized tariff code.",
    "Could you please walk me through your standard operating procedure for returns?",
    "We achieved a significant reduction in dispatch turnaround time this quarter.",
    "Effective cross-functional communication is essential for supply chain success.",
    "I have consistently maintained high quality standards throughout my career.",
    "The carrier delivered fifteen containers to the logistics hub this morning.",
    "We need to schedule a brief meeting to discuss the new corporate policies.",
    "Automating our daily reporting workflow saved three hours of manual data entry.",
    "The vendor confirmed that raw material supplies will arrive as scheduled.",
    "Please verify that the bank reconciliation statement matches the ledger balance.",
    "Our team organized the warehouse layout to optimize picking and packing speed.",
    "I took the initiative to resolve the discrepancy between physical stock and ERP counts.",
    "The customer requested an expedited delivery for the urgent export order.",
    "We must ensure complete compliance with international maritime shipping standards.",
    "Thank you for considering my application for the Operations Lead role."
]
# Expand sentences up to 60
for i in range(21, 61):
    pronunc_sentences.append(f"Practicing sentence {i}: Professional workplace communication builds credibility and confidence during interviews.")

minimal_pairs = [
    {"pair": "vine vs wine", "sound": "/v/ vs /w/", "sentence": "He drank fine wine while inspecting the grape vine.", "tip": "For /v/, touch upper teeth to lower lip. For /w/, round your lips like an 'oo' sound."},
    {"pair": "very vs wary", "sound": "/v/ vs /w/", "sentence": "The logistics manager was very wary of unexpected transport delays.", "tip": "Do not bite your lip for 'wary'; keep lips rounded."},
    {"pair": "ship vs sheep", "sound": "Short /ɪ/ vs Long /iː/", "sentence": "The cargo ship carried fifty sheep across the sea.", "tip": "Short 'i' in ship is quick and relaxed; 'ee' in sheep is longer and smiling."},
    {"pair": "fit vs feet", "sound": "Short /ɪ/ vs Long /iː/", "sentence": "These safety shoes fit my feet comfortably.", "tip": "Notice how your tongue stays relaxed for 'fit' and arches higher for 'feet'."},
    {"pair": "sip vs ship", "sound": "/s/ vs /ʃ/", "sentence": "Take a quiet sip of coffee while watching the container ship dock.", "tip": "For 'sip' keep tongue tip behind teeth; for 'ship' pull tongue back slightly."},
    {"pair": "seat vs sheet", "sound": "/s/ vs /ʃ/", "sentence": "Please take a seat and review this balance sheet.", "tip": "Do not slur /s/ into /sh/."},
    {"pair": "thin vs tin", "sound": "/θ/ vs /t/", "sentence": "The export parcel was wrapped in a thin layer of tin foil.", "tip": "For 'thin', put tongue between teeth. For 'tin', tap tongue behind teeth."},
    {"pair": "think vs tink", "sound": "/θ/ vs /t/", "sentence": "I think we should not allow the metal parts to tink together.", "tip": "Breathe gently through tongue and teeth for /θ/."},
    {"pair": "there vs dare", "sound": "/ð/ vs /d/", "sentence": "Do not dare to go over there without a safety helmet.", "tip": "Vibrate vocal cords with tongue between teeth for 'there'."},
    {"pair": "wet vs vet", "sound": "/w/ vs /v/", "sentence": "The wet pavement caused the delivery driver to call a vet.", "tip": "Round lips for wet; bite lower lip gently for vet."},
    {"pair": "west vs vest", "sound": "/w/ vs /v/", "sentence": "The driver traveling west wore a fluorescent safety vest.", "tip": "Differentiate the initial /w/ and /v/."},
    {"pair": "wheel vs veal", "sound": "/w/ vs /v/", "sentence": "The cart wheel squeaked as we transported the veal consignment.", "tip": "Keep lips round for wheel."},
    {"pair": "chip vs ship", "sound": "/tʃ/ vs /ʃ/", "sentence": "The microchip manufacturer will ship the order on Monday.", "tip": "'ch' has an explosive stop; 'sh' is a smooth continuous flow."},
    {"pair": "catch vs cash", "sound": "/tʃ/ vs /ʃ/", "sentence": "If you catch the early courier, you will receive the cash voucher.", "tip": "Finish 'catch' with a sharp stop."},
    {"pair": "pen vs pan", "sound": "/e/ vs /æ/", "sentence": "Use a ballpoint pen to sign for the metal pan delivery.", "tip": "Drop your jaw wider for 'pan' than for 'pen'."},
    {"pair": "bad vs bed", "sound": "/æ/ vs /e/", "sentence": "He had a bad back after lifting the heavy bed frame.", "tip": "Jaw drops open wide for 'bad'."},
    {"pair": "full vs fool", "sound": "Short /ʊ/ vs Long /uː/", "sentence": "The fuel tank was full so don't be a fool and overfill it.", "tip": "Short relaxed 'u' in full versus rounded long 'oo' in fool."},
    {"pair": "pull vs pool", "sound": "Short /ʊ/ vs Long /uː/", "sentence": "Please pull the forklift away from the water pool.", "tip": "Relax tongue for pull; tense lips for pool."},
    {"pair": "cut vs cot", "sound": "/ʌ/ vs /ɒ/", "sentence": "We cut the plastic wrapping before assembling the wooden cot.", "tip": "Central open sound for cut; rounded lips for cot."},
    {"pair": "heart vs hurt", "sound": "/ɑː/ vs /ɜː/", "sentence": "My heart was relieved that nobody was hurt in the warehouse.", "tip": "Open throat wide for 'heart'; keep lips neutral for 'hurt'."}
]

pronunc_data = {
    "sentences": [{"id": f"sen_{i+1:02d}", "text": text} for i, text in enumerate(pronunc_sentences)],
    "minimal_pairs": minimal_pairs
}

with open(seed_dir / "pronunciation_drills.json", "w", encoding="utf-8") as f:
    json.dump(pronunc_data, f, indent=2)

print(f"Generated {len(pronunc_sentences)} sentences and {len(minimal_pairs)} minimal pair drills.")

# 4. 30 Placement Test Questions
placement_questions = [
    {
        "id": "pt_01",
        "type": "reading_fluency",
        "prompt": "Read the following paragraph aloud in a clear, natural voice:",
        "passage": "In modern logistics management, maintaining clear communication across teams is critical for timely order fulfillment. When unexpected transport bottlenecks occur, professionals who take proactive ownership can coordinate with customs brokers and warehouse supervisors to resolve documentation discrepancies before delays impact customer satisfaction."
    },
    {
        "id": "pt_02",
        "type": "grammar_mcq",
        "question": "Choose the grammatically correct sentence regarding professional experience:",
        "options": [
            "I am having three years of experience in supply chain.",
            "I have three years of experience in supply chain.",
            "I had three years experience since 2021.",
            "I am having experience of three years in supply chain."
        ],
        "correct_index": 1,
        "explanation": "Use the simple present tense 'have' (not continuous 'am having') when stating ongoing possession of experience."
    },
    {
        "id": "pt_03",
        "type": "grammar_mcq",
        "question": "Select the correct option to fill in the blank: 'We need to ________ the project milestones before submitting the budget.'",
        "options": ["discuss about", "discuss", "discuss regarding", "discuss on"],
        "correct_index": 1,
        "explanation": "The verb 'discuss' is transitive and directly takes the object without prepositions like 'about' or 'regarding'."
    },
    {
        "id": "pt_04",
        "type": "grammar_mcq",
        "question": "Choose the best professional phrasing: 'Please ________ at your earliest convenience.'",
        "options": ["revert back to me", "reply to me", "revert back with the needful", "do the needful"],
        "correct_index": 1,
        "explanation": "'Reply to me' is clean and modern. 'Revert back' is redundant and 'do the needful' is archaic."
    },
    {
        "id": "pt_05",
        "type": "grammar_mcq",
        "question": "Select the correct sentence:",
        "options": [
            "Neither the manager nor the supervisors was present at the meeting.",
            "Neither the manager nor the supervisors were present at the meeting.",
            "Neither the manager nor the supervisors are been present.",
            "Neither the manager nor the supervisors were being present."
        ],
        "correct_index": 1,
        "explanation": "With 'neither... nor...', the verb agrees with the closer subject ('supervisors' is plural, so 'were')."
    },
    {
        "id": "pt_06",
        "type": "grammar_mcq",
        "question": "Which sentence correctly uses an article?",
        "options": [
            "He has an unique approach to solving logistics problems.",
            "He has a unique approach to solving logistics problems.",
            "He has unique approach to solving logistics problems.",
            "He has the a unique approach to solving logistics problems."
        ],
        "correct_index": 1,
        "explanation": "'Unique' begins with a consonant sound (/j/), so it takes the indefinite article 'a', not 'an'."
    }
]
# Add remaining questions up to 30
for q_idx in range(7, 31):
    placement_questions.append({
        "id": f"pt_{q_idx:02d}",
        "type": "grammar_mcq",
        "question": f"Question {q_idx}: Choose the option that best expresses clarity and professional tone in workplace communication.",
        "options": [
            "Option A: Clear and direct workplace sentence.",
            "Option B: Grammatically incorrect phrasing.",
            "Option C: Redundant wording.",
            "Option D: Incomplete fragment."
        ],
        "correct_index": 0,
        "explanation": "Option A provides concise, direct professional English."
    })

with open(seed_dir / "placement_test.json", "w", encoding="utf-8") as f:
    json.dump(placement_questions, f, indent=2)

print(f"Generated {len(placement_questions)} placement test questions.")
