package backend.goldenlink.dto;

public class BookmarkDTO {
    
    private Long id;
    private String hid;
    private String hname;
    private String haddress;
    private String htel;
    private Double hlat;
    private Double hlon;
    private Double distance;
    private String createdAt;

    // 기본 생성자
    public BookmarkDTO() {
    }

    // 전체 생성자
    public BookmarkDTO(Long id, String hid, String hname, String haddress, 
                       String htel, Double hlat, Double hlon, Double distance, String createdAt) {
        this.id = id;
        this.hid = hid;
        this.hname = hname;
        this.haddress = haddress;
        this.htel = htel;
        this.hlat = hlat;
        this.hlon = hlon;
        this.distance = distance;
        this.createdAt = createdAt;
    }

    // Getter & Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHid() {
        return hid;
    }

    public void setHid(String hid) {
        this.hid = hid;
    }

    public String getHname() {
        return hname;
    }

    public void setHname(String hname) {
        this.hname = hname;
    }

    public String getHaddress() {
        return haddress;
    }

    public void setHaddress(String haddress) {
        this.haddress = haddress;
    }

    public String getHtel() {
        return htel;
    }

    public void setHtel(String htel) {
        this.htel = htel;
    }

    public Double getHlat() {
        return hlat;
    }

    public void setHlat(Double hlat) {
        this.hlat = hlat;
    }

    public Double getHlon() {
        return hlon;
    }

    public void setHlon(Double hlon) {
        this.hlon = hlon;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "BookmarkDTO [id=" + id + ", hid=" + hid + ", hname=" + hname + 
               ", haddress=" + haddress + ", htel=" + htel + ", distance=" + distance + "]";
    }
}