import React from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Sliders,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import PageShell from '@/components/layout/PageShell';

export default function IndexHubPage() {
  const sections = [
    {
      title: 'Collector',
      description: 'Multi-step cash & bank transfer payout intake, with OCR and KYC identity verification.',
      icon: FileText,
      href: '/collector/payout-details',
    },
    {
      title: 'Approver',
      description: 'Duty manager review for approving, escalating, or rejecting payout transactions.',
      icon: CheckCircle2,
      href: '/approver/dashboard',
    },
    {
      title: 'Authoriser',
      description: 'Senior sign-off workflow for high-value threshold disbursements.',
      icon: ShieldCheck,
      href: '/authoriser/dashboard',
    },
    {
      title: 'Admin',
      description: 'Venue administration: payout auditing, blacklist management, AUSTRAC compliance.',
      icon: LayoutDashboard,
      href: '/admin/dashboard',
    },
    {
      title: 'Super Admin',
      description: 'Global multi-tenant control for client groups, licensing, and suspicious matters.',
      icon: Building2,
      href: '/super-admin/dashboard',
    },
    {
      title: 'Design System & UI Components',
      description: 'Component library covering buttons, semantic pill badges, form controls, and dossier layouts.',
      icon: Sliders,
      href: '/design-system',
    },
  ];

  return (
    <>
      <AppHeader role="ADMIN" />
      <main className="h-[calc(100dvh-68px)] w-full overflow-hidden flex flex-col">
        <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-7 flex-1 flex flex-col justify-center min-h-0">
          {/* Intro Hero */}
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 flex-shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-brand/10 text-brand text-[11px] font-bold uppercase tracking-[0.14em] mb-4 border border-brand/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Riverside Payouts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink-hi mb-2">
              Payout workflow &amp; compliance hub
            </h1>
            <p className="text-sm text-ink-mid leading-relaxed">
              Choose a workspace to continue.
            </p>
          </div>

          {/* Bento Grid of Sections */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 flex-shrink-0">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <Link
                  key={idx}
                  href={section.href}
                  className="group relative p-1.5 rounded-[1.5rem] bg-ink-hi/[0.04] ring-1 ring-ink-hi/[0.06] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:bg-brand/10 hover:ring-brand/20"
                >
                  <div className="flex flex-col justify-between h-full min-h-[130px] sm:min-h-[150px] rounded-[calc(1.5rem-0.375rem)] bg-surface-card border border-border p-4 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:border-brand/30">
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
                        <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-ink-hi/5 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-brand group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                        <ArrowRight className="w-3.5 h-3.5 text-ink-mid transition-colors duration-700 group-hover:text-white" strokeWidth={1.75} />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-ink-hi mb-1">{section.title}</h2>
                      <p className="text-[11px] sm:text-xs text-ink-mid leading-relaxed line-clamp-2">{section.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
