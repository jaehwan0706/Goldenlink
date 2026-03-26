import React from "react";
import { HiOutlineLocationMarker, HiOutlineClock, HiOutlineBookmark } from "react-icons/hi";
import "./IntroducePage.css";

export default function IntroducePage() {
  return (
    <div className="gl-intro-container">
      {/* 상단 히어로 영역 */}
      <section className="gl-intro-hero">
        <img src="/logo.png" alt="Golden Link Logo" className="gl-intro-main-logo" />
        <h1 className="gl-intro-main-title">생명을 연결하는 골든타임</h1>
        <p className="gl-intro-main-sub">
          실시간 위치 기반 병원·응급실 검색 서비스<br />
          골든타임을 지켜 소중한 생명을 보호합니다
        </p>
      </section>

      {/* 메인 카드 영역 */}
      <section className="gl-intro-card-wrap">
        <div className="gl-intro-main-card">
          <div className="gl-intro-card-head">
            <h2 className="gl-intro-card-title">골든링크만의 특별한 기능</h2>
            <p className="gl-intro-card-sub">빠르고 정확한 병원 검색으로 여러분의 건강을 지킵니다</p>
          </div>

          <div className="gl-intro-feature-grid">
            {/* 기능 1 */}
            <div className="gl-intro-feature-item">
              <div className="gl-intro-icon-circle">
                <HiOutlineLocationMarker />
              </div>
              <h3 className="gl-intro-feature-name">실시간 위치 기반 검색</h3>
              <p className="gl-intro-feature-text">
                현재 위치를 기준으로 가장 가까운 병원과<br />
                응급실을 실시간으로 찾아드립니다.
              </p>
            </div>

            {/* 기능 2 */}
            <div className="gl-intro-feature-item">
              <div className="gl-intro-icon-circle">
                <HiOutlineClock />
              </div>
              <h3 className="gl-intro-feature-name">운영 시간 확인</h3>
              <p className="gl-intro-feature-text">
                병원의 운영 시간과 현재 운영 중인지 여부<br />
                를 즉시 확인할 수 있습니다.
              </p>
            </div>

            {/* 기능 3 */}
            <div className="gl-intro-feature-item">
              <div className="gl-intro-icon-circle">
                <HiOutlineBookmark />
              </div>
              <h3 className="gl-intro-feature-name">즐겨찾기 기능</h3>
              <p className="gl-intro-feature-text">
                자주 방문하는 병원을 즐겨찾기에 등록하<br />
                여 빠르게 찾아보세요.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}