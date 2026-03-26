package backend.goldenlink.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "EntityUser") // ✅ DB 테이블명과 1:1로 고정
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class EntityUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String userid;

    @JsonIgnore // ✅ 응답으로 비번 노출 방지(필수)
    private String userpw;

    private String name;
    private String phone;
    private String email;
    private String role = "user";

    @Column(nullable = true)
    private String address;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // 순환 참조 방지 (Board 조회 시 User가 나오고, 다시 Board가 나오는 루프 차단)
    private List<Board> boards = new ArrayList<>();

    // ✅ 사용자가 작성한 댓글 목록 (1:N 관계 추가)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Comment> comments = new ArrayList<>();

    public EntityUser() {
    }

    public EntityUser(Long id, String userid, String userpw, String name, String phone, String email, String address,
            String role) {
        this.id = id;
        this.userid = userid;
        this.userpw = userpw;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.role = (role == null || role.isEmpty()) ? "user" : role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserid() {
        return userid;
    }

    public void setUserid(String userid) {
        this.userid = userid;
    }

    public String getUserpw() {
        return userpw;
    }

    public void setUserpw(String userpw) {
        this.userpw = userpw;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // ✅ Optional로 반환하면 JSON/프론트에서 골치아픔 → String
    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<Board> getBoards() {
        return boards;
    }

    public void setBoards(List<Board> boards) {
        this.boards = boards;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    @Override
    public String toString() {
        return "EntityUser [id=" + id + ", userid=" + userid + ", name=" + name + ", phone="
                + phone + ", email=" + email + ", address=" + address + ", role=" + role + "]";
    }
}
