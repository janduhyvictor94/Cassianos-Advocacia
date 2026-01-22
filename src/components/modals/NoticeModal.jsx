import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const priorities = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' }
];

const categories = [
  { value: 'prazo', label: 'Prazo' },
  { value: 'audiencia', label: 'Audiência' },
  { value: 'reuniao', label: 'Reunião' },
  { value: 'pagamento', label: 'Pagamento' },
  { value: 'documento', label: 'Documento' },
  { value: 'outros', label: 'Outros' }
];

const statuses = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'concluido', label: 'Concluído' }
];

export default function NoticeModal({ open, onClose, onSave, notice, clients = [], processes = [], isLoading }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    priority: 'media',
    category: 'prazo',
    status: 'pendente',
    client_id: '',
    client_name: '',
    process_id: '',
    process_number: ''
  });

  useEffect(() => {
    if (notice) {
      setFormData(notice);
    } else {
      setFormData({
        title: '',
        description: '',
        date: '',
        priority: 'media',
        category: 'prazo',
        status: 'pendente',
        client_id: '',
        client_name: '',
        process_id: '',
        process_number: ''
      });
    }
  }, [notice, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleClientChange = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    setFormData({
      ...formData,
      client_id: clientId,
      client_name: client?.name || ''
    });
  };

  const handleProcessChange = (processId) => {
    const process = processes.find(p => p.id === processId);
    setFormData({
      ...formData,
      process_id: processId,
      process_number: process?.number || ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-slate-200 shadow-2xl">
        <DialogHeader className="border-b border-slate-200 pb-6">
          <DialogTitle className="text-2xl font-semibold text-slate-900 tracking-tight">
            {notice ? 'Editar Aviso' : 'Novo Aviso'}
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-2">Preencha as informações do aviso abaixo</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Main Info */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700">Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="mt-1.5 bg-white border-gray-300 focus:border-[#1a1a1a] focus:ring-[#1a1a1a]"
                placeholder="Ex: Prazo para recurso no processo X"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Data *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="mt-1.5 bg-white border-gray-300 focus:border-[#1a1a1a] focus:ring-[#1a1a1a]"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Prioridade</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                  <SelectTrigger className="mt-1.5 bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {priorities.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="mt-1.5 bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categories.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Related Info */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-700">Relacionamento (Opcional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Cliente</Label>
                <Select value={formData.client_id} onValueChange={handleClientChange}>
                  <SelectTrigger className="mt-1.5 bg-white border-gray-300">
                    <SelectValue placeholder="Nenhum cliente selecionado" />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60">
                    <SelectItem value={null}>Nenhum</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Processo</Label>
                <Select value={formData.process_id} onValueChange={handleProcessChange}>
                  <SelectTrigger className="mt-1.5 bg-white border-gray-300">
                    <SelectValue placeholder="Nenhum processo selecionado" />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60">
                    <SelectItem value={null}>Nenhum</SelectItem>
                    {processes.map(process => (
                      <SelectItem key={process.id} value={process.id}>{process.number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label className="text-sm font-semibold text-gray-700">Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1.5 bg-white border-gray-300 focus:border-[#1a1a1a] focus:ring-[#1a1a1a]"
                placeholder="Adicione detalhes importantes sobre este aviso..."
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white px-6"
            >
              {isLoading ? 'Salvando...' : notice ? 'Atualizar Aviso' : 'Criar Aviso'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}