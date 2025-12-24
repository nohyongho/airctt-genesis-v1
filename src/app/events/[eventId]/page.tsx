'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  poster_url: string;
  banner_url: string;
  venue_name: string;
  venue_address: string;
  event_date: string;
  event_end_date: string;
  doors_open_at: string;
  running_time: number;
  status: string;
  merchants: {
    business_name: string;
  };
  ticket_types: TicketType[];
}

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  total_quantity: number;
  sold_quantity: number;
  min_per_order: number;
  max_per_order: number;
  is_numbered_seat: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  concert: '콘서트',
  theater: '연극/뮤지컬',
  exhibition: '전시회',
  sports: '스포츠',
  festival: '축제',
  other: '기타',
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedType, setSelectedType] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [processing, setProcessing] = useState(false);

  const loadEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/events?event_id=${eventId}`);
      const data = await res.json();

      // 단일 이벤트 조회 API가 없으므로 목록에서 찾기
      // 실제로는 /api/events/[eventId] 엔드포인트 필요
      if (data.success && data.data?.[0]) {
        setEvent(data.data[0]);
      }
    } catch (err) {
      console.error('Failed to load event:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const handleBooking = async () => {
    if (!selectedType || !buyerInfo.name || !buyerInfo.phone) {
      alert('필수 정보를 입력해주세요.');
      return;
    }

    setProcessing(true);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          ticket_type_id: selectedType.id,
          quantity,
          buyer_name: buyerInfo.name,
          buyer_phone: buyerInfo.phone,
          buyer_email: buyerInfo.email,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`티켓 ${quantity}매 예매가 완료되었습니다!\n티켓번호: ${data.data.tickets[0].ticket_number}`);
        setShowBooking(false);
        router.push('/my/tickets');
      } else {
        alert(data.error || '예매에 실패했습니다.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('예매 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">이벤트를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const availableTypes = event.ticket_types?.filter(
    (tt) => tt.total_quantity > tt.sold_quantity
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 포스터 헤더 */}
      <div className="relative">
        {event.poster_url ? (
          <img
            src={event.poster_url}
            alt={event.title}
            className="w-full aspect-[3/4] object-cover"
          />
        ) : (
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
            <span className="text-6xl">🎭</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
        >
          ←
        </button>

        {/* 상태 배지 */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            event.status === 'on_sale'
              ? 'bg-green-500 text-white'
              : event.status === 'sold_out'
              ? 'bg-red-500 text-white'
              : 'bg-gray-500 text-white'
          }`}>
            {event.status === 'on_sale' ? '판매중' : event.status === 'sold_out' ? '매진' : event.status}
          </span>
        </div>

        {/* 제목 영역 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <span className="text-sm opacity-80">
            {CATEGORY_LABELS[event.category] || event.category}
          </span>
          <h1 className="text-2xl font-bold mt-1">{event.title}</h1>
          {event.subtitle && (
            <p className="text-lg opacity-90 mt-1">{event.subtitle}</p>
          )}
        </div>
      </div>

      {/* 정보 섹션 */}
      <div className="p-4 space-y-4">
        {/* 일시/장소 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-medium">공연 일시</p>
              <p className="text-gray-600">{formatDate(event.event_date)}</p>
              {event.running_time && (
                <p className="text-sm text-gray-400">
                  러닝타임 {event.running_time}분
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">📍</span>
            <div>
              <p className="font-medium">{event.venue_name}</p>
              {event.venue_address && (
                <p className="text-gray-600 text-sm">{event.venue_address}</p>
              )}
            </div>
          </div>
        </div>

        {/* 티켓 가격 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-lg mb-3">티켓 정보</h2>
          {event.ticket_types?.length === 0 ? (
            <p className="text-gray-500">등록된 티켓이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {event.ticket_types?.map((tt) => {
                const remaining = tt.total_quantity - tt.sold_quantity;
                const isSoldOut = remaining <= 0;

                return (
                  <div
                    key={tt.id}
                    className={`p-3 rounded-xl border-2 ${
                      isSoldOut
                        ? 'border-gray-200 bg-gray-50 opacity-60'
                        : 'border-purple-200 bg-purple-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{tt.name}</span>
                        {tt.is_numbered_seat && (
                          <span className="ml-2 text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">
                            지정석
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {tt.original_price && tt.original_price > tt.price && (
                          <span className="text-sm text-gray-400 line-through mr-2">
                            {tt.original_price.toLocaleString()}원
                          </span>
                        )}
                        <span className="font-bold text-purple-600">
                          {tt.price.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1 text-sm">
                      <span className="text-gray-500">{tt.description}</span>
                      <span className={isSoldOut ? 'text-red-500' : 'text-gray-500'}>
                        {isSoldOut ? '매진' : `잔여 ${remaining}석`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 상세 설명 */}
        {event.description && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-lg mb-3">공연 소개</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {/* 주최 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-lg mb-2">주최</h2>
          <p className="text-gray-600">{event.merchants?.business_name}</p>
        </div>
      </div>

      {/* 예매 버튼 */}
      {event.status === 'on_sale' && availableTypes.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button
            onClick={() => setShowBooking(true)}
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg"
          >
            티켓 예매하기
          </button>
        </div>
      )}

      {/* 예매 시트 */}
      <AnimatePresence>
        {showBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowBooking(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">티켓 예매</h2>
                <button
                  onClick={() => setShowBooking(false)}
                  className="text-gray-400 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 좌석 선택 */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">좌석 등급 선택</p>
                  <div className="space-y-2">
                    {availableTypes.map((tt) => (
                      <button
                        key={tt.id}
                        onClick={() => {
                          setSelectedType(tt);
                          setQuantity(1);
                        }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selectedType?.id === tt.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{tt.name}</span>
                          <span className="font-bold text-purple-600">
                            {tt.price.toLocaleString()}원
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          잔여 {tt.total_quantity - tt.sold_quantity}석
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 수량 선택 */}
                {selectedType && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">매수 선택</p>
                    <div className="flex items-center justify-center gap-4 py-4 bg-gray-50 rounded-xl">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 bg-white border rounded-full text-lg font-bold"
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(Math.min(selectedType.max_per_order, quantity + 1))
                        }
                        className="w-10 h-10 bg-white border rounded-full text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-2">
                      1인 최대 {selectedType.max_per_order}매
                    </p>
                  </div>
                )}

                {/* 예매자 정보 */}
                {selectedType && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">예매자 정보</p>
                    <input
                      type="text"
                      placeholder="이름 *"
                      value={buyerInfo.name}
                      onChange={(e) =>
                        setBuyerInfo({ ...buyerInfo, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="연락처 *"
                      value={buyerInfo.phone}
                      onChange={(e) =>
                        setBuyerInfo({ ...buyerInfo, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="이메일 (선택)"
                      value={buyerInfo.email}
                      onChange={(e) =>
                        setBuyerInfo({ ...buyerInfo, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 결제 */}
              {selectedType && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">
                      {selectedType.name} × {quantity}매
                    </span>
                    <span className="text-xl font-bold text-purple-600">
                      {(selectedType.price * quantity).toLocaleString()}원
                    </span>
                  </div>
                  <button
                    onClick={handleBooking}
                    disabled={processing || !buyerInfo.name || !buyerInfo.phone}
                    className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50"
                  >
                    {processing ? '처리 중...' : '예매하기'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
