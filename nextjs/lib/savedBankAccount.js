// Finds a bank account kept from an earlier payout for the winner in the
// current collector form, so the Bank account step can offer it again.
//
// Two places can hold one: the returning winner store (matched by email on the
// email step) and the club membership record (matched by the member lookup).
// The returning winner record wins because it comes from a payout the platform
// has already verified with CoP. Nothing here skips CoP: the collector still
// runs the check on a saved account every time.

export function maskAccountNumber(accountNumber) {
  const digits = String(accountNumber || '').replace(/[^0-9]/g, '');
  if (digits.length <= 3) return digits;
  return `***-***-${digits.slice(-3)}`;
}

export function getSavedBankAccount(form = {}) {
  const returning = form.returningPlayerMatch ? form.returningPlayerData : null;
  if (returning?.bsb && returning?.accountNumber) {
    return {
      accountName: returning.accountName || returning.fullName || '',
      bsb: returning.bsb,
      accountNumber: returning.accountNumber,
      source: 'previous_payout',
      note: returning.verifiedDate
        ? `Saved from a previous payout, last verified ${returning.verifiedDate}`
        : 'Saved from a previous payout',
    };
  }

  const onFile = form.prefilledMember?.bankDetailsOnFile;
  if (onFile?.bsb && onFile?.accountNumber) {
    return {
      accountName: onFile.accountName || form.prefilledMember.fullName || '',
      bsb: onFile.bsb,
      accountNumber: onFile.accountNumber,
      source: 'club_membership',
      note: `Held on the ${form.prefilledMember.system || 'club membership'} record`,
    };
  }

  return null;
}
