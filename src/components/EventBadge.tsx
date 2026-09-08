import React from 'react';
import { Home, Calendar, Plane, BookOpen, BookMarked, Users, Star } from 'lucide-react';
import { TipoEvento } from '../types';

interface EventBadgeProps {
  tipo: TipoEvento;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  customLabel?: string;
}

export const EventBadge: React.FC<EventBadgeProps> = ({
  tipo,
  size = 'md',
  showIcon = true,
  customLabel,
}) => {
  const iconClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4.5 h-4.5' : 'w-4 h-4';

  const getBadgeConfig = () => {
    switch (tipo) {
      case 'congregazione':
        return {
          defaultLabel: 'Congregazione',
          icon: <Home className={iconClass} />,
          bg: 'bg-[#7C8B82]/15',
          border: 'border-[#7C8B82]/30',
          text: 'text-[#36453D]',
        };
      case 'settimana_libera':
        return {
          defaultLabel: 'Settimana libera',
          icon: <Calendar className={iconClass} />,
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
        };
      case 'assenza':
        return {
          defaultLabel: 'Assenza',
          icon: <Plane className={iconClass} />,
          bg: 'bg-sky-50',
          border: 'border-sky-200',
          text: 'text-sky-800',
        };
      case 'scuola_pionieri':
        return {
          defaultLabel: 'Scuola pionieri',
          icon: <BookOpen className={iconClass} />,
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-800',
        };
      case 'settimana_pioniere':
        return {
          defaultLabel: 'Settimana pioniere',
          icon: <BookMarked className={iconClass} />,
          bg: 'bg-violet-50',
          border: 'border-violet-200',
          text: 'text-violet-800',
        };
      case 'assemblea_circoscrizione':
        return {
          defaultLabel: 'Assemblea di circoscrizione',
          icon: <Users className={iconClass} />,
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
        };
      case 'congresso':
        return {
          defaultLabel: 'Congresso',
          icon: <Users className={iconClass} />,
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-800',
        };
      case 'evento_personalizzato':
        return {
          defaultLabel: 'Evento personalizzato',
          icon: <Star className={iconClass} />,
          bg: 'bg-stone-100',
          border: 'border-stone-300',
          text: 'text-stone-800',
        };
      default:
        return {
          defaultLabel: tipo,
          icon: null,
          bg: 'bg-stone-50',
          border: 'border-stone-200',
          text: 'text-stone-700',
        };
    }
  };

  const config = getBadgeConfig();
  const label = customLabel || config.defaultLabel;

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-1 text-xs gap-1.5'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm gap-2'
      : 'px-3 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg border ${config.bg} ${config.border} ${config.text} ${sizeClasses} whitespace-nowrap shadow-2xs`}
    >
      {showIcon && config.icon}
      <span>{label}</span>
    </span>
  );
};
