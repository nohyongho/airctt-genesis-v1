
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Lock,
  CreditCard,
  FileText,
  MessageSquare,
  Star,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { merchantProfileService, initMerchantDemo } from '@/lib/merchant-service';
import { MerchantProfile } from '@/lib/merchant-types';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

type SettingItemBase = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  description: string;
};

type SettingActionItem = SettingItemBase & {
  action: () => void;
  toggle?: false;
};

type SettingToggleItem = SettingItemBase & {
  toggle: true;
  value: boolean;
  onChange: (value: boolean) => void;
  action?: never;
};

type SettingItem = SettingActionItem | SettingToggleItem;

type SettingsSection = {
  title: string;
  items: SettingItem[];
};

export default function MerchantSettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    marketing: false,
  });

  const [editProfile, setEditProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    initMerchantDemo();
    const p = merchantProfileService.get();
    setProfile(p);
    if (p) {
      setEditProfile({
        name: p.name,
        email: p.email || '',
        phone: p.phone || '',
      });
    }
  }, []);

  const handleLogout = () => {
    toast.success('로그아웃되었습니다');
    router.push('/login');
  };

  const handleSaveProfile = () => {
    if (profile) {
      const updatedProfile = merchantProfileService.save({
        name: editProfile.name,
        email: editProfile.email,
        phone: editProfile.phone,
      });
      setProfile(updatedProfile);
    }
    setIsProfileOpen(false);
    toast.success('프로필이 저장되었습니다');
  };

  const settingsSections: SettingsSection[] = [
    {
      title: '계정',
      items: [
        {
          icon: User,
          label: '프로필 수정',
          description: '이름, 이메일, 연락처',
          action: () => setIsProfileOpen(true),
        },
        {
          icon: Lock,
          label: '비밀번호 변경',
          description: '보안을 위해 주기적으로 변경',
          action: () => toast.info('비밀번호 변경 기능 준비중'),
        },
        {
          icon: CreditCard,
          label: '결제 수단 관리',
          description: '카드, 계좌 정보',
          action: () => toast.info('결제 수단 관리 기능 준비중'),
        },
      ],
    },
    {
      title: '알림',
      items: [
        {
          icon: Bell,
          label: '푸시 알림',
          description: '주문, 쿠폰 사용 알림',
          toggle: true,
          value: notifications.push,
          onChange: (v: boolean) =>
            setNotifications({ ...notifications, push: v }),
        },
        {
          icon: Mail,
          label: '이메일 알림',
          description: '정산, 공지사항',
          toggle: true,
          value: notifications.email,
          onChange: (v: boolean) =>
            setNotifications({ ...notifications, email: v }),
        },
        {
          icon: Smartphone,
          label: 'SMS 알림',
          description: '긴급 알림',
          toggle: true,
          value: notifications.sms,
          onChange: (v: boolean) =>
            setNotifications({ ...notifications, sms: v }),
        },
      ],
    },
    {
      title: '앱 설정',
      items: [
        {
          icon: theme === 'dark' ? Moon : Sun,
          label: '다크 모드',
          description: '어두운 테마 사용',
          toggle: true,
          value: theme === 'dark',
          onChange: (v: boolean) => setTheme(v ? 'dark' : 'light'),
        },
        {
          icon: Globe,
          label: '언어',
          description: '한국어',
          action: () => toast.info('언어 설정 기능 준비중'),
        },
      ],
    },
    {
      title: '지원',
      items: [
        {
          icon: HelpCircle,
          label: '도움말',
          description: '자주 묻는 질문',
          action: () => toast.info('도움말 페이지 준비중'),
        },
        {
          icon: MessageSquare,
          label: '문의하기',
          description: '1:1 채팅 상담',
          action: () => toast.info('채팅 상담 기능 준비중'),
        },
        {
          icon: Star,
          label: '앱 평가하기',
          description: '리뷰 작성',
          action: () => toast.info('앱 스토어로 이동'),
        },
        {
          icon: FileText,
          label: '이용약관',
          description: '서비스 이용약관',
          action: () => toast.info('이용약관 페이지 준비중'),
        },
        {
          icon: Shield,
          label: '개인정보처리방침',
          description: '개인정보 보호',
          action: () => toast.info('개인정보처리방침 페이지 준비중'),
        },
      ],
    },
  ];

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
              <h1 className="text-white font-bold text-lg">설정</h1>
              <p className="text-white/70 text-xs">앱 설정 및 계정 관리</p>
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
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {profile.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-bold text-lg">{profile.name}</h2>
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 text-xs">
                        PRO
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {profile.email || 'email@example.com'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile.phone || '010-0000-0000'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsProfileOpen(true)}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (sectionIndex + 1) }}
          >
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isToggle = 'toggle' in item && item.toggle === true;
                  const hasAction = 'action' in item && typeof item.action === 'function';

                  return (
                    <div key={item.label}>
                      {itemIndex > 0 && (
                        <Separator className="my-1 bg-white/5" />
                      )}
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          hasAction ? 'cursor-pointer hover:bg-muted/50' : ''
                        } transition-colors`}
                        onClick={hasAction ? item.action : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        {isToggle ? (
                          <Switch
                            checked={(item as SettingToggleItem).value}
                            onCheckedChange={(item as SettingToggleItem).onChange}
                          />
                        ) : (
                          hasAction && (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="outline"
            className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10"
            onClick={() => setIsLogoutOpen(true)}
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center pb-4"
        >
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Info className="w-3 h-3" />
            <span>CouponTalkTalk Business v2.0.0</span>
          </div>
        </motion.div>
      </div>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>프로필 수정</DialogTitle>
            <DialogDescription>
              계정 정보를 수정합니다
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>이름</Label>
              <Input
                value={editProfile.name}
                onChange={(e) =>
                  setEditProfile({ ...editProfile, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>이메일</Label>
              <Input
                type="email"
                value={editProfile.email}
                onChange={(e) =>
                  setEditProfile({ ...editProfile, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>연락처</Label>
              <Input
                value={editProfile.phone}
                onChange={(e) =>
                  setEditProfile({ ...editProfile, phone: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleSaveProfile}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>로그아웃</DialogTitle>
            <DialogDescription>
              정말로 로그아웃하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoutOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              로그아웃
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
