import { supabase } from './supabaseClient';

// Função auxiliar para criar um "gerenciador" padrão para cada tabela
const createEntityManager = (tableName) => ({
  // Buscar lista (com filtros opcionais)
  list: async () => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    // CORREÇÃO: Retorna o array direto, sem envolver em { data: ... }
    return data || []; 
  },

  // Criar novo item
  create: async (itemData) => {
    // Remove campos vazios ou undefined para não dar erro
    const cleanData = Object.fromEntries(
      Object.entries(itemData).filter(([_, v]) => v != null && v !== '')
    );

    const { data, error } = await supabase
      .from(tableName)
      .insert([cleanData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar item existente
  update: async (id, itemData) => {
    const { data, error } = await supabase
      .from(tableName)
      .update(itemData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Deletar item
  delete: async (id) => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
  
  // Buscar um item específico
  get: async (id) => {
     const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
      
     if (error) throw error;
     return data;
  }
});

// Exporta as entidades conectadas às tabelas que criamos no SQL
export const Client = createEntityManager('clients');
export const Process = createEntityManager('processes');
export const Financial = createEntityManager('financial');
export const Appointment = createEntityManager('appointments');
export const Campaign = createEntityManager('campaigns');
export const Notice = createEntityManager('notices');
export const Visit = createEntityManager('visits');

// Auth Simulado (Para não quebrar o login por enquanto)
export const User = {
  login: async () => ({ user: { id: 1, name: 'Admin' }, token: 'mock-token' }),
  logout: async () => true,
  current: async () => ({ id: 1, name: 'Cassiano Advocacia' })
};