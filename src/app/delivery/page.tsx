'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeliveryPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/deliver');
  }, [router]);

  return null;
}
