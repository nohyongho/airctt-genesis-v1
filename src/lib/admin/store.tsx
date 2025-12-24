
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  AdminUser,
  Connection,
  News,
  DeleteRequest,
  AdminLoginCredentials,
} from './types';
import {
  mockAdminUsers,
  mockConnections,
  mockNews,
  mockDeleteRequests,
} from './mock-data';

interface AdminStore {
  currentUser: AdminUser | null;
  adminUsers: AdminUser[];
  connections: Connection[];
  news: News[];
  deleteRequests: DeleteRequest[];

  login: (credentials: AdminLoginCredentials) => boolean;
  logout: () => void;

  updateProfile: (updates: Partial<AdminUser>) => void;

  getConnectionsByOwnerId: (ownerId: string) => Connection[];
  createConnection: (
    connection: Omit<Connection, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;

  getNewsByOwnerId: (ownerId: string) => News[];
  createNews: (news: Omit<News, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNews: (id: string, updates: Partial<News>) => void;
  deleteNews: (id: string) => void;

  getAdminsByParentId: (parentId: string | null) => AdminUser[];
  updateAdminStatus: (id: string, status: AdminUser['status']) => void;

  createDeleteRequest: (
    request: Omit<DeleteRequest, 'id' | 'createdAt'>
  ) => void;
  updateDeleteRequest: (id: string, updates: Partial<DeleteRequest>) => void;
  getDeleteRequestsByStatus: (
    status?: DeleteRequest['status']
  ) => DeleteRequest[];

  sendEmailNotification: (payload: any) => void;
}

const AdminStoreContext = createContext<AdminStore | undefined>(undefined);

const STORAGE_KEY = 'admin-storage';

function loadFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data: any) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const stored = loadFromStorage();

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(
    stored?.currentUser || null
  );
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(
    stored?.adminUsers || mockAdminUsers
  );
  const [connections, setConnections] = useState<Connection[]>(
    stored?.connections || mockConnections
  );
  const [news, setNews] = useState<News[]>(stored?.news || mockNews);
  const [deleteRequests, setDeleteRequests] = useState<DeleteRequest[]>(
    stored?.deleteRequests || mockDeleteRequests
  );

  useEffect(() => {
    saveToStorage({
      currentUser,
      adminUsers,
      connections,
      news,
      deleteRequests,
    });
  }, [currentUser, adminUsers, connections, news, deleteRequests]);

  const login = (credentials: AdminLoginCredentials): boolean => {
    if (credentials.username === 'admin' && credentials.password === '1234') {
      const hqUser = adminUsers.find((u) => u.role === 'HQ');
      if (hqUser) {
        setCurrentUser(hqUser);
        return true;
      }
    }
    const user = adminUsers.find(
      (u) => u.email === credentials.username
    );
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = (updates: Partial<AdminUser>) => {
    if (!currentUser) return;

    const updatedUser: AdminUser = {
      ...currentUser,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(updatedUser);
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
    );
  };

  const getConnectionsByOwnerId = (ownerId: string): Connection[] => {
    return connections.filter((c) => c.ownerId === ownerId);
  };

  const createConnection = (
    connection: Omit<Connection, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newConnection: Connection = {
      ...connection,
      id: `conn-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConnections((prev) => [...prev, newConnection]);
  };

  const updateConnection = (id: string, updates: Partial<Connection>) => {
    setConnections((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...updates, updatedAt: new Date().toISOString() }
          : c
      )
    );
  };

  const deleteConnection = (id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  const getNewsByOwnerId = (ownerId: string): News[] => {
    return news.filter((n) => n.ownerId === ownerId);
  };

  const createNews = (
    newsItem: Omit<News, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newNews: News = {
      ...newsItem,
      id: `news-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNews((prev) => [...prev, newNews]);
  };

  const updateNews = (id: string, updates: Partial<News>) => {
    setNews((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, ...updates, updatedAt: new Date().toISOString() }
          : n
      )
    );
  };

  const deleteNews = (id: string) => {
    setNews((prev) => prev.filter((n) => n.id !== id));
  };

  const getAdminsByParentId = (parentId: string | null): AdminUser[] => {
    return adminUsers.filter((u) => u.parentId === parentId);
  };

  const updateAdminStatus = (id: string, status: AdminUser['status']) => {
    setAdminUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status, updatedAt: new Date().toISOString() }
          : u
      )
    );
  };

  const createDeleteRequest = (
    request: Omit<DeleteRequest, 'id' | 'createdAt'>
  ) => {
    const newRequest: DeleteRequest = {
      ...request,
      id: `del-req-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDeleteRequests((prev) => [...prev, newRequest]);

    sendEmailNotification({
      type: 'DELETE_REQUEST',
      request: newRequest,
    });
  };

  const updateDeleteRequest = (
    id: string,
    updates: Partial<DeleteRequest>
  ) => {
    setDeleteRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const getDeleteRequestsByStatus = (
    status?: DeleteRequest['status']
  ): DeleteRequest[] => {
    if (!status) return deleteRequests;
    return deleteRequests.filter((r) => r.status === status);
  };

  const sendEmailNotification = (payload: any) => {
    console.log('Email send simulation:', payload);
  };

  const store: AdminStore = {
    currentUser,
    adminUsers,
    connections,
    news,
    deleteRequests,
    login,
    logout,
    updateProfile,
    getConnectionsByOwnerId,
    createConnection,
    updateConnection,
    deleteConnection,
    getNewsByOwnerId,
    createNews,
    updateNews,
    deleteNews,
    getAdminsByParentId,
    updateAdminStatus,
    createDeleteRequest,
    updateDeleteRequest,
    getDeleteRequestsByStatus,
    sendEmailNotification,
  };

  return (
    <AdminStoreContext.Provider value={store}>
      {children}
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore(): AdminStore {
  const context = useContext(AdminStoreContext);
  if (!context) {
    throw new Error('useAdminStore must be used within AdminStoreProvider');
  }
  return context;
}
