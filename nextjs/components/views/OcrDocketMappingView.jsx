'use client';

import React, { useState, useRef, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import {
  Upload,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Code,
  CheckCircle2,
  Image as ImageIcon,
  RotateCw,
  ZoomIn,
  ChevronDown
} from 'lucide-react';
import Button from '@/components/ui/Button';
import StatusPill from '@/components/ui/StatusPill';
import Input from '@/components/ui/Input';

// The 7 canonical database keys (System-Locked & Non-Deletable)
export const CONSTANT_DB_KEYS = [
  {
    key: 'dateTime',
    label: 'Date/time',
    type: 'datetime',
    description: 'Transaction win timestamp on gaming machine',
    isConstant: true
  },
  {
    key: 'payoutType',
    label: 'Payout type',
    type: 'string',
    description: 'Redemption game source category (e.g. EGM, Table, MyCash)',
    isConstant: true
  },
  {
    key: 'venue',
    label: 'Venue',
    type: 'string',
    description: 'Licensed gaming venue or club name',
    isConstant: true
  },
  {
    key: 'machineNo',
    label: 'Machine no.',
    type: 'string',
    description: 'Electronic gaming machine terminal identifier',
    isConstant: true
  },
  {
    key: 'winAmount',
    label: 'Win amount',
    type: 'currency',
    description: 'Statutory prize value in Australian dollars (AUD)',
    isConstant: true
  },
  {
    key: 'txnId',
    label: 'Internal txn ID',
    type: 'string',
    description: 'Unique internal validation slip number or transaction sequence',
    isConstant: true
  },
  {
    key: 'barcode',
    label: 'Barcode',
    type: 'barcode',
    description: 'Ticket optical scan barcode or validation checksum',
    isConstant: true
  }
];

// Sample docket keys detected on real Aristocrat / IGT EGM payout tickets
const DEFAULT_EXTRACTED_DOCKET_KEYS = [
  { id: 'dk-1', name: 'Date and Time', sampleValue: '24/07/2026 09:49 AM' },
  { id: 'dk-2', name: 'Game Type', sampleValue: 'EGM' },
  { id: 'dk-3', name: 'Club Name', sampleValue: 'Riverside RSL Club' },
  { id: 'dk-4', name: 'Terminal ID', sampleValue: 'EGM-021' },
  { id: 'dk-5', name: 'TOTAL WIN', sampleValue: 'AUD 1,250.00' },
  { id: 'dk-6', name: 'Slip Ref', sampleValue: 'TXN-88213' },
  { id: 'dk-7', name: 'Ticket Barcode', sampleValue: '9341-8821-3910' },
  // Extra fields detected on physical receipt that are not part of the standard 7 keys:
  { id: 'dk-8', name: 'Cashier Name', sampleValue: 'Sarah J.' },
  { id: 'dk-9', name: 'Denomination', sampleValue: '$1.00' },
  { id: 'dk-10', name: 'Seq Number', sampleValue: '04921' }
];

// Matches extracted docket labels to database fields by name similarity,
// run automatically right after a scan completes.
function computeAutoMappings(dbKeys, docketKeys) {
  const newMappings = {};
  docketKeys.forEach((dk) => {
    const normDk = dk.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    dbKeys.forEach((dbk) => {
      const normDbLabel = dbk.label.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normDbKey = dbk.key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (
        normDk === normDbLabel ||
        normDk === normDbKey ||
        (normDk.includes('totalwin') && normDbKey.includes('winamount')) ||
        (normDk.includes('terminal') && normDbKey.includes('machineno')) ||
        (normDk.includes('slipref') && normDbKey.includes('txnid')) ||
        (normDk.includes('barcode') && normDbKey.includes('barcode')) ||
        (normDk.includes('date') && normDbKey.includes('datetime')) ||
        (normDk.includes('club') && normDbKey.includes('venue')) ||
        (normDk.includes('game') && normDbKey.includes('payouttype')) ||
        (normDk.includes('cashier') && normDbKey.includes('cashier'))
      ) {
        newMappings[dbk.key] = dk.name;
      }
    });
  });
  return newMappings;
}

// Baseline state, also used as the "committed" snapshot that a Cancel
// reverts to (the venue's current saved schema, before this editing pass).
const INITIAL_DB_KEYS = [
  ...CONSTANT_DB_KEYS,
  {
    key: 'cashierName',
    label: 'Cashier',
    type: 'string',
    description: 'Floor attendant or cashier identifier',
    isConstant: false,
    isNew: false
  }
];

const INITIAL_MAPPINGS = {
  dateTime: 'Date and Time',
  payoutType: 'Game Type',
  venue: 'Club Name',
  machineNo: 'Terminal ID',
  winAmount: 'TOTAL WIN',
  txnId: 'Slip Ref',
  barcode: 'Ticket Barcode',
  cashierName: 'Cashier Name'
};

const INITIAL_UPLOAD = {
  uploadedImage: '/dummy-docket.png',
  imageFileName: 'sample-docket-aristocrat.png',
  imageFileSize: '342 KB'
};

const OcrDocketMappingView = forwardRef(function OcrDocketMappingView(
  { venueName = 'Riverside RSL Club', onSaveSchema = null, isEditing = false },
  ref
) {
  // Upload & Extraction State
  const [uploadedImage, setUploadedImage] = useState(INITIAL_UPLOAD.uploadedImage);
  const [imageFileName, setImageFileName] = useState(INITIAL_UPLOAD.imageFileName);
  const [imageFileSize, setImageFileSize] = useState(INITIAL_UPLOAD.imageFileSize);
  const [isExtracting, setIsExtracting] = useState(false);
  const [previewZoomOpen, setPreviewZoomOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Database Keys State (7 constant keys + a previously-saved custom key +
  // any brand-new custom keys added in this session). `isNew` is what gates
  // deletion: fields already on record (constant or previously-saved custom)
  // can't be removed here, only ones just added can be.
  const [dbKeys, setDbKeys] = useState(INITIAL_DB_KEYS);

  // Extracted Docket Keys State (from the uploaded ticket)
  const [extractedDocketKeys, setExtractedDocketKeys] = useState(DEFAULT_EXTRACTED_DOCKET_KEYS);

  // Key-to-Key Mapping State:
  // Key = dbKeyName (e.g. 'dateTime', 'winAmount')
  // Value = docketKeyName (e.g. 'Date and Time', 'TOTAL WIN')
  const [mappings, setMappings] = useState(INITIAL_MAPPINGS);

  // Snapshot this component reverts to on Cancel - starts as the initial
  // (already-saved) schema and advances every time the parent commits a Save.
  const committedRef = useRef({
    dbKeys: INITIAL_DB_KEYS,
    mappings: INITIAL_MAPPINGS,
    extractedDocketKeys: DEFAULT_EXTRACTED_DOCKET_KEYS,
    ...INITIAL_UPLOAD
  });

  // Modal / Form state for adding custom DB key
  const [showAddCustomKeyModal, setShowAddCustomKeyModal] = useState(false);
  const [customKeyTitle, setCustomKeyTitle] = useState('');

  // Schema Preview Drawer State
  const [showJsonSchema, setShowJsonSchema] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Upload handler for real images
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    setImageFileSize(`${Math.round(file.size / 1024)} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result);
      runOcrExtraction(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Simulate OCR text and docket key detection, then auto-map by name match
  // so the user immediately sees what matched and what still needs attention.
  const runOcrExtraction = (fileName = 'docket.png') => {
    setIsExtracting(true);

    setTimeout(() => {
      const freshDocketKeys = DEFAULT_EXTRACTED_DOCKET_KEYS;
      const autoMapped = computeAutoMappings(dbKeys, freshDocketKeys);
      setExtractedDocketKeys(freshDocketKeys);
      setMappings(autoMapped);
      setIsExtracting(false);

      const matchedCount = Object.keys(autoMapped).length;
      showToast(
        `${freshDocketKeys.length} labels detected on ${fileName}. ${matchedCount} of ${dbKeys.length} fields auto-mapped, review the rest below.`
      );
    }, 1000);
  };

  // Load standard EGM ticket preset
  const handleLoadSampleDocket = () => {
    setUploadedImage('/dummy-docket.png');
    setImageFileName('dummy-docket.png');
    setImageFileSize('342 KB');
    runOcrExtraction('dummy-docket.png');
  };

  // Exposed to the parent: commit/discard back the shared Edit settings /
  // Cancel / Save changes toolbar (same pattern every other Venue Settings
  // tab uses), plus loadSample for the page-level "Developer option" toolbar.
  useImperativeHandle(
    ref,
    () => ({
      commit: () => {
        if (onSaveSchema) {
          onSaveSchema({ dbKeys, mappings });
        }
        committedRef.current = { dbKeys, mappings, extractedDocketKeys, uploadedImage, imageFileName, imageFileSize };
      },
      discard: () => {
        const snapshot = committedRef.current;
        setDbKeys(snapshot.dbKeys);
        setMappings(snapshot.mappings);
        setExtractedDocketKeys(snapshot.extractedDocketKeys);
        setUploadedImage(snapshot.uploadedImage);
        setImageFileName(snapshot.imageFileName);
        setImageFileSize(snapshot.imageFileSize);
      },
      loadSample: handleLoadSampleDocket
    }),
    [dbKeys, mappings, extractedDocketKeys, uploadedImage, imageFileName, imageFileSize, onSaveSchema]
  );

  // Map a Docket Key to a DB Key
  const handleMapKey = useCallback((docketKeyName, dbKeyName) => {
    if (!dbKeyName) return;
    if (!docketKeyName) return;
    setMappings((prev) => ({
      ...prev,
      [dbKeyName]: docketKeyName
    }));
  }, []);

  // Remove a mapping from a DB Key (sets it to empty)
  const handleUnmapKey = useCallback((dbKeyName) => {
    setMappings((prev) => {
      const updated = { ...prev };
      delete updated[dbKeyName];
      return updated;
    });
  }, []);

  // Helper to derive safe camelCase key identifier from display title
  const toCamelCaseIdentifier = (label, existingKeys) => {
    const trimmed = label.trim();
    let camel = trimmed
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, '');

    if (!camel) {
      camel = 'customField';
    }

    camel = camel.charAt(0).toLowerCase() + camel.slice(1);

    let candidate = camel;
    let counter = 2;
    while (existingKeys.some((k) => k.key === candidate)) {
      candidate = `${camel}${counter}`;
      counter++;
    }
    return candidate;
  };

  // Manual custom key creation (Derives camelCase key and type in background)
  const handleCreateCustomKey = (e) => {
    e.preventDefault();
    const trimmedTitle = customKeyTitle.trim();
    if (!trimmedTitle) return;

    const formattedKey = toCamelCaseIdentifier(trimmedTitle, dbKeys);

    const created = {
      key: formattedKey,
      label: trimmedTitle,
      type: 'string',
      description: 'Custom venue schema key',
      isConstant: false,
      isNew: true
    };

    setDbKeys((prev) => [...prev, created]);
    setCustomKeyTitle('');
    setShowAddCustomKeyModal(false);
    showToast(`Added custom field: ${created.label}`);
  };

  // One-click path for an unmapped docket label: create a matching custom
  // field and map it in the same action, so fixing a gap is a single click
  // instead of "add field" then "find it below and map it".
  const handleAddFieldForDocketKey = (docketKey) => {
    const formattedKey = toCamelCaseIdentifier(docketKey.name, dbKeys);
    const created = {
      key: formattedKey,
      label: docketKey.name,
      type: 'string',
      description: 'Custom venue schema key',
      isConstant: false,
      isNew: true
    };

    setDbKeys((prev) => [...prev, created]);
    setMappings((prev) => ({ ...prev, [created.key]: docketKey.name }));
    showToast(`Added field "${created.label}" and mapped it to the docket.`);
  };

  // Delete custom key (only fields added in this session can be removed;
  // constant system keys and previously-saved custom keys are locked)
  const handleDeleteCustomKey = (keyToDelete) => {
    const target = dbKeys.find((k) => k.key === keyToDelete);
    if (!target?.isNew) {
      showToast('Only fields added in this session can be deleted.');
      return;
    }

    setDbKeys((prev) => prev.filter((k) => k.key !== keyToDelete));
    handleUnmapKey(keyToDelete);
    showToast(`Removed custom field: ${keyToDelete}`);
  };

  // Clear all mappings to empty
  const handleClearAllMappings = () => {
    setMappings({});
    showToast('Cleared all field mappings.');
  };

  // Generate clean exportable JSON Schema
  const generatedJsonSchema = useMemo(() => {
    const schema = {
      venue: venueName,
      version: '2.0-ocr',
      lastUpdated: new Date().toISOString(),
      constantDbKeys: CONSTANT_DB_KEYS.map((k) => k.key),
      keyMappings: Object.entries(mappings).map(([dbKey, docketKey]) => {
        const dbMeta = dbKeys.find((k) => k.key === dbKey);
        const docketMeta = extractedDocketKeys.find((d) => d.name === docketKey);
        return {
          dbKey,
          dbLabel: dbMeta?.label || dbKey,
          docketKey,
          sampleExtractedValue: docketMeta?.sampleValue || '-',
          isConstant: Boolean(dbMeta?.isConstant)
        };
      }),
      unmappedDbKeys: dbKeys.filter((k) => !mappings[k.key]).map((k) => k.key)
    };
    return JSON.stringify(schema, null, 2);
  }, [venueName, dbKeys, mappings, extractedDocketKeys]);

  // Derived metrics
  const mappedCount = Object.keys(mappings).length;
  const constantMappedCount = CONSTANT_DB_KEYS.filter((k) => mappings[k.key]).length;
  const unmappedDocketKeys = extractedDocketKeys.filter(
    (dk) => !Object.values(mappings).includes(dk.name)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-4 py-2.5 rounded-md shadow-lg text-[13px] flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#0d9488]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls Toolbar */}
      <div className="pb-4 border-b border-[#e2e8f0] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-bold text-[#0f172a] m-0">OCR docket mapping</h2>
          <p className="text-[13px] text-[#64748b] mt-0.5 mb-0">
            Match each database field to the label the OCR found on this venue's docket.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isEditing && (
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={handleClearAllMappings}
              title="Clear all mappings to empty"
            >
              Reset
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            icon={Code}
            onClick={() => setShowJsonSchema(!showJsonSchema)}
          >
            {showJsonSchema ? 'Hide JSON' : 'JSON'}
          </Button>
        </div>
      </div>

      {/* Collapsible JSON Schema Inspector */}
      {showJsonSchema && (
        <div className="p-3.5 rounded-md bg-[#0f172a] text-emerald-400 font-mono text-[11.5px] overflow-x-auto border border-slate-800">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-slate-400">
            <span className="text-[11px] font-sans font-bold">Active docket schema definition</span>
            <button
              onClick={() => setShowJsonSchema(false)}
              className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <pre className="m-0 leading-relaxed">{generatedJsonSchema}</pre>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SECTION 1: DOCKET UPLOAD STRIP                               */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="border border-[#e2e8f0] rounded-lg bg-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {uploadedImage ? (
            <div
              onClick={() => setPreviewZoomOpen(true)}
              className="w-12 h-14 bg-slate-50 border border-[#cbd5e1] rounded p-0.5 overflow-hidden shrink-0 cursor-pointer hover:border-[#0d9488] relative group"
              title="Click to zoom ticket image"
            >
              <img src={uploadedImage} alt="Docket" className="w-full h-full object-cover rounded-xs" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          ) : (
            <div className="w-12 h-14 bg-slate-100 rounded flex items-center justify-center text-slate-400 shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-bold text-[#0f172a] truncate">{imageFileName}</span>
              <span className="font-mono text-[11.5px] text-slate-500">({imageFileSize})</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[12px] text-slate-500">
              <span>{extractedDocketKeys.length} labels detected</span>
              <span>·</span>
              <span className="font-medium text-[#0f172a]">
                {constantMappedCount} of {CONSTANT_DB_KEYS.length} required fields mapped
              </span>
            </div>
          </div>
        </div>

        {/* Upload Actions */}
        {isEditing && (
          <div className="flex items-center gap-2 shrink-0">
            {isExtracting ? (
              <StatusPill variant="warn">
                <RotateCw className="w-3 h-3 animate-spin mr-1.5" />
                Scanning docket...
              </StatusPill>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Upload}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload new
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Docket Image Modal Zoom */}
      {previewZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewZoomOpen(false)}
        >
          <div
            className="bg-white rounded-xl p-4 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2">
              <span className="text-[13.5px] font-bold text-[#0f172a]">{imageFileName}</span>
              <button
                onClick={() => setPreviewZoomOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer bg-transparent border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-center bg-[#f8fafc] p-2 rounded-lg border border-[#e2e8f0]">
              <img src={uploadedImage} alt="Enlarged docket" className="max-h-[70vh] object-contain rounded" />
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SECTION 2: FIELD MAPPING - ONE LIST, ONE INTERACTION PATTERN */}
      {/* Every row is a database field with a single dropdown to     */}
      {/* choose the matching docket label - no drag-and-drop, no     */}
      {/* second panel to reconcile against.                          */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="border border-[#e2e8f0] rounded-lg bg-white overflow-hidden shadow-2xs">
        {/* Header */}
        <div className="min-h-[52px] px-4 py-2.5 bg-[#fafbfc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#475569]">Field mapping</span>
            <StatusPill variant={mappedCount === dbKeys.length ? 'pass' : 'neutral'}>
              {mappedCount} / {dbKeys.length} mapped
            </StatusPill>
          </div>

          {isEditing && (
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => setShowAddCustomKeyModal(true)}
            >
              Add custom field
            </Button>
          )}
        </div>

        {/* Column headers, so it's unmistakable which side is which */}
        <div className="hidden md:grid md:grid-cols-[200px_1fr_340px] gap-4 px-4 pt-3 pb-1.5 text-[11px] font-semibold text-slate-400">
          <span>Database field</span>
          <span>Extracted from docket</span>
          <span className="text-right">Mapping status</span>
        </div>

        {/* Flat List (divide-y, zero inner cards) */}
        <div className="divide-y divide-[#e2e8f0]">
          {dbKeys.map((dbKey) => {
            const mappedDocketKeyName = mappings[dbKey.key];
            const isMapped = Boolean(mappedDocketKeyName);
            const matchedDocketItem = extractedDocketKeys.find((d) => d.name === mappedDocketKeyName);

            return (
              <div
                key={dbKey.key}
                className="p-4 md:grid md:grid-cols-[200px_1fr_340px] md:items-center gap-3 md:gap-4 transition-colors hover:bg-[#fafbfc]"
              >
                {/* Column 1: database field (this venue's system schema) */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13.5px] font-bold text-[#0f172a]">{dbKey.label}</span>
                    {dbKey.isNew && isEditing && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomKey(dbKey.key)}
                        className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer bg-transparent border-none transition-colors"
                        title="Delete this newly added field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="text-[12px] text-slate-500 mt-0.5">{dbKey.description}</div>
                </div>

                {/* Column 2: what came from the docket (read-only OCR output) */}
                <div className="min-w-0 mt-2 md:mt-0">
                  {isMapped ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[12.5px] font-semibold text-[#0d9488] truncate">
                        {mappedDocketKeyName}
                      </span>
                      <span className="font-mono text-[12px] text-slate-500 truncate">
                        &ldquo;{matchedDocketItem?.sampleValue || '-'}&rdquo;
                      </span>
                    </div>
                  ) : (
                    <span className="text-[12.5px] text-slate-400 italic">Nothing on the docket matched</span>
                  )}
                </div>

                {/* Column 3: mapping status + control to change it. The pill,
                    the select, and the clear-button slot are all fixed widths
                    so every row lines up whether it's mapped or not. */}
                <div className="mt-3 md:mt-0 flex items-center md:justify-end gap-2 w-full">
                  <StatusPill
                    variant={isMapped ? 'pass' : 'neutral'}
                    className="w-[104px] justify-center shrink-0"
                  >
                    {isMapped ? 'Mapped' : 'Not mapped'}
                  </StatusPill>

                  {isEditing && (
                    <>
                      <div className="relative flex-1 min-w-0 md:flex-none md:w-[190px]">
                        <select
                          value={mappedDocketKeyName || ''}
                          onChange={(e) => handleMapKey(e.target.value, dbKey.key)}
                          className="w-full h-9 pl-2.5 pr-8 text-[12.5px] bg-white border border-[#cbd5e1] hover:border-slate-400 rounded-md text-[#0f172a] font-medium cursor-pointer outline-none focus:border-ink-hi focus:ring-2 focus:ring-slate-200 transition-colors truncate appearance-none"
                        >
                          <option value="">Select docket label...</option>
                          {extractedDocketKeys.map((dk) => {
                            const usedByOtherField = Object.entries(mappings).some(
                              ([otherDbKey, docketName]) => otherDbKey !== dbKey.key && docketName === dk.name
                            );
                            return (
                              <option key={dk.id} value={dk.name} disabled={usedByOtherField}>
                                {dk.name}
                                {usedByOtherField ? ' (already mapped)' : ''}
                              </option>
                            );
                          })}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Fixed-width slot so the select doesn't shift when a row has no clear button */}
                      <div className="w-6 shrink-0 flex items-center justify-center">
                        {isMapped && (
                          <button
                            type="button"
                            onClick={() => handleUnmapKey(dbKey.key)}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer bg-transparent border-none transition-colors"
                            title="Clear this mapping"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SECTION 3: DOCKET LABELS WITH NOWHERE TO GO YET             */}
      {/* Only the leftovers - a label already mapped is already      */}
      {/* visible in the field mapping table above, so it isn't       */}
      {/* repeated here. Each gap gets a one-click fix.                */}
      {/* ─────────────────────────────────────────────────────────── */}
      {unmappedDocketKeys.length > 0 && (
        <div className="border border-[#e2e8f0] rounded-lg bg-white overflow-hidden shadow-2xs">
          <div className="min-h-[52px] px-4 py-2.5 bg-[#fafbfc] border-b border-[#e2e8f0] flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#475569]">Unmapped docket labels</span>
            <StatusPill variant="warn">{unmappedDocketKeys.length}</StatusPill>
          </div>

          <div className="divide-y divide-[#f1f5f9]">
            {unmappedDocketKeys.map((dk) => (
              <div key={dk.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-[#0f172a] truncate leading-tight">{dk.name}</div>
                  <div className="font-mono text-[11.5px] text-slate-500 truncate mt-0.5">
                    &ldquo;{dk.sampleValue}&rdquo;
                  </div>
                </div>
                {isEditing && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Plus}
                    onClick={() => handleAddFieldForDocketKey(dk)}
                    className="shrink-0"
                    title={`Create a database field for "${dk.name}" and map it`}
                  >
                    Add field &amp; map
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="px-4 py-2.5 bg-[#fafbfc] border-t border-[#f1f5f9] text-[11.5px] text-slate-500">
            These labels were detected on the docket but no database field claims them yet. Add a field to
            capture the value, or leave them unused.
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD CUSTOM DATABASE FIELD                            */}
      {/* ─────────────────────────────────────────────────────────── */}
      {showAddCustomKeyModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowAddCustomKeyModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl space-y-4 animate-in zoom-in-95 duration-200 border border-[#e2e8f0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2.5">
              <span className="text-[15px] font-bold text-[#0f172a] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0d9488]" />
                <span>Add custom field</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowAddCustomKeyModal(false);
                  setCustomKeyTitle('');
                }}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer bg-transparent border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomKey} className="space-y-4 pt-1">
              <Input
                label="Field name"
                required
                autoFocus
                placeholder="e.g. Shift supervisor, Terminal location"
                value={customKeyTitle}
                onChange={(e) => setCustomKeyTitle(e.target.value)}
                size="sm"
              />

              <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setShowAddCustomKeyModal(false);
                    setCustomKeyTitle('');
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={!customKeyTitle.trim()}>
                  Add field
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

export default OcrDocketMappingView;
