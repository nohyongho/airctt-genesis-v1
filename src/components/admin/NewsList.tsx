
'use client';

import { useState } from 'react';
import { Edit, Trash2, Pin, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { News } from '@/lib/admin/types';
import NewsForm from './NewsForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface NewsListProps {
  newsList: News[];
  onEdit: (news: Partial<News>) => void;
  onDelete: (id: string) => void;
}

export default function NewsList({ newsList, onEdit, onDelete }: NewsListProps) {
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [deletingNewsId, setDeletingNewsId] = useState<string | null>(null);

  const sortedNews = [...newsList].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (newsList.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">등록된 소식이 없습니다</p>
          <p className="text-sm text-muted-foreground mt-1">
            새 소식 작성 버튼을 클릭하여 시작하세요
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {sortedNews.map((news) => (
          <Card key={news.id} className={news.pinned ? 'border-primary' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {news.pinned && (
                      <Badge variant="default" className="gap-1">
                        <Pin className="h-3 w-3" />
                        고정
                      </Badge>
                    )}
                    <h3 className="text-lg font-semibold">{news.title}</h3>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {news.content}
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {new Date(news.createdAt).toLocaleString('ko-KR')}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingNews(news)}>
                      <Edit className="h-4 w-4 mr-2" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeletingNewsId(news.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingNews && (
        <NewsForm
          news={editingNews}
          onClose={() => setEditingNews(null)}
          onSave={(updated) => {
            onEdit({
              ...editingNews,
              ...updated,
              id: editingNews.id,
            });
            setEditingNews(null);
          }}
        />
      )}

      <AlertDialog open={!!deletingNewsId} onOpenChange={() => setDeletingNewsId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>소식 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말 이 소식을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingNewsId) {
                  onDelete(deletingNewsId);
                  setDeletingNewsId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
