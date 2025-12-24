
'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, User, Building2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminUser } from '@/lib/admin/types';
import StopButton from './StopButton';

interface AdminTreeProps {
  admins: AdminUser[];
  connectionsCount: Record<string, number>;
  onStop: (id: string) => void;
  onResume: (id: string) => void;
}

interface TreeNodeProps {
  admin: AdminUser;
  children: AdminUser[];
  connectionsCount: number;
  onStop: (id: string) => void;
  onResume: (id: string) => void;
  level: number;
}

function TreeNode({ admin, children, connectionsCount, onStop, onResume, level }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);

  const roleIcons = {
    HQ: Building2,
    ADMIN: User,
    MERCHANT: Store,
  };

  const roleLabels = {
    HQ: '본사',
    ADMIN: '지점 관리자',
    MERCHANT: '가맹점',
  };

  const statusColors = {
    ACTIVE: 'bg-green-500',
    STOPPED: 'bg-red-500',
    PENDING_DELETE: 'bg-yellow-500',
  };

  const statusLabels = {
    ACTIVE: '활성',
    STOPPED: '정지',
    PENDING_DELETE: '삭제 대기',
  };

  const Icon = roleIcons[admin.role];
  const hasChildren = children.length > 0;

  return (
    <div className="space-y-2">
      <Card className={admin.status === 'STOPPED' ? 'opacity-60' : ''}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {hasChildren && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}

            {!hasChildren && <div className="w-6" />}

            <div className={`p-2 rounded-lg ${admin.status === 'ACTIVE' ? 'bg-primary/10' : 'bg-muted'}`}>
              <Icon className={`h-5 w-5 ${admin.status === 'ACTIVE' ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{admin.name}</h4>
                <Badge variant="outline">{roleLabels[admin.role]}</Badge>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${statusColors[admin.status]}`} />
                  <span className="text-xs text-muted-foreground">
                    {statusLabels[admin.status]}
                  </span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {admin.email} • 연결 {connectionsCount}개
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StopButton
                status={admin.status}
                onStop={() => onStop(admin.id)}
                onResume={() => onResume(admin.id)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {hasChildren && expanded && (
        <div className="ml-8 space-y-2 border-l-2 border-muted pl-4">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              admin={child}
              children={[]}
              connectionsCount={0}
              onStop={onStop}
              onResume={onResume}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminTree({ admins, connectionsCount, onStop, onResume }: AdminTreeProps) {
  const buildTree = () => {
    const hqAdmin = admins.find((a) => a.role === 'HQ');
    if (!hqAdmin) return [];

    const getChildren = (parentId: string): AdminUser[] => {
      return admins.filter((a) => a.parentId === parentId);
    };

    const buildNode = (admin: AdminUser): any => {
      const children = getChildren(admin.id);
      return {
        admin,
        children: children.map(buildNode),
      };
    };

    return [buildNode(hqAdmin)];
  };

  const tree = buildTree();

  if (tree.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">관리자 데이터가 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  const renderTree = (nodes: any[]) => {
    return nodes.map((node) => (
      <TreeNode
        key={node.admin.id}
        admin={node.admin}
        children={node.children.map((c: any) => c.admin)}
        connectionsCount={connectionsCount[node.admin.id] || 0}
        onStop={onStop}
        onResume={onResume}
        level={0}
      />
    ));
  };

  return <div className="space-y-4">{renderTree(tree)}</div>;
}
