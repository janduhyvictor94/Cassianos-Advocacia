import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils"; // <--- ESTA LINHA É A QUE FALTAVA
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Scale,
  DollarSign,
  Calendar,
  Megaphone,
  Bell,
  Building,
  FileText,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { User } from "@/api/entities";
import { supabase } from "@/api/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

const Layout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();

  // --- OUVINTE DE ATUALIZAÇÕES (REALTIME) ---
  useEffect(() => {
    const channel = supabase
      .channel('process-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'processes' },
        (payload) => {
          // Tocar som (opcional)
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {}); // Ignora erro se navegador bloquear som

          // Mostrar alerta
          toast({
            title: "Processo Atualizado!",
            description: `O processo ${payload.new.number} acabou de sofrer alterações.`,
            className: "bg-[#1a1a1a] text-white border-[#c9a962]",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Clientes", icon: Users, path: "/clients" },
    { name: "Processos", icon: Scale, path: "/processes" },
    { name: "Agenda", icon: Calendar, path: "/appointments" },
    { name: "Avisos", icon: Bell, path: "/notices" },
    { name: "Financeiro", icon: DollarSign, path: "/financial" },
    { name: "Visitas", icon: Building, path: "/visits" },
    { name: "Campanhas", icon: Megaphone, path: "/campaigns" },
    { name: "Relatórios", icon: FileText, path: "/reports" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Overlay para Celular */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Barra Lateral (Menu) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-[#1a1a1a] text-white transition-transform duration-300 ease-in-out shadow-2xl flex flex-col",
          isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0",
          !isMobile && "relative"
        )}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c9a962]/50 to-transparent opacity-50"></div>
          
          <span className="text-xl font-bold text-white tracking-wide">
            Cassiano's <span className="text-[#c9a962]">Advocacia</span>
          </span>
          
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto text-gray-400 hover:text-white hover:bg-white/10"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (item.path !== "/" && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => isMobile && setIsSidebarOpen(false)}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
                  isActive 
                    ? "text-white bg-white/5 border border-white/5" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon 
                  className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    isActive ? "text-[#c9a962]" : "text-slate-500 group-hover:text-slate-300"
                  )} 
                />
                
                <span className="relative z-10">{item.name}</span>

                {isActive && (
                  <div className="absolute right-4 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] animate-pulse" />
                )}
                
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé do Menu */}
        <div className="p-4 border-t border-white/5 bg-gradient-to-t from-black/40 to-transparent">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 px-4 py-6 rounded-xl transition-all group border border-transparent hover:border-red-500/20"
            onClick={() => User.logout()} 
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-medium">Sair do Sistema</span>
          </Button>
          
          <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
              Versão 1.1.0
            </p>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        {/* Header Mobile */}
        {isMobile && (
          <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between sticky top-0 z-30 shadow-sm">
             <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
               <Menu className="w-6 h-6 text-slate-700" />
             </Button>
             <span className="font-semibold text-slate-900">Cassiano's Advocacia</span>
             <div className="w-6" />
          </header>
        )}

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;