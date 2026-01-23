import React, { useState, useEffect } from "react";
import { Notice, Appointment } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Bell, 
  Plus, 
  Trash2, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Check, 
  RotateCcw,
  Pencil // Ícone de Edição
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Estado para saber se estamos editando
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info",
    date: new Date().toISOString().split('T')[0]
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchNotices();
  }, []);

  // Reseta o formulário quando o modal fecha ou abre
  const handleOpenChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setFormData({ 
        title: "", 
        content: "", 
        type: "info", 
        date: new Date().toISOString().split('T')[0] 
      });
    }
  };

  const fetchNotices = async () => {
    try {
      const data = await Notice.list();
      setNotices(data);
    } catch (error) {
      console.error("Erro ao buscar avisos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (notice) => {
    setEditingId(notice.id);
    setFormData({
      title: notice.title,
      content: notice.content,
      type: notice.type,
      // Garante que a data venha no formato yyyy-mm-dd para o input type="date"
      date: notice.date ? notice.date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };

      if (editingId) {
        // --- MODO EDIÇÃO ---
        await Notice.update(editingId, payload);
        toast({
          title: "Aviso Atualizado",
          description: "As alterações foram salvas com sucesso.",
          className: "bg-blue-600 text-white border-none",
          duration: 3000,
        });
      } else {
        // --- MODO CRIAÇÃO ---
        await Notice.create({ ...payload, status: 'ativo' });
        
        // Só cria compromisso na agenda se for um NOVO aviso
        await Appointment.create({
          title: `LEMBRETE: ${formData.title}`,
          date: formData.date,
          time: '08:00',
          type: 'prazo',
          status: 'agendado',
          client_name: 'Interno',
          observation: formData.content
        });

        toast({
          title: "Aviso Publicado e Agendado",
          description: "O aviso aparece no Dashboard e na Agenda do dia.",
          className: "bg-green-600 text-white border-none",
          duration: 3000,
        });
      }
      
      handleOpenChange(false); // Fecha e limpa
      fetchNotices();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Verifique sua conexão e tente novamente.",
        duration: 3000,
      });
    }
  };

  const handleMarkAsDone = async (id) => {
    try {
      await Notice.update(id, { status: 'concluido' });
      toast({
        title: "Aviso Concluído",
        description: "Este aviso saiu do Dashboard.",
        className: "bg-blue-600 text-white border-none",
        duration: 3000,
      });
      fetchNotices();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro ao atualizar", duration: 3000 });
    }
  };

  const handleMarkAsUndone = async (id) => {
    try {
      await Notice.update(id, { status: 'ativo' });
      toast({
        title: "Aviso Reativado",
        description: "O aviso voltou para o Dashboard.",
        className: "bg-amber-600 text-white border-none",
        duration: 3000,
      });
      fetchNotices();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro ao atualizar", duration: 3000 });
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir este aviso permanentemente?")) {
      try {
        await Notice.delete(id);
        toast({ title: "Aviso removido", duration: 3000 });
        fetchNotices();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getPriorityColor = (type) => {
    switch (type) {
      case "urgent": return "bg-red-500/10 text-red-600 border-red-200";
      case "warning": return "bg-amber-500/10 text-amber-600 border-amber-200";
      default: return "bg-blue-500/10 text-blue-600 border-blue-200";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "urgent": return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "warning": return <Bell className="w-5 h-5 text-amber-600" />;
      default: return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quadro de Avisos</h1>
          <p className="text-slate-500 mt-1">Comunicações internas e lembretes importantes.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-[#1a1a1a] hover:bg-[#c9a962] hover:text-[#1a1a1a] transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Novo Aviso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Aviso" : "Publicar Novo Aviso"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Título</label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Pagar Guia do Processo X"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Data da Pendência</label>
                <Input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Prioridade</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="info">Informação Geral</option>
                  <option value="warning">Atenção</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Mensagem</label>
                <Textarea 
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Digite os detalhes..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-[#1a1a1a] hover:bg-[#c9a962] hover:text-[#1a1a1a]">
                {editingId ? "Salvar Alterações" : "Publicar e Agendar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Carregando avisos...</div>
      ) : notices.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">Nenhum aviso por enquanto</h3>
          <p className="text-slate-500">Clique em "Novo Aviso" para começar.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notices.map((notice) => {
            const isCompleted = notice.status === 'concluido';
            
            return (
              <Card 
                key={notice.id} 
                className={cn(
                  "group hover:shadow-lg transition-all border-l-4", 
                  isCompleted ? "opacity-60 border-l-gray-300 bg-gray-50" : "border-l-[#c9a962]"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className={cn("p-2 rounded-lg", isCompleted ? "bg-gray-200 text-gray-500" : getPriorityColor(notice.type))}>
                      {getIcon(notice.type)}
                    </div>
                    <div className="flex gap-1">
                      {/* Botão de Check / Uncheck */}
                      {!isCompleted ? (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-300 hover:text-green-600 hover:bg-green-50"
                          title="Marcar como Realizado"
                          onClick={() => handleMarkAsDone(notice.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-300 hover:text-amber-600 hover:bg-amber-50"
                          title="Reativar"
                          onClick={() => handleMarkAsUndone(notice.id)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}

                      {/* Botão de Editar (Adicionado de volta) */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-300 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Editar"
                        onClick={() => handleEdit(notice)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      
                      {/* Botão de Excluir */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Excluir Permanentemente"
                        onClick={() => handleDelete(notice.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className={cn("mt-4 text-lg", isCompleted && "line-through text-gray-500")}>
                    {notice.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3" />
                    {notice.date 
                      ? format(new Date(notice.date), "dd 'de' MMMM", { locale: ptBR })
                      : "Data não definida"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {notice.content}
                  </p>
                  {isCompleted && (
                    <p className="text-xs text-green-600 font-bold mt-3 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Realizado
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notices;