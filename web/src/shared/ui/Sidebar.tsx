import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  Calendar, 
  Settings, 
  LogOut, 
  MessageSquare, 
  CreditCard,
  Zap,
  Globe
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const navItems = [
    { icon: BarChart3, label: t('common.dashboard'), href: '/dashboard' },
    { icon: Calendar, label: t('common.appointments'), href: '/appointments' },
    { icon: MessageSquare, label: t('common.whatsapp'), href: '/whatsapp' },
    { icon: CreditCard, label: t('common.subscription'), href: '/subscription' },
    { icon: Settings, label: t('common.settings'), href: '/settings' },
  ];

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(nextLang);
  };

  return (
    <aside className="w-64 h-screen bg-surface-low border-r border-outline-variant flex flex-col p-6 sticky top-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-pulse-gradient flex items-center justify-center shadow-lg shadow-primary-dim/20">
          <Zap className="w-5 h-5 text-primary-foreground fill-current" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">ConfirmaZap</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group relative',
                isActive 
                  ? 'bg-surface-high text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-surface-high/50 hover:text-foreground'
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-5 bg-primary rounded-full shadow-[0_0_8px_rgba(190,157,255,0.6)]" />
              )}
              <item.icon className={cn('w-4 h-4', isActive ? 'text-primary' : 'group-hover:text-foreground')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-6">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-surface-high hover:text-primary transition-all group"
        >
          <Globe className="w-4 h-4" />
          {i18n.language === 'pt' ? 'English' : 'Português'}
        </button>

        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('common.storageUsage')}</span>
            <span className="text-xs font-semibold">65%</span>
          </div>
          <div className="h-1.5 w-full bg-surface-low rounded-full overflow-hidden">
            <div className="h-full bg-pulse-gradient rounded-full" style={{ width: '65%' }} />
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
            6.5GB {t('common.used')} 10GB
          </p>
        </div>

        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all group">
          <LogOut className="w-4 h-4" />
          {t('common.signOut')}
        </button>
      </div>
    </aside>
  );
};
