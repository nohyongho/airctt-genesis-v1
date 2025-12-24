'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Store, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

interface CouponTemplate {
  id: string;
  title: string;
  description: string;
  discountType: 'percent' | 'amount';
  discountValue: number;
  suggested: boolean;
}

interface RegisterResponse {
  success: boolean;
  error?: string;
  merchant?: {
    id: string;
    slug: string;
    name: string;
    type: string;
  };
  store?: {
    id: string;
    name: string;
  };
  recommendedTemplates?: CouponTemplate[];
  nextSteps?: string[];
}

export default function MerchantRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [registerResult, setRegisterResult] = useState<RegisterResponse | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    category: '',
    phone: '',
    address: '',
    description: '',
    email: '',
  });

  const handleRegister = async () => {
    // 필수 필드 검증
    if (!formData.businessName || !formData.ownerName || !formData.category || !formData.phone || !formData.address) {
      toast.error('필수 정보를 모두 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/merchant/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: RegisterResponse = await response.json();

      if (result.success) {
        setRegisterResult(result);
        setStep('success');
        toast.success('입점 신청이 완료되었습니다! 🎉');

        // 로컬스토리지에 가맹점 정보 저장 (MVP용)
        if (result.merchant) {
          localStorage.setItem('ctt_merchant_id', result.merchant.id);
          localStorage.setItem('ctt_merchant_slug', result.merchant.slug);
          localStorage.setItem('ctt_merchant_name', result.merchant.name);
        }
        if (result.store) {
          localStorage.setItem('ctt_store_id', result.store.id);
        }
        if (result.recommendedTemplates) {
          localStorage.setItem('ctt_recommended_templates', JSON.stringify(result.recommendedTemplates));
        }
      } else {
        toast.error(result.error || '등록 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/merchant/dashboard?onboarding=true');
  };

  const handleCreateCoupon = (template: CouponTemplate) => {
    // 템플릿 정보를 쿼리 파라미터로 전달
    const params = new URLSearchParams({
      templateId: template.id,
      title: template.title,
      discountType: template.discountType,
      discountValue: template.discountValue.toString(),
    });
    router.push(`/merchant/coupons/new?${params.toString()}`);
  };

  // 성공 화면
  if (step === 'success' && registerResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          {/* 성공 헤더 */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              환영합니다, {registerResult.merchant?.name}!
            </h1>
            <p className="text-slate-500">
              입점 신청이 완료되었습니다. 이제 AIRCTT와 함께 성장해보세요.
            </p>
          </div>

          {/* 매장 정보 카드 */}
          <Card className="mb-6 border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Store className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{registerResult.store?.name || '본점'}</p>
                  <p className="text-sm text-slate-500">
                    URL: /store/{registerResult.merchant?.slug}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 추천 쿠폰 템플릿 */}
          {registerResult.recommendedTemplates && registerResult.recommendedTemplates.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  추천 쿠폰 템플릿
                </CardTitle>
                <CardDescription>
                  업종에 맞는 쿠폰 템플릿을 준비했어요. 클릭하면 바로 만들 수 있어요!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {registerResult.recommendedTemplates.slice(0, 3).map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <button
                      onClick={() => handleCreateCoupon(template)}
                      className="w-full p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900 group-hover:text-indigo-700">
                            {template.title}
                          </p>
                          <p className="text-sm text-slate-500">{template.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded">
                            {template.discountType === 'percent'
                              ? `${template.discountValue}%`
                              : `${template.discountValue.toLocaleString()}원`}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 다음 단계 */}
          {registerResult.nextSteps && (
            <Card className="mb-6 bg-slate-50">
              <CardHeader>
                <CardTitle className="text-lg">다음 단계</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {registerResult.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-slate-600">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 대시보드 이동 버튼 */}
          <Button
            size="lg"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            onClick={handleGoToDashboard}
          >
            대시보드로 이동
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  // 등록 폼
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AIRCTT 가맹점 입점 신청</h1>
          <p className="text-slate-500">지금 바로 1,000만 AIRCTT 고객을 만나보세요.</p>
        </div>

        <Card className="border-t-4 border-t-indigo-600 shadow-xl">
          <CardHeader>
            <CardTitle>매장 기본 정보 입력</CardTitle>
            <CardDescription>정확한 정보를 입력해주시면 심사가 빨라집니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>
                  상호명 (사업자등록증 기준) <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="예: 에어씨티티 강남점"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  대표자명 <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="홍길동"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>
                  업종 카테고리 <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">맛집/식당</SelectItem>
                    <SelectItem value="cafe">카페/디저트</SelectItem>
                    <SelectItem value="culture">문화/공연</SelectItem>
                    <SelectItem value="shopping">쇼핑/패션</SelectItem>
                    <SelectItem value="beauty">뷰티/운동</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  매장 전화번호 <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="02-1234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                매장 주소 <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="주소를 입력해주세요"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="flex-1"
                />
                <Button variant="outline" type="button">
                  주소 검색
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>이메일 (선택)</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>매장 한줄 소개 (선택)</Label>
              <Input
                placeholder="고객들에게 보여질 매장 소개를 입력하세요."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t flex justify-end">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 min-w-[150px]"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? '처리중...' : '입점 신청하기'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2025 AIRCTT Merchant Services. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
