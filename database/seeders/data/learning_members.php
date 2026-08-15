<?php

declare(strict_types=1);

/**
 * Local demo members for PLT Học Bá. Password comes from UserFactory (`password`).
 *
 * @return list<array{
 *     username: string,
 *     email: string,
 *     name: string,
 *     is_admin: bool,
 *     bio: string,
 *     education: string,
 *     birthday: string
 * }>
 */
return [
    [
        'username' => 'admin',
        'email' => 'admin@example.com',
        'name' => 'Nguyễn Thị Lan',
        'is_admin' => true,
        'bio' => 'Điều phối cộng đồng PLT Học Bá. Ưu tiên câu hỏi kèm những gì bạn đã thử.',
        'education' => 'Đại học Bách khoa Hà Nội',
        'birthday' => '1994-04-18',
    ],
    [
        'username' => 'testuser',
        'email' => 'test@example.com',
        'name' => 'Trần Minh Khoa',
        'is_admin' => false,
        'bio' => 'Intern backend. Đang học Laravel, Pest và cách hỏi AI cho có kiểm chứng.',
        'education' => 'Đại học FPT',
        'birthday' => '2004-03-12',
    ],
    [
        'username' => 'huy',
        'email' => 'huy@example.com',
        'name' => 'Phạm Đức Huy',
        'is_admin' => false,
        'bio' => 'Mentor kỹ thuật. Thích TDD, policy rõ, và code review ngắn.',
        'education' => 'Đại học Khoa học Tự nhiên, ĐHQG-HCM',
        'birthday' => '1996-11-02',
    ],
    [
        'username' => 'mai',
        'email' => 'mai@example.com',
        'name' => 'Lê Thị Mai',
        'is_admin' => false,
        'bio' => 'Intern frontend. Ghi chú Inertia + React mỗi khi học một pattern mới.',
        'education' => 'Đại học Công nghệ, ĐHQGHN',
        'birthday' => '2003-08-21',
    ],
    [
        'username' => 'tuan',
        'email' => 'tuan@example.com',
        'name' => 'Hoàng Anh Tuấn',
        'is_admin' => false,
        'bio' => 'Học viên khóa web. Đang làm quen Form Request, policy và Pest.',
        'education' => 'Đại học Sư phạm Kỹ thuật TP.HCM',
        'birthday' => '2005-01-09',
    ],
    [
        'username' => 'thanhha',
        'email' => 'thanhha@example.com',
        'name' => 'Ngô Thanh Hà',
        'is_admin' => false,
        'bio' => 'Mentor QA. Chuyên test giả lập HTTP/Storage và checklist trước khi mở PR.',
        'education' => 'Học viện Kỹ thuật Mật mã',
        'birthday' => '1995-06-30',
    ],
    [
        'username' => 'linh',
        'email' => 'linh@example.com',
        'name' => 'Đặng Phương Linh',
        'is_admin' => false,
        'bio' => 'Học viên AI ứng dụng. So sánh Gemini, ChatGPT và Claude khi học code.',
        'education' => 'Đại học Kinh tế Quốc dân',
        'birthday' => '2004-12-05',
    ],
    [
        'username' => 'bao',
        'email' => 'bao@example.com',
        'name' => 'Bùi Quốc Bảo',
        'is_admin' => false,
        'bio' => 'Intern full-stack. Hay hỏi khi kẹt queue, N+1 và Horizon.',
        'education' => 'Cao đẳng FPT Polytechnic',
        'birthday' => '2003-02-17',
    ],
];
