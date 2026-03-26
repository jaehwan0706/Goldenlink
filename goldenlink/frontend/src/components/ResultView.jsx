import React from "react";
import "./ResultView.css";

export default function ResultView({
  user,
  hospitals = [],
  sortMode,
  onToggleSort,
  isBookmarked,
  onAddBookmark,
  onRemoveBookmark,
  myLocation,
  onClose,
}) {
  return (
    <aside className="gl-result-view">

      {/* 헤더 */}
      <div className="gl-result-header">
        <div className="gl-result-title">
          추천 결과 <span className="gl-result-count">({hospitals.length})</span>
        </div>
        <button className="gl-result-sort" type="button" onClick={onToggleSort}>
          {sortMode === "거리" ? "거리순" : "이름순"}
        </button>
      </div>

      {/* 병원 목록 */}
      <div className="gl-result-list">
        {hospitals.length === 0 ? (
          <div className="gl-result-empty">
            검색 결과가 없습니다.<br />
            필터 조건을 변경해보세요.
          </div>
        ) : (
          hospitals.map((h, idx) => {
            const hid = h?.hid;
            const saved = !!hid && isBookmarked(hid);

            return (
              <div key={hid || `h-${idx}`} className="gl-hospital-card">
                <div className="gl-hospital-inner">
                  {/* 상단: 순위 + 이름 */}
                  <div className="gl-hospital-top">
                    <div className="gl-hospital-rank">{idx + 1}</div>
                    <div className="gl-hospital-name-col">
                      <div className="gl-hospital-name">{h.hname || h.name || "알 수 없음"}</div>
                      <div className="gl-hospital-category">{h.hcategory || h.type || "응급의료센터"}</div>
                    </div>
                  </div>

                  {/* 배지 */}
                  <div className="gl-hospital-badges">
                    {h.open !== false && <span className="gl-badge">24시간 운영</span>}
                    {h.open !== false && <span className="gl-badge outline">진료중</span>}
                  </div>

                  {/* 정보 박스 */}
                  <div className="gl-hospital-info">
                    <div className="gl-info-row address">
                      <span className="icon">📍</span>
                      <span className="text">{h.haddress || h.addr || "주소 정보 없음"}</span>
                    </div>
                    <div className="gl-info-row">
                      <span className="icon">📞</span>
                      <span className="text">{h.htel || h.phone || "전화번호 정보 없음"}</span>
                    </div>
                    {(h.distance || h.distanceKm) && (
                      <div className="gl-info-row">
                        <span className="icon">🚗</span>
                        <span className="text">{(h.distance || h.distanceKm).toFixed(2)}km</span>
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="gl-hospital-actions">
                    <button
                      className="gl-btn gl-btn-outline"
                      onClick={() => {
                        const tel = h.htel || h.phone;
                        if (tel) {
                          window.location.href = `tel:${tel}`;
                        } else {
                          alert("전화번호 정보가 없습니다.");
                        }
                      }}
                    >
                      📞 전화
                    </button>

                    <button
                      className="gl-btn gl-btn-primary"
                      onClick={() => {
                        const lat = h.hlat || h.lat;
                        const lon = h.hlon || h.lon;
                        const name = h.hname || h.name || "병원";
                        if (lat && lon) {
                          window.open(
                            `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lon}`,
                            "_blank"
                          );
                        } else {
                          alert("위치 정보가 없습니다.");
                        }
                      }}
                    >
                      🗺️ 길찾기
                    </button>

                    <button
                      className={`gl-btn gl-btn-bookmark ${saved ? "is-saved" : ""}`}
                      onClick={() => {
                        if (!user) {
                          alert("로그인 후 이용 가능합니다.");
                          return;
                        }
                        if (!hid) {
                          alert("병원 정보가 올바르지 않습니다.");
                          return;
                        }
                        saved ? onRemoveBookmark(hid) : onAddBookmark(h);
                      }}
                    >
                      {saved ? "❤️" : "🤍"} 즐겨찾기
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}