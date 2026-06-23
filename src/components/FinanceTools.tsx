import React, { useState } from 'react';
import { Calculator, TrendingUp, Layers, Percent, Coins, Copy, Check, Info } from 'lucide-react';

interface FinanceToolsProps {
  toolId: string;
}

export default function FinanceTools({ toolId }: FinanceToolsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const triggerCopy = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // --- 1. EMI CALCULATOR STATE & LOGIC ---
  const [emiLoan, setEmiLoan] = useState<number | ''>(1000000);
  const [emiRate, setEmiRate] = useState<number | ''>(8.5);
  const [emiTenure, setEmiTenure] = useState<number | ''>(15); // years default
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');

  const calcEMI = () => {
    const P = Number(emiLoan) || 0;
    const annualR = Number(emiRate) || 0;
    const tenureVal = Number(emiTenure) || 0;
    const n = tenureType === 'years' ? tenureVal * 12 : tenureVal;
    if (n <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0, pPct: 50, iPct: 50 };

    const r = annualR / 12 / 100;
    
    // EMI Formula: [P x r x (1+r)^n] / [(1+r)^n - 1]
    let emiVal = 0;
    if (r === 0) {
      emiVal = P / n;
    } else {
      emiVal = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = emiVal * n;
    const totalInterest = totalPayment - P;

    const pPct = totalPayment > 0 ? Math.round((P / totalPayment) * 100) : 100;
    const iPct = 100 - pPct;

    return {
      emi: Math.round(emiVal),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      pPct,
      iPct
    };
  };

  const emiResult = calcEMI();

  // --- 2. SIP CALCULATOR STATE & LOGIC ---
  const [sipMonthly, setSipMonthly] = useState<number | ''>(10000);
  const [sipRate, setSipRate] = useState<number | ''>(12);
  const [sipPeriod, setSipPeriod] = useState<number | ''>(10); // years

  const calcSIP = () => {
    const P = Number(sipMonthly) || 0;
    const rateVal = Number(sipRate) || 0;
    const periodVal = Number(sipPeriod) || 0;
    const i = rateVal / 12 / 100;
    const n = periodVal * 12;

    if (P <= 0 || n <= 0) return { invested: 0, estReturns: 0, totalValue: 0, invPct: 50, retPct: 50 };

    // SIP Compound Formula: M = P * [((1 + i)^n - 1) / i] * (1 + i)
    let totalValue = 0;
    if (i === 0) {
      totalValue = P * n;
    } else {
      totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    }

    const invested = P * n;
    const estReturns = Math.max(0, totalValue - invested);

    const invPct = totalValue > 0 ? Math.round((invested / totalValue) * 100) : 100;
    const retPct = 100 - invPct;

    return {
      invested: Math.round(invested),
      estReturns: Math.round(estReturns),
      totalValue: Math.round(totalValue),
      invPct,
      retPct
    };
  };

  const sipResult = calcSIP();

  // --- 3. FD CALCULATOR STATE & LOGIC ---
  const [fdPrincipal, setFdPrincipal] = useState<number | ''>(200000);
  const [fdRate, setFdRate] = useState<number | ''>(7.1);
  const [fdTenure, setFdTenure] = useState<number | ''>(5); // years
  const [fdCompounding, setFdCompounding] = useState<'monthly' | 'quarterly' | 'halfway' | 'yearly'>('quarterly');

  const calcFD = () => {
    const P = Number(fdPrincipal) || 0;
    const rateVal = Number(fdRate) || 0;
    const tenureVal = Number(fdTenure) || 0;
    const r = rateVal / 100;
    const t = tenureVal;

    let n = 4; // default quarterly
    if (fdCompounding === 'monthly') n = 12;
    else if (fdCompounding === 'quarterly') n = 4;
    else if (fdCompounding === 'halfway') n = 2;
    else if (fdCompounding === 'yearly') n = 1;

    if (P <= 0 || t <= 0) return { interestEarned: 0, maturityValue: 0, pPct: 100, iPct: 0 };

    // Standard FD Formula: A = P * (1 + r/n)^(n*t)
    const maturityValue = P * Math.pow(1 + r / n, n * t);
    const interestEarned = Math.max(0, maturityValue - P);

    const pPct = maturityValue > 0 ? Math.round((P / maturityValue) * 100) : 100;
    const iPct = 100 - pPct;

    return {
      interestEarned: Math.round(interestEarned),
      maturityValue: Math.round(maturityValue),
      pPct,
      iPct
    };
  };

  const fdResult = calcFD();

  // --- 4. GST CALCULATOR STATE & LOGIC ---
  const [gstAmount, setGstAmount] = useState<number | ''>(25000);
  const [gstRate, setGstRate] = useState<number | ''>(18);
  const [gstAction, setGstAction] = useState<'add' | 'remove'>('add');

  const calcGST = () => {
    const amount = Number(gstAmount) || 0;
    const valRate = Number(gstRate) || 0;
    if (amount <= 0) return { original: 0, gstAmount: 0, total: 0, cgst: 0, sgst: 0 };

    let calculatedGst = 0;
    let finalTotal = 0;
    let netOriginal = 0;

    if (gstAction === 'add') {
      calculatedGst = (amount * valRate) / 100;
      finalTotal = amount + calculatedGst;
      netOriginal = amount;
    } else {
      // Remove GST Formula: Original Cost = Gross / (1 + Rate/100)
      netOriginal = amount / (1 + valRate / 100);
      calculatedGst = amount - netOriginal;
      finalTotal = amount;
    }

    const cgst = calculatedGst / 2;
    const sgst = calculatedGst / 2;

    return {
      original: Math.round(netOriginal),
      gstAmount: Math.round(calculatedGst),
      total: Math.round(finalTotal),
      cgst: Math.round(cgst),
      sgst: Math.round(sgst)
    };
  };

  const gstResult = calcGST();

  // --- 5. LOAN CALCULATOR STATE & LOGIC ---
  const [loanVal, setLoanVal] = useState<number | ''>(500000);
  const [loanRate, setLoanRate] = useState<number | ''>(10.5);
  const [loanTenure, setLoanTenure] = useState<number | ''>(5); // years default

  const calcLoanSchedule = () => {
    const P = Number(loanVal) || 0;
    const annualR = Number(loanRate) || 0;
    const tenureVal = Number(loanTenure) || 0;
    const n = tenureVal * 12;
    
    if (P <= 0 || n <= 0 || annualR <= 0) return { emi: 0, schedule: [], totalInterest: 0 };

    const r = annualR / 12 / 100;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    let remainingPrincipal = P;
    const tempSchedule = [];
    let totInterest = 0;

    for (let month = 1; month <= Math.min(n, 120); month++) { // cap schedule list at 120 (10 years) for UI rendering performance
      const interestForMonth = remainingPrincipal * r;
      const principalForMonth = emi - interestForMonth;
      remainingPrincipal = Math.max(0, remainingPrincipal - principalForMonth);
      totInterest += interestForMonth;

      tempSchedule.push({
        month,
        emi: Math.round(emi),
        interest: Math.round(interestForMonth),
        principal: Math.round(principalForMonth),
        balance: Math.round(remainingPrincipal)
      });
    }

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totInterest),
      schedule: tempSchedule,
      capped: n > 120
    };
  };

  const loanResult = calcLoanSchedule();

  const fmt = (num: number | '') => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(num) || 0);
  };

  return (
    <div className="w-full">
      {/* 1. EMI CALCULATOR UI */}
      {toolId === 'emi-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="emi-calc-block">
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
              <Calculator className="w-5 h-5 text-emerald-600" />
              Configure Loan Parameters
            </h3>

            <div className="space-y-6">
              {/* Slider 1: Loan Principal */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Loan Amount</label>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{fmt(emiLoan)}</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="10000000"
                  step="50000"
                  value={emiLoan}
                  onChange={(e) => setEmiLoan(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <input
                  type="number"
                  value={emiLoan}
                  onChange={(e) => setEmiLoan(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="mt-2 w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Slider 2: Interest rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Interest Rate (p.a.)</label>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{emiRate}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="0.1"
                  value={emiRate}
                  onChange={(e) => setEmiRate(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <input
                  type="number"
                  step="0.1"
                  value={emiRate}
                  onChange={(e) => setEmiRate(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="mt-2 w-32 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Slider 3: Tenure */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Loan Tenure</label>
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                    <button
                      onClick={() => { setTenureType('years'); if (tenureType === 'months') setEmiTenure(Math.ceil(emiTenure / 12)); }}
                      className={`px-2 py-1 text-xs rounded font-medium transition ${tenureType === 'years' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'}`}
                    >
                      Years
                    </button>
                    <button
                      onClick={() => { setTenureType('months'); if (tenureType === 'years') setEmiTenure(emiTenure * 12); }}
                      className={`px-2 py-1 text-xs rounded font-medium transition ${tenureType === 'months' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'}`}
                    >
                      Months
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max={tenureType === 'years' ? '30' : '360'}
                  step="1"
                  value={emiTenure}
                  onChange={(e) => setEmiTenure(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={emiTenure}
                    onChange={(e) => setEmiTenure(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                    className="w-32 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-zinc-500">{tenureType}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider mb-2">Equated Monthly Installment</h4>
              <p className="text-4xl font-extrabold text-emerald-600 font-mono tracking-tight">{fmt(emiResult.emi)}<span className="text-sm font-normal text-zinc-500">/month</span></p>
              
              <div className="mt-6 space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Principal Balance:</span>
                  <span className="font-semibold text-zinc-800 dark:text-white font-mono">{fmt(emiLoan)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Total Interest Payable:</span>
                  <span className="font-semibold text-zinc-800 dark:text-white font-mono">{fmt(emiResult.totalInterest)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-3">
                  <span className="font-medium text-zinc-900 dark:text-white">Total Amount Due:</span>
                  <span className="font-bold text-zinc-900 dark:text-white font-mono">{fmt(emiResult.totalPayment)}</span>
                </div>
              </div>
            </div>

            {/* Micro visual proportion bar chart */}
            <div className="mt-8">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  Principal ({emiResult.pPct}%)
                </span>
                <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                  Interest ({emiResult.iPct}%)
                </span>
              </div>
              <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${emiResult.pPct}%` }} className="bg-emerald-500 h-full transition-all duration-300"></div>
                <div style={{ width: `${emiResult.iPct}%` }} className="bg-amber-400 h-full transition-all duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SIP CALCULATOR UI */}
      {toolId === 'sip-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="sip-calc-block">
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Configure Monthly SIP parameters
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Monthly Investment</label>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{fmt(sipMonthly)}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="500000"
                  step="500"
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <input
                  type="number"
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="mt-2 w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Expected Return Rate (p.a.)</label>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{sipRate}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="0.5"
                  value={sipRate}
                  onChange={(e) => setSipRate(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <input
                  type="number"
                  step="0.5"
                  value={sipRate}
                  onChange={(e) => setSipRate(e.target.value === '' ? '' : Math.max(0.1, Number(e.target.value)))}
                  className="mt-2 w-32 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Time Period (Years)</label>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{sipPeriod} years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={sipPeriod}
                  onChange={(e) => setSipPeriod(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <input
                  type="number"
                  value={sipPeriod}
                  onChange={(e) => setSipPeriod(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                  className="mt-2 w-32 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider mb-2">Maturity Wealth Projection</h4>
              <p className="text-4xl font-extrabold text-emerald-600 font-mono tracking-tight">{fmt(sipResult.totalValue)}</p>

              <div className="mt-6 space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Total Invested Amount:</span>
                  <span className="font-semibold text-zinc-800 dark:text-white font-mono">{fmt(sipResult.invested)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Estimated Wealth Gains:</span>
                  <span className="font-semibold text-zinc-800 dark:text-white font-mono">{fmt(sipResult.estReturns)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                  Invested ({sipResult.invPct}%)
                </span>
                <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
                  Growth ({sipResult.retPct}%)
                </span>
              </div>
              <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${sipResult.invPct}%` }} className="bg-emerald-600 h-full transition-all duration-300"></div>
                <div style={{ width: `${sipResult.retPct}%` }} className="bg-emerald-400 h-full transition-all duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FD CALCULATOR UI */}
      {toolId === 'fd-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="fd-calc-block">
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
              <Layers className="w-5 h-5 text-emerald-600" />
              Configure Fixed Deposit Interest Parameters
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Principal Amount</label>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{fmt(fdPrincipal)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="5000000"
                  step="5000"
                  value={fdPrincipal}
                  onChange={(e) => setFdPrincipal(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <input
                  type="number"
                  value={fdPrincipal}
                  onChange={(e) => setFdPrincipal(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="mt-2 w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={fdRate}
                    onChange={(e) => setFdRate(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tenure (Years)</label>
                  <input
                    type="number"
                    value={fdTenure}
                    onChange={(e) => setFdTenure(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Compounding Frequency</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['monthly', 'quarterly', 'halfway', 'yearly'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFdCompounding(mode)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border capitalize transition ${fdCompounding === mode ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-600' : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                    >
                      {mode === 'halfway' ? 'Half-Yearly' : mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider mb-2">Maturity Value</h4>
              <p className="text-4xl font-extrabold text-emerald-600 font-mono tracking-tight">{fmt(fdResult.maturityValue)}</p>

              <div className="mt-6 space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Invested Principal:</span>
                  <span className="font-semibold text-zinc-800 dark:text-white font-mono">{fmt(fdPrincipal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Interest Earned:</span>
                  <span className="font-semibold text-zinc-800 dark:text-white font-mono">{fmt(fdResult.interestEarned)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                  Principal ({fdResult.pPct}%)
                </span>
                <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                  Interest ({fdResult.iPct}%)
                </span>
              </div>
              <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${fdResult.pPct}%` }} className="bg-emerald-600 h-full transition-all duration-300"></div>
                <div style={{ width: `${fdResult.iPct}%` }} className="bg-amber-400 h-full transition-all duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. GST CALCULATOR UI */}
      {toolId === 'gst-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="gst-calc-block">
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
              <Percent className="w-5 h-5 text-emerald-600" />
              Goods & Services Tax (GST) Calculator
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Tax Action</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGstAction('add')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition ${gstAction === 'add' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                  >
                    Add GST (Inclusive of Tax)
                  </button>
                  <button
                    onClick={() => setGstAction('remove')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition ${gstAction === 'remove' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                  >
                    Remove GST (Exclusive of Tax)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={gstAmount}
                  onChange={(e) => setGstAmount(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">GST Rate Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 12, 18, 28].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setGstRate(rate)}
                      className={`py-2 text-sm font-semibold rounded-lg border transition ${gstRate === rate ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600'}`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="block text-xs text-zinc-500 mb-1">Custom Tax Rate (%)</label>
                  <input
                    type="number"
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                    className="w-32 px-3 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider mb-2">
                  {gstAction === 'add' ? 'Total Gross Amount (incl. tax)' : 'Net Price (excl. tax)'}
                </h4>
                <p className="text-4xl font-extrabold text-emerald-600 font-mono tracking-tight">
                  {gstAction === 'add' ? fmt(gstResult.total) : fmt(gstResult.original)}
                </p>
              </div>

              <div className="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Net Base Price:</span>
                  <span className="font-semibold text-zinc-800 dark:text-white font-mono">{fmt(gstResult.original)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Total Tax Component:</span>
                  <span className="font-semibold text-zinc-850 dark:text-zinc-200 font-mono text-emerald-600">{fmt(gstResult.gstAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800">
                  <span>Central CGST ({gstRate / 2}%):</span>
                  <span className="font-mono">{fmt(gstResult.cgst)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800">
                  <span>State SGST ({gstRate / 2}%):</span>
                  <span className="font-mono">{fmt(gstResult.sgst)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-zinc-200 dark:border-zinc-800 pt-3 font-semibold text-zinc-900 dark:text-white">
                  <span>Gross Value:</span>
                  <span className="font-mono">{fmt(gstResult.total)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => triggerCopy(`Base: ${gstResult.original}, Tax: ${gstResult.gstAmount} (${gstRate}%), CGST: ${gstResult.cgst}, SGST: ${gstResult.sgst}, Total: ${gstResult.total}`, 'gst')}
              className="mt-6 flex items-center justify-center gap-1.5 w-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-semibold py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm transition"
            >
              {copied === 'gst' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied === 'gst' ? 'Copied Calculation!' : 'Copy GST Tax Report'}
            </button>
          </div>
        </div>
      )}

      {/* 5. LOAN CALCULATOR WITH AMORTIZATION */}
      {toolId === 'loan-calculator' && (
        <div className="space-y-6" id="loan-amort-block">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
                <Coins className="w-5 h-5 text-emerald-600" />
                Advanced Amortization Calculator
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Principal (₹)</label>
                  <input
                    type="number"
                    value={loanVal}
                    onChange={(e) => setLoanVal(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Annual Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={loanRate}
                    onChange={(e) => setLoanRate(e.target.value === '' ? '' : Math.max(0.1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tenure (Years)</label>
                  <input
                    type="number"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider mb-2">Equated Monthly Payment</h4>
              <p className="text-4xl font-extrabold text-emerald-600 font-mono tracking-tight mb-4">{fmt(loanResult.emi)}</p>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cumulative Interest:</span>
                  <span className="font-semibold text-zinc-800 dark:text-white font-mono">{fmt(loanResult.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Indebtedness:</span>
                  <span className="font-semibold text-zinc-800 dark:text-white font-mono">{fmt(loanVal + loanResult.totalInterest)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Amortization Schedule Tabular View */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white">Amortization Ledger Table</h4>
              {loanResult.capped && (
                <span className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-1 rounded-md flex items-center gap-1 font-medium">
                  <Info className="w-3.5 h-3.5" />
                  Showing first 120 instalments
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left text-sm">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-medium">
                    <th className="px-4 py-3">Installment #</th>
                    <th className="px-4 py-3">Monthly Payment</th>
                    <th className="px-4 py-3">Toward Principal</th>
                    <th className="px-4 py-3">Toward Interest</th>
                    <th className="px-4 py-3">Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850 font-mono">
                  {loanResult.schedule.map((row) => (
                    <tr key={row.month} className="hover:bg-zinc-50 transition dark:hover:bg-zinc-850">
                      <td className="px-4 py-3 text-zinc-500 font-semibold">{row.month}</td>
                      <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200">{fmt(row.emi)}</td>
                      <td className="px-4 py-3 text-emerald-600">{fmt(row.principal)}</td>
                      <td className="px-4 py-3 text-amber-500">{fmt(row.interest)}</td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-350 font-bold">{fmt(row.balance)}</td>
                    </tr>
                  ))}
                  {loanResult.schedule.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-zinc-400 font-sans">
                        Configure valid loan values to audit your amortization schedule.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
