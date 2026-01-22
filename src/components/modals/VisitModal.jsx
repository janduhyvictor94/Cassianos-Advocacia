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

const purposes = [
  { value: 'consulta_inicial', label: 'Consulta Inicial' },
  { value: 'retorno', label: 'Retorno' },
  { value: 'entrega_documentos', label: 'Entrega de Documentos' },
  { value: 'assinatura', label: 'Assinatura' },
  { value: 'reuniao', label: 'Reunião' },
  { value: 'outros', label: 'Outros' },
];

const sources = [
  { value: 'indicacao', label: 'Indicação' },
  { value: 'google', label: 'Google' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'site', label: 'Site' },
  { value: 'outros', label: 'Outros' },
];

export default function VisitModal({ open, onClose, onSave, visit, clients, isLoading }) {
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_phone: '',
    visitor_email: '',
    date: '',
    time: '',
    purpose: 'consulta_inicial',
    client_id: '',
    is_new_client: true,
    source: 'indicacao',
    notes: '',
    converted: false,
    attended_by: ''
  });

  useEffect(() => {
    if (visit) {
      setFormData(visit);
    } else {
      setFormData({
        visitor_name: '',
        visitor_phone: '',
        visitor_email: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        purpose: 'consulta_inicial',
        client_id: '',
        is_new_client: true,
        source: 'indicacao',
        notes: '',
        converted: false,
        attended_by: ''
      });
    }
  }, [visit, open]);

  const handleClientChange = (clientId) => {
    const client = clients?.find(c => c.id === clientId);
    setFormData({
      ...formData,
      client_id: clientId,
      visitor_name: client?.name || formData.visitor_name,
      visitor_phone: client?.phone || formData.visitor_phone,
      visitor_email: client?.email || formData.visitor_email,
      is_new_client: false
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
            {visit ? 'Editar Visita' : 'Registrar Visita'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 pb-2 border-b flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c9a962] rounded"></div>
              Informações do Visitante
            </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_new_client}
                onCheckedChange={(checked) => setFormData({...formData, is_new_client: checked, client_id: ''})}
              />
              <Label className="text-gray-700 font-medium">Novo visitante</Label>
            </div>

            {!formData.is_new_client && (
              <div>
                <Label className="text-gray-700 font-medium">Cliente Existente</Label>
                <Select 
                  value={formData.client_id} 
                  onValueChange={handleClientChange}
                >
                  <SelectTrigger className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]">
                    <SelectValue placeholder="Selecione o cliente" />
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
            )}

            <div className={formData.is_new_client ? "md:col-span-2" : ""}>
              <Label className="text-gray-700 font-medium">Nome do Visitante *</Label>
              <Input
                value={formData.visitor_name}
                onChange={(e) => setFormData({...formData, visitor_name: e.target.value})}
                required
                placeholder="Nome completo"
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Telefone</Label>
              <Input
                value={formData.visitor_phone}
                onChange={(e) => setFormData({...formData, visitor_phone: e.target.value})}
                placeholder="(00) 00000-0000"
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">E-mail</Label>
              <Input
                type="email"
                value={formData.visitor_email}
                onChange={(e) => setFormData({...formData, visitor_email: e.target.value})}
                placeholder="email@exemplo.com"
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 pb-2 border-b flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c9a962] rounded"></div>
              Detalhes da Visita
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label className="text-gray-700 font-medium">Motivo da Visita *</Label>
              <Select 
                value={formData.purpose} 
                onValueChange={(value) => setFormData({...formData, purpose: value})}
              >
                <SelectTrigger className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {purposes.map(purpose => (
                    <SelectItem key={purpose.value} value={purpose.value}>
                      {purpose.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Como conheceu o escritório</Label>
              <Select 
                value={formData.source} 
                onValueChange={(value) => setFormData({...formData, source: value})}
              >
                <SelectTrigger className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {sources.map(source => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Atendido por</Label>
              <Input
                value={formData.attended_by}
                onChange={(e) => setFormData({...formData, attended_by: e.target.value})}
                placeholder="Nome do responsável"
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.converted}
                onCheckedChange={(checked) => setFormData({...formData, converted: checked})}
              />
              <Label className="text-gray-700 font-medium">Converteu em cliente</Label>
            </div>

            <div className="md:col-span-2">
              <Label className="text-gray-700 font-medium">Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                rows={3}
                placeholder="Informações adicionais sobre a visita..."
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
              {visit ? 'Salvar Alterações' : 'Registrar Visita'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}