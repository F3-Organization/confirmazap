import { useTranslation } from 'react-i18next';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  MessageCircle, 
  Clock, 
  MoreVertical,
  CalendarDays,
  User,
  Phone
} from 'lucide-react';
import { PageLayout } from '../shared/ui/PageLayout';
import { Card } from '../shared/ui/Card';
import { Button } from '../shared/ui/Button';

export const DashboardPage = () => {
  const { t } = useTranslation();

  const stats = [
    { label: t('dashboard.stats.confirmations'), value: '1,284', icon: CheckCircle2, change: '+12.5%', color: 'text-green-400' },
    { label: t('dashboard.stats.deliveryRate'), value: '98.2%', icon: ArrowUpRight, change: '+0.5%', color: 'text-primary' },
    { label: t('dashboard.stats.replies'), value: '412', icon: MessageCircle, change: '+8.2%', color: 'text-secondary' },
  ];

  const appointments = [
    { name: 'Alexander Low', phone: '+1 (555) 012-3456', date: 'Oct 24, 2023', time: '09:30 AM', status: t('common.confirmed') },
    { name: 'Sarah Miller', phone: '+1 (555) 987-6543', date: 'Oct 24, 2023', time: '11:15 AM', status: t('common.pending') },
    { name: 'David Wright', phone: '+1 (555) 234-5678', date: 'Oct 25, 2023', time: '02:00 PM', status: t('common.confirmed') },
    { name: 'Emma Wilson', phone: '+1 (555) 345-6789', date: 'Oct 25, 2023', time: '04:30 PM', status: t('common.cancelled') },
  ];

  return (
    <PageLayout 
      title={t('dashboard.title')} 
      subtitle={t('dashboard.subtitle')}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <Card key={i} variant="glass" className="p-8 group hover:scale-[1.02] transition-all cursor-default">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-surface-low border border-outline-variant/50 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                <stat.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full bg-surface-low border border-outline-variant/30 ${stat.color}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</h3>
            <p className="text-4xl font-extrabold tracking-tighter">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <Card variant="base" className="lg:col-span-2 overflow-hidden bg-surface-dim/30">
          <div className="p-8 border-b border-outline-variant/30 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">{t('dashboard.recentAppointments')}</h2>
            </div>
            <Button variant="ghost" size="sm" className="hidden sm:flex group">
              {t('common.viewAll')}
              <ArrowUpRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-high/50 border-b border-outline-variant/20">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('dashboard.table.patient')}</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('dashboard.table.schedule')}</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('dashboard.table.status')}</th>
                  <th className="px-8 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {appointments.map((apt, i) => (
                  <tr key={i} className="group hover:bg-surface-high/30 transition-all cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-low flex items-center justify-center border border-outline-variant/50">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm group-hover:text-primary transition-colors">{apt.name}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 scale-90 translate-x-[-5%]">
                            <Phone className="w-3 h-3" />
                            {apt.phone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{apt.date}</span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3" />
                          {apt.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border
                        ${apt.status === t('common.confirmed') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 
                          apt.status === t('common.pending') ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 
                          'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${apt.status === t('common.confirmed') ? 'bg-green-400' : apt.status === t('common.pending') ? 'bg-yellow-500' : 'bg-red-400'}`} />
                        {apt.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 rounded-lg hover:bg-surface-high transition-colors text-muted-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions / Integration */}
        <div className="space-y-6">
          <Card variant="accent" className="p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary-dim flex items-center justify-center mb-6 shadow-xl shadow-primary-dim/40">
                <CalendarDays className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-3">{t('dashboard.syncCalendar.title')}</h3>
              <p className="text-sm text-foreground/80 leading-relaxed mb-8">
                {t('dashboard.syncCalendar.description')}
              </p>
              <Button className="w-full text-xs font-bold tracking-widest uppercase py-3 group-hover:scale-[1.02] transition-transform">
                {t('dashboard.syncCalendar.button')}
              </Button>
            </div>
          </Card>

          <Card variant="base" className="p-8 bg-surface-low border-dashed border-2">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight mb-1">{t('dashboard.newConnection.title')}</h4>
                <p className="text-xs text-muted-foreground">{t('dashboard.newConnection.subtitle')}</p>
              </div>
              <Button variant="ghost" size="sm" className="w-full font-bold uppercase text-[10px] tracking-widest border border-outline-variant/30">
                {t('dashboard.newConnection.button')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};
