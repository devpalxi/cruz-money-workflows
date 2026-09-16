/**
 * Ticket Image Upload Component Logic
 * Designed for Riverside Hotel Approver Portal
 */

document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('ticket-file-input');
    const previewSection = document.getElementById('preview-section');
    const previewGrid = document.getElementById('preview-grid');
    const btnApprove = document.getElementById('btn-approve');

    let uploadedFiles = [];

    // Helper: format file size
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Open file selector when clicking the drop area (excluding children clicking inputs)
    dropArea.addEventListener('click', (e) => {
        if (e.target !== fileInput && !fileInput.contains(e.target)) {
            fileInput.click();
        }
    });

    // Drag & Drop event handlers
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('dragover');
        }, false);
    });

    // Handle dropped files
    dropArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    // Handle selected files via input browser
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        if (files.length === 0) return;
        
        previewSection.classList.remove('hidden');
        
        // Convert FileList to Array and process
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                alert('Only image files are allowed.');
                return;
            }
            
            // Avoid duplicate additions
            if (uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
                return;
            }
            
            const fileId = 'file_' + Math.random().toString(36).substr(2, 9);
            const fileObj = {
                id: fileId,
                file: file,
                name: file.name,
                size: file.size,
                status: 'uploading'
            };
            
            uploadedFiles.push(fileObj);
            createPreviewCard(fileObj);
            simulateUpload(fileObj);
        });
        
        // Visual scroll to preview grid if new files added
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function createPreviewCard(fileObj) {
        const card = document.createElement('div');
        card.className = 'ticket-preview-card flex flex-col opacity-0 translate-y-4';
        card.id = fileObj.id;
        
        // Standard placeholder image during reading or upload
        const reader = new FileReader();
        reader.onload = function(e) {
            const thumb = card.querySelector('.ticket-thumb');
            if (thumb) thumb.src = e.target.result;
        };
        reader.readAsDataURL(fileObj.file);

        card.innerHTML = `
            <div class="ticket-thumb-container">
                <button class="ticket-delete-btn" title="Remove image">
                    <span class="material-symbols-outlined">close</span>
                </button>
                <img class="ticket-thumb w-full h-full object-cover" src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' width%3D'100' height%3D'100' viewBox%3D'0 0 100 100'%3E%3Crect width%3D'100' height%3D'100' fill%3D'%23e2e8f0'%2F%3E%3C%2Fsvg%3E" alt="${fileObj.name}">
                
                <!-- Status Overlay (Uploading state) -->
                <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center text-white status-overlay">
                    <span class="text-xs font-bold font-mono tracking-widest mb-1.5 uppercase opacity-80">UPLOADING</span>
                    <span class="text-lg font-black font-mono progress-text">0%</span>
                </div>
            </div>
            
            <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex items-start justify-between gap-2">
                        <span class="text-xs font-bold font-mono text-primary bg-[#005d90]/8 px-2 py-0.5 rounded uppercase tracking-wider truncate block max-w-[70%]" title="${fileObj.name}">
                            ${fileObj.name}
                        </span>
                        <span class="text-xs font-semibold text-slate-400 font-mono">${formatBytes(fileObj.size)}</span>
                    </div>
                    
                    <!-- Progress Bar container -->
                    <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3 progress-container">
                        <div class="upload-progress-fill h-full w-0 rounded-full"></div>
                    </div>
                    
                    <!-- Validation Indicators (hidden during upload) -->
                    <div class="validation-badge mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#b45309] bg-[#fef3c7] border border-[#fde68a] px-3 py-1.5 rounded-lg hidden">
                        <span class="status-dot-pulse w-1.5 h-1.5 bg-[#b45309] rounded-full inline-block shrink-0"></span>
                        <span class="badge-label">PENDING AUDIT SCAN</span>
                    </div>
                </div>

                <div class="border-t border-slate-100 mt-4 pt-3 flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">
                    <span>TICKET ID: PENDING</span>
                    <span class="ocr-score text-slate-400">OCR: --</span>
                </div>
            </div>
        `;

        // Delete button listener
        card.querySelector('.ticket-delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFile(fileObj.id);
        });

        previewGrid.appendChild(card);
        
        // GSAP animate card entrance
        if (window.gsap) {
            gsap.to(card, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        } else {
            card.classList.remove('opacity-0', 'translate-y-4');
        }
    }

    function simulateUpload(fileObj) {
        const card = document.getElementById(fileObj.id);
        if (!card) return;

        const progressFill = card.querySelector('.upload-progress-fill');
        const progressText = card.querySelector('.progress-text');
        const statusOverlay = card.querySelector('.status-overlay');
        const progressContainer = card.querySelector('.progress-container');
        const validationBadge = card.querySelector('.validation-badge');
        const footerSpan = card.querySelector('.border-t span');
        const ocrSpan = card.querySelector('.ocr-score');

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 20) + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Complete state
                setTimeout(() => {
                    fileObj.status = 'completed';
                    progressContainer.classList.add('hidden');
                    statusOverlay.classList.add('hidden');
                    
                    // Trigger Simulated OCR & Validation check
                    validationBadge.className = "validation-badge mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#15803d] bg-[#dcfce7] border border-[#bbf7d0] px-3 py-1.5 rounded-lg";
                    validationBadge.innerHTML = `
                        <svg class="w-3.5 h-3.5 text-[#15803d] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>BARCODE LEGIBLE (VERIFIED)</span>
                    `;
                    validationBadge.classList.remove('hidden');
                    
                    // Inject a fake Ticket ID matching Riverside barcode structure
                    const fakeId = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
                    footerSpan.textContent = `TICKET ID: ${fakeId}`;
                    
                    // Generate a high OCR confidence rating
                    const conf = 92 + Math.floor(Math.random() * 7);
                    ocrSpan.textContent = `OCR: ${conf}%`;
                    ocrSpan.className = "ocr-score text-[#15803d]";
                    
                    checkGlobalApprovalState();
                }, 300);
            }
            
            progressText.textContent = `${progress}%`;
            progressFill.style.width = `${progress}%`;
        }, 150);
    }

    function removeFile(id) {
        const card = document.getElementById(id);
        if (!card) return;

        // Remove from list
        uploadedFiles = uploadedFiles.filter(f => f.id !== id);

        // GSAP animate exit
        if (window.gsap) {
            gsap.to(card, {
                opacity: 0,
                scale: 0.9,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    card.remove();
                    if (uploadedFiles.length === 0) {
                        previewSection.classList.add('hidden');
                    }
                    checkGlobalApprovalState();
                }
            });
        } else {
            card.remove();
            if (uploadedFiles.length === 0) {
                previewSection.classList.add('hidden');
            }
            checkGlobalApprovalState();
        }
    }

    // Connect custom verification state back to Approver Dashboard form submission checks
    function checkGlobalApprovalState() {
        const completedCount = uploadedFiles.filter(f => f.status === 'completed').length;
        window.uploadedTicketsCount = completedCount;

        // Try calling the parent script's validateForm function if it exists
        if (typeof window.validateForm === 'function') {
            window.validateForm();
            return;
        }

        // Fallback validation logic
        const idConfirm = document.getElementById('idConfirm');
        const approvalConfirm = document.getElementById('approvalConfirm');
        
        if (idConfirm && approvalConfirm && btnApprove) {
            const hasCompletedTickets = completedCount > 0;
            
            if (idConfirm.checked && approvalConfirm.checked && hasCompletedTickets) {
                btnApprove.disabled = false;
                btnApprove.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                btnApprove.disabled = true;
                btnApprove.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }
    }

    // Intercept/hook into the existing checkbox event listeners in approver.html
    const idConfirm = document.getElementById('idConfirm');
    const approvalConfirm = document.getElementById('approvalConfirm');
    if (idConfirm && approvalConfirm) {
        idConfirm.addEventListener('change', checkGlobalApprovalState);
        approvalConfirm.addEventListener('change', checkGlobalApprovalState);
    }
});
