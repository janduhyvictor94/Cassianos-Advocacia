import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import PrintableReport from '@/components/reports/PrintableReport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PeriodFilter from '@/components/ui/PeriodFilter';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Scale,
  DollarSign,
  Building2,
  Megaphone,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#1a1a1a', '#c9a962', '#6b7280', '#4b5563', '#9ca3af', '#d1d5db'];

const statusLabels = {
  em_andamento: 'Em Andamento',
  aguardando_julgamento: 'Ag. Julgamento',
  recurso: 'Recurso',
  arquivado: 'Arquivado',
  ganho: 'Ganho',
  perdido: 'Perdido',
  acordo: 'Acordo'
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

const sourceLabels = {
  indicacao: 'Indicação',
  google: 'Google',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  site: 'Site',
  outros: 'Outros'
};

export default function Reports() {
  const [periodFilter, setPeriodFilter] = useState({ 
    start: format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'), 
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    type: 'last_6_months' 
  });
  const [activeTab, setActiveTab] = useState('clientes');

  const handlePrint = () => {
    window.print();
  };

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: processes = [], isLoading: loadingProcesses } = useQuery({
    queryKey: ['processes'],
    queryFn: () => base44.entities.Process.list()
  });

  const { data: financial = [], isLoading: loadingFinancial } = useQuery({
    queryKey: ['financial'],
    queryFn: () => base44.entities.Financial.list()
  });

  const { data: visits = [], isLoading: loadingVisits } = useQuery({
    queryKey: ['visits'],
    queryFn: () => base44.entities.Visit.list()
  });

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list()
  });

  const isLoading = loadingClients || loadingProcesses || loadingFinancial || loadingVisits || loadingCampaigns;

  // Generate monthly data based on period filter
  const months = periodFilter.start && periodFilter.end 
    ? eachMonthOfInterval({
        start: new Date(periodFilter.start),
        end: new Date(periodFilter.end)
      })
    : eachMonthOfInterval({
        start: subMonths(new Date(), 5),
        end: new Date()
      });

  const monthlyFinancialData = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const income = financial
      .filter(f => {
        const date = f.date ? new Date(f.date) : null;
        return f.type === 'entrada' && f.status === 'pago' && date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, f) => sum + (f.value || 0), 0);

    const expenses = financial
      .filter(f => {
        const date = f.date ? new Date(f.date) : null;
        return f.type === 'despesa' && f.status === 'pago' && date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, f) => sum + (f.value || 0), 0);

    return {
      month: format(month, 'MMM', { locale: ptBR }),
      receitas: income,
      despesas: expenses,
      lucro: income - expenses
    };
  });

  // Processes by area
  const processesByArea = Object.entries(
    processes.reduce((acc, p) => {
      acc[p.area] = (acc[p.area] || 0) + 1;
      return acc;
    }, {})
  ).map(([area, count]) => ({
    name: areaLabels[area] || area,
    value: count
  }));

  // Processes by status
  const processesByStatus = Object.entries(
    processes.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: count
  }));

  // Visits by source
  const visitsBySource = Object.entries(
    visits.reduce((acc, v) => {
      acc[v.source] = (acc[v.source] || 0) + 1;
      return acc;
    }, {})
  ).map(([source, count]) => ({
    name: sourceLabels[source] || source,
    value: count
  }));

  // Monthly visits and conversions
  const monthlyVisitsData = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthVisits = visits.filter(v => {
      const date = v.date ? new Date(v.date) : null;
      return date >= monthStart && date <= monthEnd;
    });

    return {
      month: format(month, 'MMM', { locale: ptBR }),
      visitas: monthVisits.length,
      conversoes: monthVisits.filter(v => v.converted).length
    };
  });

  // Campaign ROI
  const campaignData = campaigns.map(c => ({
    name: c.name?.substring(0, 15) + (c.name?.length > 15 ? '...' : ''),
    investido: c.spent || 0,
    leads: c.leads || 0,
    cpl: c.leads && c.spent ? c.spent / c.leads : 0
  })).slice(0, 6);

  // Financial by category
  const expensesByCategory = Object.entries(
    financial
      .filter(f => f.type === 'despesa' && f.status === 'pago')
      .reduce((acc, f) => {
        acc[f.category] = (acc[f.category] || 0) + (f.value || 0);
        return acc;
      }, {})
  ).map(([category, value]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
    value
  })).sort((a, b) => b.value - a.value).slice(0, 6);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' && entry.name !== 'leads' && entry.name !== 'visitas' && entry.name !== 'conversoes'
                ? `R$ ${entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Relatórios"
          subtitle="Análise completa do escritório"
        />
        <div className="flex gap-3 print:hidden">
          <PeriodFilter value={periodFilter} onChange={setPeriodFilter} />
          <Button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
        </div>
      </div>

      <Tabs defaultValue="clientes" className="space-y-6 print:hidden" onValueChange={setActiveTab}>
        <TabsList className="bg-white border">
          <TabsTrigger value="clientes" className="gap-2">
            <Users className="w-4 h-4" /> Por Cliente
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-2">
            <DollarSign className="w-4 h-4" /> Financeiro
          </TabsTrigger>
          <TabsTrigger value="processos" className="gap-2">
            <Scale className="w-4 h-4" /> Processos
          </TabsTrigger>
          <TabsTrigger value="visitas" className="gap-2">
            <Building2 className="w-4 h-4" /> Visitas
          </TabsTrigger>
          <TabsTrigger value="marketing" className="gap-2">
            <Megaphone className="w-4 h-4" /> Marketing
          </TabsTrigger>
        </TabsList>

        {/* Client Reports Tab */}
        <TabsContent value="clientes" className="space-y-6">
          {isLoading ? (
            <Card className="p-6"><Skeleton className="h-80 w-full" /></Card>
          ) : clients.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Nenhum cliente cadastrado</h3>
            </Card>
          ) : (
            <div className="space-y-4">
              {clients.filter(c => c.status === 'active').map(client => {
                // Get client's processes
                const clientProcesses = processes.filter(p => p.client_id === client.id);
                
                // Get client's financial data
                const clientFinancial = financial.filter(f => f.client_id === client.id);
                const clientIncome = clientFinancial
                  .filter(f => f.type === 'entrada' && f.status === 'pago')
                  .reduce((sum, f) => sum + (f.value || 0), 0);
                const clientPending = clientFinancial
                  .filter(f => f.status === 'pendente' || f.status === 'atrasado')
                  .reduce((sum, f) => sum + (f.value || 0), 0);
                
                // Get client's visits
                const clientVisits = visits.filter(v => v.client_id === client.id);

                return (
                  <Card key={client.id} className="overflow-hidden">
                    <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{client.name}</h3>
                          <div className="flex flex-wrap gap-3 text-sm opacity-90">
                            {client.email && (
                              <span className="flex items-center gap-1">
                                <span>📧</span> {client.email}
                              </span>
                            )}
                            {client.phone && (
                              <span className="flex items-center gap-1">
                                <span>📱</span> {client.phone}
                              </span>
                            )}
                            {client.cpf_cnpj && (
                              <span className="flex items-center gap-1">
                                <span>🆔</span> {client.cpf_cnpj}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm opacity-75">Cliente desde</div>
                          <div className="font-semibold">
                            {client.created_date && format(new Date(client.created_date), 'MMM/yyyy', { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-xl p-4">
                          <div className="text-2xl font-bold text-blue-900">{clientProcesses.length}</div>
                          <div className="text-sm text-blue-600">Processos</div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4">
                          <div className="text-2xl font-bold text-green-900">
                            R$ {clientIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-green-600">Receitas</div>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-4">
                          <div className="text-2xl font-bold text-orange-900">
                            R$ {clientPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-orange-600">Pendente</div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4">
                          <div className="text-2xl font-bold text-purple-900">{clientVisits.length}</div>
                          <div className="text-sm text-purple-600">Visitas</div>
                        </div>
                      </div>

                      {/* Processes */}
                      {clientProcesses.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                            <Scale className="w-4 h-4 text-[#c9a962]" />
                            Processos ({clientProcesses.length})
                          </h4>
                          <div className="space-y-2">
                            {clientProcesses.map(process => (
                              <div key={process.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-[#1a1a1a]">{process.number}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      {process.type || 'Sem tipo definido'} • {areaLabels[process.area]}
                                    </div>
                                    {process.description && (
                                      <div className="text-sm text-gray-500 mt-2 line-clamp-2">
                                        {process.description}
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4 text-right">
                                    <Badge className={`
                                      ${process.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' : ''}
                                      ${process.status === 'ganho' ? 'bg-green-100 text-green-800' : ''}
                                      ${process.status === 'perdido' ? 'bg-red-100 text-red-800' : ''}
                                      ${process.status === 'acordo' ? 'bg-purple-100 text-purple-800' : ''}
                                      ${process.status === 'arquivado' ? 'bg-gray-100 text-gray-800' : ''}
                                    `}>
                                      {statusLabels[process.status] || process.status}
                                    </Badge>
                                    {process.value && (
                                      <div className="text-sm font-medium text-gray-700 mt-2">
                                        R$ {process.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {(process.court || process.judge) && (
                                  <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                                    {process.court && <span>📍 {process.court}</span>}
                                    {process.court && process.judge && <span className="mx-2">•</span>}
                                    {process.judge && <span>👨‍⚖️ {process.judge}</span>}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Financial */}
                      {clientFinancial.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-[#c9a962]" />
                            Movimentação Financeira
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 px-3 font-medium text-gray-600">Data</th>
                                  <th className="text-left py-2 px-3 font-medium text-gray-600">Tipo</th>
                                  <th className="text-left py-2 px-3 font-medium text-gray-600">Descrição</th>
                                  <th className="text-right py-2 px-3 font-medium text-gray-600">Valor</th>
                                  <th className="text-center py-2 px-3 font-medium text-gray-600">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {clientFinancial.slice(0, 5).map(fin => (
                                  <tr key={fin.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="py-2 px-3">
                                      {fin.date && format(new Date(fin.date), 'dd/MM/yy')}
                                    </td>
                                    <td className="py-2 px-3">
                                      <Badge variant="outline" className={fin.type === 'entrada' ? 'text-green-700' : 'text-red-700'}>
                                        {fin.type === 'entrada' ? 'Entrada' : 'Despesa'}
                                      </Badge>
                                    </td>
                                    <td className="py-2 px-3 text-gray-700">
                                      {fin.description || 'Sem descrição'}
                                    </td>
                                    <td className="py-2 px-3 text-right font-medium">
                                      <span className={fin.type === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                                        {fin.type === 'entrada' ? '+' : '-'} R$ {fin.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      <Badge className={`
                                        ${fin.status === 'pago' ? 'bg-green-100 text-green-800' : ''}
                                        ${fin.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : ''}
                                        ${fin.status === 'atrasado' ? 'bg-red-100 text-red-800' : ''}
                                      `}>
                                        {fin.status}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {clientFinancial.length > 5 && (
                              <div className="text-center py-2 text-sm text-gray-500">
                                + {clientFinancial.length - 5} lançamentos
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Visits */}
                      {clientVisits.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-[#1a1a1a] mb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#c9a962]" />
                            Histórico de Visitas ({clientVisits.length})
                          </h4>
                          <div className="space-y-2">
                            {clientVisits.slice(0, 3).map(visit => (
                              <div key={visit.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium text-[#1a1a1a]">
                                    {visit.purpose && visit.purpose.replace('_', ' ')}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {visit.date && format(new Date(visit.date), 'dd/MM/yyyy')}
                                    {visit.time && ` às ${visit.time}`}
                                    {visit.attended_by && ` • Atendido por ${visit.attended_by}`}
                                  </div>
                                </div>
                                {visit.converted && (
                                  <Badge className="bg-green-100 text-green-800">Convertido</Badge>
                                )}
                              </div>
                            ))}
                            {clientVisits.length > 3 && (
                              <div className="text-center text-sm text-gray-500">
                                + {clientVisits.length - 3} visitas anteriores
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* No Data Message */}
                      {clientProcesses.length === 0 && clientFinancial.length === 0 && clientVisits.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhuma movimentação registrada para este cliente</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financeiro" className="space-y-6">
          {isLoading ? (
            <Card className="p-6"><Skeleton className="h-80 w-full" /></Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#c9a962]" />
                    Receitas vs Despesas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyFinancialData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="receitas" fill="#c9a962" name="Receitas" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="despesas" fill="#1a1a1a" name="Despesas" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Lucro Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyFinancialData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="lucro" stroke="#c9a962" strokeWidth={3} name="Lucro" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Despesas por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expensesByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {expensesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Processes Tab */}
        <TabsContent value="processos" className="space-y-6">
          {isLoading ? (
            <Card className="p-6"><Skeleton className="h-80 w-full" /></Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Processos por Área</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={processesByArea}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {processesByArea.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Processos por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processesByStatus} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" stroke="#6b7280" />
                        <YAxis dataKey="name" type="category" stroke="#6b7280" width={100} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#c9a962" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Visits Tab */}
        <TabsContent value="visitas" className="space-y-6">
          {isLoading ? (
            <Card className="p-6"><Skeleton className="h-80 w-full" /></Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Visitas e Conversões por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyVisitsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="visitas" fill="#1a1a1a" name="Visitas" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="conversoes" fill="#c9a962" name="Conversões" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Origem das Visitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={visitsBySource}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {visitsBySource.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Marketing Tab */}
        <TabsContent value="marketing" className="space-y-6">
          {isLoading ? (
            <Card className="p-6"><Skeleton className="h-80 w-full" /></Card>
          ) : campaigns.length === 0 ? (
            <Card className="p-12 text-center">
              <Megaphone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Nenhuma campanha cadastrada</h3>
              <p className="text-gray-400">Cadastre campanhas para ver os relatórios de marketing</p>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Performance das Campanhas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaignData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis yAxisId="left" stroke="#6b7280" tickFormatter={(v) => `R$${v}`} />
                      <YAxis yAxisId="right" orientation="right" stroke="#c9a962" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="investido" fill="#1a1a1a" name="Investido" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="leads" fill="#c9a962" name="Leads" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <PrintableReport
        activeTab={activeTab}
        clients={clients}
        processes={processes}
        financial={financial}
        visits={visits}
        campaigns={campaigns}
        periodFilter={periodFilter}
        monthlyFinancialData={monthlyFinancialData}
        processesByArea={processesByArea}
        processesByStatus={processesByStatus}
        visitsBySource={visitsBySource}
        expensesByCategory={expensesByCategory}
      />
    </div>
  );
}