
'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MerchantForm from '@/components/merchants/MerchantForm';

function NewMerchantContent() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/merchants')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            가맹점 목록으로 돌아가기
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">새 가맹점 등록</h1>
          <p className="text-muted-foreground">
            새로운 가맹점의 정보를 입력하세요
          </p>
        </div>

        <div className="max-w-2xl">
          <MerchantForm mode="create" />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function NewMerchantPage() {
  return (
    <ProtectedRoute>
      <NewMerchantContent />
    </ProtectedRoute>
  );
}
