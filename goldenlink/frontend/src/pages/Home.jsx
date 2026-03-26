import React, { useMemo, useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import MegaMenu from "../components/MegaMenu";
import SearchBar from "../components/SearchBar";
import FilterView from "../components/FilterView";
import MapView from "../components/MapView";
import ResultView from "../components/ResultView";
import Bookmark from "../components/Bookmark";
import EmergencyButton from "../components/EmergencyButton"; // ✅ 추가

// 페이지 컴포넌트 임포트
import IntroducePage from "./IntroducePage";
import NoticePage from "./NoticePage";
import InfoBoardPage from "./InfoBoardPage";
import InquiryBoardPage from "./InquiryBoardPage";
import EmergencyPrinciplesPage from "./EmergencyPrinciplesPage";
import SituationFirstAidPage from "./SituationFirstAidPage";
import AEDGuidePage from "./AEDGuidePage";
import AEDVideoPage from "./AEDVideoPage";
import BoardWritePostPage from "./BoardWritePostPage";
import PostDetailPage from "./PostDetailPage";
import InquiryBoardWritePostPage from "./InquiryBoardWritePostPage";
import InquiryPostDetailPage from "./InquiryPostDetailPage";
import NoticeBoardWritePostPage from "./NoticeBoardWritePostPage";
import NoticeBoardDetailPage from "./NoticeBoardDetailPage";

import "../styles/components.css";

export default function Home({ user, onLogout, onGoLogin, onGoHome }) {
  const API_BASE_URL = "http://localhost:8080";

  const [activeMenu, setActiveMenu] = useState(null);
  const [showMega, setShowMega] = useState(false);

  // ✅ 검색/필터 상태
  const [q, setQ] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [includeClothes, setIncludeClothes] = useState(false);
  const [radiusKm, setRadiusKm] = useState(3);

  // ✅ 정렬
  const [sortMode, setSortMode] = useState("거리");

  // ✅ 지도/결과 패널 UI
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isResultOpen, setIsResultOpen] = useState(true);

  // ✅ MapView에서 올려주는 병원 리스트
  const [hospitals, setHospitals] = useState([]);

  // ✅ 내 위치
  const [myLocation, setMyLocation] = useState(null);

  // ✅ 북마크
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // ✅ 게시판 라우팅/상태
  const [viewMode, setViewMode] = useState("search");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  // ✅ 게시판 데이터 상태
  const [posts, setPosts] = useState([]);
  const [notices, setNotices] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ 페이징 상태
  const [postsPaging, setPostsPaging] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [noticesPaging, setNoticesPaging] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [inquiriesPaging, setInquiriesPaging] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
  });

  // ✅ 검색 상태
  const [postsSearch, setPostsSearch] = useState({ type: "전체", keyword: "" });
  const [noticesSearch, setNoticesSearch] = useState({ type: "전체", keyword: "" });
  const [inquiriesSearch, setInquiriesSearch] = useState({ type: "전체", keyword: "" });

  const mapRef = useRef(null);

  // =========================
  // ✅ MapView 제어
  // =========================
  const handleSearch = () => {
    if (!q.trim()) {
      handleShowAllHospitals();
      return;
    }

    if (mapRef.current) {
      if (searchType === "name") {
        mapRef.current.searchByName(q.trim());
      } else if (searchType === "address") {
        mapRef.current.searchByAddress(q.trim());
      } else {
        mapRef.current.searchByName(q.trim());
      }
    }
  };

  const handleSearchNearby = () => {
    if (mapRef.current) {
      mapRef.current.searchNearby();
    }
  };

  const handleMoveToMyLocation = () => {
    if (mapRef.current) {
      mapRef.current.updateMyLocation();
    }
  };

  const handleShowAllHospitals = () => {
    if (mapRef.current) {
      mapRef.current.showAllHospitals();
    }
  };

  const handleSearchByRadius = () => {
    if (mapRef.current) {
      mapRef.current.searchByRadius();
    }
  };

  const resetFilters = () => {
    setOnlyOpen(false);
    setIncludeClothes(false);
    setRadiusKm(3);
  };

  // =========================
  // ✅ 북마크 API
  // =========================
  const fetchBookmarks = async () => {
    if (!user) return;
    try {
      setBookmarkLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/bookmarks`, {
        credentials: "include",
      });

      if (res.status === 401) {
        setBookmarks([]);
        return;
      }

      if (!res.ok) {
        const t = await res.text();
        console.error("즐겨찾기 조회 실패:", t);
        setBookmarks([]);
        return;
      }

      const data = await res.json();
      setBookmarks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("즐겨찾기 조회 오류:", e);
      setBookmarks([]);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const isBookmarked = (hid) => {
    if (!hid) return false;
    return bookmarks.some((b) => b?.hid === hid);
  };

  const addBookmark = async (h) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      onGoLogin?.();
      return;
    }

    const hid = h?.hid;
    const hname = h?.hname;
    if (!hid || !hname) {
      alert("병원 정보가 올바르지 않습니다.");
      return;
    }

    if (isBookmarked(hid)) return;

    const payload = {
      hid: String(hid),
      hname: String(hname),
      haddress: h?.haddress ?? null,
      htel: h?.htel ?? null,
      hlat: h?.hlat != null ? Number(h.hlat) : null,
      hlon: h?.hlon != null ? Number(h.hlon) : null,
      distance: h?.distance != null ? Number(h.distance) : null,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        alert("로그인이 필요합니다.");
        onGoLogin?.();
        return;
      }

      if (!res.ok) {
        const t = await res.text();
        console.error("즐겨찾기 추가 실패:", t);
        alert("즐겨찾기 추가에 실패했습니다.");
        return;
      }

      const created = await res.json();
      setBookmarks((prev) => [created, ...prev]);
    } catch (e) {
      console.error("즐겨찾기 추가 오류:", e);
      alert("서버와 연결할 수 없습니다.");
    }
  };

  const removeBookmark = async (hid) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      onGoLogin?.();
      return;
    }
    if (!hid) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookmarks/${encodeURIComponent(String(hid))}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401) {
        alert("로그인이 필요합니다.");
        onGoLogin?.();
        return;
      }

      if (!res.ok) {
        const t = await res.text();
        console.error("즐겨찾기 삭제 실패:", t);
        alert("즐겨찾기 삭제에 실패했습니다.");
        return;
      }

      setBookmarks((prev) => prev.filter((b) => b.hid !== hid));
    } catch (e) {
      console.error("즐겨찾기 삭제 오류:", e);
      alert("서버와 연결할 수 없습니다.");
    }
  };

  useEffect(() => {
    if (user && bookmarkOpen) {
      fetchBookmarks();
    }
  }, [user, bookmarkOpen]);

  // =========================
  // ✅ 정렬
  // =========================
  const resultList = useMemo(() => {
    if (!hospitals || hospitals.length === 0) return [];
    const arr = [...hospitals];

    if (sortMode === "거리") {
      arr.sort((a, b) => {
        const distA = a?.distance ?? Infinity;
        const distB = b?.distance ?? Infinity;
        return distA - distB;
      });
    } else if (sortMode === "이름") {
      arr.sort((a, b) => {
        const nameA = a?.hname ?? "";
        const nameB = b?.hname ?? "";
        return nameA.localeCompare(nameB, "ko-KR");
      });
    }

    return arr;
  }, [hospitals, sortMode]);

  const onToggleSort = () => {
    setSortMode((prev) => (prev === "거리" ? "이름" : "거리"));
  };

  // =========================
  // ✅ 게시판 메뉴
  // =========================
  const handleMenuClick = (label) => {
    // ✅ MegaMenu에서 label 문자열을 전달받음
    if (label === "서비스 소개") {
      setViewMode("intro");
    } else if (label === "실시간 검색") {
      setViewMode("search");
    } else if (label === "행동원칙") {
      setViewMode("principles");
    } else if (label === "상황별 처치") {
      setViewMode("situations");
    } else if (label === "AED 사용법") {
      setViewMode("aedGuide");
    } else if (label === "AED 사용설명 동영상") {
      setViewMode("aedVideo");
    } else if (label === "정보공유 게시판") {
      setViewMode("infoBoard");
      loadBoardData("INFO", 0, 10, postsSearch.type, postsSearch.keyword, setPosts, setPostsPaging);
    } else if (label === "관리자 문의 게시판") {
      setViewMode("inquiryBoard");
      loadBoardData("QNA", 0, 10, inquiriesSearch.type, inquiriesSearch.keyword, setInquiries, setInquiriesPaging);
    } else if (label === "전체 공지") {
      setViewMode("notice");
      loadBoardData("NOTICE", 0, 10, noticesSearch.type, noticesSearch.keyword, setNotices, setNoticesPaging);
    }
  };

  // =========================
  // ✅ 게시판 API
  // =========================
  const loadBoardData = async (boardType, page, size, searchType, keyword, setPosts, setPaging) => {
    try {
      setLoading(true);

      // ✅ 백엔드 API 경로: /boards/category/{category}/page
      let url = `${API_BASE_URL}/boards/category/${boardType}/page?page=${page}&size=${size}`;
      
      // ✅ 검색어가 있으면 searchType과 keyword 추가
      if (keyword && keyword.trim()) {
        url += `&searchType=${encodeURIComponent(searchType)}&keyword=${encodeURIComponent(keyword.trim())}`;
      }

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`게시글 로드 실패 (${res.status})`);

      const data = await res.json();
      
      // ✅ 백엔드 응답 형식에 맞춰 데이터 설정
      setPosts(data.content || []);
      setPaging({
        currentPage: data.currentPage || 0,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
      });
    } catch (e) {
      console.error("게시글 로드 오류:", e);
      alert("게시글을 불러오는 중 오류가 발생했습니다.");
      setPosts([]);
      setPaging({ currentPage: 0, totalPages: 0, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (boardType, page) => {
    if (boardType === "INFO") {
      loadBoardData("INFO", page, 10, postsSearch.type, postsSearch.keyword, setPosts, setPostsPaging);
    } else if (boardType === "NOTICE") {
      loadBoardData("NOTICE", page, 10, noticesSearch.type, noticesSearch.keyword, setNotices, setNoticesPaging);
    } else if (boardType === "QNA") {
      loadBoardData("QNA", page, 10, inquiriesSearch.type, inquiriesSearch.keyword, setInquiries, setInquiriesPaging);
    }
  };

  const handleSearchChange = (boardType, searchType, keyword) => {
    if (boardType === "INFO") {
      setPostsSearch({ type: searchType, keyword });
      loadBoardData("INFO", 0, 10, searchType, keyword, setPosts, setPostsPaging);
    } else if (boardType === "NOTICE") {
      setNoticesSearch({ type: searchType, keyword });
      loadBoardData("NOTICE", 0, 10, searchType, keyword, setNotices, setNoticesPaging);
    } else if (boardType === "QNA") {
      setInquiriesSearch({ type: searchType, keyword });
      loadBoardData("QNA", 0, 10, searchType, keyword, setInquiries, setInquiriesPaging);
    }
  };

  const handleCreatePost = async ({ title, content }) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      onGoLogin?.();
      return;
    }

    try {
      // ✅ 수정 모드인 경우
      if (editingPost && editingPost.id) {
        const res = await fetch(`${API_BASE_URL}/boards/${editingPost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ 
            title, 
            content,
            category: "INFO"
          }),
        });

        if (res.status === 401) {
          alert("로그인이 필요합니다.");
          onGoLogin?.();
          return;
        }

        if (!res.ok) throw new Error(`게시글 수정 실패 (${res.status})`);

        alert("게시글이 수정되었습니다.");
        setEditingPost(null);
        await loadBoardData("INFO", postsPaging.currentPage, 10, postsSearch.type, postsSearch.keyword, setPosts, setPostsPaging);
        setViewMode("infoBoard");
        return;
      }

      // ✅ 새 게시글 작성
      const res = await fetch(`${API_BASE_URL}/boards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          title, 
          content,
          category: "INFO"
        }),
      });

      if (res.status === 401) {
        alert("로그인이 필요합니다.");
        onGoLogin?.();
        return;
      }

      if (!res.ok) throw new Error(`게시글 작성 실패 (${res.status})`);

      alert("게시글이 등록되었습니다.");
      await loadBoardData("INFO", postsPaging.currentPage, 10, postsSearch.type, postsSearch.keyword, setPosts, setPostsPaging);
      setViewMode("infoBoard");
    } catch (e) {
      console.error("게시글 작성/수정 오류:", e);
      alert("게시글 작성/수정 중 오류가 발생했습니다.");
    }
  };

  const handleAddComment = async (postId, content) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      onGoLogin?.();
      return;
    }

    try {
      // ✅ 백엔드 API: POST /comments?boardId={boardId}&commentDto={content}
      const res = await fetch(
        `${API_BASE_URL}/comments?boardId=${postId}&commentDto=${encodeURIComponent(content)}`, 
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (res.status === 401) {
        alert("로그인이 필요합니다.");
        onGoLogin?.();
        return;
      }

      if (!res.ok) throw new Error(`댓글 추가 실패 (${res.status})`);

      alert("댓글이 등록되었습니다.");
      await loadBoardData("INFO", postsPaging.currentPage, 10, postsSearch.type, postsSearch.keyword, setPosts, setPostsPaging);
    } catch (e) {
      console.error("댓글 추가 오류:", e);
      alert("댓글 추가 중 오류가 발생했습니다.");
    }
  };

  // ✅ 게시판 목록만 새로고침 (댓글 작성은 하지 않음)
  const handleRefreshInfoBoard = () => {
    loadBoardData("INFO", postsPaging.currentPage, 10, postsSearch.type, postsSearch.keyword, setPosts, setPostsPaging);
  };

  const handleEditPost = (post, boardType) => {
    setEditingPost(post);
    if (boardType === "INFO") {
      setViewMode("writePost");
    } else if (boardType === "NOTICE") {
      setViewMode("noticeWrite");
    } else if (boardType === "QNA") {
      setViewMode("inquiryWrite");
    }
  };

  const handleDeleteBoard = async (boardType, postId, setPosts, setPaging) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      // ✅ 백엔드 API: DELETE /boards/{id}
      const res = await fetch(`${API_BASE_URL}/boards/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401) {
        alert("로그인이 필요합니다.");
        onGoLogin?.();
        return;
      }

      if (!res.ok) throw new Error(`게시글 삭제 실패 (${res.status})`);

      alert("삭제되었습니다.");

      if (boardType === "INFO") {
        await loadBoardData("INFO", postsPaging.currentPage, 10, postsSearch.type, postsSearch.keyword, setPosts, setPaging);
        setViewMode("infoBoard");
      } else if (boardType === "NOTICE") {
        await loadBoardData("NOTICE", noticesPaging.currentPage, 10, noticesSearch.type, noticesSearch.keyword, setPosts, setPaging);
        setViewMode("notice");
      } else if (boardType === "QNA") {
        await loadBoardData("QNA", inquiriesPaging.currentPage, 10, inquiriesSearch.type, inquiriesSearch.keyword, setPosts, setPaging);
        setViewMode("inquiryBoard");
      }
    } catch (e) {
      console.error("게시글 삭제 오류:", e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleSelectPost = (postOrId) => {
    // ✅ 객체가 전달된 경우 id 추출, 아니면 그대로 사용
    const id = typeof postOrId === 'object' ? postOrId.id : postOrId;
    setSelectedPostId(id);
    setViewMode("postDetail");
  };

  const handleSelectInquiry = (inquiryOrId) => {
    // ✅ 객체가 전달된 경우 id 추출, 아니면 그대로 사용
    const id = typeof inquiryOrId === 'object' ? inquiryOrId.id : inquiryOrId;
    setSelectedPostId(id);
    setViewMode("inquiryDetail");
  };

  const handleCreateNotice = async ({ title, content }) => {
    try {
      // ✅ 수정 모드인 경우
      if (editingPost && editingPost.id) {
        const res = await fetch(`${API_BASE_URL}/boards/${editingPost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ 
            title, 
            content,
            category: "NOTICE"
          }),
        });

        if (res.status === 401) {
          alert("로그인이 필요합니다.");
          onGoLogin?.();
          return;
        }

        if (!res.ok) throw new Error(`공지사항 수정 실패 (${res.status})`);

        alert("공지사항이 수정되었습니다.");
        setEditingPost(null);
        await loadBoardData("NOTICE", noticesPaging.currentPage, 10, noticesSearch.type, noticesSearch.keyword, setNotices, setNoticesPaging);
        setViewMode("notice");
        return;
      }

      // ✅ 새 공지사항 작성
      const res = await fetch(`${API_BASE_URL}/boards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          title, 
          content,
          category: "NOTICE"
        }),
      });

      if (res.status === 401) {
        alert("로그인이 필요합니다.");
        onGoLogin?.();
        return;
      }

      if (!res.ok) throw new Error(`공지사항 작성 실패 (${res.status})`);

      alert("공지사항이 등록되었습니다.");
      await loadBoardData("NOTICE", noticesPaging.currentPage, 10, noticesSearch.type, noticesSearch.keyword, setNotices, setNoticesPaging);
      setViewMode("notice");
    } catch (e) {
      console.error("공지사항 작성/수정 오류:", e);
      alert("공지사항 작성/수정 중 오류가 발생했습니다.");
    }
  };

  const handleCreateInquiry = async ({ title, content }) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      onGoLogin?.();
      return;
    }

    try {
      // ✅ 수정 모드인 경우
      if (editingPost && editingPost.id) {
        const res = await fetch(`${API_BASE_URL}/boards/${editingPost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ 
            title, 
            content,
            category: "QNA"
          }),
        });

        if (res.status === 401) {
          alert("로그인이 필요합니다.");
          onGoLogin?.();
          return;
        }

        if (!res.ok) throw new Error(`문의 수정 실패 (${res.status})`);

        alert("문의가 수정되었습니다.");
        setEditingPost(null);
        await loadBoardData("QNA", inquiriesPaging.currentPage, 10, inquiriesSearch.type, inquiriesSearch.keyword, setInquiries, setInquiriesPaging);
        setViewMode("inquiryBoard");
        return;
      }

      // ✅ 새 문의 작성
      const res = await fetch(`${API_BASE_URL}/boards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          title, 
          content,
          category: "QNA"
        }),
      });

      if (res.status === 401) {
        alert("로그인이 필요합니다.");
        onGoLogin?.();
        return;
      }

      if (!res.ok) throw new Error(`문의하기 작성 실패 (${res.status})`);

      alert("문의가 등록되었습니다.");
      await loadBoardData("QNA", inquiriesPaging.currentPage, 10, inquiriesSearch.type, inquiriesSearch.keyword, setInquiries, setInquiriesPaging);
      setViewMode("inquiryBoard");
    } catch (e) {
      console.error("문의하기 작성/수정 오류:", e);
      alert("문의하기 작성/수정 중 오류가 발생했습니다.");
    }
  };

  const handleAdminReply = async (inquiryId, replyText) => {
    alert("답변이 등록되었습니다.");
    await loadBoardData("QNA", inquiriesPaging.currentPage, 10, inquiriesSearch.type, inquiriesSearch.keyword, setInquiries, setInquiriesPaging);
    setViewMode("inquiryBoard");
  };

  const menuItems = useMemo(
    () => [
      { label: "소개글", href: "#", subItems: [{ label: "서비스 소개", href: "#" }] },
      { label: "병원/응급실 찾기", href: "#", subItems: [{ label: "실시간 검색", href: "#" }] },
      {
        label: "응급처치 요령",
        href: "#",
        subItems: [
          { label: "행동원칙", href: "#" },
          { label: "상황별 처치", href: "#" },
        ],
      },
      {
        label: "AED",
        href: "#",
        subItems: [
          { label: "AED 사용법", href: "#" },
          { label: "AED 사용설명 동영상", href: "#" },
        ],
      },
      {
        label: "게시판",
        href: "#",
        subItems: [
          { label: "정보공유 게시판", href: "#" },
          { label: "관리자 문의 게시판", href: "#" },
        ],
      },
      { label: "공지사항", href: "#", subItems: [{ label: "전체 공지", href: "#" }] },
    ],
    []
  );

  return (
    <div className="gl-page">
      <header className="gl-header">
        <div className="gl-header-inner">
          <Header
            user={user}
            onLogout={onLogout}
            onGoLogin={onGoLogin}
            onGoHome={() => {
              setViewMode("search");
              onGoHome?.();
            }}
            onOpenBookmark={() => setBookmarkOpen(true)}
          />
          <MegaMenu
            menuItems={menuItems}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            showMega={showMega}
            setShowMega={setShowMega}
            onMenuClick={handleMenuClick}
          />
        </div>
      </header>

      <Bookmark
        open={bookmarkOpen && !!user}
        onClose={() => setBookmarkOpen(false)}
        bookmarks={bookmarks}
        loading={bookmarkLoading}
        onRemove={removeBookmark}
      />

      {/* ✅ 응급 버튼 (props 없음! 자동으로 위치와 병원 검색) */}
      <EmergencyButton />

      {viewMode === "search" && (
        <SearchBar
          q={q}
          setQ={setQ}
          searchType={searchType}
          setSearchType={setSearchType}
          onSearch={handleSearch}
        />
      )}

      {viewMode === "search" ? (
        <main
          className={`gl-main ${!isFilterOpen ? "is-filter-closed" : ""} ${
            !isResultOpen ? "is-result-closed" : ""
          }`}
        >
          {isFilterOpen ? (
            <FilterView
              onlyOpen={onlyOpen}
              setOnlyOpen={setOnlyOpen}
              includeClothes={includeClothes}
              setIncludeClothes={setIncludeClothes}
              radiusKm={radiusKm}
              setRadiusKm={setRadiusKm}
              onReset={resetFilters}
              onClose={() => setIsFilterOpen(false)}
              onMoveToMyLocation={handleMoveToMyLocation}
              onShowAllHospitals={handleShowAllHospitals}
              onSearchByRadius={handleSearchByRadius}
            />
          ) : (
            <button
              className="gl-open-toggle-btn gl-toggle-filter"
              onClick={() => setIsFilterOpen(true)}
            >
              › 필터
            </button>
          )}

          <MapView
            ref={mapRef}
            onlyOpen={onlyOpen}
            includeClothes={includeClothes}
            radiusKm={radiusKm}
            onHospitalsLoaded={(list) => setHospitals(Array.isArray(list) ? list : [])}
            onLocationChange={setMyLocation}
          />

          {isResultOpen ? (
            <ResultView
              user={user}
              hospitals={resultList}
              sortMode={sortMode}
              onToggleSort={onToggleSort}
              isBookmarked={isBookmarked}
              onAddBookmark={addBookmark}
              onRemoveBookmark={removeBookmark}
              myLocation={myLocation}
            />
          ) : (
            <button
              className="gl-open-toggle-btn gl-toggle-result"
              onClick={() => setIsResultOpen(true)}
            >
              ‹ 추천결과
            </button>
          )}
        </main>
      ) : viewMode === "intro" ? (
        <IntroducePage />
      ) : viewMode === "notice" ? (
        <NoticePage
          notices={notices}
          paging={noticesPaging}
          isAdmin={user?.isAdmin}
          onWrite={() => {
            setEditingPost(null);
            setViewMode("noticeWrite");
          }}
          onSelectNotice={(id) => {
            setSelectedPostId(id);
            setEditingPost(null);
            setViewMode("noticeDetail");
          }}
          onSearch={(searchType, keyword) => handleSearchChange("NOTICE", searchType, keyword)}
          onPageChange={(page) => handlePageChange("NOTICE", page)}
        />
      ) : viewMode === "noticeWrite" ? (
        <NoticeBoardWritePostPage
          onBack={() => setViewMode("notice")}
          onCreateNotice={handleCreateNotice}
          editingPost={editingPost}
        />
      ) : viewMode === "noticeDetail" ? (
        <NoticeBoardDetailPage
          post={notices.find((n) => n.id === selectedPostId)}
          user={user}
          onBack={() => setViewMode("notice")}
          onEdit={(post) => handleEditPost(post, "NOTICE")}
          onDelete={(postId) => handleDeleteBoard("NOTICE", postId, setNotices, setNoticesPaging)}
        />
      ) : viewMode === "infoBoard" ? (
        <InfoBoardPage
          posts={posts}
          paging={postsPaging}
          loading={loading}
          onWrite={() => {
            if (!user) {
              alert("로그인이 필요합니다.");
              onGoLogin?.();
              return;
            }
            setEditingPost(null);
            setViewMode("writePost");
          }}
          onSelectPost={handleSelectPost}
          onSearch={(searchType, keyword) => handleSearchChange("INFO", searchType, keyword)}
          onPageChange={(page) => handlePageChange("INFO", page)}
        />
      ) : viewMode === "writePost" ? (
        <BoardWritePostPage
          onBack={() => setViewMode("infoBoard")}
          user={user}
          onCreatePost={handleCreatePost}
          editingPost={editingPost}
        />
      ) : viewMode === "postDetail" ? (
        <PostDetailPage
          post={posts.find((p) => p.id === selectedPostId)}
          user={user}
          onBack={() => setViewMode("infoBoard")}
          onRefreshBoard={handleRefreshInfoBoard}
          onEdit={(post) => handleEditPost(post, "INFO")}
          onDelete={(postId) => handleDeleteBoard("INFO", postId, setPosts, setPostsPaging)}
          onGoLogin={onGoLogin}
        />
      ) : viewMode === "inquiryBoard" ? (
        <InquiryBoardPage
          inquiries={inquiries}
          paging={inquiriesPaging}
          onWrite={() => {
            if (!user) {
              alert("문의하기는 로그인 후 가능합니다.");
              onGoLogin?.();
              return;
            }
            setEditingPost(null);
            setViewMode("inquiryWrite");
          }}
          onSelectInquiry={handleSelectInquiry}
          onSearch={(searchType, keyword) => handleSearchChange("QNA", searchType, keyword)}
          onPageChange={(page) => handlePageChange("QNA", page)}
        />
      ) : viewMode === "inquiryWrite" ? (
        <InquiryBoardWritePostPage
          onBack={() => setViewMode("inquiryBoard")}
          user={user}
          onCreateInquiry={handleCreateInquiry}
          editingPost={editingPost}
        />
      ) : viewMode === "inquiryDetail" ? (
        <InquiryPostDetailPage
          post={inquiries.find((i) => i.id === selectedPostId)}
          user={user}
          onBack={() => setViewMode("inquiryBoard")}
          onAdminReply={handleAdminReply}
          onEdit={(post) => handleEditPost(post, "QNA")}
          onDelete={(postId) => handleDeleteBoard("QNA", postId, setInquiries, setInquiriesPaging)}
        />
      ) : viewMode === "principles" ? (
        <EmergencyPrinciplesPage />
      ) : viewMode === "aedGuide" ? (
        <AEDGuidePage />
      ) : viewMode === "aedVideo" ? (
        <AEDVideoPage />
      ) : (
        <SituationFirstAidPage />
      )}
    </div>
  );
}