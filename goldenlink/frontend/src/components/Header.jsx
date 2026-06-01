import React from "react";
import { CiBookmark } from "react-icons/ci";
import styles from "./Header.module.css";

export default function Header({ user, onLogout, onGoLogin, onGoHome, onOpenBookmark }) {
  return (
    <>
      <div className="gl-brand" role="button" tabIndex={0} onClick={onGoHome}>
        <div className="gl-logoMark" aria-hidden="true">
          <img className="gl-logoImg" src="/logo.png" alt="골든 링크 로고" />
        </div>
      </div>

      <div className="gl-actions">
        {user ? (
          <>
            <button
              type="button"
              className="gl-bookmarkBtn"
              onClick={onOpenBookmark}
              aria-label="즐겨찾기 보기"
              title="즐겨찾기"
            >
              <CiBookmark />
            </button>

            <div className="gl-userChip" title="로그인 상태">
              <span className="gl-userDot" />
              <span className="gl-userName">{user.name || user.userId}</span>
            </div>

            <button 
              className={`gl-btn gl-btnGhost ${styles.headerButton}`}
              onClick={onLogout}
            >
              로그아웃
            </button>
          </>
        ) : (
          <button 
            className={`gl-btn gl-btnPrimary ${styles.headerButton}`}
            onClick={onGoLogin}
          >
            로그인
          </button>
        )}
      </div>
    </>
  );
}