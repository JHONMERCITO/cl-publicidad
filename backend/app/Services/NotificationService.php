<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    private static function sendTelegram(string $message): void
    {
        $token  = config('services.telegram.bot_token', '');
        $chatId = config('services.telegram.chat_id', '');

        if (!$token || !$chatId) return;

        try {
            Http::get("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id'    => $chatId,
                'text'       => $message,
                'parse_mode' => 'HTML',
            ]);
        } catch (\Exception $e) {
            Log::error('Error enviando notificación Telegram: ' . $e->getMessage());
        }
    }

    public static function sendNewSaleNotification(array $receipt): void
    {
        if (!Setting::get('notify_new_sale', '1')) return;

        $message = "🧾 <b>Nueva venta registrada</b>\n\n"
            . "📋 Número: {$receipt['receipt_number']}\n"
            . "👤 Cliente: {$receipt['customer_name']}\n"
            . "💰 Total: {$receipt['total']}\n"
            . "📅 Fecha: {$receipt['created_at']}";

        self::sendTelegram($message);
    }

    public static function sendNewExpenseNotification(array $expense): void
    {
        if (!Setting::get('notify_expense_alerts', '1')) return;

        $message = "💸 <b>Nuevo gasto registrado</b>\n\n"
            . "📝 Descripción: {$expense['description']}\n"
            . "📂 Categoría: {$expense['category']}\n"
            . "💰 Monto: {$expense['amount']}\n"
            . "📅 Fecha: {$expense['expense_date']}";

        self::sendTelegram($message);
    }
}
