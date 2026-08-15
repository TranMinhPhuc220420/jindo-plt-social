<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FailedJobController;
use App\Http\Controllers\Admin\PostController as AdminPostController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::get('failed-jobs', [FailedJobController::class, 'index'])->name('failed-jobs.index');

Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
Route::post('users', [AdminUserController::class, 'store'])->name('users.store');
Route::patch('users/{user}', [AdminUserController::class, 'update'])->name('users.update');

Route::get('posts', [AdminPostController::class, 'index'])->name('posts.index');
Route::patch('posts/{post}/approve', [AdminPostController::class, 'approve'])->name('posts.approve');
Route::patch('posts/{post}/reject', [AdminPostController::class, 'reject'])->name('posts.reject');
Route::delete('posts/{post}', [AdminPostController::class, 'destroy'])->name('posts.destroy');

Route::get('reports', [AdminReportController::class, 'index'])->name('reports.index');
Route::patch('reports/{report}/dismiss', [AdminReportController::class, 'dismiss'])->name('reports.dismiss');
Route::patch('reports/{report}/resolve', [AdminReportController::class, 'resolve'])->name('reports.resolve');
