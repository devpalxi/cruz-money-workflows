import React from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Settings,
  Sliders,
  Palette,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import AppHeader from '@/components/layout/AppHeader';
import PageShell from '@/components/layout/PageShell';

export default function IndexHubPage() {
  const sections = [
    {
      title: '1. Collector Flow (Step-by-Step Intake)',
      description: 'End-to-end multi-step cash & bank transfer payout intake wizard with OCR & KYC ID verification.',
      icon: FileText,
      badge: '13 Steps',
      badgeVariant: 'pass',
      links: [
        { name: '01. New Payout Details', href: '/collector/payout-details', tag: 'Start' },
        { name: '02. Payment Breakdown', href: '/collector/payment-breakdown' },
        { name: '03. Before You Start', href: '/collector/before-you-start' },
        { name: '04. Email Address', href: '/collector/email-address' },
        { name: '05. Primary ID Document Selection', href: '/collector/primary-id' },
        { name: '06. Driver Licence Detail', href: '/collector/licence-detail' },
        { name: '07. Passport Detail', href: '/collector/passport-detail' },
        { name: '08. Other Documents Detail', href: '/collector/other-documents' },
        { name: '09. No ID Option Detail', href: '/collector/no-id' },
        { name: '10. Secondary ID Landing', href: '/collector/secondary-id' },
        { name: '11. Medicare ID Detail', href: '/collector/medicare' },
        { name: '12. Bank Account Details', href: '/collector/bank-account' },
        { name: '13. Summary & Confirmation', href: '/collector/summary' },
      ],
    },
    {
      title: '2. Approver Scenarios (Duty Review)',
      description: 'Duty manager review dashboard for approving, escalating, or rejecting payout transactions.',
      icon: CheckCircle2,
      badge: '9 Presets',
      badgeVariant: 'info',
      links: [
        { name: '1. Dual hit (PEP & Sanctions)', href: '/approver/dual-hit', tag: 'High Risk' },
        { name: '2. Single hit (PEP Only)', href: '/approver/single-hit', tag: 'Medium' },
        { name: '3. Name mismatch', href: '/approver/name-mismatch', tag: 'Review' },
        { name: '4. All clear', href: '/approver/all-clear', tag: 'Low Risk' },
        { name: '5. Manual KYC', href: '/approver/manual-kyc', tag: 'Review' },
        { name: '6. No ID', href: '/approver/no-id', tag: 'High Risk' },
        { name: '7. Multi-ID pass', href: '/approver/multi-id-pass', tag: 'Pass' },
        { name: '8. Multi-ID mixed', href: '/approver/multi-id-mixed', tag: 'Review' },
        { name: '9. Blacklist match', href: '/approver/blacklist-match', tag: 'Alert' },
      ],
    },
    {
      title: '3. Authoriser Scenarios (Dual Sign-off)',
      description: 'Senior management authorization sign-off workflows for high-value threshold disbursements.',
      icon: ShieldCheck,
      badge: '6 Presets',
      badgeVariant: 'warn',
      links: [
        { name: '1. Dual hit Authorisation', href: '/authoriser/dual-hit', tag: 'Review' },
        { name: '5. Manual KYC Authorisation', href: '/authoriser/manual-kyc' },
        { name: '6. No ID Authorisation', href: '/authoriser/no-id' },
        { name: '7. Multi-ID Pass Authorisation', href: '/authoriser/multi-id-pass' },
        { name: '8. Multi-ID Mixed Authorisation', href: '/authoriser/multi-id-mixed' },
        { name: '9. Blacklist Match Authorisation', href: '/authoriser/blacklist-match', tag: 'Action Req' },
      ],
    },
    {
      title: '4. Admin Management Portal',
      description: 'Venue administrative suite for payout auditing, venue blacklist management, and AUSTRAC compliance.',
      icon: LayoutDashboard,
      badge: '7 Views',
      badgeVariant: 'pass',
      links: [
        { name: 'Admin Payouts Dashboard', href: '/admin/dashboard', tag: 'Main' },
        { name: 'Gaming Machines Management', href: '/admin/machines' },
        { name: 'Staff & Role Management', href: '/admin/users' },
        { name: 'Venue Blacklist Register', href: '/admin/blacklist' },
        { name: 'AUSTRAC Compliance Reports', href: '/admin/austrac' },
        { name: 'Billing & Invoice Statements', href: '/admin/billing' },
        { name: 'Venue Settings & Rules', href: '/admin/venue-settings' },
      ],
    },
    {
      title: '5. Super Admin Portal',
      description: 'Global multi-tenant system control for hospitality client groups, licensing, and suspicious matters.',
      icon: Building2,
      badge: '6 Views',
      badgeVariant: 'neutral',
      links: [
        { name: 'Super Admin Dashboard', href: '/super-admin/dashboard' },
        { name: 'Client Organizations Directory', href: '/super-admin/clients' },
        { name: 'Global Blacklist System', href: '/super-admin/blacklist' },
        { name: 'Cross-Venue Payouts Ledger', href: '/super-admin/payouts' },
        { name: 'All Venues Directory & Settings', href: '/super-admin/venue' },
        { name: 'Suspicious Matter Reports (SMR)', href: '/super-admin/smr' },
      ],
    },
    {
      title: '6. Design System & UI Components',
      description: 'Comprehensive UI component library showcasing buttons, semantic pill badges, form controls, and dossier layouts.',
      icon: Sliders,
      badge: 'Design Tokens',
      badgeVariant: 'pass',
      links: [
        { name: 'Design System & UI Library', href: '/design-system', tag: 'Showcase' },
        { name: 'Semantic Pill Badges Reference', href: '/design-system' },
        { name: 'Buttons & Action Triggers', href: '/design-system' },
        { name: 'Form Controls & Tabular Numerals', href: '/design-system' },
        { name: 'Detail Dossier 2-Column Grid', href: '/design-system' },
        { name: 'Relational Panels & Banners', href: '/design-system' },
      ],
    },
  ];

  return (
    <>
      <AppHeader role="ADMIN" />
      <PageShell maxWidth="max-w-[1240px]">
        {/* Intro Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-brand/10 text-brand text-xs font-bold mb-3 border border-brand/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Riverside Payouts Unified Next.js Prototype</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink-hi mb-3">
            Payout Workflow &amp; Compliance Hub
          </h1>
          <p className="text-sm sm:text-base text-ink-mid leading-relaxed">
            Standardized Next.js interface components and templates across Collector, Approver,
            Authoriser, and Administration workflows.
          </p>
        </div>

        {/* Grid of Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <Card
                key={idx}
                padding="none"
                className="flex flex-col overflow-hidden border border-border shadow-card hover:shadow-md transition-shadow"
              >
                {/* Section Header */}
                <div className="p-5 border-b border-border bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant={section.badgeVariant} size="sm">
                      {section.badge}
                    </Badge>
                  </div>
                  <h2 className="text-base font-bold text-ink-hi mb-1">{section.title}</h2>
                  <p className="text-xs text-ink-mid line-clamp-2">{section.description}</p>
                </div>

                {/* Section Links */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <ul className="space-y-1.5">
                    {section.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <Link
                          href={link.href}
                          className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-ink-hi hover:text-brand hover:bg-brand/5 border border-transparent hover:border-brand/20 transition-all group"
                        >
                          <span className="truncate pr-2">{link.name}</span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {link.tag && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-ink-mid group-hover:bg-brand/10 group-hover:text-brand">
                                {link.tag}
                              </span>
                            )}
                            <ArrowRight className="w-3.5 h-3.5 text-ink-lo group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      </PageShell>
    </>
  );
}
