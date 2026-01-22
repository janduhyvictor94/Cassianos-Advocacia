import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import CampaignModal from '@/components/modals/CampaignModal';
import PeriodFilter from '@/components/ui/PeriodFilter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MoreVertical,
  Pencil,
  Trash2,
  Megaphone,
  DollarSign,
  MousePointer,
  Users,
  Target,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const platformLabels = {
  google_ads: 'Google Ads',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  outros: 'Outros'
};

const platformColors = {
  google_ads: 'bg-blue-100 text-blue-800',
  facebook: 'bg-indigo-100 text-indigo-800',
  instagram: 'bg-pink-100 text-pink-800',
  tiktok: 'bg-gray-800 text-white',
  linkedin: 'bg-sky-100 text-sky-800',
  youtube: 'bg-red-100 text-red-800',
  outros: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  planejada: 'Planejada',
  ativa: 'Ativa',
  pausada: 'Pausada',
  finalizada: 'Finalizada'
};

const statusColors = {
  planejada: 'bg-gray-100 text-gray-800',
  ativa: 'bg-green-100 text-green-800',
  pausada: 'bg-yellow-100 text-yellow-800',
  finalizada: 'bg-blue-100 text-blue-800'
};

export default function Campaigns() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [periodFilter, setPeriodFilter] = useState({ 
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), 
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    type: 'current_month' 
  });

  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-start_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Campaign.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setModalOpen(false);
      setSelectedCampaign(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Campaign.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setModalOpen(false);
      setSelectedCampaign(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Campaign.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    }
  });

  const handleSave = (data) => {
    if (selectedCampaign) {
      updateMutation.mutate({ id: selectedCampaign.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setModalOpen(true);
  };

  const handleDelete = (campaign) => {
    setCampaignToDelete(campaign);
    setDeleteDialogOpen(true);
  };

  // Calculate stats based on period filter
  const periodCampaigns = campaigns.filter(c => {
    const matchesPeriod = !periodFilter.start || !periodFilter.end || 
      (c.start_date >= periodFilter.start && c.start_date <= periodFilter.end);
    return matchesPeriod;
  });
  
  const totalBudget = periodCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalSpent = periodCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
  const totalLeads = periodCampaigns.reduce((sum, c) => sum + (c.leads || 0), 0);
  const totalClicks = periodCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const activeCampaigns = periodCampaigns.filter(c => c.status === 'ativa').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Campanhas"
          subtitle="Gestão de tráfego pago e marketing"
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <PeriodFilter value={periodFilter} onChange={setPeriodFilter} />
          <Button 
            onClick={() => {
              setSelectedCampaign(null);
              setModalOpen(true);
            }}
            className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Campanha
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {[1,2,3,4].map(i => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Campanhas Ativas"
              value={activeCampaigns}
              icon={Megaphone}
            />
            <StatCard
              title="Investimento Total"
              value={`R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
            />
            <StatCard
              title="Total de Leads"
              value={totalLeads}
              icon={Users}
            />
            <StatCard
              title="Total de Cliques"
              value={totalClicks.toLocaleString('pt-BR')}
              icon={MousePointer}
            />
          </>
        )}
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="p-6">
              <Skeleton className="h-32 w-full" />
            </Card>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <Megaphone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-1">Nenhuma campanha cadastrada</h3>
          <p className="text-gray-400">
            Comece criando sua primeira campanha de marketing
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {periodCampaigns.map(campaign => {
            const budgetProgress = campaign.budget ? (campaign.spent / campaign.budget) * 100 : 0;
            const ctr = campaign.impressions ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : 0;
            const cpl = campaign.leads && campaign.spent ? (campaign.spent / campaign.leads).toFixed(2) : 0;

            return (
              <Card key={campaign.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={platformColors[campaign.platform]}>
                        {platformLabels[campaign.platform]}
                      </Badge>
                      <Badge className={statusColors[campaign.status]}>
                        {statusLabels[campaign.status]}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-[#1a1a1a] text-lg">{campaign.name}</h3>
                    <p className="text-sm text-gray-500">
                      {campaign.start_date && format(new Date(campaign.start_date), 'dd/MM/yyyy')}
                      {campaign.end_date && ` - ${format(new Date(campaign.end_date), 'dd/MM/yyyy')}`}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(campaign)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(campaign)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Budget Progress */}
                {campaign.budget > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Orçamento</span>
                      <span className="font-medium">
                        R$ {(campaign.spent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / 
                        R$ {campaign.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Progress value={Math.min(budgetProgress, 100)} className="h-2" />
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#1a1a1a]">{campaign.impressions?.toLocaleString('pt-BR') || 0}</p>
                    <p className="text-xs text-gray-500">Impressões</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#1a1a1a]">{campaign.clicks?.toLocaleString('pt-BR') || 0}</p>
                    <p className="text-xs text-gray-500">Cliques</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#1a1a1a]">{campaign.leads || 0}</p>
                    <p className="text-xs text-gray-500">Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#1a1a1a]">{ctr}%</p>
                    <p className="text-xs text-gray-500">CTR</p>
                  </div>
                </div>

                {cpl > 0 && (
                  <div className="mt-4 pt-4 border-t text-center">
                    <p className="text-sm text-gray-500">Custo por Lead</p>
                    <p className="text-xl font-bold text-[#c9a962]">R$ {cpl}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <CampaignModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCampaign(null);
        }}
        onSave={handleSave}
        campaign={selectedCampaign}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a campanha "{campaignToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteMutation.mutate(campaignToDelete?.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}