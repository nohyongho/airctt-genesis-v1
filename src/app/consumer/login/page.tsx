
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/contexts/I18nContext';
import { consumerAuthService } from '@/lib/consumer-auth';
import { toast } from 'sonner';

export default function ConsumerLoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo Convenience
  const fillDemo = () => {
    setEmail('demo@airctt.com');
    setPassword('demo1234');
    setLoginMode('password');
  };

  const [loginMode, setLoginMode] = useState<'password' | 'magic'>('magic'); // Default to Magic Link as it's cleaner

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (loginMode === 'magic') {
        await consumerAuthService.signInWithOtp(email);
        toast.success('인증 메일이 발송되었습니다! 이메일을 확인해주세요.');
        // Don't redirect yet, user needs to check email
      } else {
        const user = await consumerAuthService.emailLogin(email, password);
        // consumerAuthService.login(user); // Handled inside emailLogin
        toast.success(t('login.loginSuccess'));
        router.push('/consumer');
      }
    } catch (error: any) {
      toast.error(error.message || t('login.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'naver') => {
    setLoading(true);
    try {
      consumerAuthService.signInWithOAuth(provider);
      // No toast/push here because it redirects
    } catch (error) {
      toast.error(t('login.loginError'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6 sm:mb-8 relative group">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg cursor-pointer" onClick={fillDemo}>
            <Radio className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            {t('login.title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">{t('login.subtitle')}</p>

          {/* Secret Demo Hint */}
          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={fillDemo}>Demo</Button>
          </div>
        </div>

        <Card className="glass-card">
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Login Mode Toggle */}
            <div className="flex bg-muted p-1 rounded-lg mb-4">
              <button
                type="button"
                onClick={() => setLoginMode('magic')}
                className={`flex-1 text-sm py-1 rounded-md transition-all ${loginMode === 'magic' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'}`}
              >
                이메일로 로그인 (Magic Link)
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('password')}
                className={`flex-1 text-sm py-1 rounded-md transition-all ${loginMode === 'password' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'}`}
              >
                비밀번호 로그인
              </button>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-3 sm:space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                  required
                />
              </div>

              {loginMode === 'password' && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder={t('login.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 text-sm sm:text-base"
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-sm sm:text-base"
                disabled={loading}
              >
                {loginMode === 'magic' ? '인증 메일 보내기 🪄' : t('login.emailLogin')}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">또는</span>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">

              <Button
                variant="outline"
                className="w-full text-sm sm:text-base relative"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
              >
                <div className="absolute left-4">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                {t('login.googleLogin')}
              </Button>

              <Button
                variant="outline"
                className="w-full bg-[#FEE500] text-black hover:bg-[#FEE500]/90 text-sm sm:text-base border-none relative"
                onClick={() => handleSocialLogin('kakao')}
                disabled={loading}
              >
                <div className="absolute left-4">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                  </svg>
                </div>
                {t('login.kakaoLogin')}
              </Button>

              <Button
                variant="outline"
                className="w-full bg-[#03C75A] text-white hover:bg-[#03C75A]/90 text-sm sm:text-base border-none relative"
                onClick={() => handleSocialLogin('naver')}
                disabled={loading}
              >
                <div className="absolute left-4 font-black font-sans text-sm">N</div>
                네이버로 로그인
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

