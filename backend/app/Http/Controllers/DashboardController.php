<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Models\Payment;
use App\Models\Expense;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', 'month');
        $startDate = $this->getStartDate($period);
        $endDate = Carbon::now();
        $user = $request->user();

        // Determinar filtro de sucursal
        $branchId = null;
        if (!$user->isAdmin() && $user->branch_id) {
            // Empleado: solo ve su sucursal
            $branchId = $user->branch_id;
        } elseif ($user->isAdmin() && $request->filled('branch_id')) {
            // Admin: puede filtrar por sucursal específica
            $branchId = $request->branch_id;
        }

        $receiptQuery = function() use ($branchId) {
            $q = Receipt::query();
            if ($branchId) $q->where('branch_id', $branchId);
            return $q;
        };

        $paymentQuery = function() use ($branchId) {
            $q = Payment::query();
            if ($branchId) {
                $q->whereHas('receipt', fn($r) => $r->where('branch_id', $branchId));
            }
            return $q;
        };

        // Métricas principales
        $totalSales = $receiptQuery()->active()
            ->byDateRange($startDate, $endDate)
            ->sum('total');

        $totalExpenses = Expense::byDateRange($startDate, $endDate)
            ->sum('amount');

        $netProfit = $totalSales - $totalExpenses;

        $salesCount = $receiptQuery()->active()
            ->byDateRange($startDate, $endDate)
            ->count();

        $averageTicket = $salesCount > 0 ? $totalSales / $salesCount : 0;

        // MÉTRICAS AVANZADAS DE PAGOS FRACCIONADOS
        
        // Anticipos recibidos en el período
        $totalAdvances = $paymentQuery()->where('type', 'anticipo')
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->sum('amount');

        // Pagos finales recibidos en el período
        $finalPayments = $paymentQuery()->where('type', 'pago_final')
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->sum('amount');

        // Abonos recibidos en el período
        $installmentPayments = $paymentQuery()->where('type', 'abono')
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->sum('amount');

        // Dinero pendiente de cobro
        $pendingPayments = $receiptQuery()->whereIn('payment_status', ['sin_anticipo', 'con_anticipo'])
            ->where('status', '!=', 'cancelado')
            ->sum(DB::raw('total - paid_amount'));

        // Trabajos con anticipo (en proceso)
        $receiptsWithAdvance = $receiptQuery()->where('payment_status', 'con_anticipo')
            ->where('status', '!=', 'cancelado')
            ->count();

        // Trabajos listos para entrega
        $receiptsReadyForDelivery = $receiptQuery()->where('status', 'listo_entrega')->count();

        // Trabajos solo cotizados
        $receiptsOnlyQuoted = $receiptQuery()->where('payment_status', 'sin_anticipo')
            ->where('status', 'cotizado')
            ->count();

        // Promedio de días entre anticipo y pago final
        $averagePaymentDays = $this->calculateAveragePaymentDays($startDate, $endDate);

        // Flujo de caja proyectado
        $projectedCashFlow = $receiptQuery()->where('payment_status', 'con_anticipo')
            ->where('status', '!=', 'cancelado')
            ->sum(DB::raw('total - paid_amount'));

        // Ventas por día (período seleccionado)
        $salesByDay = $receiptQuery()->active()
            ->select(
                DB::raw('DATE(receipt_date) as date'),
                DB::raw('SUM(total) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->byDateRange($startDate, $endDate)
            ->groupBy(DB::raw('DATE(receipt_date)'))
            ->orderBy('date')
            ->get();

        // Pagos por día (últimos 30 días)
        $paymentsByDay = $paymentQuery()->select(
                DB::raw('DATE(paid_at) as date'),
                DB::raw('SUM(amount) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->where('paid_at', '>=', Carbon::now()->subDays(30))
            ->groupBy(DB::raw('DATE(paid_at)'))
            ->orderBy('date')
            ->get();

        // Distribución de tipos de pagos
        $paymentTypeDistribution = $paymentQuery()->select('type', DB::raw('SUM(amount) as total'))
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->groupBy('type')
            ->get()
            ->map(function($item) {
                return [
                    'type' => $this->formatPaymentType($item->type),
                    'total' => round($item->total, 2),
                    'raw_type' => $item->type
                ];
            });

        // Métodos de pago más usados
        $paymentMethods = $paymentQuery()->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->groupBy('payment_method')
            ->get()
            ->map(function($item) {
                return [
                    'method' => $this->formatPaymentMethod($item->payment_method),
                    'count' => $item->count,
                    'total' => round($item->total, 2),
                    'raw_method' => $item->payment_method
                ];
            });

        // Gastos por categoría (período actual)
        $expensesByCategory = Expense::select('category', DB::raw('SUM(amount) as total'))
            ->byDateRange($startDate, $endDate)
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->get();

        // Servicios/productos más vendidos (período actual)
        $topServices = DB::table('receipt_items')
            ->join('receipts', 'receipt_items.receipt_id', '=', 'receipts.id')
            ->select(
                'receipt_items.product_name as name',
                DB::raw('SUM(receipt_items.quantity) as total_quantity'),
                DB::raw('SUM(receipt_items.subtotal) as total_amount')
            )
            ->where('receipts.status', 'completado')
            ->whereBetween('receipts.receipt_date', [$startDate, $endDate])
            ->groupBy('receipt_items.product_name')
            ->orderBy('total_quantity', 'desc')
            ->limit(10)
            ->get();

        // Métricas por sucursal (solo para admin sin filtro de sucursal específica)
        $branchMetrics = [];
        if ($user->isAdmin() && !$branchId) {
            $branchMetrics = \App\Models\Branch::where('is_active', true)
                ->withCount(['receipts as total_receipts'])
                ->get()
                ->map(function($branch) use ($startDate, $endDate) {
                    $sales = Receipt::where('branch_id', $branch->id)
                        ->active()->byDateRange($startDate, $endDate)->sum('total');
                    $pending = Receipt::where('branch_id', $branch->id)
                        ->whereIn('payment_status', ['sin_anticipo', 'con_anticipo'])
                        ->where('status', '!=', 'cancelado')
                        ->sum(DB::raw('total - paid_amount'));
                    return [
                        'id'           => $branch->id,
                        'name'         => $branch->name,
                        'total_sales'  => round($sales, 2),
                        'pending'      => round($pending, 2),
                        'users_count'  => $branch->users()->count(),
                    ];
                });
        }

        // Ventas recientes
        $recentSales = $receiptQuery()->with(['user:id,name', 'payments', 'branch:id,name'])
            ->orderBy('receipt_date', 'desc')
            ->limit(5)
            ->get();

        // Pagos recientes con más información
        $recentPayments = Payment::with(['receipt:id,receipt_number,customer_name,total'])
            ->orderBy('paid_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => $payment->amount,
                    'type' => $this->formatPaymentType($payment->type),
                    'payment_method' => $this->formatPaymentMethod($payment->payment_method),
                    'paid_at' => $payment->paid_at,
                    'receipt' => $payment->receipt,
                    'notes' => $payment->notes,
                ];
            });

        // Trabajos que requieren atención (alertas)
        $attentionRequired = $this->getAttentionRequiredReceipts();

        return response()->json([
            'period' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date'   => $endDate->format('Y-m-d'),
                'label'      => $this->getPeriodLabel($period),
            ],
            'branch_filter' => $branchId,
            'branch_metrics' => $branchMetrics,
            'metrics' => [
                // Métricas básicas
                'total_sales' => round($totalSales, 2),
                'total_expenses' => round($totalExpenses, 2),
                'net_profit' => round($netProfit, 2),
                'sales_count' => $salesCount,
                'average_ticket' => round($averageTicket, 2),

                // Métricas de pagos fraccionados
                'total_advances' => round($totalAdvances, 2),
                'final_payments' => round($finalPayments, 2),
                'installment_payments' => round($installmentPayments, 2),
                'pending_payments' => round($pendingPayments, 2),
                'projected_cash_flow' => round($projectedCashFlow, 2),
                
                // Estado de trabajos
                'receipts_with_advance' => $receiptsWithAdvance,
                'receipts_ready_delivery' => $receiptsReadyForDelivery,
                'receipts_only_quoted' => $receiptsOnlyQuoted,
                'average_payment_days' => round($averagePaymentDays, 1),
                
                // Alertas
                'attention_required_count' => count($attentionRequired),
            ],
            'charts' => [
                'sales_by_day' => $salesByDay,
                'payments_by_day' => $paymentsByDay,
                'expenses_by_category' => $expensesByCategory,
                'top_services' => $topServices,
                'payment_type_distribution' => $paymentTypeDistribution,
                'payment_methods' => $paymentMethods,
            ],
            'recent_data' => [
                'sales' => $recentSales,
                'payments' => $recentPayments,
            ],
            'alerts' => [
                'attention_required' => $attentionRequired,
            ]
        ]);
    }

    private function calculateAveragePaymentDays($startDate, $endDate)
    {
        // Calcular promedio de días entre anticipo y pago final
        $completedReceipts = Receipt::where('payment_status', 'pagado_completo')
            ->whereBetween('receipt_date', [$startDate, $endDate])
            ->with(['payments' => function($query) {
                $query->whereIn('type', ['anticipo', 'pago_final'])->orderBy('paid_at');
            }])
            ->get();

        $totalDays = 0;
        $validReceipts = 0;

        foreach ($completedReceipts as $receipt) {
            $anticipo = $receipt->payments->where('type', 'anticipo')->first();
            $pagoFinal = $receipt->payments->where('type', 'pago_final')->first();

            if ($anticipo && $pagoFinal) {
                $days = Carbon::parse($pagoFinal->paid_at)->diffInDays(Carbon::parse($anticipo->paid_at));
                $totalDays += $days;
                $validReceipts++;
            }
        }

        return $validReceipts > 0 ? $totalDays / $validReceipts : 0;
    }

    private function getAttentionRequiredReceipts()
    {
        $alerts = [];

        // Trabajos listos hace más de 3 días
        $readyTooLong = Receipt::where('status', 'listo_entrega')
            ->where('created_at', '<=', Carbon::now()->subDays(3))
            ->count();

        if ($readyTooLong > 0) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "{$readyTooLong} trabajo(s) listo(s) para entrega hace más de 3 días",
                'count' => $readyTooLong,
                'priority' => 'high'
            ];
        }

        // Trabajos con anticipo sin avance hace más de 7 días
        $advanceStalled = Receipt::where('payment_status', 'con_anticipo')
            ->where('status', 'con_anticipo')
            ->where('created_at', '<=', Carbon::now()->subDays(7))
            ->count();

        if ($advanceStalled > 0) {
            $alerts[] = [
                'type' => 'info',
                'message' => "{$advanceStalled} trabajo(s) con anticipo sin avance hace más de 7 días",
                'count' => $advanceStalled,
                'priority' => 'medium'
            ];
        }

        // Cotizaciones pendientes hace más de 5 días
        $oldQuotes = Receipt::where('status', 'cotizado')
            ->where('created_at', '<=', Carbon::now()->subDays(5))
            ->count();

        if ($oldQuotes > 0) {
            $alerts[] = [
                'type' => 'info',
                'message' => "{$oldQuotes} cotización(es) pendiente(s) hace más de 5 días",
                'count' => $oldQuotes,
                'priority' => 'low'
            ];
        }

        return $alerts;
    }

    private function formatPaymentType($type)
    {
        $types = [
            'anticipo' => 'Anticipos',
            'pago_final' => 'Pagos Finales',
            'abono' => 'Abonos'
        ];
        return $types[$type] ?? ucfirst($type);
    }

    private function formatPaymentMethod($method)
    {
        $methods = [
            'efectivo' => 'Efectivo',
            'transferencia' => 'Transferencia',
            'tarjeta' => 'Tarjeta',
            'cheque' => 'Cheque'
        ];
        return $methods[$method] ?? ucfirst($method);
    }

    public function profitLossReport(Request $request)
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->format('Y-m-d'));
        $user = $request->user();

        $branchId = null;
        if (!$user->isAdmin() && $user->branch_id) {
            $branchId = $user->branch_id;
        } elseif ($user->isAdmin() && $request->filled('branch_id')) {
            $branchId = $request->branch_id;
        }

        // Ingresos
        $salesQuery = Receipt::completed()->byDateRange($startDate, $endDate);
        if ($branchId) $salesQuery->where('branch_id', $branchId);
        $sales = $salesQuery->get();

        $totalIncome = $sales->sum('total');
        $salesTax = $sales->sum('tax');
        $salesDiscount = $sales->sum('discount');

        // Gastos (no filtran por sucursal ya que Expense no tiene branch_id;
        // empleados ven solo sus ventas pero gastos globales quedan en cero para ellos)
        $expenses = $branchId && !$user->isAdmin()
            ? collect()
            : Expense::byDateRange($startDate, $endDate)->get();
        $expensesByCategory = $expenses->groupBy('category')
            ->map(function ($categoryExpenses) {
                return $categoryExpenses->sum('amount');
            });

        $totalExpenses = $expenses->sum('amount');

        // Utilidad
        $grossProfit = $totalIncome - $totalExpenses;
        $profitMargin = $totalIncome > 0 ? ($grossProfit / $totalIncome) * 100 : 0;

        // Información adicional de pagos
        $paymentsQuery = Payment::whereBetween('paid_at', [$startDate, $endDate]);
        if ($branchId) {
            $paymentsQuery->whereHas('receipt', fn($q) => $q->where('branch_id', $branchId));
        }
        $paymentsInfo = $paymentsQuery->selectRaw('
                SUM(CASE WHEN type = "anticipo" THEN amount ELSE 0 END) as total_advances,
                SUM(CASE WHEN type = "pago_final" THEN amount ELSE 0 END) as total_finals,
                SUM(CASE WHEN type = "abono" THEN amount ELSE 0 END) as total_installments,
                COUNT(*) as total_payments
            ')
            ->first();

        return response()->json([
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'income' => [
                'total_sales' => round($totalIncome, 2),
                'tax_collected' => round($salesTax, 2),
                'discounts_given' => round($salesDiscount, 2),
                'net_income' => round($totalIncome - $salesTax + $salesDiscount, 2),
            ],
            'expenses' => [
                'by_category' => $expensesByCategory,
                'total' => round($totalExpenses, 2),
            ],
            'profit' => [
                'gross_profit' => round($grossProfit, 2),
                'profit_margin' => round($profitMargin, 2),
            ],
            'payments' => [
                'total_advances' => round($paymentsInfo->total_advances ?? 0, 2),
                'total_finals' => round($paymentsInfo->total_finals ?? 0, 2),
                'total_installments' => round($paymentsInfo->total_installments ?? 0, 2),
                'total_payments' => $paymentsInfo->total_payments ?? 0,
            ]
        ]);
    }

    private function getStartDate($period)
    {
        switch ($period) {
            case 'today':
                return Carbon::today();
            case 'week':
                return Carbon::now()->startOfWeek();
            case 'month':
                return Carbon::now()->startOfMonth();
            case 'year':
                return Carbon::now()->startOfYear();
            default:
                return Carbon::now()->startOfMonth();
        }
    }

    private function getPeriodLabel($period)
    {
        switch ($period) {
            case 'today':
                return 'Hoy';
            case 'week':
                return 'Esta Semana';
            case 'month':
                return 'Este Mes';
            case 'year':
                return 'Este Año';
            default:
                return 'Este Mes';
        }
    }
}
