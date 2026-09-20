import BlacklistDetailView from '@/components/views/BlacklistDetailView';

export const metadata = {
  title: 'Blacklist record — Riverside Payouts Admin',
  description: 'Blacklist entry details, release date and exclusion management.',
};

export default async function AdminBlacklistDetailPage({ params }) {
  const resolvedParams = await params;
  return <BlacklistDetailView role="ADMIN" entryId={resolvedParams?.id} />;
}
