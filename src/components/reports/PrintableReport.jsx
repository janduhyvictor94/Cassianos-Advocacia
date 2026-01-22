import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export default function PrintableReport({ 
  activeTab, 
  clients, 
  processes, 
  financial,
  visits,
  campaigns,
  periodFilter,
  monthlyFinancialData,
  processesByArea,
  processesByStatus,
  visitsBySource,
  expensesByCategory
}) {
  return (
    <div className="hidden print:block">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
          .page-break {
            page-break-before: always;
          }
          .no-break {
            page-break-inside: avoid;
          }
        }
      `}</style>
      
      <div id="printable-report" className="bg-white">
        {/* Header */}
        <div className="border-b-4 border-slate-900 pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">CASSIANO'S ADVOCACIA</h1>
              <p className="text-slate-600 mt-1">Relatório Gerencial</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Data de Emissão</p>
              <p className="font-semibold text-slate-900">
                {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              {periodFilter.start && periodFilter.end && (
                <p className="text-xs text-slate-500 mt-2">
                  Período: {format(new Date(periodFilter.start), 'dd/MM/yyyy')} a {format(new Date(periodFilter.end), 'dd/MM/yyyy')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Clients Report */}
        {activeTab === 'clientes' && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Relatório por Cliente</h2>
            {clients.filter(c => c.status === 'active').map((client, index) => {
              const clientProcesses = processes.filter(p => p.client_id === client.id);
              const clientFinancial = financial.filter(f => f.client_id === client.id);
              const clientIncome = clientFinancial
                .filter(f => f.type === 'entrada' && f.status === 'pago')
                .reduce((sum, f) => sum + (f.value || 0), 0);
              const clientPending = clientFinancial
                .filter(f => f.status === 'pendente' || f.status === 'atrasado')
                .reduce((sum, f) => sum + (f.value || 0), 0);

              return (
                <div key={client.id} className={`no-break mb-8 ${index > 0 ? 'page-break' : ''}`}>
                  <div className="bg-slate-900 text-white p-4 mb-4">
                    <h3 className="text-xl font-bold">{client.name}</h3>
                    <div className="text-sm mt-1 opacity-90">
                      {client.email && <span>{client.email}</span>}
                      {client.phone && <span className="ml-4">{client.phone}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="border-l-4 border-blue-500 pl-3">
                      <div className="text-2xl font-bold text-slate-900">{clientProcesses.length}</div>
                      <div className="text-sm text-slate-600">Processos</div>
                    </div>
                    <div className="border-l-4 border-green-500 pl-3">
                      <div className="text-2xl font-bold text-slate-900">
                        R$ {clientIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-slate-600">Receitas</div>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-3">
                      <div className="text-2xl font-bold text-slate-900">
                        R$ {clientPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-slate-600">Pendente</div>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-3">
                      <div className="text-2xl font-bold text-slate-900">
                        {visits.filter(v => v.client_id === client.id).length}
                      </div>
                      <div className="text-sm text-slate-600">Visitas</div>
                    </div>
                  </div>

                  {clientProcesses.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-900 mb-3 text-lg">Processos</h4>
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 p-2 text-left">Número</th>
                            <th className="border border-slate-300 p-2 text-left">Tipo</th>
                            <th className="border border-slate-300 p-2 text-left">Área</th>
                            <th className="border border-slate-300 p-2 text-left">Status</th>
                            <th className="border border-slate-300 p-2 text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clientProcesses.map(p => (
                            <tr key={p.id}>
                              <td className="border border-slate-300 p-2">{p.number}</td>
                              <td className="border border-slate-300 p-2">{p.type || '-'}</td>
                              <td className="border border-slate-300 p-2">{areaLabels[p.area]}</td>
                              <td className="border border-slate-300 p-2">{statusLabels[p.status]}</td>
                              <td className="border border-slate-300 p-2 text-right">
                                {p.value ? `R$ ${p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {clientFinancial.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 text-lg">Movimentação Financeira</h4>
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 p-2 text-left">Data</th>
                            <th className="border border-slate-300 p-2 text-left">Tipo</th>
                            <th className="border border-slate-300 p-2 text-left">Descrição</th>
                            <th className="border border-slate-300 p-2 text-right">Valor</th>
                            <th className="border border-slate-300 p-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clientFinancial.slice(0, 10).map(f => (
                            <tr key={f.id}>
                              <td className="border border-slate-300 p-2">
                                {f.date && format(new Date(f.date), 'dd/MM/yyyy')}
                              </td>
                              <td className="border border-slate-300 p-2">
                                {f.type === 'entrada' ? 'Entrada' : 'Despesa'}
                              </td>
                              <td className="border border-slate-300 p-2">{f.description || '-'}</td>
                              <td className="border border-slate-300 p-2 text-right">
                                R$ {f.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="border border-slate-300 p-2 text-center">{f.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Financial Report */}
        {activeTab === 'financeiro' && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Relatório Financeiro</h2>
            
            <div className="mb-8 no-break">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Receitas vs Despesas (Mensal)</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="border border-slate-700 p-3 text-left">Mês</th>
                    <th className="border border-slate-700 p-3 text-right">Receitas</th>
                    <th className="border border-slate-700 p-3 text-right">Despesas</th>
                    <th className="border border-slate-700 p-3 text-right">Lucro</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyFinancialData.map((m, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                      <td className="border border-slate-300 p-2 capitalize">{m.month}</td>
                      <td className="border border-slate-300 p-2 text-right text-green-700 font-semibold">
                        R$ {m.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border border-slate-300 p-2 text-right text-red-700 font-semibold">
                        R$ {m.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`border border-slate-300 p-2 text-right font-bold ${m.lucro >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                        R$ {m.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-900 text-white font-bold">
                    <td className="border border-slate-700 p-3">TOTAL</td>
                    <td className="border border-slate-700 p-3 text-right">
                      R$ {monthlyFinancialData.reduce((s, m) => s + m.receitas, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border border-slate-700 p-3 text-right">
                      R$ {monthlyFinancialData.reduce((s, m) => s + m.despesas, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border border-slate-700 p-3 text-right">
                      R$ {monthlyFinancialData.reduce((s, m) => s + m.lucro, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {expensesByCategory.length > 0 && (
              <div className="no-break">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Despesas por Categoria</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="border border-slate-700 p-3 text-left">Categoria</th>
                      <th className="border border-slate-700 p-3 text-right">Valor</th>
                      <th className="border border-slate-700 p-3 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expensesByCategory.map((cat, i) => {
                      const total = expensesByCategory.reduce((s, c) => s + c.value, 0);
                      const percent = (cat.value / total * 100).toFixed(1);
                      return (
                        <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                          <td className="border border-slate-300 p-2">{cat.name}</td>
                          <td className="border border-slate-300 p-2 text-right font-semibold">
                            R$ {cat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="border border-slate-300 p-2 text-right">{percent}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Processes Report */}
        {activeTab === 'processos' && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Relatório de Processos</h2>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="no-break">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Por Área</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="border border-slate-700 p-3 text-left">Área</th>
                      <th className="border border-slate-700 p-3 text-right">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processesByArea.map((area, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                        <td className="border border-slate-300 p-2">{area.name}</td>
                        <td className="border border-slate-300 p-2 text-right font-semibold">{area.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="no-break">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Por Status</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="border border-slate-700 p-3 text-left">Status</th>
                      <th className="border border-slate-700 p-3 text-right">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processesByStatus.map((status, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                        <td className="border border-slate-300 p-2">{status.name}</td>
                        <td className="border border-slate-300 p-2 text-right font-semibold">{status.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Visits Report */}
        {activeTab === 'visitas' && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Relatório de Visitas</h2>
            
            <div className="no-break mb-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Origem das Visitas</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="border border-slate-700 p-3 text-left">Origem</th>
                    <th className="border border-slate-700 p-3 text-right">Quantidade</th>
                    <th className="border border-slate-700 p-3 text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {visitsBySource.map((source, i) => {
                    const total = visitsBySource.reduce((s, v) => s + v.value, 0);
                    const percent = (source.value / total * 100).toFixed(1);
                    return (
                      <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                        <td className="border border-slate-300 p-2">{source.name}</td>
                        <td className="border border-slate-300 p-2 text-right font-semibold">{source.value}</td>
                        <td className="border border-slate-300 p-2 text-right">{percent}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Marketing Report */}
        {activeTab === 'marketing' && campaigns.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Relatório de Marketing</h2>
            
            <div className="no-break">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Performance das Campanhas</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="border border-slate-700 p-3 text-left">Campanha</th>
                    <th className="border border-slate-700 p-3 text-left">Plataforma</th>
                    <th className="border border-slate-700 p-3 text-right">Investido</th>
                    <th className="border border-slate-700 p-3 text-right">Leads</th>
                    <th className="border border-slate-700 p-3 text-right">CPL</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                      <td className="border border-slate-300 p-2">{c.name}</td>
                      <td className="border border-slate-300 p-2 capitalize">{c.platform}</td>
                      <td className="border border-slate-300 p-2 text-right font-semibold">
                        R$ {(c.spent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border border-slate-300 p-2 text-right">{c.leads || 0}</td>
                      <td className="border border-slate-300 p-2 text-right">
                        {c.leads && c.spent ? `R$ ${(c.spent / c.leads).toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-slate-300 text-center text-sm text-slate-600">
          <p>CASSIANO'S ADVOCACIA • Documento gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</p>
        </div>
      </div>
    </div>
  );
}