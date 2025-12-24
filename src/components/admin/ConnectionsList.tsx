
'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Store, Mic, Globe, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Connection, ConnectionType } from '@/lib/admin/types';
import ConnectionForm from './ConnectionForm';
import DeleteRequestModal from './DeleteRequestModal';

interface ConnectionsListProps {
  connections: Connection[];
  onEdit: (connection: Connection) => void;
  onDelete: (id: string, reason: string) => void;
}

const connectionIcons: Record<ConnectionType, any> = {
  KARAOKE: Mic,
  STORE: Store,
  ONLINE: Globe,
  OTHER: MoreHorizontal,
};

const connectionTypeLabels: Record<ConnectionType, string> = {
  KARAOKE: '노래방',
  STORE: '매장',
  ONLINE: '온라인',
  OTHER: '기타',
};

export default function ConnectionsList({ connections, onEdit, onDelete }: ConnectionsListProps) {
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [deletingConnectionId, setDeletingConnectionId] = useState<string | null>(null);

  const handleEdit = (connection: Connection) => {
    setEditingConnection(connection);
  };

  const handleDelete = (reason: string) => {
    if (deletingConnectionId) {
      onDelete(deletingConnectionId, reason);
      setDeletingConnectionId(null);
    }
  };

  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">등록된 연결이 없습니다</p>
          <p className="text-sm text-muted-foreground mt-1">
            새 연결 추가 버튼을 클릭하여 시작하세요
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connections.map((connection) => {
          const Icon = connectionIcons[connection.type];
          return (
            <Card key={connection.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{connection.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {connectionTypeLabels[connection.type]}
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(connection)}>
                        <Edit className="h-4 w-4 mr-2" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingConnectionId(connection.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제 요청
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {connection.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {connection.description}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  생성일: {new Date(connection.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editingConnection && (
        <ConnectionForm
          connection={editingConnection}
          onClose={() => setEditingConnection(null)}
          onSave={(updated) => {
            const mergedConnection: Connection = {
              ...editingConnection,
              ...updated,
              id: editingConnection.id,
              ownerId: editingConnection.ownerId,
              createdAt: editingConnection.createdAt,
              updatedAt: new Date().toISOString(),
            };
            onEdit(mergedConnection);
            setEditingConnection(null);
          }}
        />
      )}

      {deletingConnectionId && (
        <DeleteRequestModal
          targetName={connections.find((c) => c.id === deletingConnectionId)?.name || ''}
          onConfirm={handleDelete}
          onCancel={() => setDeletingConnectionId(null)}
        />
      )}
    </>
  );
}
