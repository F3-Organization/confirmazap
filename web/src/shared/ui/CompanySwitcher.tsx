import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, ChevronDown, Check, Plus, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../features/auth/auth.store';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CompanySwitcher = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const companies = useAuthStore((state) => state.companies);
  const selectedCompany = useAuthStore((state) => state.selectedCompany);
  const selectCompany = useAuthStore((state) => state.selectCompany);

  const [isOpen, setIsOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCompany = async (id: string) => {
    if (id === selectedCompany?.id) {
      setIsOpen(false);
      return;
    }
    setLoadingId(id);
    try {
      await selectCompany(id);
      setIsOpen(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('[CompanySwitcher] Failed to switch company', err);
    } finally {
      setLoadingId(null);
    }
  };

  if (!selectedCompany) return null;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group',
          'bg-surface-high/50 border border-outline-variant/30 hover:border-primary/30 hover:bg-surface-high'
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-bold truncate">{selectedCompany.name}</p>
          {selectedCompany.subscription && (
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {selectedCompany.subscription.plan}
            </p>
          )}
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 rounded-xl border border-outline-variant/50 bg-surface-dim shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-1 space-y-0.5">
            {companies.map((company) => {
              const isSelected = company.id === selectedCompany.id;
              return (
                <button
                  key={company.id}
                  onClick={() => handleSelectCompany(company.id)}
                  disabled={loadingId !== null}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-surface-high hover:text-foreground'
                  )}
                >
                  <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                    {loadingId === company.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isSelected ? (
                      <Check className="w-4 h-4" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{company.name}</p>
                    {company.subscription && (
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                        {company.subscription.plan}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-outline-variant/30 p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/create-company');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-surface-high hover:text-foreground transition-all"
            >
              <Plus className="w-4 h-4 shrink-0" />
              {t('company.switcher.newCompany', 'Nova Empresa')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
