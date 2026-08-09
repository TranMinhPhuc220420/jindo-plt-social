<?php

use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\ExploreController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostShareController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ShareRecipientController;
use App\Http\Controllers\TagController;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsNotSuspended;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified', EnsureUserIsNotSuspended::class])->group(function () {
    Route::get('feed', [FeedController::class, 'index'])->name('feed');
    Route::redirect('dashboard', '/feed')->name('dashboard');

    Route::get('explore', [ExploreController::class, 'index'])->name('explore');
    Route::get('search', [SearchController::class, 'index'])->name('search');
    Route::get('bookmarks', [BookmarkController::class, 'index'])->name('bookmarks.index');
    Route::get('t/{slug}', [TagController::class, 'show'])->name('tags.show');

    Route::get('messages', [ConversationController::class, 'index'])->name('messages.index');
    Route::post('messages', [ConversationController::class, 'store'])->middleware('throttle:messages')->name('messages.store');
    Route::get('messages/{conversation}', [ConversationController::class, 'show'])->name('messages.show');
    Route::post('messages/{conversation}/read', [ConversationController::class, 'markRead'])->name('messages.read');
    Route::post('messages/{conversation}/typing', [ConversationController::class, 'typing'])->middleware('throttle:messages')->name('messages.typing');
    Route::post('messages/{conversation}/messages', [MessageController::class, 'store'])->middleware('throttle:messages')->name('messages.messages.store');

    Route::post('posts', [PostController::class, 'store'])->middleware('throttle:posts')->name('posts.store');
    Route::get('posts/{post}', [PostController::class, 'show'])->name('posts.show');
    Route::patch('posts/{post}', [PostController::class, 'update'])->middleware('throttle:posts')->name('posts.update');
    Route::delete('posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');

    Route::post('posts/{post}/share', [PostShareController::class, 'store'])->middleware('throttle:posts')->name('posts.share');
    Route::post('posts/{post}/share-message', [PostShareController::class, 'storeMessage'])->middleware('throttle:messages')->name('posts.share-message');
    Route::get('share-recipients', [ShareRecipientController::class, 'index'])->middleware('throttle:messages')->name('share-recipients.index');

    Route::post('posts/{post}/like', [LikeController::class, 'store'])->name('likes.store');
    Route::delete('posts/{post}/like', [LikeController::class, 'destroy'])->name('likes.destroy');

    Route::post('posts/{post}/bookmark', [BookmarkController::class, 'store'])->middleware('throttle:bookmarks')->name('bookmarks.store');
    Route::delete('posts/{post}/bookmark', [BookmarkController::class, 'destroy'])->middleware('throttle:bookmarks')->name('bookmarks.destroy');

    Route::post('posts/{post}/comments', [CommentController::class, 'store'])->middleware('throttle:comments')->name('comments.store');
    Route::delete('comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

    Route::get('u/{username}', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('u/{username}/about', [ProfileController::class, 'about'])->name('profile.about');
    Route::get('u/{username}/photos', [ProfileController::class, 'photos'])->name('profile.photos');
    Route::get('u/{username}/followers', [ProfileController::class, 'followers'])->name('profile.followers');
    Route::get('u/{username}/following', [ProfileController::class, 'following'])->name('profile.following');

    Route::post('u/{username}/follow', [FollowController::class, 'store'])->middleware('throttle:follows')->name('follow.store');
    Route::delete('u/{username}/follow', [FollowController::class, 'destroy'])->middleware('throttle:follows')->name('follow.destroy');
});

Route::middleware(['auth', 'verified', EnsureUserIsAdmin::class])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        require __DIR__.'/admin.php';
    });

require __DIR__.'/settings.php';
