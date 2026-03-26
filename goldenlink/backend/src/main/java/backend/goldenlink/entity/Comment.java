package backend.goldenlink.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // ✅ 작성자 (로그인한 사용자만 작성 가능)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "userid", nullable = false)
    @JsonIgnore  // 순환 참조 방지
    private EntityUser user;

    // ✅ 게시글
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "boardid", nullable = false)
    @JsonIgnore  // 순환 참조 방지
    private Board board;

    // ✅ 생성일 - JSON 직렬화 형식 지정
    @Column(name = "createdAt", nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public Comment() {}

    public Comment(EntityUser user, Board board, String content) {
        this.user = user;
        this.board = board;
        this.content = content;
    }

    public Long getId() { 
        return id; 
    }

    public String getContent() { 
        return content; 
    }
    
    public void setContent(String content) { 
        this.content = content; 
    }

    @JsonIgnore
    public EntityUser getUser() { 
        return user; 
    }
    
    public void setUser(EntityUser user) { 
        this.user = user; 
    }

    @JsonIgnore
    public Board getBoard() { 
        return board; 
    }
    
    public void setBoard(Board board) { 
        this.board = board; 
    }

    public LocalDateTime getCreatedAt() { 
        return createdAt; 
    }

    // ✅ 로그인한 사용자의 이름만 표시 (익명 없음)
    @JsonProperty("author")
    public String getAuthor() {
        if (user == null) return "";
        // 실명(name)이 있으면 실명, 없으면 아이디(userid) 표시
        return (user.getName() != null && !user.getName().isEmpty()) 
            ? user.getName() 
            : user.getUserid();
    }

    // ✅ 프론트에서 기대하는 boardId 필드
    @JsonProperty("boardId")
    public Long getBoardId() {
        return board != null ? board.getId() : null;
    }
}