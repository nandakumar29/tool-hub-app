import React, { useState, useEffect } from 'react';
import { CalendarDays, Key, QrCode, FileText, RefreshCw, Copy, Check, Info, Download } from 'lucide-react';

interface UtilityToolsProps {
  toolId: string;
}

export default function UtilityTools({ toolId }: UtilityToolsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const triggerCopy = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // --- 1. AGE CALCULATOR STATE & LOGIC ---
  const [birthDate, setBirthDate] = useState('1998-05-15');
  const [ageReport, setAgeReport] = useState<{ years: number; months: number; days: number; nextBday: string } | null>(null);

  const calculateAge = () => {
    if (!birthDate) return;
    const today = new Date();
    const dob = new Date(birthDate);
    if (dob > today) {
      setAgeReport(null);
      return;
    }

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
      // borrow days from previous month
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }

    if (months < 0) {
      months += 12;
      years--;
    }

    // calculate days remaining for next birthday
    let nextBdate = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (today > nextBdate) {
      nextBdate.setFullYear(today.getFullYear() + 1);
    }
    const diffMs = nextBdate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    setAgeReport({
      years,
      months,
      days,
      nextBday: `${daysLeft} days remaining`
    });
  };

  useEffect(() => {
    calculateAge();
  }, [birthDate]);


  // --- 2. PASSWORD GENERATOR STATE & LOGIC ---
  const [pwLength, setPwLength] = useState(16);
  const [pwUpper, setPwUpper] = useState(true);
  const [pwLower, setPwLower] = useState(true);
  const [pwNumbers, setPwNumbers] = useState(true);
  const [pwSymbols, setPwSymbols] = useState(true);
  const [generatedPw, setGeneratedPw] = useState('');

  const generatePassword = () => {
    let charset = '';
    if (pwUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (pwLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (pwNumbers) charset += '0123456789';
    if (pwSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
      setGeneratedPw('');
      return;
    }

    let pw = '';
    for (let i = 0; i < pwLength; i++) {
      const idx = Math.floor(Math.random() * charset.length);
      pw += charset[idx];
    }
    setGeneratedPw(pw);
  };

  useEffect(() => {
    generatePassword();
  }, [pwLength, pwUpper, pwLower, pwNumbers, pwSymbols]);

  const getStrength = () => {
    if (!generatedPw) return { text: 'Empty', color: 'bg-zinc-200', pct: 0 };
    let score = 0;
    if (generatedPw.length >= 8) score += 1;
    if (generatedPw.length >= 12) score += 1;
    if (pwUpper && pwLower) score += 1;
    if (pwNumbers) score += 1;
    if (pwSymbols) score += 1;

    if (score <= 1) return { text: 'Weak 😐', color: 'bg-rose-500', pct: 20 };
    if (score <= 3) return { text: 'Medium 🫡', color: 'bg-amber-400', pct: 50 };
    if (score <= 4) return { text: 'Strong 💪', color: 'bg-emerald-500', pct: 80 };
    return { text: 'Excellent 🔥', color: 'bg-indigo-600', pct: 100 };
  };

  const strength = getStrength();


  // --- 3. QR CODE GENERATOR STATE & LOGIC ---
  const [qrText, setQrText] = useState('https://tool-hub-app.vercel.app');
  const [qrSize, setQrSize] = useState(250);
  const [qrColor, setQrColor] = useState('000000'); // black hex
  const [qrBgColor, setQrBgColor] = useState('ffffff'); // white hex

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrText)}&color=${qrColor}&bgcolor=${qrBgColor}`;

  const downloadQR = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'toolhub-digital-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      // fallback opens in new window
      window.open(qrUrl, '_blank');
    }
  };


  // --- 4. WORD COUNTER STATE & LOGIC ---
  const [wordInput, setWordInput] = useState(
    'ToolHub (all in one click) offers lightweight, hyper-fast, safe, and completely browser-side tools. Writers can check character frequency grids, while developers can test JSON structures dynamically inside their workspace environments without complex installations.'
  );

  const getWordStats = () => {
    const text = wordInput.trim();
    if (!text) {
      return { words: 0, chars: 0, paragraphs: 0, sentences: 0, readTime: '0 min' };
    }

    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    // speed average 225 WPM
    const readMinutes = Math.ceil(words / 225);
    const readTime = `${readMinutes} min read`;

    return { words, chars, paragraphs, sentences, readTime };
  };

  const stats = getWordStats();


  // --- 5. UNIT CONVERTER STATE & LOGIC ---
  const [convCategory, setConvCategory] = useState<'length' | 'weight' | 'temp'>('length');
  const [convVal, setConvVal] = useState<number | ''>(1);
  const [unitFrom, setUnitFrom] = useState('m');
  const [unitTo, setUnitTo] = useState('ft');
  const [convResult, setConvResult] = useState<number | string>(0);

  const unitConfigs = {
    length: {
      units: [
        { id: 'm', label: 'Meters (m)' },
        { id: 'km', label: 'Kilometers (km)' },
        { id: 'ft', label: 'Feet (ft)' },
        { id: 'in', label: 'Inches (in)' },
        { id: 'mi', label: 'Miles (mi)' },
      ],
      convert: (val: number, from: string, to: string) => {
        // base meter mapping
        const meters: Record<string, number> = { m: 1, km: 1000, ft: 0.3048, in: 0.0254, mi: 1609.34 };
        const valInMeters = val * (meters[from] || 1);
        return valInMeters / (meters[to] || 1);
      }
    },
    weight: {
      units: [
        { id: 'kg', label: 'Kilograms (kg)' },
        { id: 'g', label: 'Grams (g)' },
        { id: 'lb', label: 'Pounds (lbs)' },
        { id: 'oz', label: 'Ounces (oz)' },
      ],
      convert: (val: number, from: string, to: string) => {
        // base kg mapping
        const kg: Record<string, number> = { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 };
        const valInKg = val * (kg[from] || 1);
        return valInKg / (kg[to] || 1);
      }
    },
    temp: {
      units: [
        { id: 'c', label: 'Celsius (°C)' },
        { id: 'f', label: 'Fahrenheit (°F)' },
        { id: 'k', label: 'Kelvin (K)' },
      ],
      convert: (val: number, from: string, to: string) => {
        if (from === to) return val;
        // convert to Celsius first
        let celsius = val;
        if (from === 'f') celsius = (val - 32) * 5 / 9;
        if (from === 'k') celsius = val - 273.15;

        // convert to target
        if (to === 'c') return celsius;
        if (to === 'f') return (celsius * 9 / 5) + 32;
        if (to === 'k') return celsius + 273.15;
        return val;
      }
    }
  };

  const processConvert = () => {
    const config = unitConfigs[convCategory];
    const val = convVal === '' ? 0 : Number(convVal);
    const res = config.convert(val, unitFrom, unitTo);
    setConvResult(typeof res === 'number' ? Number(res.toFixed(4)) : res);
  };

  // Adjust defaults when category shifts
  useEffect(() => {
    if (convCategory === 'length') {
      setUnitFrom('m');
      setUnitTo('ft');
    } else if (convCategory === 'weight') {
      setUnitFrom('kg');
      setUnitTo('lb');
    } else {
      setUnitFrom('c');
      setUnitTo('f');
    }
  }, [convCategory]);

  useEffect(() => {
    processConvert();
  }, [convVal, unitFrom, unitTo, convCategory]);


  return (
    <div className="w-full">
      {/* 1. AGE CALCULATOR */}
      {toolId === 'age-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="age-calc-block">
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5 text-amber-500" />
              Provide Birthday Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-850 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            {ageReport ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider mb-2.5">Calculated Chronicle Age</h4>
                  <p className="text-5xl font-extrabold text-amber-500 font-mono tracking-tight flex items-baseline leading-none gap-1">
                    {ageReport.years}
                    <span className="text-sm font-semibold text-zinc-500 font-sans">Years old</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                  <div>
                    <span className="block text-xs text-zinc-400">Months</span>
                    <span className="text-lg font-bold font-mono text-zinc-800 dark:text-zinc-200">{ageReport.months}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-zinc-400">Days</span>
                    <span className="text-lg font-bold font-mono text-zinc-800 dark:text-zinc-200">{ageReport.days}</span>
                  </div>
                </div>

                <div className="bg-amber-500/10 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-amber-200/50">
                  <Info className="w-4 h-4" />
                  Upcoming Birthday: {ageReport.nextBday}
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-12">Select a valid historical birthdate to analyze age metrics.</p>
            )}
          </div>
        </div>
      )}

      {/* 2. PASSWORD GENERATOR */}
      {toolId === 'password-generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="password-block">
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" />
              Customize password bounds
            </h3>

            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-zinc-700 dark:text-zinc-300">Length</span>
                <span className="text-amber-600 font-mono font-bold">{pwLength} chars</span>
              </div>
              <input
                type="range"
                min="6"
                max="64"
                value={pwLength}
                onChange={(e) => setPwLength(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-850 rounded-lg cursor-pointer accent-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-650 dark:text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={pwUpper} onChange={(e) => setPwUpper(e.target.checked)} className="rounded text-amber-500 focus:ring-amber-500" />
                A-Z Uppercase
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-650 dark:text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={pwLower} onChange={(e) => setPwLower(e.target.checked)} className="rounded text-amber-500 focus:ring-amber-500" />
                a-z Lowercase
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-650 dark:text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={pwNumbers} onChange={(e) => setPwNumbers(e.target.checked)} className="rounded text-amber-500 focus:ring-amber-500" />
                0-9 Numbers
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-650 dark:text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={pwSymbols} onChange={(e) => setPwSymbols(e.target.checked)} className="rounded text-amber-500 focus:ring-amber-500" />
                #$&Symbols
              </label>
            </div>
          </div>

          <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider mb-2">Securely Generated Password</h4>
              
              <div className="relative mb-4">
                <input
                  type="text"
                  readOnly
                  value={generatedPw || 'Please check at least 1 option'}
                  className="w-full pr-10 pl-3 py-2.5 bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-850 rounded-xl font-mono text-sm font-bold text-zinc-800 dark:text-zinc-250 select-all focus:outline-none"
                />
                {generatedPw && (
                  <button
                    onClick={() => triggerCopy(generatedPw, 'pw')}
                    className="absolute right-2 top-2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-550 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  >
                    {copied === 'pw' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {generatedPw && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Entropy Strength:</span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-350">{strength.text}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div style={{ width: `${strength.pct}%` }} className={`h-full ${strength.color} transition-all duration-300`}></div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={generatePassword}
              className="mt-6 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate Password
            </button>
          </div>
        </div>
      )}

      {/* 3. QR CODE GENERATOR */}
      {toolId === 'qr-generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="qr-block">
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-amber-500" />
              Matrix QR parameters
            </h3>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Target Website / Message Link</label>
              <textarea
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="Enter URL links or strings to convert..."
                className="w-full h-24 px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 font-bold mb-1">Frontend Color (Hex)</label>
                <div className="flex gap-2">
                  <input type="color" value={`#${qrColor}`} onChange={(e) => setQrColor(e.target.value.replace('#', ''))} className="w-8 h-8 rounded-md cursor-pointer border border-zinc-200" />
                  <input type="text" value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="w-full px-3 py-1 bg-zinc-50 border rounded-lg text-xs font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 font-bold mb-1">Background Color (Hex)</label>
                <div className="flex gap-2">
                  <input type="color" value={`#${qrBgColor}`} onChange={(e) => setQrBgColor(e.target.value.replace('#', ''))} className="w-8 h-8 rounded-md cursor-pointer border border-zinc-200" />
                  <input type="text" value={qrBgColor} onChange={(e) => setQrBgColor(e.target.value)} className="w-full px-3 py-1 bg-zinc-50 border rounded-lg text-xs font-mono" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between items-center text-center">
            <div>
              <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider mb-4">Click below to download scan image</h4>
              
              <div className="bg-white p-3 border border-zinc-200 rounded-2xl shadow-xs inline-block dark:bg-white mb-4">
                <img referrerPolicy="no-referrer" src={qrUrl} alt="Quick scan QR representation" className="w-44 h-44 object-contain" />
              </div>
            </div>

            <button
              onClick={downloadQR}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              Download High Quality QR Code
            </button>
          </div>
        </div>
      )}

      {/* 4. WORD COUNTER */}
      {toolId === 'word-counter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="word-block">
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-amber-500" />
              Enter Articles or Draft Text
            </h3>
            <textarea
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value)}
              placeholder="Paste custom stories or text sequences to analyze character parameters on the fly..."
              className="w-full h-80 px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-zinc-400 font-semibold">{wordInput.length} character bytes loaded</span>
              <button onClick={() => setWordInput('')} className="text-xs text-zinc-400 hover:text-rose-500">
                Clear Text Area
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">Dynamic Content Analysis</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-zinc-400 font-medium">Word Count</span>
                  <span className="text-2xl font-bold font-mono text-amber-500">{stats.words}</span>
                </div>
                <div>
                  <span className="block text-xs text-zinc-400 font-medium">Characters</span>
                  <span className="text-2xl font-bold font-mono text-zinc-800 dark:text-zinc-200">{stats.chars}</span>
                </div>
                <div>
                  <span className="block text-xs text-zinc-400 font-medium">Paragraphs</span>
                  <span className="text-2xl font-bold font-mono text-zinc-800 dark:text-zinc-200">{stats.paragraphs}</span>
                </div>
                <div>
                  <span className="block text-xs text-zinc-400 font-medium">Sentences</span>
                  <span className="text-2xl font-bold font-mono text-zinc-800 dark:text-zinc-200">{stats.sentences}</span>
                </div>
              </div>

              <div className="bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-200/50 p-3.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-2xs">
                <Info className="w-4 h-4" />
                Est. Reading Time: {stats.readTime}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. UNIT CONVERTER */}
      {toolId === 'unit-converter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="unit-block">
          <div className="lg:col-span-12 flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-xl gap-2 max-w-md">
            {(['length', 'weight', 'temp'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setConvCategory(cat)}
                className={`flex-1 py-1 px-3 text-xs font-bold rounded-lg uppercase tracking-wider transition ${convCategory === cat ? 'bg-amber-500 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-md font-bold text-zinc-900 dark:text-white mb-4">Input parameters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-650 dark:text-zinc-300 mb-1.5">Value To Convert</label>
                <input
                  type="number"
                  value={convVal}
                  onChange={(e) => setConvVal(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-650 dark:text-zinc-300 mb-1.5">Convert From Unit</label>
                <select
                  value={unitFrom}
                  onChange={(e) => setUnitFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-white"
                >
                  {unitConfigs[convCategory].units.map((u) => (
                    <option key={u.id} value={u.id}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-zinc-650 dark:text-zinc-300 mb-1.5">Target Converted Unit</label>
                <select
                  value={unitTo}
                  onChange={(e) => setUnitTo(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-850 rounded-lg text-sm bg-white dark:bg-zinc-950 text-zinc-850 dark:text-white shadow-2xs"
                >
                  {unitConfigs[convCategory].units.map((u) => (
                    <option key={u.id} value={u.id}>{u.label}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider mb-1">Resulting Conversion Output</h4>
                <p className="text-4xl font-extrabold text-amber-500 font-mono tracking-tight break-words">{convResult}</p>
              </div>
            </div>

            <button
              onClick={() => triggerCopy(convResult.toString(), 'conv')}
              className="mt-6 flex items-center justify-center gap-1.5 w-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-800 dark:text-zinc-250 font-bold py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs transition"
            >
              {copied === 'conv' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === 'conv' ? 'Copied Conversion!' : 'Copy Converted Payout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
