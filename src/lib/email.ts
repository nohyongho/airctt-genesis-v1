
import { DeleteRequest, AdminUser } from './admin/types';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  metadata?: Record<string, any>;
}

export async function sendDeleteRequestEmail(
  request: DeleteRequest,
  targetAdmin: AdminUser,
  requestedBy: AdminUser
): Promise<void> {
  const payload: EmailPayload = {
    to: 'hq@coupontalktalk.com',
    subject: `[CTT CRM] 삭제 요청 알림 - ${targetAdmin.name}`,
    body: `
안녕하세요, CTT CRM 본사 관리자님.

새로운 삭제 요청이 접수되었습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 요청 정보
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 삭제 대상
  - 이름: ${targetAdmin.name}
  - 역할: ${targetAdmin.role}
  - 이메일: ${targetAdmin.email || 'N/A'}
  - ID: ${targetAdmin.id}

👤 요청자
  - 이름: ${requestedBy.name}
  - 역할: ${requestedBy.role}
  - 이메일: ${requestedBy.email || 'N/A'}
  - ID: ${requestedBy.id}

📝 사유
${request.reason || '(사유 없음)'}

⏰ 요청 시각
${new Date(request.createdAt).toLocaleString('ko-KR')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

본사 관리자 화면에서 승인/거절 처리를 진행해주세요.
👉 https://ctt-crm.com/crm/admin/hq

감사합니다.
CTT CRM 시스템
    `.trim(),
    metadata: {
      requestId: request.id,
      targetAdminId: request.targetAdminId,
      requestedById: request.requestedById,
      timestamp: request.createdAt,
    },
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 이메일 발송 시뮬레이션');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('수신자:', payload.to);
  console.log('제목:', payload.subject);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(payload.body);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('메타데이터:', JSON.stringify(payload.metadata, null, 2));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // TODO: 실제 이메일 발송 구현
  // Supabase Edge Function 또는 별도 API 호출
  // await fetch('/api/send-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
}

export async function sendApprovalNotificationEmail(
  request: DeleteRequest,
  targetAdmin: AdminUser,
  approved: boolean
): Promise<void> {
  const status = approved ? '승인' : '거절';
  const payload: EmailPayload = {
    to: request.requestedById, // 요청자에게 알림
    subject: `[CTT CRM] 삭제 요청 ${status} 알림`,
    body: `
안녕하세요,

귀하의 삭제 요청이 ${status}되었습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 요청 정보
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 대상: ${targetAdmin.name}
📝 사유: ${request.reason || '(사유 없음)'}
✅ 처리 결과: ${status}
⏰ 처리 시각: ${new Date().toLocaleString('ko-KR')}

${request.log ? `\n💬 처리 메모:\n${request.log}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

감사합니다.
CTT CRM 시스템
    `.trim(),
    metadata: {
      requestId: request.id,
      approved,
      processedAt: new Date().toISOString(),
    },
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 ${status} 알림 이메일 발송 시뮬레이션`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('수신자:', payload.to);
  console.log('제목:', payload.subject);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(payload.body);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}
