import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MessageCircle } from "lucide-react"; // Troquei o ícone para MessageCircle (parecido com chat)

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
    startYear: "",
    startValue: "",
    currentValue: ""
  });
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const startYear = parseInt(formData.startYear);
    const startValue = parseFloat(formData.startValue);
    const currentValue = parseFloat(formData.currentValue);
    const currentYear = new Date().getFullYear();

    if (!startYear || !startValue || !currentValue) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

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
    // Mensagem automática que chegará no seu WhatsApp
    const text = `Olá! Fiz a simulação de saúde. Meu plano começou em ${formData.startYear} (R$ ${formData.startValue}). Hoje pago R$ ${formData.currentValue}. O sistema calculou que deveria ser R$ ${result.correctValue.toFixed(2)}. Gostaria de uma análise.`;
    
    // SEU NÚMERO AQUI (Com 55 do Brasil)
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

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#c9a962] mb-2 tracking-tight">Cassiano's Advocacia</h1>
          <p className="text-slate-400">Simulador de Revisão de Plano de Saúde</p>
        </div>

        <Card className="border-white/10 bg-[#1a1a1a]/80 backdrop-blur-xl text-white shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-lg font-medium text-slate-200">
              {step === 1 ? "Verifique se sua mensalidade está correta" : "Resultado da Análise Preliminar"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="space-y-5">
                <div>
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">Ano de Início do Contrato</Label>
                  <Input 
                    type="number" 
                    className="bg-black/40 border-white/10 text-white mt-1.5 h-12 text-lg focus:border-[#c9a962]"
                    placeholder="Ex: 2015"
                    value={formData.startYear}
                    onChange={e => setFormData({...formData, startYear: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">Valor da Primeira Mensalidade</Label>
                  <Input 
                    type="number" 
                    className="bg-black/40 border-white/10 text-white mt-1.5 h-12 text-lg focus:border-[#c9a962]"
                    placeholder="Ex: 500.00"
                    value={formData.startValue}
                    onChange={e => setFormData({...formData, startValue: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">Valor da Mensalidade Atual</Label>
                  <Input 
                    type="number" 
                    className="bg-black/40 border-white/10 text-white mt-1.5 h-12 text-lg focus:border-[#c9a962]"
                    placeholder="Ex: 1500.00"
                    value={formData.currentValue}
                    onChange={e => setFormData({...formData, currentValue: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={handleCalculate}
                  className="w-full bg-[#c9a962] hover:bg-[#b08d45] text-[#1a1a1a] font-bold h-12 text-md mt-2"
                >
                  Calcular Agora <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                        <p className="text-xs text-red-300 uppercase">Valor Cobrado</p>
                        <p className="text-lg font-bold text-white">R$ {parseFloat(formData.currentValue).toFixed(2)}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
                        <p className="text-xs text-green-300 uppercase">Valor Justo (ANS)</p>
                        <p className="text-lg font-bold text-white">R$ {result.correctValue.toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm">Pagamento Indevido (Mês):</span>
                    <span className="text-red-400 font-bold">R$ {result.monthlyDiff.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-px bg-white/10 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-[#c9a962] text-sm font-bold">Estimativa de Restituição (5 anos):</span>
                    <span className="text-[#c9a962] font-bold text-lg">R$ {result.retroactiveEst.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-xs text-slate-500">
                    *Esta simulação aplica apenas os índices da ANS e não substitui um cálculo pericial detalhado.
                  </p>
                  
                  {/* BOTÃO WHATSAPP CONFIGURADO */}
                  <Button 
                    onClick={contactOffice}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
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
          &copy; {new Date().getFullYear()} Cassiano's Advocacia. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}