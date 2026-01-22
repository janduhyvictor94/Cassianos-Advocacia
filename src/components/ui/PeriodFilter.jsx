import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PeriodFilter({ value, onChange, className }) {
  const [filterType, setFilterType] = React.useState(value?.type || 'current_month');
  const [customMonth, setCustomMonth] = React.useState(format(new Date(), 'yyyy-MM'));
  const [currentPeriod, setCurrentPeriod] = React.useState(value);
  
  React.useEffect(() => {
    if (value) {
      setCurrentPeriod(value);
      if (value.type) {
        setFilterType(value.type);
      }
    }
  }, [value]);

  const handleFilterChange = (type) => {
    setFilterType(type);
    
    const now = new Date();
    let start, end;
    
    switch(type) {
      case 'current_month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case 'last_3_months':
        start = startOfMonth(subMonths(now, 2));
        end = endOfMonth(now);
        break;
      case 'last_6_months':
        start = startOfMonth(subMonths(now, 5));
        end = endOfMonth(now);
        break;
      case 'current_year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case 'all':
        const allPeriod = { start: null, end: null, type };
        setCurrentPeriod(allPeriod);
        onChange(allPeriod);
        return;
      case 'custom':
        // Will be handled by custom month input
        return;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }
    
    const newPeriod = { 
      start: format(start, 'yyyy-MM-dd'), 
      end: format(end, 'yyyy-MM-dd'),
      type 
    };
    setCurrentPeriod(newPeriod);
    onChange(newPeriod);
  };

  const handleNavigatePeriod = (direction) => {
    const currentDate = currentPeriod?.start ? new Date(currentPeriod.start + 'T12:00:00') : new Date();
    const newDate = direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
    const start = startOfMonth(newDate);
    const end = endOfMonth(newDate);
    const newPeriod = { 
      start: format(start, 'yyyy-MM-dd'), 
      end: format(end, 'yyyy-MM-dd'),
      type: filterType 
    };
    setCurrentPeriod(newPeriod);
    onChange(newPeriod);
  };

  const handleCustomMonthChange = (monthStr) => {
    setCustomMonth(monthStr);
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const newPeriod = { 
      start: format(start, 'yyyy-MM-dd'), 
      end: format(end, 'yyyy-MM-dd'),
      type: 'custom',
      monthStr 
    };
    setCurrentPeriod(newPeriod);
    onChange(newPeriod);
  };

  const handleNavigate = (direction) => {
    const [year, month] = customMonth.split('-');
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const newDate = direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
    
    if (newDate.getFullYear() > 2032) return;
    
    const newMonthStr = format(newDate, 'yyyy-MM');
    setCustomMonth(newMonthStr);
    handleCustomMonthChange(newMonthStr);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Select value={filterType} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-48 bg-slate-50 border-slate-200 h-10">
          <Calendar className="w-4 h-4 mr-2 text-slate-500" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white border-slate-200">
          <SelectItem value="current_month">Mês Atual</SelectItem>
          <SelectItem value="last_month">Mês Anterior</SelectItem>
          <SelectItem value="last_3_months">Últimos 3 Meses</SelectItem>
          <SelectItem value="last_6_months">Últimos 6 Meses</SelectItem>
          <SelectItem value="current_year">Ano Atual</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
          <SelectItem value="all">Todos os Períodos</SelectItem>
        </SelectContent>
      </Select>

      {(filterType === 'current_month' || filterType === 'last_month') && currentPeriod?.start && (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleNavigatePeriod('prev')}
            className="h-10 w-10 bg-slate-50 border-slate-200 hover:bg-slate-100"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </Button>
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-10 flex items-center min-w-[140px] justify-center">
            <span className="text-sm font-medium text-slate-700 capitalize">
              {format(new Date(currentPeriod.start), 'MMMM yyyy', { locale: ptBR })}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleNavigatePeriod('next')}
            className="h-10 w-10 bg-slate-50 border-slate-200 hover:bg-slate-100"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      )}
      
      {filterType === 'custom' && (
        <div className="flex gap-1 items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleNavigate('prev')}
            className="h-10 w-10 bg-slate-50 border-slate-200 hover:bg-slate-100"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </Button>
          <Input
            type="month"
            value={customMonth}
            onChange={(e) => handleCustomMonthChange(e.target.value)}
            max="2032-12"
            className="w-40 bg-slate-50 border-slate-200 h-10"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleNavigate('next')}
            disabled={customMonth >= '2032-12'}
            className="h-10 w-10 bg-slate-50 border-slate-200 hover:bg-slate-100"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      )}
    </div>
  );
}