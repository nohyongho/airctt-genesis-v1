'use client';

import { useRouter } from 'next/navigation';
import CouponGame3D from '@/components/consumer/CouponGame3D';
import { toast } from 'sonner';

export default function GamePage() {
    const router = useRouter();

    const handleCouponAcquired = (amount: number, name: string) => {
        // Toast is now subtle since the game has its own UI
    };

    const handleClose = () => {
        router.push('/consumer');
    };

    return (
        <div className="w-full h-screen">
            <CouponGame3D
                onCouponAcquired={handleCouponAcquired}
                onClose={handleClose}
                lang="ko"
            />
        </div>
    );
}
