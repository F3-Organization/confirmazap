import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, CalendarPlus, Loader2 } from 'lucide-react';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { calendarService, type CreateAppointmentDto, type Appointment } from '../calendar.service';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Appointment | null;
}

export const NewAppointmentModal = ({ isOpen, onClose, initialData }: NewAppointmentModalProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!initialData;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateAppointmentDto>();

  // Set default values when modal opens or initialData changes
  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        title: initialData.title,
        clientName: initialData.clientName,
        clientPhone: initialData.clientPhone,
        startAt: new Date(initialData.startAt).toISOString().slice(0, 16),
        endAt: new Date(initialData.endAt).toISOString().slice(0, 16),
      });
    } else if (!isOpen) {
      reset({ title: '', clientName: '', clientPhone: '', startAt: '', endAt: '' });
    }
  }, [initialData, isOpen, reset]);

  const mutationCreate = useMutation({
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

  const mutationUpdate = useMutation({
    mutationFn: (data: CreateAppointmentDto) => calendarService.updateAppointment(initialData!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || t('dashboard.newAppointment.error'));
    }
  });

  const isPending = mutationCreate.isPending || mutationUpdate.isPending;

  const onSubmit = (data: CreateAppointmentDto) => {
    setError(null);
    const formattedData = {
      ...data,
      startAt: new Date(data.startAt).toISOString(),
      endAt: new Date(data.endAt).toISOString(),
      clientPhone: data.clientPhone.replace(/\D/g, '') // Remove non-digits to keep only DDD+Number
    };
    if (isEditMode) {
      mutationUpdate.mutate(formattedData);
    } else {
      mutationCreate.mutate(formattedData);
    }
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
              {isEditMode ? t('dashboard.newAppointment.editTitle') : t('dashboard.newAppointment.title')}
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
              {...register('title', { required: 'Obrigatório' })}
              label={t('dashboard.newAppointment.serviceName')}
              placeholder="Ex: Consulta Odontológica"
              error={errors.title?.message as string}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('clientName', { required: 'Obrigatório' })}
                label={t('dashboard.newAppointment.clientName')}
                placeholder="Ex: João da Silva"
                error={errors.clientName?.message as string}
                required
              />
              <Input
                {...register('clientPhone', { 
                  required: true, 
                  pattern: {
                    value: /^\d{10,15}$/,
                    message: "Formato inválido. Use Apenas Números (DDD + Número, ex: 11999999999)"
                  }
                })}
                label={t('dashboard.newAppointment.clientPhone')}
                placeholder="11999999999"
                error={errors.clientPhone?.message as string}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('startAt', { required: 'Obrigatório' })}
                label={t('dashboard.newAppointment.startAt')}
                type="datetime-local"
                error={errors.startAt?.message as string}
                required
              />
              <Input
                {...register('endAt', { required: 'Obrigatório' })}
                label={t('dashboard.newAppointment.endAt')}
                type="datetime-local"
                error={errors.endAt?.message as string}
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
            disabled={isPending}
          >
            {t('dashboard.newAppointment.cancel')}
          </Button>
          <Button 
            type="submit" 
            form="new-appointment-form"
            disabled={isPending}
            className="min-w-[140px]"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {isPending 
              ? t('dashboard.newAppointment.creating') 
              : t('dashboard.newAppointment.submit')}
          </Button>
        </div>
      </div>
    </div>
  );
};
