import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Home, Calendar, Plane, BookOpen, BookMarked, Users, Star } from 'lucide-react';
export const EventBadge = ({ tipo, size = 'md', showIcon = true, customLabel, }) => {
    const iconClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4.5 h-4.5' : 'w-4 h-4';
    const getBadgeConfig = () => {
        switch (tipo) {
            case 'congregazione':
                return {
                    defaultLabel: 'CONGREGAZIONE',
                    icon: _jsx(Home, { className: iconClass }),
                    bg: 'bg-blue-950/70',
                    border: 'border-blue-700/60',
                    text: 'text-blue-200',
                };
            case 'settimana_libera':
                return {
                    defaultLabel: 'SETTIMANA LIBERA',
                    icon: _jsx(Calendar, { className: iconClass }),
                    bg: 'bg-emerald-950/70',
                    border: 'border-emerald-700/60',
                    text: 'text-emerald-300',
                };
            case 'assenza':
                return {
                    defaultLabel: 'ASSENZA',
                    icon: _jsx(Plane, { className: iconClass }),
                    bg: 'bg-sky-950/70',
                    border: 'border-sky-700/60',
                    text: 'text-sky-300',
                };
            case 'scuola_pionieri':
                return {
                    defaultLabel: 'SCUOLA PIONIERI',
                    icon: _jsx(BookOpen, { className: iconClass }),
                    bg: 'bg-purple-950/70',
                    border: 'border-purple-700/60',
                    text: 'text-purple-300',
                };
            case 'settimana_pioniere':
                return {
                    defaultLabel: 'SETTIMANA PIONIERE',
                    icon: _jsx(BookMarked, { className: iconClass }),
                    bg: 'bg-indigo-950/70',
                    border: 'border-indigo-700/60',
                    text: 'text-indigo-300',
                };
            case 'assemblea_circoscrizione':
                return {
                    defaultLabel: 'ASSEMBLEA CIRCOSCRIZIONE',
                    icon: _jsx(Users, { className: iconClass }),
                    bg: 'bg-amber-950/70',
                    border: 'border-amber-700/60',
                    text: 'text-amber-300',
                };
            case 'congresso':
                return {
                    defaultLabel: 'CONGRESSO',
                    icon: _jsx(Users, { className: iconClass }),
                    bg: 'bg-rose-950/70',
                    border: 'border-rose-700/60',
                    text: 'text-rose-300',
                };
            case 'evento_personalizzato':
                return {
                    defaultLabel: 'EVENTO PERSONALIZZATO',
                    icon: _jsx(Star, { className: iconClass }),
                    bg: 'bg-slate-800/80',
                    border: 'border-slate-600',
                    text: 'text-slate-200',
                };
            default:
                return {
                    defaultLabel: tipo,
                    icon: null,
                    bg: 'bg-slate-900',
                    border: 'border-slate-700',
                    text: 'text-slate-300',
                };
        }
    };
    const config = getBadgeConfig();
    const label = customLabel || config.defaultLabel;
    const sizeClasses = size === 'sm'
        ? 'px-2.5 py-1 text-xs gap-1.5'
        : size === 'lg'
            ? 'px-3.5 py-1.5 text-sm gap-2'
            : 'px-3 py-1 text-xs gap-1.5';
    return (_jsxs("span", { className: `inline-flex items-center font-bold rounded-lg border ${config.bg} ${config.border} ${config.text} ${sizeClasses} whitespace-nowrap shadow-2xs`, children: [showIcon && config.icon, _jsx("span", { children: label })] }));
};
