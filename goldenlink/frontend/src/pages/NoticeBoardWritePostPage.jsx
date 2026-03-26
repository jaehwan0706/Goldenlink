import React, { useState, useEffect } from "react";
import { HiOutlineChevronLeft } from "react-icons/hi2";
import { BsPinAngleFill } from "react-icons/bs";
import "./NoticeBoardWritePostPage.css";

export default function NoticeBoardWritePostPage({ onBack, onCreateNotice, editingPost }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  // ✅ 수정 모드인 경우 기존 값으로 초기화
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || "");
      setContent(editingPost.content || "");
      // 제목에 [공지]가 있으면 체크
      setIsPinned(editingPost.title?.includes("[공지]") || false);
    }
  }, [editingPost]);

  // ✅ 체크박스 상태 변경 핸들러
  const handlePinnedChange = (checked) => {
    setIsPinned(checked);
    
    if (checked) {
      // 체크 시: 제목 앞에 [공지] 추가 (중복 방지)
      if (!title.startsWith("[공지] ")) {
        setTitle("[공지] " + title);
      }
    } else {
      // 해제 시: [공지] 제거
      setTitle(title.replace("[공지] ", ""));
    }
  };

  // ✅ 제목 입력 핸들러
  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    
    // 제목에 [공지]가 있으면 체크박스 자동 체크
    if (newTitle.includes("[공지]")) {
      setIsPinned(true);
    } else {
      setIsPinned(false);
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    
    onCreateNotice({ title, content });
  };

  return (
    <div className="gl-notice-write-container">
      <header className="gl-notice-write-header">
        <h1>{editingPost ? "공지사항 수정" : "공지사항 작성"}</h1>
      </header>

      <div className="gl-notice-write-card">
        <div className="gl-write-field">
          <label>작성자</label>
          <input type="text" value="관리자 (Admin)" readOnly className="gl-read-only-input" />
        </div>

        <div className="gl-write-field">
          <label>제목</label>
          <input 
            type="text" 
            placeholder="제목을 입력하세요" 
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
        </div>

        <div className="gl-write-field">
          <label>내용</label>
          <textarea 
            placeholder="내용을 입력하세요" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* ✅ 상단 고정 옵션 */}
        <div className="gl-pin-option">
          <label className="gl-checkbox-label">
            <input 
              type="checkbox" 
              checked={isPinned}
              onChange={(e) => handlePinnedChange(e.target.checked)}
            />
            <span className="gl-custom-checkbox"></span>
            <BsPinAngleFill className="gl-pin-icon" /> 상단 고정 (제목에 [공지] 태그 추가)
          </label>
        </div>

        <footer className="gl-write-footer">
          <button className="gl-btn-cancel" onClick={onBack}>취소</button>
          <button className="gl-btn-submit" onClick={handleSubmit}>
            {editingPost ? "수정하기" : "작성하기"}
          </button>
        </footer>
      </div>
    </div>
  );
}