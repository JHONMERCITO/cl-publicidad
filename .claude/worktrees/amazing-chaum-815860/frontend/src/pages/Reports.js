import React, { useState, useEffect, useRef } from 'react';
import { receiptService } from '../services/receiptService';
import { expenseService } from '../services/expenseService';
import { dashboardService } from '../services/dashboardService';
import { formatDate, formatCurrency, getDateRange } from '../utils/formatters';
import Button from '../components/Button';
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

// Paleta de marca
const BRAND = ['#F5901E', '#009E9A', '#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#8B5CF6'];

// Tooltip oscuro reutilizable
const DarkTooltip = ({ active, payload, label, labelKey, valueFormatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e293b', borderRadius: 12, padding: '10px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)', minWidth: 160,
    }}>
      <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>
        {labelKey ? payload[0]?.payload?.[labelKey] || label : label}
      </p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600, margin: 0 }}>
          <span style={{ color: entry.color || '#F5901E', marginRight: 6 }}>●</span>
          {valueFormatter ? valueFormatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sales');
  const printRef = useRef();
  
  const [dateRange, setDateRange] = useState({
    start_date: getDateRange('month').startDate,
    end_date: getDateRange('month').endDate,
  });
  
  // Estados para cada tipo de reporte
  const [salesReport, setSalesReport] = useState(null);
  const [expensesReport, setExpensesReport] = useState(null);
  const [profitLossReport, setProfitLossReport] = useState(null);

  useEffect(() => {
    handleGenerateReport();
  }, [dateRange, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateChange = (key, value) => {
    setDateRange(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const setPredefinedRange = (range) => {
    const dates = getDateRange(range);
    setDateRange({
      start_date: dates.startDate,
      end_date: dates.endDate,
    });
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'sales':
          await generateSalesReport();
          break;
        case 'expenses':
          await generateExpensesReport();
          break;
        case 'profit':
          await generateProfitLossReport();
          break;
        default:
          break;
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const generateSalesReport = async () => {
    const response = await receiptService.getSalesReport(dateRange);
    setSalesReport(response.data);
  };

  const generateExpensesReport = async () => {
    const response = await expenseService.getExpensesReport(dateRange);
    setExpensesReport(response.data);
  };

  const generateProfitLossReport = async () => {
    const response = await dashboardService.getProfitLossReport(dateRange);
    setProfitLossReport(response.data);
  };

  // Función para generar PDF
  const exportToPDF = async () => {
    try {
      setLoading(true);
      
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Agregar logo y encabezado
      pdf.setFontSize(20);
      pdf.setTextColor(40);
      pdf.text('Big Arte', 20, 15);
      
      pdf.setFontSize(14);
      pdf.text(getReportTitle(), 20, 25);
      
      pdf.setFontSize(10);
      pdf.text(`Período: ${formatDate(dateRange.start_date)} - ${formatDate(dateRange.end_date)}`, 20, 35);
      pdf.text(`Generado: ${formatDate(new Date().toISOString())}`, 20, 42);

      // Agregar el contenido del reporte
      position = 50;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - position;

      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 50;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Guardar PDF
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${getReportFilename()}_${timestamp}.pdf`;
      pdf.save(filename);

    } catch (error) {
      alert('Error al generar el PDF. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      if (activeTab === 'sales' && salesReport) {
        exportSalesToExcel(workbook, salesReport);
      } else if (activeTab === 'expenses' && expensesReport) {
        exportExpensesToExcel(workbook, expensesReport);
      } else if (activeTab === 'profit' && profitLossReport) {
        exportProfitLossToExcel(workbook, profitLossReport);
      }

      // Guardar archivo Excel
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${getReportFilename()}_${timestamp}.xlsx`;
      XLSX.writeFile(workbook, filename);

    } catch (error) {
      alert('Error al generar el archivo Excel. Intenta de nuevo.');
    }
  };

  const exportSalesToExcel = (workbook, report) => {
    // Hoja de resumen
    const summaryData = [
      ['REPORTE DE VENTAS'],
      [`Período: ${formatDate(dateRange.start_date)} - ${formatDate(dateRange.end_date)}`],
      [''],
      ['RESUMEN'],
      ['Total de Ventas', report.summary?.total_sales || 0],
      ['Número de Recibos', report.summary?.total_receipts || 0],
      ['Ticket Promedio', report.summary?.average_ticket || 0],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

    // Hoja de servicios más vendidos
    const topServices = report.top_services && typeof report.top_services === 'object' 
      ? Object.values(report.top_services).filter(item => item && item.name)
      : [];
    
    const servicesData = [
      ['SERVICIOS MÁS VENDIDOS'],
      [''],
      ['Servicio', 'Cantidad', 'Total']
    ];
    
    topServices.forEach(service => {
      servicesData.push([service.name, service.quantity, service.total]);
    });
    
    const servicesSheet = XLSX.utils.aoa_to_sheet(servicesData);
    XLSX.utils.book_append_sheet(workbook, servicesSheet, 'Servicios');

    // Hoja de ventas detalladas
    const salesData = [
      ['VENTAS DETALLADAS'],
      [''],
      ['Recibo', 'Cliente', 'Total', 'Fecha', 'Vendedor']
    ];
    
    (report.receipts || []).forEach(receipt => {
      salesData.push([
        receipt.receipt_number,
        receipt.customer_name,
        receipt.total,
        formatDate(receipt.receipt_date),
        receipt.user?.name || 'Sin asignar'
      ]);
    });
    
    const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Ventas Detalladas');
  };

  const exportExpensesToExcel = (workbook, report) => {
    // Hoja de resumen
    const summaryData = [
      ['REPORTE DE GASTOS'],
      [`Período: ${formatDate(dateRange.start_date)} - ${formatDate(dateRange.end_date)}`],
      [''],
      ['RESUMEN'],
      ['Total de Gastos', report.summary?.total_expenses || 0],
      ['Número de Gastos', report.summary?.total_count || 0],
      ['Gasto Promedio', report.summary?.average_expense || 0],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

    // Hoja de gastos por categoría
    const categoryData = [
      ['GASTOS POR CATEGORÍA'],
      [''],
      ['Categoría', 'Total', 'Cantidad']
    ];
    
    Object.entries(report.by_category || {}).forEach(([category, data]) => {
      categoryData.push([category, data?.total || 0, data?.count || 0]);
    });
    
    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Por Categoría');

    // Hoja de gastos detallados
    const expensesData = [
      ['GASTOS DETALLADOS'],
      [''],
      ['Descripción', 'Categoría', 'Monto', 'Fecha', 'Proveedor']
    ];
    
    Object.entries(report.by_category || {}).forEach(([category, data]) => {
      (data?.expenses || []).forEach(expense => {
        expensesData.push([
          expense.description,
          category,
          expense.amount,
          formatDate(expense.expense_date),
          expense.supplier || 'Sin proveedor'
        ]);
      });
    });
    
    const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Gastos Detallados');
  };

  const exportProfitLossToExcel = (workbook, report) => {
    // Estado de resultados
    const profitLossData = [
      ['ESTADO DE RESULTADOS'],
      [`Período: ${formatDate(dateRange.start_date)} - ${formatDate(dateRange.end_date)}`],
      [''],
      ['INGRESOS'],
      ['Ventas Totales', report.income?.total_sales || 0],
      ['Total Ingresos', report.income?.net_income || 0],
      [''],
      ['GASTOS']
    ];
    
    Object.entries(report.expenses?.by_category || {}).forEach(([category, amount]) => {
      profitLossData.push([category, amount]);
    });
    
    profitLossData.push(
      ['Total Gastos', report.expenses?.total || 0],
      [''],
      ['RESULTADO'],
      ['Utilidad Bruta', report.profit?.gross_profit || 0],
      ['Margen de Utilidad (%)', (report.profit?.profit_margin || 0).toFixed(2)]
    );
    
    const profitSheet = XLSX.utils.aoa_to_sheet(profitLossData);
    XLSX.utils.book_append_sheet(workbook, profitSheet, 'Estado de Resultados');
  };

  // Función simple para imprimir
  const handlePrint = () => {
    window.print();
  };

  const getReportTitle = () => {
    switch (activeTab) {
      case 'sales': return 'Reporte de Ventas';
      case 'expenses': return 'Reporte de Gastos';
      case 'profit': return 'Estado de Resultados';
      default: return 'Reporte';
    }
  };

  const getReportFilename = () => {
    switch (activeTab) {
      case 'sales': return 'reporte_ventas';
      case 'expenses': return 'reporte_gastos';
      case 'profit': return 'estado_resultados';
      default: return 'reporte';
    }
  };

  const tabs = [
    { id: 'sales', name: 'Reporte de Ventas', icon: CurrencyDollarIcon },
    { id: 'expenses', name: 'Reporte de Gastos', icon: ArrowTrendingDownIcon },
    { id: 'profit', name: 'Utilidades y Pérdidas', icon: ArrowTrendingUpIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between no-print">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Reportes
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {getReportTitle()} • {formatDate(dateRange.start_date)} - {formatDate(dateRange.end_date)}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 md:mt-0 md:ml-4 no-print">
          <Button variant="secondary" onClick={exportToExcel}>
            <TableCellsIcon className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="secondary" onClick={exportToPDF}>
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={handlePrint}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Controles de fecha */}
      <div className="bg-white rounded-xl shadow-sm p-5 no-print">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { key: 'today', label: 'Hoy' },
                { key: 'week', label: 'Esta semana' },
                { key: 'month', label: 'Este mes' },
                { key: 'quarter', label: 'Este trimestre' },
                { key: 'year', label: 'Este año' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPredefinedRange(key)}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:border-primary-400 hover:text-primary-600 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
            
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => handleDateChange('start_date', e.target.value)}
                  className="mt-1 input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => handleDateChange('end_date', e.target.value)}
                  className="mt-1 input-field"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200 no-print">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6" ref={printRef}>
          {/* Header de impresión */}
          <div className="print-only mb-6 text-center border-b pb-4">
            <h1 className="text-2xl font-bold">Big Arte</h1>
            <h2 className="text-lg">{getReportTitle()}</h2>
            <p className="text-sm text-gray-600">
              Período: {formatDate(dateRange.start_date)} - {formatDate(dateRange.end_date)}
            </p>
            <p className="text-sm text-gray-600">
              Generado: {formatDate(new Date().toISOString())}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
              <span className="ml-4 text-gray-600">Procesando reporte...</span>
            </div>
          ) : (
            <div>
              {activeTab === 'sales' && <SalesReport report={salesReport} />}
              {activeTab === 'expenses' && <ExpensesReport report={expensesReport} />}
              {activeTab === 'profit' && <ProfitLossReport report={profitLossReport} />}
            </div>
          )}
        </div>
      </div>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 15mm; }
          .space-y-6 > * + * { margin-top: 1rem; }
        }
      `}</style>
    </div>
  );
};

// Componente de reporte de ventas
const SalesReport = ({ report }) => {
  if (!report || !report.summary || !report.top_services || !report.receipts) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No hay datos disponibles para mostrar</div>
        <div className="text-sm text-gray-400 mt-2">Selecciona un período con ventas registradas</div>
      </div>
    );
  }

  const topServices = report.top_services && typeof report.top_services === 'object' 
    ? Object.values(report.top_services).filter(item => item && item.name)
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <MetricCard
          title="Total de Ventas"
          value={formatCurrency(report.summary?.total_sales || 0)}
          icon={CurrencyDollarIcon}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <MetricCard
          title="Número de Recibos"
          value={(report.summary?.total_receipts || 0).toLocaleString()}
          icon={DocumentChartBarIcon}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <MetricCard
          title="Ticket Promedio"
          value={formatCurrency(report.summary?.average_ticket || 0)}
          icon={ArrowTrendingUpIcon}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Servicios Más Vendidos</h3>
          <div className="space-y-2">
            {topServices.length > 0 ? (
              topServices.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2.5 bg-white rounded-lg shadow-sm">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: BRAND[index % BRAND.length] }}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name || 'Sin nombre'}</p>
                    <p className="text-xs text-gray-400">{item.quantity || 0} unidades</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 shrink-0">{formatCurrency(item.total || 0)}</span>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-sm text-gray-400">No hay servicios vendidos en este período</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribución por Servicio</h3>
          {topServices.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={topServices.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="quantity"
                  paddingAngle={3}
                  label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {topServices.slice(0, 6).map((_, i) => (
                    <Cell key={i} fill={BRAND[i % BRAND.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <DarkTooltip
                      labelKey="name"
                      valueFormatter={(v) => `${v} unidades`}
                    />
                  }
                />
                <Legend
                  formatter={(value, entry) => (
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                      {entry.payload?.name?.substring(0, 18) || value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">
              No hay datos suficientes
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Ventas del Período
        </h3>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recibo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendedor</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(report.receipts || []).map((receipt) => (
                <tr key={receipt.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {receipt.receipt_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {receipt.customer_name || 'Sin nombre'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(receipt.total || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(receipt.receipt_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {receipt.user?.name || 'Sin asignar'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Componente de reporte de gastos
const ExpensesReport = ({ report }) => {
  if (!report || !report.summary || !report.by_category) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No hay datos de gastos disponibles</div>
        <div className="text-sm text-gray-400 mt-2">Selecciona un período con gastos registrados</div>
      </div>
    );
  }

  const categoryData = Object.entries(report.by_category || {}).map(([category, data]) => ({
    category,
    total: data?.total || 0,
    count: data?.count || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <MetricCard
          title="Total de Gastos"
          value={formatCurrency(report.summary?.total_expenses || 0)}
          icon={ArrowTrendingDownIcon}
          color="text-red-600"
          bgColor="bg-red-100"
        />
        <MetricCard
          title="Número de Gastos"
          value={(report.summary?.total_count || 0).toLocaleString()}
          icon={DocumentChartBarIcon}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <MetricCard
          title="Gasto Promedio"
          value={formatCurrency(report.summary?.average_expense || 0)}
          icon={ArrowTrendingDownIcon}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Gastos por Categoría</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
              <defs>
                <linearGradient id="expBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#F5901E" stopOpacity={1} />
                  <stop offset="100%" stopColor="#e07a10" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="category"
                angle={-35}
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
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<DarkTooltip labelKey="category" valueFormatter={(v) => formatCurrency(v)} />}
              />
              <Bar dataKey="total" fill="url(#expBarGrad)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribución por Categoría</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="total"
                paddingAngle={3}
                label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                labelLine={false}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={BRAND[i % BRAND.length]} />
                ))}
              </Pie>
              <Tooltip
                content={<DarkTooltip labelKey="category" valueFormatter={(v) => formatCurrency(v)} />}
              />
              <Legend
                formatter={(value, entry) => (
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    {entry.payload?.category || value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Gastos del Período por Categoría</h3>
        <div className="space-y-4">
          {Object.entries(report.by_category || {}).map(([category, data]) => (
            <div key={category} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{category || 'Sin categoría'}</h4>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(data?.total || 0)}</p>
                  <p className="text-xs text-gray-500">{data?.count || 0} gastos</p>
                </div>
              </div>
              <div className="space-y-2">
                {(data?.expenses || []).slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <p className="text-gray-900">{expense.description || 'Sin descripción'}</p>
                      <p className="text-gray-500 text-xs">
                        {formatDate(expense.expense_date)}
                        {expense.supplier && ` • ${expense.supplier}`}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900">{formatCurrency(expense.amount || 0)}</p>
                  </div>
                ))}
                {(data?.expenses || []).length > 5 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Y {(data?.expenses || []).length - 5} gastos más...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente de reporte de utilidades y pérdidas
const ProfitLossReport = ({ report }) => {
  if (!report || !report.income || !report.expenses || !report.profit) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No hay datos de utilidades disponibles</div>
        <div className="text-sm text-gray-400 mt-2">Selecciona un período con ventas y gastos registrados</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <MetricCard
          title="Ingresos Totales"
          value={formatCurrency(report.income?.total_sales || 0)}
          icon={ArrowTrendingUpIcon}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <MetricCard
          title="Gastos Totales"
          value={formatCurrency(report.expenses?.total || 0)}
          icon={ArrowTrendingDownIcon}
          color="text-red-600"
          bgColor="bg-red-100"
        />
        <MetricCard
          title="Utilidad Neta"
          value={formatCurrency(report.profit?.gross_profit || 0)}
          icon={(report.profit?.gross_profit || 0) >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon}
          color={(report.profit?.gross_profit || 0) >= 0 ? "text-green-600" : "text-red-600"}
          bgColor={(report.profit?.gross_profit || 0) >= 0 ? "bg-green-100" : "bg-red-100"}
        />
      </div>

      <div className="bg-gray-50 rounded-xl p-5">
        <h3 className="text-base font-bold text-gray-800 mb-5">Estado de Resultados</h3>
        <div className="space-y-5">
          {/* Ingresos */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ingresos</p>
            <div className="bg-white rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ventas Totales</span>
                <span className="font-semibold text-gray-800">{formatCurrency(report.income?.total_sales || 0)}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="font-semibold text-gray-700">Total Ingresos</span>
                <span className="font-bold text-green-600">{formatCurrency(report.income?.net_income || 0)}</span>
              </div>
            </div>
          </div>

          {/* Gastos */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Gastos</p>
            <div className="bg-white rounded-lg p-4 space-y-2">
              {Object.entries(report.expenses?.by_category || {}).map(([category, amount]) => (
                <div key={category} className="flex justify-between text-sm">
                  <span className="text-gray-600">{category || 'Sin categoría'}</span>
                  <span className="font-medium text-gray-700">{formatCurrency(amount || 0)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="font-semibold text-gray-700">Total Gastos</span>
                <span className="font-bold text-red-500">{formatCurrency(report.expenses?.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div
            className="rounded-xl p-4 flex items-center justify-between"
            style={{ background: (report.profit?.gross_profit || 0) >= 0 ? '#22c55e18' : '#ef444418' }}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest"
                style={{ color: (report.profit?.gross_profit || 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                Utilidad Bruta
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Margen: {(report.profit?.profit_margin || 0).toFixed(1)}%
              </p>
            </div>
            <p className="text-2xl font-black"
              style={{ color: (report.profit?.gross_profit || 0) >= 0 ? '#16a34a' : '#dc2626' }}>
              {formatCurrency(report.profit?.gross_profit || 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-4" style={{ background: '#009E9A12' }}>
          <h4 className="font-semibold mb-2 text-sm" style={{ color: '#007a77' }}>Análisis de Rentabilidad</h4>
          <p className="text-sm text-gray-600">
            Por cada <b>Bs 1</b> vendido, la utilidad es:{' '}
            <span className="font-bold" style={{ color: '#007a77' }}>
              {formatCurrency((report.profit?.gross_profit || 0) / (report.income?.total_sales || 1))}
            </span>
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold mb-2 text-sm text-gray-700">Período Analizado</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Desde: <span className="font-semibold text-gray-800">{formatDate(report.period?.start_date)}</span></p>
            <p>Hasta: <span className="font-semibold text-gray-800">{formatDate(report.period?.end_date)}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de tarjeta de métrica
const ACCENT_MAP = {
  'text-green-600':  '#22c55e',
  'text-red-600':    '#ef4444',
  'text-blue-600':   '#3b82f6',
  'text-purple-600': '#8b5cf6',
  'text-orange-600': '#F5901E',
};

const MetricCard = ({ title, value, icon: Icon, color, bgColor }) => {
  const accent = ACCENT_MAP[color] || '#F5901E';
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      style={{ borderLeft: `4px solid ${accent}` }}>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: accent + '18' }}>
            <Icon className="h-5 w-5" style={{ color: accent }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-400 truncate">{title}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;