/**
 * OCR Docket Field Mapping Engine & Preset Schemas
 * Enables venue-specific OCR parsing for gaming machine payout slips (Aristocrat, IGT, Light & Wonder, etc.)
 */

export const DOCKET_PRESETS = {
  ARISTOCRAT: {
    docketFormat: "Aristocrat System 7000 Standard",
    version: "1.2",
    venueId: "venue-riverside-rsl",
    mappings: {
      winAmount: {
        field: "winAmount",
        label: "Win Amount (AUD)",
        strategy: "regex_capture",
        regex: "(?:TOTAL AMOUNT|JACKPOT AMOUNT|AMOUNT PAID|WIN AMOUNT)\\s*[:$]?\\s*\\$?([0-9,]+\\.\\d{2})",
        matchIndex: 1,
        transform: "currency"
      },
      machineId: {
        field: "machineId",
        label: "Gaming Terminal ID",
        strategy: "regex_capture",
        regex: "(?:MACHINE NO|TERMINAL|EGM NO|MACHINE)\\s*[:#]?\\s*([A-Z0-9-]+)",
        matchIndex: 1,
        prefix: "EGM-"
      },
      machineName: {
        field: "machineName",
        label: "Game Title",
        strategy: "keyword_match",
        keywords: ["DRAGON LINK", "LIGHTNING LINK", "GRAND STAR", "DOLLAR STORM", "BUFFALO GOLD", "CHOY SUN DOA"]
      },
      txnId: {
        field: "txnId",
        label: "Docket / Slip Reference",
        strategy: "regex_capture",
        regex: "(?:SLIP #|TICKET #|SEQ NO|REF #|DOCKET NO)\\s*[:#]?\\s*([0-9A-Z-]+)",
        matchIndex: 1
      },
      dateTime: {
        field: "dateTime",
        label: "Win Timestamp",
        strategy: "regex_capture",
        regex: "(\\d{2}/\\d{2}/\\d{4}\\s+\\d{2}:\\d{2}(?:\\s*(?:AM|PM|am|pm))?)",
        matchIndex: 1
      },
      validationCode: {
        field: "validationCode",
        label: "Barcode / Validation Number",
        strategy: "regex_capture",
        regex: "([0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4})",
        matchIndex: 1
      }
    },
    validationRules: {
      requireWinAmount: true,
      requireMachineId: true,
      minWinAmount: 10.0
    }
  },

  IGT: {
    docketFormat: "IGT Advantage Cancel Credit",
    version: "2.0",
    venueId: "venue-riverside-rsl",
    mappings: {
      winAmount: {
        field: "winAmount",
        label: "Win Amount (AUD)",
        strategy: "regex_capture",
        regex: "(?:VALUE|NET PAY|TOTAL DUE)\\s*[:$]?\\s*\\$?([0-9,]+\\.\\d{2})",
        matchIndex: 1,
        transform: "currency"
      },
      machineId: {
        field: "machineId",
        label: "Gaming Terminal ID",
        strategy: "regex_capture",
        regex: "(?:EGM|LOCATION|TERM)\\s*[:#]?\\s*([A-Z0-9-]+)",
        matchIndex: 1,
        prefix: "EGM-"
      },
      machineName: {
        field: "machineName",
        label: "Game Title",
        strategy: "keyword_match",
        keywords: ["OCEAN MAGIC", "WHEEL OF FORTUNE", "FORT KNOX", "SCARAB", "PROSPERITY LINK"]
      },
      txnId: {
        field: "txnId",
        label: "Docket / Slip Reference",
        strategy: "regex_capture",
        regex: "(?:RECEIPT #|VALIDATION #|TRANS ID)\\s*[:#]?\\s*([0-9A-Z-]+)",
        matchIndex: 1
      },
      dateTime: {
        field: "dateTime",
        label: "Win Timestamp",
        strategy: "regex_capture",
        regex: "(\\d{2}/\\d{2}/\\d{4}\\s+\\d{2}:\\d{2}(?:\\s*(?:AM|PM|am|pm))?)",
        matchIndex: 1
      },
      validationCode: {
        field: "validationCode",
        label: "Barcode / Validation Number",
        strategy: "regex_capture",
        regex: "([0-9]{8,18})",
        matchIndex: 1
      }
    },
    validationRules: {
      requireWinAmount: true,
      requireMachineId: true,
      minWinAmount: 5.0
    }
  },

  LIGHT_AND_WONDER: {
    docketFormat: "Light & Wonder Voucher Handpay",
    version: "1.1",
    venueId: "venue-riverside-rsl",
    mappings: {
      winAmount: {
        field: "winAmount",
        label: "Win Amount (AUD)",
        strategy: "regex_capture",
        regex: "(?:HANDPAY AMOUNT|TOTAL WIN|CASH OUT)\\s*[:$]?\\s*\\$?([0-9,]+\\.\\d{2})",
        matchIndex: 1,
        transform: "currency"
      },
      machineId: {
        field: "machineId",
        label: "Gaming Terminal ID",
        strategy: "regex_capture",
        regex: "(?:STAND #|ASSET #|EGM ID)\\s*[:#]?\\s*([A-Z0-9-]+)",
        matchIndex: 1,
        prefix: "EGM-"
      },
      machineName: {
        field: "machineName",
        label: "Game Title",
        strategy: "keyword_match",
        keywords: ["DUO FU DUO CAI", "DANCING DRUMS", "JIN JI BAO XI", "ULTIMATE FIRE LINK"]
      },
      txnId: {
        field: "txnId",
        label: "Docket / Slip Reference",
        strategy: "regex_capture",
        regex: "(?:VOUCHER #|SLIP REF|SERIAL)\\s*[:#]?\\s*([0-9A-Z-]+)",
        matchIndex: 1
      },
      dateTime: {
        field: "dateTime",
        label: "Win Timestamp",
        strategy: "regex_capture",
        regex: "(\\d{2}/\\d{2}/\\d{4}\\s+\\d{2}:\\d{2}(?:\\s*(?:AM|PM|am|pm))?)",
        matchIndex: 1
      },
      validationCode: {
        field: "validationCode",
        label: "Barcode / Validation Number",
        strategy: "regex_capture",
        regex: "([0-9]{4}-[0-9]{4}-[0-9]{4})",
        matchIndex: 1
      }
    },
    validationRules: {
      requireWinAmount: true,
      requireMachineId: true,
      minWinAmount: 10.0
    }
  }
};

export const SAMPLE_DOCKET_TEXTS = {
  ARISTOCRAT: `*** RIVERSIDE RSL CLUB ***
GAMING ROOM DOCKET
SLIP #: PAY-260701
DATE/TIME: 14/07/2026 07:09 AM
MACHINE NO: 002
GAME: DRAGON LINK 1 (PEACE & LONG LIFE)
TOTAL AMOUNT: $1,500.00
VALIDATION: 9812-4412-8920-1104
CASHIER SIGN: ____________
PATRON SIGN: _____________`,

  IGT: `--- IGT ADVANTAGE CASINO SYSTEM ---
RECEIPT #: IGT-890214
DATE/TIME: 24/07/2026 09:49 AM
EGM: 014
TITLE: OCEAN MAGIC DELUXE
NET PAY: $2,850.00
VALIDATION #: 88912409124890
THANK YOU FOR PLAYING AT RIVERSIDE`,

  LIGHT_AND_WONDER: `*** LIGHT & WONDER HANDPAY ***
VENUE: RIVERSIDE RSL
VOUCHER #: LW-440192
DATE/TIME: 18/07/2026 03:22 PM
STAND #: 021
GAME: DANCING DRUMS EXPLOSION
HANDPAY AMOUNT: $4,200.00
VALIDATION: 4401-8920-1092
ATTENDANT ID: USR-1A2B3C`
};

/**
 * Parses raw OCR text using a JSON Docket Mapping Schema
 */
export function parseDocketText(rawText, schemaInput) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      success: false,
      extracted: {},
      errors: ['No OCR text provided for extraction.'],
    };
  }

  let schema = schemaInput;
  if (typeof schemaInput === 'string') {
    try {
      schema = JSON.parse(schemaInput);
    } catch (e) {
      return {
        success: false,
        extracted: {},
        errors: [`Invalid JSON schema: ${e.message}`],
      };
    }
  }

  if (!schema || !schema.mappings) {
    return {
      success: false,
      extracted: {},
      errors: ['Schema is missing "mappings" configuration.'],
    };
  }

  const extracted = {};
  const errors = [];
  const mappings = schema.mappings;

  for (const [key, rule] of Object.entries(mappings)) {
    try {
      if (rule.strategy === 'regex_capture' && rule.regex) {
        const regex = new RegExp(rule.regex, 'i');
        const match = rawText.match(regex);
        if (match) {
          const idx = rule.matchIndex !== undefined ? rule.matchIndex : 1;
          let val = match[idx] !== undefined ? match[idx].trim() : match[0].trim();

          if (rule.transform === 'currency') {
            const cleaned = parseFloat(val.replace(/[^0-9.]/g, ''));
            val = isNaN(cleaned) ? val : cleaned.toLocaleString('en-AU', { minimumFractionDigits: 2 });
          }

          if (rule.prefix && !val.startsWith(rule.prefix)) {
            // Only add prefix if it doesn't already have one
            const rawDigits = val.replace(/[^0-9A-Z]/gi, '');
            val = `${rule.prefix}${rawDigits}`;
          }

          extracted[key] = val;
        } else {
          extracted[key] = null;
        }
      } else if (rule.strategy === 'keyword_match' && Array.isArray(rule.keywords)) {
        let foundKeyword = null;
        const upperText = rawText.toUpperCase();
        for (const kw of rule.keywords) {
          if (upperText.includes(kw.toUpperCase())) {
            foundKeyword = kw;
            break;
          }
        }
        extracted[key] = foundKeyword;
      } else if (rule.strategy === 'line_search') {
        const lines = rawText.split('\n');
        const line = lines.find((l) => l.toUpperCase().includes((rule.search || '').toUpperCase()));
        extracted[key] = line ? line.trim() : null;
      }
    } catch (err) {
      errors.push(`Error executing rule for "${key}": ${err.message}`);
    }
  }

  // Schema Validation Rules
  const rules = schema.validationRules || {};
  if (rules.requireWinAmount && !extracted.winAmount) {
    errors.push('Required field "winAmount" could not be extracted from the docket.');
  }
  if (rules.requireMachineId && !extracted.machineId) {
    errors.push('Required field "machineId" could not be extracted from the docket.');
  }

  return {
    success: errors.length === 0,
    extracted,
    errors,
  };
}
