<?php

test('welcome presents the learning community brand', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->where('name', 'PLT Học Bá')
            ->where('tagline', 'Học để giỏi - Chia sẻ để cùng tiến bộ')
            ->where('subtitle', 'Nền tảng cộng đồng học tập của PLT Solutions')
            ->where('canRegister', false)
        );
});

test('welcome does not offer public signup when registration is closed', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('canRegister', false)
        );
});

test('closed registration is shown instead of a signup form', function () {
    $this->get(route('register'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/register-closed')
            ->where('canRegister', false)
        );
});
