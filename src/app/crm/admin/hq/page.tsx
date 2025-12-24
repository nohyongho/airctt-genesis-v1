
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminStore } from '@/lib/admin/store';
import AdminTree from '@/components/admin/AdminTree';
import { toast } from 'sonner';
import { sendApprovalNotificationEmail } from '@/lib/email';
import type { AdminUser, Connection, DeleteRequest } from '@/lib/admin/types';

export default function HQPage() {
  const router = useRouter();
  const {
    currentUser,
    adminUsers,
    connections,
    deleteRequests,
    updateAdminStatus,
    updateDeleteRequest,
    getDeleteRequestsByStatus,
  } = useAdminStore();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'HQ') {
      router.push('/crm/admin');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'HQ') {
    return null;
  }

  const connectionsCount = adminUsers.reduce(
    (acc: Record<string, number>, admin: AdminUser) => {
      acc[admin.id] = connections.filter((c: Connection) => c.ownerId === admin.id).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleStop = (id: string) => {
    updateAdminStatus(id, 'STOPPED');
    toast.success('관리자가 정지되었습니다');
  };

  const handleResume = (id: string) => {
    updateAdminStatus(id, 'ACTIVE');
    toast.success('관리자가 재개되었습니다');
  };

  const handleApprove = async (requestId: string) => {
    const request = deleteRequests.find((r: DeleteRequest) => r.id === requestId);
    if (!request) return;

    const targetAdmin = adminUsers.find((a: AdminUser) => a.id === request.targetAdminId);
    if (!targetAdmin) return;

    updateDeleteRequest(requestId, {
      status: 'APPROVED',
      processedAt: new Date().toISOString(),
      log: '본사에서 삭제 승인',
    });

    updateAdminStatus(request.targetAdminId, 'PENDING_DELETE');

    await sendApprovalNotificationEmail(request, targetAdmin, true);

    toast.success('삭제 요청이 승인되었습니다');
  };

  const handleReject = async (requestId: string) => {
    const request = deleteRequests.find((r: DeleteRequest) => r.id === requestId);
    if (!request) return;

    const targetAdmin = adminUsers.find((a: AdminUser) => a.id === request.targetAdminId);
    if (!targetAdmin) return;

    updateDeleteRequest(requestId, {
      status: 'REJECTED',
      processedAt: new Date().toISOString(),
      log: '본사에서 삭제 거절',
    });

    await sendApprovalNotificationEmail(request, targetAdmin, false);

    toast.success('삭제 요청이 거절되었습니다');
  };

  const pendingRequests = getDeleteRequestsByStatus('REQUESTED');
  const processedRequests = deleteRequests.filter((r: DeleteRequest) => r.status !== 'REQUESTED');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-destructive" />
        <div>
          <h1 className="text-3xl font-bold">본사 관리자 화면</h1>
          <p className="text-muted-foreground">
            전체 시스템을 모니터링하고 관리하세요
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">전체 관리자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              활성: {adminUsers.filter((a: AdminUser) => a.status === 'ACTIVE').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">전체 연결</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connections.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              모든 관리자의 연결
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">삭제 요청</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {pendingRequests.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              처리 대기 중
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tree" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tree">관리자 트리</TabsTrigger>
          <TabsTrigger value="requests">
            삭제 요청
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="space-y-4">
          <AdminTree
            admins={adminUsers}
            connectionsCount={connectionsCount}
            onStop={handleStop}
            onResume={handleResume}
          />
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {pendingRequests.length === 0 && processedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">삭제 요청이 없습니다</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {pendingRequests.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">처리 대기 중</h3>
                  {pendingRequests.map((request: DeleteRequest) => {
                    const targetAdmin = adminUsers.find(
                      (a: AdminUser) => a.id === request.targetAdminId,
                    );
                    const requestedBy = adminUsers.find(
                      (a: AdminUser) => a.id === request.requestedById,
                    );

                    return (
                      <Card key={request.id} className="border-destructive">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="destructive">대기 중</Badge>
                                <h4 className="font-semibold">
                                  {targetAdmin?.name} 삭제 요청
                                </h4>
                              </div>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <p>요청자: {requestedBy?.name}</p>
                                <p>
                                  요청일:{' '}
                                  {new Date(
                                    request.createdAt,
                                  ).toLocaleString('ko-KR')}
                                </p>
                                {request.reason && (
                                  <p className="mt-2">
                                    <span className="font-medium">사유:</span>{' '}
                                    {request.reason}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(request.id)}
                              >
                                거절
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleApprove(request.id)}
                              >
                                승인
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {processedRequests.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">처리 완료</h3>
                  {processedRequests.map((request: DeleteRequest) => {
                    const targetAdmin = adminUsers.find(
                      (a: AdminUser) => a.id === request.targetAdminId,
                    );
                    const requestedBy = adminUsers.find(
                      (a: AdminUser) => a.id === request.requestedById,
                    );

                    return (
                      <Card key={request.id} className="opacity-60">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant={
                                    request.status === 'APPROVED'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                >
                                  {request.status === 'APPROVED'
                                    ? '승인됨'
                                    : '거절됨'}
                                </Badge>
                                <h4 className="font-semibold">
                                  {targetAdmin?.name} 삭제 요청
                                </h4>
                              </div>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <p>요청자: {requestedBy?.name}</p>
                                <p>
                                  요청일:{' '}
                                  {new Date(
                                    request.createdAt,
                                  ).toLocaleString('ko-KR')}
                                </p>
                                {request.processedAt && (
                                  <p>
                                    처리일:{' '}
                                    {new Date(
                                      request.processedAt,
                                    ).toLocaleString('ko-KR')}
                                  </p>
                                )}
                                {request.reason && (
                                  <p className="mt-2">
                                    <span className="font-medium">사유:</span>{' '}
                                    {request.reason}
                                  </p>
                                )}
                                {request.log && (
                                  <p className="mt-2">
                                    <span className="font-medium">
                                      처리 메모:
                                    </span>{' '}
                                    {request.log}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
