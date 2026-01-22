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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from 'lucide-react';

const types = [
  { value: 'audiencia', label: 'Audiência' },
  { value: 'reuniao', label: 'Reunião' },
  { value: 'prazo', label: 'Prazo' },
  { value: 'consulta', label: 'Consulta' },
  { value: 'pericia', label: 'Perícia' },
  { value: 'diligencia', label: 'Diligência' },
  { value: 'outros', label: 'Outros' },
];

const statuses = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'realizado', label: 'Realizado' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'remarcado', label: 'Remarcado' },
];

export default function AppointmentModal({ open, onClose, onSave, appointment, clients, processes, isLoading }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'reuniao',
    client_id: '',
    client_name: '',
    process_id: '',
    process_number: '',
    date: '',
    time: '',
    location: '',
    description: '',
    status: 'agendado',
    reminder: true
  });

  useEffect(() => {
    if (appointment) {
      setFormData(appointment);
    } else {
      setFormData({
        title: '',
        type: 'reuniao',
        client_id: '',
        client_name: '',
        process_id: '',
        process_number: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        location: '',
        description: '',
        status: 'agendado',
        reminder: true
      });
    }
  }, [appointment, open]);

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
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1a1a1a]">
            {appointment ? 'Editar Compromisso' : 'Novo Compromisso'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 pb-2 border-b flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c9a962] rounded"></div>
              Informações do Compromisso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className="text-gray-700 font-medium">Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                placeholder="Ex: Audiência de Conciliação"
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

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
                  {types.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  {statuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label className="text-gray-700 font-medium">Horário</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

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
              <Label className="text-gray-700 font-medium">Local</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Ex: Fórum Central - Sala 301"
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-gray-700 font-medium">Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                rows={3}
                placeholder="Informações adicionais sobre o compromisso..."
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.reminder}
                onCheckedChange={(checked) => setFormData({...formData, reminder: checked})}
              />
              <Label className="text-gray-700 font-medium">Ativar lembrete</Label>
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
              {appointment ? 'Salvar Alterações' : 'Criar Compromisso'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}