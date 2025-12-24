
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Calendar, Ban, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function CouponCreatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Coupon Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discountType: 'PERCENT', // PERCENT, FIXED_AMOUNT, FREE_ITEM
        discountValue: '',
        totalQuantity: 100,
        validDays: 30,
        minOrderAmount: 0,
        autoTargeting: true, // 반경 내 자동 노출 여부
        imageUrl: ''
    });

    const handleCreate = async () => {
        // Basic Validation
        if (!formData.title || !formData.discountValue) {
            toast.error('쿠폰 이름과 할인 혜택을 입력해주세요.');
            return;
        }

        setLoading(true);

        try {
            // Mock API Call (Simulating DB Insert)
            // In real step, we POST to /api/merchant/coupons
            await new Promise(r => setTimeout(r, 1000));

            toast.success('쿠폰이 성공적으로 발행되었습니다! 🎟️');
            router.push('/merchant/dashboard'); // Back to dashboard
        } catch (e) {
            toast.error('발행 실패: 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-3xl space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">새 쿠폰 만들기</h1>
                        <p className="text-slate-500">고객들을 끌어당길 매력적인 혜택을 만들어보세요.</p>
                    </div>
                    <Button variant="ghost" onClick={() => router.back()}>취소</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Left: Form */}
                    <Card className="md:col-span-2 shadow-sm">
                        <CardHeader>
                            <CardTitle>쿠폰 상세 설정</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="space-y-2">
                                <Label>쿠폰 이름</Label>
                                <Input
                                    placeholder="예: 전 메뉴 10% 할인, 아메리카노 1잔 무료"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>혜택 유형</Label>
                                    <Select
                                        value={formData.discountType}
                                        onValueChange={(v) => setFormData({ ...formData, discountType: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERCENT">퍼센트(%) 할인</SelectItem>
                                            <SelectItem value="FIXED_AMOUNT">금액(원) 할인</SelectItem>
                                            <SelectItem value="FREE_ITEM">무료 메뉴 증정</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>혜택 값</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder={formData.discountType === 'FREE_ITEM' ? '0' : '10'}
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                            disabled={formData.discountType === 'FREE_ITEM'}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                            {formData.discountType === 'PERCENT' ? '%' : formData.discountType === 'FIXED_AMOUNT' ? '원' : '개'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>설명 / 유의사항</Label>
                                <Textarea
                                    placeholder="예: 1만원 이상 주문 시 사용 가능, 타 쿠폰 중복 불가"
                                    className="h-24 resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>발행 수량 (선착순)</Label>
                                    <Input
                                        type="number"
                                        value={formData.totalQuantity}
                                        onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>유효 기간 (발급일로부터)</Label>
                                    <Select
                                        value={formData.validDays.toString()}
                                        onValueChange={(v) => setFormData({ ...formData, validDays: parseInt(v) })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="7">7일</SelectItem>
                                            <SelectItem value="14">14일</SelectItem>
                                            <SelectItem value="30">30일</SelectItem>
                                            <SelectItem value="90">90일</SelectItem>
                                            <SelectItem value="365">1년</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                                <div className="space-y-0.5">
                                    <Label>자동 노출 (반경 500m)</Label>
                                    <p className="text-xs text-slate-500">게임 및 매장 목록에서 고객에게 쿠폰을 노출합니다.</p>
                                </div>
                                <Switch
                                    checked={formData.autoTargeting}
                                    onCheckedChange={(c) => setFormData({ ...formData, autoTargeting: c })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>대표 이미지 업로드</Label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 gap-2 hover:bg-slate-50 hover:border-indigo-300 transition-colors cursor-pointer">
                                    <div className="bg-slate-100 p-2 rounded-full">
                                        <Copy className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm">클릭하여 이미지 업로드 (최대 5MB)</span>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Right: Preview */}
                    <div className="space-y-6">
                        <h3 className="font-bold text-slate-700">미리보기 (고객 화면)</h3>

                        {/* Coupon Card Preview */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100 relative">
                            <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
                                <div className="absolute inset-0 bg-black/10" />
                                <div className="absolute bottom-3 left-4 text-white">
                                    <p className="text-xs font-bold opacity-80 mb-1">AIRCTT 강남점</p>
                                    <h3 className="font-bold text-xl">{formData.title || '쿠폰 이름'}</h3>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-center pb-3 border-b border-dashed border-slate-200">
                                    <div>
                                        <span className="text-3xl font-extrabold text-indigo-600">
                                            {formData.discountType === 'PERCENT' ? `${formData.discountValue || 0}%` :
                                                formData.discountType === 'FIXED_AMOUNT' ? `${formData.discountValue || 0}원` :
                                                    'FREE'}
                                        </span>
                                        <span className="text-sm font-bold text-slate-500 ml-1">OFF</span>
                                    </div>
                                    <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">
                                        D-{formData.validDays}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    {formData.description || '쿠폰 상세 설명이 여기에 표시됩니다.'}
                                </p>
                                <Button className="w-full bg-slate-900 h-10 text-sm">쿠폰 받기</Button>
                            </div>

                            {/* Punch Hole Decoration */}
                            <div className="absolute top-32 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 rounded-full" />
                            <div className="absolute top-32 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 rounded-full" />
                        </div>

                        <Button
                            size="lg"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-bold shadow-lg shadow-indigo-200"
                            onClick={handleCreate}
                            disabled={loading}
                        >
                            {loading ? '발행 중...' : '쿠폰 발행하기'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
