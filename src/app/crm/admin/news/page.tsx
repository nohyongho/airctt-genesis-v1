
'use client';

import { useState } from 'react';
import { Plus, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminStore } from '@/lib/admin/store';
import NewsList from '@/components/admin/NewsList';
import NewsForm from '@/components/admin/NewsForm';
import { News } from '@/lib/admin/types';
import { toast } from 'sonner';

export default function NewsPage() {
  const { currentUser, getNewsByOwnerId, createNews, updateNews, deleteNews } = useAdminStore();
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!currentUser) {
    return null;
  }

  const myNews = getNewsByOwnerId(currentUser.id);

  const handleCreate = (news: Partial<News>) => {
    createNews({
      ownerId: currentUser.id,
      title: news.title || '',
      content: news.content || '',
      pinned: news.pinned,
    });
    setShowCreateForm(false);
    toast.success('소식이 작성되었습니다');
  };

  const handleEdit = (news: Partial<News>) => {
    if (!news.id) {
      return;
    }
    updateNews(news.id, news);
    toast.success('소식이 수정되었습니다');
  };

  const handleDelete = (id: string) => {
    deleteNews(id);
    toast.success('소식이 삭제되었습니다');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">최신 소식</h1>
            <p className="text-muted-foreground">
              공지사항과 소식을 관리하세요
            </p>
          </div>
        </div>

        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          새 소식 작성
        </Button>
      </div>

      <NewsList
        newsList={myNews}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showCreateForm && (
        <NewsForm
          onClose={() => setShowCreateForm(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}
