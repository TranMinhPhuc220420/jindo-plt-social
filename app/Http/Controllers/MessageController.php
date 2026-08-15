<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMessageMediaRequest;
use App\Support\MediaDisk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;

class MessageController extends Controller
{
    public function storeMedia(StoreMessageMediaRequest $request): JsonResponse
    {
        /** @var UploadedFile $image */
        $image = $request->file('image');
        $path = $image->store('messages', MediaDisk::name());

        if ($path === false) {
            abort(500);
        }

        return response()->json([
            'image_url' => MediaDisk::disk()->url($path),
        ], 201);
    }
}
