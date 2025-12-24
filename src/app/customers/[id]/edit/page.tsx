
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CustomerForm from '@/components/customers/CustomerForm';
import { customerService, Customer } from '@/lib/customers';
import { toast } from 'sonner';

function EditCustomerContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const found = customerService.getById(id);
      if (!found) {
        toast.error('고객을 찾을 수 없습니다.');
        router.push('/dashboard');
      } else {
        setCustomer(found);
      }
      setIsLoading(false);
    }
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/customers/${customer.id}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            상세 페이지로 돌아가기
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">고객 정보 수정</h1>
          <p className="text-muted-foreground">
            {customer.name}님의 정보를 수정하세요
          </p>
        </div>

        <div className="max-w-2xl">
          <CustomerForm mode="edit" customer={customer} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function EditCustomerPage() {
  return (
    <ProtectedRoute>
      <EditCustomerContent />
    </ProtectedRoute>
  );
}
