<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $services = Product::where('active', true)
            ->orderBy('name')
            ->paginate(100);

        return response()->json($services);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:products,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()->first('name'),
            ], 422);
        }

        $service = Product::create([
            'name'     => $request->name,
            'unit'     => 'servicio',
            'category' => 'Gigantografía',
            'active'   => true,
        ]);

        return response()->json($service, 201);
    }

    public function show(Product $product)
    {
        return response()->json($product);
    }

    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:products,name,' . $product->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()->first('name'),
            ], 422);
        }

        $product->update(['name' => $request->name]);

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        if ($product->receiptItems()->exists()) {
            return response()->json([
                'error' => 'No se puede eliminar porque tiene ventas asociadas'
            ], 422);
        }

        $product->delete();

        return response()->json(['message' => 'Servicio eliminado exitosamente']);
    }

    public function getActiveServices()
    {
        $services = Product::where('active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json($services);
    }

    public function getCommonServices()
    {
        $commonServices = Product::getCommonServices();

        return response()->json([
            'common_services' => $commonServices,
            'total'           => count($commonServices),
        ]);
    }

    public function createCommonServices()
    {
        try {
            $commonServices = Product::getCommonServices();
            $created = [];

            foreach ($commonServices as $serviceName => $description) {
                if (!Product::where('name', $serviceName)->exists()) {
                    $created[] = Product::create([
                        'name'         => $serviceName,
                        'unit'         => 'servicio',
                        'category'     => 'Gigantografía',
                        'service_type' => $serviceName,
                        'active'       => true,
                    ]);
                }
            }

            return response()->json([
                'message' => 'Servicios predefinidos creados exitosamente',
                'created' => count($created),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al crear servicios predefinidos: ' . $e->getMessage()
            ], 500);
        }
    }
}
