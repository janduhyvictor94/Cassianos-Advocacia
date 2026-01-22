import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Scale, Clock } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// Correção aqui: Importamos Process de entities, não base44 direto
import { Process } from '@/api/entities'; 
import { motion, AnimatePresence } from 'framer-motion';

export default function ProcessReviewAlert({ processes }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    // Correção aqui: Usamos Process.update
    mutationFn: ({ id, data }) => Process.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
    }
  });

  // Processos que precisam de revisão (30+ dias sem atualização)
  const processesNeedingReview = React.useMemo(() => {
    const today = new Date();
    return processes.filter(p => {
      // Se nunca foi revisado, usar a data de criação
      const lastReviewDate = p.last_review_date 
        ? parseISO(p.last_review_date) 
        : p.created_date ? parseISO(p.created_date) : null;
      
      if (!lastReviewDate) return false;
      
      const daysSinceReview = differenceInDays(today, lastReviewDate);
      return daysSinceReview >= 30 && p.status !== 'arquivado';
    }).sort((a, b) => {
      const dateA = a.last_review_date ? parseISO(a.last_review_date) : parseISO(a.created_date);
      const dateB = b.last_review_date ? parseISO(b.last_review_date) : parseISO(b.created_date);
      return dateA - dateB; // Mais antigos primeiro
    });
  }, [processes]);

  const handleMarkAsReviewed = (process) => {
    updateMutation.mutate({
      id: process.id,
      data: {
        last_review_date: format(new Date(), 'yyyy-MM-dd')
      }
    });
  };

  const getDaysSinceReview = (process) => {
    const lastReviewDate = process.last_review_date 
      ? parseISO(process.last_review_date) 
      : process.created_date ? parseISO(process.created_date) : null;
    
    if (!lastReviewDate) return 0;
    return differenceInDays(new Date(), lastReviewDate);
  };

  if (processesNeedingReview.length === 0) {
    return (
      <Card className="shadow-lg border border-slate-200/80 rounded-2xl bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm col-span-2">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            Processos Atualizados
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Tudo em dia!</h3>
          <p className="text-slate-500 text-sm text-center max-w-md">
            Todos os processos foram revisados nos últimos 30 dias. Continue o bom trabalho!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border border-orange-200/80 rounded-2xl bg-gradient-to-br from-orange-50 to-white backdrop-blur-sm col-span-2">
      <CardHeader className="border-b border-orange-100">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md animate-pulse">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-slate-900">Processos Precisam de Revisão</span>
              <p className="text-xs font-normal text-slate-500 mt-0.5">
                {processesNeedingReview.length} processo(s) sem atualização há mais de 30 dias
              </p>
            </div>
          </div>
          <Badge className="bg-orange-500 text-white">
            {processesNeedingReview.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          <div className="space-y-3">
            {processesNeedingReview.map((process) => {
              const daysSinceReview = getDaysSinceReview(process);
              
              return (
                <motion.div
                  key={process.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl p-4 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                        <Scale className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm mb-1 truncate">
                          {process.number}
                        </h4>
                        <p className="text-xs text-slate-600 mb-2 truncate">
                          {process.client_name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            Há {daysSinceReview} dias sem atualização
                          </span>
                        </div>
                        {process.last_review_date && (
                          <p className="text-xs text-slate-400 mt-1">
                            Última revisão: {format(parseISO(process.last_review_date), 'dd/MM/yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleMarkAsReviewed(process)}
                      disabled={updateMutation.isPending}
                      className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Marcar como Revisado
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}