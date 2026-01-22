import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp, className }) {
  return (
    <div className={cn(
      "bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all hover:border-amber-400/30 hover:-translate-y-1 backdrop-blur-sm relative overflow-hidden group",
      className
    )}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2.5">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">{title}</p>
          <p className="text-4xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm",
              trendUp ? "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100" : "text-red-700 bg-red-50 ring-1 ring-red-100"
            )}>
              {trendUp ? '↑' : '↓'} {trend}
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-lg ring-2 ring-white/50 group-hover:scale-110 transition-transform">
            <Icon className="w-7 h-7 text-amber-400" />
          </div>
        )}
      </div>
    </div>
  );
}