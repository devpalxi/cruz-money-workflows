'use client';

import React from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminShell({ children, role = 'SUPER ADMIN' }) {
  const bgClass = role === 'SUPER ADMIN' ? 'bg-[#f4f7f9]' : 'bg-[#f7fafc]';

  return (
    <div className={`min-h-screen ${bgClass} text-[#102a43]`}>
      {/* Left Navigation Sidebar */}
      <AdminSidebar role={role} />

      {/* Main Content Area */}
      <div className="lg:pl-[236px] pt-16 lg:pt-0 transition-all duration-200">
        <main className="max-w-[1280px] mx-auto px-6 sm:px-8 py-8 sm:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
