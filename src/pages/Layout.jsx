import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
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
import { base44 } from "@/api/base44Client"; // Importação para o botão de sair

const Layout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Lista de itens do menu lateral
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Clientes", icon: Users, path: "/clients" },
    { name: "Processos", icon: Scale, path: "/processes" },
    { name: "Financeiro", icon: DollarSign, path: "/financial" },
    { name: "Compromissos", icon: Calendar, path: "/appointments" },
    { name: "Campanhas", icon: Megaphone, path: "/campaigns" },
    { name: "Avisos", icon: Bell, path: "/notices" },
    { name: "Visitas", icon: Building, path: "/visits" },
    { name: "Relatórios", icon: FileText, path: "/reports" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fundo escuro para mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Menu Lateral (Sidebar) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1a1a] text-white transition-transform duration-300 ease-in-out shadow-xl",
          isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0",
          !isMobile && "relative"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Cabeçalho do Menu - ONDE ESTÁ O NOME */}
          <div className="h-16 flex items-center px-6 border-b border-gray-800 justify-between">
            <span className="text-xl font-bold text-[#c9a962]">
              Cassiano's Advocacia
            </span>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                             (item.path !== "/" && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-[#c9a962] text-[#1a1a1a]" 
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Rodapé do Menu */}
          <div className="p-4 border-t border-gray-800">
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={() => base44.auth.logout()} 
            >
              <LogOut className="w-5 h-5" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Cabeçalho Mobile */}
        {isMobile && (
          <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between sticky top-0 z-30">
             <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
               <Menu className="w-6 h-6 text-slate-700" />
             </Button>
             <span className="font-semibold text-slate-900">Cassiano's Advocacia</span>
             <div className="w-6" />
          </header>
        )}

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;