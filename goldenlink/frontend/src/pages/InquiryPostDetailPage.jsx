import React, { useState, useEffect } from "react";
import { 
  HiOutlineUserCircle, 
  HiOutlineClock, 
  HiOutlineChevronLeft, 
  HiCheckCircle,
  HiOutlineChatBubbleLeftRight,
  HiPencilSquare,
  HiTrash
} from "react-icons/hi2";
import "./InquiryPostDetailPage.css";

export default function InquiryPostDetailPage({ post, onBack, user, onAdminReply, onEdit, onDelete }) {
  const [replyInput, setReplyInput] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const API_BASE_URL = "http://localhost:8080";

  useEffect(() => {
    if (!post?.id) return;

    const loadComments = async () => {
      try {
        setLoadingComments(true);
        const response = await fetch(`${API_BASE_URL}/comments/board/${post.id}`, {
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          setComments(Array.isArray(data) ? data : []);
        } else {
          console.error("댓글 로드 실패");
          setComments([]);
        }
      } catch (error) {
        console.error("댓글 로드 오류:", error);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };

    loadComments();
  }, [post?.id]);

  if (!user) {
    return (
      <div className="gl-post-detail-container">
        <button className="gl-back-btn" onClick={onBack}>
          <HiOutlineChevronLeft /> 목록으로 돌아가기
        </button>
        <div className="gl-login-required-box">
          🔒 비밀글 및 문의 상세 내용은 로그인 후 확인 가능합니다.
        </div>
      </div>
    );
  }

  if (!post) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatCommentDate = (dateStr) => {
    if (!dateStr) return "";
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}일 전`;
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  };

  const handleReplySubmit = async () => {
    if (!replyInput.trim()) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/comments?boardId=${post.id}&commentDto=${encodeURIComponent(replyInput)}`,
        {
          method: "POST",
          credentials: "include"
        }
      );

      if (response.ok) {
        const loadResponse = await fetch(`${API_BASE_URL}/comments/board/${post.id}`, {
          credentials: "include"
        });
        
        if (loadResponse.ok) {
          const data = await loadResponse.json();
          setComments(Array.isArray(data) ? data : []);
        }
        
        setReplyInput("");
        
        if (onAdminReply) {
          onAdminReply(post.id, replyInput);
        }
      } else {
        const errorText = await response.text();
        alert(errorText || "답변 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("답변 등록 오류:", error);
      alert("서버와 연결할 수 없습니다.");
    }
  };

  const hasComments = comments.length > 0;
  const currentStatus = hasComments ? "완료" : "대기";

  // ✅ 수정/삭제 권한 확인 (작성자 본인 또는 root)
  const isAuthor = user && post.userId && user.userid === post.userId;
  const isRoot = user && user.userid === 'root';
  const canEdit = isAuthor || isRoot;

  // 디버깅용 콘솔 로그
  console.log('QNA 게시판 권한 체크:', {
    loginUser: user?.userid,
    postUserId: post.userId,
    postAuthor: post.author,
    isAuthor,
    isRoot,
    canEdit
  });

  return (
    <div className="gl-post-detail-container">
      <button className="gl-back-btn" onClick={onBack}>
        <HiOutlineChevronLeft /> 목록으로 돌아가기
      </button>

      <article className="gl-post-card">
        <header className="gl-inquiry-header">
          <div className="gl-inquiry-header-top">
            <div>
              <span className={`gl-status-badge ${currentStatus === "완료" ? "is-complete" : "is-waiting"}`}>
                {currentStatus === "완료" ? "답변완료" : "답변대기"}
              </span>
              <h1 className="gl-post-title">{post.title}</h1>
            </div>
            {/* ✅ 수정/삭제 버튼 (작성자 본인 또는 root) */}
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
          <div className="gl-post-meta">
            <span className="gl-meta-item"><HiOutlineUserCircle /> {post.author}</span>
            <span className="gl-meta-item"><HiOutlineClock /> {formatDate(post.createdAt)}</span>
          </div>
        </header>

        <main className="gl-post-content">
          <div className="gl-content-label">문의 내용</div>
          <div className="gl-content-text">{post.content}</div>
        </main>

        <footer className="gl-admin-section">
          <div className="gl-comment-header">
            <HiOutlineChatBubbleLeftRight />
            <h3>관리자 답변 <span>{comments.length}</span></h3>
          </div>

          {user?.userid === 'root' && (
            <div className="gl-comment-input-wrap">
              <textarea 
                placeholder="문의에 대한 답변을 입력해주세요."
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
              />
              <button onClick={handleReplySubmit} className="gl-comment-submit-btn">
                답변 등록
              </button>
            </div>
          )}

          <div className="gl-comment-list">
            {loadingComments ? (
              <p className="gl-no-comments">답변을 불러오는 중...</p>
            ) : comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="gl-comment-item gl-admin-reply">
                  <div className="gl-comment-info">
                    <span className="gl-comment-author">
                      <HiCheckCircle className="gl-admin-icon" /> {comment.author}
                    </span>
                    <span className="gl-comment-date">{formatCommentDate(comment.createdAt)}</span>
                  </div>
                  <p className="gl-comment-text">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="gl-no-comments">
                {user?.userid === 'root'
                  ? "첫 번째 답변을 남겨보세요!" 
                  : "관리자의 답변을 기다리고 있습니다."}
              </p>
            )}
          </div>
        </footer>
      </article>
    </div>
  );
}