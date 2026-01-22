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

const areas = [
  { value: 'civil', label: 'Civil' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'trabalhista', label: 'Trabalhista' },
  { value: 'tributario', label: 'Tributário' },
  { value: 'familia', label: 'Família' },
  { value: 'previdenciario', label: 'Previdenciário' },
  { value: 'empresarial', label: 'Empresarial' },
  { value: 'consumidor', label: 'Consumidor' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'outros', label: 'Outros' },
];

const statuses = [
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'aguardando_julgamento', label: 'Aguardando Julgamento' },
  { value: 'recurso', label: 'Recurso' },
  { value: 'arquivado', label: 'Arquivado' },
  { value: 'ganho', label: 'Ganho' },
  { value: 'perdido', label: 'Perdido' },
  { value: 'acordo', label: 'Acordo' },
];

export default function ProcessModal({ open, onClose, onSave, process, clients, isLoading }) {
  const [formData, setFormData] = useState({
    number: '',
    client_id: '',
    client_name: '',
    area: 'civil',
    type: '',
    court: '',
    judge: '',
    opposing_party: '',
    opposing_lawyer: '',
    status: 'em_andamento',
    value: '',
    fee_type: 'fixo',
    fee_value: '',
    start_date: '',
    description: '',
    notes: '',
    documents_link: ''
  });

  useEffect(() => {
    if (process) {
      setFormData(process);
    } else {
      setFormData({
        number: '',
        client_id: '',
        client_name: '',
        area: 'civil',
        type: '',
        court: '',
        judge: '',
        opposing_party: '',
        opposing_lawyer: '',
        status: 'em_andamento',
        value: '',
        fee_type: 'fixo',
        fee_value: '',
        start_date: new Date().toISOString().split('T')[0],
        description: '',
        notes: '',
        documents_link: ''
      });
    }
  }, [process, open]);

  const handleClientChange = (clientId) => {
    const client = clients?.find(c => c.id === clientId);
    setFormData({
      ...formData,
      client_id: clientId,
      client_name: client?.name || ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      value: formData.value ? parseFloat(formData.value) : null,
      fee_value: formData.fee_value ? parseFloat(formData.fee_value) : null
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1a1a1a]">
            {process ? 'Editar Processo' : 'Novo Processo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 pb-2 border-b flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c9a962] rounded"></div>
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 font-medium">Número do Processo *</Label>
                <Input
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  required
                  placeholder="0000000-00.0000.0.00.0000"
                  className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Cliente *</Label>
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

              <div>
                <Label className="text-gray-700 font-medium">Área do Direito *</Label>
                <Select 
                  value={formData.area} 
                  onValueChange={(value) => setFormData({...formData, area: value})}
                >
                  <SelectTrigger className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {areas.map(area => (
                      <SelectItem key={area.value} value={area.value}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Tipo de Ação</Label>
                <Input
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  placeholder="Ex: Ação de Cobrança"
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
                    {statuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Data de Início</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                />
              </div>
            </div>
          </div>

          {/* Informações da Ação */}
          <div>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 pb-2 border-b flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c9a962] rounded"></div>
              Informações da Ação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 font-medium">Tribunal/Vara</Label>
                <Input
                  value={formData.court}
                  onChange={(e) => setFormData({...formData, court: e.target.value})}
                  placeholder="Ex: 1ª Vara Cível"
                  className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Juiz(a) Responsável</Label>
                <Input
                  value={formData.judge}
                  onChange={(e) => setFormData({...formData, judge: e.target.value})}
                  placeholder="Nome do juiz"
                  className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Parte Contrária</Label>
                <Input
                  value={formData.opposing_party}
                  onChange={(e) => setFormData({...formData, opposing_party: e.target.value})}
                  placeholder="Nome da parte contrária"
                  className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Advogado da Parte Contrária</Label>
                <Input
                  value={formData.opposing_lawyer}
                  onChange={(e) => setFormData({...formData, opposing_lawyer: e.target.value})}
                  placeholder="Nome do advogado"
                  className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                />
              </div>
            </div>
          </div>

          {/* Valores e Honorários */}
          <div>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 pb-2 border-b flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c9a962] rounded"></div>
              Valores e Honorários
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-700 font-medium">Valor da Causa (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="0,00"
                  className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Tipo de Honorário</Label>
                <Select 
                  value={formData.fee_type} 
                  onValueChange={(value) => setFormData({...formData, fee_type: value})}
                >
                  <SelectTrigger className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="fixo">Valor Fixo</SelectItem>
                    <SelectItem value="percentual">Percentual</SelectItem>
                    <SelectItem value="exito">Honorários de Êxito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-700 font-medium">
                  {formData.fee_type === 'percentual' ? 'Percentual (%)' : 'Valor (R$)'}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.fee_value}
                  onChange={(e) => setFormData({...formData, fee_value: e.target.value})}
                  placeholder={formData.fee_type === 'percentual' ? '0,00%' : 'R$ 0,00'}
                  className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                />
              </div>
            </div>
          </div>

          {/* Descrição e Observações */}
          <div>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 pb-2 border-b flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c9a962] rounded"></div>
              Detalhes do Caso
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 font-medium">Descrição do Caso</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                  rows={3}
                  placeholder="Descreva os detalhes e o histórico do caso..."
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Observações</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                  rows={2}
                  placeholder="Observações adicionais, lembretes..."
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Link dos Documentos</Label>
                <Input
                  type="url"
                  value={formData.documents_link}
                  onChange={(e) => setFormData({...formData, documents_link: e.target.value})}
                  className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                  placeholder="https://drive.google.com/... ou outro link"
                />
                <p className="text-xs text-gray-500 mt-1">Link para pasta do Google Drive, Dropbox ou outro serviço</p>
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
              {process ? 'Salvar Alterações' : 'Cadastrar Processo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}