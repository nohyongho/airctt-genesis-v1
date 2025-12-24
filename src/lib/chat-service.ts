
import { ChatMessage } from './consumer-types';

export const chatService = {
  sendMessage: async (message: string): Promise<ChatMessage> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = [
          '네, 도움을 드리겠습니다! 어떤 것이 궁금하신가요?',
          '쿠폰톡톡 서비스에 대해 궁금하신 점이 있으시면 언제든 물어보세요.',
          '근처 매장을 찾으시나요? 매장 탭에서 확인하실 수 있습니다.',
          'AR 피팅 기능을 사용하시면 가상으로 제품을 입어볼 수 있습니다.',
          '포인트와 쿠폰은 지갑 메뉴에서 확인하실 수 있습니다.',
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const assistantMessage: ChatMessage = {
          id: 'msg_' + Date.now(),
          role: 'assistant',
          content: randomResponse,
          timestamp: new Date().toISOString(),
        };

        resolve(assistantMessage);
      }, 1000);
    });
  },
};
