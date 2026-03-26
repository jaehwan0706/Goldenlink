import React, { useState, useEffect } from "react";
import "./InquiryBoardWritePostPage.css";

export default function InquiryBoardWritePostPage({ onBack, user, onCreateInquiry, editingPost }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ✅ 수정 모드인 경우 기존 값으로 초기화
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || "");
      setContent(editingPost.content || "");
    }
  }, [editingPost]);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    onCreateInquiry({ title, content });
  };

  return (
    <div className="gl-inquiry-write-container">
      <header className="gl-inquiry-write-header">
        <h1>{editingPost ? "문의 수정" : "문의하기"}</h1>
      </header>

      <div className="gl-inquiry-write-card">
        <div className="gl-write-field">
          <label>작성자</label>
          <input 
            type="text" 
            value={user?.name || ""} 
            readOnly 
            className="gl-read-only-input" 
          />
        </div>

        <div className="gl-write-field">
          <label>제목</label>
          <input 
            type="text" 
            placeholder="제목을 입력하세요" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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

        <footer className="gl-write-footer">
          <button className="gl-btn-cancel" onClick={onBack}>취소</button>
          <button className="gl-btn-submit" onClick={handleSubmit}>
            {editingPost ? "수정하기" : "등록하기"}
          </button>
        </footer>
      </div>
    </div>
  );
}