import { supabase } from './supabaseClient';

// --- CONFIGURAÇÃO DE VALORES MONETÁRIOS ---
const MONEY_FIELDS = ['value', 'fee_value', 'budget', 'spent', 'amount'];

const sanitizeValue = (key, value) => {
  if (value === null || value === undefined || value === '') return value;

  if (MONEY_FIELDS.includes(key) && typeof value === 'string') {
    let clean = value.replace(/[^\d.,-]/g, '');
    if (clean.includes(',')) {
      clean = clean.replace(/\./g, '');
      clean = clean.replace(',', '.');
    }
    return parseFloat(clean);
  }
  return value;
};

const prepareData = (itemData) => {
  const cleanData = {};
  Object.keys(itemData).forEach(key => {
    const value = itemData[key];
    if (value !== null && value !== '' && value !== undefined) {
      cleanData[key] = sanitizeValue(key, value);
    }
  });
  return cleanData;
};

// --- GERENCIADOR DE TABELAS ---
const createEntityManager = (tableName) => ({
  list: async () => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || []; 
  },

  create: async (itemData) => {
    const cleanData = prepareData(itemData);
    const { data, error } = await supabase
      .from(tableName)
      .insert([cleanData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id, itemData) => {
    const cleanData = prepareData(itemData);
    const { data, error } = await supabase
      .from(tableName)
      .update(cleanData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
    return true;
  },
  
  get: async (id) => {
     const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
     if (error) throw error;
     return data;
  }
});

export const Client = createEntityManager('clients');
export const Process = createEntityManager('processes');
export const Financial = createEntityManager('financial');
export const Appointment = createEntityManager('appointments');
export const Campaign = createEntityManager('campaigns');
export const Notice = createEntityManager('notices');
export const Visit = createEntityManager('visits');

// --- AUTENTICAÇÃO REAL (SUPABASE) ---
export const User = {
  // Login real
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },
  
  // Logout real
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Força o reload para limpar estados da memória
    window.location.href = '/login';
    return true;
  },

  // Verificar sessão atual
  current: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  }
};