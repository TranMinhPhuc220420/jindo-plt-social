<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class LegalController extends Controller
{
    /**
     * @var array<string, array{file: string, title: string}>
     */
    private const PAGES = [
        'guidelines' => [
            'file' => 'guidelines.md',
            'title' => 'Nội quy cộng đồng',
        ],
        'privacy' => [
            'file' => 'privacy.md',
            'title' => 'Bảo vệ dữ liệu cá nhân',
        ],
        'copyright' => [
            'file' => 'copyright.md',
            'title' => 'Bản quyền',
        ],
    ];

    public function show(string $page): Response
    {
        $meta = self::PAGES[$page] ?? null;

        if ($meta === null) {
            throw new NotFoundHttpException;
        }

        $path = resource_path('legal/'.$meta['file']);

        if (! File::isFile($path)) {
            throw new NotFoundHttpException;
        }

        $html = Str::markdown(File::get($path), [
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
        ]);

        return Inertia::render('legal/show', [
            'slug' => $page,
            'title' => $meta['title'],
            'html' => $html,
            'pages' => collect(self::PAGES)
                ->map(fn (array $item, string $slug) => [
                    'slug' => $slug,
                    'title' => $item['title'],
                    'href' => '/'.$slug,
                ])
                ->values()
                ->all(),
        ]);
    }
}
