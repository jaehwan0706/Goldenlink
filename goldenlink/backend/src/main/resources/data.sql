-- 기본 유저 (없을 때만)
INSERT INTO EntityUser (userid, userpw, name, phone, email, address, role)
SELECT 'root', '1234', '관리자', '010-0000-0000', 'admin@goldenlink.com', '서울특별시', 'ADMIN'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM EntityUser WHERE userid = 'root');

INSERT INTO EntityUser (userid, userpw, name, phone, email, address, role)
SELECT 'user1', '1234', '홍길동', '010-1111-1111', 'user@test.com', '부산광역시', 'USER'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM EntityUser WHERE userid = 'user1');

-- 게시글: root(id=1), user1(id=2) 기준 (id가 달라질 수 있으면 아래처럼 subquery로 id를 찾아 넣습니다)
INSERT INTO boards (category, content, createdAt, title, userid)
SELECT 'NOTICE', '점검 시간이 변경되었습니다. 02시 ~ 04시', NOW(), '[공지/수정] 전체 서비스 점검 안내',
       (SELECT id FROM EntityUser WHERE userid='root' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM boards WHERE category='NOTICE' AND title='[공지/수정] 전체 서비스 점검 안내'
);

INSERT INTO boards (category, content, createdAt, title, userid)
SELECT 'QNA', '일반유저의 글입니다.', NOW(), '문의합니다',
       (SELECT id FROM EntityUser WHERE userid='user1' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM boards WHERE category='QNA' AND title='문의합니다'
);

INSERT INTO boards (category, content, createdAt, title, userid)
SELECT 'INFO', '이제 세션이 유지된 상태로 수정합니다!', NOW(), '정보공유 수정 완료',
       (SELECT id FROM EntityUser WHERE userid='user1' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM boards WHERE category='INFO' AND title='정보공유 수정 완료'
);

-- 댓글(관리자 답변) - 해당 게시글이 있을 때만, 중복 방지
INSERT INTO comments (boardid, createdAt, userid, content)
SELECT (SELECT id FROM boards WHERE category='QNA' AND title='문의합니다' LIMIT 1),
       NOW(),
       (SELECT id FROM EntityUser WHERE userid='root' LIMIT 1),
       '관리자 답변입니다.'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM comments WHERE content='관리자 답변입니다.'
);
