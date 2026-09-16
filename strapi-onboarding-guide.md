# Cruz Money — Strapi Admin Onboarding Guide
*Step-by-step data entry for test dataset: Riverside RSL Group*

---

## Onboarding Form → Strapi Admin Field Mapping

This section maps every field from the onboarding form to the exact field name as it appears in the Strapi admin **Client** entry form, in the order the form renders them.

> **Legend:**
> - ✅ Fill in — enter the value from the onboarding form
> - ⚙️ Auto-generated — leave blank; populated by lifecycle hook on save
> - ⏭️ Skip on first save — add in a separate save after the record exists
> - 🔗 Relation — managed separately (users via invite API, jackpots via app)
> - 👁️ Read-only — visible in admin but not editable

---

### Save 1 — Initial Client Record (includes bank details)

Fields visible in the Strapi form and what to do on the **first save**:

> Bank details are **required** in the Client schema — include them in this same save. Strapi will reject the save if you leave `bankDetails` empty.

| Strapi Admin Field | Onboarding Form Field | Action | Test Value |
|---|---|---|---|
| `name` *(required)* | Organisation Name | ✅ Fill in | `Riverside RSL Group` |
| `email` *(required)* | Venue Email Address | ✅ Fill in | `admin@riversidersl.com.au` |
| `numberOfApprovals` | Number of Approvers | ✅ Fill in | `2` |
| `dailyLimit` *(required)* | Maximum daily amount (org level) | ✅ Fill in | `50000` |
| `minWaitTime` *(required, 0–64)* | Number of Hours Delay | ✅ Fill in | `24` |
| `skipIdEnabled` | Frankie One — Turned on/off | ✅ Fill in | Toggle **True** |
| `skipIdThreshold` | — (skip threshold amount) | ✅ Fill in | `500` |
| `hasSuspiciousTransactionAnalysis` | — (AML screening) | ✅ Fill in | Toggle **True** |
| `noEFTPayout` → allowNoEFTPayout | — (cash payout config) | ✅ Fill in | Toggle **True** |
| `noEFTPayout` → noEFTLimit | — (cash payout limit) | ✅ Fill in | `500` |
| `bankDetails` → name | Bank Account Name | ✅ Fill in | `Riverside RSL Group Bank` |
| `bankDetails` → partyName | Bank Account Name (holder) | ✅ Fill in | `Riverside RSL Group` |
| `bankDetails` → bsb | BSB | ✅ Fill in | `032-001` |
| `bankDetails` → accountNumber | Account Number | ✅ Fill in | `123456789` |
| `bankDetails` → paymentClientBankDetailsId | — | ⚙️ Auto-generated | Never type this |
| `tenancyClientId` | — | ⚙️ Leave blank | Auto-filled after save |
| `clientId` | — | ⚙️ Auto-generated | Populated by lifecycle |
| `clientSecret` | — | ⚙️ Auto-generated | Populated by lifecycle |
| `delayUnresolvedPaymentItems` *(10–180)* | — | ✅ Leave default | `10` (default is fine) |
| `payToAgreement` → start | — | ⏭️ Skip | Add in Save 2 |
| `payToAgreement` → maxAmount | Maximum amount per transaction | ⏭️ Skip | Add in Save 2 |
| `payToAgreement` → status | — | ⚙️ Auto-set | Never change manually |
| `payToAgreement` → paymentPayToAgreementId | — | ⚙️ Auto-generated | Never type this |
| `logo` | Club Logo | ⏭️ Skip | Upload in a later save |
| `venues` | Venue Name(s) | ⏭️ Skip | Created separately in Steps 2–3 |
| `users` | Team Members (role assignments) | ⏭️ Skip | Done via invite API (Step 6) |
| `jackpots` | — | 🔗 Skip | Managed by the app |
| `client_notifications` | — | 🔗 Skip | System-managed |

---

### Save 2 — Set Up PayTo Agreement

Open the saved Client record. Scroll to **payToAgreement** → click **Reset entry** to expand it.

| Strapi Admin Field | Onboarding Form Field | Value |
|---|---|---|
| `payToAgreement` → start | — | Set to **True** |
| `payToAgreement` → maxAmount | Maximum amount per transaction | `15000` |
| `payToAgreement` → status | — | ⚙️ Auto-set to `pending` after save |
| `payToAgreement` → paymentPayToAgreementId | — | ⚙️ Auto-generated after save |

> After saving, set `start` back to **False** if it did not reset itself — the lifecycle sets it to False automatically, but verify before leaving the record.

---

### Fields with No Onboarding Form Equivalent

These Strapi fields exist but are not collected on the onboarding form:

| Strapi Admin Field | Purpose | What to do |
|---|---|---|
| `tenancyClientId` | Internal: links to Tenancy service | ⚙️ Auto-generated — never touch |
| `clientId` / `clientSecret` | Internal: API credentials for this client | ⚙️ Auto-generated — never touch |
| `paymentClientBankDetailsId` | Internal: links bank record in Payment Pillar | ⚙️ Auto-generated — never touch |
| `paymentPayToAgreementId` | Internal: links PayTo agreement in Payment Pillar | ⚙️ Auto-generated — never touch |
| `delayUnresolvedPaymentItems` | Days before unresolved items are delayed | Leave at default `10` |
| `users` relation | User-to-client assignment | Done via invite API in Step 6 |
| `venues` relation | Venues linked to this client | Auto-populated when Venues are created |
| `jackpots` relation | All payouts for this client | Auto-populated by the app |
| `client_notifications` relation | System alert records | System-managed |

---

### Onboarding Form Fields Not Yet in Strapi

These fields appear on the onboarding form but **have no corresponding field in the current Strapi schema**. They cannot be entered in admin today:

| Onboarding Form Field | Gap |
|---|---|
| ABN | No field in Client schema |
| Key Point of Contact (customer) — name, email, phone | No field in Client schema |
| Key Point of Contact (vendor) — name, email, phone | No field in Client schema |
| Devices to be Used | No field in Client schema |

---

## The Four Admin Panels

| Admin Panel | UAT URL | Role in Client Onboarding |
|---|---|---|
| **Payouts** | `https://payouts-uat-backend.cruz.tech/admin` | ✅ Main panel — create Client, Venues, Machines, invite Users |
| **Tenancy** | `https://cruz-control-uat-tenancy.cruz.tech/admin` | 🔧 Only used to clean up ghost records (Step 0) |
| **Payment** | `https://cruz-control-uat-payment.cruz.tech/admin` | 👁️ Read-only — bank details are auto-registered here when you save the Client in Payouts |
| **CDR** | CDR UAT URL | ❌ Not used for Payouts client onboarding |

> All lifecycle automation (Tenancy registration, Payment bank detail creation, Stripe customer creation) runs automatically when you save in Payouts. You never need to create records in Tenancy or Payment manually.

---

## Before You Start

**Critical constraints:**

1. **Stack must be fully running** — creating a Client or adding bank details to a Venue calls the Tenancy API and Payment API via lifecycle hooks. If either service is down, the save will fail. Confirm the full stack is up first.

2. **Creation order is strict:** Client → Venue → Machine → Users. You cannot create a Venue without a Client, or a Machine without a Venue.

3. **Client bank details go in the same (first) save** — `bankDetails` is required on the Client schema; Strapi will reject the save if you leave it blank. Include bank details in the initial Client creation.

4. **Venue bank details go in a second save** — the Venue must exist first so the lifecycle can find the parent client's credentials before calling the Payment API.

5. **PayTo agreements go in a separate save** — set `start = true` and `maxAmount` on an existing Client or Venue record, then save.

6. **Users cannot be created via Strapi admin** — the invite flow is a custom API endpoint (`POST /api/user-management/invite`). Use Postman, Bruno, or curl for this step.

**Fields to never type manually (auto-generated by lifecycle hooks):**
`clientId` · `clientSecret` · `tenancyClientId` · `paymentClientBankDetailsId` · `paymentPayToAgreementId` · `uuid`

---

## Strapi Admin Access

- **Local (dev):** `http://localhost:1337/admin`
- **UAT:** Use the UAT environment URL
- Log in with your Strapi admin credentials

---

## STEP 0 — Clean Up Ghost Records in Tenancy (if needed)

Before creating the Client in Payouts, check whether a ghost record exists in Tenancy from a previous failed attempt.

Go to `https://cruz-control-uat-tenancy.cruz.tech/admin`

1. Left sidebar → scroll to **Users-Permissions** section → click **Users**
   *(Not under Content Manager — it is a plugin section in the sidebar)*
2. Click **Filters** → field: `Email` → operator: `is` → value: `admin@riversidersl.com.au` → Apply
   *(The search bar does not search by email — you must use Filters)*
3. If a record exists → open it → click **Delete** → confirm
4. If no record → proceed to Step 1

> If a ghost exists and you skip this, the Client save in Step 1 will fail with "Client with email address already exists" every time.

---

## STEP 1 — Create the Client

Navigate to: **Content Manager → Client → + Create new entry**

Fill in **everything including bank details in this one save** — `bankDetails` is required and Strapi will reject the save if it is empty.

**Main fields:**

| Field | Value |
|---|---|
| Name | `Riverside RSL Group` |
| Email | `admin@riversidersl.com.au` |
| Number Of Approvals | `2` |
| Daily Limit | `50000` |
| Min Wait Time | `24` |
| Skip Id Enabled | toggle **ON** |
| Skip Id Threshold | `500` |
| Has Suspicious Transaction Analysis | toggle **ON** |

**No EFT Payout component — click "+ Add an entry":**

| Field | Value |
|---|---|
| Allow No EFT Payout | toggle **ON** |
| No EFT Limit | `500` |

**Bank Details component — click "+ Add an entry":**

| Field | Value |
|---|---|
| Name | `Riverside RSL Group Bank` |
| Party Name | `Riverside RSL Group` |
| BSB | `032001` |
| Account Number | `123456789` |

**Leave blank:** `tenancyClientId`, `clientId`, `clientSecret`, `paymentClientBankDetailsId` — auto-generated by lifecycle.

**Leave blank for now:** Pay To Agreement, Logo.

Click **Save**. The lifecycle calls Tenancy (registers client → gets `clientId`, `clientSecret`, `tenancyClientId`) and then calls Payment (registers bank account → gets `paymentClientBankDetailsId`). All fields auto-populate.

### Verify it worked:
Open the saved Client record and confirm:
- [ ] `tenancyClientId` is populated
- [ ] `clientId` is populated (format `ci_xxxxxxxxxxxx`)
- [ ] `clientSecret` is populated
- [ ] `bankDetails[0].paymentClientBankDetailsId` is populated

---

## STEP 1b — Upload the Logo *(optional separate save)*

Open the Client record. Scroll to **Logo** → click **Upload** → attach `riverside-rsl-logo.png`.

Click **Save**.

---

## STEP 2 — Create Venue 1 (Riverside RSL Club)

Navigate to: **Content Manager → Venue → + Create new entry**

| Field | Value |
|---|---|
| Name | `Riverside RSL Club` |
| Client | Select `Riverside RSL Group` |
| Daily Limit | `30000` |
| Min Wait Time | `24` |
| Skip Id Enabled | toggle **ON** |
| Skip Id Threshold | `500` |
| Has Suspicious Transaction Analysis | toggle **ON** |

**Leave blank for now:** Bank Details, Pay To Agreement, Users

Click **Save**.

---

## STEP 2b — Add Bank Details to Venue 1 *(separate save)*

Open Riverside RSL Club. Scroll to **Bank Details** → **+ Add a component**:

| Field | Value |
|---|---|
| Name | `Riverside RSL Club Bank` |
| Party Name | `Riverside RSL Group` |
| BSB | `032-001` |
| Account Number | `123456789` |

Click **Save**. The lifecycle uses the parent Client's credentials to register the account with the Payment API.

---

## STEP 2c — Set Up PayTo Agreement for Venue 1 *(separate save)*

Open Riverside RSL Club. Scroll to **Pay To Agreement**:

| Field | Value |
|---|---|
| Start | tick **ON** |
| Max Amount | `15000` |

Click **Save**. The lifecycle detects `start = true`, calls the Payment API to create the agreement, then sets `start` back to `false` and populates `status: pending` and `paymentPayToAgreementId` automatically.

> The agreement status starts as `pending` and moves to `active` once the bank confirms. Refresh the record to check progress.

---

## STEP 3 — Create Venue 2 (Northside Sports Club)

Navigate to: **Content Manager → Venue → + Create new entry**

| Field | Value |
|---|---|
| Name | `Northside Sports Club` |
| Client | Select `Riverside RSL Group` |
| Daily Limit | `30000` |
| Min Wait Time | `24` |
| Skip Id Enabled | toggle **ON** |
| Skip Id Threshold | `500` |
| Has Suspicious Transaction Analysis | toggle **ON** |

Click **Save**.

---

## STEP 3b — Add Bank Details to Venue 2 *(separate save)*

Open Northside Sports Club. Scroll to **Bank Details** → **+ Add a component**:

| Field | Value |
|---|---|
| Name | `Northside Sports Club Bank` |
| Party Name | `Riverside RSL Group` |
| BSB | `032-001` |
| Account Number | `123456789` |

Click **Save**.

---

## STEP 3c — Set Up PayTo Agreement for Venue 2 *(separate save)*

Open Northside Sports Club. Scroll to **Pay To Agreement**:

| Field | Value |
|---|---|
| Start | tick **ON** |
| Max Amount | `15000` |

Click **Save**.

---

## STEP 4 — Create Machines for Venue 1 (Riverside RSL Club)

Navigate to: **Content Manager → Machine → + Create new entry**

For each machine below: enter **Name**, **Serial Number**, **Machine ID**, set **Status** = `active`, set **Venue** = `Riverside RSL Club`.

| Machine ID | Serial Number | Name |
|---|---|---|
| EGM-001 | SN-AR-00112 | Aristocrat Lightning Link 1 |
| EGM-002 | SN-AR-00113 | Aristocrat Lightning Link 2 |
| EGM-003 | SN-AR-00114 | Aristocrat Lightning Link 3 |
| EGM-004 | SN-IGT-2201 | IGT Wheel of Fortune 1 |
| EGM-005 | SN-IGT-2202 | IGT Wheel of Fortune 2 |
| EGM-006 | SN-KON-3301 | Konami Dragon Link 1 |
| EGM-007 | SN-KON-3302 | Konami Dragon Link 2 |
| EGM-008 | SN-SCI-4401 | Scientific Games Monopoly |
| EGM-009 | SN-EVE-5501 | Everi Fortune Coin 1 |
| EGM-010 | SN-EVE-5502 | Everi Fortune Coin 2 |
| EGM-011 | SN-AR-00221 | Aristocrat Buffalo 1 |
| EGM-012 | SN-AR-00222 | Aristocrat Buffalo 2 |

12 save operations total — click Save after each one.

---

## STEP 5 — Create Machines for Venue 2 (Northside Sports Club)

Same process. Set **Venue** = `Northside Sports Club` for all of these:

| Machine ID | Serial Number | Name |
|---|---|---|
| EGM-013 | SN-AR-00331 | Aristocrat Wild Panda 1 |
| EGM-014 | SN-AR-00332 | Aristocrat Wild Panda 2 |
| EGM-015 | SN-IGT-3301 | IGT Double Diamond 1 |
| EGM-016 | SN-IGT-3302 | IGT Double Diamond 2 |
| EGM-017 | SN-KON-4401 | Konami China Shores |
| EGM-018 | SN-SCI-5501 | Scientific Games Zeus |
| EGM-019 | SN-EVE-6601 | Everi Black Diamond |
| EGM-020 | SN-AR-00441 | Aristocrat Timber Wolf |

8 save operations total.

---

## STEP 6 — Create Users (Payouts Admin)

Navigate to: **`https://payouts-uat-backend.cruz.tech/admin` → Settings → Users & Permissions Plugin → Users → + Create new entry**

For each user below, fill in the fields and click **Save**.

---

### Understanding the key fields:

**`confirmed`** — controls whether the user can log in. Strapi blocks login for any user with `confirmed = false`. When users are invited via email they confirm by clicking the link; since you're creating them manually here, you must toggle this to **True** yourself or the account will exist but the person cannot sign in.

**`blocked`** — temporarily suspends a user. Leave **False**.

**`role`** — the Strapi platform role (e.g. Authenticated, Public). This is separate from the app roles below. Select **Authenticated**.

**App role booleans** — these control what the user can do inside the Cruz Money app:

| Boolean field | App role | What they do |
|---|---|---|
| `collector` | Collector | Frontline staff — captures winner details, runs ID verification, enters bank details, submits payout |
| `approver` | Approver | Supervisor — reviews risk ratings, handles CoP exceptions, investigates SMRs |
| `authoriser` | Authoriser | Senior management — final sign-off to release payment |
| `admin` | Venue Admin | IT/management — manages EGM registry (machines + serial numbers) and toggles venue compliance config (Skip IDV, Medicare) |

Set exactly one boolean to **True** per user. Leave the others **False**.

---

### Fields to fill for every user:

| Field | What to enter |
|---|---|
| `username` | Use the email prefix (e.g. `m.santos`) |
| `email` | The user's email address |
| `password` | Set a known test password (e.g. `Qwer123@`) |
| `confirmed` | Toggle **True** — required or the user cannot log in |
| `blocked` | Leave **False** |
| `role` | Select **Authenticated** |
| `collector` / `approver` / `authoriser` / `admin` | Set exactly one to **True** |
| `client` | Select **Riverside RSL Group** |
| `venues` | Select the venue(s) this user belongs to |

---

### Venue 1 — Riverside RSL Club (5 users):

| Username | Email | collector | approver | authoriser | admin | venues |
|---|---|---|---|---|---|---|
| `m.santos` | `m.santos@riversidersl.com.au` | ✅ | — | — | — | Riverside RSL Club |
| `j.chen` | `j.chen@riversidersl.com.au` | ✅ | — | — | — | Riverside RSL Club |
| `d.walsh` | `d.walsh@riversidersl.com.au` | — | ✅ | — | — | Riverside RSL Club |
| `k.lee` | `k.lee@riversidersl.com.au` | — | ✅ | — | — | Riverside RSL Club |
| `r.nguyen` | `r.nguyen@riversidersl.com.au` | — | — | ✅ | — | Riverside RSL Club + Northside Sports Club |

### Venue 2 — Northside Sports Club (4 new users):

| Username | Email | collector | approver | authoriser | admin | venues |
|---|---|---|---|---|---|---|
| `p.sharma` | `p.sharma@riversidersl.com.au` | ✅ | — | — | — | Northside Sports Club |
| `t.obrien` | `t.obrien@riversidersl.com.au` | ✅ | — | — | — | Northside Sports Club |
| `h.park` | `h.park@riversidersl.com.au` | — | ✅ | — | — | Northside Sports Club |
| `c.watts` | `c.watts@riversidersl.com.au` | — | ✅ | — | — | Northside Sports Club |

### Venue Admin (1 user — manages both venues):

| Username | Email | collector | approver | authoriser | admin | venues |
|---|---|---|---|---|---|---|
| `venue.admin` | `admin@riversidersl.com.au` | — | — | — | ✅ | Riverside RSL Club + Northside Sports Club |

> The Venue Admin manages EGM machines and venue compliance config — they do not process payouts. They can see both venues.

> Robert Nguyen is shared across both venues — set **both** venues in his `venues` field in one save.

---

### Minimum setup — 4 users to test every role:

Create these four first to cover the full workflow end-to-end:

| Username | Email | Role | Venue |
|---|---|---|---|
| `m.santos` | `m.santos@riversidersl.com.au` | `collector = true` | Riverside RSL Club |
| `d.walsh` | `d.walsh@riversidersl.com.au` | `approver = true` | Riverside RSL Club |
| `r.nguyen` | `r.nguyen@riversidersl.com.au` | `authoriser = true` | Riverside RSL Club |
| `venue.admin` | `admin@riversidersl.com.au` | `admin = true` | Riverside RSL Club + Northside Sports Club |

Flow: **Collector** submits → **Approver** reviews + approves → **Authoriser** releases payment → **Venue Admin** manages EGMs and venue settings independently.

---

## STEP 7 — Set Collector IP Allowlist *(optional — for scenario ES-07)*

Navigate to: **Settings → Users & Permissions Plugin → Users** → open each Collector's record.

Set the **`collectorIpAllowlist`** field to the test IP range, e.g. `203.0.113.0/24`.

Apply to: Maria Santos (`m.santos`), Jake Chen (`j.chen`), Priya Sharma (`p.sharma`), Tom O'Brien (`t.obrien`).

---

## STEP 8 — Verification Checklist

Run through this before starting any payout testing:

### Client
- [ ] `tenancyClientId` populated (not empty)
- [ ] `clientId` and `clientSecret` populated
- [ ] Bank details: 1 record, `paymentClientBankDetailsId` populated
- [ ] `numberOfApprovals` = 2
- [ ] `minWaitTime` = 24
- [ ] `dailyLimit` = 50000
- [ ] `skipIdEnabled` = true, `skipIdThreshold` = 500
- [ ] `noEFTPayout.allowNoEFTPayout` = true, `noEFTLimit` = 500
- [ ] Logo uploaded

### Venues
- [ ] Riverside RSL Club linked to Riverside RSL Group
- [ ] Northside Sports Club linked to Riverside RSL Group
- [ ] Both have bank details with `paymentClientBankDetailsId` populated
- [ ] Both have `payToAgreement` with `paymentPayToAgreementId` populated
- [ ] Both: `dailyLimit` = 30000, `minWaitTime` = 24

### Machines
- [ ] 12 machines under Riverside RSL Club (EGM-001 – EGM-012), all `status: active`
- [ ] 8 machines under Northside Sports Club (EGM-013 – EGM-020), all `status: active`

### Users
- [ ] At minimum 4 users: one Collector, one Approver, one Authoriser, one Venue Admin
- [ ] Each user: `confirmed = true`, `blocked = false`, `role = Authenticated`
- [ ] Each user has exactly one role boolean set to `true` (`collector` / `approver` / `authoriser` / `admin`)
- [ ] Each user linked to the correct venue(s) via the `venues` relation
- [ ] Each user linked to `Riverside RSL Group` via the `client` relation
- [ ] Robert Nguyen (`r.nguyen`) and Venue Admin have both venues selected

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| Client save fails with "email already exists" | Ghost user in Tenancy from a previous failed attempt | Go to Tenancy admin → Users-Permissions section → Users → Filters → Email is `admin@riversidersl.com.au` → delete the ghost → retry Step 1 |
| Client save fails with Tenancy API error | Tenancy service is down | Check `TENANCY_URL` env var; confirm Tenancy service is running |
| Client save fails with Payment API error | Payment service is down or Zepto credentials not configured | Confirm Payment Pillar service is running; check Payment service logs for Zepto error details |
| Client save fails — Strapi validation error | `bankDetails` left empty | `bankDetails` is required — add a bank detail entry in the same save (do not leave it empty) |
| `paymentClientBankDetailsId` empty after save | Payment lifecycle call failed | Check Payment Pillar logs; confirm `tenancyClientId` was auto-populated |
| PayTo agreement save fails | Client credentials not yet set | Ensure the Client was saved successfully (Step 1) and `clientId`/`clientSecret` are populated before doing the PayTo save |
| Machine save fails | Venue is in Draft state | Publish the Venue in Strapi before creating machines |
| Invite API returns 401 | Admin JWT expired | Re-authenticate at `/api/auth/local` and use the fresh token |
| Invite email not received | Email not configured in dev | Check Strapi server logs for the printed invite URL |
| `paymentPayToAgreementId` stays empty | PayTo agreement creation failed | Check Payment Pillar logs; ensure `maxAmount` was set before saving |
