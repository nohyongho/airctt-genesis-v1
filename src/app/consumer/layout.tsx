
import { I18nProvider } from '@/contexts/I18nContext';
import ConsumerHeader from '@/components/consumer/ConsumerHeader';
import BottomTabNav from '@/components/consumer/BottomTabNav';
import AIChatBot from '@/components/consumer/AIChatBot';

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col safe-area-top">
        <ConsumerHeader />
        <main className="flex-1 pb-20 scroll-smooth">
          {children}
        </main>
        <BottomTabNav />
        <AIChatBot />
      </div>
    </I18nProvider>
  );
}
