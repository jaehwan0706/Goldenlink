package backend.goldenlink.repository;

import backend.goldenlink.entity.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {

    // ========== 기존 메서드 (페이징 없음) - 최신순 정렬 ==========
    
    // 전체 게시글 조회 (최신순: id DESC)
    List<Board> findAllByOrderByIdDesc();

    // 카테고리별 조회 (최신순: id DESC)
    List<Board> findByCategoryOrderByIdDesc(String category);

    // 제목 검색
    List<Board> findByTitleContaining(String keyword);

    // ========== 페이징 메서드 - 최신순 정렬 ==========
    
    // 전체 게시글 조회 (페이징, 최신순)
    Page<Board> findAllByOrderByIdDesc(Pageable pageable);

    // 카테고리별 조회 (페이징, 최신순)
    Page<Board> findByCategoryOrderByIdDesc(String category, Pageable pageable);

    // 제목 검색 (페이징)
    Page<Board> findByTitleContainingOrderByIdDesc(String keyword, Pageable pageable);

    // ========== ✅ 부분 검색 쿼리 (대소문자 무시) ==========
    
    // 1. 카테고리 + 제목 검색 (페이징, 대소문자 무시)
    @Query("SELECT b FROM Board b WHERE b.category = :category AND LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY b.id DESC")
    Page<Board> searchByTitle(@Param("category") String category, @Param("keyword") String keyword, Pageable pageable);

    // 2. 카테고리 + 작성자 검색 (페이징, 대소문자 무시)
    @Query("SELECT b FROM Board b JOIN b.user u WHERE b.category = :category AND LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY b.id DESC")
    Page<Board> searchByAuthor(@Param("category") String category, @Param("keyword") String keyword, Pageable pageable);

    // 3. 카테고리 + 전체 검색 (제목 + 내용 + 작성자) (페이징, 대소문자 무시)
    @Query("SELECT b FROM Board b JOIN b.user u WHERE b.category = :category AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY b.id DESC")
    Page<Board> searchAll(@Param("category") String category, @Param("keyword") String keyword, Pageable pageable);
}