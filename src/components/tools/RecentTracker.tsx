'use client';

import { useEffect } from 'react';
import { recordToolVisit } from '@/lib/toolState';

export default function RecentTracker({ toolId }: { toolId: string }) {
  useEffect(() => {
    recordToolVisit(toolId);
  }, [toolId]);

  return null;
}
