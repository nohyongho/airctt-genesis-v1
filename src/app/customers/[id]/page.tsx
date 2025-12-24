
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, Mail, Building2, Calendar, Clock, Plus, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { customerService, Customer } from '@/lib/customers';
import { pointService } from '@/lib/points';
import { toast } from 'sonner';

function CustomerDetailContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPointDialog, setShowPointDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pointBalance, setPointBalance] = useState(0);
  
  // 포인트 적립 폼 상태
  const [pointAmount, setPointAmount] = useState('');
  const [pointDescription, setPointDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const found = customerService.getById(id);
      if (!found) {
        toast.error('고객을 찾을 수 없습니다.');
        router.push('/dashboard');
      } else {
        setCustomer(found);
        // 포인트 잔액 조회
        const balance = pointService.getCustomerBalance(id);
        setPointBalance(balance);
      }
      setIsLoading(false);
    }
  }, [id, router]);

  const handleDelete = async () => {
    if (!customer) return;

    try {
      customerService.delete(customer.id);
      toast.success('고객이 삭제되었습니다.');
      router.push('/dashboard');
    } catch (error) {
      toast.error('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handlePointSubmit = async () => {
    if (!customer) return;

    const amount = parseInt(pointAmount);
    
    if (!pointAmount || isNaN(amount) || amount <= 0) {
      toast.error('올바른 포인트를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      pointService.create({
        customerId: customer.id,
        customerName: customer.name,
        points: amount,
        type: 'earn',
        description: pointDescription || '포인트 적립',
      });

      // 포인트 잔액 업데이트
      const newBalance = pointService.getCustomerBalance(customer.id);
      setPointBalance(newBalance);

      toast.success(`${amount}P가 적립되었습니다.`);
      
      // 폼 초기화 및 다이얼로그 닫기
      setPointAmount('');
      setPointDescription('');
      setShowPointDialog(false);
    } catch (error: any) {
      toast.error(error?.message || '포인트 적립에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            대시보드로 돌아가기
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>고객 상세 정보</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="default"
                    onClick={() => setShowPointDialog(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    포인트 적립하기
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/customers/${customer.id}/edit`)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    수정
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                {customer.photoUrl ? (
                  <img
                    src={customer.photoUrl}
                    alt={customer.name}
                    className="h-32 w-32 rounded-full object-cover border-4 border-border"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-border">
                    <span className="text-4xl font-bold text-primary">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1 space-y-4 text-center sm:text-left">
                  <div>
                    <h2 className="text-3xl font-bold mb-1">{customer.name}</h2>
                    {customer.company && (
                      <p className="text-lg text-muted-foreground">{customer.company}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <a
                        href={`mailto:${customer.email}`}
                        className="hover:text-primary transition-colors"
                      >
                        {customer.email}
                      </a>
                    </div>
                    {customer.company && (
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{customer.company}</span>
                      </div>
                    )}
                  </div>

                  {/* 포인트 잔액 표시 */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                      <Coins className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-lg">
                        {pointBalance.toLocaleString()}P
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {customer.notes && (
                <div className="pt-6 border-t">
                  <h3 className="font-semibold mb-2">메모</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {customer.notes}
                  </p>
                </div>
              )}

              <div className="pt-6 border-t grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <span className="font-medium">등록일:</span>{' '}
                    {formatDate(customer.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <div>
                    <span className="font-medium">최종 수정:</span>{' '}
                    {formatDate(customer.updatedAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>고객 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 <strong>{customer.name}</strong> 고객을 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 포인트 적립 다이얼로그 */}
      <Dialog open={showPointDialog} onOpenChange={setShowPointDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>포인트 적립</DialogTitle>
            <DialogDescription>
              {customer.name} 고객에게 포인트를 적립합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pointAmount">적립 포인트 *</Label>
              <Input
                id="pointAmount"
                type="number"
                placeholder="예: 1000"
                value={pointAmount}
                onChange={(e) => setPointAmount(e.target.value)}
                min="1"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pointDescription">적립 사유 (선택)</Label>
              <Textarea
                id="pointDescription"
                placeholder="예: 구매 적립, 이벤트 보상 등"
                value={pointDescription}
                onChange={(e) => setPointDescription(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                현재 잔액: <strong>{pointBalance.toLocaleString()}P</strong>
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPointDialog(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              onClick={handlePointSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '적립 중...' : '적립하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CustomerDetailPage() {
  return (
    <ProtectedRoute>
      <CustomerDetailContent />
    </ProtectedRoute>
  );
}
