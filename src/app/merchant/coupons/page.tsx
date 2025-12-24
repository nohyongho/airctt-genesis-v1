'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Ticket,
  Calendar,
  Users,
  TrendingUp,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Gift,
  Percent,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeft,
  Wand2,
  Brain,
  Zap,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { couponService, initMerchantDemo } from '@/lib/merchant-service';
import { MerchantCoupon } from '@/lib/merchant-types';
import { toast } from 'sonner';
import AIBunnyAssistant from '@/components/shared/AIBunnyAssistant';

type LocalDiscountType = 'PERCENT' | 'FIXED';
type CreationStep = 'FORM' | 'PAYMENT';

interface NewCouponFormState {
  name: string;
  description: string;
  discountType: LocalDiscountType;
  discountValue: number | '';
  minPurchase: number | '';
  maxDiscount: number | '';
  validFrom: string;
  validUntil: string;
  totalQuantity: number;
  image: File | null;
  imagePreview: string | null;
}

export default function MerchantCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<MerchantCoupon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<MerchantCoupon | null>(
    null,
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetailCoupon, setSelectedDetailCoupon] = useState<MerchantCoupon | null>(null);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [creationStep, setCreationStep] = useState<CreationStep>('FORM');

  const [newCoupon, setNewCoupon] = useState<NewCouponFormState>({
    name: '새 쿠폰',
    description: '쿠폰 설명',
    discountType: 'PERCENT',
    discountValue: 10,
    minPurchase: 1000,
    maxDiscount: 5000,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalQuantity: 100,
    image: null,
    imagePreview: null,
  });

  useEffect(() => {
    initMerchantDemo();
    loadCoupons();
  }, []);

  const loadCoupons = () => {
    const all = couponService.getAll() as MerchantCoupon[];
    const normalized = all.map((coupon) => ({
      ...coupon,
      name: coupon.name ?? coupon.title,
    }));
    setCoupons(normalized);
  };

  const filteredCoupons = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();

    return coupons.filter((coupon) => {
      const baseName = coupon.name ?? coupon.title ?? '';
      const desc = coupon.description ?? '';
      const matchesSearch =
        baseName.toLowerCase().includes(normalizedQuery) ||
        desc.toLowerCase().includes(normalizedQuery);

      if (activeTab === 'all') {
        return matchesSearch;
      }
      if (activeTab === 'active') {
        return matchesSearch && coupon.status === 'ACTIVE';
      }
      if (activeTab === 'expired') {
        return matchesSearch && coupon.status === 'EXPIRED';
      }
      if (activeTab === 'draft') {
        return matchesSearch && coupon.status === 'INACTIVE';
      }

      return matchesSearch;
    });
  }, [coupons, searchQuery, activeTab]);

  const stats = useMemo(() => {
    const totalUsed = coupons.reduce(
      (sum, c) => sum + (c.usedQuantity ?? 0),
      0,
    );
    const totalQty = coupons.reduce(
      (sum, c) => sum + (c.totalQuantity ?? 0),
      0,
    );
    const usageRate =
      totalQty > 0 ? Math.round((totalUsed / totalQty) * 100) : 0;

    return [
      {
        label: '전체 쿠폰',
        value: coupons.length,
        icon: Ticket,
        color: 'from-violet-500 to-purple-500',
      },
      {
        label: '활성 쿠폰',
        value: coupons.filter((c) => c.status === 'ACTIVE').length,
        icon: CheckCircle2,
        color: 'from-emerald-500 to-green-500',
      },
      {
        label: '총 사용',
        value: totalUsed,
        icon: Users,
        color: 'from-blue-500 to-cyan-500',
      },
      {
        label: '사용률',
        value: `${usageRate}%`,
        icon: TrendingUp,
        color: 'from-amber-500 to-orange-500',
      },
    ];
  }, [coupons]);

  const handleAIGenerate = async () => {
    setIsAIGenerating(true);
    toast.info('AI가 쿠폰을 생성하고 있습니다...');

    await new Promise(resolve => setTimeout(resolve, 2000));

    const aiSuggestions = [
      {
        name: '신규 고객 환영 쿠폰',
        description: '첫 구매 시 20% 할인 혜택',
        discountType: 'PERCENT' as LocalDiscountType,
        discountValue: 20,
        minPurchase: 10000,
        maxDiscount: 5000,
      },
      {
        name: '주말 특가 쿠폰',
        description: '주말 한정 15% 할인',
        discountType: 'PERCENT' as LocalDiscountType,
        discountValue: 15,
        minPurchase: 20000,
        maxDiscount: 10000,
      },
      {
        name: '단골 고객 감사 쿠폰',
        description: '5회 이상 방문 고객 10,000원 할인',
        discountType: 'FIXED' as LocalDiscountType,
        discountValue: 10000,
        minPurchase: 50000,
        maxDiscount: 10000,
      },
    ];

    const suggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];

    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    setNewCoupon({
      ...suggestion,
      validFrom: today.toISOString().split('T')[0],
      validUntil: nextMonth.toISOString().split('T')[0],
      totalQuantity: 100,
      image: null,
      imagePreview: null,
    });

    setIsAIGenerating(false);
    toast.success('AI가 쿠폰을 생성했습니다!');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setNewCoupon(prev => ({
          ...prev,
          image: file,
          imagePreview: URL.createObjectURL(file)
        }));
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewCoupon(prev => ({
            ...prev,
            image: file,
            imagePreview: reader.result as string
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCreateCoupon = (skipValidation = false) => {
    if (!skipValidation && (!newCoupon.name || !newCoupon.validFrom || !newCoupon.validUntil)) {
      toast.error('필수 항목을 입력해주세요');
      return;
    }

    const created = couponService.create({
      code: '',
      merchantId: '',
      title: newCoupon.name,
      description: newCoupon.description,
      discountType:
        newCoupon.discountType === 'PERCENT'
          ? 'PERCENTAGE'
          : 'FIXED_AMOUNT',
      discountValue: Number(newCoupon.discountValue),
      minPurchaseAmount: Number(newCoupon.minPurchase),
      maxDiscountAmount: Number(newCoupon.maxDiscount),
      validFrom: newCoupon.validFrom,
      validUntil: newCoupon.validUntil,
      totalQuantity: newCoupon.totalQuantity,
      usedQuantity: 0,
      status: 'INACTIVE',
      imageUrl: newCoupon.imagePreview || undefined,
      mediaType: newCoupon.image?.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
      createdAt: new Date().toISOString(),
    } as MerchantCoupon);

    const normalized = {
      ...created,
      name: created.name ?? created.title,
    };

    setCoupons((prev) => [...prev, normalized]);
    setIsCreateOpen(false);
    setCreationStep('FORM');
    setNewCoupon({
      name: '새 쿠폰',
      description: '쿠폰 설명',
      discountType: 'PERCENT',
      discountValue: 10,
      minPurchase: 1000,
      maxDiscount: 5000,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalQuantity: 100,
      image: null,
      imagePreview: null,
    });
    toast.success('쿠폰이 생성되었습니다');
  };

  const handleDeleteCoupon = () => {
    if (selectedCoupon) {
      couponService.delete(selectedCoupon.id);
      setCoupons((prev) => prev.filter((c) => c.id !== selectedCoupon.id));
      setIsDeleteOpen(false);
      setSelectedCoupon(null);
      toast.success('쿠폰이 삭제되었습니다');
    }
  };

  const getCouponName = (coupon: MerchantCoupon) => {
    return coupon.name ?? coupon.title;
  };

  const getDiscountDisplay = (coupon: MerchantCoupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}%`;
    }
    if (coupon.discountType === 'FIXED_AMOUNT') {
      return `${coupon.discountValue.toLocaleString()}원`;
    }
    return '무료 제공';
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Ticket className="w-8 h-8 text-primary" />
            쿠폰 관리
          </h1>
          <p className="text-gray-400">
            발급한 쿠폰을 관리하고 새로운 이벤트를 시작하세요
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />새 쿠폰 만들기
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="glass-card border-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-white">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Assistant Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-900/50 via-purple-900/50 to-pink-900/50 border border-white/10 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20 backdrop-blur-md">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                AI 쿠폰 생성
              </h3>
              <p className="text-sm text-gray-300">
                인공지능이 최적의 쿠폰을 추천합니다
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10"
            onClick={handleAIGenerate}
            disabled={isAIGenerating}
          >
            {isAIGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                AI로 쿠폰 자동 생성
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="쿠폰 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>
        <Tabs
          defaultValue="all"
          className="w-full md:w-auto"
          onValueChange={setActiveTab}
        >
          <TabsList className="bg-white/5 border border-white/10 w-full md:w-auto">
            <TabsTrigger value="all" className="flex-1 md:flex-none">
              전체
            </TabsTrigger>
            <TabsTrigger value="active" className="flex-1 md:flex-none">
              활성
            </TabsTrigger>
            <TabsTrigger value="expired" className="flex-1 md:flex-none">
              만료
            </TabsTrigger>
            <TabsTrigger value="draft" className="flex-1 md:flex-none">
              대기
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Coupon List */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredCoupons.map((coupon) => (
            <motion.div
              key={coupon.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="glass-card group hover:bg-white/5 transition-colors">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Left: Image/Preview */}
                    <div className="w-full md:w-48 h-32 md:h-auto relative bg-gray-800">
                      {coupon.imageUrl ? (
                        coupon.mediaType === 'VIDEO' ? (
                          <video
                            src={coupon.imageUrl}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={coupon.imageUrl}
                            alt={getCouponName(coupon)}
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                          <Ticket className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge
                          className={`${coupon.discountType === 'PERCENTAGE'
                            ? 'bg-violet-500'
                            : 'bg-blue-500'
                            }`}
                        >
                          {coupon.discountType === 'PERCENTAGE' ? (
                            <Percent className="w-3 h-3 mr-1" />
                          ) : (
                            <Gift className="w-3 h-3 mr-1" />
                          )}
                          {getDiscountDisplay(coupon)}
                        </Badge>
                      </div>
                    </div>

                    {/* Middle: Info */}
                    <div className="flex-1 p-6 flex flex-col justify-center">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">
                            {getCouponName(coupon)}
                          </h3>
                          <p className="text-sm text-gray-400 line-clamp-1">
                            {coupon.description}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-white"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedDetailCoupon(coupon);
                              setIsDetailOpen(true);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              상세 보기
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              수정하기
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              복사하기
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500"
                              onClick={() => {
                                setSelectedCoupon(coupon);
                                setIsDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              삭제하기
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-auto">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(coupon.validUntil).toLocaleDateString()} 까지
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {coupon.usedQuantity} / {coupon.totalQuantity} 사용
                        </div>

                        {/* Status Badge */}
                        <div className="flex-1 text-right flex items-center justify-end gap-2">
                          {/* [NEW] Quick Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click if any
                              setSelectedCoupon(coupon);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>

                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${coupon.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-gray-500/10 text-gray-500'
                              }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${coupon.status === 'ACTIVE'
                                ? 'bg-emerald-500'
                                : 'bg-gray-500'
                                }`}
                            />
                            {coupon.status === 'ACTIVE' ? '진행중' : '대기중'}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              ((coupon.usedQuantity ?? 0) /
                                (coupon.totalQuantity ?? 1)) *
                              100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredCoupons.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/5 flex items-center justify-center">
              <Ticket className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              쿠폰이 없습니다
            </h3>
            <p className="text-gray-400 mb-6">
              새로운 쿠폰을 만들어 고객들에게 혜택을 제공해보세요
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              첫 쿠폰 만들기
            </Button>
          </div>
        )}
      </div>

      {/* Create Coupon Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />새 쿠폰 만들기
            </DialogTitle>
            <DialogDescription>
              새로운 할인 쿠폰을 생성합니다
            </DialogDescription>
          </DialogHeader>

          {creationStep === 'FORM' ? (
            <div className="space-y-6 py-4">
              <Button
                variant="outline"
                className="w-full border-primary/50 text-primary hover:bg-primary/10"
                onClick={handleAIGenerate}
                disabled={isAIGenerating}
              >
                {isAIGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    AI가 쿠폰을 생성하고 있습니다...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    AI 자동 생성
                  </>
                )}
              </Button>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>쿠폰 파일</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden bg-white/5 relative group">
                      {newCoupon.imagePreview ? (
                        newCoupon.image?.type.startsWith('video/') ? (
                          <video
                            src={newCoupon.imagePreview}
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={newCoupon.imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-500" />
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleImageChange}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium mb-1">쿠폰 업로드</h4>
                      <p className="text-xs text-gray-400 mb-2">
                        JPG, PNG, GIF, MP4, WEBM (최대 100MB)
                        <br />
                        권장 사이즈: 500x500px
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="relative"
                        >
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleImageChange}
                          />
                          <Upload className="w-3 h-3 mr-2" />
                          쿠폰 업로드
                        </Button>
                        {newCoupon.image && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                            onClick={() =>
                              setNewCoupon((prev) => ({
                                ...prev,
                                image: null,
                                imagePreview: null,
                              }))
                            }
                          >
                            삭제
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>쿠폰명 *</Label>
                  <Input
                    placeholder="예: 신규 가입 10% 할인"
                    value={newCoupon.name}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, name: e.target.value })
                    }
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label>설명</Label>
                  <Textarea
                    placeholder="쿠폰에 대한 설명을 입력하세요"
                    value={newCoupon.description}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        description: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>할인 유형</Label>
                    <Select
                      value={newCoupon.discountType}
                      onValueChange={(value: LocalDiscountType) =>
                        setNewCoupon({ ...newCoupon, discountType: value })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENT">퍼센트 (%)</SelectItem>
                        <SelectItem value="FIXED">정액 (원)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>할인 값</Label>
                    <Input
                      type="number"
                      placeholder={
                        newCoupon.discountType === 'PERCENT' ? '10' : '1000'
                      }
                      value={newCoupon.discountValue}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          discountValue: Number(e.target.value),
                        })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>시작일 *</Label>
                    <Input
                      type="date"
                      value={newCoupon.validFrom}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          validFrom: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>종료일 *</Label>
                    <Input
                      type="date"
                      value={newCoupon.validUntil}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          validUntil: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>최소 결제 금액</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newCoupon.minPurchase}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          minPurchase: Number(e.target.value),
                        })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>최대 할인 금액</Label>
                    <Input
                      type="number"
                      placeholder="무제한"
                      value={newCoupon.maxDiscount}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          maxDiscount: Number(e.target.value),
                        })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>발급 수량</Label>
                  <Input
                    type="number"
                    value={newCoupon.totalQuantity}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        totalQuantity: Number(e.target.value),
                      })
                    }
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">결제 확인</h3>
                  <p className="text-gray-400">
                    쿠폰 생성 비용을 결제합니다
                  </p>
                </div>
              </div>

              <Card className="glass-card">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">쿠폰 종류</span>
                    <span>{newCoupon.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">발급 수량</span>
                    <span>{newCoupon.totalQuantity}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">기간</span>
                    <span>
                      {newCoupon.validFrom} ~ {newCoupon.validUntil}
                    </span>
                  </div>
                  <div className="border-t border-white/10 my-2 pt-2 flex justify-between font-bold text-lg">
                    <span>총 결제 금액</span>
                    <span className="text-primary">
                      {(newCoupon.totalQuantity * 50).toLocaleString()}원
                    </span>
                  </div>
                  <p className="text-xs text-right text-gray-500">
                    1장당 50원 결제
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                if (creationStep === 'PAYMENT') {
                  setCreationStep('FORM');
                } else {
                  setIsCreateOpen(false);
                }
              }}
            >
              취소
            </Button>
            {creationStep === 'FORM' ? (
              <Button onClick={() => setCreationStep('PAYMENT')}>
                다음
              </Button>
            ) : (
              <Button
                onClick={() => handleCreateCoupon()}
                className="bg-primary hover:bg-primary/90"
              >
                결제하기
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>쿠폰 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 쿠폰을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCoupon}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="glass-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              쿠폰 상세 정보
            </DialogTitle>
          </DialogHeader>

          {selectedDetailCoupon && (
            <div className="space-y-6">
              {/* Image/Video Preview */}
              <div className="aspect-video rounded-lg overflow-hidden bg-black/20 border border-white/10">
                {selectedDetailCoupon.imageUrl ? (
                  selectedDetailCoupon.mediaType === 'VIDEO' ? (
                    <video
                      src={selectedDetailCoupon.imageUrl}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      muted
                      playsInline
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedDetailCoupon.imageUrl}
                      alt={getCouponName(selectedDetailCoupon)}
                      className="w-full h-full object-contain"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Ticket className="w-12 h-12 text-white/20" />
                  </div>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">쿠폰명</label>
                  <p className="font-medium">{getCouponName(selectedDetailCoupon)}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">할인 혜택</label>
                  <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                    {getDiscountDisplay(selectedDetailCoupon)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">유효 기간</label>
                  <p className="text-sm">
                    {new Date(selectedDetailCoupon.validFrom).toLocaleDateString()} ~ {new Date(selectedDetailCoupon.validUntil).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">상태</label>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedDetailCoupon.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className="text-sm">{selectedDetailCoupon.status === 'ACTIVE' ? '활성' : '비활성'}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 bg-white/5 p-3 rounded-lg">
                <label className="text-xs text-muted-foreground">설명</label>
                <p className="text-sm text-white/80">{selectedDetailCoupon.description}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                <div className="text-center p-2">
                  <div className="text-xs text-muted-foreground">발급 수량</div>
                  <div className="font-bold text-lg">{selectedDetailCoupon.totalQuantity}</div>
                </div>
                <div className="text-center p-2 border-l border-white/10">
                  <div className="text-xs text-muted-foreground">사용 완료</div>
                  <div className="font-bold text-lg text-green-400">{selectedDetailCoupon.usedQuantity}</div>
                </div>
                <div className="text-center p-2 border-l border-white/10">
                  <div className="text-xs text-muted-foreground">사용률</div>
                  <div className="font-bold text-lg text-primary">
                    {Math.round(((selectedDetailCoupon.usedQuantity || 0) / (selectedDetailCoupon.totalQuantity || 1)) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Assistant */}
      <AIBunnyAssistant userType="merchant" />
    </div>
  );
}
