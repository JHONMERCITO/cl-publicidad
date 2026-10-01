import React, { useState } from 'react';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import {
  XMarkIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e293b',
      borderRadius: 12,
      padding: '10px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      minWidth: 160,
    }}>
      <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
        {payload[0]?.payload?.date ? `Fecha: ${payload[0].payload.date}` : label}
      </p>
      <p style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 700, margin: 0 }}>
        <span style={{ color: '#F5901E', marginRight: 6 }}>●</span>
        {formatCurrency(payload[0]?.value || 0)}
      </p>
    </div>
  );
};

const SalesChartModal = ({ isOpen, onClose, data, period, title }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const totalSales = data.reduce((s, d) => s + (d.total || 0), 0);
  const avgDaily = data.length ? totalSales / data.length : 0;
  const maxDay = data.length ? Math.max(...data.map(d => d.total || 0)) : 0;

  return (
    <div className={isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'fixed inset-0 z-50 overflow-y-auto'}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className={
        isFullscreen
          ? 'relative z-10 h-full flex flex-col bg-white'
          : 'relative z-10 flex items-center justify-center min-h-screen p-4'
      }>
        <div className={
          isFullscreen
            ? 'h-full flex flex-col p-6'
            : 'bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6'
        }>
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title || 'Ventas Detalladas'}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Análisis ampliado del período</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Zoom */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setZoomLevel(z => Math.max(z - 25, 50))}
                  disabled={zoomLevel <= 50}
                  className="p-1.5 rounded text-gray-500 hover:text-gray-800 disabled:opacity-40"
                >
                  <MagnifyingGlassMinusIcon className="h-4 w-4" />
                </button>
                <span className="px-2 text-xs font-semibold text-gray-600 min-w-[40px] text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(z => Math.min(z + 25, 200))}
                  disabled={zoomLevel >= 200}
                  className="p-1.5 rounded text-gray-500 hover:text-gray-800 disabled:opacity-40"
                >
                  <MagnifyingGlassPlusIcon className="h-4 w-4" />
                </button>
                <button onClick={() => setZoomLevel(100)} className="px-2 text-xs text-gray-400 hover:text-gray-600">Reset</button>
              </div>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-800"
              >
                {isFullscreen ? <ArrowsPointingInIcon className="h-4 w-4" /> : <ArrowsPointingOutIcon className="h-4 w-4" />}
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:text-gray-700">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1">
            {data?.length > 0 ? (
              <div style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center', transition: 'transform 0.25s ease' }}>
                <ResponsiveContainer width="100%" height={isFullscreen ? 'calc(100vh - 260px)' : 420}>
                  <AreaChart data={data} margin={{ top: 15, right: 20, left: 10, bottom: 60 }}>
                    <defs>
                      <linearGradient id="modalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#F5901E" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F5901E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      angle={-40}
                      textAnchor="end"
                      height={70}
                      fontSize={10}
                      tick={{ fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      fontSize={10}
                      tick={{ fill: '#94a3b8' }}
                      tickFormatter={(v) => formatCurrency(v, { compact: true })}
                      width={62}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, (max) => Math.ceil((max * 1.15) / 100) * 100]}
                    />
                    <Tooltip content={<DarkTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#F5901E"
                      strokeWidth={2.5}
                      fill="url(#modalGrad)"
                      dot={{ r: 3.5, fill: '#F5901E', stroke: '#fff', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, fill: '#F5901E', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-gray-400">
                <ArrowTrendingUpIcon className="h-12 w-12 opacity-30" />
                <p className="text-sm">No hay ventas en el período seleccionado</p>
              </div>
            )}
          </div>

          {/* Stats footer */}
          {data?.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Días con ventas', value: data.length, color: '#6366f1' },
                { label: 'Total vendido',   value: formatCurrency(totalSales),  color: '#22c55e' },
                { label: 'Promedio diario', value: formatCurrency(avgDaily),    color: '#009E9A' },
                { label: 'Mejor día',       value: formatCurrency(maxDay),      color: '#F5901E' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl p-3 text-center" style={{ background: color + '12' }}>
                  <p className="text-lg font-bold" style={{ color }}>{value}</p>
                  <p className="text-xs mt-0.5" style={{ color: color + 'bb' }}>{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesChartModal;
