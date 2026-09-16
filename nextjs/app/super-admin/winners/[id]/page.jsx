import WinnerDetailView from '@/components/views/WinnerDetailView';

export const metadata = {
  title: 'Winner Detail — Riverside Payouts Super Admin',
  description: 'Full patron dossier, transaction record, and global exclusion management.',
};

export default async function SuperAdminWinnerDetailPage({ params }) {
  const resolvedParams = await params;
  return <WinnerDetailView role="SUPER ADMIN" winnerId={resolvedParams?.id} />;
}
