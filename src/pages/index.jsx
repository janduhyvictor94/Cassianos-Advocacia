import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Loader2 } from "lucide-react";

import Layout from "./Layout";
import Login from "./Login";

// Importação da Página Pública de Simulação (ADICIONADO)
import PublicHealthCalculator from "./PublicHealthCalculator";

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
import Calculations from "./Calculations"; // Nova página

// Componente que protege as rotas
const PrivateRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

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

  if (!session) {
    return <Navigate to="/login" replace />;
  }

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

        {/* Rota Pública (Simulação) - ADICIONADO PARA FUNCIONAR O LINK */}
        <Route path="/simulacao-saude" element={<PublicHealthCalculator />} />

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
          <Route path="calculations" element={<Calculations />} /> {/* Nova Rota */}
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