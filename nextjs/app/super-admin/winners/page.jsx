import WinnersView from '@/components/views/WinnersView';

export const metadata = {
  title: 'Global Winners — Riverside Payouts Super Admin',
  description: 'Multi-venue jackpot winning transactions, AML/PEP audits, and global exclusion management.',
};

export default function SuperAdminWinnersPage() {
  return <WinnersView role="SUPER ADMIN" />;
}
