
'use client';

import { useAdminStore } from '@/lib/admin/store';
import ProfileForm from '@/components/admin/ProfileForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAdminStore();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">프로필 수정</h1>
          <p className="text-muted-foreground">개인 정보 및 프로필을 관리하세요</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>계정 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">역할</span>
            <span className="font-medium">
              {currentUser.role === 'HQ' && '본사 관리자'}
              {currentUser.role === 'ADMIN' && '지점 관리자'}
              {currentUser.role === 'MERCHANT' && '가맹점'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">계정 ID</span>
            <span className="font-mono text-sm">{currentUser.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">가입일</span>
            <span>{new Date(currentUser.createdAt).toLocaleDateString('ko-KR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">상태</span>
            <span className={`font-medium ${
              currentUser.status === 'ACTIVE' ? 'text-green-600' :
              currentUser.status === 'STOPPED' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {currentUser.status === 'ACTIVE' && '활성'}
              {currentUser.status === 'STOPPED' && '정지'}
              {currentUser.status === 'PENDING_DELETE' && '삭제 대기'}
            </span>
          </div>
        </CardContent>
      </Card>

      <ProfileForm user={currentUser} onSave={updateProfile} />
    </div>
  );
}
