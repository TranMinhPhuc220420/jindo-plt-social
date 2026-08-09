<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/logo.png" type="image/png" sizes="512x512">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <meta name="application-name" content="{{ config('app.name', 'PLT Social') }}">
        <meta name="description" content="PLT Social — share updates, follow friends, and stay in the loop.">
        <meta name="author" content="PLT Solutions">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ config('app.name', 'PLT Social') }}">
        <meta property="og:title" content="{{ config('app.name', 'PLT Social') }}">
        <meta property="og:description" content="Share updates, follow friends, and stay in the loop.">
        <meta property="og:image" content="{{ url('/full-logo.png') }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ config('app.name', 'PLT Social') }}">
        <meta name="twitter:description" content="Share updates, follow friends, and stay in the loop.">
        <meta name="twitter:image" content="{{ url('/full-logo.png') }}">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'PLT Social') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
