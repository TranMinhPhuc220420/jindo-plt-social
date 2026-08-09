<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->unsignedTinyInteger('position')->default(0);
            $table->string('status')->default('pending');
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->timestamps();

            $table->index(['post_id', 'position']);
        });

        if (Schema::hasColumn('posts', 'image_path')) {
            $posts = DB::table('posts')->whereNotNull('image_path')->get(['id', 'image_path', 'created_at', 'updated_at']);

            foreach ($posts as $post) {
                DB::table('post_media')->insert([
                    'post_id' => $post->id,
                    'path' => $post->image_path,
                    'position' => 0,
                    'status' => 'ready',
                    'created_at' => $post->created_at,
                    'updated_at' => $post->updated_at,
                ]);
            }

            Schema::table('posts', function (Blueprint $table) {
                $table->dropColumn('image_path');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('posts', 'image_path')) {
            Schema::table('posts', function (Blueprint $table) {
                $table->string('image_path')->nullable()->after('body');
            });
        }

        $media = DB::table('post_media')->where('position', 0)->get(['post_id', 'path']);

        foreach ($media as $item) {
            DB::table('posts')->where('id', $item->post_id)->update([
                'image_path' => $item->path,
            ]);
        }

        Schema::dropIfExists('post_media');
    }
};
