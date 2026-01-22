import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import NoticeModal from '@/components/modals/NoticeModal';
import PeriodFilter from '@/components/ui/PeriodFilter';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  MoreVertical,
  Pencil,
  Trash2,
  Bell,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  AlertCircle,
  Users,
  Scale
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
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';

const priorityLabels = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente'
};

const priorityColors = {
  baixa: 'bg-slate-400',
  media: 'bg-slate-500',
  alta: 'bg-slate-700',
  urgente: 'bg-slate-900'
};

const categoryColors = {
  prazo: 'bg-slate-100 text-slate-700',
  audiencia: 'bg-blue-100 text-blue-700',
  reuniao: 'bg-purple-100 text-purple-700',
  pagamento: 'bg-green-100 text-green-700',
  documento: 'bg-orange-100 text-orange-700',
  outros: 'bg-gray-100 text-gray-700'
};

const categoryLabels = {
  prazo: 'Prazo',
  audiencia: 'Audiência',
  reuniao: 'Reunião',
  pagamento: 'Pagamento',
  documento: 'Documento',
  outros: 'Outros'
};

const statusLabels = {
  pendente: 'Pendente',
  concluido: 'Concluído'
};

const statusColors = {
  pendente: 'bg-amber-100 text-amber-800',
  concluido: 'bg-emerald-100 text-emerald-800'
};

export default function Notices() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState({ 
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), 
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    type: 'current_month' 
  });

  const queryClient = useQueryClient();

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: () => base44.entities.Notice.list('-date')
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
    mutationFn: (data) => base44.entities.Notice.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setModalOpen(false);
      setSelectedNotice(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Notice.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setModalOpen(false);
      setSelectedNotice(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notice.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setDeleteDialogOpen(false);
      setNoticeToDelete(null);
    }
  });

  const handleSave = (data) => {
    if (selectedNotice) {
      updateMutation.mutate({ id: selectedNotice.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (notice) => {
    setSelectedNotice(notice);
    setModalOpen(true);
  };

  const handleDelete = (notice) => {
    setNoticeToDelete(notice);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = (notice) => {
    const newStatus = notice.status === 'pendente' ? 'concluido' : 'pendente';
    updateMutation.mutate({
      id: notice.id,
      data: { ...notice, status: newStatus }
    });
  };

  const filteredNotices = notices.filter(n => {
    const matchesSearch = 
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.description?.toLowerCase().includes(search.toLowerCase()) ||
      n.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || n.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
    
    // Period filter
    let matchesPeriod = true;
    if (periodFilter.start && periodFilter.end && n.date) {
      matchesPeriod = n.date >= periodFilter.start && n.date <= periodFilter.end;
    }
    
    return matchesSearch && matchesPriority && matchesStatus && matchesPeriod;
  });

  const getDaysUntil = (date) => {
    if (!date) return null;
    const diff = differenceInDays(parseISO(date), new Date());
    return diff;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Avisos"
        subtitle={`${notices.length} avisos cadastrados`}
        action={() => {
          setSelectedNotice(null);
          setModalOpen(true);
        }}
        actionLabel="Novo Aviso"
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por título, descrição ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 h-10"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <PeriodFilter value={periodFilter} onChange={setPeriodFilter} />
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-50 border-slate-200 h-10">
                <Filter className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-50 border-slate-200 h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">Todos os Status</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Notices List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="p-6 border-slate-200">
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredNotices.length === 0 ? (
        <Card className="p-16 text-center border-slate-200 shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
            <Bell className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">Nenhum aviso encontrado</h3>
          <p className="text-slate-500 text-sm">
            {search || priorityFilter !== 'all' || statusFilter !== 'all'
              ? 'Tente ajustar os filtros' 
              : 'Comece cadastrando seu primeiro aviso'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map(notice => {
            const daysUntil = getDaysUntil(notice.date);
            const isOverdue = daysUntil !== null && daysUntil < 0 && notice.status === 'pendente';
            const isUrgent = daysUntil !== null && daysUntil <= 3 && daysUntil >= 0 && notice.status === 'pendente';

            return (
              <Card key={notice.id} className={`p-6 hover:shadow-xl transition-all hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/50 border-slate-200/80 rounded-2xl ${
                isOverdue ? 'border-l-4 border-l-red-500 shadow-red-100' : 
                isUrgent ? 'border-l-4 border-l-orange-500 shadow-orange-100' : ''
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-2 h-28 rounded-full shadow-md ${priorityColors[notice.priority]}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-semibold text-slate-900 text-lg tracking-tight">{notice.title}</h3>
                        <Badge className={cn(statusColors[notice.status], "text-xs font-medium px-3 py-1 shrink-0")}>
                          {statusLabels[notice.status]}
                        </Badge>
                      </div>
                      
                      {notice.description && (
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{notice.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className={`${priorityColors[notice.priority]} text-white text-xs px-2.5 py-1`}>
                          {priorityLabels[notice.priority]}
                        </Badge>
                        <Badge className={cn(categoryColors[notice.category], "text-xs px-2.5 py-1")}>
                          {categoryLabels[notice.category]}
                        </Badge>
                        {notice.client_name && (
                          <Badge variant="outline" className="gap-1.5 text-xs border-slate-300 px-2.5 py-1">
                            <Users className="w-3 h-3" />
                            {notice.client_name}
                          </Badge>
                        )}
                        {notice.process_number && (
                          <Badge variant="outline" className="gap-1.5 text-xs border-slate-300 px-2.5 py-1">
                            <Scale className="w-3 h-3" />
                            {notice.process_number}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-5 text-sm">
                        <span className={`flex items-center gap-1.5 font-medium ${
                          isOverdue ? 'text-red-600' : 'text-slate-600'
                        }`}>
                          <Calendar className="w-4 h-4" />
                          {format(parseISO(notice.date), 'dd/MM/yyyy')}
                        </span>
                        {daysUntil !== null && notice.status === 'pendente' && (
                          <span className={`flex items-center gap-1.5 font-medium ${
                            isOverdue ? 'text-red-600' : 
                            isUrgent ? 'text-orange-600' : 
                            'text-slate-600'
                          }`}>
                            {isOverdue ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            {isOverdue ? `Atrasado ${Math.abs(daysUntil)} dias` : 
                             daysUntil === 0 ? 'Hoje' :
                             daysUntil === 1 ? 'Amanhã' :
                             `Em ${daysUntil} dias`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                    {notice.status === 'pendente' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(notice)}
                        className="shrink-0 border-slate-300 hover:bg-slate-50 gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Concluir
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-slate-100 shrink-0">
                          <MoreVertical className="w-4 h-4 text-slate-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-slate-200">
                        <DropdownMenuItem onClick={() => handleEdit(notice)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(notice)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <NoticeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedNotice(null);
        }}
        onSave={handleSave}
        notice={selectedNotice}
        clients={clients}
        processes={processes}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o aviso "{noticeToDelete?.title}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteMutation.mutate(noticeToDelete?.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}