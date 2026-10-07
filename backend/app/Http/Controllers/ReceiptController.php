<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Models\ReceiptItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Services\NotificationService;

class ReceiptController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Receipt::with(['user:id,name', 'items', 'branch:id,name']);

        // Empleados solo ven su sucursal
        if (!$user->isAdmin() && $user->branch_id) {
            $query->where('branch_id', $user->branch_id);
        }

        // Filtros
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }
        if ($request->filled('customer')) {
            $query->where('customer_name', 'like', '%' . $request->customer . '%');
        }
        if ($request->filled('date_from')) {
            $query->whereDate('receipt_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('receipt_date', '<=', $request->date_to);
        }
        if ($request->filled('receipt_number')) {
            $query->where('receipt_number', 'like', '%' . $request->receipt_number . '%');
        }
        // Filtro por sucursal (solo admin puede filtrar por sucursal específica)
        if ($user->isAdmin() && $request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        $receipts = $query->orderBy('receipt_date', 'desc')
                          ->orderBy('id', 'desc')
                          ->paginate(15);

        return response()->json($receipts);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'customer_address' => 'nullable|string|max:500',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'receipt_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.price' => 'required|numeric|min:0',
            // Campos para anticipo
            'advance_amount' => 'nullable|numeric|min:0',
            'advance_payment_method' => 'nullable|in:efectivo,transferencia,tarjeta,cheque',
            'advance_notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Datos de validación incorrectos',
                'messages' => $validator->errors()
            ], 422);
        }

        // Validar anticipo si se proporciona
        if ($request->filled('advance_amount')) {
            if ($request->advance_amount < 0) {
                return response()->json([
                    'error' => 'El monto del anticipo no puede ser negativo'
                ], 422);
            }
            
            if (!$request->filled('advance_payment_method')) {
                return response()->json([
                    'error' => 'Debe especificar el método de pago del anticipo'
                ], 422);
            }
        }

        DB::beginTransaction();

        try {
            // Crear recibo
            $receipt = Receipt::create([
                'receipt_number' => Receipt::generateReceiptNumber(),
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_email' => $request->customer_email,
                'customer_address' => $request->customer_address,
                'subtotal' => 0,
                'tax' => $request->tax ?? 0,
                'discount' => $request->discount ?? 0,
                'total' => 0,
                'advance_amount' => $request->advance_amount ?? 0,
                'paid_amount' => 0,
                'payment_status' => 'sin_anticipo',
                'status' => 'cotizado',
                'notes' => $request->notes,
                'user_id' => $request->user()->id,
                'branch_id' => $request->user()->branch_id,
                'receipt_date' => $request->receipt_date,
            ]);

            // Crear items del recibo (sin relación con productos del inventario)
            foreach ($request->items as $itemData) {
                ReceiptItem::create([
                    'receipt_id' => $receipt->id,
                    'product_id' => null, // No se relaciona con inventario
                    'product_name' => $itemData['description'],
                    'price' => $itemData['price'],
                    'quantity' => $itemData['quantity'],
                ]);
            }

            // Calcular total del recibo
            $receipt->calculateTotal();

            // Registrar anticipo si se proporciona
            if ($request->filled('advance_amount') && $request->advance_amount > 0) {
                // Validar que el anticipo no sea mayor al total
                if ($request->advance_amount > $receipt->total) {
                    throw new \Exception('El anticipo no puede ser mayor al total del recibo');
                }

                $receipt->addPayment(
                    $request->advance_amount,
                    'anticipo',
                    $request->advance_payment_method,
                    $request->advance_notes
                );
            }

            DB::commit();

            NotificationService::sendNewSaleNotification($receipt->toArray());

            return response()->json($receipt->load(['items', 'user', 'payments']), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al crear el recibo: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Receipt $receipt)
    {
        return response()->json($receipt->load(['items', 'user:id,name', 'payments', 'branch:id,name']));
    }

    public function update(Request $request, Receipt $receipt)
    {
        if ($receipt->status === 'completado') {
            return response()->json([
                'error' => 'No se puede modificar un recibo completado'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'customer_name' => 'sometimes|required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'customer_address' => 'nullable|string|max:500',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:cotizado,con_anticipo,en_produccion,listo_entrega,completado,cancelado',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Datos de validación incorrectos',
                'messages' => $validator->errors()
            ], 422);
        }

        $receipt->update($request->all());

        return response()->json($receipt->load(['items', 'user', 'payments']));
    }

    public function cancel(Receipt $receipt)
    {
        if ($receipt->status === 'cancelado') {
            return response()->json([
                'error' => 'El recibo ya está cancelado'
            ], 422);
        }

        if ($receipt->status === 'completado') {
            return response()->json([
                'error' => 'No se puede cancelar un recibo completado'
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Solo cambiar el estado a cancelado
            // Los pagos se mantienen como historial
            $receipt->update(['status' => 'cancelado']);

            DB::commit();

            return response()->json([
                'message' => 'Recibo cancelado exitosamente',
                'receipt' => $receipt->load(['items', 'user', 'payments'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al cancelar el recibo: ' . $e->getMessage()
            ], 500);
        }
    }

    public function markAsReady(Receipt $receipt)
    {
        if (in_array($receipt->status, ['completado', 'cancelado'])) {
            return response()->json([
                'error' => 'No se puede cambiar el estado de un recibo completado o cancelado'
            ], 422);
        }

        if ($receipt->status === 'listo_entrega') {
            return response()->json([
                'error' => 'El recibo ya está marcado como listo para entrega'
            ], 422);
        }

        $receipt->update(['status' => 'listo_entrega']);

        return response()->json($receipt->load(['items', 'user', 'payments']));
    }

    public function generatePdf(Receipt $receipt)
    {
        $receipt->load(['items', 'user', 'payments']);

        $company = [
            'name'         => \App\Models\Setting::get('company_name', 'Big Arte'),
            'address'      => \App\Models\Setting::get('company_address', 'Sucursal - Av. Cañoto'),
            'phone'        => \App\Models\Setting::get('company_phone', '73149544'),
            'email'        => \App\Models\Setting::get('company_email', ''),
            'tax_id'       => \App\Models\Setting::get('company_tax_id', ''),
            'footer_text'  => \App\Models\Setting::get('receipt_footer_text', 'Gracias por confiar en Big Arte!'),
            'include_logo' => (bool) \App\Models\Setting::get('receipt_include_logo', '1'),
        ];

        $pdf = Pdf::loadView('receipts.pdf', compact('receipt', 'company'))
            ->setPaper('letter', 'portrait');

        return $pdf->download("recibo-{$receipt->receipt_number}.pdf");
    }

    public function salesReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Datos de validación incorrectos',
                'messages' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $receiptQuery = Receipt::completed()
            ->byDateRange($request->start_date, $request->end_date)
            ->with(['items', 'payments']);

        if (!$user->isAdmin() && $user->branch_id) {
            $receiptQuery->where('branch_id', $user->branch_id);
        } elseif ($user->isAdmin() && $request->filled('branch_id')) {
            $receiptQuery->where('branch_id', $request->branch_id);
        }

        $receipts = $receiptQuery->get();

        $totalSales = $receipts->sum('total');
        $totalReceipts = $receipts->count();
        $averageTicket = $totalReceipts > 0 ? $totalSales / $totalReceipts : 0;

        // Servicios/productos más vendidos
        $serviceSales = [];
        foreach ($receipts as $receipt) {
            foreach ($receipt->items as $item) {
                $serviceName = $item->product_name;
                if (!isset($serviceSales[$serviceName])) {
                    $serviceSales[$serviceName] = [
                        'name' => $serviceName,
                        'quantity' => 0,
                        'total' => 0,
                    ];
                }
                $serviceSales[$serviceName]['quantity'] += $item->quantity;
                $serviceSales[$serviceName]['total'] += $item->subtotal;
            }
        }

        // Ordenar por cantidad vendida
        uasort($serviceSales, function($a, $b) {
            return $b['quantity'] <=> $a['quantity'];
        });

        // Resumen de pagos
        $totalAdvances = 0;
        $totalFinalPayments = 0;
        $pendingPayments = 0;
        
        foreach ($receipts as $receipt) {
            $totalAdvances += $receipt->getAdvanceAmount();
            $finalPayments = $receipt->payments()->where('type', '!=', 'anticipo')->sum('amount');
            $totalFinalPayments += $finalPayments;
            $pendingPayments += $receipt->getRemainingAmount();
        }

        return response()->json([
            'period' => [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ],
            'summary' => [
                'total_sales' => $totalSales,
                'total_receipts' => $totalReceipts,
                'average_ticket' => round($averageTicket, 2),
                'total_advances' => $totalAdvances,
                'total_final_payments' => $totalFinalPayments,
                'pending_payments' => $pendingPayments,
            ],
            'top_services' => array_slice($serviceSales, 0, 10, true),
            'receipts' => $receipts,
        ]);
    }
}
