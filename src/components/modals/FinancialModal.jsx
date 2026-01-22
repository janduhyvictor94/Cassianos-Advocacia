import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

const categories = [
  { value: 'honorarios', label: 'Honorários' },
  { value: 'custas_processuais', label: 'Custas Processuais' },
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'salarios', label: 'Salários' },
  { value: 'materiais', label: 'Materiais' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'impostos', label: 'Impostos' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'outros', label: 'Outros' },
];

const paymentMethods = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_credito_parcelado', label: 'Cartão de Crédito Parcelado' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'cheque', label: 'Cheque' },
];

export default function FinancialModal({ open, onClose, onSave, financial, clients, processes, isLoading }) {
  const [formData, setFormData] = useState({
    type: 'entrada',
    category: 'honorarios',
    description: '',
    value: '',
    date: '',
    due_date: '',
    client_id: '',
    client_name: '',
    process_id: '',
    process_number: '',
    status: 'pendente',
    payment_method: 'pix',
    installments: '1',
    notes: ''
  });

  useEffect(() => {
    if (financial) {
      setFormData(financial);
    } else {
      setFormData({
        type: 'entrada',
        category: 'honorarios',
        description: '',
        value: '',
        date: new Date().toISOString().split('T')[0],
        due_date: '',
        client_id: '',
        client_name: '',
        process_id: '',
        process_number: '',
        status: 'pendente',
        payment_method: 'pix',
        installments: '1',
        notes: ''
      });
    }
  }, [financial, open]);

  const handleClientChange = (clientId) => {
    const client = clients?.find(c => c.id === clientId);
    setFormData({
      ...formData,
      client_id: clientId,
      client_name: client?.name || ''
    });
  };

  const handleProcessChange = (processId) => {
    const process = processes?.find(p => p.id === processId);
    setFormData({
      ...formData,
      process_id: processId,
      process_number: process?.number || ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const baseData = {
      ...formData,
      value: parseFloat(formData.value)
    };
    
    // Se for cartão de crédito parcelado, passar flag especial
    if (formData.payment_method === 'cartao_credito_parcelado') {
      onSave({
        ...baseData,
        isInstallmentPayment: true,
        installments: parseInt(formData.installments) || 1
      });
    } else {
      onSave(baseData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1a1a1a]">
            {financial ? 'Editar Lançamento' : 'Novo Lançamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 pb-2 border-b flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c9a962] rounded"></div>
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700 font-medium">Tipo *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label className="text-gray-700 font-medium">Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Breve descrição do lançamento"
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                required
                placeholder="0,00"
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Data *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Data de Vencimento</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 pb-2 border-b flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c9a962] rounded"></div>
              Detalhes Adicionais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700 font-medium">Forma de Pagamento</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={(value) => setFormData({...formData, payment_method: value})}
              >
                <SelectTrigger className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {paymentMethods.map(method => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.payment_method === 'cartao_credito_parcelado' && (
              <div>
                <Label className="text-gray-700 font-medium">Número de Parcelas *</Label>
                <Input
                  type="number"
                  min="2"
                  max="12"
                  value={formData.installments}
                  onChange={(e) => setFormData({...formData, installments: e.target.value})}
                  required
                  className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                />
              </div>
            )}

            <div>
              <Label className="text-gray-700 font-medium">Cliente</Label>
              <Select 
                value={formData.client_id} 
                onValueChange={handleClientChange}
              >
                <SelectTrigger className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]">
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {clients?.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Processo</Label>
              <Select 
                value={formData.process_id} 
                onValueChange={handleProcessChange}
              >
                <SelectTrigger className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]">
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {processes?.map(process => (
                    <SelectItem key={process.id} value={process.id}>
                      {process.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label className="text-gray-700 font-medium">Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                rows={2}
                placeholder="Informações adicionais..."
              />
            </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-300 hover:bg-gray-50">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white px-6"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {financial ? 'Salvar Alterações' : 'Criar Lançamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}