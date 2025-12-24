'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopupPackage {
  id: string;
  name: string;
  description: string;
  amount: number;
  bonus_amount: number;
  bonus_percent: number;
  is_popular: boolean;
}

interface WalletInfo {
  id: string;
  balance: number;
  pending_balance: number;
  total_charged: number;
  total_used: number;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

const TRANSACTION_LABELS: Record<string, { label: string; color: string; prefix: string }> = {
  charge: { label: '충전', color: 'text-blue-500', prefix: '+' },
  bonus: { label: '보너스', color: 'text-purple-500', prefix: '+' },
  use: { label: '사용', color: 'text-red-500', prefix: '-' },
  refund: { label: '환불', color: 'text-green-500', prefix: '+' },
  settlement: { label: '정산', color: 'text-orange-500', prefix: '' },
};

export default function MerchantWalletPage() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [packages, setPackages] = useState<TopupPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<TopupPackage | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [processing, setProcessing] = useState(false);

  // 지갑 정보 로드
  const loadWallet = useCallback(async () => {
    try {
      const merchantId = localStorage.getItem('current_merchant_id');
      if (!merchantId) {
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/merchant/wallet?merchant_id=${merchantId}`);
      const data = await res.json();

      if (data.success) {
        setWallet(data.data.wallet);
        setTransactions(data.data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load wallet:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 패키지 목록 로드
  const loadPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/payment/topup');
      const data = await res.json();

      if (data.success) {
        setPackages(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load packages:', err);
    }
  }, []);

  useEffect(() => {
    loadWallet();
    loadPackages();
  }, [loadWallet, loadPackages]);

  // 충전 진행
  const handleTopup = async () => {
    const merchantId = localStorage.getItem('current_merchant_id');
    if (!merchantId) {
      alert('가맹점 정보를 찾을 수 없습니다.');
      return;
    }

    if (!selectedPackage && !customAmount) {
      alert('충전 금액을 선택해주세요.');
      return;
    }

    setProcessing(true);

    try {
      const res = await fetch('/api/payment/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId,
          package_id: selectedPackage?.id,
          custom_amount: customAmount ? parseInt(customAmount) : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // 토스 SDK로 결제 진행 (실제 구현 시)
        // const { loadTossPayments } = await import('@tosspayments/payment-sdk');
        // const tossPayments = await loadTossPayments(data.data.toss_config.clientKey);
        // await tossPayments.requestPayment('카드', data.data.toss_config);

        // 데모: 결제 성공 시뮬레이션
        alert(`충전 금액: ${data.data.amount.toLocaleString()}원\n보너스: ${data.data.bonus_amount.toLocaleString()}원\n\n(PG 연동 후 실제 결제가 진행됩니다)`);
        setShowTopup(false);
        setSelectedPackage(null);
        setCustomAmount('');
      } else {
        alert(data.error || '충전 요청에 실패했습니다.');
      }
    } catch (err) {
      console.error('Topup error:', err);
      alert('충전 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-6 py-8 pb-16">
        <h1 className="text-2xl font-bold mb-2">충전금 관리</h1>
        <p className="opacity-80">AIRCTT 서비스 이용을 위한 충전금</p>
      </div>

      {/* 잔액 카드 */}
      <div className="px-4 -mt-10">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="text-center mb-6">
            <p className="text-gray-500 mb-1">현재 잔액</p>
            <p className="text-4xl font-bold text-gray-900">
              {(wallet?.balance || 0).toLocaleString()}
              <span className="text-lg font-normal text-gray-500 ml-1">원</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">총 충전</p>
              <p className="text-lg font-bold text-blue-500">
                {(wallet?.total_charged || 0).toLocaleString()}원
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">총 사용</p>
              <p className="text-lg font-bold text-red-500">
                {(wallet?.total_used || 0).toLocaleString()}원
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowTopup(true)}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg"
          >
            충전하기
          </button>
        </div>
      </div>

      {/* 거래 내역 */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">거래 내역</h2>

        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
            거래 내역이 없습니다.
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden">
            {transactions.map((tx, idx) => {
              const config = TRANSACTION_LABELS[tx.transaction_type] || {
                label: tx.transaction_type,
                color: 'text-gray-500',
                prefix: '',
              };

              return (
                <div
                  key={tx.id}
                  className={`p-4 flex items-center justify-between ${
                    idx !== transactions.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {tx.description}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(tx.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${config.color}`}>
                      {config.prefix}{tx.amount.toLocaleString()}원
                    </p>
                    <p className="text-xs text-gray-400">
                      잔액 {tx.balance_after.toLocaleString()}원
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 충전 모달 */}
      <AnimatePresence>
        {showTopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowTopup(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">충전하기</h2>
                <button
                  onClick={() => setShowTopup(false)}
                  className="text-gray-400 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {/* 패키지 선택 */}
                <p className="text-sm text-gray-500 mb-3">충전 금액 선택</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setCustomAmount('');
                      }}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedPackage?.id === pkg.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200'
                      }`}
                    >
                      {pkg.is_popular && (
                        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                          인기
                        </span>
                      )}
                      <p className="font-bold text-lg">
                        {pkg.amount.toLocaleString()}원
                      </p>
                      {(pkg.bonus_amount > 0 || pkg.bonus_percent > 0) && (
                        <p className="text-sm text-orange-500 mt-1">
                          +{pkg.bonus_amount > 0
                            ? `${pkg.bonus_amount.toLocaleString()}원`
                            : `${pkg.bonus_percent}%`} 보너스
                        </p>
                      )}
                    </button>
                  ))}
                </div>

                {/* 직접 입력 */}
                <p className="text-sm text-gray-500 mb-2">직접 입력</p>
                <div className="relative mb-6">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedPackage(null);
                    }}
                    placeholder="최소 10,000원"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-orange-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    원
                  </span>
                </div>

                {/* 선택된 금액 표시 */}
                {(selectedPackage || customAmount) && (
                  <div className="bg-orange-50 rounded-2xl p-4 mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">충전 금액</span>
                      <span className="font-bold">
                        {selectedPackage
                          ? selectedPackage.amount.toLocaleString()
                          : parseInt(customAmount || '0').toLocaleString()}원
                      </span>
                    </div>
                    {selectedPackage && selectedPackage.bonus_amount > 0 && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">보너스</span>
                        <span className="font-bold text-orange-500">
                          +{selectedPackage.bonus_amount.toLocaleString()}원
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-orange-200">
                      <span className="font-bold">총 충전</span>
                      <span className="font-bold text-orange-500 text-lg">
                        {selectedPackage
                          ? (selectedPackage.amount + selectedPackage.bonus_amount).toLocaleString()
                          : parseInt(customAmount || '0').toLocaleString()}원
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-gray-50">
                <button
                  onClick={handleTopup}
                  disabled={processing || (!selectedPackage && !customAmount)}
                  className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50"
                >
                  {processing ? '처리 중...' : '충전하기'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
