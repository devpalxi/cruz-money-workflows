'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  User,
  LayoutDashboard,
  Trophy,
  Building2,
  Briefcase,
  Cpu,
  Users,
  CircleDollarSign,
  ShieldAlert,
  FileText,
  FileCheck2,
  CreditCard,
  SlidersHorizontal,
  Settings
} from 'lucide-react';

export default function AdminSidebar({ role = 'SUPER ADMIN' }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const superAdminLinks = [
    { label: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
    { label: 'Winners', href: '/super-admin/winners', icon: Trophy },
    { label: 'Venues', href: '/super-admin/venue', icon: Building2 },
    { label: 'Clients', href: '/super-admin/clients', icon: Briefcase },
    { label: 'Machines', href: '/super-admin/machines', icon: Cpu },
    { label: 'Users', href: '/super-admin/users', icon: Users },
    { label: 'Payouts', href: '/super-admin/payouts', icon: CircleDollarSign },
    { label: 'Venue Blacklist', href: '/super-admin/blacklist', icon: ShieldAlert },
    { label: 'AUSTRAC / SMRs', href: '/super-admin/smr', icon: FileCheck2 },
    { label: 'Billing', href: '/super-admin/billing', icon: CreditCard },
    { label: 'Administration', href: '/super-admin/administration', icon: SlidersHorizontal },
  ];

  const adminLinks = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Winners', href: '/admin/winners', icon: Trophy },
    { label: 'Machines', href: '/admin/machines', icon: Cpu },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Venue Blacklist', href: '/admin/blacklist', icon: ShieldAlert },
    { label: 'AUSTRAC Reports', href: '/admin/austrac', icon: FileText },
    { label: 'Billing', href: '/admin/billing', icon: CreditCard },
    { label: 'Venue settings', href: '/admin/venue-settings', icon: Settings },
  ];

  const links = role === 'SUPER ADMIN' ? superAdminLinks : adminLinks;

  const isLinkActive = (href) => {
    if (href === '/super-admin/dashboard' || href === '/admin/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#d9e2ec] z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-md text-[#102a43] hover:bg-[#f4f7f9] border border-[#d9e2ec]"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <span className="text-[13.5px] font-bold text-[#0d9488] tracking-tight block leading-tight">
              RIVERSIDE PAYOUTS
            </span>
            <span className="inline-block text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] leading-none mt-0.5">
              {role}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#102a43]">J.Chen</span>
          <div className="w-7 h-7 rounded-full bg-[#0d9488] text-white flex items-center justify-center text-xs font-bold">
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-[236px] bg-white border-r border-[#d9e2ec] flex flex-col justify-between transition-transform duration-200 ease-in-out
          lg:translate-x-0 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
      >
        <div className="px-3.5 py-3.5 flex flex-col flex-1 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Header Brand */}
          <div className="pb-3 mb-2.5 border-b border-[#d9e2ec]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] shadow-2xs">
                {role}
              </span>
            </div>
            <Link href="/" className="block group">
              <h1 className="text-[14.5px] font-bold tracking-tight text-[#0d9488] group-hover:opacity-90 leading-tight">
                RIVERSIDE PAYOUTS
              </h1>
              <p className="text-[9px] font-bold tracking-widest text-[#627d98] uppercase mt-0.5 leading-tight">
                COMPLIANCE &amp; AML DATABASE
              </p>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-[2px] flex-1">
            {links.map((link) => {
              const active = isLinkActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center h-[34px] px-3 rounded-md text-[13px] transition-colors
                    ${
                      active
                        ? 'bg-[#f0fdfa] text-[#0d9488] font-bold'
                        : 'text-[#475569] font-medium hover:bg-[#f4f7f9] hover:text-[#102a43]'
                    }`}
                >
                  <Icon
                    className={`w-4 h-4 mr-2.5 flex-shrink-0 transition-colors ${
                      active ? 'text-[#0d9488]' : 'text-[#627d98] group-hover:text-[#102a43]'
                    }`}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer & User Profile */}
        <div className="px-3.5 py-3 border-t border-[#d9e2ec] flex flex-col gap-2.5 bg-white flex-shrink-0">
          <div>
            {role === 'SUPER ADMIN' ? (
              <Link
                href="/admin/dashboard"
                className="text-[12px] font-bold text-[#0d9488] hover:text-[#0b7a6f] hover:underline block"
              >
                &rarr; Switch to Admin
              </Link>
            ) : (
              <Link
                href="/super-admin/dashboard"
                className="text-[12px] font-bold text-[#0d9488] hover:text-[#0b7a6f] hover:underline block"
              >
                &rarr; Switch to Super Admin
              </Link>
            )}
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[13.5px] font-bold text-[#102a43]">J.Chen</span>
            <div className="w-7 h-7 rounded-full bg-[#0d9488] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
