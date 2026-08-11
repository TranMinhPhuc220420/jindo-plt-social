<?php

namespace App\Providers;

use App\Broadcasting\FirebaseBroadcaster;
use App\Services\Firebase\FirebaseRealtimePublisher;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimiting();
        $this->configureBroadcasting();
    }

    protected function configureBroadcasting(): void
    {
        Broadcast::extend('firebase', function ($app, array $config): FirebaseBroadcaster {
            return new FirebaseBroadcaster(
                $app->make(FirebaseRealtimePublisher::class),
            );
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    protected function configureRateLimiting(): void
    {
        RateLimiter::for('posts', function (Request $request) {
            return Limit::perMinute(10)->by('posts:'.$this->rateLimitKey($request));
        });

        RateLimiter::for('comments', function (Request $request) {
            return Limit::perMinute(30)->by('comments:'.$this->rateLimitKey($request));
        });

        RateLimiter::for('follows', function (Request $request) {
            return Limit::perMinute(30)->by('follows:'.$this->rateLimitKey($request));
        });

        RateLimiter::for('messages', function (Request $request) {
            return Limit::perMinute(60)->by('messages:'.$this->rateLimitKey($request));
        });

        RateLimiter::for('bookmarks', function (Request $request) {
            return Limit::perMinute(60)->by('bookmarks:'.$this->rateLimitKey($request));
        });
    }

    private function rateLimitKey(Request $request): string
    {
        $user = $request->user();

        return $user !== null ? (string) $user->id : (string) $request->ip();
    }
}
