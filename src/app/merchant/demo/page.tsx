
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Scan, Store, CheckCircle2, Ticket, AlertCircle } from 'lucide-react';
import { createPostgrestClient } from '@/lib/postgrest';

export default function MerchantDemoPage() {
    const [code, setCode] = useState('');
    const [couponData, setCouponData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    // 1. 쿠폰 조회 (Mock Scan)
    const handleCheckCoupon = async () => {
        if (!code) return;
        setLoading(true);
        setCouponData(null);

        try {
            // In a real app, use a client-side Supabase client or dedicated API.
            // For this demo page, we will fetch directly from API endpoint if available, 
            // or simulate a check using our API architecture.
            // Since we don't have GET /api/coupons/[code], let's mock the check logic 
            // by directly querying via PostgREST client if allowed (demo mode), 
            // OR better: Create a tiny API for looking up a coupon by ID.

            // But! To save time, let's assume the 'code' is the Coupon Issue ID (UUID).
            // We will perform a fetch to a new helper endpoint or reuse existing logic.

            // Let's create a temporary direct fetch here or use a server action.
            // Actually, let's just make a POST to a 'check' endpoint?

            // Simplified: We'll assume the user enters a UUID for the demo.
            // And we use a new API endpoint: /api/merchant/check-coupon (we will create this).

            const res = await fetch('/api/merchant/check-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code_or_id: code })
            });

            if (!res.ok) throw new Error('쿠폰을 찾을 수 없습니다.');
            const data = await res.json();
            setCouponData(data);
            toast.success('쿠폰 정보 조회 성공');

        } catch (e: any) {
            toast.error(e.message || '조회 실패');
        } finally {
            setLoading(false);
        }
    };

    // 2. 쿠폰 사용 처리
    const handleUseCoupon = async () => {
        if (!couponData) return;
        setProcessing(true);

        try {
            const res = await fetch('/api/coupons/use', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Mocking the Merchant Store ID
                body: JSON.stringify({
                    coupon_issue_id: couponData.id,
                    store_id: 'merchant-store-demo-id'
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || '사용 처리 실패');
            }

            const result = await res.json();
            setCouponData({ ...couponData, status: 'USED', used_at: result.used_at });
            toast.success('쿠폰 사용 처리 완료! 🙆‍♂️');

        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex items-center justify-center">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-indigo-600">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                        <Store className="w-6 h-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">사장님 모드 (Demo)</CardTitle>
                    <CardDescription>고객님의 쿠폰 코드를 입력하거나 스캔하세요.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pt-4">
                    {/* Input Section */}
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <Input
                                placeholder="쿠폰 ID 입력 (UUID)"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="text-lg font-mono tracking-tight"
                            />
                            <Button
                                onClick={handleCheckCoupon}
                                disabled={loading || !code}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {loading ? '조회중...' : '조회'}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            * 데모: 자신의 쿠폰함에서 ID를 복사해서 넣어보세요.
                        </p>
                    </div>

                    <div className="pt-4 border-t">
                        <Button
                            variant="outline"
                            className="w-full text-xs text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 border-dashed"
                            onClick={async () => {
                                const loadingToast = toast.loading('데모 매장 생성 중...');
                                try {
                                    const res = await fetch('/api/setup/demo-data', {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': 'Bearer ' + (localStorage.getItem('airctt_consumer_session') ? JSON.parse(localStorage.getItem('airctt_consumer_session')!).access_token : '')
                                        }
                                    });
                                    const result = await res.json();
                                    if (!res.ok) throw new Error(result.error);
                                    toast.success(result.message);
                                } catch (e: any) {
                                    console.error(e);
                                    toast.error('설정 실패: ' + e.message);
                                } finally {
                                    toast.dismiss(loadingToast);
                                }
                            }}
                        >
                            🪄 시연용 매장/쿠폰 자동 생성 (최초 1회)
                        </Button>
                    </div>

                    {/* Result Section */}
                    {couponData && (
                        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{couponData.title}</h3>
                                    <p className="text-sm text-slate-500">{couponData.description}</p>
                                </div>
                                {couponData.status === 'ISSUED' || couponData.status === 'active' ? (
                                    <Badge className="bg-green-500 hover:bg-green-600">사용 가능</Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                        {couponData.status}
                                    </Badge>
                                )}
                            </div>

                            <div className="bg-slate-50 p-3 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">할인 금액</span>
                                    <span className="font-bold text-indigo-600">
                                        {couponData.discount_type === 'PERCENT' ? `${couponData.discount_value}%` : `${couponData.discount_value}원`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">유효 기간</span>
                                    <span className="text-slate-900">{couponData.valid_until?.split('T')[0] || '무제한'}</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            {couponData.status === 'ISSUED' && (
                                <Button
                                    className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
                                    onClick={handleUseCoupon}
                                    disabled={processing}
                                >
                                    {processing ? '처리중...' : '사용 처리하기 (승인)'}
                                </Button>
                            )}

                            {couponData.status === 'USED' && (
                                <div className="bg-green-50 text-green-700 p-3 rounded-lg text-center font-bold flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    사용 완료되었습니다.
                                </div>
                            )}
                            {(couponData.status !== 'ISSUED' && couponData.status !== 'USED') && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center font-bold flex items-center justify-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    사용할 수 없는 쿠폰입니다.
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
