import React, { useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import "./Login.css";

export default function FindPassword({ onBack, onGoLogin }) {
  const [findIdForPw, setFindIdForPw] = useState("");
  const [findPhone, setFindPhone] = useState("");
  const [findResultMsg, setFindResultMsg] = useState({ text: "", isSuccess: false });

  const API_BASE_URL = "http://localhost:8080/api/goldenlink";

  // ✅ 비밀번호 찾기 처리
  const handleFindPw = async (e) => {
    e.preventDefault();

    const userid = findIdForPw;
    const phone = findPhone;

    if (!userid || !phone) {
      setFindResultMsg({ text: "모든 필드를 입력해주세요.", isSuccess: false });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/findPw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid, phone }),
      });

      if (response.ok) {
        const message = await response.text();
        setFindResultMsg({ text: message, isSuccess: true });
      } else {
        const errorMessage = await response.text();
        setFindResultMsg({ text: errorMessage, isSuccess: false });
      }
    } catch (error) {
      console.error("비밀번호 찾기 오류:", error);
      setFindResultMsg({ text: "서버와 연결할 수 없습니다.", isSuccess: false });
    }
  };

  return (
    <div className="lg-page">
      <div className="lg-card">
        <div className="lg-card-head">
          <h2 className="lg-card-title">비밀번호 찾기</h2>
          <button className="lg-close-btn" onClick={onBack}>
            <IoCloseOutline />
          </button>
        </div>

        <div className="lg-body">
          <form className="lg-form" onSubmit={handleFindPw}>
            <div className="lg-field">
              <label className="lg-label">
                아이디 <span className="lg-req">*</span>
              </label>
              <input
                className="lg-input"
                placeholder="아이디를 입력하세요"
                value={findIdForPw}
                onChange={(e) => setFindIdForPw(e.target.value)}
              />
            </div>
            <div className="lg-field">
              <label className="lg-label">
                휴대폰 번호 <span className="lg-req">*</span>
              </label>
              <input
                className="lg-input"
                placeholder="010-1234-5678"
                value={findPhone}
                onChange={(e) => setFindPhone(e.target.value)}
              />
            </div>
            {findResultMsg.text && (
              <p className={findResultMsg.isSuccess ? "lg-success-msg" : "lg-error-msg"}>{findResultMsg.text}</p>
            )}
            
            {/* ✅ 버튼 2개를 나란히 배치 */}
            <div className="lg-btn-group">
              <button type="submit" className="lg-btn-primary">
                비밀번호 찾기
              </button>
              <button type="button" className="lg-btn-secondary" onClick={onGoLogin}>
                로그인으로
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}