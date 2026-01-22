import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, isToday, isTomorrow, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import StatCard from '@/components/ui/StatCard';
import ProcessReviewAlert from '@/components/dashboard/ProcessReviewAlert';
import ProcessModal from '@/components/modals/ProcessModal';
import { 
  Users, 
  Scale, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  Clock,
  ChevronRight,
  Cake,
  Gavel,
  Bell,
  CheckCircle2,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const statusLabels = {
  em_andamento: 'Em Andamento',
  aguardando_julgamento: 'Aguardando Julgamento',
  recurso: 'Recurso',
  arquivado: 'Arquivado',
  ganho: 'Ganho',
  perdido: 'Perdido',
  acordo: 'Acordo'
};

const typeLabels = {
  audiencia: 'Audiência',
  reuniao: 'Reunião',
  prazo: 'Prazo',
  consulta: 'Consulta',
  pericia: 'Perícia',
  diligencia: 'Diligência',
  outros: 'Outros'
};

export default function Dashboard() {
  const [selectedProcess, setSelectedProcess] = React.useState(null);
  const [processModalOpen, setProcessModalOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: processes = [], isLoading: loadingProcesses } = useQuery({
    queryKey: ['processes'],
    queryFn: () => base44.entities.Process.list()
  });

  const { data: appointments = [], isLoading: loadingAppointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list()
  });

  const { data: financial = [], isLoading: loadingFinancial } = useQuery({
    queryKey: ['financial'],
    queryFn: () => base44.entities.Financial.list()
  });

  const { data: notices = [], isLoading: loadingNotices } = useQuery({
    queryKey: ['notices'],
    queryFn: () => base44.entities.Notice.list()
  });

  const isLoading = loadingClients || loadingProcesses || loadingAppointments || loadingFinancial || loadingNotices;

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });

  const updateProcessMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Process.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      setProcessModalOpen(false);
      setSelectedProcess(null);
    }
  });

  const handleMarkAppointmentAsDone = (apt) => {
    updateAppointmentMutation.mutate({
      id: apt.id,
      data: { ...apt, status: 'realizado' }
    });
  };

  const handleCancelAppointment = (apt) => {
    updateAppointmentMutation.mutate({
      id: apt.id,
      data: { ...apt, status: 'cancelado' }
    });
  };

  const handleOpenProcessModal = (process) => {
    setSelectedProcess(process);
    setProcessModalOpen(true);
  };

  const handleSaveProcess = (data) => {
    if (selectedProcess) {
      updateProcessMutation.mutate({ id: selectedProcess.id, data });
    }
  };

  // Calculate stats
  const activeClients = clients.filter(c => c.status === 'active').length;
  const activeProcesses = processes.filter(p => p.status === 'em_andamento' || p.status === 'recurso').length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyIncome = financial
    .filter(f => {
      const date = f.date ? new Date(f.date) : null;
      return f.type === 'entrada' && f.status === 'pago' && 
             date?.getMonth() === currentMonth && date?.getFullYear() === currentYear;
    })
    .reduce((sum, f) => sum + (f.value || 0), 0);

  const monthlyExpenses = financial
    .filter(f => {
      const date = f.date ? new Date(f.date) : null;
      return f.type === 'despesa' && f.status === 'pago' && 
             date?.getMonth() === currentMonth && date?.getFullYear() === currentYear;
    })
    .reduce((sum, f) => sum + (f.value || 0), 0);

  // Upcoming appointments
  const today = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments
    .filter(a => a.date >= today && a.status !== 'cancelado')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  // Upcoming birthdays
  const upcomingBirthdays = clients
    .filter(c => c.birth_date && c.status === 'active')
    .map(c => {
      const birthDate = parseISO(c.birth_date);
      const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
      if (thisYearBirthday < new Date()) {
        thisYearBirthday.setFullYear(currentYear + 1);
      }
      return { ...c, nextBirthday: thisYearBirthday };
    })
    .sort((a, b) => a.nextBirthday - b.nextBirthday)
    .slice(0, 5);

  // Upcoming notices (next 15 days)
  const fifteenDaysFromNow = new Date();
  fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);
  const upcomingNotices = notices
    .filter(n => {
      if (!n.date || n.status === 'concluido') return false;
      const noticeDate = parseISO(n.date);
      return noticeDate >= new Date() && noticeDate <= fifteenDaysFromNow;
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative mb-2">
        <div className="absolute -top-8 -left-8 w-96 h-96 bg-gradient-to-br from-amber-400/10 via-amber-300/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-8 -right-8 w-80 h-80 bg-gradient-to-br from-blue-400/10 via-blue-300/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="relative">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent tracking-tight">Dashboard</h1>
          <p className="text-slate-600 mt-3 text-lg font-medium">Bem-vindo ao <span className="font-bold text-amber-600">CASSIANO'S ADVOCACIA</span></p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {[1,2,3,4].map(i => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Clientes Ativos"
              value={activeClients}
              icon={Users}
            />
            <StatCard
              title="Processos Ativos"
              value={activeProcesses}
              icon={Scale}
            />
            <StatCard
              title="Receita do Mês"
              value={`R$ ${monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              icon={TrendingUp}
              trend={monthlyIncome > monthlyExpenses ? '+' + ((monthlyIncome - monthlyExpenses) / Math.max(monthlyExpenses, 1) * 100).toFixed(0) + '%' : undefined}
              trendUp={monthlyIncome > monthlyExpenses}
            />
            <StatCard
              title="Despesas do Mês"
              value={`R$ ${monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
            />
          </>
        )}
      </div>

      {/* Notices Alert */}
      {upcomingNotices.length > 0 && (
        <Card className="relative overflow-hidden shadow-2xl border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 via-orange-50/80 to-white backdrop-blur-sm hover:shadow-3xl transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent pointer-events-none" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-900">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                <Bell className="w-6 h-6 text-white relative z-10 drop-shadow" />
              </div>
              Avisos nos Próximos 15 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingNotices.map(notice => {
                const noticeDate = parseISO(notice.date);
                const daysUntil = differenceInDays(noticeDate, new Date());
                const isUrgent = daysUntil <= 3;

                return (
                  <Link
                    key={notice.id}
                    to={createPageUrl('Notices')}
                    className={`flex items-center gap-3 p-3 rounded-lg bg-white border hover:shadow-md transition-all cursor-pointer ${
                      isUrgent ? 'border-red-200 hover:border-red-300' : 'border-orange-200 hover:border-orange-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white text-xs ${
                      isUrgent ? 'bg-red-500' : 'bg-orange-500'
                    }`}>
                      <span className="text-xs font-bold">{format(noticeDate, 'd')}</span>
                      <span className="text-[10px] uppercase">{format(noticeDate, 'MMM', { locale: ptBR })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{notice.title}</p>
                      <p className="text-sm text-gray-600">
                        {daysUntil === 0 ? 'Hoje' : daysUntil === 1 ? 'Amanhã' : `Em ${daysUntil} dias`}
                      </p>
                    </div>
                    <Badge className={isUrgent ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
                      {notice.priority === 'urgente' ? 'Urgente' : notice.priority}
                    </Badge>
                  </Link>
                );
              })}
            </div>
            <Link 
              to={createPageUrl('Notices')}
              className="text-sm text-orange-700 hover:text-orange-900 flex items-center gap-1 mt-3 font-medium"
            >
              Ver todos os avisos <ChevronRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Process Review Alert */}
      <div className="grid grid-cols-1 gap-6">
        <ProcessReviewAlert processes={processes} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="relative overflow-hidden shadow-xl border border-slate-200/60 rounded-2xl bg-white backdrop-blur-sm hover:shadow-2xl transition-all group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 relative">
            <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-900">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                <Calendar className="w-6 h-6 text-white relative z-10" />
              </div>
              Próximos Compromissos
            </CardTitle>
            <Link 
              to={createPageUrl('Appointments')}
              className="text-sm text-gray-500 hover:text-[#1a1a1a] flex items-center gap-1"
            >
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum compromisso agendado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map(apt => {
                  const aptDate = parseISO(apt.date);
                  const isAptToday = isToday(aptDate);
                  const isAptTomorrow = isTomorrow(aptDate);
                  
                  return (
                    <div 
                      key={apt.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                    >
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white ${
                        isAptToday ? 'bg-red-500' : isAptTomorrow ? 'bg-orange-500' : 'bg-[#1a1a1a]'
                      }`}>
                        <span className="text-xs uppercase">{format(aptDate, 'MMM', { locale: ptBR })}</span>
                        <span className="text-lg font-bold">{format(aptDate, 'd')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1a1a1a] truncate">{apt.title}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {apt.time || 'Horário não definido'}
                          {apt.client_name && ` • ${apt.client_name}`}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {typeLabels[apt.type] || apt.type}
                      </Badge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleMarkAppointmentAsDone(apt)}
                          disabled={updateAppointmentMutation.isPending}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleCancelAppointment(apt)}
                          disabled={updateAppointmentMutation.isPending}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Birthdays */}
        <Card className="relative overflow-hidden shadow-xl border border-slate-200/60 rounded-2xl bg-white backdrop-blur-sm hover:shadow-2xl transition-all group">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-rose-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 relative">
            <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-900">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                <Cake className="w-6 h-6 text-white relative z-10" />
              </div>
              Aniversários Próximos
            </CardTitle>
            <Link 
              to={createPageUrl('Clients')}
              className="text-sm text-gray-500 hover:text-[#1a1a1a] flex items-center gap-1"
            >
              Ver clientes <ChevronRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingBirthdays.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Cake className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum aniversário registrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBirthdays.map(client => {
                  const daysUntil = differenceInDays(client.nextBirthday, new Date());
                  const isClientBirthdayToday = daysUntil === 0;
                  
                  return (
                    <div 
                      key={client.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isClientBirthdayToday ? 'bg-[#c9a962]' : 'bg-gray-200'
                      }`}>
                        <Cake className={`w-5 h-5 ${isClientBirthdayToday ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1a1a1a] truncate">{client.name}</p>
                        <p className="text-sm text-gray-500">
                          {format(client.nextBirthday, "d 'de' MMMM", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge className={isClientBirthdayToday ? 'bg-[#c9a962]' : 'bg-gray-200 text-gray-700'}>
                        {isClientBirthdayToday ? 'Hoje!' : `Em ${daysUntil} dias`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Processes */}
      <Card className="relative overflow-hidden shadow-xl border border-slate-200/60 rounded-2xl bg-white backdrop-blur-sm hover:shadow-2xl transition-all group">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 relative">
          <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-900">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/30">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent" />
              <Gavel className="w-6 h-6 text-amber-400 relative z-10" />
            </div>
            Processos Recentes
          </CardTitle>
          <Link 
            to={createPageUrl('Processes')}
            className="text-sm text-gray-500 hover:text-[#1a1a1a] flex items-center gap-1"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : processes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Scale className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum processo cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Número</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Área</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.slice(0, 5).map(process => (
                    <tr 
                      key={process.id} 
                      className="border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleOpenProcessModal(process)}
                    >
                      <td className="py-3 px-4 font-medium">{process.number}</td>
                      <td className="py-3 px-4 text-gray-600">{process.client_name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {process.area?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`
                          ${process.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' : ''}
                          ${process.status === 'ganho' ? 'bg-green-100 text-green-800' : ''}
                          ${process.status === 'perdido' ? 'bg-red-100 text-red-800' : ''}
                          ${process.status === 'acordo' ? 'bg-purple-100 text-purple-800' : ''}
                          ${process.status === 'arquivado' ? 'bg-gray-100 text-gray-800' : ''}
                          ${process.status === 'recurso' ? 'bg-orange-100 text-orange-800' : ''}
                          ${process.status === 'aguardando_julgamento' ? 'bg-yellow-100 text-yellow-800' : ''}
                        `}>
                          {statusLabels[process.status] || process.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ProcessModal
        open={processModalOpen}
        onClose={() => {
          setProcessModalOpen(false);
          setSelectedProcess(null);
        }}
        onSave={handleSaveProcess}
        process={selectedProcess}
        clients={clients}
        isLoading={updateProcessMutation.isPending}
      />
    </div>
  );
}