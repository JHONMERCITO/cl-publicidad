// Sistema de formateo para CL Publicidad y Diseño - Bolivia
// Moneda fija: BOB (Bolivianos) — Zona horaria: America/La_Paz (UTC-4)

const CURRENCY_CONFIG = {
  BOB: {
    locale: 'es-BO',
    currency: 'BOB',
    name: 'Bolivianos',
    symbol: 'Bs',
    timezone: 'America/La_Paz'
  }
};

const getCurrentCurrency = () => 'BOB';

// Formateo de moneda dinámico
export const formatCurrency = (amount, options = {}) => {
  // Permitir tanto currencyCode como options object
  let currencyCode = null;
  let compact = false;
  
  if (typeof options === 'string') {
    // Retrocompatibilidad: formatCurrency(amount, 'USD')
    currencyCode = options;
  } else {
    // Nuevo formato: formatCurrency(amount, { currencyCode: 'USD', compact: true })
    currencyCode = options.currencyCode;
    compact = options.compact || false;
  }
  
  if (amount == null || isNaN(amount)) return formatZero(currencyCode);
  
  // Usar moneda especificada o la configuración actual
  const currency = currencyCode || getCurrentCurrency();
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.BOB;
  
  try {
    // Formato compacto para gráficas
    if (compact) {
      const absAmount = Math.abs(amount);
      let formattedValue;
      let suffix = '';
      
      if (absAmount >= 1000000) {
        formattedValue = (amount / 1000000).toFixed(1);
        suffix = 'M';
      } else if (absAmount >= 1000) {
        formattedValue = (amount / 1000).toFixed(1);
        suffix = 'K';
      } else {
        formattedValue = amount.toFixed(0);
      }
      
      return `${config.symbol}${formattedValue}${suffix}`;
    }
    
    // Formato completo normal
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback manual si Intl falla
    const formattedNumber = new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
    
    return `${config.symbol} ${formattedNumber}`;
  }
};

// Formateo de cero según la moneda
const formatZero = (currencyCode = null) => {
  const currency = currencyCode || getCurrentCurrency();
  if (currency === 'USD') {
    return '$0.00';
  } else {
    return 'Bs 0,00';
  }
};

// Formateo de números según el locale de la moneda
export const formatNumber = (number) => {
  if (number == null || isNaN(number)) return '0';
  
  const currency = getCurrentCurrency();
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.BOB;
  
  return new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
};

// Formateo de enteros (sin decimales)
export const formatInteger = (number) => {
  if (number == null || isNaN(number)) return '0';
  
  const currency = getCurrentCurrency();
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.BOB;
  
  return new Intl.NumberFormat(config.locale).format(number);
};

// Formateo de fechas con zona horaria de Bolivia
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const currency = getCurrentCurrency();
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.BOB;
  
  const date = new Date(dateString);
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    timeZone: config.timezone, // Forzar zona horaria de Bolivia
    ...options
  };
  
  return date.toLocaleDateString(config.locale, defaultOptions);
};

// Formateo de fecha y hora con zona horaria de Bolivia
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  const currency = getCurrentCurrency();
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.BOB;
  
  const date = new Date(dateString);
  return date.toLocaleDateString(config.locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: config.timezone, // Forzar zona horaria de Bolivia
    hour12: false // Formato 24 horas para Bolivia
  });
};

// Obtener símbolo de moneda actual
export const getCurrencySymbol = () => {
  const currency = getCurrentCurrency();
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.BOB;
  return config.symbol;
};

// Obtener nombre de moneda actual
export const getCurrencyName = () => {
  const currency = getCurrentCurrency();
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.BOB;
  return config.name;
};

// Obtener código de moneda actual
export const getCurrencyCode = () => {
  return getCurrentCurrency();
};


// Función para obtener la fecha actual en formato YYYY-MM-DD con zona horaria de Bolivia
export const getTodayDate = () => {
  const today = new Date();
  // Convertir a zona horaria de Bolivia
  const boliviaTime = new Date(today.toLocaleString("en-US", {timeZone: "America/La_Paz"}));
  const year = boliviaTime.getFullYear();
  const month = String(boliviaTime.getMonth() + 1).padStart(2, '0');
  const day = String(boliviaTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función para obtener la hora actual de Bolivia
export const getCurrentBoliviaTime = () => {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/La_Paz",
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// Función para obtener rangos de fechas predefinidos
export const getDateRange = (range) => {
  // Usar fecha actual de Bolivia
  const today = new Date();
  today.setTime(today.getTime() + (today.getTimezoneOffset() * 60000) - (4 * 3600000)); // UTC-4 para Bolivia
  
  const startDate = new Date(today);
  const endDate = new Date(today);

  switch (range) {
    case 'today':
      break;
    case 'week':
      const dayOfWeek = today.getDay();
      startDate.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
      endDate.setDate(startDate.getDate() + 6);
      break;
    case 'month':
      startDate.setDate(1);
      endDate.setMonth(endDate.getMonth() + 1, 0);
      break;
    case 'quarter':
      const currentMonth = today.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      startDate.setMonth(quarterStartMonth, 1);
      endDate.setMonth(quarterStartMonth + 3, 0);
      break;
    case 'year':
      startDate.setMonth(0, 1);
      endDate.setMonth(11, 31);
      break;
    default:
      break;
  }

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatDateForInput(startDate),
    endDate: formatDateForInput(endDate)
  };
};

// =================== FUNCIONES PARA PAGOS Y RECIBOS ===================

// Formatear estados de recibos
export const formatReceiptStatus = (status) => {
  const statuses = {
    'cotizado': 'Cotizado',
    'con_anticipo': 'Con Anticipo',
    'en_produccion': 'En Producción',
    'listo_entrega': 'Listo para Entrega',
    'completado': 'Completado',
    'cancelado': 'Cancelado'
  };
  return statuses[status] || status;
};

// Obtener color para estados de recibos
export const getReceiptStatusColor = (status) => {
  const colors = {
    'cotizado': 'bg-gray-100 text-gray-700',
    'con_anticipo': 'bg-blue-100 text-blue-700',
    'en_produccion': 'bg-yellow-100 text-yellow-700',
    'listo_entrega': 'bg-purple-100 text-purple-700',
    'completado': 'bg-green-100 text-green-700',
    'cancelado': 'bg-red-100 text-red-700'
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

// Formatear estados de pago
export const formatPaymentStatus = (status) => {
  const statuses = {
    'sin_anticipo': 'Sin Anticipo',
    'con_anticipo': 'Con Anticipo',
    'pagado_completo': 'Pagado Completo'
  };
  return statuses[status] || status;
};

// Obtener color para estados de pago
export const getPaymentStatusColor = (status) => {
  const colors = {
    'sin_anticipo': 'bg-red-100 text-red-700',
    'con_anticipo': 'bg-yellow-100 text-yellow-700',
    'pagado_completo': 'bg-green-100 text-green-700'
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

// Formatear tipos de pago
export const formatPaymentType = (type) => {
  const types = {
    'anticipo': 'Anticipo',
    'pago_final': 'Pago Final',
    'abono': 'Abono'
  };
  return types[type] || type;
};

// Formatear métodos de pago
export const formatPaymentMethod = (method) => {
  const methods = {
    'efectivo': 'Efectivo',
    'transferencia': 'Transferencia',
    'tarjeta': 'Tarjeta',
    'cheque': 'Cheque'
  };
  return methods[method] || method;
};

// Calcular porcentaje de pago completado
export const calculatePaymentProgress = (paidAmount, totalAmount) => {
  if (!totalAmount || totalAmount === 0) return 0;
  const progress = (paidAmount / totalAmount) * 100;
  return Math.min(Math.max(progress, 0), 100); // Entre 0 y 100
};

// Formatear progreso de pago
export const formatPaymentProgress = (paidAmount, totalAmount) => {
  const progress = calculatePaymentProgress(paidAmount, totalAmount);
  return `${Math.round(progress)}%`;
};

// Determinar si un recibo necesita atención
export const needsAttention = (receipt) => {
  const daysSinceCreated = Math.floor((new Date() - new Date(receipt.receipt_date)) / (1000 * 60 * 60 * 24));
  
  // Trabajos listos para entrega hace más de 3 días
  if (receipt.status === 'listo_entrega' && daysSinceCreated > 3) {
    return { type: 'warning', message: 'Trabajo listo hace más de 3 días' };
  }
  
  // Trabajos con anticipo pero sin avance hace más de 7 días
  if (receipt.status === 'con_anticipo' && daysSinceCreated > 7) {
    return { type: 'info', message: 'Con anticipo hace más de 7 días' };
  }
  
  // Trabajos cotizados hace más de 5 días
  if (receipt.status === 'cotizado' && daysSinceCreated > 5) {
    return { type: 'info', message: 'Cotización pendiente hace más de 5 días' };
  }
  
  return null;
};

// Formatear tiempo relativo (hace cuánto tiempo) con zona horaria de Bolivia
export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  
  // Ajustar ambas fechas a zona horaria de Bolivia para comparación correcta
  const boliviaDate = new Date(date.toLocaleString("en-US", {timeZone: "America/La_Paz"}));
  const boliviaNow = new Date(now.toLocaleString("en-US", {timeZone: "America/La_Paz"}));
  
  const diffMs = boliviaNow - boliviaDate;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) {
    return 'Hace menos de 1 hora';
  } else if (diffHours < 24) {
    return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  } else {
    return formatDate(dateString);
  }
};

// =================== FUNCIONES DE VERIFICACIÓN DE ZONA HORARIA ===================

// Verificar si la zona horaria está correctamente configurada
export const verifyTimezone = () => {
  const config = CURRENCY_CONFIG.BOB;
  const now = new Date();
  const boliviaTime = now.toLocaleString("en-US", {timeZone: config.timezone});
  const localTime = now.toLocaleString("en-US");
  
  return {
    timezone: config.timezone,
    boliviaTime,
    localTime,
    offset: 'UTC-4',
    isCorrect: config.timezone === 'America/La_Paz'
  };
};

// Obtener información completa de zona horaria
export const getTimezoneInfo = () => {
  const info = verifyTimezone();
  return {
    ...info,
    formattedBoliviaTime: formatDateTime(new Date().toISOString()),
    currentBoliviaTime: getCurrentBoliviaTime(),
    todayInBolivia: getTodayDate()
  };
};
