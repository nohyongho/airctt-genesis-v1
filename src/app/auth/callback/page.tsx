
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { consumerAuthService } from '@/lib/consumer-auth';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            // 1. Parse Hash for Implicit Flow (Supabase Default for client-side without PKCE lib)
            const hash = window.location.hash;
            const params = new URLSearchParams(hash.replace('#', '?')); // Trick to parse hash as search params

            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const expiresIn = params.get('expires_in');
            const type = params.get('type'); // 'recovery', 'signup', etc.

            if (accessToken) {
                // 2. Fetch User Details
                try {
                    const user = await consumerAuthService.fetchUser(accessToken);
                    if (user) {
                        // 3. Save Session
                        consumerAuthService.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken || '',
                            user: user
                        });

                        toast.success('로그인 성공! 환영합니다.');
                        router.replace('/consumer');
                        return;
                    }
                } catch (e) {
                    console.error(e);
                }
            }

            // Check for error in hash or query
            const errorDescription = params.get('error_description');
            if (errorDescription) {
                toast.error(`로그인 실패: ${errorDescription}`);
            } else if (!accessToken) {
                // Fallback: Check Query Params (sometimes used for different flows)
                const queryParams = new URLSearchParams(window.location.search);
                const code = queryParams.get('code');
                if (code) {
                    // We need PKCE handling for 'code', which is hard without library.
                    // We will assume Implicit Flow was requested.
                    toast.error('인증 코드가 감지되었습니다. Implicit Flow를 확인해주세요.');
                }
            }

            // If failed, go back to login
            // router.replace('/consumer/login'); 
        };

        handleCallback();
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center bg-black text-white">
            <div className="text-center space-y-4">
                <div className="animate-spin text-4xl">💫</div>
                <p className="text-lg">로그인 처리 중입니다...</p>
                <p className="text-sm text-gray-400">잠시만 기다려주세요.</p>
            </div>
        </div>
    );
}
