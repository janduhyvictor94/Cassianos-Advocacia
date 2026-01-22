import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, Users, Scale, Calendar, DollarSign, Building2, Megaphone } from 'lucide-react';

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
    enabled: open
  });

  const { data: processes = [] } = useQuery({
    queryKey: ['processes'],
    queryFn: () => base44.entities.Process.list(),
    enabled: open
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list(),
    enabled: open
  });

  const { data: financial = [] } = useQuery({
    queryKey: ['financial'],
    queryFn: () => base44.entities.Financial.list(),
    enabled: open
  });

  const handleSelect = (type, item) => {
    setOpen(false);
    switch(type) {
      case 'client':
        navigate(createPageUrl('Clients'));
        break;
      case 'process':
        navigate(createPageUrl('Processes'));
        break;
      case 'appointment':
        navigate(createPageUrl('Appointments'));
        break;
      case 'financial':
        navigate(createPageUrl('Financial'));
        break;
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-white/5 w-full lg:w-64"
      >
        <Search className="w-4 h-4" />
        <span>Buscar...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar clientes, processos, compromissos..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          
          <CommandGroup heading="Clientes">
            {clients.slice(0, 5).map((client) => (
              <CommandItem
                key={client.id}
                value={client.name}
                onSelect={() => handleSelect('client', client)}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>{client.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Processos">
            {processes.slice(0, 5).map((process) => (
              <CommandItem
                key={process.id}
                value={process.number}
                onSelect={() => handleSelect('process', process)}
              >
                <Scale className="mr-2 h-4 w-4" />
                <span>{process.number} - {process.client_name}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Compromissos">
            {appointments.slice(0, 5).map((apt) => (
              <CommandItem
                key={apt.id}
                value={apt.title}
                onSelect={() => handleSelect('appointment', apt)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span>{apt.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}