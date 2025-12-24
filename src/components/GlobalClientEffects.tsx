
'use client';

import { useEffect } from 'react';
import { cttDataService } from '@/lib/ctt-data-service';

export default function GlobalClientEffects() {
  useEffect(() => {
    cttDataService.initialize();
  }, []);

  return null;
}
