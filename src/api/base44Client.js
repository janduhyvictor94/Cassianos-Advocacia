import { Client, Process, Financial, Appointment, Campaign, Notice, Visit, User } from './entities';
import * as Integrations from './integrations';

// Este arquivo serve como uma "ponte" para que as páginas antigas
// continuem funcionando usando a estrutura nova do Supabase.

export const base44 = {
  entities: {
    Client,
    Process,
    // Se o sistema tentar usar ProcessUpdate, usamos o Process padrão por enquanto
    ProcessUpdate: Process, 
    Financial,
    Appointment,
    Campaign,
    Notice,
    Visit
  },
  auth: User,
  integrations: {
    Core: Integrations
  }
};