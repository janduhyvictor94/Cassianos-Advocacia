import React, { useState, useEffect } from "react";
import { Appointment, Client, Notice } from "@/api/entities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Trash2,
  Lock
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  parseISO 
} from "date-fns";
import { ptBR } from "date-fns/locale";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    type: "reuniao",
    observation: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptData, clientData, noticeData] = await Promise.all([
        Appointment.list(),
        Client.list(),
        Notice.list()
      ]);

      const noticesAsAppointments = noticeData
        .filter(n => n.status === 'ativo')
        .map(n => ({
          id: `notice-${n.id}`,
          title: `[AVISO] ${n.title}`,
          date: n.date ? n.date.split('T')[0] : format(new Date(), "yyyy-MM-dd"),
          time: '08:00',
          type: 'prazo',
          client_name: 'Interno',
          observation: n.content,
          isReadOnly: true
        }));

      const combined = [...apptData, ...noticesAsAppointments];
      
      setAppointments(combined);
      setClients(clientData);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setFormData({ ...formData, date: format(date, "yyyy-MM-dd") });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Appointment.create({
        ...formData,
        status: "agendado"
      });
      toast({ title: "Compromisso agendado!" });
      setIsDialogOpen(false);
      fetchData();
      
      setFormData({
        title: "",
        client_name: "",
        date: format(selectedDate, "yyyy-MM-dd"),
        time: "09:00",
        type: "reuniao",
        observation: ""
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao agendar" });
    }
  };

  const handleDelete = async (item) => {
    if (item.isReadOnly) {
      toast({
        title: "Ação Bloqueada",
        description: "Para remover este item, vá até a aba de Avisos e marque como concluído.",
        className: "bg-amber-600 text-white border-none"
      });
      return;
    }

    if (confirm("Deseja cancelar este compromisso?")) {
      try {
        await Appointment.delete(item.id);
        fetchData();
        toast({ title: "Compromisso cancelado" });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "audiencia": return "bg-red-500";
      case "reuniao": return "bg-blue-500";
      case "prazo": return "bg-amber-500"; 
      case "consulta": return "bg-green-500";
      default: return "bg-slate-500";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "audiencia": return "Audiência";
      case "reuniao": return "Reunião";
      case "prazo": return "Prazo / Aviso";
      case "consulta": return "Consulta";
      default: return "Outros";
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const selectedDayAppointments = appointments
    .filter(appt => {
      if (!appt.date) return false;
      const apptDate = appt.date.includes('T') ? appt.date.split('T')[0] : appt.date;
      return isSameDay(parseISO(apptDate), selectedDate);
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Agenda</h1>
          <p className="text-slate-500 mt-1">Gerencie seus prazos, audiências e reuniões.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1a1a1a] hover:bg-[#c9a962] hover:text-[#1a1a1a] transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Novo Compromisso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label>Título</Label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Reunião com Cliente" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data</Label>
                  <Input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label>Horário</Label>
                  <Input 
                    type="time" 
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={v => setFormData({...formData, type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reuniao">Reunião</SelectItem>
                      <SelectItem value="audiencia">Audiência</SelectItem>
                      <SelectItem value="consulta">Consulta</SelectItem>
                      <SelectItem value="prazo">Prazo / Aviso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cliente (Opcional)</Label>
                  <Select 
                    value={formData.client_name} 
                    onValueChange={v => setFormData({...formData, client_name: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Interno">Interno / Escritório</SelectItem>
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea 
                  value={formData.observation}
                  onChange={e => setFormData({...formData, observation: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full bg-[#1a1a1a] hover:bg-[#c9a962] hover:text-[#1a1a1a]">Agendar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-sm">
        <span className="font-semibold text-slate-700 mr-2">Legenda:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-slate-600">Audiência</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-slate-600">Reunião</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-600">Prazo / Aviso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-slate-600">Consulta</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        
        {/* CALENDÁRIO VISUAL */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-slate-800 capitalize">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}><ChevronLeft className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}><ChevronRight className="w-5 h-5" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 bg-slate-50 border-b">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* GRADE DE DIAS */}
          <div className="grid grid-cols-7 auto-rows-[120px]">
            {calendarDays.map((day) => {
              const dayAppts = appointments.filter(a => {
                if (!a.date) return false;
                const aDate = a.date.includes('T') ? a.date.split('T')[0] : a.date;
                return isSameDay(parseISO(aDate), day);
              });
              
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDay = isToday(day);

              return (
                <div
                  key={day.toString()}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "border-r border-b p-1 transition-colors cursor-pointer hover:bg-slate-50 relative group flex flex-col",
                    !isCurrentMonth && "bg-slate-50/50 text-slate-400",
                    isSelected && "bg-blue-50 ring-inset ring-2 ring-blue-500"
                  )}
                >
                  <div className="flex justify-end p-1">
                    <span className={cn(
                      "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                      isTodayDay ? "bg-[#1a1a1a] text-white" : "text-slate-700"
                    )}>
                      {format(day, "d")}
                    </span>
                  </div>
                  
                  {/* LISTA DE EVENTOS COM NOME (ATUALIZADO) */}
                  <div className="flex flex-col gap-1 w-full px-1 overflow-hidden">
                    {dayAppts.slice(0, 3).map((appt, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-md truncate w-full text-white font-medium shadow-sm cursor-pointer hover:opacity-90",
                          getTypeColor(appt.type)
                        )}
                        title={appt.title}
                      >
                        {appt.title}
                      </div>
                    ))}
                    {dayAppts.length > 3 && (
                      <span className="text-[10px] text-slate-400 pl-1 font-medium">
                        + {dayAppts.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LISTA LATERAL DO DIA */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="h-full border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#c9a962]" />
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[600px]">
              {selectedDayAppointments.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p>Nada agendado para este dia.</p>
                  <Button 
                    variant="link" 
                    className="text-[#c9a962]"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    + Adicionar
                  </Button>
                </div>
              ) : (
                selectedDayAppointments.map(appt => (
                  <div 
                    key={appt.id} 
                    className="p-3 rounded-lg border border-slate-100 bg-white hover:shadow-md transition-shadow group relative"
                  >
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-lg", getTypeColor(appt.type))} />
                    
                    <div className="pl-3">
                      <div className="flex justify-between items-start">
                        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 mb-1 inline-block")}>
                          {getTypeLabel(appt.type)}
                        </span>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn(
                            "h-6 w-6 -mt-1 -mr-1",
                            appt.isReadOnly ? "text-slate-300 hover:text-amber-500" : "text-slate-300 hover:text-red-500"
                          )}
                          onClick={(e) => { e.stopPropagation(); handleDelete(appt); }}
                        >
                          {appt.isReadOnly ? <Lock className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                        </Button>
                      </div>
                      
                      <h4 className="font-semibold text-slate-800 text-sm">{appt.title}</h4>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {appt.time}
                        </div>
                        {appt.client_name && (
                          <div className="flex items-center gap-1 truncate max-w-[100px]">
                            <MapPin className="w-3 h-3" />
                            {appt.client_name}
                          </div>
                        )}
                      </div>
                      
                      {appt.observation && (
                        <p className="mt-2 text-xs text-slate-400 bg-slate-50 p-2 rounded">
                          {appt.observation}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Appointments;