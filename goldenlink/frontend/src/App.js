import React, { useState } from "react";
import "./App.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FindId from "./pages/Findid";
import FindPassword from "./pages/Findpassword";
import BoardPage from "./pages/Board";

export default function App() {
  // 'home' | 'login' | 'register' | 'findId' | 'findPassword' | 'board'
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);

  const [boardCategory, setBoardCategory] = useState("NOTICE"); // NOTICE | QNA | INFO

  const goHome = () => setPage("home");
  const goLogin = () => setPage("login");
  const goRegister = () => setPage("register");
  const goFindId = () => setPage("findId");
  const goFindPassword = () => setPage("findPassword");

  const goBoard = (category) => {
    setBoardCategory(category);
    setPage("board");
  };

  const onLogin = (payload) => {
    setUser(payload);
    setPage("home");
  };

  const onLogout = () => {
    setUser(null);
  };

  // ✅ 로그인 페이지
  if (page === "login") {
    return (
      <Login 
        onLogin={onLogin} 
        onBack={goHome}
        onGoRegister={goRegister}
        onGoFindId={goFindId}
        onGoFindPassword={goFindPassword}
      />
    );
  }

  // ✅ 회원가입 페이지
  if (page === "register") {
    return (
      <Register 
        onBack={goHome}
        onGoLogin={goLogin}
      />
    );
  }

  // ✅ 아이디 찾기 페이지
  if (page === "findId") {
    return (
      <FindId 
        onBack={goHome}
        onGoLogin={goLogin}
      />
    );
  }

  // ✅ 비밀번호 찾기 페이지
  if (page === "findPassword") {
    return (
      <FindPassword 
        onBack={goHome}
        onGoLogin={goLogin}
      />
    );
  }

  // 게시판 페이지
  if (page === "board") {
    return (
      <BoardPage
        user={user}
        category={boardCategory}
        onBack={goHome}
        onGoLogin={goLogin}
        onGoBoard={goBoard}
        onLogout={onLogout}
      />
    );
  }

  // 홈 페이지
  return (
    <Home
      user={user}
      onLogout={onLogout}
      onGoLogin={goLogin}
      onGoHome={goHome}
      onGoBoard={goBoard}
    />
  );
}