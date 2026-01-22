import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import VisitModal from '@/components/modals/VisitModal';
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
  Building2,
  Users,
  UserPlus,
  CheckCircle,
  Clock,
  Phone,
  Mail
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

const purposeLabels = {
  consulta_inicial: 'Consulta Inicial',
  retorno: 'Retorno',
  entrega_documentos: 'Entrega de Documentos',
  assinatura: 'Assinatura',
  reuniao: 'Reunião',
  outros: 'Outros'
};

const sourceLabels = {
  indicacao: 'Indicação',
  google: 'Google',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  site: 'Site',
  outros: 'Outros'
};

export default function Visits() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState({ 
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), 
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    type: 'current_month' 
  });

  const queryClient = useQueryClient();

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['visits'],
    queryFn: () => base44.entities.Visit.list('-date')
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Visit.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      setModalOpen(false);
      setSelectedVisit(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Visit.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      setModalOpen(false);
      setSelectedVisit(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Visit.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      setDeleteDialogOpen(false);
      setVisitToDelete(null);
    }
  });

  const handleSave = (data) => {
    if (selectedVisit) {
      updateMutation.mutate({ id: selectedVisit.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (visit) => {
    setSelectedVisit(visit);
    setModalOpen(true);
  };

  const handleDelete = (visit) => {
    setVisitToDelete(visit);
    setDeleteDialogOpen(true);
  };

  // Calculate stats based on period filter
  const periodVisits = visits.filter(v => {
    const matchesPeriod = !periodFilter.start || !periodFilter.end || 
      (v.date >= periodFilter.start && v.date <= periodFilter.end);
    return matchesPeriod;
  });

  const monthlyVisits = periodVisits.length;
  const newVisitors = periodVisits.filter(v => v.is_new_client).length;
  const convertedVisits = periodVisits.filter(v => v.converted).length;
  const conversionRate = periodVisits.length > 0 ? ((convertedVisits / periodVisits.length) * 100).toFixed(1) : 0;

  const filteredVisits = visits.filter(v => {
    const matchesSearch = v.visitor_name?.toLowerCase().includes(search.toLowerCase());
    const matchesPurpose = purposeFilter === 'all' || v.purpose === purposeFilter;
    
    // Period filter
    let matchesPeriod = true;
    if (periodFilter.start && periodFilter.end && v.date) {
      matchesPeriod = v.date >= periodFilter.start && v.date <= periodFilter.end;
    }
    
    return matchesSearch && matchesPurpose && matchesPeriod;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitas"
        subtitle="Controle de visitas ao escritório"
        action={() => {
          setSelectedVisit(null);
          setModalOpen(true);
        }}
        actionLabel="Registrar Visita"
      />

      {/* Stats */}
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
              title={periodFilter.type === 'current_month' ? 'Visitas do Mês' : 'Visitas do Período'}
              value={monthlyVisits}
              icon={Building2}
            />
            <StatCard
              title="Total de Visitas"
              value={visits.length}
              icon={Users}
            />
            <StatCard
              title="Novos Visitantes"
              value={newVisitors}
              icon={UserPlus}
            />
            <StatCard
              title="Taxa de Conversão"
              value={`${conversionRate}%`}
              icon={CheckCircle}
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar por nome do visitante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <PeriodFilter value={periodFilter} onChange={setPeriodFilter} />
          <Select value={purposeFilter} onValueChange={setPurposeFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-white">
              <SelectValue placeholder="Motivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Motivos</SelectItem>
              {Object.entries(purposeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Visits List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="p-6">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredVisits.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-1">Nenhuma visita encontrada</h3>
          <p className="text-gray-400">
            {search || purposeFilter !== 'all'
              ? 'Tente ajustar os filtros'
              : 'Comece registrando sua primeira visita'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredVisits.map(visit => (
            <Card key={visit.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white font-semibold">
                    {visit.visitor_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-[#1a1a1a]">{visit.visitor_name}</h4>
                      {visit.is_new_client && (
                        <Badge className="bg-blue-100 text-blue-800">Novo</Badge>
                      )}
                      {visit.converted && (
                        <Badge className="bg-green-100 text-green-800">Convertido</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {visit.date && format(new Date(visit.date), 'dd/MM/yyyy')}
                        {visit.time && ` às ${visit.time}`}
                      </span>
                      {visit.source && (
                        <span>Via: {sourceLabels[visit.source]}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {purposeLabels[visit.purpose]}
                      </Badge>
                      {visit.attended_by && (
                        <span className="text-sm text-gray-500">
                          Atendido por: {visit.attended_by}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {visit.visitor_phone && (
                        <a 
                          href={`tel:${visit.visitor_phone}`}
                          className="text-sm text-gray-500 hover:text-[#1a1a1a] flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {visit.visitor_phone}
                        </a>
                      )}
                      {visit.visitor_email && (
                        <a 
                          href={`mailto:${visit.visitor_email}`}
                          className="text-sm text-gray-500 hover:text-[#1a1a1a] flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          {visit.visitor_email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(visit)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleDelete(visit)}
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

      <VisitModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedVisit(null);
        }}
        onSave={handleSave}
        visit={selectedVisit}
        clients={clients}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta visita? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteMutation.mutate(visitToDelete?.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}