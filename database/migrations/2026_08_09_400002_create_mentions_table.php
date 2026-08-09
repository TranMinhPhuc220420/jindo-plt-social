<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mentions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('mentioned_user_id')->constrained('users')->cascadeOnDelete();
            $table->morphs('mentionable');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(
                ['mentioned_user_id', 'mentionable_type', 'mentionable_id'],
                'mentions_user_mentionable_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentions');
    }
};
