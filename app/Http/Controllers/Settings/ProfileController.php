<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileMediaUpdateRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Services\ProfileAboutPresenter;
use App\Support\MediaDisk;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        private readonly ProfileAboutPresenter $aboutPresenter,
    ) {}

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'about' => $this->aboutPresenter->forSettings($request->user()),
        ]);
    }

    /**
     * Update the user's profile information (text fields only).
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->safe()->only([
            'name',
            'username',
            'email',
            'bio',
            'education',
        ]);

        $incomingPrivacy = $request->input('profile_privacy', []);
        if (is_array($incomingPrivacy)) {
            $merged = $this->aboutPresenter->resolvedPrivacy($user);
            $privacyPayload = [];

            foreach (ProfileAboutPresenter::FIELDS as $key) {
                $privacyPayload[$key] = isset($incomingPrivacy[$key])
                    && is_string($incomingPrivacy[$key])
                    ? $incomingPrivacy[$key]
                    : $merged[$key]->value;
            }

            $data['profile_privacy'] = $privacyPayload;
        }

        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Update avatar and/or cover from the public profile header.
     */
    public function updateMedia(ProfileMediaUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        if ($request->hasFile('avatar')) {
            if ($user->avatar_path) {
                MediaDisk::disk()->delete($user->avatar_path);
            }
            $user->avatar_path = $request->file('avatar')->store('avatars', MediaDisk::name());
        }

        if ($request->hasFile('cover')) {
            if ($user->cover_path) {
                MediaDisk::disk()->delete($user->cover_path);
            }
            $user->cover_path = $request->file('cover')->store('covers', MediaDisk::name());
        }

        $user->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $request->hasFile('avatar') && $request->hasFile('cover')
                ? __('Photos updated.')
                : ($request->hasFile('avatar')
                    ? __('Profile photo updated.')
                    : __('Cover photo updated.')),
        ]);

        return back();
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
