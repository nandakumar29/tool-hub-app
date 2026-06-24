import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  User, 
  Check, 
  AlertCircle, 
  BarChart2, 
  Users, 
  MousePointerClick, 
  Calendar, 
  ArrowRight, 
  RefreshCw, 
  LogOut, 
  Terminal, 
  Layers, 
  Globe, 
  Search, 
  ArrowUpRight, 
  TrendingUp, 
  Star,
  Activity,
  Cpu,
  Tv,
  ExternalLink,
  Eye,
  EyeOff,
  GitCompare,
  Award,
  Sparkles,
  Filter,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TOOLS, CATEGORIES } from '../data/tools';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

interface AnalyticsSummary {
  totalSessions: number;
  totalActivities: number;
}

interface PlatformStat {
  platform: string;
  count: number;
}

interface ReferrerStat {
  referrer: string;
  count: number;
}

interface ToolUsageStat {
  tool_id: string;
  count: number;
}

interface ToolRatingStat {
  tool_id: string;
  rating_sum: number;
  rating_count: number;
}

interface DailyStat {
  day_date: string;
  active_users: number;
  total_actions: number;
}

interface ActivityLog {
  id: number;
  session_token: string;
  action_type: string;
  details: string | null;
  created_at: string;
  platform: string | null;
  referrer: string | null;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  platforms: PlatformStat[];
  referrers: ReferrerStat[];
  toolUsage: ToolUsageStat[];
  toolRatings: ToolRatingStat[];
  dailyStats: DailyStat[];
  recentLogs: ActivityLog[];
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  // Authentication State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('toolhub_admin_token') || null;
    } catch {
      return null;
    }
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Analytics Telemetry States
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'logs'>('overview');

  // Logs & Audits Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tools Tab Advanced Sorting, Searching, Filtering & Comparison States
  const [toolSearch, setToolSearch] = useState('');
  const [toolSortBy, setToolSortBy] = useState<'score' | 'hits' | 'rating' | 'name'>('score');
  const [toolCategoryFilter, setToolCategoryFilter] = useState<string>('all');
  const [compareToolA, setCompareToolA] = useState<string>('');
  const [compareToolB, setCompareToolB] = useState<string>('');

  // Fetch Analytics logic
  const fetchAnalytics = async (authToken: string) => {
    setLoadingAnalytics(true);
    setAnalyticsError(null);
    try {
      const res = await fetch('/api/admin/analytics', {
        headers: {
          'x-admin-token': authToken
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          throw new Error('Access token expired or unauthorized. Please re-authenticate.');
        }
      }

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const textPayload = await res.text();
        throw new Error(`Server returned non-JSON/error (HTTP ${res.status}): ${textPayload.substring(0, 120)}`);
      }

      if (data && data.success) {
        setAnalyticsData(data);
      } else {
        throw new Error(data.error || 'Unknown sqlite service error occurred.');
      }
    } catch (err: any) {
      setAnalyticsError(err.message);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Perform Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError('Username and password components are strictly required.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const textPayload = await res.text();
        throw new Error(`Server returned non-JSON/error (HTTP ${res.status}): ${textPayload.substring(0, 120)}`);
      }

      if (data && data.success && data.token) {
        setToken(data.token);
        sessionStorage.setItem('toolhub_admin_token', data.token);
        fetchAnalytics(data.token);
      } else {
        setLoginError(data.error || 'Access Denied: Invalid credentials.');
      }
    } catch (err: any) {
      setLoginError(`Analytical link error: ${err.message || 'Connection failure encountered.'}`);
    } finally {
      setLoginLoading(false);
    }
  };

  // Perform Logout
  const handleLogout = () => {
    setToken(null);
    setAnalyticsData(null);
    sessionStorage.removeItem('toolhub_admin_token');
  };

  // Initial load synchronization
  useEffect(() => {
    if (token) {
      fetchAnalytics(token);
    }
  }, [token]);

  // Auto-initialize comparison tools when analytics data is loaded
  useEffect(() => {
    if (analyticsData && TOOLS.length >= 2) {
      if (!compareToolA) setCompareToolA(TOOLS[0].id);
      if (!compareToolB) setCompareToolB(TOOLS[1].id);
    }
  }, [analyticsData]);

  // Handle manual trigger refresh
  const triggerRefresh = async () => {
    if (!token) return;
    setIsRefreshing(true);
    await fetchAnalytics(token);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Humanize event classifications
  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'tool_use':
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30';
      case 'rate':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30';
      case 'navigate':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30';
      default:
        return 'bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/30';
    }
  };

  // Format SQLite ISO dates to reader-friendly clock
  const formatDateString = (dtStr: string) => {
    try {
      const dt = new Date(dtStr);
      return dt.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch {
      return dtStr;
    }
  };

  // Tool label translation
  const getToolDisplayName = (id: string) => {
    return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // --- RENDERING SECURITY ENVELOP GATE ---
  if (!token) {
    return (
      <div className="max-w-md mx-auto my-12 px-4" id="admin-login-gate">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden group"
        >
          {/* Subtle Ambient Glowing Light */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-indigo-50 dark:bg-zinc-950 border border-indigo-100 dark:border-zinc-850 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-4">Administrative Access Gate</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Enter your secure credentials to verify security access mapping and retrieve SQLite telemetry indicators.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Username / Identifier
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/15 rounded-xl text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Verifying Sign-In...
                </>
              ) : (
                <>
                  Verify Credentials
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>


        </motion.div>
      </div>
    );
  }

  // --- RENDERING SECURED ANALYTICS DASHBOARD ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" id="admin-secured-dashboard">
      
      {/* 1. SECURE SYSTEM HEADER */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Decorative Grid Line Panel background */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
        
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">ToolHub SQLite Management Console</h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                Web Engine Active
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
              Audit user sessions, track usage graphs, and map computational tool analytics driven by on-device database logging.
            </p>
          </div>
        </div>

        {/* Console Controls */}
        <div className="flex items-center gap-2 h-auto">
          <button
            onClick={triggerRefresh}
            disabled={loadingAnalytics}
            className="px-3.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-1.5 text-xs text-zinc-650 dark:text-zinc-300 font-bold transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loadingAnalytics ? 'animate-spin' : ''}`} />
            Refresh Log
          </button>
          
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/20 dark:hover:border-red-500/10 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-450 font-bold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Lock Console
          </button>
        </div>
      </div>

      {loadingAnalytics && !analyticsData && (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-medium font-mono">Assembling relational schemas & indexing sqlite variables...</p>
        </div>
      )}

      {analyticsError && (
        <div className="p-5 bg-red-500/10 border border-red-500/15 rounded-2xl flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400">Database Engine Error</h4>
            <p className="text-xs text-rose-600 dark:text-rose-350">{analyticsError}</p>
            <button 
              onClick={() => fetchAnalytics(token!)}
              className="text-xs font-bold text-indigo-600 hover:underline mt-2 inline-block cursor-pointer"
            >
              Retry Handshake Connection
            </button>
          </div>
        </div>
      )}

      {analyticsData && (
        <>
          {/* 2. OVERVIEW STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Database Sessions</span>
                <Users className="w-4.5 h-4.5 text-indigo-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                  {analyticsData.summary.totalSessions}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">recorded</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">Unique browser keys stored inside SQLite.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Telemetry Actions</span>
                <MousePointerClick className="w-4.5 h-4.5 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                  {analyticsData.summary.totalActivities}
                </span>
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +100%
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full animate-pulse" style={{ width: '75%' }}></div>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">Navigations, tool usages, and feedback actions.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Top Device OS</span>
                <Tv className="w-4.5 h-4.5 text-pink-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-zinc-900 dark:text-white truncate">
                  {analyticsData.platforms[0]?.platform || 'Other'}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  ({Math.round(((analyticsData.platforms[0]?.count || 0) / (analyticsData.summary.totalSessions || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-pink-500 h-full rounded-full" style={{ width: `${Math.round(((analyticsData.platforms[0]?.count || 0) / (analyticsData.summary.totalSessions || 1)) * 100)}%` }}></div>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">Most prominent operating system platform detected.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Top Referrer Domain</span>
                <Globe className="w-4.5 h-4.5 text-indigo-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-extrabold text-zinc-900 dark:text-white truncate max-w-[150px]">
                  {analyticsData.referrers[0]?.referrer === 'Direct' ? 'Direct / Bookmarked' : analyticsData.referrers[0]?.referrer.replace('https://', '') || 'Other'}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  ({analyticsData.referrers[0]?.count || 0})
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-650 h-full rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">Primarily identified Traffic origin of user arrivals.</p>
            </div>

          </div>

          {/* 3. SWITCH VIEW TAB TILLS */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-850 gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Interactive Analytics Charts
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`pb-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tools'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200'
              }`}
            >
              <Cpu className="w-4 h-4" />
              Tool Utilizations Ranking
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`pb-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              SQLite Telemetry Auditing Logs
            </button>
          </div>

          {/* 4. RENDERING TABS */}
          <AnimatePresence mode="wait">
            
            {/* TAB 1: OVERVIEW DASHBOARD CHARTS */}
            {activeTab === 'overview' && (
              <motion.div
                key="tab-overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Daily Actions Linear Graph Timeline */}
                <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-3xl space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Active Traffic Timeline (Last 7 Days)</h4>
                      <p className="text-[10px] text-zinc-500 font-medium">Aggregated logs mapping continuous session and interaction flows over SQLite.</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-600 rounded-full inline-block"></span>Sessions</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>Total Actions</span>
                    </div>
                  </div>

                  {/* CUSTOM INTEGRATED DESIGNER SVG TIMELINE GRAPH */}
                  <div className="relative pt-6 pb-2">
                    <div className="h-60 w-full flex items-end justify-between font-mono text-[10px] text-zinc-400 relative">
                      
                      {/* Grid Y-axis guidance line values */}
                      <div className="absolute left-0 right-0 top-0 border-t border-zinc-150 dark:border-zinc-850 opacity-55 pointer-events-none"></div>
                      <div className="absolute left-0 right-0 top-1/3 border-t border-zinc-150 dark:border-zinc-850 opacity-55 pointer-events-none"></div>
                      <div className="absolute left-0 right-0 top-2/3 border-t border-zinc-150 dark:border-zinc-850 opacity-55 pointer-events-none"></div>
                      
                      {/* Interactive Responsive Bars displaying traffic daily blocks */}
                      {analyticsData.dailyStats.map((stat, idx) => {
                        const totalMax = Math.max(...analyticsData.dailyStats.map(s => s.total_actions), 1);
                        const userPct = Math.max(10, Math.min(100, (stat.active_users / totalMax) * 100));
                        const actionPct = Math.max(15, Math.min(100, (stat.total_actions / totalMax) * 100));
                        
                        return (
                          <div key={stat.day_date} className="flex-1 flex flex-col items-center group relative h-full justify-end px-1.5">
                            
                            {/* Actions Vertical Bar Fill overlay */}
                            <div className="w-full flex justify-center items-end gap-1 h-3/4">
                              {/* Session User Pillar */}
                              <div 
                                className="w-2 bg-indigo-100 dark:bg-indigo-950/60 group-hover:bg-indigo-400 dark:group-hover:bg-indigo-600 h-full rounded-t-sm transition duration-150"
                                style={{ height: `${userPct}%` }}
                              ></div>
                              {/* Action Telemetry Pillar */}
                              <div 
                                className="w-2 bg-indigo-600 dark:bg-indigo-500 group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400 h-full rounded-t-sm transition duration-150"
                                style={{ height: `${actionPct}%` }}
                              ></div>
                            </div>

                            {/* Label */}
                            <span className="text-[9px] font-semibold text-zinc-650 dark:text-zinc-400 rotate-45 md:rotate-0 origin-center mt-3 scale-90 sm:scale-100 whitespace-nowrap">
                              {stat.day_date.split('-')[2]}/{stat.day_date.split('-')[1]}
                            </span>

                            {/* Crisp interactive Hover stats tooltip */}
                            <div className="absolute bottom-full mb-1 bg-zinc-950 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition duration-150 z-20 shadow-lg text-[9px] w-24 pointer-events-none flex flex-col gap-1 text-center font-sans border border-zinc-800">
                              <span className="font-bold border-b border-zinc-850 pb-0.5">{stat.day_date}</span>
                              <span className="text-zinc-400 flex justify-between">Users <strong className="text-indigo-400 font-mono font-bold">{stat.active_users}</strong></span>
                              <span className="text-zinc-400 flex justify-between">Actions <strong className="text-emerald-450 font-mono font-bold">{stat.total_actions}</strong></span>
                            </div>

                          </div>
                        );
                      })}

                    </div>
                  </div>
                  
                  <div className="bg-indigo-50/15 dark:bg-indigo-950/10 p-3.5 border border-indigo-100/50 dark:border-zinc-850 rounded-2xl text-[11px] text-indigo-750 dark:text-zinc-350 leading-relaxed font-semibold">
                    📈 <strong className="dark:text-white">Trend Analysis:</strong> Toolhub on-device tracking indicators denote highly recurring retention rates towards financial simulators and base64 parsing utilities. Database read-write speed currently clocks at sub-millisecond rates.
                  </div>
                </div>

                {/* Platform OS Distribution block */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Platforms */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-3xl shadow-xs space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Operating System Share</h4>
                      <p className="text-[10px] text-zinc-500 font-medium">Browser environments utilized during active connections.</p>
                    </div>

                    <div className="space-y-3.5 select-none text-[11px]">
                      {analyticsData.platforms.map((plat) => {
                        const maxCount = Math.max(...analyticsData.platforms.map(p => p.count), 1);
                        const widthPct = Math.round((plat.count / maxCount) * 100);
                        const pctStr = Math.round((plat.count / analyticsData.summary.totalSessions) * 100);
                        
                        return (
                          <div key={plat.platform} className="space-y-1">
                            <div className="flex justify-between font-bold text-zinc-650 dark:text-zinc-300">
                              <span className="flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                                <span className="w-1.5 h-1.5 bg-indigo-650 rounded-full"></span>
                                {plat.platform}
                              </span>
                              <span className="font-mono">{plat.count} ({pctStr}%)</span>
                            </div>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-650 dark:bg-indigo-500 h-full rounded-full transition" style={{ width: `${widthPct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Traffic Referrer Channels */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-3xl shadow-xs space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Traffic Acquisition Channels</h4>
                      <p className="text-[10px] text-zinc-500 font-medium">Identified referral URLs and click streams.</p>
                    </div>

                    <div className="space-y-2.5 text-[11px]">
                      {analyticsData.referrers.map((ref) => {
                        const domainName = ref.referrer === 'Direct' ? 'Direct / Bookmark arrival' : ref.referrer.replace('https://', '').replace('www.', '');
                        return (
                          <div key={ref.referrer} className="flex items-center justify-between p-2 hover:bg-zinc-50 dark:hover:bg-zinc-950 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-850/80 rounded-xl transition duration-150">
                            <span className="font-bold text-zinc-750 dark:text-zinc-300 truncate max-w-[200px]" title={ref.referrer}>
                              {domainName}
                            </span>
                            <span className="font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-md font-bold">
                              {ref.count} sessions
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 2: TOOL UTILIZATION HIGHLIGHTS & COMPARATIVE ANALYTICS */}
            {activeTab === 'tools' && (() => {
              // Pre-compile analytical metrics for all system tools based on SQLite records
              const compiledTools = TOOLS.map(tool => {
                const usage = analyticsData.toolUsage.find(u => u.tool_id === tool.id);
                const rating = analyticsData.toolRatings?.find(r => r.tool_id === tool.id);
                
                const hits = usage ? usage.count : 0;
                const rSum = rating ? rating.rating_sum : 0;
                const rCount = rating ? rating.rating_count : 0;
                const avgRating = rCount > 0 ? parseFloat((rSum / rCount).toFixed(1)) : 0;
                
                // Smart Performance Score: combines popularity, review volume, and positive sentiment
                const score = parseFloat(((hits * 0.4) + (avgRating * 1.5) + (rCount * 0.6)).toFixed(1));
                
                return {
                  ...tool,
                  hits,
                  ratingCount: rCount,
                  averageRating: avgRating,
                  score
                };
              });

              // Extract top performers for top analytical highlight cards
              const sortedByHits = [...compiledTools].sort((a, b) => b.hits - a.hits);
              const sortedByRating = [...compiledTools]
                .filter(t => t.ratingCount > 0)
                .sort((a, b) => b.averageRating - a.averageRating || b.ratingCount - a.ratingCount);
              const sortedByScore = [...compiledTools].sort((a, b) => b.score - a.score);

              const mostVisited = sortedByHits[0]?.hits > 0 ? sortedByHits[0] : null;
              const highestRated = sortedByRating.length > 0 ? sortedByRating[0] : null;
              const absoluteChampion = sortedByScore[0]?.score > 0 ? sortedByScore[0] : null;

              // Filter & Sort list of tools for the interactive grid
              const filteredTools = compiledTools
                .filter(t => {
                  const matchesSearch = t.name.toLowerCase().includes(toolSearch.toLowerCase()) || 
                                        t.id.toLowerCase().includes(toolSearch.toLowerCase()) || 
                                        t.description.toLowerCase().includes(toolSearch.toLowerCase());
                  const matchesCategory = toolCategoryFilter === 'all' || t.category === toolCategoryFilter;
                  return matchesSearch && matchesCategory;
                })
                .sort((a, b) => {
                  if (toolSortBy === 'hits') return b.hits - a.hits;
                  if (toolSortBy === 'rating') return b.averageRating - a.averageRating || b.ratingCount - a.ratingCount;
                  if (toolSortBy === 'name') return a.name.localeCompare(b.name);
                  return b.score - a.score; // Default: 'score'
                });

              // Side-by-side comparison variables
              const toolA = compiledTools.find(t => t.id === compareToolA);
              const toolB = compiledTools.find(t => t.id === compareToolB);

              return (
                <motion.div
                  key="tab-tools"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* A. PERFORMANCE SUMMARY CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Champion card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/40 dark:from-indigo-950/20 dark:to-zinc-900 border border-indigo-200/50 dark:border-indigo-500/20 p-5 rounded-2xl shadow-xs space-y-3 relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-indigo-400/20 dark:text-indigo-400/10">
                        <Award className="w-16 h-16 stroke-[1.5]" />
                      </div>
                      <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                        <Sparkles className="w-4 h-4 fill-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest">Undisputed Champion</span>
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                          {absoluteChampion ? absoluteChampion.name : 'No rating data yet'}
                        </h5>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Highest composite performance scoring utility in SQLite indexes.
                        </p>
                      </div>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-2xl font-black text-indigo-650 dark:text-indigo-400">
                          {absoluteChampion ? absoluteChampion.score : '0.0'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold font-mono">Index Score</span>
                      </div>
                    </div>

                    {/* Most Visited card */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-2xl shadow-xs space-y-3 relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-emerald-500/10">
                        <MousePointerClick className="w-16 h-16 stroke-[1.5]" />
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest">Most Demanded Tool</span>
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                          {mostVisited ? mostVisited.name : 'No usage records'}
                        </h5>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Most frequently clicked utility by on-site visitors.
                        </p>
                      </div>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          {mostVisited ? mostVisited.hits : '0'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold font-mono">telemetry hits</span>
                      </div>
                    </div>

                    {/* Highest Rated card */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-2xl shadow-xs space-y-3 relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-amber-500/10">
                        <Star className="w-16 h-16 stroke-[1.5]" />
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                        <Star className="w-4 h-4 fill-amber-500 stroke-amber-500" />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest">Highest Rated Tool</span>
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                          {highestRated ? highestRated.name : 'No ratings filed'}
                        </h5>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Eminent user rating average in sqlite database records.
                        </p>
                      </div>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-2xl font-black text-amber-600 dark:text-amber-450 flex items-center gap-1">
                          {highestRated ? highestRated.averageRating : '0.0'}{' '}
                          <Star className="w-4 h-4 fill-amber-500 stroke-amber-500 inline" />
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold font-mono">
                          ({highestRated ? highestRated.ratingCount : 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* B. SCORING FORMULA METRIC EXPLAINER */}
                  <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-850/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <div className="space-y-1 text-center sm:text-left">
                      <h5 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                        SQLite Comparative Performance Index ("Which is Better?")
                      </h5>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        We compute utility scores dynamically by weight-indexing popularity metrics alongside feedback logs.
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-xl font-mono text-[10px] text-zinc-700 dark:text-zinc-300 font-bold whitespace-nowrap shadow-xs">
                      Score = (Hits × 0.4) + (Rating Avg × 1.5) + (Rating Count × 0.6)
                    </div>
                  </div>

                  {/* C. INTERACTIVE COMPARATOR SYSTEM (SIDE-BY-SIDE ANALYZER) */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-5">
                    <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                      <GitCompare className="w-4.5 h-4.5 text-indigo-500" />
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Dual-Utility Side-by-Side Comparator</h4>
                        <p className="text-[10px] text-zinc-500">Cross-examine SQLite analytics parameters for any two tools side-by-side.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
                      {/* Selection A */}
                      <div className="lg:col-span-4 space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">Compare Utility A</label>
                        <select
                          value={compareToolA}
                          onChange={(e) => setCompareToolA(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-850 dark:text-zinc-100 focus:outline-none"
                        >
                          {TOOLS.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* VS Divider */}
                      <div className="lg:col-span-3 text-center flex flex-col justify-center items-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 dark:bg-zinc-950 border border-indigo-100 dark:border-zinc-800 text-xs font-black text-indigo-600 font-mono">VS</span>
                      </div>

                      {/* Selection B */}
                      <div className="lg:col-span-4 space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 block">Compare Utility B</label>
                        <select
                          value={compareToolB}
                          onChange={(e) => setCompareToolB(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-850 dark:text-zinc-100 focus:outline-none"
                        >
                          {TOOLS.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {toolA && toolB && (
                      <div className="border border-zinc-150 dark:border-zinc-850 rounded-2xl overflow-hidden mt-2">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-850 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                              <th className="py-3 px-4 w-1/3">Metrics</th>
                              <th className={`py-3 px-4 w-1/3 ${toolA.score >= toolB.score ? 'bg-indigo-500/5 font-extrabold text-indigo-700 dark:text-indigo-400' : ''}`}>
                                {toolA.name}
                              </th>
                              <th className={`py-3 px-4 w-1/3 ${toolB.score >= toolA.score ? 'bg-indigo-500/5 font-extrabold text-indigo-700 dark:text-indigo-400' : ''}`}>
                                {toolB.name}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850/60 font-semibold text-zinc-700 dark:text-zinc-300">
                            {/* Category Row */}
                            <tr>
                              <td className="py-3 px-4 text-zinc-450 font-medium">Category Class</td>
                              <td className="py-3 px-4 capitalize font-bold">{toolA.category}</td>
                              <td className="py-3 px-4 capitalize font-bold">{toolB.category}</td>
                            </tr>
                            {/* Total Hits Row */}
                            <tr>
                              <td className="py-3 px-4 text-zinc-450 font-medium">Total Clicks (Hits)</td>
                              <td className={`py-3 px-4 font-mono font-bold ${toolA.hits > toolB.hits ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                                {toolA.hits} {toolA.hits > toolB.hits && '🏆'}
                              </td>
                              <td className={`py-3 px-4 font-mono font-bold ${toolB.hits > toolA.hits ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                                {toolB.hits} {toolB.hits > toolA.hits && '🏆'}
                              </td>
                            </tr>
                            {/* Average Rating Row */}
                            <tr>
                              <td className="py-3 px-4 text-zinc-450 font-medium">Average Star Rating</td>
                              <td className={`py-3 px-4 font-bold ${toolA.averageRating > toolB.averageRating ? 'text-amber-600 dark:text-amber-500' : ''}`}>
                                <span className="flex items-center gap-1">
                                  {toolA.averageRating} <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                                  {toolA.averageRating > toolB.averageRating && '🏆'}
                                </span>
                              </td>
                              <td className={`py-3 px-4 font-bold ${toolB.averageRating > toolA.averageRating ? 'text-amber-600 dark:text-amber-500' : ''}`}>
                                <span className="flex items-center gap-1">
                                  {toolB.averageRating} <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                                  {toolB.averageRating > toolA.averageRating && '🏆'}
                                </span>
                              </td>
                            </tr>
                            {/* Rating Count Row */}
                            <tr>
                              <td className="py-3 px-4 text-zinc-450 font-medium">Total Reviews Filed</td>
                              <td className={`py-3 px-4 font-mono font-bold ${toolA.ratingCount > toolB.ratingCount ? 'text-indigo-650 dark:text-indigo-400' : ''}`}>
                                {toolA.ratingCount} {toolA.ratingCount > toolB.ratingCount && '🏆'}
                              </td>
                              <td className={`py-3 px-4 font-mono font-bold ${toolB.ratingCount > toolA.ratingCount ? 'text-indigo-650 dark:text-indigo-400' : ''}`}>
                                {toolB.ratingCount} {toolB.ratingCount > toolA.ratingCount && '🏆'}
                              </td>
                            </tr>
                            {/* Index Score Row */}
                            <tr className="bg-indigo-50/10 dark:bg-indigo-950/5">
                              <td className="py-3.5 px-4 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center gap-1.5">
                                <Award className="w-4 h-4" /> Performance Score
                              </td>
                              <td className={`py-3.5 px-4 font-mono text-sm font-extrabold ${toolA.score >= toolB.score ? 'text-indigo-750 dark:text-indigo-300' : 'text-zinc-400'}`}>
                                {toolA.score} {toolA.score >= toolB.score && '👑 Winner'}
                              </td>
                              <td className={`py-3.5 px-4 font-mono text-sm font-extrabold ${toolB.score >= toolA.score ? 'text-indigo-750 dark:text-indigo-300' : 'text-zinc-400'}`}>
                                {toolB.score} {toolB.score >= toolA.score && '👑 Winner'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* D. SEARCHABLE INDEX LIST OF ALL UTILITIES */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-850 pb-4">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Unified SQLite Utility Matrix</h4>
                        <p className="text-[10px] text-zinc-500 font-medium">Complete index of all catalog items combined with runtime database analytics.</p>
                      </div>

                      {/* Filtering blocks */}
                      <div className="flex flex-wrap items-center justify-end gap-2 text-xs w-full sm:w-auto">
                        {/* Search bar */}
                        <div className="relative flex-grow sm:flex-grow-0">
                          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="Filter by keyword..."
                            value={toolSearch}
                            onChange={(e) => setToolSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-800 dark:text-zinc-200 w-full sm:w-44"
                          />
                        </div>

                        {/* Category filter */}
                        <select
                          value={toolCategoryFilter}
                          onChange={(e) => setToolCategoryFilter(e.target.value)}
                          className="px-2 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs font-bold text-zinc-650 dark:text-zinc-350 focus:outline-none cursor-pointer"
                        >
                          <option value="all">All Categories</option>
                          <option value="finance">Finance</option>
                          <option value="developer">Developer</option>
                          <option value="utility">Utility</option>
                          <option value="image">Image</option>
                        </select>

                        {/* Sort selector */}
                        <select
                          value={toolSortBy}
                          onChange={(e) => setToolSortBy(e.target.value as any)}
                          className="px-2 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs font-bold text-zinc-650 dark:text-zinc-350 focus:outline-none cursor-pointer"
                        >
                          <option value="score">Sort by Quality Score</option>
                          <option value="hits">Sort by Hits / Traffic</option>
                          <option value="rating">Sort by Average Rating</option>
                          <option value="name">Sort by Utility Name</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto select-none">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-zinc-150 dark:border-zinc-850 text-zinc-450 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-3 px-4">Rank Index</th>
                            <th className="py-3 px-4">Computational Tool</th>
                            <th className="py-3 px-4 text-center">Telemetry Hits</th>
                            <th className="py-3 px-4">SQLite User Rating</th>
                            <th className="py-3 px-4">Performance Score</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850/60 font-medium text-zinc-750 dark:text-zinc-350">
                          {filteredTools.map((tool, idx) => {
                            // Find matching rating rank color
                            let rankBadge = "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
                            if (idx === 0) rankBadge = "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-450 border border-amber-300/30";
                            else if (idx === 1) rankBadge = "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300";
                            else if (idx === 2) rankBadge = "bg-amber-50/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";

                            // Get score rating classification
                            let classification = { label: "Emerging", color: "text-zinc-500 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850" };
                            if (tool.score >= 15.0) {
                              classification = { label: "Excellent Perform", color: "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50" };
                            } else if (tool.score >= 5.0) {
                              classification = { label: "Strong Perform", color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50" };
                            } else if (tool.score >= 1.0) {
                              classification = { label: "Moderate Activity", color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50" };
                            }

                            return (
                              <tr key={tool.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/25 transition duration-100">
                                <td className="py-3.5 px-4 font-mono font-extrabold">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${rankBadge}`}>
                                    {idx + 1}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-bold">
                                  <div className="flex flex-col">
                                    <span className="text-zinc-900 dark:text-white font-extrabold">{tool.name}</span>
                                    <span className="text-[10px] text-zinc-400 font-mono mt-0.5 font-bold flex items-center gap-1.5 uppercase">
                                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                      {tool.category} class
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 font-mono font-bold text-center">
                                  <div className="flex flex-col items-center justify-center">
                                    <span className="text-zinc-900 dark:text-zinc-100 font-black">{tool.hits}</span>
                                    <div className="w-16 bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden mt-1">
                                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (tool.hits / Math.max(...filteredTools.map(t => t.hits), 1)) * 100)}%` }}></div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex flex-col">
                                    <span className="flex items-center gap-1 text-zinc-900 dark:text-white font-black">
                                      {tool.averageRating}{' '}
                                      <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                                    </span>
                                    <span className="text-[9px] text-zinc-400 font-mono mt-0.5">
                                      ({tool.ratingCount} user ratings filed)
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex flex-col gap-1 items-start">
                                    <span className="font-mono text-zinc-900 dark:text-white font-black">{tool.score}</span>
                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-extrabold border uppercase tracking-wider ${classification.color}`}>
                                      {classification.label}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    onClick={() => onNavigate(`tools/${tool.id}`)}
                                    className="px-2.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] text-zinc-700 dark:text-zinc-300 font-extrabold transition cursor-pointer"
                                  >
                                    Inspect Tool
                                  </button>
                                </td>
                              </tr>
                            );
                          })}

                          {filteredTools.length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-zinc-450 font-medium">
                                No matching tools found under active filters. Verify search expression.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* TAB 3: COMPLETE AUDIT LOG FEED */}
            {activeTab === 'logs' && (
              <motion.div
                key="tab-logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-4"
              >
                {/* Search / filter control panel */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-150 dark:border-zinc-850 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">SQLite Raw Telemetry Logs</h4>
                    <p className="text-[10px] text-zinc-500 font-medium">Real-time database writes showing actual user activity mapping details.</p>
                  </div>

                  {/* Filtering widgets */}
                  <div className="flex items-center justify-end gap-2 text-xs w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                      <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search detail or session ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-800 dark:text-zinc-200"
                      />
                    </div>

                    <select
                      value={actionFilter}
                      onChange={(e) => setActionFilter(e.target.value)}
                      className="px-2 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs font-bold text-zinc-650 dark:text-zinc-350 focus:outline-none"
                    >
                      <option value="all">All Actions</option>
                      <option value="tool_use">Clicks (tool_use)</option>
                      <option value="navigate">Navigations</option>
                      <option value="rate">Reviews / ratings</option>
                    </select>
                  </div>
                </div>

                {/* Audit streams container */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-150 dark:border-zinc-850 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Event Date</th>
                        <th className="py-3 px-4">Trace Token ID</th>
                        <th className="py-3 px-4">Action Type</th>
                        <th className="py-3 px-4">Platform OS</th>
                        <th className="py-3 px-4">Event Detail Mapping</th>
                        <th className="py-3 px-4">Referrer Channel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850/60 font-medium font-sans">
                      {analyticsData.recentLogs
                        .filter(log => {
                          if (actionFilter !== 'all' && log.action_type !== actionFilter) return false;
                          if (searchQuery.trim()) {
                            const q = searchQuery.toLowerCase();
                            const matchedDetail = log.details?.toLowerCase().includes(q) || false;
                            const matchedToken = log.session_token.toLowerCase().includes(q);
                            if (!matchedDetail && !matchedToken) return false;
                          }
                          return true;
                        })
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 text-zinc-700 dark:text-zinc-300 transition duration-100">
                            <td className="py-3 px-4 font-mono text-[10px] text-zinc-500 whitespace-nowrap">
                              {formatDateString(log.created_at)}
                            </td>
                            <td className="py-3 px-4 font-mono text-[10px] text-zinc-500 whitespace-nowrap font-bold" title={log.session_token}>
                              {log.session_token.startsWith('sess_seed_') ? `seed_ch_${log.session_token.slice(-6)}` : `live_${log.session_token.slice(5, 11)}`}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${getActionBadgeColor(log.action_type)}`}>
                                {log.action_type}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap font-bold">
                              {log.platform || 'Other'}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-indigo-650 dark:text-indigo-400 font-bold max-w-[200px] truncate" title={log.details || ''}>
                              {log.details ? (
                                log.details.includes(':') ? (
                                  <span className="flex items-center gap-1 dark:text-zinc-300">
                                    Rated {getToolDisplayName(log.details.split(':')[0])}{' '}
                                    <span className="flex items-center text-amber-500 gap-0.5">
                                      {log.details.split(':')[1]} <Star className="w-2.5 h-2.5 fill-amber-500" />
                                    </span>
                                  </span>
                                ) : (
                                  getToolDisplayName(log.details)
                                )
                              ) : (
                                '/'
                              )}
                            </td>
                            <td className="py-3 px-4 text-[10px] text-zinc-400 truncate max-w-[150px]" title={log.referrer || ''}>
                              {log.referrer === 'Direct' ? 'Direct arrival' : log.referrer?.replace('https://', '') || 'None'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {analyticsData.recentLogs.length === 0 && (
                    <div className="py-12 text-center text-zinc-400">
                      No matching log details found inside database registers. Ensure your query is accurate.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

    </div>
  );
}
