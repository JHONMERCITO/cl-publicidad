<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class HelperServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Cargar helpers
        $this->loadHelpers();
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Cargar archivos helper
     */
    private function loadHelpers()
    {
        $helperPath = app_path('Helpers/CurrencyHelper.php');
        
        if (file_exists($helperPath)) {
            require_once $helperPath;
        }
    }
}
