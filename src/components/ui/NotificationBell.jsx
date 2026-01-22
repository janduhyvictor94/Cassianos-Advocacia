import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { parseISO, differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function NotificationBell() {
  const navigate = useNavigate();
  
  const { data: notices = [] } = useQuery({
    queryKey: ['notices'],
    queryFn: () => base44.entities.Notice.list('-date')
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-date')
  });

  const urgentNotices = notices.filter(n => {
    if (!n.date || n.status === 'concluido') return false;
    const daysUntil = differenceInDays(parseISO(n.date), new Date());
    return daysUntil >= 0 && daysUntil <= 3;
  }).slice(0, 3);

  const todayAppointments = appointments.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.date === today && a.status !== 'cancelado';
  }).slice(0, 3);

  const totalNotifications = urgentNotices.length + todayAppointments.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-white/5">
          <Bell className="w-5 h-5 text-slate-300" />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
              {totalNotifications}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white border-slate-200">
        <div className="p-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Notificações</h3>
        </div>
        
        {totalNotifications === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {urgentNotices.length > 0 && (
              <div className="p-2">
                <p className="text-xs font-semibold text-slate-500 px-2 mb-1">Avisos Urgentes</p>
                {urgentNotices.map(notice => (
                  <DropdownMenuItem
                    key={notice.id}
                    onClick={() => navigate(createPageUrl('Notices'))}
                    className="flex items-start gap-3 p-3 cursor-pointer"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{notice.title}</p>
                      <p className="text-xs text-slate-500">
                        {format(parseISO(notice.date), "d 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}

            {todayAppointments.length > 0 && (
              <div className="p-2">
                <p className="text-xs font-semibold text-slate-500 px-2 mb-1">Compromissos Hoje</p>
                {todayAppointments.map(apt => (
                  <DropdownMenuItem
                    key={apt.id}
                    onClick={() => navigate(createPageUrl('Appointments'))}
                    className="flex items-start gap-3 p-3 cursor-pointer"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{apt.title}</p>
                      <p className="text-xs text-slate-500">{apt.time || 'Horário não definido'}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}