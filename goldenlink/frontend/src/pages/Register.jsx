import React, { useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import "./Login.css";

export default function Register({ onBack, onGoLogin }) {
  const [errors, setErrors] = useState({});
  const [regForm, setRegForm] = useState({
    name: "",
    userid: "",
    userpw: "",
    userpwConfirm: "",
    phone: "",
    email: "",
    address: "",
  });
  const [idCheckMsg, setIdCheckMsg] = useState({ text: "", isSuccess: false });

  const API_BASE_URL = "http://localhost:8080/api/goldenlink";

  // ✅ 아이디 중복 확인
  const checkDuplicate = async () => {
    if (!regForm.userid) {
      setErrors({ ...errors, regUserid: "필수 정보입니다." });
      return;
    }

    if (regForm.userid === "root") {
      setIdCheckMsg({ text: "이미 사용 중인 아이디입니다.", isSuccess: false });
      return;
    }

    setIdCheckMsg({ text: "사용 가능한 아이디입니다.", isSuccess: true });
  };

  // ✅ 회원가입 처리
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!idCheckMsg.isSuccess) {
      setErrors({ ...errors, regUserid: "아이디 중복 확인이 필요합니다." });
      return;
    }
    if (regForm.userpw !== regForm.userpwConfirm) {
      setErrors({ ...errors, regUserpwConfirm: "비밀번호가 일치하지 않습니다." });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid: regForm.userid,
          userpw: regForm.userpw,
          name: regForm.name,
          phone: regForm.phone,
          email: regForm.email,
          address: regForm.address || null,
        }),
      });

      if (response.ok) {
        await response.text();
        alert("회원가입이 완료되었습니다!");
        onGoLogin(); // ✅ 로그인 화면으로 이동
      } else {
        const errorMessage = await response.text();
        alert(errorMessage || "회원가입 실패");
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      alert("서버와 연결할 수 없습니다.");
    }
  };

  return (
    <div className="lg-page">
      <div className="lg-card lg-card-wide">
        <div className="lg-card-head">
          <h2 className="lg-card-title">회원가입</h2>
          <button className="lg-close-btn" onClick={onBack}>
            <IoCloseOutline />
          </button>
        </div>

        <div className="lg-body lg-scrollable">
          <form className="lg-form" onSubmit={handleRegister}>
            <div className="lg-field">
              <label className="lg-label">
                이름 <span className="lg-req">*</span>
              </label>
              <input
                className="lg-input"
                placeholder="이름을 입력하세요"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
              />
            </div>

            <div className="lg-field">
              <label className="lg-label">
                아이디 <span className="lg-req">*</span>
              </label>
              <div className="lg-input-row">
                <input
                  className="lg-input"
                  placeholder="아이디 입력"
                  value={regForm.userid}
                  onChange={(e) => {
                    setRegForm({ ...regForm, userid: e.target.value });
                    setIdCheckMsg({ text: "", isSuccess: false });
                  }}
                />
                <button type="button" className="lg-btn-outline-sm" onClick={checkDuplicate}>
                  중복확인
                </button>
              </div>
              {idCheckMsg.text && (
                <p className={idCheckMsg.isSuccess ? "lg-success-msg" : "lg-error-msg"}>{idCheckMsg.text}</p>
              )}
            </div>

            <div className="lg-field">
              <label className="lg-label">
                비밀번호 <span className="lg-req">*</span>
              </label>
              <input
                className="lg-input"
                type="password"
                placeholder="비밀번호 입력"
                value={regForm.userpw}
                onChange={(e) => setRegForm({ ...regForm, userpw: e.target.value })}
              />
            </div>

            <div className="lg-field">
              <label className="lg-label">
                비밀번호 확인 <span className="lg-req">*</span>
              </label>
              <input
                className={`lg-input ${
                  regForm.userpwConfirm && regForm.userpw !== regForm.userpwConfirm ? "lg-input-error" : ""
                }`}
                type="password"
                placeholder="비밀번호 재입력"
                value={regForm.userpwConfirm}
                onChange={(e) => setRegForm({ ...regForm, userpwConfirm: e.target.value })}
              />
              {regForm.userpwConfirm && regForm.userpw !== regForm.userpwConfirm && (
                <p className="lg-error-msg">비밀번호가 일치하지 않습니다.</p>
              )}
              {regForm.userpwConfirm && regForm.userpw === regForm.userpwConfirm && (
                <p className="lg-success-msg">비밀번호가 일치합니다.</p>
              )}
            </div>

            <div className="lg-field">
              <label className="lg-label">
                휴대폰 번호 <span className="lg-req">*</span>
              </label>
              <input
                className="lg-input"
                placeholder="010-1234-5678"
                value={regForm.phone}
                onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
              />
            </div>

            <div className="lg-field">
              <label className="lg-label">
                이메일 <span className="lg-req">*</span>
              </label>
              <input
                className="lg-input"
                type="email"
                placeholder="example@email.com"
                value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
              />
            </div>

            <div className="lg-field">
              <label className="lg-label">주소 (선택)</label>
              <input
                className="lg-input"
                placeholder="주소 입력"
                value={regForm.address}
                onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
              />
            </div>

            <button type="submit" className="lg-btn-primary lg-mt-20">
              가입하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}