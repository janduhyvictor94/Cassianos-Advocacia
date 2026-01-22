import React, { useState } from 'react';
import { User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await User.login(email, password);
      navigate('/');
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Email ou senha incorretos. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#c9a962]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          
          {/* Logo / Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-[#c9a962] to-[#8a7035] rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-[#c9a962]/20 mb-6">
              <ShieldCheck className="w-8 h-8 text-[#1a1a1a]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Cassiano's Advocacia</h1>
            <p className="text-slate-400 text-sm">Acesso restrito ao sistema administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-300 ml-1">Email Corporativo</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <Input 
                  type="email" 
                  placeholder="admin@cassianos.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-[#0f0f0f] border-slate-700 text-slate-200 focus:border-[#c9a962] focus:ring-[#c9a962] h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 ml-1">Senha de Acesso</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-[#0f0f0f] border-slate-700 text-slate-200 focus:border-[#c9a962] focus:ring-[#c9a962] h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#c9a962] to-[#b08d45] hover:from-[#d4b46e] hover:to-[#be9b50] text-[#1a1a1a] font-bold h-12 rounded-xl text-md shadow-lg shadow-[#c9a962]/10 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Autenticando...
                </div>
              ) : (
                "Entrar no Sistema"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-600">
              © 2026 Cassiano's Advocacia. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}