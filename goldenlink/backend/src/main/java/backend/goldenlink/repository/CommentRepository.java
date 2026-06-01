package backend.goldenlink.repository;

import backend.goldenlink.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // ✅ 특정 게시글의 댓글 목록 조회 (최신순)
    @Query("SELECT c FROM Comment c WHERE c.board.id = :boardId ORDER BY c.createdAt DESC")
    List<Comment> findByBoardId(@Param("boardId") Long boardId);
}