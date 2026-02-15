'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CouponGame3D from '@/components/consumer/CouponGame3D';

export default function AircttGamePage() {
    const router = useRouter();

    // 게임 페이지는 몰입감을 위해 기본 다크모드
    useEffect(() => {
        const html = document.documentElement;
        const wasDark = html.classList.contains('dark');
        html.classList.add('dark');
        return () => {
            if (!wasDark) html.classList.remove('dark');
        };
    }, []);

    const handleCouponAcquired = (amount: number, name: string) => {
        // 게임 내 UI가 처리하므로 추가 토스트 불필요
    };

    const handleClose = () => {
        router.push('/airctt');
    };

    return (
        <div className="w-full h-screen dark">
            <CouponGame3D
                onCouponAcquired={handleCouponAcquired}
                onClose={handleClose}
                lang="ko"
            />
        </div>
    );
}
