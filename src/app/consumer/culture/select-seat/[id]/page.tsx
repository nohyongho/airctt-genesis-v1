
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SelectSeatPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

    // Mock Seat Layout (10x8 Grid)
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const toggleSeat = (seatId: string) => {
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(prev => prev.filter(s => s !== seatId));
        } else {
            if (selectedSeats.length >= 4) {
                toast.error('최대 4매까지만 선택 가능합니다.');
                return;
            }
            setSelectedSeats(prev => [...prev, seatId]);
        }
    };

    const handlePayment = () => {
        // Step 8 Logic: Create Ticket -> Wallet
        toast.success('예매가 완료되었습니다! 티켓이 지갑으로 전송됩니다. 🎟️');
        router.push('/consumer/wallet');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">

            <header className="h-14 flex items-center justify-between px-4 border-b border-white/10">
                <Button variant="ghost" size="icon" className="text-white" onClick={() => router.back()}>
                    <ChevronLeft />
                </Button>
                <span className="font-bold">좌석 선택</span>
                <div className="w-10" />
            </header>

            {/* Screen Area */}
            <div className="py-8 flex flex-col items-center">
                <div className="w-3/4 h-2 bg-slate-700 rounded-full mb-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
                <p className="text-xs text-slate-500 uppercase tracking-widest">SCREEN / STAGE</p>
            </div>

            {/* Seat Map */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
                    {rows.map(row => (
                        cols.map(col => {
                            const seatId = `${row}${col}`;
                            const isSelected = selectedSeats.includes(seatId);
                            // Random disabled seats for realism
                            const isDisabled = (row === 'A' && col === 5) || (row === 'C' && col === 2);

                            return (
                                <button
                                    key={seatId}
                                    disabled={isDisabled}
                                    onClick={() => toggleSeat(seatId)}
                                    className={`
                                w-8 h-8 sm:w-10 sm:h-10 rounded-t-lg rounded-b-sm text-[10px] font-bold transition-all
                                ${isDisabled ? 'bg-slate-800 text-slate-600 cursor-not-allowed' :
                                            isSelected ? 'bg-pink-600 text-white shadow-[0_0_10px_#db2777] scale-110 z-10' :
                                                'bg-white text-slate-900 hover:bg-slate-200'}
                            `}
                                >
                                    {row}{col}
                                </button>
                            )
                        })
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 py-4 text-xs text-slate-400">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white rounded-sm" /> 선택가능</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-pink-600 rounded-sm" /> 선택됨</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-800 rounded-sm" /> 예매완료</div>
            </div>

            {/* Footer Summary */}
            <div className="bg-slate-800 p-4 safe-area-bottom border-t border-white/10">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-sm text-slate-400 mb-1">총 {selectedSeats.length}명</p>
                        <p className="text-xs text-slate-500">{selectedSeats.join(', ')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-pink-500">{(selectedSeats.length * 150000).toLocaleString()}원</p>
                    </div>
                </div>
                <Button
                    className="w-full h-12 bg-pink-600 hover:bg-pink-700 text-lg font-bold"
                    disabled={selectedSeats.length === 0}
                    onClick={handlePayment}
                >
                    결제하기
                </Button>
            </div>

        </div>
    );
}
