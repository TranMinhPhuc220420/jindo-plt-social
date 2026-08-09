<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FailedJobController;
use App\Http\Controllers\Admin\PostController as AdminPostController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::get('failed-jobs', [FailedJobController::class, 'index'])->name('failed-jobs.index');

Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
Route::patch('users/{user}', [AdminUserController::class, 'update'])->name('users.update');

Route::get('posts', [AdminPostController::class, 'index'])->name('posts.index');
Route::delete('posts/{post}', [AdminPostController::class, 'destroy'])->name('posts.destroy');
