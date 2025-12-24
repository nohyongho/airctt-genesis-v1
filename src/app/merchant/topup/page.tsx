
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Wallet,
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { merchantProfileService, initMerchantDemo } from '@/lib/merchant-service';
import { MerchantProfile } from '@/lib/merchant-types';
import { toast } from 'sonner';

const quickAmounts = [10000, 30000, 50000, 100000, 300000, 500000];

const paymentMethods = [
  { id: 'card', name: '신용/체크카드', icon: CreditCard, description: '즉시 충전' },
  { id: 'bank', name: '계좌이체', icon: Building2, description: '1-2일 소요' },
  { id: 'phone', name: '휴대폰 결제', icon: Smartphone, description: '즉시 충전' },
];

interface Transaction {
  id: string;
  type: 'TOPUP' | 'USE' | 'REFUND';
  amount: number;
  description: string;
  createdAt: string;
  status: 'COMPLETED' | 'PENDING';
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'TOPUP',
    amount: 100000,
    description: '카드 충전',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
    status: 'COMPLETED',
  },
  {
    id: '2',
    type: 'USE',
    amount: -15000,
    description: '쿠폰 발급 비용',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60000).toISOString(),
    status: 'COMPLETED',
  },
  {
    id: '3',
    type: 'TOPUP',
    amount: 50000,
    description: '계좌이체 충전',
    createdAt: new Date(Date.now() - 12 * 60 * 60000).toISOString(),
    status: 'COMPLETED',
  },
  {
    id: '4',
    type: 'USE',
    amount: -8000,
    description: '광고 비용',
    createdAt: new Date(Date.now() - 6 * 60 * 60000).toISOString(),
    status: 'COMPLETED',
  },
];

export default function MerchantTopupPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions] = useState<Transaction[]>(mockTransactions);

  useEffect(() => {
    initMerchantDemo();
    setProfile(merchantProfileService.get());
  }, []);

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setAmount(Number(value) || 0);
  };

  const handleTopup = async () => {
    if (amount < 1000) {
      toast.error('최소 충전 금액은 1,000원입니다');
      return;
    }

    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (profile) {
      const newBalance = profile.balance + amount;
      merchantProfileService.save({ balance: newBalance });
      setProfile({ ...profile, balance: newBalance });
    }
    
    setIsProcessing(false);
    setIsConfirmOpen(false);
    setAmount(0);
    setCustomAmount('');
    toast.success(`${amount.toLocaleString()}원이 충전되었습니다`);
  };

  const getBonusAmount = (amount: number) => {
    if (amount >= 500000) return Math.floor(amount * 0.05);
    if (amount >= 300000) return Math.floor(amount * 0.03);
    if (amount >= 100000) return Math.floor(amount * 0.02);
    return 0;
  };

  const bonus = getBonusAmount(amount);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 glass-dark">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white font-bold text-lg">충전하기</h1>
              <p className="text-white/70 text-xs">잔액 충전</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Wallet className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">현재 잔액</p>
                    <p className="text-3xl font-bold gradient-text">
                      {profile.balance.toLocaleString()}
                      <span className="text-lg ml-1">원</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-amber-500" />
                충전 금액 선택
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((value) => (
                  <Button
                    key={value}
                    variant={amount === value ? 'default' : 'outline'}
                    className={`h-12 ${amount === value ? 'bg-gradient-to-r from-violet-500 to-purple-600' : ''}`}
                    onClick={() => handleAmountSelect(value)}
                  >
                    {value >= 10000 ? `${value / 10000}만` : value.toLocaleString()}
                    {value >= 100000 && (
                      <Badge className="ml-1 text-[10px] bg-amber-500 text-white">
                        +{getBonusAmount(value) / 1000}K
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>

              <div>
                <Label>직접 입력</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="금액을 입력하세요"
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    원
                  </span>
                </div>
              </div>

              {bonus > 0 && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">보너스 적립</span>
                    <span className="text-sm font-bold text-amber-500">
                      +{bonus.toLocaleString()}원
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5 text-primary" />
                결제 수단
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.id}
                      className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        paymentMethod === method.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-white/10 hover:border-white/20'
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={method.id} className="font-medium cursor-pointer">
                          {method.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                최근 거래 내역
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      tx.type === 'TOPUP' 
                        ? 'bg-emerald-500/20' 
                        : tx.type === 'REFUND'
                        ? 'bg-blue-500/20'
                        : 'bg-red-500/20'
                    }`}>
                      {tx.type === 'TOPUP' ? (
                        <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}원
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pb-4"
        >
          <Button
            onClick={() => setIsConfirmOpen(true)}
            disabled={amount < 1000}
            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 shadow-2xl hover-glow disabled:opacity-50"
          >
            <Wallet className="w-6 h-6 mr-2" />
            {amount > 0 ? `${(amount + bonus).toLocaleString()}원 충전하기` : '금액을 선택하세요'}
          </Button>
        </motion.div>
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              충전 확인
            </DialogTitle>
            <DialogDescription>
              아래 내용을 확인해주세요
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">충전 금액</span>
                <span className="font-semibold">{amount.toLocaleString()}원</span>
              </div>
              {bonus > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">보너스</span>
                  <span className="font-semibold text-amber-500">+{bonus.toLocaleString()}원</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">총 충전액</span>
                <span className="text-xl font-bold gradient-text">
                  {(amount + bonus).toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="w-4 h-4" />
              <span>
                {paymentMethods.find(m => m.id === paymentMethod)?.name}
              </span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              취소
            </Button>
            <Button 
              onClick={handleTopup}
              disabled={isProcessing}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  처리중...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  충전하기
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
