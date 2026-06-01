import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import MegaMenu from "../components/MegaMenu";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

function categoryToKorean(code) {
  if (code === "NOTICE") return "공지사항";
  if (code === "QNA") return "관리자 문의";
  if (code === "INFO") return "정보 게시판";
  return code;
}

function formatCreatedAt(createdAt) {
  if (!createdAt) return "";
  try {
    // 1) ISO 문자열
    if (typeof createdAt === "string") {
      const d = new Date(createdAt);
      if (!Number.isNaN(d.getTime())) return d.toLocaleString();
      return createdAt;
    }

    // 2) LocalDateTime이 배열로 오는 경우 (예: [2026,2,11,12,30,0])
    if (Array.isArray(createdAt) && createdAt.length >= 3) {
      const [y, m, d, hh = 0, mm = 0, ss = 0] = createdAt;
      const dt = new Date(y, (m || 1) - 1, d || 1, hh, mm, ss);
      if (!Number.isNaN(dt.getTime())) return dt.toLocaleString();
    }
  } catch (e) {
    // ignore
  }
  return "";
}

export default function BoardPage({ user, category, onBack, onGoLogin, onGoBoard, onLogout }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [showMega, setShowMega] = useState(false);

  const menuItems = useMemo(
    () => [
      { label: "홈으로", href: "#", onClick: onBack, subItems: [{ label: "홈", href: "#", onClick: onBack }] },
      { label: "공지사항", href: "#", onClick: () => onGoBoard("NOTICE"), subItems: [{ label: "공지사항", href: "#", onClick: () => onGoBoard("NOTICE") }] },
      { label: "관리자 문의", href: "#", onClick: () => onGoBoard("QNA"), subItems: [{ label: "문의", href: "#", onClick: () => onGoBoard("QNA") }] },
      { label: "정보 게시판", href: "#", onClick: () => onGoBoard("INFO"), subItems: [{ label: "정보", href: "#", onClick: () => onGoBoard("INFO") }] },
      { label: "뒤로", href: "#", onClick: onBack, subItems: [{ label: "뒤로가기", href: "#", onClick: onBack }] },
    ],
    [onBack, onGoBoard]
  );

  // 글쓰기 폼
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 목록
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadBoards = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/boards/category/${category}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `조회 실패 (${res.status})`);
      }

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "게시글 조회 실패");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("로그인 후 작성할 수 있습니다.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력하세요.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/boards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ 세션 쿠키 전송 (필수)
        body: JSON.stringify({
          category, // ✅ NOTICE / QNA / INFO
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `등록 실패 (${res.status})`);
      }

      // 등록 성공 → 폼 초기화 + 목록 갱신
      setTitle("");
      setContent("");
      await loadBoards();
    } catch (e) {
      setError(e?.message || "등록 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="gl-page">
      <header className="gl-header">
        <div className="gl-header-inner">
          <Header user={user} onLogout={onLogout} onGoLogin={onGoLogin} onGoHome={onBack} onOpenBookmark={() => {}} />
          <MegaMenu
            menuItems={menuItems}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            showMega={showMega}
            setShowMega={setShowMega}
          />
        </div>
      </header>

      <main className="gl-main" style={{ display: "block" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
          <h2 style={{ margin: "8px 0 12px" }}>{categoryToKorean(category)}</h2>

          {!user && (
            <div style={{ marginBottom: 12 }}>
              <button className="gl-btn gl-btnPrimary" onClick={onGoLogin}>
                로그인하고 글쓰기
              </button>
            </div>
          )}

          <form onSubmit={submit} style={{ marginBottom: 18 }}>
            <div style={{ display: "grid", gap: 10 }}>
              <input
                className="lg-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
                disabled={!user || saving}
              />
              <textarea
                className="lg-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용"
                rows={6}
                disabled={!user || saving}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="gl-btn gl-btnPrimary" disabled={!user || saving}>
                  {saving ? "등록 중..." : "등록"}
                </button>
                <button type="button" className="gl-btn gl-btnGhost" onClick={onBack}>
                  홈으로
                </button>
              </div>
              {error && <div className="lg-error">{error}</div>}
            </div>
          </form>

          <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0 }}>게시글 목록</h3>
              <button className="gl-btn gl-btnGhost" onClick={loadBoards} disabled={loading}>
                {loading ? "불러오는 중..." : "새로고침"}
              </button>
            </div>

            {loading ? (
              <div style={{ padding: 12 }}>불러오는 중...</div>
            ) : items.length === 0 ? (
              <div style={{ padding: 12 }}>게시글이 없습니다.</div>
            ) : (
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {items.map((b) => (
                  <div key={b.id} style={{ padding: 12, border: "1px solid rgba(0,0,0,0.10)", borderRadius: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>{b.title}</div>
                    <div style={{ whiteSpace: "pre-wrap", marginBottom: 8 }}>{b.content}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      작성자: {b?.user?.userid || b?.user?.name || "알 수 없음"} · {formatCreatedAt(b.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
