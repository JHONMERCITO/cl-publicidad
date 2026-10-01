<?php

if (!function_exists('formatCurrency')) {
    /**
     * Formatear moneda según configuración del sistema
     * 
     * @param float $amount
     * @param string|null $currencyCode
     * @return string
     */
    function formatCurrency($amount, $currencyCode = null)
    {
        // Obtener moneda del config o usar BOB por defecto
        $currency = $currencyCode ?: config('app.currency', 'BOB');
        
        // Configuraciones de monedas
        $currencies = [
            'BOB' => [
                'symbol' => 'Bs',
                'decimals' => 2,
                'decimal_separator' => ',',
                'thousands_separator' => '.'
            ],
            'USD' => [
                'symbol' => '$',
                'decimals' => 2,
                'decimal_separator' => '.',
                'thousands_separator' => ','
            ]
        ];
        
        $config = $currencies[$currency] ?? $currencies['BOB'];
        
        // Formatear número
        $formattedAmount = number_format(
            $amount, 
            $config['decimals'], 
            $config['decimal_separator'], 
            $config['thousands_separator']
        );
        
        // Retornar con símbolo
        return $config['symbol'] . ' ' . $formattedAmount;
    }
}

if (!function_exists('getCurrencySymbol')) {
    /**
     * Obtener símbolo de moneda actual
     * 
     * @param string|null $currencyCode
     * @return string
     */
    function getCurrencySymbol($currencyCode = null)
    {
        $currency = $currencyCode ?: config('app.currency', 'BOB');
        
        $symbols = [
            'BOB' => 'Bs',
            'USD' => '$'
        ];
        
        return $symbols[$currency] ?? 'Bs';
    }
}

if (!function_exists('getCurrentCurrency')) {
    /**
     * Obtener moneda actual del sistema
     * 
     * @return string
     */
    function getCurrentCurrency()
    {
        return config('app.currency', 'BOB');
    }
}
