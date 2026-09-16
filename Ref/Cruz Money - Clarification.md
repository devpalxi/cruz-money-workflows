# Cruz Money — Clarification & Requirements Specification

> **Source File:** `Ref/Cruz Money - Clarification.xlsx`  
> **Generated Date:** 2026-09-07  
> **Purpose:** Complete, loss-free mapping of all sheets, tables, pricing scenarios, user stories, Jira clarifications, SMR field mappings, and role permissions from the reference workbook.

## Table of Contents
1. [Sheet 1: Clarification - 4th Sep](#1-sheet-clarification---4th-sep)
2. [Sheet 2: Billing](#2-sheet-billing)
   - [2.1 IDV & AML Pricing Scenarios / No ID & Manual KYC Scenarios](#21-idv--aml-pricing-scenarios--no-id--manual-kyc-scenarios)
   - [2.2 CoP Validation Scenarios](#22-cop-validation-scenarios)
   - [2.3 Pricing Scenario Matrix](#23-pricing-scenario-matrix)
   - [2.4 Base Pricing Items](#24-base-pricing-items)
   - [2.5 Price Calculation Formula & Notes](#25-price-calculation-formula--notes)
   - [2.6 User Scenarios Matrix (Scenarios 1 to 22)](#26-user-scenarios-matrix-user-scenarios)
   - [2.7 Billing Clarification Questions](#27-billing-clarification-questions)
3. [Sheet 3: Clarification - Epics](#3-sheet-clarification---epics)
4. [Sheet 4: Fields & settings](#4-sheet-fields--settings)
   - [4.1 Reference Links & Flows](#41-reference-links--flows)
   - [4.2 User Roles and Permissions Matrix (User roles and permission)](#42-user-roles-and-permissions-matrix-user-roles-and-permission)
   - [4.3 AUSTRAC SMR Fields Mapping (Parts A to G)](#43-austrac-smr-fields-mapping-parts-a-to-g)
5. [Sheet 5: Admin & Super Admin Dashboard](#5-sheet-admin--super-admin-dashboard)
6. [Sheet 6: Details](#6-sheet-details)
   - [6.1 CRP-69: Suspicious Matter Reporting (SMR) for AUSTRAC Compliance](#61-crp-69-suspicious-matter-reporting-smr-for-austrac-compliance)
   - [6.2 CRP-127: Basic Super Admin Dashboard](#62-crp-127-basic-super-admin-dashboard)
   - [6.3 CRP-126: Basic Stripe Integration with Pay-As-You-Go Model](#63-crp-126-basic-stripe-integration-with-pay-as-you-go-model)
   - [6.4 CRP-125: Basic OCR Functionality](#64-crp-125-basic-ocr-functionality)
   - [6.5 CRP-61 & CRP-68: PEP & Sanctions Screening for Approver Decisioning](#65-crp-61--crp-68-pep--sanctions-screening-for-approver-decisioning)

---

## 1. Sheet: Clarification - 4th Sep

**Merged Cell Ranges:** `B1:E1`

| JIRA ID | Task | High Level requirement/flow | Additional Information/links | Questions | DEV | Feedback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| | | | | Could you please confirm how we should price the different API calls in the KYC flow?<br><br>1. Specifically, what should the charge be for:<br><br>A new IDV check<br>Using an additional ID<br>Retrying the same ID<br>Medicare IDV<br>PEP/Sanctions screening<br>First CoP check<br>CoP retry/additional check<br>2. Also, which results should be charged (e.g. Pass, Fail, Server Unavailable, retries, limit exceeded)?<br>3. And for the customer pricing, should we apply a fixed discounted price or a percentage discount to the actual API cost? | | |

---

## 2. Sheet: Billing

### 2.1 IDV & AML Pricing Scenarios / No ID & Manual KYC Scenarios
> **Header (B1):** `IDV & AML Pricing Scenarios
No ID & Manual KYC Scenarios`  
*Table Range: Rows 1–20, Columns B–H*

| Primary ID | Primary IDV | PEP / Sanctions | Secondary IDV (Medicare) | IDV Calls | AML Calls | Total Billable Calls |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| Passport / Driver Licence / National ID | Pass | Clear | Skipped | 1 | 1 | 2 |
| *(Passport / Driver Licence / National ID)* | *(Pass)* | Action required | Skipped | 1 | 1 | 2 |
| *(Passport / Driver Licence / National ID)* | *(Pass)* | Clear | Pass | 2 | 1 | 3 |
| *(Passport / Driver Licence / National ID)* | *(Pass)* | Action required | Pass | 2 | 1 | 3 |
| *(Passport / Driver Licence / National ID)* | *(Pass)* | Clear | Fail | 2 | 1 | 3 |
| *(Passport / Driver Licence / National ID)* | *(Pass)* | Action required | Fail | 2 | 1 | 3 |
| *(Passport / Driver Licence / National ID)* | *(Pass)* | Clear | Server unavailable | 2* | 1 | 3* |
| *(Passport / Driver Licence / National ID)* | *(Pass)* | Action required | Server unavailable | 2* | 1 | 3* |
| *(Passport / Driver Licence / National ID)* | Fail | — | Skipped | 1 | 0 | 1 |
| *(Passport / Driver Licence / National ID)* | *(Fail)* | — | Pass | 2 | 1 | 3 |
| *(Passport / Driver Licence / National ID)* | *(Fail)* | — | Fail | 2 | 0 | 2 |
| *(Passport / Driver Licence / National ID)* | *(Fail)* | — | Server unavailable | 2* | 0 | 2* |
| *(Passport / Driver Licence / National ID)* | Server unavailable | — | Skipped | 1* | 0 | 1* |
| *(Passport / Driver Licence / National ID)* | *(Server unavailable)* | — | Pass | 2* | 1 | 3* |
| *(Passport / Driver Licence / National ID)* | *(Server unavailable)* | — | Fail | 2* | 0 | 2* |
| *(Passport / Driver Licence / National ID)* | *(Server unavailable)* | — | Server unavailable | 2* | 0 | 2* |
| No ID | n/a | n/a | Unable to complete with 1st ID | 0 | 0 | 0 |
| Manual KYC | n/a | n/a | Unable to complete with 1st ID | 0 | 0 | 0 |

### 2.2 CoP Validation Scenarios
> **Header (J1):** `CoP Validation Scenarios`  
*Table Range: Rows 1–15, Columns J–M*

| CoP Result | Enum | CoP API Calls | Billable Calls |
| :--- | :---: | :---: | :---: |
| Match | M | 1 | 1* |
| Close Match | CM | 1 | 1* |
| Individual No Match | INM | 1 | 1* |
| Non-Individual No Match | NINM | 1 | 1* |
| Account Closed | AC | 1 | 1* |
| BIC Lookup Failed | BLF | 1 | 1* |
| No Account Found | NAF | 1 | 1* |
| Account Daily No Match Limit Exceeded | ADNML | 1 | 1* |
| Requester Daily No Match Limit Exceeded | RDNML | 1 | 1* |
| Account Daily Request Limit Exceeded | ADRL | 1 | 1* |
| Requester Daily Request Limit Exceeded | RDRL | 1 | 1* |
| Unable to Confirm | UTC | 1 | 1* |
| Rate Limited | RL | 1 | 1* |

### 2.3 Pricing Scenario Matrix
> **Header (S1):** `Pricing Scenario Matrix`  
*Table Range: Rows 1–10, Columns S–V*

| Scenario | Attempts during payout creation | Actual price | Customer price |
| :--- | :--- | :--- | :--- |
| COP – 1 attempt | 1 COP attempt | COP base price | $X1 |
| COP – 2 attempts | 2 COP attempts | COP base + additional COP | $X1 |
| IDV – 1 attempt + COP – 1 attempt | 1 IDV + 1 COP | $12 + COP | $X1 |
| IDV – 2 attempts + COP – 1 attempt | 1 initial ID + 1 new ID + 1 COP | $12 + $3 + COP | $X1 |
| IDV – 3 attempts + COP – 1 attempt | 1 initial ID + 1 new ID + 1 retry on same ID + 1 COP | $12 + $3 + $2 + COP | $X1 |
| IDV – 2 attempts + COP – 2 attempts | 1 initial ID + 1 new ID + 2 COP | $12 + $3 + COP + additional COP | $X1 |

### 2.4 Base Pricing Items
*Table Range: Rows 26–33, Columns B–H*

| Pricing Item | Currency | Value | IDV Usage | Example | Pricing Basis |
| :--- | :---: | :--- | :--- | :--- | :--- |
| IDV – New ID | $ | 12 | 1 attempt | 1 new ID | Base IDV price |
| IDV – Retry / Same ID | $ | 2 | 2 attempts | 2 new IDs | Base IDV + second ID price |
| IDV – Additional New ID | $ | 3 | 3 attempts | 2 new IDs + same ID retry due to data correction | Base IDV + new ID price + retry price |
| AML – PEP / Sanctions | $ | x1 |  |  |  |
| CoP – 1 Attempt | $ | x2 |  |  |  |
| CoP – Additional Attempt | $ | x2 |  |  |  |
| Discounted Price / Customer Price | $ | x3 |  |  |  |

### 2.5 Price Calculation Formula & Notes

- **Actual Price Formula (Row 36):** `Actual Price = (New ID × $12) + (Additional New ID × $3) + (Same ID Retry × $2) + (AML Calls × AML Price) + (CoP Calls × CoP Price)`
- **Server Unavailable Note (Row 22):** *Confirm whether a Server unavailable request is billable and whether retrying it consumes an attempt.
- **No ID / Manual KYC Error Note (Row 23):** When No ID or Manual KYC is selected as the Primary ID, selecting Medicare as the Secondary ID results in an “Session not found. Please complete the primary ID verification first” error

### 2.6 User Scenarios Matrix (User scenarios)
> **Original Header (B40):** `User scenarios`  
*Table Range: Rows 40–64, Columns B–P*

| ID | Primary IDV / Attempts | PEP / Sanctions | Secondary IDV | CoP Result | IDV Calls | AML Calls | CoP Calls | Total Calls | New ID | Additional New ID | Same ID Retry | Actual Price Formula |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| 1 | Passport – Pass (Attempt 1) | Clear | Skipped | Match | 1 | 1 | 1 | 3 | 1 | 0 | 0 | `1×$12 + 1×AML + 1×CoP` |
| 2 | Driver Licence – Pass (Attempt 1) | PEP – Action Required | Skipped | Close Match | 1 | 1 | 1 | 3 | 1 | 0 | 0 | `1×$12 + 1×AML + 1×CoP` |
| 3 | National ID – Pass (Attempt 1) | Sanctions – Action Required | Skipped | No Match | 1 | 1 | 1 | 3 | 1 | 0 | 0 | `1×$12 + 1×AML + 1×CoP` |
| 4 | Passport – Pass (Attempt 1) | PEP + Sanctions – Action Required | Skipped | Match | 1 | 1 | 1 | 3 | 1 | 0 | 0 | `1×$12 + 1×AML + 1×CoP` |
| 5 | Passport – Fail (Attempt 1) → Driver Licence – Pass (Attempt 2) | Clear | Skipped | Match | 2 | 1 | 1 | 4 | 1 | 1 | 0 | `1×$12 + 1×$3 + 1×AML + 1×CoP` |
| 6 | Driver Licence – Fail (Attempt 1) → Passport – Fail (Attempt 2) | Not Run | — | — | 2 | 0 | 0 | 2 | 1 | 1 | 0 | `1×$12 + 1×$3` |
| 7 | Passport – Fail (Attempt 1) → Passport – Fail (Attempt 2) | Not Run | — | — | 2 | 0 | 0 | 2 | 1 | 1 | 0 | `1×$12 + 1×$3` |
| 8 | Passport – Pass (Attempt 1) | Clear | Medicare – Pass | Match | 2 | 1 | 1 | 4 | 1 | 0 | 0 | `1×$12 + 1×AML + 1×CoP + Medicare price` |
| 9 | Passport – Pass (Attempt 1) | Clear | Medicare – Fail | Match | 2 | 1 | 1 | 4 | 1 | 0 | 0 | `1×$12 + 1×AML + 1×CoP + Medicare price` |
| 10 | Passport – Fail (Attempt 1) → Medicare – Pass | Clear | Medicare – Pass | Match | 2 | 1 | 1 | 4 | 1 | 0 | 0 | `1×$12 + 1×AML + 1×CoP + Medicare price` |
| 11 | Passport – Fail (Attempt 1) → Medicare – Fail | Not Run | Medicare – Fail | — | 2 | 0 | 0 | 2 | 1 | 0 | 0 | `1×$12 + Medicare price` |
| 12 | Passport – Server Unavailable (Attempt 1) → Driver Licence – Pass (Attempt 2) | Clear | Skipped | Match | 2* | 1 | 1 | 4* | 1 | 1 | 0 | `1×$12 + 1×$3 + 1×AML + 1×CoP*` |
| 13 | Passport – Server Unavailable (Attempt 1) → Attempt 2 | Not Run | — | — | 2* | 0 | 0 | 2* | 1 | 1 | 0 | `1×$12 + 1×$3*` |
| 14 | Passport – Pass (Attempt 1) | PEP – Action Required | Skipped | Account Closed | 1 | 1 | 1 | 3 | 1 | 0 | 0 | `1×$12 + 1×AML + 1×CoP` |
| 15 | Driver Licence – Pass (Attempt 1) | Sanctions – Action Required | Skipped | No Account Found | 1 | 1 | 1 | 3 | 1 | 0 | 0 | `1×$12 + 1×AML + 1×CoP` |
| 16 | Passport – Pass (Attempt 1) | Clear | Skipped | Rate Limited → Retry | 1 | 1 | 2* | 4* | 1 | 0 | 0 | `1×$12 + 1×AML + 2×CoP*` |
| 17 | Passport – Pass (Attempt 1) | Clear | Skipped | Unable to Confirm → Retry | 1 | 1 | 2* | 4* | 1 | 0 | 0 | `1×$12 + 1×AML + 2×CoP*` |
| 18 | Passport – Pass (Attempt 1) | Clear | Skipped | Match → CoP Retry | 1 | 1 | 2* | 4* | 1 | 0 | 0 | `1×$12 + 1×AML + 2×CoP*` |
| 19 | No ID | n/a | Not allowed | — | 0 | 0 | 0 | 0 | 0 | 0 | 0 | `0` |
| 20 | Manual KYC | n/a | Not allowed | — | 0 | 0 | 0 | 0 | 0 | 0 | 0 | `0` |
| 21 | Passport – Fail (Attempt 1) → Driver Licence – Fail (Attempt 2) | Not Run | Manual KYC / No ID | — | 2 | 0 | 0 | 2 | 1 | 1 | 0 | `1×$12 + 1×$3` |
| 22 | Passport – Pass (Attempt 1) | PEP + Sanctions – Action Required | Medicare – Pass | Close Match | 2 | 1 | 1 | 4 | 1 | 0 | 0 | `1×$12 + 1×AML + 1×CoP + Medicare price` |

### 2.7 Billing Clarification Questions
*Rows 73–74, Column B*

> **Header:** Clarification
> 
> Could you please confirm how we should price the different API calls in the KYC flow?
> 
> 1. Specifically, what should the charge be for:
> 
> A new IDV check
> Using an additional ID
> Retrying the same ID
> Medicare IDV
> PEP/Sanctions screening
> First CoP check
> CoP retry/additional check
> 2. Also, which results should be charged (e.g. Pass, Fail, Server Unavailable, retries, limit exceeded)?
> 3. And for the customer pricing, should we apply a fixed discounted price or a percentage discount to the actual API cost?

---

## 3. Sheet: Clarification - Epics

**Documentation Link (Row 1):** [https://cruzmoney.atlassian.net/wiki/spaces/CEI/pages/101351425/v2+Release+scope](https://cruzmoney.atlassian.net/wiki/spaces/CEI/pages/101351425/v2+Release+scope)  
**Feedback Link (Row 16):** [https://cruzmoney.atlassian.net/wiki/spaces/CEI/pages/78643201/Feedback](https://cruzmoney.atlassian.net/wiki/spaces/CEI/pages/78643201/Feedback)  

| JIRA ID | Task | High Level requirement/flow | Additional Information/links | Questions | DEV | Feedback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| CRP-69 | Suspicious Matter Reporting for AUSTRAC Compliance | Admin<br>1. Identify payouts requiring SMR review based on risk indicators<br>2. Create, manage and view SMR records<br>3. Link SMRs to the related payout/jackpot<br>4. Auto-populate available data and add missing information<br>5. Track SMR status and AUSTRAC submission details<br>6. Generate an SMR summary for external AUSTRAC submission<br>7. Maintain SMR audit history<br>8. Submit SMRs externally to AUSTRAC and record the submission in Cruz | UI flow -> https://cozy-kringle-9f661e.netlify.app/austrac-report-helper | 1. Should payouts with high-risk indicators be automatically displayed/flagged on the SMR page, or should Admin manually filter for them?<br>2. What risk levels/indicators should trigger an SMR review, high risk only or other levels as well?<br>3. Are notifications/reminders required for pending or incomplete SMRs?<br><br><br>Implementation notes: <br>What SMR information can be auto-populated from Cruz, and what needs to be entered manually? |  |  |
| CRP-125 | Basic OCR functionality | Collector flow<br>1. Upload/capture a payout docket image<br>2. Click “Extract Details” to run OCR<br>3. Extracted information is auto-filled into the relevant payout fields<br>4. Collector can review and edit the information before submitting<br>5. Docket upload and OCR are optional<br>6. Details can also be entered manually<br><br>Approver & Authoriser flow<br>1. Can view the uploaded payout docket image when reviewing the payout | UI flow-> https://cozy-kringle-9f661e.netlify.app/01-new-payout-details | 1. Should the system track whether a payout was created using OCR or manual entry?<br>1.1 If yes, where should this information be shown and which roles should have access?<br>2. Should changes made to OCR-extracted information be identifiable for audit purposes?<br>2.1 If yes, where should the changes be shown and which roles should have access?<br>3. What level of OCR accuracy is expected?<br>4. Should the Collector be required to review the extracted details before submitting?<br>5. Is OCR completely optional, or should it be required for certain payout types such as EGM, TAB, or Keno? |  |  |
| CRP-127 | Basic super admin dashboard | Super Admin<br>1. New Super Admin role for Cruz Staff with the highest level of access<br>2.  Onboarding Management<br>2.1 Manage onboarding by adding, editing and deleting relevant users/records<br>3. Platform Monitoring & Insights<br>3.1 View data across all clients and venues, including payout, SMR and subscription information<br>3.2 Monitor platform data, analysis and reports<br>3.3 Export data | A. Super admin flow suggestion by QA (separate pages) -> https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=1639-3241&t=781tfiWOgEnNysUd-4<br><br>B. Venue Onboarding flow suggestion (UI/dev) -> https://cozy-kringle-9f661e.netlify.app/venue-00-list<br><br><br>Dashboard: https://cozy-kringle-9f661e.netlify.app/dashboard | 1. What information should be displayed on the Super Admin dashboard?<br>1.1 What specific information should be shown for payouts, IDV results and subscriptions?<br>1.2 Should the dashboard show data across all venues by default, or allow users to filter by specific venue(s)?<br>2. What onboarding actions should Super Admin have?<br>2.1 Add, edit, deactivate/reactivate and delete Clients, Venues, Machines and Users?<br>3. Are bulk actions required for onboarding?<br>3.1 For example, adding or managing multiple venues, machines or users at once<br>4. Should Clients, Venues, Users and Machines be managed as separate pages, or through the Venue onboarding flow? (Refer to A & B)<br><br>Suggestion Admin vs Super Admin:<br>1. Finalise the Super Admin vs Venue Admin permissions to clearly define what each role can view and manage<br>2. Is there possibility to maintain same struction, but restriction on permission for super admin and admin? <br><br>User roles: https://docs.google.com/spreadsheets/d/1Tj3wXejekc-8--PO2HTDUCBK97qUVYazG7z6bFadjVk/edit?gid=1751627443#gid=1751627443&range=J1:S8 |  |  |
| CRP-126 | Basic Stripe integration with pay as you go model | Admin<br>1. Integrate Stripe for PAYG billing and payments for Admin role (venue admin)<br>2. Track usage and calculate charges for specific Cruz features<br>3. Add card details, View payment status and billing history<br>4. Billing starts from Day 1, with no trial period<br>5. Monthly billing cycle<br><br>Super Admin<br>1. Should be able to view summary information of subscription of each venue | UI flow -> https://cozy-kringle-9f661e.netlify.app/billing | 1. Which Cruze features should be included in the PAYG billing, and what usage metric should be used for each feature?<br>Ex:<br>IDV -> IDV — charge per ID verification<br>PEP/Sanctions → per screening<br>Adverse Media → per screening<br>SMR — charge per SMR/report created or submitted<br>OCR ?<br>2. Who should be billed for the PAYG charges, the Client or the Venue?<br>3. What billing and subscription information should Super Admin be able to view?<br>Ex: <br>Paid vs free users/venues<br>Payment status<br>Billing history<br>Usage/charges<br>Subscription status<br>3.1 Should this information be shown on the dashboard, a separate page, or both? |  |  |
| CRP-128 | Frankione v1 to v2 migration | 1. Currently, IDV checks trigger two stages: IDV details check first, followed by PEP/Sanctions full screening if the IDV check passes<br>2. Support venue-level ON/OFF configuration for these checks<br>3. FrankieOne V1 does not provide the required API-level breakdown, so migrate to FrankieOne V2<br>4. Retrieve separate IDV, PEP/Sanctions and Adverse Media results through the V2 API<br>5. Use these results for Super Admin venue-level analysis, basic reporting and PAYG usage tracking |  | 1. What kind of information need to display ? Is this relation to PAYG subscription model? |  |  |
| CRP-61 | PEP & Sanctions Screening for Approver Decisioning | 1. Core functionality for the Action Required function to review and resolve PEP & Sanctions status is completed<br>2. UI flow and UX improvements are still required |  | 1. Any specific UI/UX changes required? |  |  |
| CRP-68 | Risk Rating for AML Program Compliance | Internal risk rating (Approver View)<br><br>1. PEP type is pre-filled from FrankieOne<br>2. System automatically assigns an initial risk rating based on the PEP result:<br>Non-PEP → Low<br>Domestic PEP → Medium<br>Foreign PEP / International Organisation → High<br>3. If FrankieOne returns a Possible PEP Match, the risk rating remains Low until the Approver reviews and confirms the PEP status<br>4. Once the Approver completes the PEP adjudication, the risk rating is updated based on the confirmed PEP status<br>5. Approver can accept or manually adjust the risk rating<br>6. A mandatory commentary is required when the Approver manually adjusts the risk rating<br><br>Future Risk Factors<br><br>The risk rating may also consider:<br><br>ID type / IDV result<br>For example, verified Australian government photo ID → Low<br>Foreign or unverified ID → Medium/High<br>SMR presence<br>Previous SMR linked to the person or key identifiers → High<br>Other / manual triggers<br>Third-party transaction monitoring alert → High<br>Unusual Activity Report (UAR) → High | https://cruzmoney.atlassian.net/wiki/spaces/CEI/pages/84672513/Create+a+risk+rating+NEW+-+PEP+Only | 1. Once the risk rating is added, should it also be visible to the Authoriser?<br>2. Will the risk rating be used for the Super Admin dashboard, or for any other future purpose?<br>3. For the future risk factors (IDV, SMR and other triggers), should they automatically affect the risk rating or only be shown as information for the Approver?<br>4. Should multiple risk factors be combined into one overall risk rating?<br>5. If multiple factors result in different ratings, should the system use the highest risk rating?<br><br>Technical / Testing Clarifications<br>1. How should the risk rating be handled for existing payouts where the PEP/Sanctions resolution has already been completed or is currently pending authorisation?<br>2. Are the required PEP classifications already supported in the existing test data, or do they need to be configured/created for testing? |  |  |
| CRP-70 | Payment Disbursement for Payout Release | 1. Split payouts above $25,000 into multiple payment chunks<br>2. Process each chunk as a separate Zepto payment<br>3. Mark the overall payout as Paid only after all chunks are settled<br>4. Track the payment breakdown and status of each chunk<br>5. Improve the UI, error handling and end-to-end payment flow |  | 1. Should payouts above $25,000 always be split into $25,000 maximum chunks?<br>2. How should Client and Venue daily limits affect payment processing?<br>3. Should submission be restricted if the daily limit has already been exceeded?<br>4. Should the Approver/Authoriser be notified when payment chunking is required or a payment cannot be processed?<br>5. How should failed or pending chunks be handled?<br>6. How should the payment breakdown and chunk status be shown in the UI?<br>7. Should payment actions and status changes be recorded in the audit log?<br>8. Should each chunk require separate approval/authorisation, or should the original payout approval cover all chunks? |  |  |
| CRP-134 | Tab and mobile compatibility | 1. Support responsive design across Web, Tablet and Mobile<br>2. Web is the highest priority, followed by Tablet and Mobile |  | 1. Are there any specific tablet or mobile devices/screen sizes that need to be supported?<br>2. Should all Cruz pages and functions be responsive, or should this be prioritised for specific pages?<br>Ex: <br>New Payout flow/form<br>Approver/Authoriser summary page<br>Dashboard<br>Other key pages<br>3. Are there any mobile/tablet-specific functions or limitations to consider?<br>4. Which devices should be prioritised: iOS/iPadOS, Android tablet, or both?<br>5. What devices are most commonly used by Cruz users today? |  |  |
| CRP-145 | Blacklist for each venue | 1. Create and maintain a venue-specific blacklist based on FrankieOne results<br>2. Approver/Authoriser can add or remove blacklist records<br>3. When a blacklisted person has a new payout, the system identifies the blacklist match<br>4. Display the blacklist status in the payout/decisioning view<br>5. Super Admin can view blacklist records by venue<br>6. Maintain a record of blacklist changes for audit purposes |  | 1. What information from FrankieOne should be used to identify or create a blacklist record?<br>2. Should Approver and Authoriser both be able to add and remove blacklist records?<br>3. Should the blacklist be venue-specific, or should a person blacklisted at one venue be identified across other venues?<br>4. When a blacklisted person is identified in a new payout, should the payout be blocked or flagged for Approver/Authoriser review?<br>5. Should the blacklist match be automatically shown in the payout/decisioning view?<br>6. Should Super Admin have view-only access, or also be able to manage blacklist records?<br>7. blacklist add/remove actions be recorded in the audit history? |  |  |
| CRP-146 | Basic internal reporting | 1. View a filtered list of all payouts for a venue or group<br>2. Search and sort payouts by key attributes such as name, phone number, email address and bank account |  | 1. Which data/report types should be included?<br>Payouts<br>Billing/Subscriptions<br>IDV<br>AML / PEP & Sanctions<br>SMR<br>Other?<br>2. What fields, filters and search options are required for each report type?<br>3. Should users be able to export filtered results as CSV?<br>4. Which roles should have access to each report?<br>5. Should Super Admin have access to all reporting data across clients and venues?<br>6. Should each role only see reporting data based on their venue/client permissions? |  |  |
| CRP-148 | Customer winner communication | 1. Provide SMS or Email as the winner's communication method<br>2. Allow Collector to select the communication method<br>3. Record IDV consent with date/time for Approver and Authoriser to view<br>4. Notify winner for IDV consent, payment pending and payment completed<br>5. Send SMS for all notifications and Email for IDV consent and payment pending | https://cruzmoney.atlassian.net/wiki/spaces/CEI/pages/88080385/End+customer+winner+communications | 1. Should the Collector select one communication method: SMS or Email or both?<br>2. Should the selected communication method be saved against the payout record?<br>3. What information should be included in each SMS and Email? Any template to follow?<br>4. Should notifications be sent automatically at each stage?<br>5. What should happen if the SMS or Email fails to send?<br>6. Should the system keep a notification history for audit purposes? |  |  |

---

## 4. Sheet: Fields & settings

### 4.1 Reference Links & Flows
- **SMR Feature Flow (Row 2, B):**
  SMR feature flow (QA draft based on previous user story discussions):

https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=453-2078&t=sOq1BZgOsyof8Fkb-4
- **Strapi Dashboard settings (Row 2, G & H):** [https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=559-2240&t=sOq1BZgOsyof8Fkb-4](https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=559-2240&t=sOq1BZgOsyof8Fkb-4)
- **Latest Flow (Row 3, B):**
  Latest flow created here -> https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=1561-3159&t=hG3mkRb1RL66I9Qo-4

### 4.2 User Roles and Permissions Matrix (User roles and permission)
> **Header (J1):** `User roles and permission`  
> **Section Scope (L2:S2):** `Page access`  
*Table Range: Rows 1–8, Columns J–S*

| User Role | What they do | Dashboard | Client | Venue | Machine | User Types | Payout | SMR | PAYG billing and payments |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Super Admin | 1. Handle client, venue, machine and user add/edit functions<br>2. View individual and summary information for payouts, SMR, subscriptions and audit logs | view different fields based on user level access and permission | Create/Edit/Delete | Create/Edit/Delete | Create/Edit/Delete | Create/Edit/Delete | n/a | View | View |
| Admin | 1. Handle user and machine creation for a particular venue<br>1.1 Current: Create users, bulk machine creation<br>What other permissions should be given?<br>What other pages should they be able to access and what permissions? |  | n/a | Create | Bulk add | Create | n/a<br>Should Venue Admin be allowed to create payouts? | Create | Create |
| Authoriser | View and authorise decision |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| Approver | View and approve decision |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| Collector | Payout submission and view |  | n/a | n/a | n/a | n/a | Create | n/a | n/a |

### 4.3 AUSTRAC SMR Fields Mapping (Parts A to G)
*Table Range: Rows 4–50, Columns B–E*

| Section / Part | AUSTRAC SMR Fields | Data available in Cruz Money | Notes / Clarifications |
| :--- | :--- | :--- | :--- |
| Part A - Report Details | Report Type |  |  |
| Part A - Report Details | Date of report |  |  |
| Part A - Report Details | Report Reference no. |  |  |
| Part A - Report Details | Amended Report? |  |  |
| Part B - Reporting Entity | Entity name | Need to confirm | Client name? |
| Part B - Reporting Entity | ABN |  |  |
| Part B - Reporting Entity | AUSTRAC reporting entity ID |  |  |
| Part B - Reporting Entity | Sector/service type |  |  |
| Part B - Reporting Entity | Designated service |  |  |
| Part B - Reporting Entity | Principal place of business |  |  |
| Part B - Reporting Entity | Contact officer |  |  |
| Part C - Transaction/Activity details | Activity Type | Need to confirm | Partial selection? |
| Part C - Transaction/Activity details | Date of activity | Need to confirm |  |
| Part C - Transaction/Activity details | Time of activity | Need to confirm |  |
| Part C - Transaction/Activity details | EGM Asset/Machine ID | Yes |  |
| Part C - Transaction/Activity details | Transaction amount | Yes |  |
| Part C - Transaction/Activity details | Payment method (payout) | Need to confirm | Partial selection? |
| Part C - Transaction/Activity details | Loyalty/membership card used | No |  |
| Part C - Transaction/Activity details | CCTV reference | No |  |
| Part D - Person(s) involved | Full Name | Yes |  |
| Part D - Person(s) involved | Date of Birth | Yes |  |
| Part D - Person(s) involved | Gender | Need to confirm |  |
| Part D - Person(s) involved | Nationality | Yes |  |
| Part D - Person(s) involved | Residential Address | Yes |  |
| Part D - Person(s) involved | Phone | Yes |  |
| Part D - Person(s) involved | Email | Yes |  |
| Part D - Person(s) involved | Occupation | Need to confirm |  |
| Part D - Person(s) involved | ID document type | Yes |  |
| Part D - Person(s) involved | ID document number | Yes |  |
| Part D - Person(s) involved | ID verified by | Need to confirm | Collector details? |
| Part D - Person(s) involved | Loyalty member since |  |  |
| Part D - Person(s) involved | Role in transaction |  |  |
| Part D - Person(s) involved | PEP/Sanction check | Yes |  |
| Part E - Ground for suspicion | Suspicious matter indicators (select all applicable) |  |  |
| Part E - Ground for suspicion | Narrative description of suspicious activity | Need to confirm |  |
| Part E - Ground for suspicion | Why did the entity form a suspicious? |  |  |
| Part F - Related reports & action taken | TTR logded? |  |  |
| Part F - Related reports & action taken | Prior SMR for same person? |  |  |
| Part F - Related reports & action taken | Payout withheld/frozen? |  |  |
| Part F - Related reports & action taken | Law enforcement notified? |  |  |
| Part F - Related reports & action taken | Patron account flagged? |  |  |
| Part F - Related reports & action taken | Supporting document attached |  |  |
| Part G - Declaration | Authorised officers declaration |  |  |
| Part G - Declaration | Name |  |  |
| Part G - Declaration | Title |  |  |
| Part G - Declaration | Date Signed |  |  |

---

## 5. Sheet: Admin & Super Admin Dashboard

**Title (Row 1):** Strapi Dashboard - onboarding
- **Admin URL (Row 4, A & B):** [https://cozy-kringle-9f661e.netlify.app/dashboard](https://cozy-kringle-9f661e.netlify.app/dashboard)
- **Super Admin URL (Row 4, D & E):** [https://cozy-kringle-9f661e.netlify.app/super-admin.html](https://cozy-kringle-9f661e.netlify.app/super-admin.html)

| Section (Admin) | Admin Requirements / Questions | Admin Status / Note | Section (Super Admin) | Super Admin Requirements / Questions | Super Admin Status / Note | General Clarification |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| Dashboard | Can individual payout record able to view when click? | True | Nav items | Better to maintain order - Client -> Venue - Machine - Users |  | Need Clarification |
| Machines | Do we need to display the unique UUID in frontend for machines? TBD |  | Client | Clicking "Add bank details" -> additional view display, this will be done after the intial save |  | Need Clarification |
|  | Also what should be unique value for machines? TBD |  |  | Clicking "PayToAgreement" -> additional view display, this will be done after the bank details save |  |  |
|  | In Stapi Status display as active and archived | True |  | Clicking "noEFTPayout" ->  additional view display, this will be done after the bank details save |  |  |
|  | Add machine - UUID should not generated in default view | True |  |  |  |  |
|  | Bulk machine upload - In current system, when bulk machines upload, fields validated before uploading<br>Upload should be enable if all fields are valid in csv report<br><br>403 error - bulk machine different client.png<br>update.png<br>invalid data.png | Need Clarification | Venue | Clicking "PayToAgreement" -> additional view display, this will be done after the bank details save |  |  |
|  |  |  |  | Clicking "Add bank details" -> additional view display, this will be done after the intial save |  |  |
| Users | Add user - Confimed field is missing | True |  |  |  |  |
|  | Add user - UUID should not generated in default view | True | Users | Add user - Confimed field is missing | True |  |
|  | Add user - client field missing. since venue admin specific for a client, hope this is properly tracked | True |  | Add user - UUID should not generated in default view | True |  |
|  | Do we enable to all user types to select for an user? Current system do that. Any specific reason? TBD |  |  | Add user - client field missing. since venue admin specific for a client, hope this is properly tracked | True |  |
|  |  |  |  | Do we enable to all user types to select for an user? Current system do that. Any specific reason? TBD |  |  |
| AUSTRAC Reports | AUSTRAC Reports creation should be done by admin? | True |  | Add user - Venue should not be assigned by default | True |  |
| Venue Settings | Payout & compilance - <br>1. Add IDV true/false setting for a venue<br>IdentityVerifiedEnabled | True | Machines | Do we need to display the unique UUID in frontend for machines? TBD |  |  |
|  |  |  |  | Also what should be unique value for machines? TBD |  |  |
|  |  |  |  | In Stapi Status display as active and archived | True |  |
|  |  |  |  | Add machine - UUID should not generated in default view | True |  |
|  |  |  |  | Add machine - Venue should not be assigned by default | True |  |
|  |  |  |  | Are we supporting bulk upload in here as well? |  |  |

---

## 6. Sheet: Details

| Epic / Context | Section / Topic | Clarification & Requirement | DEV Feedback | PM Feedback | FINAL req |
| :--- | :--- | :--- | :--- | :--- | :--- |
| CRP-69<br>Suspicious Matter Reporting for AUSTRAC Compliance | *(Epic scope defined in Clarification - Epics)* | | | | |
| CRP-69<br>Suspicious Matter Reporting for AUSTRAC Compliance | SMR Access & User Roles | Define the user roles who can create, manage, view, and submit SMR reports.<br><br>Suggestion:<br>- Approver should have access to create and manage SMR records.<br>- Authoriser and Super Admin should have view access to SMR details.<br>- Define permissions for Create, Edit, View, and Update Submission Details actions.<br><br>UI consideration:<br>- Apply role-based access control for SMR actions.<br>- Display available actions based on user permissions.<br>- Cruz should not directly submit SMRs to AUSTRAC; Approver submits externally and records submission details in Cruz.<br><br>Final: Admin action (venue specific admin) |  |  | Admin action (venue specific admin) |
| CRP-69<br>Suspicious Matter Reporting for AUSTRAC Compliance | SMR Trigger & Identification | SMR should be triggered based on risk indicators such as PEP match, Sanctions match, High-risk flag, or suspicious payout patterns<br><br>Suggestion:<br>- Risk indicators should flag payouts requiring SMR review; they should not automatically create an SMR submission.<br>- Approver should be able to identify payouts requiring SMR review from the existing dashboard.<br>- Add SMR-related indicators/filters for easier identification.<br><br>Examples:<br>- SMR Required<br>- SMR Draft<br>- SMR Submitted |  |  |  |
| CRP-69<br>Suspicious Matter Reporting for AUSTRAC Compliance | SMR Link to Payout Record | Define relationship between SMR records and payout/jackpot records.<br><br>Suggestion:<br>- Each SMR should be linked to the related jackpot/payout record.<br>- Users should be able to navigate between payout details and SMR details.<br>- SMR status should be visible from the payout dashboard. |  |  |  |
| CRP-69<br>Suspicious Matter Reporting for AUSTRAC Compliance | AUSTRAC SMR Fields & Cruz Money Data Mapping | Compare AUSTRAC SMR required fields with data available in Cruz Money.<br><br>Suggestion:<br>- Use the AUSTRAC SMR form structure as the basis for the Cruz SMR preparation screen.<br>- Identify fields that can be auto-populated from Cruz Money.<br>- Cruz Money available data should be displayed as read-only.<br>- Fields not available in Cruz Money but required for AUSTRAC should allow manual entry.<br>- Compliance/investigation-related fields should be editable by authorised users. |  |  |  |
| CRP-69<br>Suspicious Matter Reporting for AUSTRAC Compliance | SMR Workflow & Status Tracking | Cruz Money will track the internal SMR workflow. The official SMR submission record is maintained in AUSTRAC. <br>After submission through AUSTRAC, the Approver must record the AUSTRAC reference number and submission details in Cruz Money for tracking and audit purposes.<br><br>Suggestion:<br>Possible statuses:<br>- SMR Required (flagged for review)<br>- Not Created<br>- Draft<br>- Under Review (if required)<br>- Submitted<br><br>Users should be able to track the current SMR status linked to the relevant payout/jackpot record.<br><br>After AUSTRAC submission, Approver should capture:<br>- AUSTRAC Reference Number<br>- Submission Date<br>- Submitted By |  |  |  |
| CRP-69<br>Suspicious Matter Reporting for AUSTRAC Compliance | SMR Summary Generation | Add a function to generate a summary of all SMR form details.<br><br>Suggestion:<br>- Summary should combine Cruz Money system data and user-entered compliance details.<br>- Summary should help Approver review information before submission.<br>- Purpose is to make it easier to copy and transfer information from Cruz Money into the AUSTRAC reporting portal. |  |  |  |
| CRP-69<br>Suspicious Matter Reporting for AUSTRAC Compliance | SMR Audit History | As SMR is a compliance-related feature, maintain audit history.<br><br>Capture:<br>- SMR created by/date<br>- Updates made by/date<br>- Status changes<br>- AUSTRAC reference number added/updated by/date<br>- Submitted by/date<br>- Changes made |  |  |  |
| CRP-69<br>Suspicious Matter Reporting for AUSTRAC Compliance | SMR Notifications (Optional) | Consider whether notifications/reminders are required for pending SMR actions or incomplete reports.<br><br>Examples:<br>- SMR flagged but not created<br>- Draft SMR pending completion<br>- Submitted status not updated with AUSTRAC reference |  |  |  |
| CRP-127<br>Basic super admin dashboard<br> Strapi dashboard create and edit -> https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=559-2240&t=QoBZd3SR3xYi6lZ0-0<br> Super admin flow suggestion -> https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=1639-3241&t=781tfiWOgEnNysUd-4 | *(Epic scope defined in Clarification - Epics)* | | | | |
| CRP-127<br>Basic super admin dashboard<br> Strapi dashboard create and edit -> https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=559-2240&t=QoBZd3SR3xYi6lZ0-0<br> Super admin flow suggestion -> https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=1639-3241&t=781tfiWOgEnNysUd-4 | Super Admin Dashboard | Super Admin should have read-only access to view platform information regarding all client and venues<br><br>Suggestion:<br>- View all venues across clients<br>- View client → venue relationship<br>- View users and machines assigned to venues<br>- View payout details after applying required filters<br><br>Dashboard should support filtering to allow Super Admin to find relevant records. |  |  |  |
| CRP-127<br>Basic super admin dashboard<br> Strapi dashboard create and edit -> https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=559-2240&t=QoBZd3SR3xYi6lZ0-0<br> Super admin flow suggestion -> https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=1639-3241&t=781tfiWOgEnNysUd-4 | Super Admin Filtering & Data View | Define filtering requirements for read-only views.<br><br>Possible filters:<br>- Client<br>- Venue<br>- User<br>- Machine<br>- Date range<br>- Transaction/payout status<br><br>Filtered results should allow viewing relevant payout and operational details |  |  |  |
| CRP-127<br>Basic super admin dashboard<br> Strapi dashboard create and edit -> https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=559-2240&t=QoBZd3SR3xYi6lZ0-0<br> Super admin flow suggestion -> https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=1639-3241&t=781tfiWOgEnNysUd-4 | Super Admin Onboarding Management (Future) | Current process:<br>Client, Venue, User, and Machine creation are managed through Strapi dashboard.<br><br>New<br>Moving onboarding functionality into the frontend Super Admin dashboard.<br><br>Required functions to consider:<br>- Create Client<br>- Create Venue under Client<br>- Create User<br>- Create Machine<br>- Assign users/machines to venues<br>- Edit details<br>- Deactivate/reactivate records <br> Ex: Deactivate inactive clients, venues, users, or machines instead of permanent deletion (if applicable). |  |  |  |
| CRP-127<br>Basic super admin dashboard<br> Strapi dashboard create and edit -> https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=559-2240&t=QoBZd3SR3xYi6lZ0-0<br> Super admin flow suggestion -> https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=1639-3241&t=781tfiWOgEnNysUd-4 | Frontend & Backend Data Synchronisation | If onboarding is introduced in frontend:<br><br>- Data created/updated from Super Admin dashboard should be saved through backend APIs.<br>- Data should remain consistent with backend and Strapi records.<br>- Clarify whether Strapi remains an admin tool only or the source of truth. |  |  |  |
| CRP-127<br>Basic super admin dashboard<br> Strapi dashboard create and edit -> https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=559-2240&t=QoBZd3SR3xYi6lZ0-0<br> Super admin flow suggestion -> https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=1639-3241&t=781tfiWOgEnNysUd-4 | Configuration Settings | Existing Strapi contains configuration settings (e.g., true/false flags, limits). refer to https://www.figma.com/board/6l9E68NHwD0rq1wMQvxCgF/cruz.money?node-id=559-2240&t=sOq1BZgOsyof8Fkb-4<br><br>Clarification needed:<br>- Should configuration settings move into Super Admin dashboard?<br>- Should there be a dedicated Settings page?<br><br>Settings scope needs to be defined:<br>- Global level settings<br>- Client-level settings<br>- Venue-level settings<br>- User-level settings<br>- Machine-level settings |  |  |  |
| CRP-126<br>Basic Stipe integration with pay as you go model | *(Epic scope defined in Clarification - Epics)* | | | | |
| CRP-126<br>Basic Stipe integration with pay as you go model | Stripe Integration – Pay As You Go Model | Separate feature: Basic Stripe integration for Pay-As-You-Go subscription model.<br><br>Initial scope:<br>- Manual Stripe setup/process.<br>- Display subscription and usage information in Super Admin dashboard.<br><br>Dashboard should support:<br>- Aggregate view from venues<br>- Detailed view |  |  |  |
| CRP-126<br>Basic Stipe integration with pay as you go model | Stripe Dashboard | Display usage and billing-related information.<br><br>Possible metrics:<br>- Total IDV checks<br>- Total payouts<br>- Total venues<br>- Usage breakdown by client/venue<br>- Subscription/payment status |  |  |  |
| CRP-125<br>Basic OCR functionality | *(Epic scope defined in Clarification - Epics)* | | | | |
| CRP-61<br>PEP & Sanctions Screening for Approver Decisioning | *(Epic scope defined in Clarification - Epics)* | | | | |
| CRP-61<br>PEP & Sanctions Screening for Approver Decisioning |  | UI enchancement need to cover in this epic<br>Functionality of this already done |  |  |  |
| CRP-68<br>PEP & Sanctions Screening for Approver Decisioning | *(Epic scope defined in Clarification - Epics)* | | | | |
