<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->string('type', 32)->default('like')->after('post_id');
        });

        DB::table('likes')->whereNull('type')->orWhere('type', '')->update(['type' => 'like']);
    }

    public function down(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
