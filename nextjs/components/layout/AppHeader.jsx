'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, User } from 'lucide-react';
import { getDisbursementFlags } from '@/lib/payoutFlow';

export default function AppHeader({ role = 'ADMIN' }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Bank account and Cheque details always stay in the list - only the
  // method actually picked on the first step is skipped, not the step
  // itself, so both are always visible and marked "not required" when they
  // don't apply. `null` means the disbursement method hasn't been read yet.
  const [disbursementMethod, setDisbursementMethod] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      setDisbursementMethod(saved.disbursementMethod || '');
    } catch (e) {
      setDisbursementMethod('');
    }
  }, []);

  const adminNavLinks = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Machines', href: '/admin/machines' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Venue Blacklist', href: '/admin/blacklist' },
    { label: 'AUSTRAC Reports', href: '/admin/austrac' },
    { label: 'Billing', href: '/admin/billing' },
    { label: 'Venue settings', href: '/admin/venue-settings' },
  ];

  const { hasBank, hasCheque } = getDisbursementFlags(disbursementMethod);
  const isStepSkipped = (href) => {
    if (disbursementMethod === null) return false;
    if (href === '/collector/bank-account') return !hasBank;
    if (href === '/collector/cheque-details') return !hasCheque;
    return false;
  };

  const collectorSteps = [
    { title: 'Payout details', href: '/collector/payout-details' },
    { title: 'Payment breakdown', href: '/collector/payment-breakdown' },
    { title: 'Email address', href: '/collector/email-address' },
    { title: 'Primary ID', href: '/collector/primary-id' },
    { title: 'Secondary ID', href: '/collector/secondary-id' },
    { title: 'Bank account', href: '/collector/bank-account' },
    { title: 'Cheque details', href: '/collector/cheque-details' },
    { title: 'Summary', href: '/collector/summary' },
  ];
  const collectorNavLinks = collectorSteps.map((item, idx) => ({
    label: `${idx + 1}. ${item.title}`,
    href: item.href,
    skipped: isStepSkipped(item.href),
  }));

  const links =
    role === 'SUPER ADMIN'
      ? superAdminNavLinks
      : role === 'COLLECTOR'
      ? collectorNavLinks
      : adminNavLinks;

  const isLinkActive = (href) => {
    if (pathname === href) return true;
    if (href === '/collector/primary-id') {
      return (
        pathname.startsWith('/collector/licence-detail') ||
        pathname.startsWith('/collector/passport-detail') ||
        pathname.startsWith('/collector/other-documents') ||
        pathname.startsWith('/collector/no-id')
      );
    }
    if (href === '/collector/secondary-id') {
      return pathname.startsWith('/collector/medicare');
    }
    if (href === '/collector/email-address') {
      return pathname.startsWith('/collector/before-you-start');
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-surface-card border-b border-border shadow-nav select-none">
      <div className="max-w-[1440px] mx-auto h-[68px] px-4 sm:px-7 flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-ink-mid hover:text-ink-hi rounded-md hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo & Role Badge */}
        <div className="flex items-center gap-3.5">
          <Link href="/" className="flex flex-col text-left group">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] rounded-md shadow-2xs">
                {role}
              </span>
            </div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-ink-hi group-hover:text-brand transition-colors">
              RIVERSIDE PAYOUTS
            </span>
            <span className="text-[10.5px] uppercase font-semibold tracking-wider text-ink-lo hidden sm:block">
              COMPLIANCE & AML DATABASE
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 overflow-x-auto py-1">
          {links.map((link) => {
            const isActive = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1.5 rounded-md text-[13px] font-semibold whitespace-nowrap transition-all ${
                  link.skipped
                    ? 'text-ink-lo hover:text-ink-mid hover:bg-slate-100'
                    : isActive
                    ? 'bg-brand/10 text-brand font-bold'
                    : 'text-ink-mid hover:text-ink-hi hover:bg-slate-100'
                }`}
              >
                {link.label}
                {link.skipped && <span className="font-normal"> (not required)</span>}
              </Link>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pl-2">
            <span className="text-xs font-bold text-ink-hi hidden md:block">J.Chen</span>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-surface-card px-4 py-3 space-y-1 shadow-lg">
          {links.map((link) => {
            const isActive = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  link.skipped
                    ? 'text-ink-lo hover:text-ink-mid hover:bg-slate-100'
                    : isActive
                    ? 'bg-brand/10 text-brand font-bold'
                    : 'text-ink-mid hover:text-ink-hi hover:bg-slate-100'
                }`}
              >
                {link.label}
                {link.skipped && <span className="font-normal"> (not required)</span>}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
