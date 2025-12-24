
'use client';

import { LayoutDashboard, Link as LinkIcon, Newspaper, Users, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/lib/admin/store';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { News } from '@/lib/admin/types';

export default function AdminDashboard() {
  const { currentUser, getConnectionsByOwnerId, getNewsByOwnerId, adminUsers } = useAdminStore();
  const router = useRouter();

  if (!currentUser) {
    return null;
  }

  const myConnections = getConnectionsByOwnerId(currentUser.id);
  const myNews = getNewsByOwnerId(currentUser.id);

  const stats = [
    {
      title: '내 연결',
      value: myConnections.length,
      icon: LinkIcon,
      href: '/crm/admin/connections',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      title: '내 소식',
      value: myNews.length,
      icon: Newspaper,
      href: '/crm/admin/news',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      gradient: 'from-green-600 to-emerald-600',
    },
    {
      title: '전체 관리자',
      value: adminUsers.length,
      icon: Users,
      href: currentUser.role === 'HQ' ? '/crm/admin/hq' : '#',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      gradient: 'from-purple-600 to-pink-600',
      hqOnly: true,
    },
  ];

  const recentNews: News[] = myNews
    .slice()
    .sort((a: News, b: News) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  const quickLinks = [
    { href: '/crm/admin/profile', label: '프로필 관리', icon: '👤' },
    { href: '/crm/admin/connections', label: '연결 관리', icon: '🔗' },
    { href: '/crm/admin/news', label: '최신 소식', icon: '📰' },
    ...(currentUser.role === 'HQ' ? [{ href: '/crm/admin/hq', label: '본사 관리', icon: '🏢' }] : []),
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-4 py-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">CTT CRM 관리자 시스템</span>
        </div>
        <h1 className="text-4xl font-bold">
          환영합니다, {currentUser.name}님! 👋
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          연결 및 소식을 관리하고 플랫폼을 운영하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          if (stat.hqOnly && currentUser.role !== 'HQ') return null;

          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.gradient} transform group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-4 text-xs text-primary font-medium group-hover:gap-2 transition-all">
                    <TrendingUp className="h-3 w-3" />
                    <span>자세히 보기</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">빠른 메뉴</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <Card
              key={index}
              className="cursor-pointer group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
              onClick={() => router.push(link.href)}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div className="text-4xl">{link.icon}</div>
                <p className="font-semibold">{link.label}</p>
                <div className="flex items-center justify-center gap-2 text-primary text-sm group-hover:gap-3 transition-all">
                  <span>이동</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>프로필 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentUser.profileImageUrl && (
              <div className="flex justify-center">
                <img
                  src={currentUser.profileImageUrl}
                  alt="프로필"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
                />
              </div>
            )}
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">이름</span>
                <span className="font-medium">{currentUser.name}</span>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">역할</span>
                <Badge>
                  {currentUser.role === 'HQ' && '본사'}
                  {currentUser.role === 'ADMIN' && '지점 관리자'}
                  {currentUser.role === 'MERCHANT' && '가맹점'}
                </Badge>
              </div>
              {currentUser.email && (
                <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">이메일</span>
                  <span className="font-medium">{currentUser.email}</span>
                </div>
              )}
              {currentUser.phone && (
                <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">전화번호</span>
                  <span className="font-medium">{currentUser.phone}</span>
                </div>
              )}
            </div>
            <Link href="/crm/admin/profile">
              <Button variant="outline" className="w-full mt-4 gap-2">
                프로필 수정
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>최근 소식</CardTitle>
              <Link href="/crm/admin/news">
                <Button variant="ghost" size="sm" className="gap-2">
                  전체 보기
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentNews.length === 0 ? (
              <div className="text-center py-8">
                <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">등록된 소식이 없습니다</p>
                <Link href="/crm/admin/news">
                  <Button variant="outline" size="sm" className="mt-4">
                    소식 작성하기
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentNews.map((news: News) => (
                  <div
                    key={news.id}
                    className="border-b pb-3 last:border-0 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      {news.pinned && (
                        <Badge variant="default" className="text-xs">
                          고정
                        </Badge>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {news.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {news.createdAt
                            ? new Date(news.createdAt).toLocaleDateString('ko-KR')
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {currentUser.description && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>소개</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {currentUser.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

