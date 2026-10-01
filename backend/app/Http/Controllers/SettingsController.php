<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'company' => [
                'name'     => Setting::get('company_name', 'Big Arte'),
                'address'  => Setting::get('company_address', 'Sucursal - Av. Cañoto'),
                'phone'    => Setting::get('company_phone', '73149544'),
                'email'    => Setting::get('company_email', ''),
                'website'  => Setting::get('company_website', ''),
                'tax_id'   => Setting::get('company_tax_id', ''),
            ],
            'receipts' => [
                'prefix'        => Setting::get('receipt_prefix', 'REC'),
                'tax_rate'      => (float) Setting::get('receipt_tax_rate', '0'),
                'include_logo'  => (bool) Setting::get('receipt_include_logo', '1'),
                'footer_text'   => Setting::get('receipt_footer_text', 'Gracias por confiar en Big Arte!'),
                'payment_terms' => Setting::get('receipt_payment_terms', 'Pago al contado'),
            ],
            'notifications' => [
                'daily_reports'  => (bool) Setting::get('notify_daily_reports', '0'),
                'new_sale'       => (bool) Setting::get('notify_new_sale', '1'),
                'expense_alerts' => (bool) Setting::get('notify_expense_alerts', '1'),
            ],
            'security' => [
                'session_timeout'          => (int) Setting::get('security_session_timeout', '60'),
                'login_attempts'           => (int) Setting::get('security_login_attempts', '5'),
                'require_password_change'  => (bool) Setting::get('security_require_password_change', '0'),
            ],
        ]);
    }

    public function updateCompany(Request $request): JsonResponse
    {
        $request->validate([
            'name'    => 'required|string|max:100',
            'address' => 'nullable|string|max:255',
            'phone'   => 'nullable|string|max:30',
            'email'   => 'nullable|email|max:100',
            'website' => 'nullable|string|max:100',
            'tax_id'  => 'nullable|string|max:50',
        ]);

        Setting::set('company_name',    $request->name);
        Setting::set('company_address', $request->address ?? '');
        Setting::set('company_phone',   $request->phone ?? '');
        Setting::set('company_email',   $request->email ?? '');
        Setting::set('company_website', $request->website ?? '');
        Setting::set('company_tax_id',  $request->tax_id ?? '');

        return response()->json(['message' => 'Información de empresa guardada correctamente']);
    }

    public function updateReceipts(Request $request): JsonResponse
    {
        $request->validate([
            'prefix'        => 'required|string|max:10',
            'tax_rate'      => 'required|numeric|min:0|max:100',
            'include_logo'  => 'boolean',
            'footer_text'   => 'nullable|string|max:300',
            'payment_terms' => 'nullable|string|max:200',
        ]);

        Setting::set('receipt_prefix',        $request->prefix);
        Setting::set('receipt_tax_rate',      $request->tax_rate);
        Setting::set('receipt_include_logo',  $request->include_logo ? '1' : '0');
        Setting::set('receipt_footer_text',   $request->footer_text ?? '');
        Setting::set('receipt_payment_terms', $request->payment_terms ?? '');

        return response()->json(['message' => 'Configuración de facturación guardada correctamente']);
    }

    public function updateNotifications(Request $request): JsonResponse
    {
        $request->validate([
            'daily_reports'  => 'boolean',
            'new_sale'       => 'boolean',
            'expense_alerts' => 'boolean',
        ]);

        Setting::set('notify_daily_reports',  $request->daily_reports ? '1' : '0');
        Setting::set('notify_new_sale',       $request->new_sale ? '1' : '0');
        Setting::set('notify_expense_alerts', $request->expense_alerts ? '1' : '0');

        return response()->json(['message' => 'Preferencias de notificaciones guardadas correctamente']);
    }

    public function updateSecurity(Request $request): JsonResponse
    {
        $request->validate([
            'session_timeout'         => 'required|integer|min:5|max:480',
            'login_attempts'          => 'required|integer|min:1|max:10',
            'require_password_change' => 'boolean',
        ]);

        Setting::set('security_session_timeout',         $request->session_timeout);
        Setting::set('security_login_attempts',          $request->login_attempts);
        Setting::set('security_require_password_change', $request->require_password_change ? '1' : '0');

        return response()->json(['message' => 'Configuración de seguridad guardada correctamente']);
    }

    // Mantener compatibilidad con código existente
    public function getCurrency(): JsonResponse
    {
        return response()->json([
            'currency' => 'BOB',
            'symbol'   => 'Bs',
        ]);
    }
}
