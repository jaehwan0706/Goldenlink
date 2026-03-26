package backend.goldenlink.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "boards")
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 작성자 (users 테이블과 연결)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid", nullable = false)
    private EntityUser user;

    // 게시판 종류 (INFO, QNA, NOTICE)
    @Column(nullable = false, length = 20)
    private String category;

    // 제목
    @Column(nullable = false, length = 255)
    private String title;

    // 본문
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // ✅ 생성일 - JSON 직렬화 형식 지정
    @Column(name = "createdAt")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    // ✅ 댓글 컬렉션 (JSON 직렬화에서 제외)
    @OneToMany(mappedBy = "board", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<backend.goldenlink.entity.Comment> comments;

    // 생성일 자동 설정
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // 기본 생성자 (필수)
    public Board() {

    }

    // 생성자
    public Board(EntityUser user, String category, String title, String content) {
        this.user = user;
        this.category = category;
        this.title = title;
        this.content = content;
    }

    // getter setter

    public Long getId() {
        return id;
    }

    // 프론트에서 작성자/조회수 필드만 필요하므로, user 객체(비밀번호 등)를 그대로 노출하지 않게 처리
    @JsonIgnore
    public EntityUser getUser() {
        return user;
    }

    // ✅ 작성자 ID 반환 (권한 체크용)
    @JsonProperty("userId")
    public String getUserId() {
        if (user == null) return null;
        return user.getUserid();
    }

    // ✅ 작성자 이름 표시
    @JsonProperty("author")
    public String getAuthor() {
        if (user == null) return "";
        return (user.getName() != null && !user.getName().isEmpty()) 
            ? user.getName() 
            : user.getUserid();
    }

    // 프론트에서 기대하는 키(views/likes)
    @JsonProperty("views")
    public int getViews() {
        return 0;
    }

    @JsonProperty("likes")
    public int getLikes() {
        return 0;
    }

    // ✅ 댓글 개수 반환 (DB 컬럼 추가 없이)
    @JsonProperty("commentCount")
    public int getCommentCount() {
        if (comments == null) return 0;
        try {
            return comments.size();
        } catch (Exception e) {
            // LAZY 로딩 실패 시 0 반환
            return 0;
        }
    }

    // ✅ 상단 고정 여부 - DB 컬럼 없이 제목으로 판단
    @JsonProperty("isPinned")
    public Boolean getIsPinned() {
        if (title == null) return false;
        // 제목에 [공지], [필독], [중요] 등이 있으면 상단 고정
        return title.contains("[공지]") || 
               title.contains("[필독]") || 
               title.contains("[중요]");
    }

    public void setUser(EntityUser user) {
        this.user = user;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @JsonIgnore
    public List<backend.goldenlink.entity.Comment> getComments() {
        return comments;
    }

    public void setComments(List<backend.goldenlink.entity.Comment> comments) {
        this.comments = comments;
    }
}