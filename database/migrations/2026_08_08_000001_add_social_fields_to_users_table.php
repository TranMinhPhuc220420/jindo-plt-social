<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('name');
            $table->string('bio', 160)->nullable()->after('username');
            $table->string('avatar_path')->nullable()->after('bio');
            $table->string('cover_path')->nullable()->after('avatar_path');
            $table->string('role')->default('user')->index()->after('cover_path');
            $table->timestamp('suspended_at')->nullable()->after('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'bio',
                'avatar_path',
                'cover_path',
                'role',
                'suspended_at',
            ]);
        });
    }
};
