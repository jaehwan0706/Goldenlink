import { useMemo, useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:8080";

export default function useHospitalResults({ hospitals, user }) {
  // Filters / UI state
  const [q, setQ] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [includeClothes, setIncludeClothes] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);
  const [sortMode, setSortMode] = useState("추천"); // 추천/거리

  // Bookmark state
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // ✅ 로그인 시 즐겨찾기 목록 불러오기
  useEffect(() => {
    if (user) {
      loadBookmarks();
    } else {
      setBookmarks([]);
    }
  }, [user]);

  // ✅ 백엔드에서 즐겨찾기 목록 불러오기
  const loadBookmarks = async () => {
    if (!user) return;

    try {
      setBookmarkLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/bookmarks`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("즐겨찾기 로드 성공:", data);
        setBookmarks(data);
      } else {
        console.error("즐겨찾기 로드 실패:", response.status);
        setBookmarks([]);
      }
    } catch (error) {
      console.error("즐겨찾기 로드 오류:", error);
      setBookmarks([]);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return hospitals
      .filter((h) => {
        if (onlyOpen && !h.open) return false;
        if (!includeClothes && h.category === "clothes") return false;
        if (h.distanceKm > radiusKm) return false;
        if (!keyword) return true;

        const hname = h.hname || h.name || "";
        const haddress = h.haddress || h.addr || "";
        const hcategory = h.hcategory || h.type || "";

        return (
          hname.toLowerCase().includes(keyword) ||
          haddress.toLowerCase().includes(keyword) ||
          hcategory.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        if (sortMode === "거리") {
          const distA = a.distance || a.distanceKm || 0;
          const distB = b.distance || b.distanceKm || 0;
          return distA - distB;
        }
        if (a.open !== b.open) return a.open ? -1 : 1;
        const distA = a.distance || a.distanceKm || 0;
        const distB = b.distance || b.distanceKm || 0;
        return distA - distB;
      });
  }, [hospitals, q, onlyOpen, includeClothes, radiusKm, sortMode]);

  const resetFilters = () => {
    setQ("");
    setOnlyOpen(true);
    setIncludeClothes(false);
    setRadiusKm(10);
    setSortMode("추천");
  };

  // ✅ 즐겨찾기 여부 확인 (hid 기준)
  const isBookmarked = (hid) => {
    if (!hid) return false;
    return bookmarks.some((b) => b.hid === hid);
  };

  // ✅ 즐겨찾기 추가 (백엔드 API 호출)
  const addBookmark = async (hospital) => {
    if (!user) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    if (!hospital.hid) {
      alert("병원 정보가 올바르지 않습니다. (hid 없음)");
      console.error("병원 정보에 hid가 없습니다:", hospital);
      return;
    }

    if (isBookmarked(hospital.hid)) {
      console.log("이미 즐겨찾기에 추가된 병원입니다.");
      return;
    }

    try {
      const requestBody = {
        hid: hospital.hid,
        hname: hospital.hname || hospital.name || "알 수 없음",
        haddress: hospital.haddress || hospital.addr || "",
        htel: hospital.htel || hospital.phone || "",
        hlat: hospital.hlat || hospital.lat || null,
        hlon: hospital.hlon || hospital.lon || null,
        distance: hospital.distance || hospital.distanceKm || null,
      };

      console.log("즐겨찾기 추가 요청:", requestBody);

      const response = await fetch(`${API_BASE_URL}/api/bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        console.log("즐겨찾기 추가 성공");
        // 즐겨찾기 목록 새로고침
        await loadBookmarks();
      } else {
        const errorData = await response.json();
        console.error("즐겨찾기 추가 실패:", errorData);
        alert(errorData.error || "즐겨찾기 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("즐겨찾기 추가 오류:", error);
      alert("서버와 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.");
    }
  };

  // ✅ 즐겨찾기 삭제 (백엔드 API 호출)
  const removeBookmark = async (hid) => {
    if (!user) {
      return;
    }

    if (!hid) {
      alert("병원 정보가 올바르지 않습니다.");
      return;
    }

    try {
      console.log("즐겨찾기 삭제 요청:", hid);

      const response = await fetch(`${API_BASE_URL}/api/bookmarks/${encodeURIComponent(hid)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        console.log("즐겨찾기 삭제 성공");
        // 즐겨찾기 목록 새로고침
        await loadBookmarks();
      } else {
        const errorData = await response.json();
        console.error("즐겨찾기 삭제 실패:", errorData);
        alert(errorData.error || "즐겨찾기 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("즐겨찾기 삭제 오류:", error);
      alert("서버와 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.");
    }
  };

  return {
    q,
    setQ,
    onlyOpen,
    setOnlyOpen,
    includeClothes,
    setIncludeClothes,
    radiusKm,
    setRadiusKm,
    sortMode,
    setSortMode,
    resetFilters,

    filtered,

    bookmarkOpen,
    setBookmarkOpen,
    bookmarks,
    bookmarkLoading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    loadBookmarks,
  };
}