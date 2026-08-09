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
            $table->string('workplace')->nullable()->after('bio');
            $table->string('education')->nullable()->after('workplace');
            $table->string('location')->nullable()->after('education');
            $table->string('hometown')->nullable()->after('location');
            $table->string('website')->nullable()->after('hometown');
            $table->date('birthday')->nullable()->after('website');
            $table->string('gender')->nullable()->after('birthday');
            $table->string('relationship_status')->nullable()->after('gender');
            $table->json('profile_privacy')->nullable()->after('relationship_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'workplace',
                'education',
                'location',
                'hometown',
                'website',
                'birthday',
                'gender',
                'relationship_status',
                'profile_privacy',
            ]);
        });
    }
};
