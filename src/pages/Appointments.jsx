import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import AppointmentModal from '@/components/modals/AppointmentModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const typeLabels = {
  audiencia: 'Audiência',
  reuniao: 'Reunião',
  prazo: 'Prazo',
  consulta: 'Consulta',
  pericia: 'Perícia',
  diligencia: 'Diligência',
  outros: 'Outros'
};

const typeColors = {
  audiencia: 'bg-red-100 text-red-800',
  reuniao: 'bg-blue-100 text-blue-800',
  prazo: 'bg-orange-100 text-orange-800',
  consulta: 'bg-green-100 text-green-800',
  pericia: 'bg-purple-100 text-purple-800',
  diligencia: 'bg-cyan-100 text-cyan-800',
  outros: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
  remarcado: 'Remarcado'
};

export default function Appointments() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('list');
  const [selectedDate, setSelectedDate] = useState(null);

  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-date')
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: processes = [] } = useQuery({
    queryKey: ['processes'],
    queryFn: () => base44.entities.Process.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setModalOpen(false);
      setSelectedAppointment(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setModalOpen(false);
      setSelectedAppointment(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Appointment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
  });

  const handleSave = (data) => {
    if (selectedAppointment) {
      updateMutation.mutate({ id: selectedAppointment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const handleDelete = (appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDay = (date) => {
    return appointments.filter(a => a.date && isSameDay(parseISO(a.date), date));
  };

  const today = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments
    .filter(a => a.date >= today && a.status !== 'cancelado')
    .sort((a, b) => a.date.localeCompare(b.date));

  const filteredAppointments = selectedDate 
    ? appointments.filter(a => a.date === format(selectedDate, 'yyyy-MM-dd'))
    : upcomingAppointments;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        subtitle="Gerencie seus compromissos"
        action={() => {
          setSelectedAppointment(null);
          setModalOpen(true);
        }}
        actionLabel="Novo Compromisso"
      />

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
          </TabsList>
        </Tabs>

        {viewMode === 'calendar' && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="font-medium min-w-[150px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <Card className="lg:col-span-2 p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24" />
              ))}
              {daysInMonth.map(day => {
                const dayAppointments = getAppointmentsForDay(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isDayToday = isToday(day);
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`h-24 p-1 border rounded-lg text-left transition-colors
                      ${isSelected ? 'border-[#1a1a1a] bg-gray-50' : 'border-gray-100 hover:border-gray-200'}
                      ${isDayToday ? 'bg-[#c9a962]/10' : ''}
                    `}
                  >
                    <span className={`text-sm font-medium ${isDayToday ? 'text-[#c9a962]' : 'text-gray-700'}`}>
                      {format(day, 'd')}
                    </span>
                    <div className="mt-1 space-y-1 overflow-hidden">
                      {dayAppointments.slice(0, 2).map(apt => (
                        <div 
                          key={apt.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${typeColors[apt.type]}`}
                        >
                          {apt.time && `${apt.time} `}{apt.title}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayAppointments.length - 2} mais
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Appointments List */}
        <div className={viewMode === 'calendar' ? 'lg:col-span-1' : 'lg:col-span-3'}>
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">
                {selectedDate 
                  ? 'Nenhum compromisso nesta data'
                  : 'Nenhum compromisso agendado'
                }
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {selectedDate && (
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">
                    {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
                    Ver todos
                  </Button>
                </div>
              )}
              {filteredAppointments.map(apt => (
                <Card key={apt.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={typeColors[apt.type]}>
                          {typeLabels[apt.type]}
                        </Badge>
                        <Badge variant="outline">
                          {statusLabels[apt.status]}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-[#1a1a1a]">{apt.title}</h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(parseISO(apt.date), "d 'de' MMMM", { locale: ptBR })}
                        </div>
                        {apt.time && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {apt.time}
                          </div>
                        )}
                        {apt.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {apt.location}
                          </div>
                        )}
                        {apt.client_name && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {apt.client_name}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(apt)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(apt)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AppointmentModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSave={handleSave}
        appointment={selectedAppointment}
        clients={clients}
        processes={processes}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o compromisso "{appointmentToDelete?.title}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteMutation.mutate(appointmentToDelete?.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}