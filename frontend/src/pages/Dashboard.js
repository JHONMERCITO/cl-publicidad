import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import branchService from '../services/branchService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import SalesChartModal from '../components/charts/SalesChartModal';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartPieIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// Paleta de marca
const BRAND = ['#F5901E', '#009E9A', '#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#8B5CF6'];

// Tooltip personalizado oscuro
const DarkTooltip = ({ active, payload, label, labelFormatter, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e293b',
      border: 'none',
      borderRadius: 12,
      padding: '10px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      minWidth: 160,
    }}>
      <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
        {labelFormatter ? labelFormatter(label, payload) : label}
      </p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600, margin: 0 }}>
          <span style={{ color: entry.color || '#F5901E', marginRight: 6 }}>●</span>
          {formatter ? formatter(entry.value, entry.name)[0] : entry.value}
        </p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [branchFilter, setBranchFilter] = useState('');
  const [branches, setBranches] = useState([]);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const formatDateForChart = (dateString, dataLength) => {
    const date = new Date(dateString);
    if (dataLength > 20) {
      return date.toLocaleDateString('es-BO', { month: 'short', day: 'numeric' }).replace('.', '');
    }
    if (dataLength > 10) {
      return date.toLocaleDateString('es-BO', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('es-BO', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  useEffect(() => {
    if (isAdmin) branchService.getAll().then(res => setBranches(res.data)).catch(() => {});
  }, [isAdmin]);

  useEffect(() => { fetchDashboardData(); }, [period, branchFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = { period };
      if (branchFilter) params.branch_id = branchFilter;
      const response = await dashboardService.getDashboardData(params);
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary-100 border-t-primary-500" />
          <p className="text-sm text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se pudieron cargar los datos del dashboard</p>
        <button onClick={fetchDashboardData} className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm">
          Intentar de nuevo
        </button>
      </div>
    );
  }

  const { metrics, charts, recent_data } = dashboardData;

  const periodLabel = { today: 'Hoy', week: 'Esta Semana', month: 'Este Mes', year: 'Este Año' }[period];

  // Datos para donut de gastos
  const expensesData = (charts.expenses_by_category || []).map(item => ({
    ...item,
    total: parseFloat(item.total),
  }));
  const hasExpenses = expensesData.length > 0;

  // Datos para AreaChart de ventas
  const salesData = (charts.sales_by_day || []).map(item => ({
    ...item,
    total: parseFloat(item.total) || 0,
    formattedDate: formatDateForChart(item.date, charts.sales_by_day.length),
  }));
  const hasSales = salesData.length > 0;

  // Datos para barras de servicios
  const servicesData = (charts.top_services || []).slice(0, 12).map(item => ({
    ...item,
    shortName: item.name.length > 20 ? item.name.substring(0, 20) + '…' : item.name,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-0.5 text-sm text-gray-500">Bienvenido, {user?.name}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          {isAdmin && branches.length > 0 && (
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="rounded-lg border-gray-200 shadow-sm text-sm focus:border-primary-400 focus:ring-primary-400 bg-white px-3 py-2"
            >
              <option value="">Todas las sucursales</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border-gray-200 shadow-sm text-sm focus:border-primary-400 focus:ring-primary-400 bg-white px-3 py-2"
          >
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="year">Este año</option>
          </select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Ventas Totales"     value={formatCurrency(metrics.total_sales)}           icon={CurrencyDollarIcon}    accent="#22c55e" />
        {isAdmin && <MetricCard title="Gastos Totales"     value={formatCurrency(metrics.total_expenses)}        icon={ArrowTrendingDownIcon} accent="#ef4444" />}
        {isAdmin && <MetricCard title="Utilidad Neta"      value={formatCurrency(metrics.net_profit)}            icon={metrics.net_profit >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon} accent={metrics.net_profit >= 0 ? '#22c55e' : '#ef4444'} />}
        <MetricCard title="Anticipos"          value={formatCurrency(metrics.total_advances || 0)}   icon={CurrencyDollarIcon}    accent="#3b82f6" />
        <MetricCard title="Por Cobrar"         value={formatCurrency(metrics.pending_payments || 0)} icon={ExclamationTriangleIcon} accent="#F5901E" />
        <MetricCard title="Listos Entrega"     value={String(metrics.receipts_ready_delivery || 0)} icon={ShoppingCartIcon}      accent="#8b5cf6" />
      </div>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard title="N° Ventas"        value={String(metrics.sales_count || 0)}              icon={ShoppingCartIcon}      accent="#6366f1" small />
        <MetricCard title="Ticket Promedio"  value={formatCurrency(metrics.average_ticket || 0)}   icon={ChartPieIcon}          accent="#64748b" small />
        <MetricCard title="Con Anticipo"     value={String(metrics.receipts_with_advance || 0)}    icon={CurrencyDollarIcon}    accent="#06b6d4" small />
        <MetricCard title="Solo Cotizados"   value={String(metrics.receipts_only_quoted || 0)}     icon={ExclamationTriangleIcon} accent="#eab308" small />
      </div>

      {/* Métricas por sucursal (admin, sin filtro de sucursal) */}
      {isAdmin && !branchFilter && dashboardData?.branch_metrics?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Por Sucursal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.branch_metrics.map(branch => (
              <div key={branch.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-primary-400">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-800">{branch.name}</p>
                  <span className="text-xs text-gray-400">{branch.users_count} vendedor{branch.users_count !== 1 ? 'es' : ''}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ventas</span>
                    <span className="font-semibold text-green-600">{formatCurrency(branch.total_sales)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Por cobrar</span>
                    <span className="font-semibold text-orange-500">{formatCurrency(branch.pending)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Ventas — Area Chart */}
        <ChartCard
          title={`Ventas — ${periodLabel}`}
          action={
            hasSales && (
              <button
                onClick={() => setIsSalesModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 bg-gray-100 hover:bg-primary-50 px-2 py-1 rounded-md transition-colors"
              >
                <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                Ampliar
              </button>
            )
          }
        >
          {hasSales ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesData} margin={{ top: 10, right: 20, left: 10, bottom: 80 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F5901E" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F5901E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" />
                <XAxis
                  dataKey="formattedDate"
                  angle={-40}
                  textAnchor="end"
                  height={80}
                  fontSize={9}
                  tick={{ fill: '#94a3b8' }}
                  interval={Math.max(0, Math.floor(salesData.length / 8))}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  fontSize={9}
                  tick={{ fill: '#94a3b8' }}
                  tickFormatter={(v) => formatCurrency(v, { compact: true })}
                  width={58}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, (dataMax) => dataMax > 0 ? Math.ceil((dataMax * 1.2) / 50) * 50 : 500]}
                />
                <Tooltip
                  content={
                    <DarkTooltip
                      labelFormatter={(label, payload) =>
                        payload?.[0]?.payload?.date ? `Fecha: ${payload[0].payload.date}` : label
                      }
                      formatter={(v) => [formatCurrency(v), 'Ventas']}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#F5901E"
                  strokeWidth={2.5}
                  fill="url(#salesGrad)"
                  dot={{ r: 3, fill: '#F5901E', stroke: '#fff', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#F5901E', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart icon={ArrowTrendingUpIcon} label="No hay ventas en este período" />
          )}
        </ChartCard>

        {/* Gastos por categoría — Donut (solo admin) */}
        {isAdmin && (
          <ChartCard title={`Gastos por Categoría — ${periodLabel}`}>
            {hasExpenses ? (
              <DonutChart data={expensesData} dataKey="total" nameKey="category" colors={BRAND} />
            ) : (
              <EmptyChart icon={ChartPieIcon} label="No hay gastos en este período" />
            )}
          </ChartCard>
        )}
      </div>

      {/* Servicios más vendidos — Bar Chart con gradiente */}
      <ChartCard title="Servicios Más Vendidos">
        {servicesData.length > 0 ? (
          <div className="overflow-x-auto">
            <ResponsiveContainer
              width="100%"
              height={Math.max(300, servicesData.length * 38)}
              minWidth={Math.max(500, servicesData.length * 55)}
            >
              <BarChart
                data={servicesData}
                margin={{ top: 10, right: 20, left: 10, bottom: 100 }}
              >
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#F5901E" stopOpacity={1} />
                    <stop offset="100%" stopColor="#e07a10" stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  angle={-40}
                  textAnchor="end"
                  height={100}
                  fontSize={10}
                  tick={{ fill: '#94a3b8' }}
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  fontSize={10}
                  tick={{ fill: '#94a3b8' }}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={
                    <DarkTooltip
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.name || label}
                      formatter={(v) => [v + ' uds.', 'Cantidad']}
                    />
                  }
                />
                <Bar dataKey="total_quantity" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart icon={ShoppingCartIcon} label="No hay servicios vendidos en este período" />
        )}
      </ChartCard>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas recientes */}
        <ChartCard title="Ventas Recientes">
          {recent_data?.sales?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Recibo</th>
                    <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
                    <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recent_data.sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-orange-50/40 transition-colors">
                      <td className="py-2.5 font-medium text-gray-800">{sale.receipt_number}</td>
                      <td className="py-2.5 text-gray-600">{sale.customer_name}</td>
                      <td className="py-2.5 font-semibold text-gray-800">{formatCurrency(sale.total)}</td>
                      <td className="py-2.5 text-gray-400 text-xs">{formatDate(sale.receipt_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyChart icon={ShoppingCartIcon} label="No hay ventas recientes" />
          )}
        </ChartCard>

        {/* Pagos recientes */}
        <ChartCard title="Pagos Recientes">
          {recent_data?.payments?.length > 0 ? (
            <div className="space-y-2.5">
              {recent_data.payments.map((payment) => {
                const typeColor = payment.type === 'anticipo' ? '#3b82f6' : payment.type === 'pago_final' ? '#22c55e' : '#F5901E';
                const typeLabel = payment.type === 'anticipo' ? 'Anticipo' : payment.type === 'pago_final' ? 'Pago Final' : 'Abono';
                return (
                  <div key={payment.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: typeColor + '20' }}>
                      <CurrencyDollarIcon className="h-4 w-4" style={{ color: typeColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {formatCurrency(payment.amount)} <span className="font-normal text-gray-500">— {typeLabel}</span>
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {payment.receipt.receipt_number} · {payment.receipt.customer_name}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{formatDate(payment.paid_at)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyChart icon={CurrencyDollarIcon} label="No hay pagos recientes" />
          )}
        </ChartCard>
      </div>

      <SalesChartModal
        isOpen={isSalesModalOpen}
        onClose={() => setIsSalesModalOpen(false)}
        data={charts?.sales_by_day || []}
        period={period}
        title={`Ventas Detalladas — ${periodLabel}`}
      />
    </div>
  );
};

// ── Componentes reutilizables ──────────────────────────────────────────────────

const MetricCard = ({ title, value, icon: Icon, accent, small }) => (
  <div
    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    style={{ borderLeft: `4px solid ${accent}` }}
  >
    <div className={`p-4 ${small ? 'py-3' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: accent + '18' }}>
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-400 font-medium truncate leading-tight">{title}</p>
          <p className={`font-bold text-gray-900 leading-tight mt-0.5 ${small ? 'text-base' : 'text-lg'}`}>{value}</p>
        </div>
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, action, children }) => (
  <div className="bg-white rounded-xl shadow-sm p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const EmptyChart = ({ icon: Icon, label }) => (
  <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-400">
    <Icon className="h-10 w-10 opacity-30" />
    <p className="text-sm">{label}</p>
  </div>
);

// Donut chart con leyenda lateral
const DonutChart = ({ data, dataKey, nameKey, colors }) => {
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <div className="flex items-center gap-4">
      <div style={{ flex: '0 0 200px' }}>
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              dataKey={dataKey}
              labelLine={false}
              label={renderLabel}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              content={
                <DarkTooltip
                  formatter={(v, n, p) => [formatCurrency(v), p?.payload?.[nameKey] || n]}
                />
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        {data.slice(0, 7).map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
            <span className="text-xs text-gray-600 truncate flex-1">{item[nameKey]}</span>
            <span className="text-xs font-semibold text-gray-800 shrink-0">{formatCurrency(item[dataKey])}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
