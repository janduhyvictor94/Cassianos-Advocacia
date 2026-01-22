import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Loader2 } from "lucide-react";

import Layout from "./Layout";
import Login from "./Login"; // Nova página

// Importação das Páginas do Painel
import Dashboard from "./Dashboard";
import Clients from "./Clients";
import Processes from "./Processes";
import Financial from "./Financial";
import Appointments from "./Appointments";
import Campaigns from "./Campaigns";
import Notices from "./Notices";
import Visits from "./Visits";
import Reports from "./Reports";

// Componente que protege as rotas (O "Segurança" do site)
const PrivateRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuta mudanças (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <Loader2 className="w-8 h-8 text-[#c9a962] animate-spin" />
      </div>
    );
  }

  // Se não tem sessão, manda pro login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Se tem sessão, mostra o conteúdo
  return children;
};

const Pages = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Rota Pública (Login) */}
        <Route path="/login" element={<Login />} />

        {/* Rotas Privadas (Protegidas) */}
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="processes" element={<Processes />} />
          <Route path="financial" element={<Financial />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="notices" element={<Notices />} />
          <Route path="visits" element={<Visits />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Pages;