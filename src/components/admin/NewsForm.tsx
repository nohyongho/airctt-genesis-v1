
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { News } from '@/lib/admin/types';

interface NewsFormProps {
  news?: News;
  onClose: () => void;
  onSave: (news: Partial<News>) => void;
}

export default function NewsForm({ news, onClose, onSave }: NewsFormProps) {
  const [formData, setFormData] = useState({
    title: news?.title || '',
    content: news?.content || '',
    pinned: news?.pinned || false,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {news ? '소식 수정' : '새 소식 작성'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="소식 제목을 입력하세요"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">내용 *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="소식 내용을 입력하세요"
              rows={8}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pinned"
              checked={formData.pinned}
              onCheckedChange={(checked) => handleChange('pinned', checked as boolean)}
            />
            <Label htmlFor="pinned" className="cursor-pointer">
              상단에 고정
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">
              {news ? '수정' : '작성'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
