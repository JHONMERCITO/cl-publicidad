<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Valores por defecto
        $defaults = [
            // Empresa
            ['key' => 'company_name',         'value' => 'Big Arte'],
            ['key' => 'company_address',       'value' => 'Sucursal - Av. Cañoto'],
            ['key' => 'company_phone',         'value' => '73149544'],
            ['key' => 'company_email',         'value' => ''],
            ['key' => 'company_website',       'value' => ''],
            ['key' => 'company_tax_id',        'value' => ''],
            // Facturación
            ['key' => 'receipt_prefix',        'value' => 'REC'],
            ['key' => 'receipt_tax_rate',      'value' => '0'],
            ['key' => 'receipt_include_logo',  'value' => '1'],
            ['key' => 'receipt_footer_text',   'value' => 'Gracias por confiar en Big Arte!'],
            ['key' => 'receipt_payment_terms', 'value' => 'Pago al contado'],
            // Notificaciones
            ['key' => 'notify_daily_reports',  'value' => '0'],
            ['key' => 'notify_new_sale',       'value' => '1'],
            ['key' => 'notify_expense_alerts', 'value' => '1'],
            // Seguridad
            ['key' => 'security_session_timeout',          'value' => '60'],
            ['key' => 'security_login_attempts',           'value' => '5'],
            ['key' => 'security_require_password_change',  'value' => '0'],
        ];

        foreach ($defaults as $setting) {
            DB::table('settings')->insert(array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
