package backend.goldenlink.dto;

import backend.goldenlink.entity.Board; // Entity를 참조함
import java.time.LocalDateTime;

public class BoardDTO {
    private Long id;
    private String category;
    private String title;
    private String content;
    private LocalDateTime createdAt;

    // 중요: EntityUser 객체 대신, 필요한 정보(작성자 이름 등)만 담습니다
    private String userName;

    public BoardDTO() {}

    // Entity를 DTO로 변환하는 생성자 (가장 많이 쓰는 방식)
    public BoardDTO(Board board) {
        this.id = board.getId();
        this.category = board.getCategory();
        this.title = board.getTitle();
        this.content = board.getContent();
        this.createdAt = board.getCreatedAt();
        // 유저 객체에서 이름만 쏙 뽑아옵니다
        this.userName = (board.getUser() != null) ? board.getUser().getName() : "익명";
    }

    // 화면 컨트롤을 위한 Getter/Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}