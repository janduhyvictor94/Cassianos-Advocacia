import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PageHeader({ title, subtitle, action, actionLabel, actionIcon: ActionIcon = Plus }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-slate-600 mt-2 text-sm font-medium">{subtitle}</p>
        )}
      </div>
      {action && (
        <Button 
          onClick={action}
          className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-white gap-2 shadow-lg shadow-slate-900/30 hover:shadow-xl hover:shadow-slate-900/40 transition-all hover:-translate-y-0.5 px-6 py-5"
        >
          <ActionIcon className="w-5 h-5" />
          <span className="font-semibold">{actionLabel}</span>
        </Button>
      )}
    </div>
  );
}