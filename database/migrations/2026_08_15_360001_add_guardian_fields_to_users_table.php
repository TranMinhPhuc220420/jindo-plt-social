<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('guardian_name')->nullable();
            $table->string('guardian_email')->nullable();
            $table->string('guardian_relationship')->nullable();
            $table->timestamp('guardian_consented_at')->nullable();
            $table->timestamp('child_consented_at')->nullable();
            $table->timestamp('under18_attested_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'guardian_name',
                'guardian_email',
                'guardian_relationship',
                'guardian_consented_at',
                'child_consented_at',
                'under18_attested_at',
            ]);
        });
    }
};
