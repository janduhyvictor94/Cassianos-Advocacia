import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MessageCircle, User, MapPin, Calendar, DollarSign } from "lucide-react";

// Índices Históricos da ANS
const INDICES_ANS = {
  2026: 0, 2025: 6.06, 2024: 6.91, 2023: 9.63, 2022: 15.50, 
  2021: -8.19, 2020: 8.14, 2019: 7.35, 2018: 10.00, 
  2017: 13.55, 2016: 13.57, 2015: 13.55, 2014: 9.65, 
  2013: 9.04, 2012: 7.93, 2011: 7.69, 2010: 7.38
};

export default function PublicHealthCalculator() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    city: "",
    state: "",
    startYear: "",
    startValue: "",
    currentValue: ""
  });
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    // Validação simples
    if (!formData.name || !formData.age || !formData.city || !formData.state || 
        !formData.startYear || !formData.startValue || !formData.currentValue) {
      alert("Por favor, preencha todos os campos para realizar a simulação.");
      return;
    }

    const startYear = parseInt(formData.startYear);
    const startValue = parseFloat(formData.startValue);
    const currentValue = parseFloat(formData.currentValue);
    const currentYear = new Date().getFullYear();

    let correctValue = startValue;
    
    // Aplica os índices ano a ano
    for (let year = startYear + 1; year <= currentYear; year++) {
      const ansIndex = INDICES_ANS[year] !== undefined ? INDICES_ANS[year] : 0;
      correctValue = correctValue * (1 + (ansIndex / 100));
    }

    const monthlyDiff = Math.max(0, currentValue - correctValue);
    const retroactiveEst = monthlyDiff * 12 * 5; 

    setResult({
      correctValue,
      monthlyDiff,
      retroactiveEst
    });
    setStep(2);
  };

  const contactOffice = () => {
    // Mensagem Formatada e Completa
    const text = `*Nova Simulação de Plano de Saúde* 📋\n\n` +
                 `👤 *Cliente:* ${formData.name}\n` +
                 `🎂 *Idade:* ${formData.age} anos\n` +
                 `📍 *Local:* ${formData.city}/${formData.state}\n\n` +
                 `--- *DADOS DO PLANO* ---\n` +
                 `📅 Início: ${formData.startYear}\n` +
                 `💰 Valor Inicial: R$ ${formData.startValue}\n` +
                 `💸 Valor Atual (Cobrado): R$ ${formData.currentValue}\n\n` +
                 `--- *RESULTADO DA SIMULAÇÃO* ---\n` +
                 `✅ Valor Correto (Estimado): R$ ${result.correctValue.toFixed(2)}\n` +
                 `⚠️ Pagamento Indevido/Mês: R$ ${result.monthlyDiff.toFixed(2)}\n` +
                 `⚖️ Potencial da Causa: R$ ${result.retroactiveEst.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n` +
                 `Gostaria de uma análise detalhada do meu caso.`;
    
    // SEU NÚMERO (Com 55 do Brasil)
    const phone = "558738611314"; 
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#c9a962]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-lg relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#c9a962] mb-2 tracking-tight">Cassiano's Advocacia</h1>
          <p className="text-slate-400">Simulador de Revisão de Plano de Saúde</p>
        </div>

        <Card className="border-white/10 bg-[#1a1a1a]/90 backdrop-blur-xl text-white shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-lg font-medium text-slate-200">
              {step === 1 ? "Preencha seus dados para simular" : "Resultado da Análise Preliminar"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="space-y-4">
                
                {/* BLOCO 1: DADOS PESSOAIS */}
                <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/5">
                    <h3 className="text-xs font-bold text-[#c9a962] uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3 h-3" /> Dados Pessoais
                    </h3>
                    <div>
                        <Label className="text-slate-400 text-xs">Nome Completo</Label>
                        <Input 
                            className="bg-black/40 border-white/10 text-white mt-1 h-10"
                            placeholder="Seu nome"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <Label className="text-slate-400 text-xs">Idade</Label>
                            <Input 
                                type="number" 
                                className="bg-black/40 border-white/10 text-white mt-1 h-10"
                                placeholder="Anos"
                                value={formData.age}
                                onChange={e => setFormData({...formData, age: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label className="text-slate-400 text-xs">Cidade</Label>
                            <Input 
                                className="bg-black/40 border-white/10 text-white mt-1 h-10"
                                placeholder="Cidade"
                                value={formData.city}
                                onChange={e => setFormData({...formData, city: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label className="text-slate-400 text-xs">UF</Label>
                            <Input 
                                className="bg-black/40 border-white/10 text-white mt-1 h-10 uppercase"
                                placeholder="PE"
                                maxLength={2}
                                value={formData.state}
                                onChange={e => setFormData({...formData, state: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* BLOCO 2: DADOS DO PLANO */}
                <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/5">
                    <h3 className="text-xs font-bold text-[#c9a962] uppercase tracking-widest flex items-center gap-2">
                        <DollarSign className="w-3 h-3" /> Dados do Plano
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-slate-400 text-xs">Ano Início</Label>
                            <Input 
                                type="number" 
                                className="bg-black/40 border-white/10 text-white mt-1 h-10"
                                placeholder="Ex: 2015"
                                value={formData.startYear}
                                onChange={e => setFormData({...formData, startYear: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label className="text-slate-400 text-xs">Valor Inicial (R$)</Label>
                            <Input 
                                type="number" 
                                className="bg-black/40 border-white/10 text-white mt-1 h-10"
                                placeholder="500.00"
                                value={formData.startValue}
                                onChange={e => setFormData({...formData, startValue: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="text-slate-400 text-xs">Valor da Mensalidade Atual (R$)</Label>
                        <Input 
                            type="number" 
                            className="bg-black/40 border-white/10 text-white mt-1 h-10 text-lg font-bold text-[#c9a962]"
                            placeholder="1500.00"
                            value={formData.currentValue}
                            onChange={e => setFormData({...formData, currentValue: e.target.value})}
                        />
                    </div>
                </div>

                <Button 
                  onClick={handleCalculate}
                  className="w-full bg-[#c9a962] hover:bg-[#b08d45] text-[#1a1a1a] font-bold h-12 text-md mt-2 shadow-lg shadow-[#c9a962]/20"
                >
                  Verificar Valores <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                        <p className="text-xs text-red-300 uppercase">Valor Cobrado</p>
                        <p className="text-lg font-bold text-white">R$ {parseFloat(formData.currentValue).toFixed(2)}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
                        <p className="text-xs text-green-300 uppercase">Deveria Ser</p>
                        <p className="text-lg font-bold text-white">R$ {result.correctValue.toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-5 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm">Pagamento Indevido (Mês):</span>
                    <span className="text-red-400 font-bold">R$ {result.monthlyDiff.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-px bg-white/10 my-3" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[#c9a962] text-xs uppercase tracking-widest font-bold">Potencial de Restituição</span>
                    <span className="text-[#c9a962] font-extrabold text-3xl">R$ {result.retroactiveEst.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span className="text-slate-500 text-[10px]">(Estimativa últimos 5 anos)</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-xs text-slate-500 px-4">
                    *Esta simulação é preliminar. Para garantir seu direito, fale com nosso especialista agora.
                  </p>
                  
                  {/* BOTÃO WHATSAPP */}
                  <Button 
                    onClick={contactOffice}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 text-lg shadow-lg shadow-green-900/50"
                  >
                    <MessageCircle className="w-6 h-6 mr-2" />
                    Falar com Advogado
                  </Button>
                  
                  <Button 
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="w-full text-slate-400 hover:text-white"
                  >
                    Refazer Simulação
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Cassiano's Advocacia.
        </div>
      </div>
    </div>
  );
}