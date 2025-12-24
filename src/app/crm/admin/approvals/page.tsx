'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  ChevronRight,
  Building2,
  Phone,
  MapPin,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Merchant {
  id: string;
  name: string;
  type: string;
  slug: string;
  owner_name: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  approval_status: string;
  created_at: string;
  stores: Array<{ id: string; name: string; address: string }>;
}

interface StatusCounts {
  pending: number;
  reviewing: number;
  approved: number;
  rejected: number;
  suspended: number;
}

export default function ApprovalsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [counts, setCounts] = useState<StatusCounts>({
    pending: 0,
    reviewing: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // 상세 보기 모달
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 승인/반려 처리
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchMerchants = async (status: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/approvals?status=${status}`);
      const result = await response.json();

      if (result.success) {
        setMerchants(result.data || []);
        setCounts(result.meta.counts);
      } else {
        toast.error(result.error || '조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants(activeTab);
  }, [activeTab]);

  const handleAction = async (action: 'approve' | 'reject' | 'review') => {
    if (!selectedMerchant) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: selectedMerchant.id,
          action,
          reason: actionReason,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          action === 'approve'
            ? '승인되었습니다.'
            : action === 'reject'
            ? '반려되었습니다.'
            : '검토 상태로 변경되었습니다.'
        );
        setShowDetailModal(false);
        setSelectedMerchant(null);
        setActionReason('');
        setActionType(null);
        fetchMerchants(activeTab);
      } else {
        toast.error(result.error || '처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Action error:', error);
      toast.error('서버 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700">대기중</Badge>;
      case 'reviewing':
        return <Badge className="bg-blue-100 text-blue-700">검토중</Badge>;
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700">승인됨</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">반려됨</Badge>;
      case 'suspended':
        return <Badge className="bg-slate-100 text-slate-700">정지됨</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      restaurant: '맛집/식당',
      retail: '쇼핑/소매',
      culture: '문화/공연',
      service: '서비스',
      other: '기타',
    };
    return labels[type] || type;
  };

  const filteredMerchants = merchants.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">가맹점 승인 관리</h1>
            <p className="text-slate-500">신규 가맹점 신청을 검토하고 승인/반려합니다.</p>
          </div>
          <Button variant="outline" onClick={() => fetchMerchants(activeTab)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
        </div>

        {/* 상태별 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="pending" className="relative">
              대기중
              {counts.pending > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {counts.pending}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviewing">
              검토중
              {counts.reviewing > 0 && (
                <span className="ml-1 text-xs text-blue-600">({counts.reviewing})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">승인됨</TabsTrigger>
            <TabsTrigger value="rejected">반려됨</TabsTrigger>
            <TabsTrigger value="suspended">정지됨</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 검색 */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="상호명, 대표자명, 주소로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 가맹점 목록 */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMerchants.length === 0 ? (
          <Card className="bg-slate-50">
            <CardContent className="p-12 text-center">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">
                {activeTab === 'pending'
                  ? '대기 중인 가맹점이 없습니다.'
                  : '해당 상태의 가맹점이 없습니다.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredMerchants.map((merchant, index) => (
                <motion.div
                  key={merchant.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-slate-900">{merchant.name}</h3>
                              {getStatusBadge(merchant.approval_status)}
                              <Badge variant="outline">{getTypeLabel(merchant.type)}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-1">
                              대표: {merchant.owner_name} | {merchant.phone}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="w-3 h-3" />
                              {merchant.address}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              신청일:{' '}
                              {new Date(merchant.created_at).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMerchant(merchant);
                              setShowDetailModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            상세보기
                          </Button>
                          {activeTab === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => {
                                  setSelectedMerchant(merchant);
                                  setActionType('approve');
                                  setShowDetailModal(true);
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                승인
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedMerchant(merchant);
                                  setActionType('reject');
                                  setShowDetailModal(true);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                반려
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve'
                ? '가맹점 승인'
                : actionType === 'reject'
                ? '가맹점 반려'
                : '가맹점 상세 정보'}
            </DialogTitle>
          </DialogHeader>

          {selectedMerchant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">상호명</p>
                  <p className="font-medium">{selectedMerchant.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">업종</p>
                  <p className="font-medium">{getTypeLabel(selectedMerchant.type)}</p>
                </div>
                <div>
                  <p className="text-slate-500">대표자</p>
                  <p className="font-medium">{selectedMerchant.owner_name}</p>
                </div>
                <div>
                  <p className="text-slate-500">연락처</p>
                  <p className="font-medium">{selectedMerchant.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500">주소</p>
                  <p className="font-medium">{selectedMerchant.address}</p>
                </div>
                {selectedMerchant.description && (
                  <div className="col-span-2">
                    <p className="text-slate-500">소개</p>
                    <p className="font-medium">{selectedMerchant.description}</p>
                  </div>
                )}
              </div>

              {actionType && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">
                    {actionType === 'reject' ? '반려 사유 (필수)' : '메모 (선택)'}
                  </p>
                  <Textarea
                    placeholder={
                      actionType === 'reject'
                        ? '반려 사유를 입력해주세요...'
                        : '메모를 입력해주세요...'
                    }
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              취소
            </Button>
            {actionType === 'approve' && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleAction('approve')}
                disabled={processing}
              >
                {processing ? '처리중...' : '승인하기'}
              </Button>
            )}
            {actionType === 'reject' && (
              <Button
                variant="destructive"
                onClick={() => handleAction('reject')}
                disabled={processing || !actionReason.trim()}
              >
                {processing ? '처리중...' : '반려하기'}
              </Button>
            )}
            {!actionType && activeTab === 'pending' && (
              <>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setActionType('approve')}
                >
                  승인
                </Button>
                <Button variant="destructive" onClick={() => setActionType('reject')}>
                  반려
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
