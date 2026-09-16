import WinnersView from '@/components/views/WinnersView';

export const metadata = {
  title: 'Winners — Riverside Payouts Admin',
  description: 'Manage and audit jackpot winners, disbursements, and patron exclusion orders.',
};

export default function AdminWinnersPage() {
  return <WinnersView role="ADMIN" defaultVenue="Riverside RSL Club" />;
}
