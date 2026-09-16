// Shared disbursement-method routing helpers for the Collector flow.
// disbursementMethod is a "+"-joined label built from any combination of
// atomic methods (Cash / Bank transfer / Cheque) - see payout-details.jsx.
//
// Bank account and Cheque details are always part of the flow - the
// collector visits both regardless of what was selected on the first step.
// Whichever method wasn't picked shows a "not required, you can skip this"
// message on that step instead of the step being skipped over entirely.
// getDisbursementFlags is what each of those pages (and the summary) uses to
// decide whether to show its real form or the skip message.

export function getDisbursementFlags(disbursementMethod) {
  const method = disbursementMethod || '';
  return {
    hasCash: method.includes('Cash'),
    hasBank: method.includes('Bank transfer'),
    hasCheque: method.includes('Cheque'),
  };
}

// Where "Back" from bank account or cheque details should return to, given
// which secondary ID document (if any) was collected.
export function getStepBeforeBank(secondaryDoc) {
  return secondaryDoc === 'medicare' ? '/collector/medicare' : '/collector/secondary-id';
}
