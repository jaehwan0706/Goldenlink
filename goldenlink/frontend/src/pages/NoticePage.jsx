import React, { useState, useEffect, useRef } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { TiPin } from "react-icons/ti";
import "./NoticePage.css";

export default function NoticePage({ notices, paging, isAdmin, onWrite, onSelectNotice, onSearch, onPageChange }) {
  const [searchType, setSearchType] = useState("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [prevKeyword, setPrevKeyword] = useState("");
  const searchTimeoutRef = useRef(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  };

  // ✅ 검색어 입력 시 debounce (버벅임 개선)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchKeyword === prevKeyword) {
      return;
    }

    if (searchKeyword === "" && prevKeyword === "") {
      return;
    }

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

  const handleSearchTypeChange = (newType) => {
    setSearchType(newType);
    if (searchKeyword) {
      setPrevKeyword("");
    }
  };

  // ✅ 공지사항 정렬 (isPinned 상단 고정, 각 그룹 내에서는 최신순 유지)
  const sortedNotices = React.useMemo(() => {
    if (!notices) return [];
    
    // 백엔드에서 이미 최신순(id DESC)으로 정렬되어 옴
    // pinned와 normal로 나누되, 각 그룹 내에서는 순서 유지
    const pinned = notices.filter(n => n.isPinned);
    const normal = notices.filter(n => !n.isPinned);
    
    return [...pinned, ...normal];
  }, [notices]);

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
    <div className="gl-notice-page">
      <header className="gl-board-header">
        <h2>공지사항</h2>
        <p>중요한 안내사항을 확인하세요</p>
      </header>

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
              placeholder="공지사항 검색..."
              className="gl-search-input"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>

        {isAdmin && (
          <button className="gl-board-write-btn" onClick={onWrite}>
            공지 작성
          </button>
        )}
      </div>

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
            {sortedNotices && sortedNotices.length > 0 ? (
              sortedNotices.map((n, index) => {
                // ✅ 고정 게시글은 번호 대신 핀 아이콘
                // 일반 게시글은 전체 개수에서 현재 인덱스를 뺀 번호
                const displayNumber = n.isPinned 
                  ? null 
                  : (paging ? paging.totalElements - (paging.currentPage * 10) - index : n.id);
                
                return (
                  <tr 
                    key={n.id}
                    className={n.isPinned ? "is-pinned" : ""}
                    onClick={() => onSelectNotice(n.id)}
                  >
                    <td className="gl-td-no">
                      {n.isPinned ? (
                        <TiPin className="gl-pin-icon" />
                      ) : (
                        displayNumber
                      )}
                    </td>

                    <td className="gl-td-title">
                      {n.isPinned && (
                        <span className="gl-notice-tag">[공지]</span>
                      )}
                      <span className="gl-title-text">{n.title}</span>
                      {n.commentCount > 0 && (
                        <span className="gl-comment-count-text">
                          {` (${n.commentCount})`}
                        </span>
                      )}
                    </td>

                    <td className="gl-td-author">{n.author}</td>
                    <td className="gl-td-date">{formatDate(n.createdAt)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                  {searchKeyword ? "검색 결과가 없습니다." : "등록된 공지사항이 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
          `전체 ${paging.totalElements}개의 공지 | 현재 ${paging.currentPage + 1} / ${paging.totalPages || 1} 페이지`
        ) : (
          `전체 ${notices?.length || 0}개의 공지`
        )}
      </footer>
    </div>
  );
}