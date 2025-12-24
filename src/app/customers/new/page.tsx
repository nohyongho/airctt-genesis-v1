
'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CustomerForm from '@/components/customers/CustomerForm';

function NewCustomerContent() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            대시보드로 돌아가기
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">새 고객 등록</h1>
          <p className="text-muted-foreground">
            새로운 고객의 정보를 입력하세요
          </p>
        </div>

        <div className="max-w-2xl">
          <CustomerForm mode="create" />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function NewCustomerPage() {
  return (
    <ProtectedRoute>
      <NewCustomerContent />
    </ProtectedRoute>
  );
}
