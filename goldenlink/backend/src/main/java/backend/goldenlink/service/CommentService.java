package backend.goldenlink.service;

import backend.goldenlink.entity.Board;
import backend.goldenlink.entity.Comment;
import backend.goldenlink.entity.EntityUser;
import backend.goldenlink.repository.BoardRepository;
import backend.goldenlink.repository.CommentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)  // ✅ 조회는 readOnly
public class CommentService {

    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository,
                          BoardRepository boardRepository) {
        this.commentRepository = commentRepository;
        this.boardRepository = boardRepository;
    }

    // ✅ 댓글 작성
    @Transactional  // 쓰기 작업
    public Comment createComment(Long boardId, EntityUser loginUser, String content) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));

        // 1. 권한 체크 로직
        String category = board.getCategory(); // INFO, QNA, NOTICE 등

        // ✅ 정보공유(INFO)가 아니면서 관리자가 아닌 경우 차단 (대소문자 무시)
        if (!"INFO".equals(category) && !"admin".equalsIgnoreCase(loginUser.getRole())) {
            throw new RuntimeException("이 게시판은 관리자만 댓글을 작성할 수 있습니다.");
        }

        Comment comment = new Comment();
        comment.setBoard(board);
        comment.setUser(loginUser);
        comment.setContent(content);

        return commentRepository.save(comment);
    }

    // ✅ 게시글 댓글 조회 (LAZY 로딩 강제 초기화)
    public List<Comment> getCommentsByBoardId(Long boardId) {
        List<Comment> comments = commentRepository.findByBoardId(boardId);
        // LAZY 로딩 강제 초기화
        comments.forEach(comment -> {
            comment.getUser().getName();  // user 초기화
            comment.getBoard().getId();   // board 초기화
        });
        return comments;
    }

    // ✅ 댓글 수정
    @Transactional
    public Comment updateComment(Long commentId, EntityUser loginUser, String content) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글이 존재하지 않습니다."));

        // 권한 체크 (대소문자 무시)
        boolean isOwner = comment.getUser().getId().equals(loginUser.getId());
        boolean isAdmin = "admin".equalsIgnoreCase(loginUser.getRole());

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("수정 권한이 없습니다. (작성자 또는 관리자만 가능)");
        }

        comment.setContent(content);
        return commentRepository.save(comment);
    }

    // ✅ 댓글 삭제
    @Transactional
    public void deleteComment(Long commentId, EntityUser loginUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글이 존재하지 않습니다."));

        // 권한 체크 (대소문자 무시)
        boolean isOwner = comment.getUser().getId().equals(loginUser.getId());
        boolean isAdmin = "admin".equalsIgnoreCase(loginUser.getRole());

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        commentRepository.delete(comment);
    }
}