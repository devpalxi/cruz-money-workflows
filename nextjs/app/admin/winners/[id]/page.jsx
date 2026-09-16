import WinnerDetailView from '@/components/views/WinnerDetailView';

export const metadata = {
  title: 'Winner Detail — Riverside Payouts Admin',
  description: 'Full patron dossier, transaction record, and exclusion management.',
};

export default async function AdminWinnerDetailPage({ params }) {
  const resolvedParams = await params;
  return <WinnerDetailView role="ADMIN" winnerId={resolvedParams?.id} />;
}
