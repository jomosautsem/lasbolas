import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/motel/sidebar';
import { AppHeader } from '@/components/motel/header';
import { AIConsultant } from '@/components/motel/ai-consultant';

export function AppLayout({ children, onAddExpenseClick }: { children: ReactNode, onAddExpenseClick: () => void; }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppSidebar onAddExpenseClick={onAddExpenseClick} />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <AppHeader onAddExpenseClick={onAddExpenseClick} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
      <AIConsultant />
    </div>
  );
}
