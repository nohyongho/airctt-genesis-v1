
'use client';

import { StopCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminStatus } from '@/lib/admin/types';

interface StopButtonProps {
  status: AdminStatus;
  onStop: () => void;
  onResume: () => void;
}

export default function StopButton({ status, onStop, onResume }: StopButtonProps) {
  if (status === 'STOPPED') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onResume}
        className="border-green-500 text-green-600 hover:bg-green-50"
      >
        <PlayCircle className="h-4 w-4 mr-1" />
        재개
      </Button>
    );
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onStop}
    >
      <StopCircle className="h-4 w-4 mr-1" />
      정지
    </Button>
  );
}
