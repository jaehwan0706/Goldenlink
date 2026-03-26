import React, { useState } from "react";
import { IoCloseOutline, IoEyeOutline } from "react-icons/io5";
import "./Login.css";

export default function Login({ onLogin, onBack, onGoRegister, onGoFindId, onGoFindPassword }) {
  const [errors, setErrors] = useState({});
  const [loginForm, setLoginForm] = useState({ userid: "", userpw: "" });

  const API_BASE_URL = "http://localhost:8080/api/goldenlink";

  // ✅ 로그인 처리
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    const inputUserid = loginForm.userid.trim();
    const inputUserpw = loginForm.userpw;

    if (!inputUserid) {
      setErrors({ loginCommon: "아이디를 입력하세요." });
      return;
    }
    if (!inputUserpw) {
      setErrors({ loginCommon: "비밀번호를 입력하세요." });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userid: inputUserid,
          userpw: inputUserpw,
        }),
      });

      if (response.ok) {
        await response.text();

        onLogin({
          userid: inputUserid,
          name: inputUserid,
          role: inputUserid === "root" ? "admin" : "user",
          isAdmin: inputUserid === "root",
        });
      } else {
        await response.text();
        setErrors({ loginCommon: "아이디 또는 비밀번호가 올바르지 않습니다." });
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      setErrors({ loginCommon: "서버와 연결할 수 없습니다." });
    }
  };

  return (
    <div className="lg-page">
      <div className="lg-card">
        <div className="lg-card-head">
          <h2 className="lg-card-title">로그인</h2>
          <button className="lg-close-btn" onClick={onBack}>
            <IoCloseOutline />
          </button>
        </div>

        <div className="lg-body">
          <form className="lg-form" onSubmit={handleLogin}>
            <div className="lg-field">
              <input
                className="lg-input"
                placeholder="아이디"
                value={loginForm.userid}
                onChange={(e) => setLoginForm({ ...loginForm, userid: e.target.value })}
              />
            </div>
            <div className="lg-field">
              <div className="lg-input-pw-wrap">
                <input
                  className="lg-input"
                  type="password"
                  placeholder="비밀번호"
                  value={loginForm.userpw}
                  onChange={(e) => setLoginForm({ ...loginForm, userpw: e.target.value })}
                />
                <IoEyeOutline className="lg-pw-eye" />
              </div>
              {errors.loginCommon && <p className="lg-error-msg">{errors.loginCommon}</p>}
            </div>
            <button type="submit" className="lg-btn-primary lg-mt-20">
              로그인
            </button>
          </form>
          <div className="lg-footer-links">
            <span onClick={onGoRegister}>회원가입</span>
            <span className="lg-sep">|</span>
            <span onClick={onGoFindId}>아이디 찾기</span>
            <span className="lg-sep">|</span>
            <span onClick={onGoFindPassword}>비밀번호 찾기</span>
          </div>
        </div>
      </div>
    </div>
  );
}