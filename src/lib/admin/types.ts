
export type AdminRole = 'HQ' | 'ADMIN' | 'MERCHANT';
export type AdminStatus = 'ACTIVE' | 'STOPPED' | 'PENDING_DELETE';
export type ConnectionType = 'KARAOKE' | 'STORE' | 'ONLINE' | 'OTHER';
export type DeleteRequestStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED';

export interface AdminUser {
  id: string;
  name: string;
  role: AdminRole;
  email?: string;
  phone?: string;
  profileImageUrl?: string;
  profileVideoUrl?: string;
  description?: string;
  parentId?: string | null;
  status: AdminStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Connection {
  id: string;
  ownerId: string;
  name: string;
  type: ConnectionType;
  icon?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface News {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeleteRequest {
  id: string;
  targetAdminId: string;
  requestedById: string;
  reason: string;
  status: DeleteRequestStatus;
  createdAt: string;
  processedAt?: string;
  log?: string;
}

export interface AdminLoginCredentials {
  username: string;
  password: string;
}
