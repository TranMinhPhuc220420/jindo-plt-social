<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Firebase project (Admin SDK + client env mirrors)
    |--------------------------------------------------------------------------
    |
    | Service account JSON must live outside the web root on cPanel.
    | Set FIREBASE_CREDENTIALS to an absolute path. Leave blank to disable
    | Admin SDK (broadcast driver no-ops; token endpoint returns 503).
    |
    */

    'credentials' => env('FIREBASE_CREDENTIALS'),

    'database_url' => env('FIREBASE_DATABASE_URL'),

    'project_id' => env('FIREBASE_PROJECT_ID'),

];
