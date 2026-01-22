import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import Pages from "@/pages/index.jsx";
import { Toaster } from "@/components/ui/toaster";

// Cria o cliente que gerencia o cache e as requisições de dados
const queryClient = new QueryClient();

function App() {
  return (
    // Envolvemos o app inteiro com o Provedor do Query
    <QueryClientProvider client={queryClient}>
      <Pages />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;