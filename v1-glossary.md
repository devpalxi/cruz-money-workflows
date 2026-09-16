# Cruz Money Jackpot App — V1 Glossary

A reference for the whole team. Terms are grouped by category. If you are new to the project, read **Category 2 (Acronyms)** and **Category 1 (Roles)** first, then **Category 4 (Compliance)** to understand why the product exists.

---

## Category 1 — Roles

| Role | Who they are | What they do |
|---|---|---|
| **Collector** | Venue floor staff | Captures winner details, runs identity verification, enters bank account details, submits the payout |
| **Approver** | Venue supervisor | Reviews compliance results and risk rating, makes the approval decision, handles escalations and investigations |
| **Authoriser** | Senior staff or finance | Final sign-off to release the payment to the banking system |
| **Venue Admin** | Venue IT or management | Manages EGM machine registry, venue-level configuration settings |
| **Patron / Winner** | Customer at the venue | The person receiving the payout. Does not use the system directly — the Collector acts on their behalf |

---

## Category 2 — Acronyms

| Acronym | Full Name | Plain English |
|---|---|---|
| **IDV** | Identity Verification | The process of confirming a winner's identity electronically against government records |
| **E-IDV** | Electronic IDV | Automated IDV via an API — as opposed to a Collector physically viewing a document |
| **EFT** | Electronic Funds Transfer | Sending money electronically to a bank account |
| **CoP** | Confirmation of Payee | A check that confirms the bank account name matches what the winner provided |
| **SMR** | Suspicious Matter Report | A report filed with AUSTRAC when a transaction is potentially suspicious |
| **PEP** | Politically Exposed Person | A person in a prominent public role (politician, judge, etc.) who carries elevated financial crime risk |
| **AML** | Anti-Money Laundering | Laws and processes designed to prevent financial crime |
| **EGM** | Electronic Gaming Machine | A poker machine or slot machine. Jackpot payouts originate from EGM wins |
| **BSB** | Bank State Branch | The 6-digit code that identifies an Australian bank branch (e.g. 062-000) |
| **NPP** | New Payments Platform | Australia's real-time payment infrastructure — the rails that PayTo runs on |
| **DVS** | Document Verification Service | The Australian government database that electronically verifies identity documents |
| **IRN** | Individual Reference Number | The digit printed next to a person's name on a Medicare card. Required for DVS verification of Medicare cards |
| **EDDD** | Enhanced Due Diligence and Documentation | The investigation category used when an Approver needs to conduct deeper review of a patron |
| **OFAC** | Office of Foreign Assets Control | US Treasury sanctions list. FrankieOne checks patrons against this as part of screening |
| **CMS** | Content Management System | Strapi — where venue and group configuration is stored and managed |

---

## Category 3 — External Systems and Organisations

| System | What it is | Our integration point |
|---|---|---|
| **FrankieOne** | Identity verification and compliance screening provider. Checks ID documents against DVS, screens against PEP lists, sanctions lists, and adverse media sources | Called by the **Tenancy Service** (not directly by the Jackpot API) |
| **Zepto** | Australian payment processor. Manages PayTo agreements, processes EFT payments via the NPP, and runs Confirmation of Payee checks | Called by the **Payment Service / Payment Pillar API** (not directly by the Jackpot API) |
| **Payment Pillar API / Payment Service** | Internal microservice that wraps all Zepto interactions. The Jackpot API calls this service; it handles the Zepto API details | Internal |
| **Tenancy Service** | Internal microservice that wraps all FrankieOne interactions. The Jackpot API calls it via the Tenancy Client SDK | Internal |
| **DVS** | Document Verification Service — Australian government database for document verification | Called by FrankieOne on our behalf |
| **AUSTRAC** | Australian Transaction Reports and Analysis Centre — the AML regulator. SMRs are filed manually with AUSTRAC via their portal in V1 | Manual (swivel-chair) in V1 |
| **Strapi** | Headless CMS used as the backend configuration store. Holds per-venue and per-group settings including Skip IDV thresholds, daily payment limits, PayTo agreement references, and minimum wait times | Admin-managed |

---

## Category 4 — Compliance Terms

| Term | Definition | Notes |
|---|---|---|
| **AML** | Anti-Money Laundering obligations require venues to verify the identity of large jackpot winners and screen them for financial crime risk | Cruz Money exists primarily to meet these obligations |
| **PEP Screening** | Checking whether the winner appears on a Politically Exposed Persons list | Performed by FrankieOne. A match triggers a High risk rating |
| **Sanctions Screening** | Checking whether the winner appears on a sanctions list (OFAC, UN, Australian, others) | Performed by FrankieOne. A match triggers a High risk rating |
| **Adverse Media Screening** | Checking whether the winner appears in news sources associated with financial crime | Performed by FrankieOne. A possible match is shown to the Approver |
| **Risk Rating** | A system-calculated rating of Low, Medium, or High assigned to each payout | Based on the IDV path taken and screening results. See Category 5 for the rules |
| **Risk Override** | When an Approver manually overrides a High risk rating to approve the payout despite the flag | Every override is recorded with a written justification. Forms part of the audit trail |
| **Consent** | Before FrankieOne runs a DVS check, the Collector must confirm the patron has consented to three things: general use, document checking, and credit header access | Recorded in the system as three flags: `consent.general`, `consent.docs`, `consent.creditheader` |
| **Two-Form-of-ID** | When primary E-IDV fails and a secondary ID is captured manually, the patron must provide two documents (e.g. passport + Medicare) before the payout can proceed | Enforced by the system |
| **SMR Swivel-Chair Screen** | A screen in the Approver workflow that pre-populates all patron, payout, and venue data in a format mirroring the AUSTRAC portal, so the Approver can manually copy it across and file the SMR | V1 only — direct AUSTRAC API integration is deferred to V2 |
| **AUSTRAC Reference Number** | The ID AUSTRAC returns after an SMR is submitted via their portal. Logged back into the system so the report can be traced to the jackpot record | Entered manually by the Approver |
| **Investigation Notes** | Free-text notes the Approver records against a payout. Each note must have at least one tag: IDV, Screening, or EDDD | Visible to the Approver only. Attached to the payout record as a permanent audit trail |

---

## Category 5 — IDV Terms

| Term | Definition | Notes |
|---|---|---|
| **Primary E-IDV** | The automated electronic identity check run against FrankieOne and the DVS. The first thing attempted for every payout | If this passes, no further ID is required (IDV1 path) |
| **IDV Path** | One of three defined verification scenarios that determine the risk rating | See table below |
| **IDV1** | Primary E-IDV passes | Risk rating: Low |
| **IDV2** | Primary E-IDV fails → second primary document submitted → passes | Risk rating: Medium |
| **IDV3** | Primary E-IDV fails → second primary document fails → secondary manual ID captured | Risk rating: High |
| **Secondary Manual ID Capture** | When primary E-IDV fails, the Collector physically views a second document and records the details. No automated DVS check is run against this second document | The Collector must tick the Manual Verification Checkbox to confirm they have seen the physical document |
| **Manual Verification Checkbox** | The "I have physically viewed and verified this document" confirmation a Collector must check when recording a secondary ID | Acts as a digital attestation in lieu of a signature |
| **Skip IDV** | A venue-level config flag that allows the IDV step to be bypassed for payouts below a dollar threshold | Must be explicitly enabled per venue in Strapi. When used, the Collector enters a justification |
| **DVS Check** | The Phase 3 call in the FrankieOne sequence. Sends the collected document details to FrankieOne, which validates them against the Australian government DVS | Called via `/verify/profile/simple` on the FrankieOne API |
| **Verify Profile Full** | The FrankieOne endpoint that runs the complete compliance screening suite — AML, PEP, adverse media, and sanctions | Called after DVS check to complete the IDV + screening flow |
| **entityProfile: two_gov_id** | A FrankieOne configuration mode sent when a secondary ID is also present, telling FrankieOne to evaluate two government documents together | Set automatically when the Collector records a second document |

---

## Category 6 — Payment Terms

| Term | Definition | Notes |
|---|---|---|
| **PayTo** | Australia's bank-to-bank payment rail running on the NPP. The system initiates jackpot payouts via PayTo agreements | Processed by Zepto |
| **PayTo Agreement** | A formal authorisation between the venue's bank and Zepto that permits the system to initiate PayTo payments up to a set limit | Must be `active` before any payout can be sent. Checked at the venue level first, client level as fallback |
| **Float Account** | The venue's Zepto holding account from which jackpot payouts are drawn | Must have sufficient funds. Not managed by Cruz Money directly |
| **No-EFT Payout** | A payout where the entire amount is paid in cash — no bank transfer needed | Requires `allowNoEFTPayout = true` in venue config and a configured cash limit |
| **Payment Batching** | Large payouts are automatically split into chunks of maximum $25,000 each | The $25,000 limit is a bank rail constraint, not a Zepto limit |
| **Daily Limit** | A per-venue or per-client cap on the total EFT payout value that can be processed in a single day | If exceeded, the payout enters `payment_delayed` status and retries the next day |
| **Minimum Wait Time** | A configurable delay (in hours) between the EGM win event timestamp and when the payout can be sent via PayTo | Set per venue in Strapi. If not elapsed, payout enters `payment_delayed` |
| **Contact Registration** | The step where the winner's bank details are registered with Zepto as a contact. Happens at jackpot submit time, before approval | Zepto returns a `zeptoContactId` stored on the jackpot. Required before a PayTo payment can be made |
| **CoP Result** | The outcome of a Confirmation of Payee check. Four values: `match`, `close_match`, `no_match`, `account_closed` | `match` and `close_match` auto-proceed; `no_match` triggers re-entry; `account_closed` blocks |
| **CoP Retry Limit** | The maximum number of times a Collector can re-enter bank details after a `no_match` CoP result | When the limit is reached, the jackpot is escalated to the Approver for override or rejection |

---

## Category 7 — Payout Status Lifecycle

```
draft → review → authorise_required → authorise_approved
                                             ↓
                                    payment_delayed ←─(retry loop)
                                             ↓
                                  payto_payment_created
                                             ↓
                                   payto_payment_success
                                             ↓
                                     payment_created
                                             ↓
                              ┌─────────────┴──────────────┐
                            paid ✓                      failed ✗
```

| Status | What it means |
|---|---|
| `draft` | Jackpot created but not yet submitted by the Collector |
| `review` | Submitted by Collector; awaiting Approver action |
| `authorise_required` | Approver approved; waiting for a second approval (if venue requires 2) |
| `authorise_approved` | All approvals complete; payment cron can now pick this up |
| `payment_delayed` | Payment cron picked it up but a prerequisite was not met (agreement inactive, daily limit reached, or min wait time not passed) |
| `payto_payment_created` | PayTo payment submitted to Zepto; awaiting settlement |
| `payto_payment_success` | Zepto confirms the PayTo payment has settled |
| `payment_created` | Zepto send-payment step initiated |
| `paid` | Final confirmed state — payment cleared. Receipt available |
| `failed` | Terminal failure — rejected by Approver, or Zepto returned rejected/returned/voided |

---

## Category 8 — Workflow Terms

| Term | Definition | Notes |
|---|---|---|
| **Cron Job** | A background process that runs on a fixed interval (every 30 seconds for payment processing). Drives all payment state transitions after approval — no human action required | There are 5 cron jobs: PayTo payment creation, PayTo status monitoring, PayTo agreement sync, final payment status monitoring, No-EFT processing |
| **Investigation Notes** | Free-text notes recorded by an Approver against a payout. Required tags: `IDV`, `Screening`, `EDDD` | Multiple tags per note allowed. Notes are permanent and visible only to Approvers |
| **copStatus** | A field on the jackpot tracking the outcome of the CoP workflow. Values: `passed`, `no_match_limit_reached`, `override_approved` | Set after the Collector completes bank detail entry |
| **delayUntil** | A timestamp written to a jackpot when it enters `payment_delayed`. The payment cron will not retry until the current time has passed this value | Calculated from `delayUnresolvedPaymentItems` config |

---

## Category 9 — Reporting Terms

| Term | Definition | Notes |
|---|---|---|
| **Payout Register** | A report in a statutory format required by state/territory gaming regulators. Lists all payouts with: date, EGM serial number, credits redeemed, prize amount, winner name, approver name, payment reference, bank details, phone number | Finance and Payout Register (F001/F002) |
| **Finance Register** | The version of the payout register formatted for venue finance teams to reconcile with their bank statement | Same data as Payout Register, different column layout |
| **CSV Export** | Dashboard and register views can be exported to CSV. Primary use: finance reconciliation and compliance audit | Available on payout dashboard and reporting screens |
| **SMR Oversight Dashboard** | A filtered view showing all payouts where an SMR was filed, with audit trail and AUSTRAC reference numbers | Visible to Approvers and Authorisers |

---

## Category 10 — FrankieOne-Specific Terms

| Term | Definition | Notes |
|---|---|---|
| **Entity** | FrankieOne's term for a person record. Every patron gets one entity created in FrankieOne during IDV | Stored as `identityClientId` (= FrankieOne `entityId`) on the `IdSession` record |
| **entityId** | The unique ID FrankieOne assigns to a patron's entity. Used in all subsequent FrankieOne API calls for that patron | Returned in the create entity response: `entity.entityId` |
| **entityProfile** | A FrankieOne configuration preset. `"default"` for standard single-document IDV; `"two_gov_id"` when two documents are provided | Set at entity creation time |
| **actionRecommended** | FrankieOne's DVS verification outcome. Three values: `PASS`, `FAIL`, `FAIL_MANUAL` | `PASS` → IDV succeeds; `FAIL` → secondary manual capture required; `FAIL_MANUAL` → flagged for manual review |
| **checkResults** | The array of individual check outcomes returned by FrankieOne after screening — one entry each for IDV, AML, PEP, adverse media, and sanctions | Each entry has a `checkClass` (idv or aml), `checkType`, `result` (PASS/FAIL/POSSIBLE_MATCH), and `name` |
| **riskLevel** | FrankieOne's own risk score: `low`, `medium`, `high`, or `unacceptable`. Used as one input to the system's risk rating calculation | Score 0–34 = low; 35–49 = medium; 50–69 = high; 70+ = unacceptable |
| **Verify Profile Simple** | The FrankieOne endpoint (`/verify/profile/simple`) that runs only the DVS document check. Called at the end of IDV data collection | Phase 3 of the FrankieOne flow |
| **Verify Profile Full** | The FrankieOne endpoint (`/verify/profile/full`) that runs the complete screening suite: AML, PEP, adverse media, sanctions | Phase 4 of the FrankieOne flow. Called separately from DVS check |
| **consent.general / consent.docs / consent.creditheader** | Three consent flags sent with every DVS check request. All three must be `"true"` | Represent the patron's consent for FrankieOne to run the check |
| **documentHash** | A hash of the patron's ID document details used to detect if a FrankieOne entity session already exists for this document | Prevents duplicate entity creation for the same patron |

---

## Category 11 — Zepto-Specific Terms

| Term | Definition | Notes |
|---|---|---|
| **zeptoContactId** | The ID Zepto assigns to a registered bank account contact. Stored as `paymentContactId` on the jackpot | Required before a PayTo payment can be initiated |
| **bban** | Basic Bank Account Number. The Zepto CoP API format for specifying an account as `BSB-AccountNumber` (e.g. `062000-12345678`) | Used in the CoP validation request |
| **uid** | A 32-byte hex string generated by the Payment Service for each CoP request | Used to correlate the CoP request with Zepto's response |
| **ZCOPR04–ZCOPR07** | Zepto error codes indicating a CoP rate limit has been exceeded | System should back off and retry after a delay |
| **PayTo Agreement Status** | The live status of a venue's PayTo agreement in Zepto. Must be `active` for a payment to proceed | Synced every 10 minutes by the `payToAgreementCron`. Other states: pending, suspended, cancelled, declined, failed, expired |
| **Float Account** | The venue's holding account in Zepto from which payments are debited before being credited to the winner's bank account | Must be funded. Cruz Money does not manage Float Account balance directly |

---

*Last updated: 2026-05-14*
