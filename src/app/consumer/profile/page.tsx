
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Globe, 
  LogOut, 
  Trash2, 
  ChevronRight,
  Shield,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useI18n } from '@/contexts/I18nContext';
import { consumerAuthService } from '@/lib/consumer-auth';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { t, language, setLanguage } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState({
    coupon: true,
    event: true,
    marketing: false,
  });

  useEffect(() => {
    const currentUser = consumerAuthService.getUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    consumerAuthService.logout();
    toast.success(t('profile.logout'));
    window.location.href = '/consumer/login';
  };

  const handleDeleteAccount = () => {
    toast.success(t('profile.accountDeleted'));
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center">
                <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold">{user?.name || '게스트'}</h2>
                <p className="text-sm text-muted-foreground">{user?.email || 'guest@airctt.com'}</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.provider || 'Email'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Bell className="w-4 h-4" />
              {t('profile.notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm sm:text-base">{t('profile.couponNotifications')}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('profile.couponNotificationsDesc')}</p>
              </div>
              <Switch
                checked={notifications.coupon}
                onCheckedChange={(checked) => setNotifications({ ...notifications, coupon: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm sm:text-base">{t('profile.eventNotifications')}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('profile.eventNotificationsDesc')}</p>
              </div>
              <Switch
                checked={notifications.event}
                onCheckedChange={(checked) => setNotifications({ ...notifications, event: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm sm:text-base">{t('profile.marketingNotifications')}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('profile.marketingNotificationsDesc')}</p>
              </div>
              <Switch
                checked={notifications.marketing}
                onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {t('profile.settings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm sm:text-base">{t('profile.language')}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t('profile.languageDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {language === 'ko' ? '한국어' : 'English'}
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full text-sm sm:text-base">
              <LogOut className="w-4 h-4 mr-2" />
              {t('profile.logout')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('profile.logout')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('profile.logoutConfirm')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>
                {t('common.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full text-sm sm:text-base">
              <Trash2 className="w-4 h-4 mr-2" />
              {t('profile.deleteAccount')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('profile.deleteAccount')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('profile.deleteAccountConfirm')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('common.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </div>
  );
}
