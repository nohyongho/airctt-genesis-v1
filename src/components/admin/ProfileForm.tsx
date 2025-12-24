
'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AvatarUpload from './AvatarUpload';
import { AdminUser } from '@/lib/admin/types';
import { toast } from 'sonner';

interface ProfileFormProps {
  user: AdminUser;
  onSave: (updates: Partial<AdminUser>) => void;
}

export default function ProfileForm({ user, onSave }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email || '',
    phone: user.phone || '',
    description: user.description || '',
    profileImageUrl: user.profileImageUrl || '',
    profileVideoUrl: user.profileVideoUrl || '',
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSave(formData);
      toast.success('프로필이 저장되었습니다');
    } catch (error) {
      toast.error('저장 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="이름을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="010-1234-5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">소개</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="자기소개를 입력하세요"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AvatarUpload
          type="image"
          currentUrl={formData.profileImageUrl}
          onUploadComplete={(url) => handleChange('profileImageUrl', url)}
          userId={user.id}
        />

        <AvatarUpload
          type="video"
          currentUrl={formData.profileVideoUrl}
          onUploadComplete={(url) => handleChange('profileVideoUrl', url)}
          userId={user.id}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  );
}
