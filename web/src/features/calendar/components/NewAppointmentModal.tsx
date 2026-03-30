import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, CalendarPlus, Loader2 } from 'lucide-react';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { calendarService, type CreateAppointmentDto } from '../calendar.service';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewAppointmentModal = ({ isOpen, onClose }: NewAppointmentModalProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, reset } = useForm<CreateAppointmentDto>();

  const mutation = useMutation({
    mutationFn: calendarService.createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || t('dashboard.newAppointment.error'));
    }
  });

  const onSubmit = (data: CreateAppointmentDto) => {
    setError(null);
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface-high border border-outline-variant rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <CalendarPlus className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {t('dashboard.newAppointment.title')}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-high text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form id="new-appointment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('title', { required: true })}
              label={t('dashboard.newAppointment.serviceName')}
              placeholder="Ex: Consulta Odontológica"
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('clientName', { required: true })}
                label={t('dashboard.newAppointment.clientName')}
                placeholder="Ex: João da Silva"
                required
              />
              <Input
                {...register('clientPhone', { required: true })}
                label={t('dashboard.newAppointment.clientPhone')}
                placeholder="+55 11 99999-9999"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('startAt', { required: true })}
                label={t('dashboard.newAppointment.startAt')}
                type="datetime-local"
                required
              />
              <Input
                {...register('endAt', { required: true })}
                label={t('dashboard.newAppointment.endAt')}
                type="datetime-local"
                required
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-outline-variant/30 flex items-center justify-end gap-3 bg-surface-low/50">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            disabled={mutation.isPending}
          >
            {t('dashboard.newAppointment.cancel')}
          </Button>
          <Button 
            type="submit" 
            form="new-appointment-form"
            disabled={mutation.isPending}
            className="min-w-[140px]"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {mutation.isPending 
              ? t('dashboard.newAppointment.creating') 
              : t('dashboard.newAppointment.submit')}
          </Button>
        </div>
      </div>
    </div>
  );
};
