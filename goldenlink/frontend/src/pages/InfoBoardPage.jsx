import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import "./InfoBoardPage.css";

export default function InfoBoardPage({ posts, paging, loading, onWrite, onSelectPost, onSearch, onPageChange }) {
  const [searchType, setSearchType] = useState("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [prevKeyword, setPrevKeyword] = useState(""); // 이전 검색어 추적
  const searchTimeoutRef = useRef(null);

  // ✅ 날짜 형식 변환 함수
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  };

  // ✅ 검색어 입력 시 debounce (버벅임 개선)
  useEffect(() => {
    // 이전 타이머 취소
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 검색어가 변경되지 않았으면 API 호출 안 함
    if (searchKeyword === prevKeyword) {
      return;
    }

    // 검색어가 비어있고 이전에도 비어있었으면 API 호출 안 함
    if (searchKeyword === "" && prevKeyword === "") {
      return;
    }

    // 700ms 후 검색 (이전 500ms → 700ms로 증가)
    searchTimeoutRef.current = setTimeout(() => {
      setPrevKeyword(searchKeyword);
      onSearch(searchType, searchKeyword);
    }, 700);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchKeyword, searchType, prevKeyword, onSearch]); // ✅ dependency 추가

  // ✅ 검색 타입 변경 시 즉시 검색
  const handleSearchTypeChange = (newType) => {
    setSearchType(newType);
    if (searchKeyword) {
      setPrevKeyword(""); // 즉시 검색하도록
    }
  };

  // ✅ 페이지 번호 생성 (1, 2, 3, 4, 5 형식)
  const renderPageNumbers = () => {
    if (!paging || paging.totalPages === 0) return null;

    const pages = [];
    const maxPageButtons = 5;
    let startPage = Math.max(0, paging.currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(paging.totalPages - 1, startPage + maxPageButtons - 1);

    if (endPage - startPage < maxPageButtons - 1) {
      startPage = Math.max(0, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`gl-page-btn ${paging.currentPage === i ? "active" : ""}`}
          onClick={() => onPageChange(i)}
        >
          {i + 1}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="gl-info-board-page">
      {/* ✅ 상단 제목 영역 - 중앙 정렬 */}
      <header className="gl-board-header">
        <h2>정보공유 게시판</h2>
        <p>유용한 병원 정보를 공유해주세요</p>
      </header>

      {/* ✅ 검색창 및 글쓰기 버튼 */}
      <div className="gl-board-controls">
        <div className="gl-board-search-bar">
          <select 
            className="gl-search-select"
            value={searchType}
            onChange={(e) => handleSearchTypeChange(e.target.value)}
          >
            <option>전체</option>
            <option>제목</option>
            <option>작성자</option>
          </select>
          
          <div className="gl-search-divider" />
          
          <div className="gl-search-input-wrapper">
            <FaMagnifyingGlass className="gl-search-icon" />
            <input
              type="text"
              placeholder="게시글 검색..."
              className="gl-search-input"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>

        <button className="gl-board-write-btn" onClick={onWrite}>
          글쓰기
        </button>
      </div>

      {/* ✅ 게시판 테이블 영역 */}
      <div className="gl-board-table-card">
        <table className="gl-board-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>번호</th>
              <th>제목</th>
              <th style={{ width: "120px" }}>작성자</th>
              <th style={{ width: "120px" }}>날짜</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                  게시글을 불러오는 중...
                </td>
              </tr>
            ) : posts && posts.length > 0 ? (
              posts.map((p, index) => (
                <tr key={p.id}>
                  <td className="gl-td-no">
                    {paging ? paging.totalElements - (paging.currentPage * 10) - index : p.id}
                  </td>

                  <td className="gl-td-title" onClick={() => onSelectPost(p)}>
                    <span className="gl-title-text">{p.title}</span>
                    {p.commentCount > 0 && (
                      <span className="gl-comment-count-text">
                        {` (${p.commentCount})`}
                      </span>
                    )}
                  </td>

                  <td className="gl-td-author">{p.author}</td>
                  <td className="gl-td-date">{formatDate(p.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{ padding: "40px", textAlign: "center", color: "#999" }}
                >
                  {searchKeyword ? "검색 결과가 없습니다." : "등록된 게시글이 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ 페이지네이션 */}
      {paging && paging.totalPages > 0 && (
        <div className="gl-pagination">
          <button
            className="gl-page-btn"
            disabled={paging.currentPage === 0}
            onClick={() => onPageChange(paging.currentPage - 1)}
          >
            이전
          </button>

          {renderPageNumbers()}

          <button
            className="gl-page-btn"
            disabled={paging.currentPage >= paging.totalPages - 1}
            onClick={() => onPageChange(paging.currentPage + 1)}
          >
            다음
          </button>
        </div>
      )}

      <footer className="gl-board-footer">
        {paging ? (
          `전체 ${paging.totalElements}개의 게시글 | 현재 ${paging.currentPage + 1} / ${paging.totalPages || 1} 페이지`
        ) : (
          `전체 ${posts?.length || 0}개의 게시글`
        )}
      </footer>
    </div>
  );
}