import React, { useState, useEffect } from "react";
import { Calculation, Client } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Calculator, 
  Save, 
  FileDown, 
  FileSpreadsheet, 
  Trash2, 
  History,
  Scale,
  Briefcase,
  Landmark,
  HeartPulse,
  RotateCcw,
  Plus,
  ArrowRightCircle,
  Wand2,
  Settings,
  ListPlus,
  Link as LinkIcon, // Ícone de Link
  Copy // Ícone de Copiar
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format, differenceInMonths, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// Bibliotecas de exportação
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Base de Dados Inicial ANS
const INITIAL_ANS_INDICES = {
  2026: 0,
  2025: 6.06,
  2024: 6.91,
  2023: 9.63,
  2022: 15.50,
  2021: -8.19, // Negativo
  2020: 8.14,
  2019: 7.35,
  2018: 10.00,
  2017: 13.57,
  2016: 13.57,
  2015: 13.55,
  2014: 9.65,
  2013: 9.04,
  2012: 7.93,
  2011: 7.69,
  2010: 7.38
};

const Calculations = () => {
  const [activeTab, setActiveTab] = useState("civil");
  const [clients, setClients] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // --- ESTADOS DE CONFIGURAÇÃO (ANS) ---
  const [ansIndices, setAnsIndices] = useState(INITIAL_ANS_INDICES);
  const [newAnsYear, setNewAnsYear] = useState("");
  const [newAnsValue, setNewAnsValue] = useState("");
  const [isAnsModalOpen, setIsAnsModalOpen] = useState(false);

  // --- ESTADOS DOS INPUTS ---
  const [civilData, setCivilData] = useState({
    valorOriginal: "",
    dataVencimento: "",
    dataAtualizacao: format(new Date(), "yyyy-MM-dd"),
    indiceAcumulado: "", 
    jurosMensais: "1.0", 
    multa: "0", 
    honorarios: "0", 
    clientId: ""
  });

  const [laborData, setLaborData] = useState({
    salarioBruto: "",
    dataAdmissao: "",
    dataDemissao: format(new Date(), "yyyy-MM-dd"),
    saldoFgts: "",
    motivo: "sem_justa_causa",
    clientId: ""
  });

  const [bankData, setBankData] = useState({
    valorFinanciado: "",
    dataContratacao: "",
    taxaContrato: "", 
    taxaMercado: "",  
    prazoMeses: "",
    parcelasPagas: "", 
    clientId: ""
  });

  // SAÚDE
  const [healthGen, setHealthGen] = useState({
    startYear: "2010",
    endYear: new Date().getFullYear().toString(),
    startValue: ""
  });

  const [healthData, setHealthData] = useState({
    clientId: "",
    periods: [] 
  });

  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsData, historyData] = await Promise.all([
        Client.list(),
        Calculation.list()
      ]);
      setClients(clientsData || []);
      setHistory(historyData || []);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro ao carregar dados" });
    }
  };

  const handleAddAnsIndex = () => {
    if (!newAnsYear || !newAnsValue) return;
    setAnsIndices(prev => ({
      ...prev,
      [parseInt(newAnsYear)]: parseFloat(newAnsValue)
    }));
    toast({ title: "Índice Atualizado", description: `Ano ${newAnsYear}: ${newAnsValue}%` });
    setNewAnsYear("");
    setNewAnsValue("");
  };

  // --- FUNÇÃO DE COPIAR LINK ESPECÍFICO ---
  const handleCopyLink = (type) => {
    let path = "";
    if (type === 'saude') path = "/simulacao-saude";
    // Futuramente: if (type === 'civil') path = "/simulacao-civil";
    
    if (!path) {
        toast({ title: "Em breve", description: "Simulação pública para este tipo ainda não disponível." });
        return;
    }

    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url);
    toast({ 
      title: "Link Copiado!", 
      description: `Link de simulação (${type}) copiado para a área de transferência.`,
      className: "bg-green-600 text-white border-none"
    });
  };

  // --- GERADOR SAÚDE ---
  const generateHealthTable = () => {
    const start = parseInt(healthGen.startYear);
    const end = parseInt(healthGen.endYear);
    const initialValue = parseFloat(healthGen.startValue);

    if (!start || !end || !initialValue) {
      toast({ title: "Preencha todos os campos do gerador", variant: "destructive" });
      return;
    }

    if (start > end) {
      toast({ title: "Ano inicial maior que final", variant: "destructive" });
      return;
    }

    let newPeriods = [];
    for (let year = start; year <= end; year++) {
      const indexValue = ansIndices[year] !== undefined ? ansIndices[year] : 0;

      newPeriods.push({
        id: Date.now() + year, 
        year: year,
        monthlyFee: "", 
        ansIndex: indexValue.toString(),
        ageIndex: "0",
        claimsIndex: "0"
      });
    }

    if (newPeriods.length > 0) {
      newPeriods[0].monthlyFee = initialValue.toString();
    }

    setHealthData({ ...healthData, periods: newPeriods });
    toast({ title: "Tabela Gerada com Sucesso", className: "bg-green-600 text-white" });
  };

  const addHealthPeriod = () => {
    const lastYear = healthData.periods.length > 0 
      ? parseInt(healthData.periods[healthData.periods.length - 1].year) 
      : new Date().getFullYear();
    const nextYear = lastYear + 1;
    const suggestedIndex = ansIndices[nextYear] !== undefined ? ansIndices[nextYear] : "0";

    setHealthData({
      ...healthData,
      periods: [
        ...healthData.periods,
        { 
          id: Date.now(), 
          year: nextYear, 
          monthlyFee: "", 
          ansIndex: suggestedIndex.toString(),
          ageIndex: "0",
          claimsIndex: "0"
        }
      ]
    });
  };

  const removeHealthPeriod = (id) => {
    setHealthData({
      ...healthData,
      periods: healthData.periods.filter(p => p.id !== id)
    });
  };

  const updateHealthPeriod = (id, field, value) => {
    setHealthData({
      ...healthData,
      periods: healthData.periods.map(p => {
        if (p.id === id) return { ...p, [field]: value };
        return p;
      })
    });
  };

  // --- LÓGICA DE CÁLCULO SAÚDE ---
  const handleCalculateHealth = () => {
    const periods = healthData.periods.map(p => ({
        year: parseInt(p.year),
        charged: parseFloat(p.monthlyFee) || 0,
        ans: parseFloat(p.ansIndex) || 0,
        age: parseFloat(p.ageIndex) || 0,
        claims: parseFloat(p.claimsIndex) || 0,
    })).sort((a, b) => a.year - b.year); 

    if (periods.length === 0) return;

    let detailRows = [];
    let totalDifference = 0;
    
    // Ano 1 é a BASE.
    let correctFee = periods[0].charged; 

    periods.forEach((p, index) => {
        let expectedFee = 0;
        let diffMonthly = 0;
        let diffAnnual = 0;
        let isBase = index === 0;

        if (isBase) {
            expectedFee = p.charged;
            correctFee = p.charged;
        } else {
            const prevPeriod = periods[index - 1];
            
            const ansFactor = 1 + (prevPeriod.ans / 100);
            const ageFactor = 1 + (prevPeriod.age / 100);
            const claimsFactor = 1 + (prevPeriod.claims / 100);
            
            expectedFee = correctFee * ansFactor * ageFactor * claimsFactor;
            correctFee = expectedFee;

            diffMonthly = Math.max(0, p.charged - expectedFee);
            diffAnnual = diffMonthly * 12;
            totalDifference += diffAnnual;
        }

        // Projeção
        const nextAnsFactor = 1 + (p.ans / 100);
        const nextAgeFactor = 1 + (p.age / 100);
        const nextClaimsFactor = 1 + (p.claims / 100);
        const projection = correctFee * nextAnsFactor * nextAgeFactor * nextClaimsFactor;

        detailRows.push({
            year: p.year,
            charged: p.charged,
            correct: expectedFee,
            monthlyDiff: diffMonthly,
            annualDiff: diffAnnual,
            appliedAns: isBase ? 0 : periods[index-1].ans,
            appliedAge: isBase ? 0 : periods[index-1].age,
            nextAns: p.ans,
            nextAge: p.age,
            projection: projection,
            isBase: isBase
        });
    });

    setResult({
        type: 'saude',
        data: {
            periods: detailRows,
            totalDiff: totalDifference,
            totalDouble: totalDifference * 2,
            currentCorrect: detailRows[detailRows.length-1].correct,
            total: totalDifference, 
            memoria: `Cálculo realizado com base na evolução do valor inicial.`
        }
    });
  };

  // --- OUTROS CÁLCULOS ---
  const handleCalculateCivil = () => { 
    const valor = parseFloat(civilData.valorOriginal);
    const indice = parseFloat(civilData.indiceAcumulado) || 0;
    const juros = parseFloat(civilData.jurosMensais) || 0;
    const multa = parseFloat(civilData.multa) || 0;
    const honorarios = parseFloat(civilData.honorarios) || 0;
    if (!valor || !civilData.dataVencimento) return;
    const valorCorrigido = valor * (1 + (indice / 100));
    const meses = differenceInMonths(new Date(civilData.dataAtualizacao), new Date(civilData.dataVencimento));
    const valorJuros = valorCorrigido * (juros / 100) * Math.max(0, meses);
    const subtotal = valorCorrigido + valorJuros;
    const valorMulta = subtotal * (multa / 100);
    const valorHonorarios = (subtotal + valorMulta) * (honorarios / 100);
    const totalFinal = subtotal + valorMulta + valorHonorarios;
    
    setResult({ type: 'civil', data: { original: valor, correcao: valorCorrigido - valor, juros: valorJuros, multa: valorMulta, honorarios: valorHonorarios, total: totalFinal } });
  };

  const handleCalculateLabor = () => { 
    setResult({ type: 'trabalhista', data: { total: 0, memoria: "Simulação" } }); 
  }; 

  const handleCalculateBank = () => { 
    const P = parseFloat(bankData.valorFinanciado);
    const i_c = parseFloat(bankData.taxaContrato) / 100;
    const i_m = parseFloat(bankData.taxaMercado) / 100;
    const n = parseInt(bankData.prazoMeses);
    const p_pagas = parseInt(bankData.parcelasPagas) || 0;
    if (!P || !i_c || !i_m || !n) return;
    const pmt_b = P * ( (i_c * Math.pow(1+i_c, n)) / (Math.pow(1+i_c, n) - 1) );
    const pmt_r = P * ( (i_m * Math.pow(1+i_m, n)) / (Math.pow(1+i_m, n) - 1) );
    const diff = pmt_b - pmt_r;
    setResult({ type: 'bancario', data: { valorFinanciado: P, pmtBanco: pmt_b, pmtJusta: pmt_r, diferencaMensal: diff, excessoTotal: (pmt_b*n)-(pmt_r*n), restituicaoSimples: diff*p_pagas, restituicaoDobro: diff*p_pagas*2, total: diff*p_pagas } });
  };

  // --- EXPORTAÇÃO PROFISSIONAL ---
  
  const handleSave = async () => {
    if (!result) return;
    try {
      let title = `Cálculo ${activeTab.toUpperCase()}`;
      await Calculation.create({ title, type: activeTab, result_data: result.data });
      toast({ title: "Salvo com sucesso!" });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteHistory = async (id) => {
    if(confirm("Apagar cálculo?")) {
        await Calculation.delete(id);
        fetchData();
    }
  };

  const handleExportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    
    // --- DESIGN SYSTEM: CABEÇALHO ---
    doc.setFillColor(26, 26, 26); 
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFont("times", "bold");
    doc.setFontSize(26);
    doc.setTextColor(201, 169, 98); 
    doc.text("Cassiano's Advocacia", 105, 20, null, null, "center");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255); 
    doc.text("Relatório Técnico de Revisão Contratual", 105, 32, null, null, "center");

    // --- METADADOS ---
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Data de Emissão: ${format(new Date(), "dd/MM/yyyy", { locale: ptBR })}`, 15, 50);
    doc.text(`Tipo de Cálculo: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`, 15, 56);

    let head = [];
    let body = [];
    let titleY = 70;

    if (activeTab === 'saude') {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 26, 26);
        doc.text("Demonstrativo de Evolução e Restituição", 105, titleY, null, null, "center");
        
        // --- DEFINIÇÃO DA TABELA ---
        head = [['Ano', 'Mensalidade Paga', 'Mensalidade Devida', 'Índices Aplicados (Legal)', 'Diferença Mensal', 'A Restituir (Ano)']];
        
        body = (result.data.periods || []).map(p => {
            let indicesText = p.isBase ? "---" : `${p.appliedAns}% (ANS)`;
            if (p.appliedAge > 0) indicesText += ` + ${p.appliedAge}% (Idade)`;
            
            return [
                { content: p.year.toString(), styles: { fontStyle: 'bold', halign: 'center' } },
                { content: `R$ ${p.charged?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`, styles: { halign: 'right' } },
                { content: `R$ ${p.correct?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`, styles: { halign: 'right', fontStyle: 'bold', textColor: [34, 197, 94] } }, 
                { content: indicesText, styles: { halign: 'center', fontSize: 8 } },
                { content: p.isBase ? '-' : `R$ ${p.monthlyDiff?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`, styles: { halign: 'right', textColor: [220, 38, 38] } }, 
                { content: p.isBase ? '-' : `R$ ${p.annualDiff?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`, styles: { halign: 'right', fontStyle: 'bold' } }
            ];
        });

        // Totais
        body.push([
            { content: 'TOTAL RESTITUIÇÃO (SIMPLES)', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 240, 240] } },
            { content: `R$ ${result.data.totalDiff?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240], textColor: [26, 26, 26] } }
        ]);
        body.push([
            { content: 'TOTAL RESTITUIÇÃO (DOBRO)', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold', fillColor: [255, 248, 220] } }, 
            { content: `R$ ${result.data.totalDouble?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`, styles: { fontStyle: 'bold', fillColor: [255, 248, 220], textColor: [201, 169, 98] } }
        ]);

    } else {
        head = [['Item', 'Valor Calculado']];
        if (activeTab === 'civil') {
             body = [
                ['Valor Original', `R$ ${result.data.original?.toFixed(2) || '0.00'}`],
                ['Correção + Juros', `R$ ${(result.data.total - result.data.original)?.toFixed(2)}`],
                [{ content: 'TOTAL', styles: { fontStyle: 'bold' } }, { content: `R$ ${result.data.total?.toFixed(2) || '0.00'}`, styles: { fontStyle: 'bold' } }]
             ];
        } else {
             body = [['Total', `R$ ${result.data.total?.toFixed(2) || '0.00'}`]];
        }
    }

    autoTable(doc, {
      startY: titleY + 10,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { 
        fillColor: [26, 26, 26], 
        textColor: [201, 169, 98],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200]
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      columnStyles: {
        0: { cellWidth: 20 }, 
        3: { cellWidth: 50 } 
      }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.height;
        doc.setDrawColor(201, 169, 98);
        doc.setLineWidth(0.5);
        doc.line(15, pageHeight - 20, 195, pageHeight - 20);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text("Documento gerado eletronicamente. Este relatório não substitui laudo pericial oficial.", 15, pageHeight - 12);
        doc.text(`Página ${i} de ${pageCount}`, 180, pageHeight - 12);
    }

    doc.save(`calculo_${activeTab}.pdf`);
  };

  const handleExportExcel = () => {
    if (!result) return;
    let data = [];
    const headerInfo = [
        ["CASSIANO'S ADVOCACIA"],
        ["Relatório de Cálculos"],
        ["Data:", format(new Date(), "dd/MM/yyyy")],
        [""] 
    ];

    if (activeTab === 'saude') {
        const tableHeader = ["Ano", "Mensalidade Paga", "Mensalidade Devida", "Reajuste ANS", "Reajuste Idade", "Diferença Mensal", "Restituição Anual"];
        const tableBody = (result.data.periods || []).map(p => [
            p.year,
            p.charged,
            p.correct,
            p.appliedAns ? p.appliedAns/100 : 0, 
            p.appliedAge ? p.appliedAge/100 : 0,
            p.monthlyDiff,
            p.annualDiff
        ]);
        const totals = [
            ["", "", "", "", "", "TOTAL SIMPLES:", result.data.totalDiff],
            ["", "", "", "", "", "TOTAL DOBRO:", result.data.totalDouble]
        ];
        data = [...headerInfo, tableHeader, ...tableBody, ["", ""], ...totals];
    } else {
        data = [...headerInfo, ["Total", result.data.total || 0]];
    }
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, `calculo_${activeTab}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Calculadora Jurídica</h1>
          <p className="text-slate-500 mt-1">Cálculos Cíveis, Trabalhistas, Bancários e Plano de Saúde.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
                setResult(null);
                setCivilData({...civilData, valorOriginal: ""});
                setLaborData({...laborData, salarioBruto: ""});
                setBankData({...bankData, valorFinanciado: ""});
                setHealthData({ clientId: "", periods: [] });
                setHealthGen({ startYear: "2010", endYear: new Date().getFullYear().toString(), startValue: "" });
            }} 
            title="Limpar campos"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setResult(null); }}>
                <TabsList className="grid w-full grid-cols-4 bg-slate-100 mb-6">
                  <TabsTrigger value="civil" className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#c9a962]">
                    <Scale className="w-4 h-4 mr-2 hidden sm:inline" /> Cível
                  </TabsTrigger>
                  <TabsTrigger value="trabalhista" className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#c9a962]">
                    <Briefcase className="w-4 h-4 mr-2 hidden sm:inline" /> Trabalhista
                  </TabsTrigger>
                  <TabsTrigger value="bancario" className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#c9a962]">
                    <Landmark className="w-4 h-4 mr-2 hidden sm:inline" /> Bancário
                  </TabsTrigger>
                  <TabsTrigger value="saude" className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-[#c9a962]">
                    <HeartPulse className="w-4 h-4 mr-2 hidden sm:inline" /> Saúde
                  </TabsTrigger>
                </TabsList>

                {/* CÍVEL */}
                <TabsContent value="civil" className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div><Label>Valor</Label><Input type="number" value={civilData.valorOriginal} onChange={e => setCivilData({...civilData, valorOriginal: e.target.value})} /></div>
                     <div><Label>Vencimento</Label><Input type="date" value={civilData.dataVencimento} onChange={e => setCivilData({...civilData, dataVencimento: e.target.value})} /></div>
                     <div><Label>Índice (%)</Label><Input type="number" value={civilData.indiceAcumulado} onChange={e => setCivilData({...civilData, indiceAcumulado: e.target.value})} /></div>
                     <div><Label>Juros (%)</Label><Input type="number" value={civilData.jurosMensais} onChange={e => setCivilData({...civilData, jurosMensais: e.target.value})} /></div>
                     <div><Label>Multa (%)</Label><Input type="number" value={civilData.multa} onChange={e => setCivilData({...civilData, multa: e.target.value})} /></div>
                     <div><Label>Honorários (%)</Label><Input type="number" value={civilData.honorarios} onChange={e => setCivilData({...civilData, honorarios: e.target.value})} /></div>
                   </div>
                   <Button onClick={handleCalculateCivil} className="w-full mt-4 bg-[#1a1a1a] hover:bg-[#c9a962] hover:text-[#1a1a1a]">Calcular</Button>
                </TabsContent>
                
                {/* TRABALHISTA */}
                <TabsContent value="trabalhista"><Button onClick={handleCalculateLabor} className="w-full mt-4">Calcular (Simulação)</Button></TabsContent>
                
                {/* BANCÁRIO */}
                <TabsContent value="bancario" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Valor Financiado</Label><Input type="number" value={bankData.valorFinanciado} onChange={e => setBankData({...bankData, valorFinanciado: e.target.value})} /></div>
                        <div><Label>Prazo (Meses)</Label><Input type="number" value={bankData.prazoMeses} onChange={e => setBankData({...bankData, prazoMeses: e.target.value})} /></div>
                        <div><Label>Taxa Contrato (%)</Label><Input type="number" value={bankData.taxaContrato} onChange={e => setBankData({...bankData, taxaContrato: e.target.value})} /></div>
                        <div><Label>Taxa Mercado (%)</Label><Input type="number" value={bankData.taxaMercado} onChange={e => setBankData({...bankData, taxaMercado: e.target.value})} /></div>
                        <div><Label>Parcelas Pagas</Label><Input type="number" value={bankData.parcelasPagas} onChange={e => setBankData({...bankData, parcelasPagas: e.target.value})} /></div>
                    </div>
                    <Button onClick={handleCalculateBank} className="w-full mt-4 bg-[#1a1a1a] hover:bg-[#c9a962] hover:text-[#1a1a1a]">Calcular</Button>
                </TabsContent>

                {/* SAÚDE */}
                <TabsContent value="saude" className="space-y-4">
                   <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Wand2 className="w-4 h-4 text-[#c9a962]" /> Gerador Automático
                        </h3>
                        <div className="flex gap-2">
                            {/* BOTÃO LINK DE SIMULAÇÃO AQUI DENTRO */}
                            <Button variant="outline" size="sm" onClick={() => handleCopyLink('saude')} className="h-7 text-xs gap-1 border-green-600 text-green-700 bg-white hover:bg-green-50">
                                <LinkIcon className="w-3 h-3" /> Link Simulação
                            </Button>
                            
                            <Dialog open={isAnsModalOpen} onOpenChange={setIsAnsModalOpen}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Settings className="w-3 h-3" /> Config ANS</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Índices ANS</DialogTitle>
                                  <DialogDescription className="text-xs text-gray-500">Configuração de taxas anuais.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-3 gap-2">
                                    <Input placeholder="Ano" value={newAnsYear} onChange={e => setNewAnsYear(e.target.value)} type="number" />
                                    <Input placeholder="Valor %" value={newAnsValue} onChange={e => setNewAnsValue(e.target.value)} type="number" />
                                    <Button onClick={handleAddAnsIndex} className="bg-[#c9a962] text-black"><ListPlus className="w-4 h-4" /></Button>
                                  </div>
                                  <div className="h-[200px] overflow-y-auto border rounded p-2 text-sm space-y-1">
                                    {Object.entries(ansIndices).sort((a,b) => b[0] - a[0]).map(([y, v]) => (
                                      <div key={y} className="flex justify-between border-b pb-1"><span>{y}</span><span className="font-bold">{v}%</span></div>
                                    ))}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                         <div><Label className="text-xs">Ano Inicial</Label><Input type="number" value={healthGen.startYear} onChange={e => setHealthGen({...healthGen, startYear: e.target.value})} className="bg-white" /></div>
                         <div><Label className="text-xs">Ano Final</Label><Input type="number" value={healthGen.endYear} onChange={e => setHealthGen({...healthGen, endYear: e.target.value})} className="bg-white" /></div>
                         <div><Label className="text-xs">Valor Base (R$)</Label><Input type="number" value={healthGen.startValue} onChange={e => setHealthGen({...healthGen, startValue: e.target.value})} className="bg-white border-[#c9a962]" placeholder="Ano inicial" /></div>
                      </div>
                      <Button onClick={generateHealthTable} className="w-full mt-3 bg-[#1a1a1a] text-white hover:bg-[#333]">Gerar Tabela Completa</Button>
                   </div>

                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-slate-700">Valores Anuais</h3>
                    <Button size="sm" variant="outline" onClick={addHealthPeriod} className="h-8"><Plus className="w-4 h-4 mr-2" /> Add Ano</Button>
                  </div>
                  
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {healthData.periods.map((period, index) => (
                      <div key={period.id} className="bg-slate-50 p-3 rounded-lg border space-y-2">
                        <div className="flex justify-between items-center border-b pb-2 mb-2">
                            <span className="font-bold text-sm text-slate-700">Ano: {period.year} {index === 0 && "(BASE)"}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeHealthPeriod(period.id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                             <div className="col-span-1">
                                <Label className="text-xs text-gray-500">Valor Pago (R$)</Label>
                                <Input type="number" placeholder="R$" value={period.monthlyFee} onChange={(e) => updateHealthPeriod(period.id, 'monthlyFee', e.target.value)} className="h-8 text-sm" />
                             </div>
                             <div>
                                <Label className="text-xs text-gray-500">ANS p/ Próx. Ano (%)</Label>
                                <Input type="number" value={period.ansIndex} onChange={(e) => updateHealthPeriod(period.id, 'ansIndex', e.target.value)} className="h-8 text-sm" />
                             </div>
                             <div>
                                <Label className="text-xs text-gray-500">Faixa Etária p/ Próx. (%)</Label>
                                <Input type="number" value={period.ageIndex} onChange={(e) => updateHealthPeriod(period.id, 'ageIndex', e.target.value)} className="h-8 text-sm bg-yellow-50/50" />
                             </div>
                             <div>
                                <Label className="text-xs text-gray-500">Sinistro p/ Próx. (%)</Label>
                                <Input type="number" value={period.claimsIndex} onChange={(e) => updateHealthPeriod(period.id, 'claimsIndex', e.target.value)} className="h-8 text-sm bg-red-50/50" />
                             </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-[#1a1a1a] hover:bg-[#c9a962] hover:text-[#1a1a1a] mt-4" onClick={handleCalculateHealth}>Calcular Diferença e Projeção</Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {result && (
            <Card className="bg-[#1a1a1a] text-white border-none shadow-xl">
              <CardHeader className="border-b border-white/10 pb-4">
                <CardTitle className="text-[#c9a962]">
                  {result.type === 'saude' ? 'Restituição Devida' : 'Resultado'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {result.type === 'saude' ? (
                    <>
                        <div className="text-center py-2">
                            <span className="text-sm text-gray-400 uppercase">Total Restituição (Simples)</span>
                            <div className="text-3xl font-bold mt-1 text-[#c9a962]">
                                R$ {result.data.totalDiff?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Em dobro: R$ {result.data.totalDouble?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-300 border-t border-white/10 pt-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                            {(result.data.periods || []).map((p, i) => (
                                <div key={i} className="border-b border-white/5 pb-2 mb-2 last:border-0 bg-white/5 p-2 rounded">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-white">{p.year} {p.isBase ? '(Base)' : ''}</span>
                                        <span className="text-xs text-gray-400">Pago: R$ {p.charged?.toFixed(2)}</span>
                                    </div>
                                    
                                    {!p.isBase && (
                                        <div className="text-xs space-y-1">
                                            <div className="flex justify-between text-gray-500">
                                                <span>Reajuste Aplicado (Ano Ant):</span>
                                                <span>ANS {p.appliedAns}% {p.appliedAge > 0 ? `+ Idade ${p.appliedAge}%` : ''}</span>
                                            </div>
                                            <div className="flex justify-between text-[#c9a962]">
                                                <span>Valor Devido:</span>
                                                <span>R$ {p.correct?.toFixed(2)}</span>
                                            </div>
                                            {p.annualDiff > 0 && (
                                                <div className="flex justify-between text-red-400 font-medium">
                                                    <span>A Restituir (Ano):</span>
                                                    <span>R$ {p.annualDiff?.toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* SEÇÃO DE PROJEÇÃO */}
                                    <div className="mt-2 pt-1 border-t border-white/10 flex justify-between items-center text-xs">
                                        <span className="text-gray-400 flex items-center gap-1">
                                            <ArrowRightCircle className="w-3 h-3" /> Projeção {p.year + 1}:
                                        </span>
                                        <span className="text-white font-bold">R$ {p.projection?.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="text-4xl font-bold mt-2 text-[#c9a962]">
                            R$ {result.data.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-6">
                  <Button variant="outline" className="bg-transparent border-white/20 text-white" onClick={handleExportPDF}><FileDown className="w-4 h-4 mr-2" /> PDF</Button>
                  <Button variant="outline" className="bg-transparent border-white/20 text-white" onClick={handleExportExcel}><FileSpreadsheet className="w-4 h-4 mr-2" /> Excel</Button>
                  <div className="col-span-2 mt-2 flex gap-2">
                      <Select onValueChange={(v) => {
                          if(activeTab === 'civil') setCivilData(d => ({...d, clientId: v}));
                          else if(activeTab === 'saude') setHealthData(d => ({...d, clientId: v}));
                        }}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Vincular Cliente" /></SelectTrigger>
                        <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button className="bg-[#c9a962] text-black hover:bg-[#b08d45]" onClick={handleSave} disabled={loading}><Save className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" /> Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-4">Nenhum cálculo salvo</div>
              ) : (
                history.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between p-3 bg-slate-50 rounded-lg text-sm group">
                    <div>
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{format(new Date(item.created_at), 'dd/MM/yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-xs uppercase bg-white border px-1 rounded">{item.type}</span>
                       <button onClick={() => handleDeleteHistory(item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calculations;