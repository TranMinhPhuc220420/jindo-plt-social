<?php

test('guests can read community legal pages', function (string $path, string $title) {
    $this->get($path)
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('legal/show')
            ->where('title', $title)
            ->has('html')
            ->has('pages', 3)
        );
})->with([
    ['/guidelines', 'Nội quy cộng đồng'],
    ['/privacy', 'Bảo vệ dữ liệu cá nhân'],
    ['/copyright', 'Bản quyền'],
]);
