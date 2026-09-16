const fs = require('fs');
const path = require('path');

const approver3Path = path.join(__dirname, 'approver3.html');

const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payout Approval - Payout #578</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>

    <style>
        body, html {
            background-color: #eef2f6 !important;
            color: #0f172a;
            font-family: 'Plus Jakarta Sans', sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        .font-mono {
            font-family: 'JetBrains Mono', monospace;
        }

        /* Form Builder Card Container */
        .form-builder-shell {
            max-width: 1020px;
            margin: 2rem auto;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 1.75rem;
            box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08);
            overflow: hidden;
        }

        /* Soft Input Boxes */
        .soft-input {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            padding: 0.625rem 0.875rem;
            font-size: 0.875rem;
            color: #0f172a;
            width: 100%;
            outline: none;
            transition: all 0.15s ease;
        }
        .soft-input:focus {
            background-color: #ffffff;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        /* Soft Cards */
        .builder-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 1.25rem;
            padding: 1.5rem;
            margin-bottom: 1.25rem;
        }

        /* Primary Action Button */
        .btn-primary-blue {
            background-color: #2563eb;
            color: #ffffff;
            font-weight: 700;
            font-size: 0.9375rem;
            border-radius: 0.875rem;
            padding: 0.875rem 1.5rem;
            width: 100%;
            text-align: center;
            border: none;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
            transition: all 0.15s ease;
            cursor: pointer;
        }
        .btn-primary-blue:hover:not(:disabled) {
            background-color: #1d4ed8;
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
            transform: translateY(-1px);
        }
        .btn-primary-blue:disabled {
            background-color: #94a3b8 !important;
            box-shadow: none !important;
            cursor: not-allowed;
            opacity: 0.7;
        }

        /* Action Required Pill Buttons */
        .pill-action-amber {
            background-color: #fffbeb;
            color: #b45309;
            border: 1px solid #fde68a;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 0.75rem;
            padding: 0.375rem 1rem;
            transition: all 0.15s ease;
            cursor: pointer;
        }
        .pill-action-amber:hover {
            background-color: #fef3c7;
        }

        .pill-pass {
            background-color: #ecfdf5;
            color: #047857;
            border: 1px solid #a7f3d0;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 0.75rem;
            padding: 0.25rem 0.75rem;
        }

        /* Risk Buttons */
        .risk-btn {
            border: 1px solid #cbd5e1;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.75rem;
            font-weight: 700;
            color: #475569;
            background: #ffffff;
            transition: all 0.15s ease;
            cursor: pointer;
            flex: 1;
        }
        .risk-btn.active-Low {
            background-color: #ecfdf5;
            color: #047857;
            border-color: #6ee7b7;
        }
        .risk-btn.active-Medium {
            background-color: #fffbeb;
            color: #b45309;
            border-color: #fde68a;
        }
        .risk-btn.active-High {
            background-color: #fef2f2;
            color: #b91c1c;
            border-color: #fca5a5;
        }
    </style>
</head>
<body class="p-4 sm:p-6">

    <!-- Form Builder Centered Container Shell -->
    <div class="form-builder-shell">
        
        <!-- Header Bar -->
        <div class="px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-white flex-wrap gap-4">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    P
                </div>
                <div>
                    <h1 class="text-xl font-extrabold text-slate-900 flex items-center gap-3">
                        Payout Authorization #578
                        <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Awaiting Approval</span>
                    </h1>
                    <p class="text-xs text-slate-500 font-medium mt-0.5">14/07/2026, 7:09:22 am • Riverside Hotel Payouts</p>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <button type="button" id="collapse-all-btn" onclick="toggleAllCards()" class="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1.5 border border-slate-200">
                    <span>Collapse All</span><span class="text-[10px]">▲</span>
                </button>
            </div>
        </div>

        <!-- Form Builder Content Area -->
        <div class="p-6 sm:p-8 space-y-6">

            <!-- Section 1: Member Details -->
            <div id="member-details" class="builder-card card-collapsible">
                <div class="card-header flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-3 cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                            MD
                        </div>
                        <div>
                            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                                Member &amp; Payout Details
                                <span class="card-toggle-icon text-xs text-slate-400 font-bold">▲</span>
                            </h2>
                            <p class="text-xs text-slate-500">Player identification and transaction parameters</p>
                        </div>
                    </div>
                    <span class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">ID: 3829F</span>
                </div>

                <div class="card-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                        <input type="text" value="STACY K TESTTWENTY" class="soft-input font-bold" readonly />
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                        <input type="text" value="stacy@gmail.com" class="soft-input font-mono" readonly />
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Membership ID *</label>
                        <input type="text" value="3829F" class="soft-input font-mono" readonly />
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Cash Amount ($) *</label>
                        <input type="text" value="500.00" class="soft-input font-mono font-bold text-slate-900" readonly />
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Transfer Amount ($) *</label>
                        <input type="text" value="1000.00" class="soft-input font-mono font-bold text-blue-600" readonly />
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Internal Transaction ID / Machine ID *</label>
                        <input type="text" value="#213 / EGM-002" class="soft-input font-mono" readonly />
                    </div>
                </div>
            </div>

            <!-- Section 2: Identification Details Breakdown -->
            <div class="builder-card card-collapsible">
                <div class="card-header flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-3 cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                            ID
                        </div>
                        <div>
                            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                                Identification Verification Checks
                                <span class="card-toggle-icon text-xs text-slate-400 font-bold">▲</span>
                            </h2>
                            <p class="text-xs text-slate-500">Document and biometric verification parameters</p>
                        </div>
                    </div>
                    <span class="pill-pass">ALL PASS</span>
                </div>

                <div class="card-body grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs text-center">
                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span class="text-[10px] text-slate-500 block uppercase font-sans mb-1">Government ID</span>
                        <strong class="text-emerald-600">PASS</strong>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span class="text-[10px] text-slate-500 block uppercase font-sans mb-1">ID Validation</span>
                        <strong class="text-emerald-600">PASS</strong>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span class="text-[10px] text-slate-500 block uppercase font-sans mb-1">Blacklist</span>
                        <strong class="text-emerald-600">PASS</strong>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span class="text-[10px] text-slate-500 block uppercase font-sans mb-1">Name Match</span>
                        <strong class="text-emerald-600">PASS</strong>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span class="text-[10px] text-slate-500 block uppercase font-sans mb-1">DOB Match</span>
                        <strong class="text-emerald-600">PASS</strong>
                    </div>
                </div>
            </div>

            <!-- Section 3: AML Screening -->
            <div id="aml-section" class="builder-card card-collapsible">
                <div class="card-header flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-3 cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                            AML
                        </div>
                        <div>
                            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                                AML Screening &amp; Match Resolution
                                <span class="card-toggle-icon text-xs text-slate-400 font-bold">▲</span>
                            </h2>
                            <p class="text-xs text-slate-500">Compliance watchlist and PEP checks</p>
                        </div>
                    </div>

                    <!-- Live Scenario Switcher -->
                    <div class="flex items-center bg-white p-1 rounded-full border border-blue-200 shadow-sm" onclick="event.stopPropagation()">
                        <button onclick="switchAMLScenario('hit')" id="btn-scen-hit" class="px-3 py-1 text-xs font-bold rounded-full bg-blue-600 text-white transition-all">All Hits</button>
                        <button onclick="switchAMLScenario('mixed')" id="btn-scen-mixed" class="px-3 py-1 text-xs font-bold rounded-full text-slate-600 hover:text-slate-900 transition-all">Mixed</button>
                        <button onclick="switchAMLScenario('clear')" id="btn-scen-clear" class="px-3 py-1 text-xs font-bold rounded-full text-slate-600 hover:text-slate-900 transition-all">All Clear</button>
                    </div>
                </div>

                <div class="card-body space-y-4">
                    <!-- PEP Item -->
                    <div class="bg-white p-4 rounded-xl border border-blue-200/80 shadow-sm flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div id="pep-icon-bg" class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">!</div>
                            <div>
                                <h4 id="pep-title" class="font-bold text-slate-900 text-sm">PEP - Active Hits</h4>
                                <p id="pep-subtitle" class="text-xs text-slate-500">Possible Match Detected in WorldCheck</p>
                            </div>
                        </div>
                        <div id="pep-action-container">
                            <button type="button" id="pep-action-btn" class="pill-action-amber" onclick="openDetailsModal(&quot;pep&quot;)">Action Required</button>
                        </div>
                    </div>

                    <!-- Sanctions Item -->
                    <div class="bg-white p-4 rounded-xl border border-blue-200/80 shadow-sm flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div id="sanc-icon-bg" class="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center font-bold">!</div>
                            <div>
                                <h4 id="sanc-title" class="font-bold text-slate-900 text-sm">Sanctions - Active Hits</h4>
                                <p id="sanc-subtitle" class="text-xs text-slate-500">Possible Match Detected in Global Watchlist</p>
                            </div>
                        </div>
                        <div id="sanc-action-container">
                            <button type="button" id="sanctions-action-btn" class="pill-action-amber" onclick="openDetailsModal(&quot;sanctions&quot;)">Action Required</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section 4: Identity Verification (IDV) History -->
            <div id="idv-section" class="builder-card card-collapsible">
                <div class="card-header flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-3 cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                            TR
                        </div>
                        <div>
                            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                                Identity Verification (IDV) History
                                <span class="card-toggle-icon text-xs text-slate-400 font-bold">▲</span>
                            </h2>
                            <p class="text-xs text-slate-500">Verification log history</p>
                        </div>
                    </div>
                    <span class="pill-pass">PASS</span>
                </div>

                <div class="card-body overflow-x-auto">
                    <table class="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr class="text-xs uppercase text-slate-400 border-b border-slate-200">
                                <th class="py-2.5 pr-4 font-semibold">Document &amp; Service</th>
                                <th class="py-2.5 pr-4 font-semibold">Date &amp; Time</th>
                                <th class="py-2.5 font-semibold">Result</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 font-mono text-xs">
                            <tr>
                                <td class="py-3 pr-4 font-semibold text-slate-800">Australia Passport IDV</td>
                                <td class="py-3 pr-4 text-slate-500">14 July 2026, 11:41 am</td>
                                <td class="py-3"><span class="text-emerald-600 font-bold">PASS</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Section 5: Collector Profile -->
            <div class="builder-card card-collapsible">
                <div class="card-header flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-3 cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                            CP
                        </div>
                        <div>
                            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                                Collector Profile
                                <span class="card-toggle-icon text-xs text-slate-400 font-bold">▲</span>
                            </h2>
                            <p class="text-xs text-slate-500">Authorized personnel assignment</p>
                        </div>
                    </div>
                    <span class="text-xs text-slate-500 font-mono">14/07/2026 07:12am</span>
                </div>
                <div class="card-body flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm border border-slate-200">
                        MS
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-900 text-sm">m.santos</h4>
                        <p class="text-xs text-slate-500">Authorized Collector</p>
                    </div>
                </div>
            </div>

            <!-- Section 6: Approvals Workflow -->
            <div id="approvals-section" class="builder-card card-collapsible border-2 border-slate-300">
                <div class="card-header flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-3 cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                            AP
                        </div>
                        <div>
                            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                                Approvals &amp; Final Authorization
                                <span class="card-toggle-icon text-xs text-slate-400 font-bold">▲</span>
                            </h2>
                            <p class="text-xs text-slate-500">Review discrepancies and authorize payout</p>
                        </div>
                    </div>
                    <span class="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">CoP Status: Match</span>
                </div>

                <div class="card-body space-y-6">
                    
                    <!-- ID Name Discrepancy Warning Box -->
                    <div class="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-bold text-red-900">ID Name Match:</span>
                            <span class="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200">✕ No Match</span>
                        </div>
                        <p class="text-xs text-red-900 leading-relaxed">
                            The name on the bank account does not match the name on the identity document. Please review the name comparison above and confirm if acceptable.
                        </p>
                        <div class="flex items-start gap-2 pt-1">
                            <input type="checkbox" id="idConfirm" onchange="checkApprovalState()" class="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5 cursor-pointer">
                            <label for="idConfirm" class="font-semibold text-xs text-red-900 cursor-pointer">
                                I have reviewed the names and confirm the difference is acceptable.
                            </label>
                        </div>
                    </div>

                    <!-- Risk Level Selection -->
                    <div>
                        <label class="block font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Risk Level Selection *</label>
                        <input type="hidden" id="approvalRiskLevel" value="Low">
                        <div class="flex gap-3">
                            <button type="button" class="risk-btn active-Low" id="risk-btn-Low" onclick="setRiskLevel('Low')">🟢 Low Risk</button>
                            <button type="button" class="risk-btn" id="risk-btn-Medium" onclick="setRiskLevel('Medium')">🟡 Medium Risk</button>
                            <button type="button" class="risk-btn" id="risk-btn-High" onclick="setRiskLevel('High')">🔴 High Risk</button>
                        </div>
                    </div>

                    <!-- Approval Confirmation Checkbox -->
                    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                        <input type="checkbox" id="approvalConfirm" onchange="checkApprovalState()" class="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer">
                        <label for="approvalConfirm" class="font-bold text-xs text-slate-800 cursor-pointer">
                            I confirm approval of this payout.
                        </label>
                    </div>

                    <!-- Primary Approve Payout Button -->
                    <div>
                        <button type="button" id="approve-btn" class="btn-primary-blue" disabled onclick="executeApproval()">
                            Approve Payout
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <!-- Match Resolution Modal -->
    <div id="details-modal" style="display: none; position: fixed; inset: 0; z-index: 99999; align-items: center; justify-content: center; background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(6px);">
        <div class="w-full max-w-2xl mx-4 overflow-hidden flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200" style="max-height: 90vh;">
            
            <div class="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
                <h3 class="font-bold text-lg text-slate-900" id="modal-title">Resolve Match</h3>
                <button onclick="closeDetailsModal()" class="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>

            <div class="p-6 overflow-y-auto flex-1 space-y-6">
                <!-- PEP Content -->
                <div id="pep-modal-content" style="display: none; flex-direction: column; gap: 1.5rem;">
                    <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs">
                        <div>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Player Profile</span>
                            <div class="mt-2 space-y-1">
                                <div><span class="text-slate-500">Name:</span> <strong class="text-slate-900">STACY K TESTTWENTY</strong></div>
                                <div><span class="text-slate-500">DOB:</span> <strong class="text-slate-900">15/08/1980</strong></div>
                                <div><span class="text-slate-500">Country:</span> <strong class="text-slate-900">Australia (AU)</strong></div>
                            </div>
                        </div>
                        <div>
                            <span class="text-[10px] font-bold text-amber-600 uppercase tracking-wider font-sans">WorldCheck Profile</span>
                            <div class="mt-2 space-y-1">
                                <div><span class="text-slate-500">Match Type:</span> <strong class="text-amber-700">Fuzzy Match</strong></div>
                                <div><span class="text-slate-500">Name:</span> <strong class="text-slate-900">Stacy Test-Twenty</strong></div>
                                <div><span class="text-slate-500">DOB:</span> <strong class="text-slate-900">15/08/1980</strong></div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">Determination</label>
                        <input type="hidden" id="pep-status" value="">
                        <div class="flex gap-3">
                            <button type="button" id="btn-pep-match" onclick="setPEPStatus('match')" class="px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100">Confirm Match</button>
                            <button type="button" id="btn-pep-false" onclick="setPEPStatus('false_positive')" class="px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100">Disprove - False Positive</button>
                        </div>
                    </div>

                    <div>
                        <label class="block font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">Investigation Notes *</label>
                        <textarea id="pep-notes" rows="3" class="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-blue-600 focus:outline-none" placeholder="Detail determination reasoning..."></textarea>
                    </div>
                </div>

                <!-- Sanctions Content -->
                <div id="sanctions-modal-content" style="display: none; flex-direction: column; gap: 1.5rem;">
                    <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs">
                        <div>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Player Profile</span>
                            <div class="mt-2 space-y-1">
                                <div><span class="text-slate-500">Name:</span> <strong class="text-slate-900">STACY K TESTTWENTY</strong></div>
                                <div><span class="text-slate-500">DOB:</span> <strong class="text-slate-900">15/08/1980</strong></div>
                            </div>
                        </div>
                        <div>
                            <span class="text-[10px] font-bold text-red-600 uppercase tracking-wider font-sans">Watchlist Record</span>
                            <div class="mt-2 space-y-1">
                                <div><span class="text-slate-500">Match Type:</span> <strong class="text-red-700">Token Match</strong></div>
                                <div><span class="text-slate-500">Name:</span> <strong class="text-slate-900">STACY TEST</strong></div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">Determination</label>
                        <input type="hidden" id="sanctions-status" value="">
                        <div class="flex gap-3">
                            <button type="button" id="btn-sanc-match" onclick="setSanctionsStatus('match')" class="px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100">Confirm Match</button>
                            <button type="button" id="btn-sanc-false" onclick="setSanctionsStatus('false_positive')" class="px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100">Disprove - False Positive</button>
                        </div>
                    </div>

                    <div>
                        <label class="block font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">Investigation Notes *</label>
                        <textarea id="sanctions-notes" rows="3" class="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-blue-600 focus:outline-none" placeholder="Detail determination reasoning..."></textarea>
                    </div>
                </div>
            </div>

            <div class="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button onclick="closeDetailsModal()" class="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md hover:bg-blue-700 transition-colors">Save &amp; Close</button>
            </div>
        </div>
    </div>

    <!-- Native Interactive JS -->
    <script>
        let isAllCollapsed = false;

        function toggleAllCards() {
            isAllCollapsed = !isAllCollapsed;
            const btn = document.getElementById('collapse-all-btn');
            const cardBodies = document.querySelectorAll('.card-body');
            const icons = document.querySelectorAll('.card-toggle-icon');
            
            cardBodies.forEach(body => {
                body.style.display = isAllCollapsed ? 'none' : '';
            });

            icons.forEach(icon => {
                icon.style.transform = isAllCollapsed ? 'rotate(180deg)' : 'rotate(0deg)';
            });

            if (btn) {
                const textSpan = btn.querySelector('span:first-child');
                const iconSpan = btn.querySelector('span:last-child');
                if (textSpan) textSpan.textContent = isAllCollapsed ? 'Expand All' : 'Collapse All';
                if (iconSpan) iconSpan.textContent = isAllCollapsed ? '▼' : '▲';
            }
        }

        // Card header click to toggle card body
        document.addEventListener('DOMContentLoaded', function() {
            const cardHeaders = document.querySelectorAll('.card-header');
            cardHeaders.forEach(header => {
                header.addEventListener('click', function(e) {
                    // Ignore clicks on buttons/inputs inside header
                    if (e.target.closest('button') || e.target.closest('input')) return;
                    
                    const card = header.closest('.card-collapsible');
                    if (card) {
                        const body = card.querySelector('.card-body');
                        const icon = header.querySelector('.card-toggle-icon');
                        if (body) {
                            const isHidden = body.style.display === 'none';
                            body.style.display = isHidden ? '' : 'none';
                            if (icon) icon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
                        }
                    }
                });
            });
            checkApprovalState();
        });

        function setRiskLevel(level) {
            document.getElementById('approvalRiskLevel').value = level;
            ['Low', 'Medium', 'High'].forEach(r => {
                const b = document.getElementById('risk-btn-' + r);
                if (b) {
                    if (r === level) {
                        b.className = 'risk-btn active-' + r;
                    } else {
                        b.className = 'risk-btn';
                    }
                }
            });
            checkApprovalState();
        }

        function checkApprovalState() {
            const idConfirm = document.getElementById('idConfirm').checked;
            const approvalConfirm = document.getElementById('approvalConfirm').checked;
            const pepStatus = document.getElementById('pep-status').value;
            const pepNotes = document.getElementById('pep-notes') ? document.getElementById('pep-notes').value.trim() : '';
            const sancStatus = document.getElementById('sanctions-status').value;
            const sancNotes = document.getElementById('sanctions-notes') ? document.getElementById('sanctions-notes').value.trim() : '';
            
            const btn = document.getElementById('approve-btn');
            if (!btn) return;

            let amlValid = true;
            if (pepStatus === 'match' && !pepNotes) amlValid = false;
            if (sancStatus === 'match' && !sancNotes) amlValid = false;

            if (idConfirm && approvalConfirm && amlValid) {
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
        }

        function executeApproval() {
            alert('Payout #578 Approved successfully!');
        }

        function openDetailsModal(type) {
            const modal = document.getElementById('details-modal');
            if (!modal) return;
            modal.style.display = 'flex';
            document.getElementById('pep-modal-content').style.display = type === 'pep' ? 'flex' : 'none';
            document.getElementById('sanctions-modal-content').style.display = type === 'sanctions' ? 'flex' : 'none';
            document.getElementById('modal-title').innerText = type === 'pep' ? 'Resolve Match: PEP' : 'Resolve Match: Sanctions';
        }

        function closeDetailsModal() {
            const modal = document.getElementById('details-modal');
            if (modal) modal.style.display = 'none';
        }

        function setPEPStatus(val) {
            document.getElementById('pep-status').value = val;
            document.getElementById('btn-pep-match').className = val === 'match' ? 'px-4 py-2 text-xs font-bold border border-red-300 rounded-full text-white bg-red-600' : 'px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100';
            document.getElementById('btn-pep-false').className = val === 'false_positive' ? 'px-4 py-2 text-xs font-bold border border-emerald-300 rounded-full text-white bg-emerald-600' : 'px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100';
            checkApprovalState();
        }

        function setSanctionsStatus(val) {
            document.getElementById('sanctions-status').value = val;
            document.getElementById('btn-sanc-match').className = val === 'match' ? 'px-4 py-2 text-xs font-bold border border-red-300 rounded-full text-white bg-red-600' : 'px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100';
            document.getElementById('btn-sanc-false').className = val === 'false_positive' ? 'px-4 py-2 text-xs font-bold border border-emerald-300 rounded-full text-white bg-emerald-600' : 'px-4 py-2 text-xs font-bold border border-slate-200 rounded-full text-slate-700 bg-white hover:bg-slate-100';
            checkApprovalState();
        }

        function switchAMLScenario(scenario) {
            const btns = ['hit', 'mixed', 'clear'];
            btns.forEach(b => {
                const btn = document.getElementById('btn-scen-' + b);
                if (btn) {
                    btn.className = b === scenario ? 'px-3 py-1 text-xs font-bold rounded-full bg-blue-600 text-white transition-all' : 'px-3 py-1 text-xs font-bold rounded-full text-slate-600 hover:text-slate-900 transition-all';
                }
            });

            const pepContainer = document.getElementById('pep-action-container');
            const sancContainer = document.getElementById('sanc-action-container');

            if (scenario === 'hit') {
                if (pepContainer) pepContainer.innerHTML = '<button type="button" id="pep-action-btn" class="pill-action-amber" onclick="openDetailsModal(&quot;pep&quot;)">Action Required</button>';
                if (sancContainer) sancContainer.innerHTML = '<button type="button" id="sanctions-action-btn" class="pill-action-amber" onclick="openDetailsModal(&quot;sanctions&quot;)">Action Required</button>';
            } else if (scenario === 'mixed') {
                if (pepContainer) pepContainer.innerHTML = '<button type="button" class="pill-pass cursor-pointer hover:bg-emerald-100 transition-colors" onclick="openDetailsModal(&quot;pep&quot;)">PASS</button>';
                if (sancContainer) sancContainer.innerHTML = '<button type="button" id="sanctions-action-btn" class="pill-action-amber" onclick="openDetailsModal(&quot;sanctions&quot;)">Action Required</button>';
            } else if (scenario === 'clear') {
                if (pepContainer) pepContainer.innerHTML = '<button type="button" class="pill-pass cursor-pointer hover:bg-emerald-100 transition-colors" onclick="openDetailsModal(&quot;pep&quot;)">PASS</button>';
                if (sancContainer) sancContainer.innerHTML = '<button type="button" class="pill-pass cursor-pointer hover:bg-emerald-100 transition-colors" onclick="openDetailsModal(&quot;sanctions&quot;)">PASS</button>';
            }
            checkApprovalState();
        }
    </script>
</body>
</html>`;

fs.writeFileSync(approver3Path, fullHTML);
console.log('Successfully applied 100% consistent section headers in approver3.html');
