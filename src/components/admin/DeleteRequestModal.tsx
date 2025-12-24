
'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface DeleteRequestModalProps {
  targetName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export default function DeleteRequestModal({ targetName, onConfirm, onCancel }: DeleteRequestModalProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>삭제 요청</DialogTitle>
          </div>
          <DialogDescription>
            <strong>{targetName}</strong>에 대한 삭제 요청을 본사에 전송합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <p>⚠️ 주의사항:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>삭제 요청은 본사 관리자의 승인이 필요합니다</li>
              <li>승인 전까지 해당 항목은 계속 사용 가능합니다</li>
              <li>본사 관리자에게 이메일로 알림이 전송됩니다</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">삭제 사유 (선택)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="삭제 요청 사유를 입력하세요"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button type="button" variant="destructive" onClick={handleConfirm}>
              삭제 요청
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
