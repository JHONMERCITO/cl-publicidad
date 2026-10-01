<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\NotificationService;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with('user:id,name');

        // Filtros - solo aplicar si tienen valores
        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('expense_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('expense_date', '<=', $request->date_to);
        }

        if ($request->filled('supplier')) {
            $query->where('supplier', 'like', '%' . $request->supplier . '%');
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                  ->orWhere('invoice_number', 'like', '%' . $request->search . '%');
            });
        }

        $expenses = $query->orderBy('expense_date', 'desc')
                         ->orderBy('id', 'desc')
                         ->paginate(15);

        return response()->json($expenses);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'category' => 'required|string|max:100',
            'supplier' => 'nullable|string|max:255',
            'invoice_number' => 'nullable|string|max:100',
            'expense_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Datos de validación incorrectos',
                'messages' => $validator->errors()
            ], 422);
        }

        $expense = Expense::create([
            ...$request->all(),
            'user_id' => $request->user()->id,
        ]);

        NotificationService::sendNewExpenseNotification($expense->toArray());

        return response()->json($expense->load('user:id,name'), 201);
    }

    public function show(Expense $expense)
    {
        return response()->json($expense->load('user:id,name'));
    }

    public function update(Request $request, Expense $expense)
    {
        $validator = Validator::make($request->all(), [
            'description' => 'sometimes|required|string|max:255',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'category' => 'sometimes|required|string|max:100',
            'supplier' => 'nullable|string|max:255',
            'invoice_number' => 'nullable|string|max:100',
            'expense_date' => 'sometimes|required|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Datos de validación incorrectos',
                'messages' => $validator->errors()
            ], 422);
        }

        $expense->update($request->all());

        return response()->json($expense->load('user:id,name'));
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return response()->json([
            'message' => 'Gasto eliminado exitosamente'
        ]);
    }

    public function categories()
    {
        $categories = Expense::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json($categories);
    }

    public function expensesReport(Request $request)
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

        $expenses = Expense::byDateRange($request->start_date, $request->end_date)
            ->with('user:id,name')
            ->get();

        $totalExpenses = $expenses->sum('amount');
        $totalCount = $expenses->count();

        // Gastos por categoría
        $expensesByCategory = $expenses->groupBy('category')->map(function ($categoryExpenses) {
            return [
                'total' => $categoryExpenses->sum('amount'),
                'count' => $categoryExpenses->count(),
                'expenses' => $categoryExpenses,
            ];
        });

        // Gastos por mes
        $expensesByMonth = $expenses->groupBy(function ($expense) {
            return $expense->expense_date->format('Y-m');
        })->map(function ($monthExpenses) {
            return [
                'total' => $monthExpenses->sum('amount'),
                'count' => $monthExpenses->count(),
            ];
        });

        return response()->json([
            'period' => [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ],
            'summary' => [
                'total_expenses' => $totalExpenses,
                'total_count' => $totalCount,
                'average_expense' => $totalCount > 0 ? round($totalExpenses / $totalCount, 2) : 0,
            ],
            'by_category' => $expensesByCategory,
            'by_month' => $expensesByMonth,
            'expenses' => $expenses,
        ]);
    }
}
