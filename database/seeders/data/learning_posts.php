<?php

declare(strict_types=1);

/**
 * Curated Vietnamese learning-community posts. Hashtags must be ASCII (#ChatGPT).
 *
 * @return list<array{
 *     author: string,
 *     days_ago: int,
 *     body: string,
 *     image_keys: list<string>,
 *     comments: list<array{author: string, body: string, hours_after: int}>,
 *     reactions: list<array{author: string, type: string}>
 * }>
 */
return [
    [
        'author' => 'testuser',
        'days_ago' => 16,
        'body' => <<<'TXT'
Hôm qua mình kẹt một Form Request: rule `unique` không bỏ qua đúng user đang sửa hồ sơ.

Lần đầu mình dán cả controller vào ChatGPT và bảo “sửa giúp”. Câu trả lời trông chạy được, nhưng mình không giải thích nổi vì sao. Mentor nói đó không phải học — đó là copy.

Cách hỏi lại: mô tả rule hiện tại, dán đúng method, nói mình đã thử `Rule::unique('users', 'email')->ignore($this->user())` và test fail thế nào. Câu trả lời lần sau ngắn hơn. Mình viết lại test trước khi tin.

#ChatGPT #Laravel #Prompt
TXT,
        'image_keys' => ['laptop-code'],
        'comments' => [
            [
                'author' => 'huy',
                'hours_after' => 4,
                'body' => 'Đúng hướng. Test fail trước, rồi mới hỏi AI. Nhớ assert cả trường hợp email trùng của người khác.',
            ],
        ],
        'reactions' => [
            ['author' => 'huy', 'type' => 'insightful'],
            ['author' => 'mai', 'type' => 'like'],
            ['author' => 'linh', 'type' => 'support'],
        ],
    ],
    [
        'author' => 'huy',
        'days_ago' => 15,
        'body' => <<<'TXT'
Nếu bạn mới tới Pest: đừng bắt đầu bằng unit test cho service “cho có”. Hãy viết một feature test cho hành vi bạn vừa thêm.

Ví dụ: thành viên đăng bài thì `moderation_status` là pending; admin đăng thì approved. Một file Pest đọc được còn hơn năm test assertTrue mơ hồ.

Khi test xanh, lúc đó mới tách service. TDD không phải viết test sau cho đủ coverage.

#Pest #Testing #Laravel
TXT,
        'image_keys' => ['code-editor'],
        'comments' => [
            [
                'author' => 'tuan',
                'hours_after' => 6,
                'body' => 'Mình từng viết test sau, lúc fail không biết là bug hay test sai. Lần sau mình làm theo thứ tự này.',
            ],
        ],
        'reactions' => [
            ['author' => 'thanhha', 'type' => 'insightful'],
            ['author' => 'testuser', 'type' => 'like'],
            ['author' => 'bao', 'type' => 'celebrate'],
        ],
    ],
    [
        'author' => 'mai',
        'days_ago' => 14,
        'body' => <<<'TXT'
Gemini khá ổn khi mình đưa syllabus tuần và nhờ nó soạn đề cương ôn, không phải soạn bài giải.

Mình gửi: danh sách buổi học, những mục mình còn yếu, và yêu cầu output là câu hỏi tự luận + checklist ôn — không phải đoạn văn hoàn chỉnh để nộp.

Nếu để Gemini “viết giúp báo cáo”, mình đọc xong chẳng nhớ gì. Dùng nó như trợ lý lịch học thì giữ được phần não phải làm việc.

#Gemini #Prompt
TXT,
        'image_keys' => ['notebook'],
        'comments' => [
            [
                'author' => 'linh',
                'hours_after' => 2,
                'body' => 'Mình cũng chặn output “bài làm sẵn” trong system prompt. Nhờ nó hỏi ngược mình trước khi gợi ý.',
            ],
        ],
        'reactions' => [
            ['author' => 'linh', 'type' => 'love'],
            ['author' => 'admin', 'type' => 'like'],
        ],
    ],
    [
        'author' => 'thanhha',
        'days_ago' => 13,
        'body' => <<<'TXT'
Checklist mình dùng trước khi mở PR (không dài, nên làm thật):

1. Feature test cho đường hạnh phúc và một đường fail (403 / validation).
2. `Http::fake()` / `Storage::fake()` nếu đụng mạng hoặc file.
3. Không assert HTML cứng nếu Inertia đã trả props — assert props.
4. Chạy lại đúng file test vừa đụng, rồi mới chạy cả suite.

AI hay sinh test “trông có assertion”. Việc của mình là xóa assertion không chứng minh gì.

#Testing #Pest
TXT,
        'image_keys' => ['terminal'],
        'comments' => [],
        'reactions' => [
            ['author' => 'huy', 'type' => 'insightful'],
            ['author' => 'bao', 'type' => 'like'],
            ['author' => 'tuan', 'type' => 'support'],
        ],
    ],
    [
        'author' => 'linh',
        'days_ago' => 12,
        'body' => <<<'TXT'
Claude khá chịu khó khi review diff ngắn. Mình không dán cả repo.

Cách làm: `git diff main` cho đúng file, dán kèm mô tả “PR này thêm Form Request, không đổi schema”. Nhờ Claude tìm: nhánh thiếu test, N+1, policy sót.

Nếu nhờ nó “viết lại hết”, mình mất khả năng giải thích lúc mentor hỏi. Review thì được; author thì vẫn phải là mình.

#Claude #Testing
TXT,
        'image_keys' => ['java-screen'],
        'comments' => [
            [
                'author' => 'huy',
                'hours_after' => 5,
                'body' => 'Giới hạn context là đúng. Diff + ý định PR còn hơn dump app/.',
            ],
        ],
        'reactions' => [
            ['author' => 'huy', 'type' => 'insightful'],
            ['author' => 'testuser', 'type' => 'like'],
        ],
    ],
    [
        'author' => 'admin',
        'days_ago' => 11,
        'body' => <<<'TXT'
Ghi chú cho thành viên mới PLT Học Bá:

Cộng đồng này để chia sẻ cách học, không phải kho bài giải. Một bài post tốt thường có: mình đang học gì, đã thử gì, chỗ nào kẹt, và câu hỏi cụ thể.

Được phép bàn Gemini, ChatGPT, Claude — miễn là bạn nói rõ mình dùng chúng như công cụ, không nộp nguyên văn output.

Nếu bài chưa được duyệt, đó là hàng đợi kiểm duyệt, không phải bài bị mất.

#Laravel
TXT,
        'image_keys' => ['workshop'],
        'comments' => [
            [
                'author' => 'testuser',
                'hours_after' => 3,
                'body' => 'Cảm ơn chị Lan. Mình sẽ sửa các bài sau cho có “đã thử gì”.',
            ],
        ],
        'reactions' => [
            ['author' => 'mai', 'type' => 'support'],
            ['author' => 'tuan', 'type' => 'like'],
            ['author' => 'bao', 'type' => 'like'],
            ['author' => 'linh', 'type' => 'love'],
        ],
    ],
    [
        'author' => 'tuan',
        'days_ago' => 10,
        'body' => <<<'TXT'
Mình từng nhét `validate([...])` trong controller vì “cho nhanh”. Mentor bắt chuyển sang Form Request.

Lợi ngay: message lỗi theo field, authorize() tách khỏi store(), và test gọi HTTP vẫn ra 422 đúng key.

Nếu ChatGPT sinh một controller 80 dòng validate, hãy coi đó là dấu hiệu cần tách, không phải dấu hiệu xong việc.

#Laravel #Pest
TXT,
        'image_keys' => ['desk-study'],
        'comments' => [],
        'reactions' => [
            ['author' => 'huy', 'type' => 'celebrate'],
            ['author' => 'testuser', 'type' => 'like'],
        ],
    ],
    [
        'author' => 'bao',
        'days_ago' => 9,
        'body' => <<<'TXT'
Bài post có ảnh mà UI cứ “Processing…”: không phải upload hỏng.

`ProcessPostMediaJob` chạy trên queue. Nếu đổi `APP_NAME`, prefix Redis/Horizon có thể lệch, worker không pop đúng key. Local: `QUEUE_CONNECTION=database` hoặc Horizon đúng prefix, rồi `php artisan queue:work`.

Mình mất nửa buổi vì tưởng GD thiếu. Log job failed mới ra chuyện prefix.

#Laravel #Testing
TXT,
        'image_keys' => ['terminal', 'code-editor'],
        'comments' => [
            [
                'author' => 'thanhha',
                'hours_after' => 2,
                'body' => 'Đúng rồi. Test job thì gọi `handle()` sync, đừng giả định Horizon đang chạy trong Pest.',
            ],
        ],
        'reactions' => [
            ['author' => 'thanhha', 'type' => 'insightful'],
            ['author' => 'admin', 'type' => 'like'],
            ['author' => 'huy', 'type' => 'support'],
        ],
    ],
    [
        'author' => 'testuser',
        'days_ago' => 8,
        'body' => <<<'TXT'
Prompt có context thì AI đỡ bịa.

Mình ghi bốn dòng trước khi hỏi @huy hoặc hỏi ChatGPT: stack (Laravel 13, Pest, Inertia), file đang sửa, lỗi/test fail nguyên văn, và mình đã thử gì.

Không cần tiểu thuyết. Thiếu bốn dòng đó, model hay bịa một API không tồn tại trong repo.

#ChatGPT #Prompt
TXT,
        'image_keys' => [],
        'comments' => [
            [
                'author' => 'huy',
                'hours_after' => 1,
                'body' => 'Bốn dòng đó cũng đủ để mentor trả lời nhanh. Tag mình khi đã có test fail nhé.',
            ],
        ],
        'reactions' => [
            ['author' => 'huy', 'type' => 'insightful'],
            ['author' => 'linh', 'type' => 'like'],
            ['author' => 'mai', 'type' => 'support'],
        ],
    ],
    [
        'author' => 'huy',
        'days_ago' => 7,
        'body' => <<<'TXT'
TDD với một policy, ví dụ `PostPolicy::update`:

Red: test thành viên khác gọi update → 403. Green: viết policy. Refactor: gộp authorize trong Form Request nếu trùng.

Đừng để AI viết policy và test cùng lúc rồi “cả hai đều xanh” vì test assert lung tung. Mình viết test trước, chạy thấy fail thật, rồi mới mở file policy.

#Pest #Testing #Laravel
TXT,
        'image_keys' => ['pair-programming'],
        'comments' => [],
        'reactions' => [
            ['author' => 'tuan', 'type' => 'insightful'],
            ['author' => 'thanhha', 'type' => 'like'],
            ['author' => 'testuser', 'type' => 'celebrate'],
        ],
    ],
    [
        'author' => 'mai',
        'days_ago' => 7,
        'body' => <<<'TXT'
Inertia đã gửi `auth.user` và props trang. Đừng `useEffect` fetch lại cùng dữ liệu.

Mình từng copy một hook “load profile” từ ChatGPT, trong khi trang profile đã có `profile` trong Inertia. Thêm một round-trip, thêm trạng thái loading giả.

Hỏi Gemini/Claude: “props này đã có gì?” trước khi hỏi “viết hook fetch”.

#Gemini #Laravel
TXT,
        'image_keys' => ['online-learning'],
        'comments' => [
            [
                'author' => 'bao',
                'hours_after' => 8,
                'body' => 'Mình cũng dính. Giờ mình in `console.log` props một lần rồi mới nghĩ tới fetch.',
            ],
        ],
        'reactions' => [
            ['author' => 'bao', 'type' => 'haha'],
            ['author' => 'testuser', 'type' => 'like'],
        ],
    ],
    [
        'author' => 'thanhha',
        'days_ago' => 6,
        'body' => <<<'TXT'
`Http::fake()` và `Storage::fake()` là bạn của test media.

Nếu seeder hoặc job tải ảnh, Pest phải fake HTTP — CI không được phụ thuộc Unsplash. Job xử lý ảnh: fake disk + file JPEG nhỏ, gọi `handle()`, assert `status = ready`.

Test không chứng minh được mạng thật. Test chứng minh: khi binary hợp lệ, job đổi pending → ready.

#Testing #Pest
TXT,
        'image_keys' => [],
        'comments' => [],
        'reactions' => [
            ['author' => 'bao', 'type' => 'insightful'],
            ['author' => 'huy', 'type' => 'like'],
        ],
    ],
    [
        'author' => 'linh',
        'days_ago' => 5,
        'body' => <<<'TXT'
Gemini, ChatGPT, Claude — mình không “chọn một thần tượng”. Mình chọn việc.

Ôn tập / đề cương: Gemini. Giải thích lỗi test Laravel: ChatGPT khi cần ví dụ nhanh. Review diff và giọng văn cẩn thận: Claude.

Cả ba đều bịa API. Việc của mình: chạy lại lệnh, mở file thật, không merge vì “model nói vậy”.

#Gemini #ChatGPT #Claude #Prompt
TXT,
        'image_keys' => ['ai-abstract'],
        'comments' => [
            [
                'author' => 'mai',
                'hours_after' => 4,
                'body' => 'Bảng việc này hay. Mình hay dùng nhầm Claude để hỏi “viết hộ controller”.',
            ],
        ],
        'reactions' => [
            ['author' => 'mai', 'type' => 'insightful'],
            ['author' => 'testuser', 'type' => 'like'],
            ['author' => 'admin', 'type' => 'support'],
        ],
    ],
    [
        'author' => 'tuan',
        'days_ago' => 5,
        'body' => <<<'TXT'
Nút Edit hiện trên UI không có nghĩa là request sẽ pass.

Inertia có thể gửi `can.update`. Server vẫn `authorize` trong policy. Mình từng tin nút, gọi API tay, nhận 403 — vì policy check chủ bài, không check “đang đăng nhập”.

Khi AI sinh một nút, hỏi thêm: policy nào chặn? Test 403 nào cover?

#Laravel #Testing
TXT,
        'image_keys' => [],
        'comments' => [],
        'reactions' => [
            ['author' => 'huy', 'type' => 'insightful'],
            ['author' => 'thanhha', 'type' => 'like'],
        ],
    ],
    [
        'author' => 'bao',
        'days_ago' => 4,
        'body' => <<<'TXT'
Feed chậm: thường là N+1, không phải “React nặng”.

`engagementQuery` đã `with` user, media, `withCount` likes/comments. Nếu mình thêm quan hệ trong presenter mà quên eager load, mỗi card một query.

Debug: `DB::listen` hoặc Telescope/Pulse local. Đừng nhờ ChatGPT “tối ưu useMemo” trước khi xem query log.

#Laravel #Testing
TXT,
        'image_keys' => ['code-editor'],
        'comments' => [
            [
                'author' => 'huy',
                'hours_after' => 3,
                'body' => 'Đúng. Presenter chỉ format; query phải đủ `with` trước khi map.',
            ],
        ],
        'reactions' => [
            ['author' => 'huy', 'type' => 'insightful'],
            ['author' => 'mai', 'type' => 'like'],
        ],
    ],
    [
        'author' => 'admin',
        'days_ago' => 4,
        'body' => <<<'TXT'
Cách hỏi mentor cho đỡ vòng lặp:

- Mục tiêu: “Mình muốn thành viên khác không sửa bài của mình.”
- Đã thử: policy `update`, test A (chủ bài) pass, chưa có test B (người lạ).
- Kẹt: người lạ vẫn 200.

Câu này mentor trả lời được trong vài phút. “Em không biết làm authorization” thì thành buổi giảng lại từ đầu — phí cả hai phía.

#Laravel
TXT,
        'image_keys' => ['study-group'],
        'comments' => [
            [
                'author' => 'tuan',
                'hours_after' => 6,
                'body' => 'Mình hay hỏi kiểu “không biết”. Lần sau mình viết đủ ba ý này.',
            ],
        ],
        'reactions' => [
            ['author' => 'tuan', 'type' => 'support'],
            ['author' => 'testuser', 'type' => 'like'],
            ['author' => 'bao', 'type' => 'like'],
        ],
    ],
    [
        'author' => 'testuser',
        'days_ago' => 3,
        'body' => <<<'TXT'
Hashtag trên PLT Học Bá chỉ nhận ASCII: `#ChatGPT` được, `#học_tập` thì regex bỏ qua.

Explore/tag vì vậy cần slug Latin. Khi viết bài, mình để hashtag kỹ thuật ở cuối: `#Pest` `#Gemini`, còn tiếng Việt để trong câu.

Không phải “thiếu tiếng Việt” — là giới hạn extractor hiện tại. Biết rule thì khỏi bực khi tag không lên trending.

#Pest #Gemini
TXT,
        'image_keys' => [],
        'comments' => [],
        'reactions' => [
            ['author' => 'linh', 'type' => 'insightful'],
            ['author' => 'mai', 'type' => 'like'],
        ],
    ],
    [
        'author' => 'huy',
        'days_ago' => 3,
        'body' => <<<'TXT'
Assertion đọc được: `assertForbidden()` / `assertRedirect(route('feed'))` hơn `assertTrue($response->status() === 403)`.

Pest cho `expect($post->isApproved())->toBeTrue()`. Tên test tiếng Anh mô tả hành vi: `member posts are pending until an admin approves`.

Khi Claude sinh test toàn `assertStatus(200)`, hãy đổi thành assertion nói lên ý nghiệp vụ.

#Pest #Testing
TXT,
        'image_keys' => ['notebook'],
        'comments' => [],
        'reactions' => [
            ['author' => 'thanhha', 'type' => 'celebrate'],
            ['author' => 'tuan', 'type' => 'like'],
            ['author' => 'testuser', 'type' => 'insightful'],
        ],
    ],
    [
        'author' => 'mai',
        'days_ago' => 2,
        'body' => <<<'TXT'
Ghi chú React + Tailwind tuần này: component card bài viết nên nhận data đã format (avatar URL, body, media ready), không tự ghép path storage.

Mình suýt hardcode `/storage/` vì một snippet ChatGPT. App dùng `MediaDisk::url()`. Khi đổi disk, hardcode gãy.

Học UI vẫn cần biết dữ liệu đến từ presenter nào.

#Laravel #ChatGPT
TXT,
        'image_keys' => ['desk-study'],
        'comments' => [
            [
                'author' => 'bao',
                'hours_after' => 5,
                'body' => 'Mình cũng dính `/storage/`. Giờ mình chỉ render `media[].url` từ props.',
            ],
        ],
        'reactions' => [
            ['author' => 'bao', 'type' => 'like'],
            ['author' => 'linh', 'type' => 'support'],
        ],
    ],
    [
        'author' => 'thanhha',
        'days_ago' => 2,
        'body' => <<<'TXT'
Test kiểm duyệt: bài pending không được vào feed người khác; tác giả vẫn thấy bài mình.

Đừng chỉ test admin approve. Thiếu nhánh “người lạ GET feed không thấy pending” là lỗ hổng sản phẩm, không phải lỗ hổng framework.

Pest: tạo member A (pending), member B xem feed / explore. Assert không chứa body bài A.

#Testing #Pest #Laravel
TXT,
        'image_keys' => ['classroom'],
        'comments' => [],
        'reactions' => [
            ['author' => 'admin', 'type' => 'insightful'],
            ['author' => 'huy', 'type' => 'like'],
            ['author' => 'tuan', 'type' => 'support'],
        ],
    ],
    [
        'author' => 'linh',
        'days_ago' => 1,
        'body' => <<<'TXT'
Hallucination tuần này: ChatGPT bảo `artisan horizon:work`. Lệnh không tồn tại. Đúng là `horizon` daemon / `queue:work`.

Mình giữ thói quen: mọi lệnh AI đưa đều chạy lại, hoặc `php artisan list | grep`. Không chụp screenshot “AI bảo vậy” gửi mentor.

Gemini và Claude cũng bịa flag. Kiểm chứng rẻ hơn debug một giờ.

#ChatGPT #Claude #Gemini
TXT,
        'image_keys' => ['ai-abstract', 'terminal'],
        'comments' => [
            [
                'author' => 'bao',
                'hours_after' => 2,
                'body' => 'Trùng khớp. Mình đã gõ sai vì tin prompt. Giờ mình copy vào terminal trước khi tin.',
            ],
        ],
        'reactions' => [
            ['author' => 'bao', 'type' => 'haha'],
            ['author' => 'testuser', 'type' => 'like'],
            ['author' => 'thanhha', 'type' => 'insightful'],
        ],
    ],
    [
        'author' => 'bao',
        'days_ago' => 1,
        'body' => <<<'TXT'
Hôm nay mình đọc `ProcessPostMediaJob`: GD resize cạnh dài 1600, JPEG 82, đổi extension `.jpg`.

Hiểu job xong thì hết sợ status `failed`. File không phải ảnh, thiếu GD, hoặc disk không có path — cả ba đều ra failed, không phải “Horizon hỏng” mỗi lần.

Ghi vào sổ thực tập: đọc job trước khi đổ lỗi hạ tầng.

#Laravel #Testing
TXT,
        'image_keys' => ['wikimedia-lab'],
        'comments' => [],
        'reactions' => [
            ['author' => 'thanhha', 'type' => 'celebrate'],
            ['author' => 'huy', 'type' => 'like'],
        ],
    ],
];
