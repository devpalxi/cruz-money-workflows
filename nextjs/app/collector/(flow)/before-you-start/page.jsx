'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Shield, CreditCard, UserCheck } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function BeforeYouStartPage() {
  const router = useRouter();

  const requirements = [
    {
      icon: Mail,
      text: 'A valid email address',
    },
    {
      icon: Shield,
      text: 'Australian Driver licence, or Passport',
    },
    {
      icon: CreditCard,
      text: 'Your bank account details, for the transfer portion of your payout',
    },
  ];

  const eligibility = [
    {
      icon: UserCheck,
      text: 'You must be 18 years or older',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Row */}
          <div className="flex items-center gap-6 mb-2">
            <button
              type="button"
              onClick={() => router.push('/collector/payment-breakdown')}
              className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-hi hover:text-black transition-colors underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-brand" />
              <span>Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-ink-hi">Before you begin</h1>
          </div>

          <p className="text-[15.5px] text-ink-mid mb-6">
            This takes about 5 minutes to complete.
          </p>

          <Card padding="md" className="border-border shadow-card space-y-7">
            {/* What you'll need */}
            <div className="space-y-3">
              <h2 className="text-[13px] font-semibold text-ink-mid">
                What you&apos;ll need
              </h2>
              <div className="space-y-3.5 pt-1">
                {requirements.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3.5 text-ink-hi"
                    >
                      <Icon className="w-5 h-5 text-ink-hi flex-shrink-0" />
                      <span className="text-[15.5px] font-medium leading-normal">
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Eligibility */}
            <div className="space-y-3 pt-2">
              <h2 className="text-[13px] font-semibold text-ink-mid">
                Eligibility
              </h2>
              <div className="space-y-3.5 pt-1">
                {eligibility.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3.5 text-ink-hi"
                    >
                      <Icon className="w-5 h-5 text-ink-hi flex-shrink-0" />
                      <span className="text-[15.5px] font-medium leading-normal">
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* CTA */}
          <div className="mt-6">
            <Button
              size="lg"
              onClick={() => router.push('/collector/email-address')}
              className="w-full h-12 text-[16px] font-semibold"
            >
              <span>Get started</span>
            </Button>
          </div>
    </div>
  );
}
