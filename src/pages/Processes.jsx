import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import ProcessModal from '@/components/modals/ProcessModal';
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
  Scale,
  Filter,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Users
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
import { format, startOfMonth, endOfMonth } from 'date-fns';

const statusLabels = {
  em_andamento: 'Em Andamento',
  aguardando_julgamento: 'Aguardando Julgamento',
  recurso: 'Recurso',
  arquivado: 'Arquivado',
  ganho: 'Ganho',
  perdido: 'Perdido',
  acordo: 'Acordo'
};

const statusColors = {
  em_andamento: 'bg-blue-100 text-blue-800',
  aguardando_julgamento: 'bg-yellow-100 text-yellow-800',
  recurso: 'bg-orange-100 text-orange-800',
  arquivado: 'bg-gray-100 text-gray-800',
  ganho: 'bg-green-100 text-green-800',
  perdido: 'bg-red-100 text-red-800',
  acordo: 'bg-purple-100 text-purple-800'
};

const areaLabels = {
  civil: 'Civil',
  criminal: 'Criminal',
  trabalhista: 'Trabalhista',
  tributario: 'Tributário',
  familia: 'Família',
  previdenciario: 'Previdenciário',
  empresarial: 'Empresarial',
  consumidor: 'Consumidor',
  administrativo: 'Administrativo',
  outros: 'Outros'
};

export default function Processes() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [expandedClients, setExpandedClients] = useState({});
  const [periodFilter, setPeriodFilter] = useState({ 
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), 
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    type: 'current_month' 
  });

  const queryClient = useQueryClient();

  const { data: processes = [], isLoading } = useQuery({
    queryKey: ['processes'],
    queryFn: () => base44.entities.Process.list('-created_date')
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Process.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      setModalOpen(false);
      setSelectedProcess(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Process.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      setModalOpen(false);
      setSelectedProcess(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Process.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      setDeleteDialogOpen(false);
      setProcessToDelete(null);
    }
  });

  const handleSave = (data) => {
    if (selectedProcess) {
      updateMutation.mutate({ id: selectedProcess.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (process) => {
    setSelectedProcess(process);
    setModalOpen(true);
  };

  const handleDelete = (process) => {
    setProcessToDelete(process);
    setDeleteDialogOpen(true);
  };

  const filteredProcesses = processes.filter(p => {
    const matchesSearch = 
      p.number?.toLowerCase().includes(search.toLowerCase()) ||
      p.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.type?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesArea = areaFilter === 'all' || p.area === areaFilter;
    
    // Period filter
    let matchesPeriod = true;
    if (periodFilter.start && periodFilter.end && p.start_date) {
      matchesPeriod = p.start_date >= periodFilter.start && p.start_date <= periodFilter.end;
    }
    
    return matchesSearch && matchesStatus && matchesArea && matchesPeriod;
  });

  // Group processes by client
  const groupedByClient = filteredProcesses.reduce((acc, process) => {
    const clientId = process.client_id || 'sem_cliente';
    if (!acc[clientId]) {
      acc[clientId] = {
        clientName: process.client_name || 'Sem Cliente',
        processes: []
      };
    }
    acc[clientId].processes.push(process);
    return acc;
  }, {});

  const toggleClient = (clientId) => {
    setExpandedClients(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Processos"
        subtitle={`${processes.length} processos cadastrados`}
        action={() => {
          setSelectedProcess(null);
          setModalOpen(true);
        }}
        actionLabel="Novo Processo"
      />

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar por número, cliente ou tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <PeriodFilter value={periodFilter} onChange={setPeriodFilter} />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={areaFilter} onValueChange={setAreaFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-white">
              <SelectValue placeholder="Área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Áreas</SelectItem>
              {Object.entries(areaLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Processes List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="p-6">
              <div className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredProcesses.length === 0 ? (
        <Card className="p-12 text-center">
          <Scale className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-1">Nenhum processo encontrado</h3>
          <p className="text-gray-400">
            {search || statusFilter !== 'all' || areaFilter !== 'all' 
              ? 'Tente ajustar os filtros' 
              : 'Comece cadastrando seu primeiro processo'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByClient).map(([clientId, { clientName, processes: clientProcesses }]) => (
            <Card key={clientId} className="overflow-hidden border-slate-200/80 shadow-lg rounded-2xl bg-gradient-to-br from-white to-slate-50/50 hover:shadow-xl transition-all">
              {/* Client Header */}
              <button
                onClick={() => toggleClient(clientId)}
                className="w-full p-5 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100/50 hover:from-slate-100 hover:to-slate-200/50 transition-all border-b border-slate-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 text-lg">{clientName}</h3>
                    <p className="text-sm text-slate-500">{clientProcesses.length} processo(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white">
                    {clientProcesses.length}
                  </Badge>
                  {expandedClients[clientId] ? (
                    <ChevronDown className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
                  )}
                </div>
              </button>

              {/* Client Processes */}
              {expandedClients[clientId] && (
                <div className="divide-y divide-slate-100">
                  {clientProcesses.map(process => (
                    <div key={process.id} className="p-5 hover:bg-slate-50/80 transition-all hover:shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                            <Scale className="w-6 h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-slate-900 text-sm">{process.number}</h4>
                            {process.type && (
                              <p className="text-xs text-slate-500 mt-0.5">{process.type}</p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className="capitalize text-xs">
                                {areaLabels[process.area] || process.area}
                              </Badge>
                              <Badge className={`${statusColors[process.status]} text-xs`}>
                                {statusLabels[process.status] || process.status}
                              </Badge>
                              {process.documents_link && (
                                <a 
                                  href={process.documents_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Documentos
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            {process.value && (
                              <p className="font-semibold text-slate-900 text-sm">
                                R$ {process.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            )}
                            {process.start_date && (
                              <p className="text-xs text-slate-500">
                                Início: {format(new Date(process.start_date), 'dd/MM/yyyy')}
                              </p>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(process)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(process)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <ProcessModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProcess(null);
        }}
        onSave={handleSave}
        process={selectedProcess}
        clients={clients}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o processo "{processToDelete?.number}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteMutation.mutate(processToDelete?.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}