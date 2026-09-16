'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  Building2,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Gamepad2,
  Sliders,
  Smartphone,
  Users,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import SegmentedBooleanToggle from '@/components/ui/SegmentedBooleanToggle';
import Stepper from '@/components/layout/Stepper';

const onboardingSteps = [
  { key: 'create', title: 'Create Venue' },
  { key: 'details', title: 'Legal Details' },
  { key: 'machines', title: 'Machines' },
  { key: 'payout-controls', title: 'Payout Controls' },
  { key: 'identity-verification', title: 'IDV Policies' },
  { key: 'devices-branding', title: 'Terminal Branding' },
  { key: 'team-roles', title: 'Team & Roles' },
];

export default function VenueOnboardingStepPage() {
  const params = useParams();
  const router = useRouter();
  const stepKey = (params?.step || 'create');

  // Multi-step form store
  const [orgName, setOrgName] = useState('Riverside Leagues Ltd');
  const [venueName, setVenueName] = useState('Riverside RSL Club');
  const [abn, setAbn] = useState('88 124 982 104');
  const [license, setLicense] = useState('LIQC44001928');
  const [email, setEmail] = useState('admin@riversidersl.com.au');
  const [phone, setPhone] = useState('(02) 9841 2000');
  const [address, setAddress] = useState('142 Pacific Hwy, North Sydney NSW 2060');

  // Machines
  const [machineCount, setMachineCount] = useState('12');
  const [egmPrefix, setEgmPrefix] = useState('EGM');

  // Payout controls
  const [dailyCap, setDailyCap] = useState('150000');
  const [cashCap, setCashCap] = useState('5000');
  const [dualSignoff, setDualSignoff] = useState(true);

  // IDV policies
  const [dvsLicence, setDvsLicence] = useState(true);
  const [dvsPassport, setDvsPassport] = useState(true);
  const [medicareIdv, setMedicareIdv] = useState(true);
  const [pepScreening, setPepScreening] = useState(true);

  // Terminal Branding
  const [posDevices, setPosDevices] = useState('3');
  const [customReceipts, setCustomReceipts] = useState(true);

  // Team
  const [adminUser, setAdminUser] = useState('j.chen@riversidersl.com.au');
  const [collectorCount, setCollectorCount] = useState('5');

  const currentStepIndex = onboardingSteps.findIndex((s) => s.key === stepKey);
  const currentStepNumber = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStepIndex < onboardingSteps.length - 1) {
      const nextStepKey = onboardingSteps[currentStepIndex + 1].key;
      router.push(`/venue/onboarding/${nextStepKey}`);
    } else {
      router.push('/super-admin/venue?created=1');
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevStepKey = onboardingSteps[currentStepIndex - 1].key;
      router.push(`/venue/onboarding/${prevStepKey}`);
    } else {
      router.push('/super-admin/venue');
    }
  };

  return (
    <>
      <AppHeader role="SUPER ADMIN" activePage="venues" />

      <div className="w-full max-w-[840px] mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back Link */}
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-mid hover:text-brand transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{currentStepIndex === 0 ? 'Back to Venues' : 'Previous Step'}</span>
        </button>

        {/* Stepper Progress Bar */}
        <Stepper currentStep={currentStepNumber} totalSteps={onboardingSteps.length} />

        {/* Title */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand font-mono">
              Step {currentStepNumber} of {onboardingSteps.length}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-ink-hi">
            {onboardingSteps[currentStepIndex]?.title || 'Venue Onboarding'}
          </h1>
          <p className="text-xs text-ink-mid mt-0.5">
            Configure operational credentials and compliance modules for this facility.
          </p>
        </div>

        {/* Step Form Card */}
        <Card padding="lg" className="border-border shadow-card">
          <form onSubmit={handleNext} className="space-y-6 text-xs">
            {/* Step 1: Create */}
            {stepKey === 'create' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-ink-hi">
                    Organisation Legal Entity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Riverside Leagues Ltd"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="h-11 px-3 border border-border rounded-md text-ink-hi text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-ink-hi">
                    Venue Trading Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Riverside RSL Club"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="h-11 px-3 border border-border rounded-md text-ink-hi text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Legal Details */}
            {stepKey === 'details' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-ink-hi">ABN Number</label>
                  <input
                    type="text"
                    required
                    value={abn}
                    onChange={(e) => setAbn(e.target.value)}
                    className="h-10 px-3 border border-border rounded font-mono text-ink-hi outline-none focus:border-brand"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-ink-hi">Gaming Licence No.</label>
                  <input
                    type="text"
                    required
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="h-10 px-3 border border-border rounded font-mono text-ink-hi outline-none focus:border-brand"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-ink-hi">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 px-3 border border-border rounded text-ink-hi outline-none focus:border-brand"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-ink-hi">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-10 px-3 border border-border rounded font-mono text-ink-hi outline-none focus:border-brand"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="font-bold text-ink-hi">Physical Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-10 px-3 border border-border rounded text-ink-hi outline-none focus:border-brand"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Machines */}
            {stepKey === 'machines' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-ink-hi">Total EGM Gaming Terminals</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={machineCount}
                    onChange={(e) => setMachineCount(e.target.value)}
                    className="h-11 px-3 border border-border rounded-md font-mono text-ink-hi text-sm outline-none focus:border-brand"
                  />
                  <span className="text-[11px] text-ink-lo">
                    System will automatically provision initial sequential terminal IDs.
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-ink-hi">Machine Code Prefix</label>
                  <input
                    type="text"
                    value={egmPrefix}
                    onChange={(e) => setEgmPrefix(e.target.value)}
                    className="h-11 px-3 border border-border rounded-md font-mono text-ink-hi text-sm outline-none focus:border-brand"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Payout Controls */}
            {stepKey === 'payout-controls' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-ink-hi">Max Cash Cap (AUD)</label>
                    <input
                      type="number"
                      required
                      value={cashCap}
                      onChange={(e) => setCashCap(e.target.value)}
                      className="h-10 px-3 border border-border rounded font-mono font-bold text-ink-hi outline-none focus:border-brand"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-ink-hi">Daily Venue Cap (AUD)</label>
                    <input
                      type="number"
                      required
                      value={dailyCap}
                      onChange={(e) => setDailyCap(e.target.value)}
                      className="h-10 px-3 border border-border rounded font-mono font-bold text-ink-hi outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between p-3.5 rounded-lg bg-white border border-[#e2e8f0]">
                  <div>
                    <div className="font-bold text-ink-hi">Require Dual Sign-off</div>
                    <div className="text-[11px] text-ink-mid">Require Approver + Authoriser sign-off for large disbursements</div>
                  </div>
                  <SegmentedBooleanToggle
                    value={dualSignoff}
                    onChange={setDualSignoff}
                    trueLabel="Enabled"
                    falseLabel="Disabled"
                  />
                </div>
              </div>
            )}

            {/* Step 5: IDV Policies */}
            {stepKey === 'identity-verification' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-white border border-[#e2e8f0]">
                  <span className="font-bold text-ink-hi">DVS Driver Licence Verification</span>
                  <SegmentedBooleanToggle
                    value={dvsLicence}
                    onChange={setDvsLicence}
                    trueLabel="Enabled"
                    falseLabel="Disabled"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg bg-white border border-[#e2e8f0]">
                  <span className="font-bold text-ink-hi">DVS Passport Verification</span>
                  <SegmentedBooleanToggle
                    value={dvsPassport}
                    onChange={setDvsPassport}
                    trueLabel="Enabled"
                    falseLabel="Disabled"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg bg-white border border-[#e2e8f0]">
                  <span className="font-bold text-ink-hi">Medicare Card Verification</span>
                  <SegmentedBooleanToggle
                    value={medicareIdv}
                    onChange={setMedicareIdv}
                    trueLabel="Enabled"
                    falseLabel="Disabled"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg bg-white border border-[#e2e8f0]">
                  <span className="font-bold text-ink-hi">Automated PEP Screening</span>
                  <SegmentedBooleanToggle
                    value={pepScreening}
                    onChange={setPepScreening}
                    trueLabel="Enabled"
                    falseLabel="Disabled"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Branding */}
            {stepKey === 'devices-branding' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-ink-hi">Total Cashier POS Tablets</label>
                  <input
                    type="number"
                    min="1"
                    value={posDevices}
                    onChange={(e) => setPosDevices(e.target.value)}
                    className="h-10 px-3 border border-border rounded font-mono text-ink-hi outline-none focus:border-brand"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg bg-white border border-[#e2e8f0]">
                  <div>
                    <div className="font-bold text-ink-hi">Print Venue Branding on Receipts</div>
                    <div className="text-[11px] text-ink-mid">Include custom header logo and disclaimer text</div>
                  </div>
                  <SegmentedBooleanToggle
                    value={customReceipts}
                    onChange={setCustomReceipts}
                    trueLabel="Enabled"
                    falseLabel="Disabled"
                  />
                </div>
              </div>
            )}

            {/* Step 7: Team */}
            {stepKey === 'team-roles' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-ink-hi">Initial Venue Admin Email</label>
                  <input
                    type="email"
                    required
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    className="h-10 px-3 border border-border rounded text-ink-hi outline-none focus:border-brand"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-ink-hi">Initial Collector Accounts</label>
                  <input
                    type="number"
                    min="1"
                    value={collectorCount}
                    onChange={(e) => setCollectorCount(e.target.value)}
                    className="h-10 px-3 border border-border rounded font-mono text-ink-hi outline-none focus:border-brand"
                  />
                </div>
              </div>
            )}

            {/* Step Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <Button variant="secondary" size="md" type="button" onClick={handleBack}>
                Back
              </Button>

              <Button size="md" type="submit">
                <span>
                  {currentStepIndex === onboardingSteps.length - 1
                    ? 'Complete Onboarding'
                    : 'Save & Next'}
                </span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
