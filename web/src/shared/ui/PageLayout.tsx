import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';
import { subscriptionService } from '../../features/subscription/subscription.service';
import { UsageBanner } from './UsageBanner';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export const PageLayout = ({ children, title, subtitle }: PageLayoutProps) => {
  const { data: status } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: subscriptionService.getStatus,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {status && <UsageBanner plan={status.plan} count={status.messageCount} />}
        <main className="flex-1 overflow-y-auto no-scrollbar relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px] -z-10 pointer-events-none" />
          
          <header className="p-10 pb-0">
            {title && (
              <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-4 text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </header>

          <div className="p-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
