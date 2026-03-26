import React from "react";
import "./Bookmark.css";

export default function Bookmark({ open, onClose, bookmarks, onRemove, loading = false }) {
  if (!open) return null;

  const formatKm = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return `${n.toFixed(2)}km`;
  };

  const openKakaoMap = (b) => {
    const name = encodeURIComponent(b?.hname ?? "");
    const lat = b?.hlat;
    const lon = b?.hlon;
    if (lat == null || lon == null) {
      alert("좌표 정보가 없어 지도 보기 기능을 사용할 수 없습니다.");
      return;
    }
    // 지도 보기
    window.open(`https://map.kakao.com/link/map/${name},${lat},${lon}`, "_blank");
  };

  return (
    <div className="gl-bookmark-view" role="dialog" aria-modal="true" aria-label="즐겨찾기">
      <button
        className="gl-bookmark-backdrop"
        type="button"
        onClick={onClose}
        aria-label="즐겨찾기 닫기"
      />

      <div className="gl-bookmark-card">
        <div className="gl-bookmark-header">
          <div className="gl-bookmark-title">즐겨찾기</div>
          <button className="gl-bookmark-close" type="button" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="gl-bookmark-body">
          {loading ? (
            <div className="gl-bookmark-empty">불러오는 중...</div>
          ) : bookmarks.length === 0 ? (
            <div className="gl-bookmark-empty">
              아직 즐겨찾기가 없습니다.<br />
              오른쪽 결과 카드에서 <b>"즐겨찾기"</b>를 눌러보세요.
            </div>
          ) : (
            <div className="gl-bookmark-list">
              {bookmarks.map((b) => (
                <div className="gl-bookmark-item" key={b.id ?? b.hid}>
                  <div className="gl-bookmark-top">
                    <div className="gl-bookmark-name">{b.hname}</div>
                    <div className="gl-bookmark-dist">{formatKm(b.distance) ?? ""}</div>
                  </div>

                  <div className="gl-bookmark-meta">{b.haddress || "-"}</div>
                  <div className="gl-bookmark-meta2">
                    📞 {b.htel || "전화번호 없음"} · 저장 {b.createdAt || "-"}
                  </div>

                  <div className="gl-bookmark-actions">
                    <button
                      type="button"
                      className="gl-btn gl-btn-outline gl-btn-small"
                      onClick={() => openKakaoMap(b)}
                    >
                      보기
                    </button>
                    <button
                      type="button"
                      className="gl-btn gl-btn-ghost gl-btn-small"
                      onClick={() => onRemove(b.hid)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}