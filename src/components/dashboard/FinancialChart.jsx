import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function FinancialChart({ financial }) {
  const monthlyData = React.useMemo(() => {
    const last6Months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      const income = financial
        .filter(f => f.type === 'entrada' && f.status === 'pago' && f.date?.startsWith(monthKey))
        .reduce((sum, f) => sum + (f.value || 0), 0);
      
      const expenses = financial
        .filter(f => f.type === 'despesa' && f.status === 'pago' && f.date?.startsWith(monthKey))
        .reduce((sum, f) => sum + (f.value || 0), 0);
      
      last6Months.push({
        month: monthName,
        Receitas: income,
        Despesas: expenses,
        Lucro: income - expenses
      });
    }
    
    return last6Months;
  }, [financial]);

  return (
    <Card className="shadow-lg border border-slate-200/80 rounded-2xl bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg font-semibold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          Receitas vs Despesas (6 meses)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="Receitas" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Despesas" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}