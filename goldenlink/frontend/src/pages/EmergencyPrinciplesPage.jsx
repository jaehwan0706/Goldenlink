import React from "react";
import { 
  HiOutlineExclamationTriangle, HiOutlinePhone, HiOutlineLightBulb, 
  HiOutlineHeart, HiOutlineShieldCheck, HiOutlineUser,
  HiOutlineClock, HiOutlinePaperAirplane, HiOutlineCheckCircle
} from "react-icons/hi2";
import "./EmergencyPrinciplesPage.css";

export default function EmergencyPrinciples() {
  return (
    <div className="gl-principles-container">
      {/* 히어로 영역 */}
      <header className="gl-principles-hero">
        <HiOutlineExclamationTriangle className="gl-hero-warn-icon" />
        <h1 className="gl-principles-title">응급 상황 시 행동원칙</h1>
        <p className="gl-principles-subtitle">응급 상황에서 침착하게 대처하는 방법을 알아두세요</p>
      </header>

      {/* 중요한 안내 박스 */}
      <section className="gl-principles-alert-box">
        <div className="gl-alert-head">
          <HiOutlineExclamationTriangle /> <span>중요한 안내</span>
        </div>
        <p className="gl-alert-text">
          응급 상황에서는 <strong>빠르고 정확한 판단</strong>이 생명을 살립니다. 
          아래의 행동원칙을 숙지하여 골든타임을 지키세요.
        </p>
      </section>

      {/* 1단계: 상황 파악 및 안전 확보 */}
      <section className="gl-step-card">
        <div className="gl-step-banner">
          <span className="gl-step-no">1</span> <h2>상황 파악 및 안전 확보</h2>
        </div>
        <div className="gl-step-content-grid">
          <div className="gl-content-left">
            <div className="gl-info-item">
              <HiOutlineShieldCheck className="gl-info-icon" />
              <div>
                <h3>주변 안전 확인</h3>
                <p>현장이 안전한지 먼저 확인하세요. 화재, 교통사고, 전기 감전 등 추가 위험이 있다면 안전한 곳으로 이동합니다.</p>
              </div>
            </div>
            <div className="gl-info-item">
              <HiOutlineUser className="gl-info-icon" />
              <div>
                <h3>환자 상태 확인</h3>
                <p>환자의 의식, 호흡, 맥박을 빠르게 확인합니다. "괜찮으세요?"라고 물어보며 반응을 살핍니다.</p>
              </div>
            </div>
          </div>
          <div className="gl-caution-box">
            <h4>⚠️ 주의사항</h4>
            <ul>
              <li>무리하게 환자를 이동하지 마세요</li>
              <li>척추 손상이 의심되면 절대 움직이지 마세요</li>
              <li>본인의 안전을 최우선으로 생각하세요</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2단계: 119 신고 및 도움 요청 */}
      <section className="gl-step-card">
        <div className="gl-step-banner">
          <span className="gl-step-no">2</span> <h2>119 신고 및 도움 요청</h2>
        </div>
        <div className="gl-step-content-grid">
          <div className="gl-content-left">
            <div className="gl-info-item">
              <HiOutlinePhone className="gl-info-icon" />
              <div>
                <h3>119에 즉시 신고</h3>
                <p>혼자라면 직접 전화하고, 주변에 사람이 있다면 "당신! 119에 신고해주세요!"라고 구체적으로 요청합니다.</p>
              </div>
            </div>
            <div className="gl-report-list">
              <p>📞 신고 시 전달 내용:</p>
              <ul>
                <li>정확한 위치 (주소, 건물명, 층수)</li>
                <li>환자의 상태 (의식, 호흡, 출혈 등)</li>
                <li>사고 경위 및 원인</li>
                <li>본인의 연락처</li>
              </ul>
            </div>
          </div>
          <div className="gl-side-col">
            <div className="gl-tip-box">
              <h4>💡 TIP</h4>
              <p>119 상담원의 지시를 끝까지 듣고 따르세요. 상담원이 전화를 끊으라고 할 때까지 통화를 유지하며, 응급처치 방법을 안내받을 수 있습니다.</p>
            </div>
            <div className="gl-call-banner">
              <HiOutlinePhone /> <span>응급 신고</span> <strong>119</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 3단계: 응급처치 시작 */}
      <section className="gl-step-card">
        <div className="gl-step-banner">
          <span className="gl-step-no">3</span> <h2>응급처치 시작</h2>
        </div>
        <div className="gl-action-grid">
          <div className="gl-action-item">
            <HiOutlineHeart className="gl-action-icon" />
            <h3>심폐소생술 (CPR)</h3>
            <p>의식과 호흡이 없다면 즉시 심폐소생술을 시작합니다. 가슴 압박 30회, 인공호흡 2회를 반복합니다.</p>
          </div>
          <div className="gl-action-item">
            <HiOutlineShieldCheck className="gl-action-icon" />
            <h3>출혈 조치</h3>
            <p>깨끗한 천이나 거즈로 상처 부위를 직접 압박하여 출혈을 멈추게 합니다.</p>
          </div>
          <div className="gl-action-item">
            <HiOutlineUser className="gl-action-icon" />
            <h3>자세 유지</h3>
            <p>의식이 있다면 편안한 자세를 유지하고, 구토 시 옆으로 눕혀 기도를 확보합니다.</p>
          </div>
        </div>
        <div className="gl-bottom-warning">
          ⚠️ 자신이 없거나 위험하다고 판단되면 무리하지 말고 119의 도착을 기다리며 환자를 관찰하세요.
        </div>
      </section>

      {/* 4단계: 구급차 도착 대기 */}
      <section className="gl-step-card">
        <div className="gl-step-banner">
          <span className="gl-step-no">4</span> <h2>구급차 도착 대기</h2>
        </div>
        <div className="gl-step-content-grid">
          <div className="gl-content-left">
            <div className="gl-info-item">
              <HiOutlineClock className="gl-info-icon" />
              <div>
                <h3>환자 상태 지속 관찰</h3>
                <p>구급차가 도착할 때까지 환자의 의식, 호흡, 맥박을 지속적으로 확인하고 변화를 기록합니다.</p>
              </div>
            </div>
            <div className="gl-info-item">
              <HiOutlinePaperAirplane className="gl-info-icon" />
              <div>
                <h3>구급대원 안내</h3>
                <p>가능하면 누군가가 밖으로 나가 구급차를 안내하여 시간을 절약합니다.</p>
              </div>
            </div>
          </div>
          <div className="gl-check-list-box">
            <h4><HiOutlineCheckCircle /> 구급대원에게 전달할 정보</h4>
            <ol>
              <li>사고 경위 및 시간</li>
              <li>환자의 기저질환 및 복용 중인 약</li>
              <li>실시한 응급처치 내용</li>
              <li>환자 상태의 변화</li>
            </ol>
          </div>
        </div>
      </section>

      {/* 하단 골든타임 배너 */}
      <footer className="gl-principles-footer-banner">
        <HiOutlineClock className="gl-footer-clock-icon" />
        <h2>골든타임을 기억하세요!</h2>
        <p>
          심정지 후 <strong>4-5분</strong> 이내에 심폐소생술을 시작하지 않으면 뇌 손상이 시작됩니다.<br />
          응급 상황에서는 <strong>신속하고 정확한 대처</strong>가 생명을 구합니다. 위의 행동원칙을 숙지하고 침착하게 대응하세요.
        </p>
      </footer>
    </div>
  );
}