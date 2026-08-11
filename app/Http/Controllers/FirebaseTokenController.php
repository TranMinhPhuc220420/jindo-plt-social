<?php

namespace App\Http\Controllers;

use App\Services\Firebase\FirebaseClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class FirebaseTokenController extends Controller
{
    public function __invoke(Request $request, FirebaseClient $firebase): JsonResponse
    {
        if (! $firebase->enabled()) {
            return response()->json([
                'message' => 'Firebase is not configured.',
            ], 503);
        }

        $user = $request->user();

        abort_unless($user !== null, 401);

        try {
            $token = $firebase->auth()->createCustomToken((string) $user->id);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to mint Firebase custom token.',
            ], 503);
        }

        return response()->json([
            'token' => $token->toString(),
        ]);
    }
}
