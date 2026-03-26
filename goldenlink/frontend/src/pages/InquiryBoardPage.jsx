import React, { useState, useEffect, useRef } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { HiOutlineLockClosed } from "react-icons/hi2";
import "./InquiryBoardPage.css";

export default function InquiryBoardPage({ inquiries, paging, onWrite, onSelectInquiry, onSearch, onPageChange }) {
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
    <div className="gl-inquiry-board-page">
      <header className="gl-board-header">
        <h2>관리자 문의 게시판</h2>
        <p>궁금한 점을 문의해주세요</p>
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
              placeholder="문의사항 검색..."
              className="gl-search-input"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>

        <button className="gl-board-write-btn" onClick={onWrite}>
          문의하기
        </button>
      </div>

      <div className="gl-board-table-card">
        <table className="gl-board-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>번호</th>
              <th style={{ width: "100px" }}>상태</th>
              <th>제목</th>
              <th style={{ width: "120px" }}>작성자</th>
              <th style={{ width: "100px" }}>날짜</th>
            </tr>
          </thead>

          <tbody>
            {inquiries && inquiries.length > 0 ? (
              inquiries.map((q, index) => {
                // ✅ status 계산: commentCount가 0보다 크면 "완료", 그렇지 않으면 "대기"
                const status = (q.commentCount && q.commentCount > 0) ? "완료" : "대기";
                
                return (
                  <tr key={q.id} onClick={() => onSelectInquiry(q.id)}>
                    <td className="gl-td-no">
                      {paging ? paging.totalElements - (paging.currentPage * 10) - index : q.id}
                    </td>

                    <td className="gl-td-status">
                      <span className={`gl-status-badge ${status === "완료" ? "is-complete" : "is-waiting"}`}>
                        {status}
                      </span>
                    </td>

                    <td className="gl-td-title">
                      {q.isPrivate && <HiOutlineLockClosed className="gl-lock-icon" />}
                      <span className="gl-title-text">{q.title}</span>
                      {q.commentCount > 0 && (
                        <span className="gl-comment-count-text">
                          {` (${q.commentCount})`}
                        </span>
                      )}
                    </td>

                    <td className="gl-td-author">{q.author}</td>
                    <td className="gl-td-date">{formatDate(q.createdAt)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                  {searchKeyword ? "검색 결과가 없습니다." : "등록된 문의가 없습니다."}
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
          `전체 ${paging.totalElements}개의 문의 | 현재 ${paging.currentPage + 1} / ${paging.totalPages || 1} 페이지`
        ) : (
          `전체 ${inquiries?.length || 0}개의 문의`
        )}
      </footer>
    </div>
  );
}