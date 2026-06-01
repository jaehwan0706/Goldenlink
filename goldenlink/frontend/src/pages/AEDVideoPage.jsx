import React from "react";
import { 
  HiOutlineVideoCamera, HiOutlineLightBulb, HiOutlineQueueList, 
  HiOutlineShieldCheck, HiOutlineInformationCircle, HiOutlineScale 
} from "react-icons/hi2";
import "./AEDVideoPage.css";

export default function AEDVideoPage() {
  return (
    <div className="gl-video-page">
      {/* 1. 페이지 헤더 */}
      <header className="gl-video-header">
        <div className="gl-video-title-row">
          <HiOutlineVideoCamera className="gl-video-main-icon" />
          <h1>AED 사용 설명 동영상</h1>
        </div>
        <p>자동제세동기(AED)의 정확한 사용법을 영상으로 배워보세요</p>
      </header>

      {/* 2. 동영상 섹션 */}
      <section className="gl-video-container-card">
        <div className="gl-video-card-head">
          <span className="gl-play-icon">▶</span>
          <h2>자동제세동기(AED) 사용법 교육 영상</h2>
        </div>
        <div className="gl-video-frame-wrap">
          {/* 제공해주신 아이프레임 코드 삽입 */}
          <iframe 
            width="1037" 
            height="583" 
            src="https://www.youtube.com/embed/A_3fH2zZ9i4" 
            title="자동제세동기(AED)사용법" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* 3. 하단 정보 섹션 그리드 */}
      <div className="gl-video-info-grid">
        {/* 영상 시청 포인트 */}
        <section className="gl-info-card is-white">
          <div className="gl-info-card-head">
            <HiOutlineQueueList className="gl-card-icon" />
            <h3>영상 시청 포인트</h3>
          </div>
          <ol className="gl-point-list">
            <li>
              <strong>1. AED 위치 확인:</strong>
              <p>공공장소에 설치된 AED의 위치를 미리 파악해두세요.</p>
            </li>
            <li>
              <strong>2. 전극 패드 부착:</strong>
              <p>패드 부착 위치와 방법을 정확히 익혀두세요.</p>
            </li>
            <li>
              <strong>3. 음성 안내 따르기:</strong>
              <p>AED의 음성 안내를 주의 깊게 듣고 정확히 따르세요.</p>
            </li>
            <li>
              <strong>4. 안전 확인:</strong>
              <p>전기 충격 시 환자에게 접촉하지 않도록 주의하세요.</p>
            </li>
          </ol>
        </section>

        {/* CPR과 AED의 조합 */}
        <section className="gl-info-card is-pink">
          <div className="gl-info-card-head">
            <HiOutlineShieldCheck className="gl-card-icon" />
            <h3>CPR과 AED의 조합</h3>
          </div>
          <div className="gl-cpr-combo-content">
            <p>AED는 심폐소생술(CPR)과 함께 사용할 때 가장 효과적입니다.</p>
            <div className="gl-sequence-box">
              <h4>⚡ 기본 순서:</h4>
              <ol>
                <li>심정지 확인 → 119 신고</li>
                <li>CPR 시작 (가슴 압박)</li>
                <li>AED 도착 시 즉시 사용</li>
                <li>AED 분석 중 CPR 중단</li>
                <li>전기 충격 후 즉시 CPR 재개</li>
                <li>구급대원 도착까지 반복</li>
              </ol>
            </div>
            <p className="gl-combo-footer">영상을 통해 CPR과 AED를 어떻게 조합하여 사용하는지 자세히 확인하세요.</p>
          </div>
        </section>
      </div>

      {/* 4. 알아두면 좋은 정보 (하단 블루 박스) */}
      <section className="gl-bottom-tips-box">
        <h3 className="gl-tips-main-title"><HiOutlineLightBulb /> 알아두면 좋은 정보</h3>
        <div className="gl-tips-flex">
          <div className="gl-tip-item">
            <div className="gl-tip-head">
              <HiOutlineInformationCircle />
              <h4>AED는 누구나 사용할 수 있습니다</h4>
            </div>
            <p>AED는 음성 안내가 있어 의료 지식이 없어도 사용 가능합니다. 망설이지 말고 즉시 사용하세요.</p>
          </div>
          <div className="gl-tip-item">
            <div className="gl-tip-head">
              <HiOutlineScale />
              <h4>법적 보호를 받습니다</h4>
            </div>
            <p>선한 의도로 AED를 사용한 경우, '응급의료에 관한 법률'에 따라 법적 책임으로부터 보호받습니다.</p>
          </div>
        </div>
      </section>
    </div>
  );
}