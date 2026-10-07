<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BranchController extends Controller
{
    public function index()
    {
        $branches = Branch::withCount(['users', 'receipts'])->orderBy('name')->get();
        return response()->json($branches);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'    => 'required|string|max:255|unique:branches',
            'address' => 'nullable|string|max:500',
            'phone'   => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error'  => 'Datos de validación incorrectos',
                'errors' => $validator->errors()
            ], 422);
        }

        $branch = Branch::create($request->only('name', 'address', 'phone'));
        return response()->json(['message' => 'Sucursal creada exitosamente', 'branch' => $branch], 201);
    }

    public function update(Request $request, Branch $branch)
    {
        $validator = Validator::make($request->all(), [
            'name'      => 'required|string|max:255|unique:branches,name,' . $branch->id,
            'address'   => 'nullable|string|max:500',
            'phone'     => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error'  => 'Datos de validación incorrectos',
                'errors' => $validator->errors()
            ], 422);
        }

        $branch->update($request->only('name', 'address', 'phone', 'is_active'));
        return response()->json(['message' => 'Sucursal actualizada exitosamente', 'branch' => $branch]);
    }

    public function destroy(Branch $branch)
    {
        if ($branch->users()->exists()) {
            return response()->json([
                'error' => 'No se puede eliminar la sucursal porque tiene usuarios asignados'
            ], 422);
        }

        $branch->delete();
        return response()->json(['message' => 'Sucursal eliminada exitosamente']);
    }

    public function stats(Branch $branch)
    {
        $receipts = $branch->receipts();

        return response()->json([
            'branch'          => $branch,
            'total_sales'     => $receipts->where('status', 'completado')->sum('total'),
            'total_receipts'  => $receipts->count(),
            'pending_amount'  => $receipts->whereIn('payment_status', ['sin_anticipo', 'con_anticipo'])
                                          ->where('status', '!=', 'cancelado')
                                          ->sum(\Illuminate\Support\Facades\DB::raw('total - paid_amount')),
            'users_count'     => $branch->users()->count(),
        ]);
    }
}
