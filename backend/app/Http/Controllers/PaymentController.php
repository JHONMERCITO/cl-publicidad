<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Receipt;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    /**
     * Obtener todos los pagos de un recibo
     */
    public function getReceiptPayments($receiptId): JsonResponse
    {
        try {
            $receipt = Receipt::findOrFail($receiptId);
            $payments = $receipt->payments()->orderBy('paid_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'payments' => $payments,
                    'total_paid' => $receipt->paid_amount,
                    'remaining_amount' => $receipt->getRemainingAmount(),
                    'payment_status' => $receipt->payment_status,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los pagos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Agregar un pago a un recibo
     */
    public function addPayment(Request $request, $receiptId): JsonResponse
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:0.01',
                'type' => 'required|in:anticipo,pago_final,abono',
                'payment_method' => 'required|in:efectivo,transferencia,tarjeta,cheque',
                'notes' => 'nullable|string|max:500',
            ]);

            $receipt = Receipt::findOrFail($receiptId);

            // Validar que el monto no exceda lo que falta por pagar
            $remainingAmount = $receipt->getRemainingAmount();
            if ($request->amount > $remainingAmount) {
                return response()->json([
                    'success' => false,
                    'message' => 'El monto del pago ($' . number_format($request->amount, 2) . ') no puede ser mayor al saldo pendiente ($' . number_format($remainingAmount, 2) . ')'
                ], 400);
            }

            // Crear el pago
            $payment = $receipt->addPayment(
                $request->amount,
                $request->type,
                $request->payment_method,
                $request->notes
            );

            return response()->json([
                'success' => true,
                'message' => 'Pago registrado correctamente',
                'data' => [
                    'payment' => $payment,
                    'receipt' => $receipt->fresh(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar el pago: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un pago
     */
    public function updatePayment(Request $request, $paymentId): JsonResponse
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:0.01',
                'type' => 'required|in:anticipo,pago_final,abono',
                'payment_method' => 'required|in:efectivo,transferencia,tarjeta,cheque',
                'notes' => 'nullable|string|max:500',
            ]);

            $payment = Payment::findOrFail($paymentId);
            $receipt = $payment->receipt;

            // Calcular el nuevo saldo considerando el cambio
            $currentPaidAmount = $receipt->paid_amount - $payment->amount;
            $newPaidAmount = $currentPaidAmount + $request->amount;

            if ($newPaidAmount > $receipt->total) {
                return response()->json([
                    'success' => false,
                    'message' => 'El nuevo monto excede el total del recibo'
                ], 400);
            }

            // Actualizar el pago
            $payment->update([
                'amount' => $request->amount,
                'type' => $request->type,
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
            ]);

            // Recalcular estado del recibo
            $receipt->updatePaymentStatus();

            return response()->json([
                'success' => true,
                'message' => 'Pago actualizado correctamente',
                'data' => [
                    'payment' => $payment,
                    'receipt' => $receipt->fresh(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el pago: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un pago
     */
    public function deletePayment($paymentId): JsonResponse
    {
        try {
            $payment = Payment::findOrFail($paymentId);
            $receipt = $payment->receipt;

            $payment->delete();

            // Recalcular estado del recibo
            $receipt->updatePaymentStatus();

            return response()->json([
                'success' => true,
                'message' => 'Pago eliminado correctamente',
                'data' => [
                    'receipt' => $receipt->fresh(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el pago: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reporte de pagos por período
     */
    public function paymentsReport(Request $request): JsonResponse
    {
        try {
            $startDate = $request->get('start_date', now()->startOfMonth()->format('Y-m-d'));
            $endDate = $request->get('end_date', now()->endOfMonth()->format('Y-m-d'));

            $payments = Payment::with('receipt')
                ->whereBetween('paid_at', [$startDate, $endDate])
                ->orderBy('paid_at', 'desc')
                ->get();

            $summary = [
                'total_payments' => $payments->count(),
                'total_amount' => $payments->sum('amount'),
                'advances_count' => $payments->where('type', 'anticipo')->count(),
                'advances_amount' => $payments->where('type', 'anticipo')->sum('amount'),
                'final_payments_count' => $payments->where('type', 'pago_final')->count(),
                'final_payments_amount' => $payments->where('type', 'pago_final')->sum('amount'),
                'installments_count' => $payments->where('type', 'abono')->count(),
                'installments_amount' => $payments->where('type', 'abono')->sum('amount'),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'payments' => $payments,
                    'summary' => $summary,
                    'period' => [
                        'start_date' => $startDate,
                        'end_date' => $endDate,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte de pagos: ' . $e->getMessage()
            ], 500);
        }
    }
}
