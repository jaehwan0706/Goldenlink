import React from "react";
import { 
  HiOutlinePhone, HiOutlineHeart, HiOutlineCheckCircle, 
  HiOutlineExclamationTriangle, HiOutlineLightBulb, HiOutlineBolt,HiOutlineExclamationCircle
} from "react-icons/hi2";
import "./AEDGuidePage.css";

export default function AEDGuidePage() {
  return (
    <div className="gl-aed-page">
      {/* 1. 상단 헤더 및 긴급 신고 배너 */}
      <header className="gl-aed-header">
        <div className="gl-aed-logo-icon"><HiOutlineHeart /></div>
        <h1>AED 자동심장충격기 사용법</h1>
        <p>심정지 환자를 발견했을 때, AED를 올바르게 사용하면 생명을 구할 수 있습니다.</p>
        
        <div className="gl-aed-red-banner">
          <div className="gl-banner-left">
            <HiOutlinePhone className="gl-banner-icon" />
            <div>
              <span className="gl-banner-label">긴급 상황 시 먼저 연락하세요!</span>
              <strong className="gl-banner-number">119</strong>
            </div>
          </div>
          <HiOutlineExclamationTriangle className="gl-banner-warn" />
        </div>
      </header>

      {/* 2. AED 소개 및 골든타임 */}
      <section className="gl-aed-intro-card">
        <h2 className="gl-intro-title">AED란 무엇인가요?</h2>
        <p className="gl-intro-text">
          AED(Automated External Defibrillator, 자동심장충격기)는 심장이 갑자기 멈춘 심정지 환자에게 
          전기 충격을 주어 심장 리듬을 회복시키는 의료기기입니다. 음성 안내에 따라 누구나 쉽게 사용할 수 있습니다.
        </p>
        <div className="gl-golden-time-box">
          <HiOutlineClock className="gl-golden-icon" />
          <div>
            <strong>골든타임은 4분!</strong>
            <p>심정지 발생 후 4분 이내에 AED를 사용하면 생존율이 크게 높아집니다. 1분이 지날 때마다 생존율이 10%씩 감소합니다.</p>
          </div>
        </div>
      </section>

      <h2 className="gl-step-main-title">사용 단계</h2>

      {/* 3. 단계별 카드 (1~6단계) */}
      <div className="gl-aed-steps-grid">
        
        {/* 1단계 */}
        <div className="gl-step-card">
          <div className="gl-step-head">
            <span className="gl-step-idx">1</span>
            <h3>119에 신고하고 AED를 요청하세요</h3>
          </div>
          <div className="gl-step-illustration">
            <div className="gl-illus-box">
              <HiOutlinePhone className="gl-illus-icon is-red" />
              <span>119 신고</span>
            </div>
            <div className="gl-illus-arrow">→</div>
            <div className="gl-illus-box">
              <HiOutlineHeart className="gl-illus-icon is-pink" />
              <span>AED 요청</span>
            </div>
          </div>
          <ul className="gl-step-checklist">
            <li><HiOutlineCheckCircle /> 환자의 반응과 호흡을 확인합니다</li>
            <li><HiOutlineCheckCircle /> 주변 사람에게 119 신고와 AED 요청을 부탁합니다</li>
            <li><HiOutlineCheckCircle /> 즉시 심폐소생술(CPR)을 시작합니다</li>
          </ul>
        </div>

        {/* 2단계 */}
        <div className="gl-step-card">
          <div className="gl-step-head">
            <span className="gl-step-idx">2</span>
            <h3>AED 전원을 켜세요</h3>
          </div>
          <div className="gl-step-illustration">
            <div className="gl-power-btn-illus">
              <div className="gl-power-box">AED</div>
              <div className="gl-power-green">POWER</div>
            </div>
            <p className="gl-illus-caption">전원 버튼을 누르거나 뚜껑을 엽니다</p>
          </div>
          <ul className="gl-step-checklist">
            <li><HiOutlineCheckCircle /> AED가 도착하면 즉시 전원을 켭니다</li>
            <li><HiOutlineCheckCircle /> 전원이 켜지면 음성 안내가 시작됩니다</li>
            <li><HiOutlineCheckCircle /> 음성 안내에 따라 차근차근 진행하세요</li>
          </ul>
        </div>

        {/* 3단계 */}
        <div className="gl-step-card">
          <div className="gl-step-head">
            <span className="gl-step-idx">3</span>
            <h3>패드를 환자의 가슴에 부착하세요</h3>
          </div>
          <div className="gl-step-illustration">
            <div className="gl-pad-illus-circle">
              <div className="gl-pad-item p1">패드 1<br/>오른쪽 위</div>
              <div className="gl-pad-item p2">패드 2<br/>왼쪽 아래</div>
            </div>
            <p className="gl-illus-caption is-red">패드 1: 오른쪽 빗장뼈 아래 / 패드 2: 왼쪽 젖꼭지 아래 겨드랑이</p>
          </div>
          <ul className="gl-step-checklist">
            <li><HiOutlineCheckCircle /> 환자의 상의를 벗기고 가슴을 드러냅니다</li>
            <li><HiOutlineCheckCircle /> 땀이나 물기가 있으면 마른 천으로 닦습니다</li>
            <li><HiOutlineCheckCircle /> 패드에 그려진 그림대로 정확한 위치에 부착합니다</li>
          </ul>
        </div>

        {/* 4단계 */}
        <div className="gl-step-card">
          <div className="gl-step-head">
            <span className="gl-step-idx">4</span>
            <h3>심장 리듬 분석 중 환자에게서 떨어지세요</h3>
          </div>
          <div className="gl-step-illustration">
            <div className="gl-warning-box">
              <HiOutlineExclamationTriangle className="gl-warn-icon" />
              <div>
                <strong>중요: 모두 환자에게서 떨어지세요!</strong>
                <p>심장 리듬 분석 동안 몸에 닿아 있으면 정확한 분석이 어렵습니다.</p>
              </div>
            </div>
          </div>
          <ul className="gl-step-checklist">
            <li><HiOutlineCheckCircle /> 패드 부착이 완료되면 자동으로 분석을 시작합니다</li>
            <li><HiOutlineCheckCircle /> "분석 중입니다. 떨어지세요"라는 음성이 나옵니다</li>
            <li><HiOutlineCheckCircle /> 이때 모든 사람이 환자의 몸에서 손을 떼야 합니다</li>
          </ul>
        </div>

        {/* 5단계 - 충격 버튼 애니메이션 효과 추가 */}
        <div className="gl-step-card">
          <div className="gl-step-head">
            <span className="gl-step-idx">5</span>
            <h3>충격 버튼을 누르세요</h3>
          </div>
          <div className="gl-step-illustration">
            <div className="gl-shock-btn-container">
              {/* 흐려졌다가 선명해지는 애니메이션 적용 대상 */}
              <div className="gl-shock-btn-illus gl-blur-animation">
                충격<br/>버튼
              </div>
              <p className="gl-shock-warning"><HiOutlineExclamationCircle /> 환자에게서 떨어진 후 누르세요!</p>
            </div>
          </div>
          <ul className="gl-step-checklist">
            <li><HiOutlineCheckCircle /> "충격 버튼을 누르세요" 음성이 나오면 버튼을 누릅니다</li>
            <li><HiOutlineCheckCircle /> 주변에 아무도 환자를 만지지 않는지 확인합니다</li>
            <li><HiOutlineCheckCircle /> 충격이 필요하지 않다면 자동으로 안내됩니다</li>
          </ul>
        </div>

        {/* 6단계 */}
        <div className="gl-step-card">
          <div className="gl-step-head">
            <span className="gl-step-idx">6</span>
            <h3>즉시 심폐소생술을 다시 시작하세요</h3>
          </div>
          <div className="gl-step-illustration">
            <div className="gl-cpr-ratio-illus">
              <div className="gl-ratio-item">✋ 30회</div>
              <div className="gl-ratio-plus">+</div>
              <div className="gl-ratio-item">🌬️ 2회</div>
            </div>
            <p className="gl-illus-caption is-red-bold">30:2 비율로 반복하세요</p>
          </div>
          <ul className="gl-step-checklist">
            <li><HiOutlineCheckCircle /> 안내 후 즉시 심폐소생술을 다시 시작합니다</li>
            <li><HiOutlineCheckCircle /> 가슴압박 30회, 인공호흡 2회를 반복합니다</li>
            <li><HiOutlineCheckCircle /> 구급대가 도착할 때까지 지속합니다</li>
          </ul>
        </div>
      </div>

      {/* 4. 주의사항 및 하단 배너 */}
      <section className="gl-aed-precautions">
        <div className="gl-pre-box is-wrong">
          <h4><HiOutlineExclamationCircle /> 하지 말아야 할 것</h4>
          <ul>
            <li>분석 중이거나 충격을 가하는 동안 환자를 만지지 마세요</li>
            <li>패드를 잘못된 위치에 부착하지 마세요</li>
            <li>물기가 있는 곳이나 금속 바닥에서 사용하지 마세요</li>
          </ul>
        </div>
        <div className="gl-pre-box is-must">
          <h4><HiOutlineCheckCircle /> 꼭 기억하세요</h4>
          <ul>
            <li>AED는 반드시 전원을 켜고 음성 안내에 따르세요</li>
            <li>패드는 피부에 밀착되도록 단단히 부착하세요</li>
            <li>구급대가 올 때까지 심폐소생술을 중단하지 마세요</li>
          </ul>
        </div>
      </section>

      <footer className="gl-aed-final-banner">
        <HiOutlinePhone className="gl-final-icon" />
        <h2>긴급 상황 발생 시 119</h2>
        <p>심정지가 의심되면 즉시 119에 신고하고 AED를 요청하세요.<br/>골든타임 4분 안에 대응하는 것이 생명을 구합니다.</p>
      </footer>
    </div>
  );
}

// 아이콘 보충용 임시 컴포넌트 (실제 아이콘 라이브러리 상황에 맞게 조정)
function HiOutlineClock(props) {
  return <span {...props}>⏰</span>;
}