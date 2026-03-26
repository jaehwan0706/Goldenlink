import React, { useState, useEffect } from "react";
import { HiXMark } from "react-icons/hi2"; 
import "./BoardWritePostPage.css";

export default function BoardWritePostPage({ onBack, user, onCreatePost, editingPost }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ✅ 수정 모드인 경우 기존 값으로 초기화
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || "");
      setContent(editingPost.content || "");
    }
  }, [editingPost]);

  const handleRegister = () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    onCreatePost({ title, content });
  };

  return (
    <div className="gl-write-container">
      <div className="gl-write-card">
        <header className="gl-write-header">
          <h2>{editingPost ? "글 수정" : "글쓰기"}</h2>
          <button className="gl-close-btn" onClick={onBack}>
            <HiXMark />
          </button>
        </header>

        <main className="gl-write-body">
          <div className="gl-input-group">
            <label>작성자</label>
            <input 
              type="text" 
              value={user?.name || ""} 
              readOnly 
              className="gl-input-read" 
            />
          </div>

          <div className="gl-input-group">
            <label>제목</label>
            <input 
              type="text" 
              placeholder="제목을 입력하세요" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="gl-input-group">
            <label>내용</label>
            <textarea 
              placeholder="내용을 입력하세요" 
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>
        </main>

        <footer className="gl-write-footer">
          <button className="gl-btn-cancel" onClick={onBack}>취소</button>
          <button className="gl-btn-submit" onClick={handleRegister}>
            {editingPost ? "수정하기" : "등록하기"}
          </button>
        </footer>
      </div>
    </div>
  );
}