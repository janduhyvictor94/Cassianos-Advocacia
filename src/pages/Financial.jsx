import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import FinancialModal from '@/components/modals/FinancialModal';
import PeriodFilter from '@/components/ui/PeriodFilter';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  MoreVertical,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter
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

const categoryLabels = {
  honorarios: 'Honorários',
  custas_processuais: 'Custas Processuais',
  aluguel: 'Aluguel',
  salarios: 'Salários',
  materiais: 'Materiais',
  marketing: 'Marketing',
  servicos: 'Serviços',
  impostos: 'Impostos',
  manutencao: 'Manutenção',
  outros: 'Outros'
};

const statusLabels = {
  pendente: 'Pendente',
  pago: 'Pago',
  atrasado: 'Atrasado',
  cancelado: 'Cancelado'
};

const statusColors = {
  pendente: 'bg-yellow-100 text-yellow-800',
  pago: 'bg-green-100 text-green-800',
  atrasado: 'bg-red-100 text-red-800',
  cancelado: 'bg-gray-100 text-gray-800'
};

export default function Financial() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFinancial, setSelectedFinancial] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [financialToDelete, setFinancialToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState({ 
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), 
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    type: 'current_month' 
  });

  const queryClient = useQueryClient();

  const { data: financial = [], isLoading } = useQuery({
    queryKey: ['financial'],
    queryFn: () => base44.entities.Financial.list('-date')
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
    mutationFn: (data) => base44.entities.Financial.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      setModalOpen(false);
      setSelectedFinancial(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Financial.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      setModalOpen(false);
      setSelectedFinancial(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Financial.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      setDeleteDialogOpen(false);
      setFinancialToDelete(null);
    }
  });

  const handleSave = async (data) => {
    if (selectedFinancial) {
      updateMutation.mutate({ id: selectedFinancial.id, data });
      return;
    }
    
    // Se for cartão de crédito parcelado, criar múltiplas entradas
    if (data.isInstallmentPayment && data.installments > 1) {
      const { isInstallmentPayment, installments, value, ...baseData } = data;
      const installmentValue = value / installments;
      
      // Criar cada parcela
      const installmentPromises = [];
      for (let i = 0; i < installments; i++) {
        // Primeira parcela: +30 dias da data atual
        // Demais parcelas: +30 dias da anterior
        const installmentDate = new Date(baseData.date);
        installmentDate.setDate(installmentDate.getDate() + 30 * (i + 1));
        
        const installmentData = {
          ...baseData,
          value: installmentValue,
          date: installmentDate.toISOString().split('T')[0],
          status: 'pago', // Sempre pago automaticamente
          description: `${baseData.description || 'Cartão de Crédito'} - Parcela ${i + 1}/${installments}`,
          payment_method: 'cartao_credito'
        };
        
        installmentPromises.push(base44.entities.Financial.create(installmentData));
      }
      
      // Executar todas as criações
      await Promise.all(installmentPromises);
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      setModalOpen(false);
      setSelectedFinancial(null);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item) => {
    setSelectedFinancial(item);
    setModalOpen(true);
  };

  const handleDelete = (item) => {
    setFinancialToDelete(item);
    setDeleteDialogOpen(true);
  };

  // Calculate stats based on period filter
  const periodIncome = financial
    .filter(f => {
      const matchesPeriod = !periodFilter.start || !periodFilter.end || 
        (f.date >= periodFilter.start && f.date <= periodFilter.end);
      return f.type === 'entrada' && f.status === 'pago' && matchesPeriod;
    })
    .reduce((sum, f) => sum + (f.value || 0), 0);

  const periodExpenses = financial
    .filter(f => {
      const matchesPeriod = !periodFilter.start || !periodFilter.end || 
        (f.date >= periodFilter.start && f.date <= periodFilter.end);
      return f.type === 'despesa' && f.status === 'pago' && matchesPeriod;
    })
    .reduce((sum, f) => sum + (f.value || 0), 0);

  const pendingPayments = financial
    .filter(f => {
      const matchesPeriod = !periodFilter.start || !periodFilter.end || 
        (f.date >= periodFilter.start && f.date <= periodFilter.end);
      return (f.status === 'pendente' || f.status === 'atrasado') && matchesPeriod;
    })
    .reduce((sum, f) => sum + (f.value || 0), 0);

  const filteredFinancial = financial.filter(f => {
    const matchesSearch = 
      f.description?.toLowerCase().includes(search.toLowerCase()) ||
      f.client_name?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || f.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    
    // Period filter
    let matchesPeriod = true;
    if (periodFilter.start && periodFilter.end && f.date) {
      matchesPeriod = f.date >= periodFilter.start && f.date <= periodFilter.end;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesPeriod;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        subtitle="Controle de entradas e despesas"
        action={() => {
          setSelectedFinancial(null);
          setModalOpen(true);
        }}
        actionLabel="Novo Lançamento"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {[1,2,3,4].map(i => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-20" />
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title={periodFilter.type === 'current_month' ? 'Receita do Mês' : 'Receitas do Período'}
              value={`R$ ${periodIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              icon={TrendingUp}
            />
            <StatCard
              title={periodFilter.type === 'current_month' ? 'Despesas do Mês' : 'Despesas do Período'}
              value={`R$ ${periodExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              icon={TrendingDown}
            />
            <StatCard
              title={periodFilter.type === 'current_month' ? 'Saldo do Mês' : 'Saldo do Período'}
              value={`R$ ${(periodIncome - periodExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
              trend={periodIncome > periodExpenses ? 'Positivo' : 'Negativo'}
              trendUp={periodIncome > periodExpenses}
            />
            <StatCard
              title="Pendentes"
              value={`R$ ${pendingPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar por descrição ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <PeriodFilter value={periodFilter} onChange={setPeriodFilter} />
          <Tabs value={typeFilter} onValueChange={setTypeFilter}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="entrada">Entradas</TabsTrigger>
              <TabsTrigger value="despesa">Despesas</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Financial List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="p-6">
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredFinancial.length === 0 ? (
        <Card className="p-12 text-center">
          <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-1">Nenhum lançamento encontrado</h3>
          <p className="text-gray-400">
            {search || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Tente ajustar os filtros'
              : 'Comece registrando seu primeiro lançamento'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredFinancial.map(item => (
            <Card key={item.id} className="p-5 hover:shadow-xl transition-all hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/50 border-slate-200/80 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                    item.type === 'entrada' ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-rose-600'
                  }`}>
                    {item.type === 'entrada' ? (
                      <ArrowUpCircle className="w-6 h-6 text-white" />
                    ) : (
                      <ArrowDownCircle className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {categoryLabels[item.category]}
                      </Badge>
                      <Badge className={statusColors[item.status]}>
                        {statusLabels[item.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description || 'Sem descrição'}
                      {item.client_name && ` • ${item.client_name}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-semibold ${
                      item.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.type === 'entrada' ? '+' : '-'} R$ {item.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.date && format(new Date(item.date), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <FinancialModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedFinancial(null);
        }}
        onSave={handleSave}
        financial={selectedFinancial}
        clients={clients}
        processes={processes}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este lançamento? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteMutation.mutate(financialToDelete?.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}