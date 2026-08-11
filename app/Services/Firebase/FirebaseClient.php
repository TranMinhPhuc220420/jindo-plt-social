<?php

namespace App\Services\Firebase;

use Kreait\Firebase\Contract\Auth;
use Kreait\Firebase\Contract\Database;
use Kreait\Firebase\Factory;
use RuntimeException;

class FirebaseClient
{
    private ?Factory $factory = null;

    private ?Database $database = null;

    private ?Auth $auth = null;

    public function enabled(): bool
    {
        return $this->resolvedCredentialsPath() !== null
            && $this->resolvedDatabaseUrl() !== null;
    }

    public function database(): Database
    {
        if ($this->database !== null) {
            return $this->database;
        }

        $this->database = $this->factory()->createDatabase();

        return $this->database;
    }

    public function auth(): Auth
    {
        if ($this->auth !== null) {
            return $this->auth;
        }

        $this->auth = $this->factory()->createAuth();

        return $this->auth;
    }

    private function factory(): Factory
    {
        if ($this->factory !== null) {
            return $this->factory;
        }

        $credentials = $this->resolvedCredentialsPath();
        $databaseUrl = config('firebase.database_url');

        if ($credentials === null || ! is_string($databaseUrl) || $databaseUrl === '') {
            throw new RuntimeException('Firebase Admin SDK is not configured.');
        }

        $this->factory = (new Factory)
            ->withServiceAccount($credentials)
            ->withDatabaseUri($databaseUrl);

        return $this->factory;
    }

    /**
     * Resolve FIREBASE_CREDENTIALS to an absolute, readable path.
     * Relative paths are resolved from the Laravel base path (not process CWD).
     */
    private function resolvedCredentialsPath(): ?string
    {
        $credentials = config('firebase.credentials');

        if (! is_string($credentials) || $credentials === '') {
            return null;
        }

        if (! $this->isAbsolutePath($credentials)) {
            $credentials = base_path($credentials);
        }

        return is_readable($credentials) ? $credentials : null;
    }

    private function resolvedDatabaseUrl(): ?string
    {
        $databaseUrl = config('firebase.database_url');

        if (! is_string($databaseUrl) || $databaseUrl === '') {
            return null;
        }

        return $databaseUrl;
    }

    private function isAbsolutePath(string $path): bool
    {
        return str_starts_with($path, '/')
            || (strlen($path) > 2 && ctype_alpha($path[0]) && $path[1] === ':');
    }
}
