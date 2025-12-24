
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Connection, ConnectionType } from '@/lib/admin/types';

interface ConnectionFormProps {
  connection?: Connection;
  onClose: () => void;
  onSave: (connection: Partial<Connection>) => void;
}

const connectionTypes: { value: ConnectionType; label: string }[] = [
  { value: 'KARAOKE', label: '노래방' },
  { value: 'STORE', label: '매장' },
  { value: 'ONLINE', label: '온라인' },
  { value: 'OTHER', label: '기타' },
];

export default function ConnectionForm({ connection, onClose, onSave }: ConnectionFormProps) {
  const [formData, setFormData] = useState({
    name: connection?.name || '',
    type: connection?.type || ('STORE' as ConnectionType),
    description: connection?.description || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {connection ? '연결 수정' : '새 연결 추가'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">연결 이름 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="예: 강남점 메인 매장"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">연결 타입 *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {connectionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="연결에 대한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">
              {connection ? '수정' : '생성'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
