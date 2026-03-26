import React from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import "./SearchBar.css";

export default function SearchBar({ q, setQ, searchType, setSearchType, onSearch }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch && onSearch();
    }
  };

  return (
    <section className="gl-searchBarWrap">
      <div className="gl-searchBar">
        {/* 왼쪽 셀렉트 박스 영역 */}
        <select 
          className="gl-searchSelect"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="all">전체</option>
          <option value="name">병원명</option>
          <option value="address">주소</option>
        </select>
        
        {/* 중앙 구분선 */}
        <div className="gl-searchDivider" />
        
        {/* 오른쪽 입력 영역 */}
        <div className="gl-searchInputInner">
          <FaMagnifyingGlass className="gl-searchIcon" />
          <input
            className="gl-searchInput"
            placeholder={
              searchType === "name" ? "병원명 검색" :
              searchType === "address" ? "주소 검색" :
              "병원명/주소 검색"
            }
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </section>
  );
}