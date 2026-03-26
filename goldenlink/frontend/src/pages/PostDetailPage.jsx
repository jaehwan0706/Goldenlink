import React, { useState, useEffect } from "react";
import { 
  HiOutlineUserCircle, 
  HiOutlineClock, 
  HiOutlineChevronLeft,
  HiOutlineChatBubbleLeftRight,
  HiPencilSquare,
  HiTrash
} from "react-icons/hi2";
import "./PostDetailPage.css";

export default function PostDetailPage({ post, user, onBack, onRefreshBoard, onEdit, onDelete, onGoLogin }) {
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const API_BASE_URL = "http://localhost:8080";

  // ✅ 댓글 로드
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
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

  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;
    
    // ✅ 로그인 체크
    if (!user) {
      alert("로그인이 필요합니다.");
      if (onGoLogin) {
        onGoLogin();
      }
      return;
    }
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/comments?boardId=${post.id}&commentDto=${encodeURIComponent(commentInput)}`,
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
        
        setCommentInput("");
        
        // ✅ 게시판 목록만 새로고침 (댓글은 이미 작성했으므로)
        if (onRefreshBoard) {
          onRefreshBoard();
        }
      } else {
        const errorText = await response.text();
        alert(errorText || "댓글 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 등록 오류:", error);
      alert("서버와 연결할 수 없습니다.");
    }
  };

  if (!post) return null;

  // ✅ 수정/삭제 권한 확인 (작성자 본인 또는 root)
  const isAuthor = user && post.userId && user.userid === post.userId;
  const isRoot = user && user.userid === 'root';
  const canEdit = isAuthor || isRoot;

  // 디버깅용 콘솔 로그
  console.log('INFO 게시판 권한 체크:', {
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
        <header className="gl-post-header">
          <div className="gl-post-header-top">
            <h1 className="gl-post-title">{post.title}</h1>
            {/* ✅ 수정/삭제 버튼 */}
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
          {post.content}
        </main>

        <section className="gl-comment-section">
          <div className="gl-comment-header">
            <HiOutlineChatBubbleLeftRight />
            <h3>댓글 <span>{comments.length}</span></h3>
          </div>
          
          <div className="gl-comment-input-wrap">
            <textarea 
              placeholder="게시글에 대한 따뜻한 댓글을 남겨주세요." 
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            />
            <button onClick={handleCommentSubmit} className="gl-comment-submit-btn">
              등록
            </button>
          </div>

          <div className="gl-comment-list">
            {loadingComments ? (
              <p className="gl-no-comments">댓글을 불러오는 중...</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="gl-comment-item">
                  <div className="gl-comment-info">
                    <span className="gl-comment-author">{comment.author}</span>
                    <span className="gl-comment-date">{formatCommentDate(comment.createdAt)}</span>
                  </div>
                  <p className="gl-comment-text">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="gl-no-comments">첫 번째 댓글을 남겨보세요!</p>
            )}
          </div>
        </section>
      </article>
    </div>
  );
}