import BlacklistDetailView from '@/components/views/BlacklistDetailView';

export const metadata = {
  title: 'Blacklist record — Riverside Payouts Super Admin',
  description: 'Blacklist entry details, release date and exclusion management.',
};

export default async function SuperAdminBlacklistDetailPage({ params }) {
  const resolvedParams = await params;
  return <BlacklistDetailView role="SUPER ADMIN" entryId={resolvedParams?.id} />;
}
