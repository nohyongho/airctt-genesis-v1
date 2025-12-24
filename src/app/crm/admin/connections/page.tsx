
'use client';

import { useState } from 'react';
import { Plus, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminStore } from '@/lib/admin/store';
import ConnectionsList from '@/components/admin/ConnectionsList';
import ConnectionForm from '@/components/admin/ConnectionForm';
import { Connection } from '@/lib/admin/types';
import { toast } from 'sonner';

export default function ConnectionsPage() {
  const { currentUser, connections, getConnectionsByOwnerId, createConnection, updateConnection, createDeleteRequest } = useAdminStore();
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!currentUser) {
    return null;
  }

  const myConnections = getConnectionsByOwnerId(currentUser.id);

  const handleCreate = (connection: Partial<Connection>) => {
    createConnection({
      ownerId: currentUser.id,
      name: connection.name!,
      type: connection.type!,
      description: connection.description,
    });
    setShowCreateForm(false);
    toast.success('연결이 생성되었습니다');
  };

  const handleEdit = (connection: Connection) => {
    updateConnection(connection.id, connection);
    toast.success('연결이 수정되었습니다');
  };

  const handleDelete = (id: string, reason: string) => {
    createDeleteRequest({
      targetAdminId: id,
      requestedById: currentUser.id,
      reason,
      status: 'REQUESTED',
    });
    toast.success('본사에 삭제 요청이 전송되었습니다');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LinkIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">연결 관리</h1>
            <p className="text-muted-foreground">
              브랜드, 가맹점, 파트너 연결을 관리하세요
            </p>
          </div>
        </div>

        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          새 연결 추가
        </Button>
      </div>

      <ConnectionsList
        connections={myConnections}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showCreateForm && (
        <ConnectionForm
          onClose={() => setShowCreateForm(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}
