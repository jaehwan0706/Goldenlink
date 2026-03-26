import React from "react";

export default function FilterView({
  onlyOpen,
  setOnlyOpen,
  includeClothes,
  setIncludeClothes,
  radiusKm,
  setRadiusKm,
  onReset,
  onMoveToMyLocation,
  onShowAllHospitals,
  onSearchByRadius
}) {
  return (
    <aside className="gl-card gl-filterCard">
      <div className="gl-cardTitle">필터</div>
      <div className="gl-divider" />
{/* 
      <div className="gl-filterGroup">
        <label className="gl-check">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
          />
          <span className="gl-checkBox" />
          <span className="gl-checkText">운영중만</span>
        </label>

        <label className="gl-check">
          <input
            type="checkbox"
            checked={includeClothes}
            onChange={(e) => setIncludeClothes(e.target.checked)}
          />
          <span className="gl-checkBox" />
          <span className="gl-checkText">의상센터</span>
        </label>
      </div>

      <div className="gl-divider" /> */}

      {/* 반경 선택 */}
      <div className="gl-radioGroup">
        {[3, 5, 10].map((km) => (
          <label key={km} className="gl-radio">
            <input
              type="radio"
              name="radius"
              checked={radiusKm === km}
              onChange={() => setRadiusKm(km)}
            />
            <span className="gl-radioDot" />
            <span className="gl-radioText">{km}km</span>
          </label>
        ))}
      </div>

      {/* 반경 검색 버튼 */}
      <div className="gl-buttonGroup">
        <button
          className="gl-btn gl-btnOutline"
          onClick={onSearchByRadius}
          type="button"
        >
          🔍 {radiusKm}km 반경 검색
        </button>
      </div>

      <div className="gl-divider" />

      {/* 주요 액션 버튼들 */}
      <div className="gl-buttonGroup">
        <button
          className="gl-btn gl-btnPrimary"
          onClick={onShowAllHospitals}
          type="button"
        >
          🏥 전체 병원 보기
        </button>

        <button
          className="gl-btn gl-btnOutline"
          onClick={onMoveToMyLocation}
          type="button"
        >
          📍 현재 위치 업데이트
        </button>

      </div>
    </aside>
  );
}
