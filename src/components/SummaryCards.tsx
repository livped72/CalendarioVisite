import React from 'react';
import { Calendar, Users, Clock } from 'lucide-react';
import { KPIStats } from '../types';

interface SummaryCardsProps {
  stats: KPIStats;
  onPlanNextWeek?: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats, onPlanNextWeek }) => {
  return (
    <div className="space-y-3 pt-2">
      <h3 className="text-sm font-bold text-slate-900">Informazioni periodo corrente</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Settimane programmate */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-4 hover:border-blue-200 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Settimane programmate</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-900 leading-tight">
                {stats.settimaneProgrammate}
              </span>
              <span className="text-xs text-slate-400 font-medium">su {stats.totaleSettimane}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Congregazioni visitate */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-4 hover:border-emerald-200 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Congregazioni visitate</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-900 leading-tight">
                {stats.congregazioniVisitate}
              </span>
              <span className="text-xs text-slate-400 font-medium">su {stats.totaleCongregazioni}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Media settimane tra le visite */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-4 hover:border-amber-200 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Media settimane tra le visite</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-900 leading-tight">
                {stats.mediaSettimane.toFixed(1).replace('.', ',')}
              </span>
              <span className="text-xs text-slate-500 font-medium">settimane</span>
            </div>
          </div>
        </div>

        {/* Card 4: Prossima settimana */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-center hover:border-purple-200 transition-colors">
          <div className="text-xs text-slate-500 font-medium">Prossima settimana</div>
          <div className="text-sm font-bold text-slate-900 mt-1 truncate">
            {stats.prossimaSettimana.periodo}
          </div>
          <button
            onClick={onPlanNextWeek}
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors hover:underline text-left mt-0.5 cursor-pointer"
          >
            {stats.prossimaSettimana.stato}
          </button>
        </div>
      </div>
    </div>
  );
};
