# Winning Tickets Image Upload Component - Integration Guide

This guide details how to integrate the new premium, high-resolution **Winning Tickets Verification** component into the main `Approver/approver.html` dashboard.

---

## 📂 Component Files

All component assets are located in the `/component` folder:
- **HTML Structure**: [ticket-upload.html](file:///f:/Cruz%20Money/Git%20Cruz/Palxi-Temp/component/ticket-upload.html)
- **Custom Styles**: [ticket-upload.css](file:///f:/Cruz%20Money/Git%20Cruz/Palxi-Temp/component/ticket-upload.css)
- **Interactive JS**: [ticket-upload.js](file:///f:/Cruz%20Money/Git%20Cruz/Palxi-Temp/component/ticket-upload.js)

---

## 🛠️ Step-by-Step Integration

### Step 1: Link Custom CSS Stylesheet
Add the custom stylesheet for drag-and-drop animations and glassmorphic card layouts inside the `<head>` of [Approver/approver.html](file:///f:/Cruz%20Money/Git%20Cruz/Palxi-Temp/Approver/approver.html):

```html
<!-- Custom Ticket Upload Component Styles -->
<link rel="stylesheet" href="../component/ticket-upload.css" />
```

### Step 2: Insert HTML Bento Cell Markup
Insert the bento cell container into the main grid of [Approver/approver.html](file:///f:/Cruz%20Money/Git%20Cruz/Palxi-Temp/Approver/approver.html). We recommend placing it right before the **Final Review Decision Form** (Bento Cell 8).

Search for `<!-- Bento Cell 8: Final Review Decision Form (col-span-12) -->` and insert the content from `ticket-upload.html` right above it:

```html
            <!-- Bento Cell 7.5: Winning Tickets Image Upload (col-span-12) -->
            <div class="bento-cell col-span-12 p-8 border border-[#cbd5e1] rounded-2xl bg-white hover:border-primary transition-colors duration-300 shadow-[0_1px_3px_rgba(15,23,42,0.08)]" id="ticket-upload-component">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 class="text-title-sm font-title-md flex items-center gap-3">
                            <span class="material-symbols-outlined text-primary text-2xl">receipt_long</span>
                            Winning Tickets Verification
                        </h2>
                        <p class="text-body-md text-slate-500 mt-1">Upload high-resolution images of the winning physical tickets to audit scan signatures.</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <span class="text-xs font-bold uppercase tracking-widest font-mono text-slate-400">Required Tickets:</span>
                        <span class="glass-badge-premium glass-badge-cyan">
                            <span class="status-dot-pulse"></span>1+ Required
                        </span>
                    </div>
                </div>

                <!-- Double-Bezel Dropzone Outer Enclosure -->
                <div class="upload-container bg-slate-50/50 p-2 rounded-2xl border border-slate-200">
                    <div class="upload-dropzone relative min-h-[220px] flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-primary hover:bg-[#005d90]/2 rounded-xl p-8 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-center group" id="drop-area">
                        <input type="file" id="ticket-file-input" class="hidden-check" accept="image/*" multiple aria-label="Upload winning tickets">
                        
                        <!-- Default Idle View -->
                        <div class="flex flex-col items-center gap-4 transition-all duration-300" id="idle-view">
                            <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#005d90]/10 group-hover:text-primary transition-colors duration-300 relative">
                                <span class="material-symbols-outlined text-3xl">upload_file</span>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-slate-800 font-sans tracking-wide">
                                    Drag and drop ticket images here, or <span class="text-primary hover:underline">browse</span>
                                </p>
                                <p class="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono">PNG, JPG, or WEBP • Up to 8MB each</p>
                            </div>
                        </div>
                        
                        <!-- Dragover Hover Indicator Overlay -->
                        <div class="absolute inset-0 bg-[#005d90]/5 rounded-xl border-2 border-primary flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-200" id="drag-overlay">
                            <div class="flex flex-col items-center gap-3">
                                <span class="material-symbols-outlined text-4xl text-primary animate-bounce">download</span>
                                <span class="text-sm font-bold text-primary font-sans">Drop to upload ticket images</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Active Upload Grid / Preview Section -->
                <div class="mt-8 hidden" id="preview-section">
                    <h3 class="text-label-caps opacity-60 font-bold font-sans mb-4">UPLOADED TICKET IMAGES</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="preview-grid"></div>
                </div>

                <!-- Legibility Compliance Help Alert Banner -->
                <div class="mt-8 border border-slate-200 rounded-xl bg-slate-50/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-full bg-[#b45309]/10 flex items-center justify-center text-[#b45309] shrink-0">
                            <span class="material-symbols-outlined text-xl">gavel</span>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-slate-800 font-sans tracking-wide">Legibility Compliance Guidelines</h4>
                            <p class="text-xs text-slate-500 mt-1 leading-relaxed">Ensure physical ticket barcodes, payout amounts, and transaction IDs are fully visible. Obscured images will be flagged by internal auditors.</p>
                        </div>
                    </div>
                    
                    <!-- Checklist items -->
                    <div class="flex flex-wrap md:flex-nowrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-600">
                        <div class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-emerald-500 text-sm font-black">check_circle</span>
                            All 4 corners visible
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-emerald-500 text-sm font-black">check_circle</span>
                            No glare / blurry regions
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-emerald-500 text-sm font-black">check_circle</span>
                            Barcode text legible
                        </div>
                    </div>
                </div>
            </div>
```

### Step 3: Link JavaScript Controller Logic
Link the controller logic at the end of the `<body>` of [Approver/approver.html](file:///f:/Cruz%20Money/Git%20Cruz/Palxi-Temp/Approver/approver.html), just before the standard `<script>` tag:

```html
<!-- Interactive Ticket Upload Controller -->
<script src="../component/ticket-upload.js"></script>
```

---

## ⚡ Form Verification & Validation Rules

To match the compliance constraints of the dashboard, the javascript hooks directly into the **Payout Approval Button**'s validation state:
- The **Approve Payout** button (`#btn-approve`) starts as disabled.
- In addition to checking **Confirm Name Mismatch** (`#idConfirm`) and **Confirm Ready for Payment** (`#approvalConfirm`), the portal now verifies that **at least one winning ticket image** has been uploaded and fully read/validated.
- When all three conditions are met, the **Approve Payout** button lights up with its premium brand blue color and becomes clickable.
- If a ticket is removed such that no tickets remain, the button instantly disables again to prevent accidental payout disbursement without ticket audits.
