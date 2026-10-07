<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Listar todos los usuarios
     */
    public function index(Request $request)
    {
        try {
            $query = User::with('branch:id,name');

            if ($request->has('role')) {
                $query->where('role', $request->role);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $users = $query->orderBy('created_at', 'desc')->get();
            
            return response()->json($users);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener usuarios',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar un usuario específico
     */
    public function show($id)
    {
        try {
            $user = User::findOrFail($id);
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Usuario no encontrado',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Crear un nuevo usuario
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name'      => 'required|string|max:255',
                'email'     => 'required|string|email|max:255|unique:users',
                'password'  => ['required', 'string', 'min:6', 'regex:/^(?=.*[a-zA-Z])(?=.*[0-9]).+$/'],
                'role'      => 'required|in:admin,employee',
                'branch_id' => 'nullable|exists:branches,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Datos de validación incorrectos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::create([
                'name'      => $request->name,
                'email'     => $request->email,
                'password'  => Hash::make($request->password),
                'role'      => $request->role,
                'branch_id' => $request->branch_id,
            ]);

            return response()->json([
                'message' => 'Usuario creado exitosamente',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al crear usuario',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un usuario existente
     */
    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name'      => 'required|string|max:255',
                'email'     => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
                'password'  => ['nullable', 'string', 'min:6', 'regex:/^(?=.*[a-zA-Z])(?=.*[0-9]).+$/'],
                'role'      => 'required|in:admin,employee',
                'branch_id' => 'nullable|exists:branches,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Datos de validación incorrectos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user->name      = $request->name;
            $user->email     = $request->email;
            $user->role      = $request->role;
            $user->branch_id = $request->branch_id;

            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }

            $user->save();

            return response()->json([
                'message' => 'Usuario actualizado exitosamente',
                'user' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al actualizar usuario',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un usuario
     */
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            
            // Verificar que no sea el usuario actual
            if (auth()->id() == $user->id) {
                return response()->json([
                    'error' => 'No puedes eliminar tu propio usuario'
                ], 400);
            }

            $user->delete();

            return response()->json([
                'message' => 'Usuario eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al eliminar usuario',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar contraseña de un usuario
     */
    public function changePassword(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'password' => 'required|string|min:6|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Datos de validación incorrectos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::findOrFail($id);
            $user->password = Hash::make($request->password);
            $user->save();

            return response()->json([
                'message' => 'Contraseña actualizada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al cambiar contraseña',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activar/desactivar usuario
     */
    public function toggleStatus($id)
    {
        try {
            $user = User::findOrFail($id);
            
            // Verificar que no sea el usuario actual
            if (auth()->id() == $user->id) {
                return response()->json([
                    'error' => 'No puedes cambiar tu propio estado'
                ], 400);
            }

            $user->active = !$user->active;
            $user->save();

            return response()->json([
                'message' => $user->active ? 'Usuario activado' : 'Usuario desactivado',
                'user' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al cambiar estado del usuario',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
