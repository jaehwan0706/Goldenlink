package backend.goldenlink.dto;

import backend.goldenlink.entity.Comment; // 엔티티 참조
import java.time.LocalDateTime;

public class CommentDTO {
    private Long id;
    private String content;
    private String userName;   // 작성자 이름 (EntityUser 전체 대신 사용)
    private Long boardId;      // 어떤 게시글의 댓글인지 ID만 보관
    private LocalDateTime createdAt;

    // 기본 생성자
    public CommentDTO() {}

    // Entity를 DTO로 변환하는 생성자 (가장 안전하고 깔끔한 방식)
    public CommentDTO(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt();

        // 유저 객체에서 이름만 추출하여 보안 유지
        if (comment.getUser() != null) {
            this.userName = comment.getUser().getName();
        }

        // 게시글 객체 전체 대신 ID만 추출
        if (comment.getBoard() != null) {
            this.boardId = comment.getBoard().getId();
        }
    }

    // Getter / Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public Long getBoardId() { return boardId; }
    public void setBoardId(Long boardId) { this.boardId = boardId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}