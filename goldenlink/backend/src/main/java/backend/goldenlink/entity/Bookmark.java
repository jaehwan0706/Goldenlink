package backend.goldenlink.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "bookmarks")
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ✅ DB 스키마와 일치해야 함
     * - DB 컬럼명: userid
     * - FK: bookmarks.userid -> entity_user.id
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userid", nullable = false) // 🔥 user_id -> userid 로 수정
    private EntityUser user;

    @Column(name = "hid", nullable = false, length = 255)
    private String hid; // 병원 ID

    @Column(name = "hname", nullable = false, length = 255)
    private String hname; // 병원 이름

    @Column(name = "haddress", length = 500)
    private String haddress; // 병원 주소

    @Column(name = "htel", length = 50)
    private String htel; // 병원 전화번호

    @Column(name = "hlat")
    private Double hlat; // 위도

    @Column(name = "hlon")
    private Double hlon; // 경도

    @Column(name = "distance")
    private Double distance; // 거리 (km)

    /**
     * ✅ created_at 컬럼과 매핑
     * - 네 schema.sql에서 DEFAULT CURRENT_TIMESTAMP 쓰면
     *   insertable=false, updatable=false 로 DB에 맡기는 방식이 가장 안전함
     * - 너는 @PrePersist로 직접 넣고 있었는데,
     *   둘 중 하나로 통일해야 혼선이 없음.
     */
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        // ✅ 기존 로직 유지 (원하면 DB DEFAULT로 맡기는 방식으로 바꿀 수 있음)
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // 기본 생성자
    public Bookmark() {}

    // 전체 생성자
    public Bookmark(
            EntityUser user,
            String hid,
            String hname,
            String haddress,
            String htel,
            Double hlat,
            Double hlon,
            Double distance
    ) {
        this.user = user;
        this.hid = hid;
        this.hname = hname;
        this.haddress = haddress;
        this.htel = htel;
        this.hlat = hlat;
        this.hlon = hlon;
        this.distance = distance;
    }

    // Getter & Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public EntityUser getUser() { return user; }
    public void setUser(EntityUser user) { this.user = user; }

    public String getHid() { return hid; }
    public void setHid(String hid) { this.hid = hid; }

    public String getHname() { return hname; }
    public void setHname(String hname) { this.hname = hname; }

    public String getHaddress() { return haddress; }
    public void setHaddress(String haddress) { this.haddress = haddress; }

    public String getHtel() { return htel; }
    public void setHtel(String htel) { this.htel = htel; }

    public Double getHlat() { return hlat; }
    public void setHlat(Double hlat) { this.hlat = hlat; }

    public Double getHlon() { return hlon; }
    public void setHlon(Double hlon) { this.hlon = hlon; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public String toString() {
        return "Bookmark [id=" + id +
                ", hid=" + hid +
                ", hname=" + hname +
                ", haddress=" + haddress +
                ", htel=" + htel +
                ", distance=" + distance + "]";
    }
}
