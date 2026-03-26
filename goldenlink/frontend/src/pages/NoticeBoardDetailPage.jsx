import React from "react";
import { 
  HiOutlineUserCircle, 
  HiOutlineClock, 
  HiOutlineChevronLeft,
  HiPencilSquare,
  HiTrash
} from "react-icons/hi2";
import "./NoticeBoardDetailPage.css";

export default function NoticeBoardDetailPage({ post, user, onBack, onEdit, onDelete }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (!post) return null;

  // ✅ 수정/삭제 권한 확인 (root만)
  const isRoot = user && user.userid === 'root';
  const canEdit = isRoot;

  // 디버깅용 콘솔 로그
  console.log('NOTICE 게시판 권한 체크:', {
    loginUser: user?.userid,
    isRoot,
    canEdit
  });

  return (
    <div className="gl-notice-detail-container">
      <button className="gl-back-btn" onClick={onBack}>
        <HiOutlineChevronLeft /> 목록으로
      </button>

      <article className="gl-notice-card">
        <header className="gl-notice-header">
          <div className="gl-notice-header-top">
            <div>
              {post.isPinned && <span className="gl-badge-notice">공지</span>}
              <h1 className="gl-notice-title">{post.title}</h1>
            </div>
            {/* ✅ 수정/삭제 버튼 (root만) */}
            {canEdit && (
              <div className="gl-post-actions">
                <button className="gl-edit-btn" onClick={() => onEdit(post)}>
                  <HiPencilSquare /> 수정
                </button>
                <button className="gl-delete-btn" onClick={() => onDelete(post.id)}>
                  <HiTrash /> 삭제
                </button>
              </div>
            )}
          </div>
          
          <div className="gl-notice-meta">
            <span className="gl-meta-item"><HiOutlineUserCircle /> {post.author}</span>
            <span className="gl-meta-item"><HiOutlineClock /> {formatDate(post.createdAt)}</span>
          </div>
        </header>

        <main className="gl-notice-content">
          <div className="gl-content-body">
            {post.content}
          </div>
        </main>
      </article>
    </div>
  );
}