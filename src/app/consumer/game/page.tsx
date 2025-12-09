'use client';

import { useRouter } from 'next/navigation';
import EventGameWindow from '@/components/consumer/EventGameWindow';
import { toast } from 'sonner';

export default function GamePage() {
    const router = useRouter();

    const handleCouponAcquired = (amount: number, name: string) => {
        toast.success(`축하합니다! ${name}을(를) 획득했습니다!`, {
            description: '지갑에서 확인하세요.',
            duration: 3000,
        });
    };

    const handleClose = () => {
        router.back();
    };

    return (
        <div className="w-full h-screen bg-black">
            <EventGameWindow
                onCouponAcquired={handleCouponAcquired}
                onClose={handleClose}
                lang="ko"
            />
        </div>
    );
}
