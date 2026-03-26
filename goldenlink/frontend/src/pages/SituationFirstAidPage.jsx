import React from "react";
// hi2 라이브러리 내 실제 존재하는 아이콘으로 매칭
import { 
  HiOutlineHeart, 
  HiOutlineHandThumbUp, 
  HiOutlineInformationCircle, 
  HiOutlineExclamationCircle, 
  HiOutlineExclamationTriangle, 
  HiOutlineShieldCheck,
  HiOutlineClock, 
  HiOutlineFire, 
  HiOutlineHandRaised 
} from "react-icons/hi2";

// hi2에 없는 날씨/환경 아이콘은 bs 라이브러리에서 보충
import { BsSnow, BsWind } from "react-icons/bs"; 

import "./SituationFirstAidPage.css";

export default function SituationFirstAid() {
  return (
    <div className="gl-situation-container">
      {/* 페이지 헤더 */}
      <header className="gl-situation-header">
        <h1>상황별 응급처치</h1>
        <p>각 상황에 맞는 올바른 응급처치 방법을 배워두세요</p>
      </header>

      {/* 1. 심폐소생술 (CPR) */}
      <section className="gl-aid-card is-cpr">
        <div className="gl-aid-card-head">
          <HiOutlineHeart className="gl-aid-icon" /> <h2>심폐소생술 (CPR)</h2>
        </div>
        <div className="gl-aid-card-body">
          <p className="gl-aid-desc">심정지 환자에게 실시하는 가장 중요한 응급처치입니다. 의식과 정상 호흡이 없을 때 즉시 시행합니다.</p>
          <div className="gl-aid-grid-layout">
            <div className="gl-aid-steps">
              <div className="gl-aid-step">
                <span className="gl-step-num">1</span>
                <div>
                  <strong>반응 확인</strong>
                  <p>어깨를 가볍게 두드리며 "괜찮으세요?"라고 묻습니다. 반응이 없고 호흡이 없거나 비정상이면 심정지로 판단합니다.</p>
                </div>
              </div>
              <div className="gl-aid-step">
                <span className="gl-step-num">2</span>
                <div>
                  <strong>119 신고</strong>
                  <p>주변 사람에게 119 신고를 요청하고, AED(자동심장충격기)를 가져오도록 합니다.</p>
                </div>
              </div>
              <div className="gl-aid-step">
                <span className="gl-step-num">3</span>
                <div>
                  <strong>가슴 압박</strong>
                  <p>환자를 단단한 바닥에 눕히고 가슴 중앙을 <strong>약 5cm 깊이</strong>로 강하고 빠르게 압박합니다.</p>
                </div>
              </div>
              <div className="gl-aid-step">
                <span className="gl-step-num">4</span>
                <div>
                  <strong>압박 속도</strong>
                  <p><strong>분당 100-120회</strong> 속도로 압박합니다. 리듬을 유지하는 것이 중요합니다.</p>
                </div>
              </div>
              <div className="gl-aid-step">
                <span className="gl-step-num">5</span>
                <div>
                  <strong>인공호흡 (선택)</strong>
                  <p>30회 압박 후 인공호흡 2회를 실시합니다. 어렵다면 가슴 압박만 지속하세요.</p>
                </div>
              </div>
            </div>
            <div className="gl-aid-side">
              <div className="gl-info-box is-yellow">
                <h4><HiOutlineHandThumbUp /> 중요 포인트</h4>
                <ul>
                  <li>구급대원이 도착할 때까지 멈추지 마세요</li>
                  <li>가슴이 완전히 이완되도록 합니다</li>
                  <li>압박 위치가 바뀌지 않도록 주의합니다</li>
                </ul>
              </div>
              <div className="gl-summary-box is-pink">
                <HiOutlineHeart />
                <strong>압박 30회 / 인공호흡 2회</strong>
                <span>반복 실시</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 출혈 시 응급처치 */}
      <section className="gl-aid-card is-bleeding">
        <div className="gl-aid-card-head">
          <HiOutlineShieldCheck className="gl-aid-icon" /> <h2>출혈 시 응급처치</h2>
        </div>
        <div className="gl-aid-card-body">
          <div className="gl-flex-row-three">
            <div className="gl-box-item">
              <span className="gl-box-num">1</span>
              <h3>직접 압박</h3>
              <p>거즈나 천으로 상처 부위를 5-10분간 강하게 압박합니다.</p>
            </div>
            <div className="gl-box-item">
              <span className="gl-box-num">2</span>
              <h3>상처 부위 높이기</h3>
              <p>출혈 부위를 심장보다 높게 유지하여 혈류를 줄입니다.</p>
            </div>
            <div className="gl-box-item">
              <span className="gl-box-num">3</span>
              <h3>지혈대 사용</h3>
              <p>심한 출혈 시 최후의 수단으로 사용하며 시간을 기록합니다.</p>
            </div>
          </div>
          <div className="gl-caution-strip">
            <HiOutlineExclamationTriangle /> 주의: 상처의 이물질을 억지로 제거하지 마세요.
          </div>
        </div>
      </section>

      {/* 3. 화상 응급처치 */}
      <section className="gl-aid-card is-burn">
        <div className="gl-aid-card-head">
          <HiOutlineFire className="gl-aid-icon" /> <h2>화상 응급처치</h2>
        </div>
        <div className="gl-aid-card-body">
          <div className="gl-aid-grid-layout">
            <div className="gl-aid-steps">
              <div className="gl-aid-step">
                <span className="gl-step-num">1</span>
                <div>
                  <strong>즉시 냉각</strong>
                  <p>흐르는 찬물에 10-20분간 충분히 식힙니다.</p>
                </div>
              </div>
              <div className="gl-aid-step">
                <span className="gl-step-num">2</span>
                <div>
                  <strong>의복 제거</strong>
                  <p>장신구나 옷을 제거하되, 피부에 붙은 것은 떼지 마세요.</p>
                </div>
              </div>
              <div className="gl-aid-step">
                <span className="gl-step-num">3</span>
                <div>
                  <strong>상처 보호</strong>
                  <p>깨끗한 거즈로 느슨하게 덮어 감염을 막습니다.</p>
                </div>
              </div>
            </div>
            <div className="gl-aid-side">
              <div className="gl-info-box is-red">
                <h4>🚫 하지 말아야 할 것</h4>
                <ul>
                  <li>얼음을 직접 대는 행위</li>
                  <li>된장, 치약 등 민간요법</li>
                  <li>물집 터뜨리기</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 저체온증 응급처치 */}
      <section className="gl-aid-card is-cold">
        <div className="gl-aid-card-head">
          <BsSnow className="gl-aid-icon" /> <h2>저체온증 응급처치</h2>
        </div>
        <div className="gl-aid-card-body">
          <div className="gl-flex-row-three">
            <div className="gl-box-item">
              <BsWind className="gl-box-icon" />
              <h3>따뜻한 곳으로</h3>
              <p>젖은 옷을 벗기고 담요로 환자를 따뜻하게 감싸줍니다.</p>
            </div>
            <div className="gl-box-item">
              <HiOutlineHeart className="gl-box-icon" />
              <h3>체온 서서히 올리기</h3>
              <p>따뜻한 음료(의식 있을 때)를 주고 체온을 유지합니다.</p>
            </div>
            <div className="gl-box-item">
              <HiOutlineExclamationCircle className="gl-box-icon" />
              <h3>생체 징후 확인</h3>
              <p>호흡과 맥박이 멈추면 즉시 CPR을 시행합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 질식 응급처치 */}
      <section className="gl-aid-card is-choking">
        <div className="gl-aid-card-head">
          <BsWind className="gl-aid-icon" /> <h2>질식 응급처치 (하임리히법)</h2>
        </div>
        <div className="gl-aid-card-body">
          <div className="gl-aid-grid-layout">
            <div className="gl-aid-steps">
              <div className="gl-aid-step">
                <span className="gl-step-num">1</span>
                <div>
                  <strong>질식 확인</strong>
                  <p>말을 못하고 목을 움켜쥐는지 확인합니다.</p>
                </div>
              </div>
              <div className="gl-aid-step">
                <span className="gl-step-num">2</span>
                <div>
                  <strong>등 두드리기</strong>
                  <p>환자를 숙이고 어깨 사이를 5회 강하게 칩니다.</p>
                </div>
              </div>
              <div className="gl-aid-step">
                <span className="gl-step-num">3</span>
                <div>
                  <strong>복부 밀어내기</strong>
                  <p>명치 아래를 위로 5회 빠르고 강하게 밀어 올립니다.</p>
                </div>
              </div>
            </div>
            <div className="gl-aid-side">
              <div className="gl-info-box is-purple-light">
                <h4 className="gl-purple-text">영아 (1세 미만)</h4>
                <p>등 두드리기 5회와 가슴 압박 5회를 반복합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 골절 응급처치 */}
      <section className="gl-aid-card is-fracture">
        <div className="gl-aid-card-head">
          <HiOutlineHandRaised className="gl-aid-icon" /> <h2>골절 응급처치</h2>
        </div>
        <div className="gl-aid-card-body">
          <div className="gl-aid-grid-layout">
            <div className="gl-aid-steps">
              <div className="gl-aid-step">
                <span className="gl-step-num">1</span>
                <div>
                  <strong>움직이지 마세요</strong>
                  <p>환부를 고정하고 불필요한 이동을 피합니다.</p>
                </div>
              </div>
              <div className="gl-aid-step">
                <span className="gl-step-num">2</span>
                <div>
                  <strong>고정하기</strong>
                  <p>부목을 대어 관절의 움직임을 최소화합니다.</p>
                </div>
              </div>
              <div className="gl-aid-step">
                <span className="gl-step-num">3</span>
                <div>
                  <strong>냉찜질</strong>
                  <p>부종과 통증을 줄이기 위해 얼음주머니를 사용합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 하단 푸터 */}
      <footer className="gl-situation-footer">
        <h2>응급처치는 임시 조치입니다</h2>
        <p>응급처치 후에는 반드시 <strong>전문 의료진의 진료</strong>를 받아야 합니다.</p>
      </footer>
    </div>
  );
}