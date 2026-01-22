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

const platforms = [
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'outros', label: 'Outros' },
];

const objectives = [
  { value: 'leads', label: 'Geração de Leads' },
  { value: 'trafego', label: 'Tráfego' },
  { value: 'reconhecimento', label: 'Reconhecimento' },
  { value: 'conversao', label: 'Conversão' },
  { value: 'engajamento', label: 'Engajamento' },
];

const statuses = [
  { value: 'planejada', label: 'Planejada' },
  { value: 'ativa', label: 'Ativa' },
  { value: 'pausada', label: 'Pausada' },
  { value: 'finalizada', label: 'Finalizada' },
];

export default function CampaignModal({ open, onClose, onSave, campaign, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    platform: 'google_ads',
    objective: 'leads',
    start_date: '',
    end_date: '',
    budget: '',
    spent: '',
    impressions: '',
    clicks: '',
    leads: '',
    conversions: '',
    status: 'planejada',
    notes: ''
  });

  useEffect(() => {
    if (campaign) {
      setFormData(campaign);
    } else {
      setFormData({
        name: '',
        platform: 'google_ads',
        objective: 'leads',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        budget: '',
        spent: '',
        impressions: '',
        clicks: '',
        leads: '',
        conversions: '',
        status: 'planejada',
        notes: ''
      });
    }
  }, [campaign, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      spent: formData.spent ? parseFloat(formData.spent) : null,
      impressions: formData.impressions ? parseInt(formData.impressions) : null,
      clicks: formData.clicks ? parseInt(formData.clicks) : null,
      leads: formData.leads ? parseInt(formData.leads) : null,
      conversions: formData.conversions ? parseInt(formData.conversions) : null
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1a1a1a]">
            {campaign ? 'Editar Campanha' : 'Nova Campanha'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 pb-2 border-b flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c9a962] rounded"></div>
              Informações da Campanha
            </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className="text-gray-700 font-medium">Nome da Campanha *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Ex: Campanha Google Ads - Direito Trabalhista"
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Plataforma *</Label>
              <Select 
                value={formData.platform} 
                onValueChange={(value) => setFormData({...formData, platform: value})}
              >
                <SelectTrigger className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {platforms.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Objetivo</Label>
              <Select 
                value={formData.objective} 
                onValueChange={(value) => setFormData({...formData, objective: value})}
              >
                <SelectTrigger className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {objectives.map(o => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Data de Início *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                required
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Data de Término</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
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
                  {statuses.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 pb-2 border-b flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c9a962] rounded"></div>
              Orçamento e Investimento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700 font-medium">Orçamento (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                placeholder="0,00"
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Valor Gasto (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.spent}
                onChange={(e) => setFormData({...formData, spent: e.target.value})}
                placeholder="0,00"
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 pb-2 border-b flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c9a962] rounded"></div>
              Métricas de Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-gray-700 font-medium">Impressões</Label>
              <Input
                type="number"
                value={formData.impressions}
                onChange={(e) => setFormData({...formData, impressions: e.target.value})}
                placeholder="0"
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Cliques</Label>
              <Input
                type="number"
                value={formData.clicks}
                onChange={(e) => setFormData({...formData, clicks: e.target.value})}
                placeholder="0"
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Leads Gerados</Label>
              <Input
                type="number"
                value={formData.leads}
                onChange={(e) => setFormData({...formData, leads: e.target.value})}
                placeholder="0"
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium">Conversões</Label>
              <Input
                type="number"
                value={formData.conversions}
                onChange={(e) => setFormData({...formData, conversions: e.target.value})}
                placeholder="0"
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
              />
            </div>

            <div className="md:col-span-4">
              <Label className="text-gray-700 font-medium">Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="mt-1.5 bg-white border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]"
                rows={3}
                placeholder="Anotações sobre a campanha..."
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
              {campaign ? 'Salvar Alterações' : 'Criar Campanha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}