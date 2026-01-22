import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale } from 'lucide-react';

const COLORS = {
  em_andamento: '#3b82f6',
  aguardando_julgamento: '#eab308',
  recurso: '#f97316',
  arquivado: '#6b7280',
  ganho: '#10b981',
  perdido: '#ef4444',
  acordo: '#8b5cf6'
};

const statusLabels = {
  em_andamento: 'Em Andamento',
  aguardando_julgamento: 'Aguardando',
  recurso: 'Recurso',
  arquivado: 'Arquivado',
  ganho: 'Ganho',
  perdido: 'Perdido',
  acordo: 'Acordo'
};

export default function ProcessStatusChart({ processes }) {
  const chartData = React.useMemo(() => {
    const statusCount = {};
    processes.forEach(p => {
      statusCount[p.status] = (statusCount[p.status] || 0) + 1;
    });
    
    return Object.entries(statusCount).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
      color: COLORS[status] || '#6b7280'
    }));
  }, [processes]);

  return (
    <Card className="shadow-lg border border-slate-200/80 rounded-2xl bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg font-semibold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Scale className="w-5 h-5 text-white" />
          </div>
          Processos por Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}