'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import AustracReportHelperView from '@/components/views/AustracReportHelperView';

export default function AdminAustracDetailPage() {
  const params = useParams();
  const txId = params?.id ? decodeURIComponent(params.id) : 'TX-570';

  return <AustracReportHelperView txId={txId} role="ADMIN" />;
}
