<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Recibo {{ $receipt->receipt_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #333;
            background: #fff;
        }

        /* ── CABECERA ── */
        .header-table {
            width: 100%;
            background-color: #A01520;
            padding: 0;
            margin-bottom: 18px;
        }

        .header-logo-cell {
            width: 110px;
            padding: 10px 10px 10px 16px;
            vertical-align: middle;
        }

        .header-logo {
            width: 90px;
            height: auto;
        }

        .header-info-cell {
            padding: 14px 10px;
            vertical-align: middle;
        }

        .company-name {
            font-size: 22px;
            font-weight: bold;
            color: #fff;
            letter-spacing: 1px;
        }

        .company-sub {
            font-size: 11px;
            color: #fff;
            margin-top: 2px;
            opacity: 0.95;
        }

        .company-addr {
            font-size: 11px;
            color: #fff;
            margin-top: 2px;
        }

        .header-badge-cell {
            width: 150px;
            padding: 14px 16px 14px 10px;
            vertical-align: middle;
            text-align: right;
        }

        .badge-box {
            border: 2px solid #fff;
            border-radius: 6px;
            padding: 8px 12px;
            display: inline-block;
            text-align: center;
        }

        .badge-title {
            font-size: 12px;
            font-weight: bold;
            color: #fff;
            letter-spacing: 2px;
        }

        .badge-number {
            font-size: 11px;
            color: #fff;
            margin-top: 3px;
        }

        /* ── CUERPO ── */
        .body { padding: 0 20px; }

        /* Metadatos */
        .meta-table {
            width: 100%;
            border: 1px solid #A01520;
            border-collapse: collapse;
            margin-bottom: 14px;
        }

        .meta-table td {
            padding: 8px 12px;
            border-right: 1px solid #FBBDBD;
            width: 33.33%;
            vertical-align: top;
        }

        .meta-table td:last-child { border-right: none; }

        .meta-label {
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #A01520;
            font-weight: bold;
            margin-bottom: 3px;
        }

        .meta-value {
            font-size: 12px;
            font-weight: bold;
            color: #333;
        }

        /* Estado badges */
        .status-completado    { color: #065F46; background-color: #D1FAE5; padding: 2px 7px; border-radius: 10px; font-size: 10px; font-weight: bold; }
        .status-con_anticipo  { color: #1E40AF; background-color: #DBEAFE; padding: 2px 7px; border-radius: 10px; font-size: 10px; font-weight: bold; }
        .status-en_produccion { color: #5B21B6; background-color: #EDE9FE; padding: 2px 7px; border-radius: 10px; font-size: 10px; font-weight: bold; }
        .status-listo_entrega { color: #92400E; background-color: #FEF3C7; padding: 2px 7px; border-radius: 10px; font-size: 10px; font-weight: bold; }
        .status-cotizado      { color: #374151; background-color: #F3F4F6; padding: 2px 7px; border-radius: 10px; font-size: 10px; font-weight: bold; }
        .status-cancelado     { color: #991B1B; background-color: #FEE2E2; padding: 2px 7px; border-radius: 10px; font-size: 10px; font-weight: bold; }

        /* Cliente */
        .customer-box {
            border-left: 4px solid #A01520;
            background-color: #FEF2F2;
            padding: 10px 14px;
            margin-bottom: 14px;
        }

        .customer-label {
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #A01520;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .customer-name {
            font-size: 14px;
            font-weight: bold;
            color: #1C476A;
        }

        .customer-detail {
            font-size: 11px;
            color: #555;
            margin-top: 2px;
        }

        /* Tabla de servicios */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            font-size: 11px;
        }

        .items-table th {
            background-color: #2C6DA0;
            color: #fff;
            padding: 8px 10px;
            text-align: left;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .items-table td {
            padding: 7px 10px;
            border-bottom: 1px solid #eee;
        }

        .items-table .row-even td {
            background-color: #EBF2F8;
        }

        .text-right  { text-align: right; }
        .text-center { text-align: center; }

        /* Sección inferior: pagos + totales */
        .bottom-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }

        .payments-cell {
            vertical-align: top;
            width: 52%;
            padding-right: 14px;
        }

        .totals-cell {
            vertical-align: top;
            width: 48%;
        }

        .section-title {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #2C6DA0;
            font-weight: bold;
            border-bottom: 2px solid #2C6DA0;
            padding-bottom: 4px;
            margin-bottom: 8px;
        }

        /* Pagos */
        .payment-row-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
            background-color: #EBF2F8;
        }

        .payment-row-table td {
            padding: 5px 8px;
            font-size: 10px;
        }

        .pay-type   { font-weight: bold; color: #1C476A; width: 35%; }
        .pay-method { color: #245A85; text-align: center; width: 35%; }
        .pay-amount { text-align: right; font-weight: bold; color: #1C476A; width: 30%; }

        /* Totales */
        .totals-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }

        .totals-table td {
            padding: 5px 8px;
            border-bottom: 1px solid #eee;
        }

        .totals-table td:last-child { text-align: right; font-weight: bold; }

        .row-total td {
            background-color: #A01520;
            color: #fff;
            font-size: 13px;
            font-weight: bold;
            border-bottom: none;
            padding: 8px 10px;
        }

        .row-paid td {
            background-color: #EBF2F8;
            color: #245A85;
            font-weight: bold;
            border-bottom: none;
        }

        .row-pending td {
            background-color: #FEE2E2;
            color: #991B1B;
            font-weight: bold;
            border-bottom: none;
        }

        /* Notas */
        .notes-box {
            border-left: 4px solid #F59E0B;
            background-color: #FFFBEB;
            padding: 9px 14px;
            margin-bottom: 14px;
            font-size: 11px;
        }

        .notes-label {
            font-size: 9px;
            text-transform: uppercase;
            color: #92400E;
            font-weight: bold;
            margin-bottom: 4px;
        }

        /* Firmas */
        .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 60px;
        }

        .sign-cell {
            width: 50%;
            text-align: center;
            padding: 0 40px;
        }

        .sign-line {
            border-bottom: 2px solid #2C6DA0;
            height: 70px;
            margin-bottom: 5px;
        }

        .sign-label {
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #555;
        }

        /* Footer */
        .footer {
            margin-top: 24px;
            background-color: #A01520;
            padding: 10px 20px;
            text-align: center;
        }

        .footer-tagline {
            font-size: 12px;
            font-weight: bold;
            color: #fff;
            margin-bottom: 2px;
        }

        .footer-sub {
            font-size: 9px;
            color: #fff;
            margin-top: 2px;
        }
    </style>
</head>
<body>

@php
    $formatCurrency = function($amount) {
        $currency = config('app.currency', 'BOB');
        return $currency === 'USD'
            ? '$' . number_format($amount, 2, '.', ',')
            : 'Bs ' . number_format($amount, 2, ',', '.');
    };

    $statusLabels = [
        'cotizado'      => 'Cotizado',
        'con_anticipo'  => 'Con Anticipo',
        'en_produccion' => 'En Produccion',
        'listo_entrega' => 'Listo para Entrega',
        'completado'    => 'Completado',
        'cancelado'     => 'Cancelado',
    ];

    $paymentTypeLabels = [
        'anticipo'   => 'Anticipo',
        'abono'      => 'Abono',
        'pago_final' => 'Pago Final',
    ];

    $paymentMethodLabels = [
        'efectivo'      => 'Efectivo',
        'transferencia' => 'Transferencia',
        'tarjeta'       => 'Tarjeta',
        'cheque'        => 'Cheque',
    ];

    $logoPath = 'file://' . public_path('images/logo.png');
@endphp

{{-- CABECERA --}}
<table class="header-table" cellpadding="0" cellspacing="0" bgcolor="#A01520">
    <tr>
        <td class="header-logo-cell">
            @if(($company['include_logo'] ?? true) && file_exists(public_path('images/logo.png')))
                <img src="{{ $logoPath }}" class="header-logo" alt="{{ $company['name'] }}">
            @else
                <div style="width:64px;height:64px;border-radius:50%;background:#fff3;border:3px solid #fff;text-align:center;line-height:58px;font-size:18px;font-weight:bold;color:#fff;">CL</div>
            @endif
        </td>
        <td class="header-info-cell">
            <div class="company-name">{{ strtoupper($company['name']) }}</div>
            <div class="company-sub">Publicidad &amp; Marketing</div>
            @if(!empty($company['phone']))
                <div class="company-addr">Tel: {{ $company['phone'] }}</div>
            @endif
            @if(!empty($company['address']))
                <div class="company-addr">{{ $company['address'] }}</div>
            @endif
            @if(!empty($company['email']))
                <div class="company-addr">{{ $company['email'] }}</div>
            @endif
        </td>
        <td class="header-badge-cell">
            <div class="badge-box">
                <div class="badge-title">RECIBO</div>
                <div class="badge-number">{{ $receipt->receipt_number }}</div>
            </div>
        </td>
    </tr>
</table>

<div class="body">

    {{-- METADATOS --}}
    <table class="meta-table" cellpadding="0" cellspacing="0">
        <tr>
            <td>
                <div class="meta-label">Fecha</div>
                <div class="meta-value">{{ $receipt->receipt_date->format('d/m/Y') }}</div>
            </td>
            <td>
                <div class="meta-label">Atendido por</div>
                <div class="meta-value">{{ $receipt->user->name }}</div>
            </td>
            <td>
                <div class="meta-label">Estado</div>
                <div class="meta-value">
                    <span class="status-{{ $receipt->status }}">
                        {{ $statusLabels[$receipt->status] ?? ucfirst($receipt->status) }}
                    </span>
                </div>
            </td>
        </tr>
    </table>

    {{-- CLIENTE --}}
    <div class="customer-box">
        <div class="customer-label">Cliente</div>
        <div class="customer-name">{{ $receipt->customer_name }}</div>
        @if($receipt->customer_phone)
            <div class="customer-detail">Tel: {{ $receipt->customer_phone }}</div>
        @endif
        @if($receipt->customer_email)
            <div class="customer-detail">Email: {{ $receipt->customer_email }}</div>
        @endif
        @if($receipt->customer_address)
            <div class="customer-detail">Dir: {{ $receipt->customer_address }}</div>
        @endif
    </div>

    {{-- SERVICIOS --}}
    <table class="items-table" cellpadding="0" cellspacing="0">
        <thead>
            <tr bgcolor="#2C6DA0">
                <th>Servicio / Descripcion</th>
                <th class="text-center" style="width:70px;">Cantidad</th>
                <th class="text-right" style="width:90px;">Precio Unit.</th>
                <th class="text-right" style="width:90px;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($receipt->items as $i => $item)
                <tr class="{{ $i % 2 === 1 ? 'row-even' : '' }}">
                    <td>{{ $item->product_name }}</td>
                    <td class="text-center">{{ number_format($item->quantity, 2) }}</td>
                    <td class="text-right">{{ $formatCurrency($item->price) }}</td>
                    <td class="text-right">{{ $formatCurrency($item->subtotal) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    {{-- PAGOS + TOTALES --}}
    <table class="bottom-table" cellpadding="0" cellspacing="0">
        <tr>
            {{-- Pagos --}}
            <td class="payments-cell">
                @if($receipt->payments && $receipt->payments->count() > 0)
                    <div class="section-title">Pagos Registrados</div>
                    @foreach($receipt->payments as $payment)
                        <table class="payment-row-table" cellpadding="0" cellspacing="0">
                            <tr>
                                <td class="pay-type">{{ $paymentTypeLabels[$payment->type] ?? $payment->type }}</td>
                                <td class="pay-method">{{ $paymentMethodLabels[$payment->payment_method] ?? $payment->payment_method }}</td>
                                <td class="pay-amount">{{ $formatCurrency($payment->amount) }}</td>
                            </tr>
                        </table>
                    @endforeach
                @endif
            </td>

            {{-- Totales --}}
            <td class="totals-cell">
                <div class="section-title">Resumen</div>
                <table class="totals-table" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>Subtotal</td>
                        <td>{{ $formatCurrency($receipt->subtotal) }}</td>
                    </tr>
                    @if($receipt->tax > 0)
                        <tr>
                            <td>Impuesto (IVA)</td>
                            <td>{{ $formatCurrency($receipt->tax) }}</td>
                        </tr>
                    @endif
                    @if($receipt->discount > 0)
                        <tr>
                            <td>Descuento</td>
                            <td>-{{ $formatCurrency($receipt->discount) }}</td>
                        </tr>
                    @endif
                    <tr class="row-total" bgcolor="#A01520">
                        <td>TOTAL</td>
                        <td>{{ $formatCurrency($receipt->total) }}</td>
                    </tr>
                    @if($receipt->paid_amount > 0 && $receipt->paid_amount < $receipt->total)
                        <tr class="row-paid">
                            <td>Pagado</td>
                            <td>{{ $formatCurrency($receipt->paid_amount) }}</td>
                        </tr>
                        <tr class="row-pending">
                            <td>Saldo Pendiente</td>
                            <td>{{ $formatCurrency($receipt->total - $receipt->paid_amount) }}</td>
                        </tr>
                    @endif
                </table>
            </td>
        </tr>
    </table>

    @if($receipt->notes)
        <div class="notes-box">
            <div class="notes-label">Notas</div>
            <div>{{ $receipt->notes }}</div>
        </div>
    @endif

    {{-- FIRMAS --}}
    <table class="signatures-table" cellpadding="0" cellspacing="0">
        <tr>
            <td class="sign-cell">
                <div class="sign-line"></div>
                <div class="sign-label">Entregue conforme</div>
            </td>
            <td class="sign-cell">
                <div class="sign-line"></div>
                <div class="sign-label">Recibi conforme</div>
            </td>
        </tr>
    </table>

</div>

{{-- FOOTER --}}
<div class="footer" style="margin-top:24px;background-color:#A01520 !important;padding:10px 20px;text-align:center;">
    <div class="footer-tagline">{{ $company['footer_text'] ?? 'Gracias por confiar en Big Arte!' }}</div>
    <div class="footer-sub">Este documento es un recibo interno, no constituye factura fiscal.</div>
    <div class="footer-sub">Generado el {{ now()->format('d/m/Y H:i') }}</div>
</div>

</body>
</html>
