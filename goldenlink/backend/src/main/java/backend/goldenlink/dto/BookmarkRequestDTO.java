package backend.goldenlink.dto;

public class BookmarkRequestDTO {
    
    private String hid;
    private String hname;
    private String haddress;
    private String htel;
    private Double hlat;
    private Double hlon;
    private Double distance;

    // 기본 생성자
    public BookmarkRequestDTO() {
    }

    // Getter & Setter
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

    @Override
    public String toString() {
        return "BookmarkRequestDTO [hid=" + hid + ", hname=" + hname + 
               ", haddress=" + haddress + ", htel=" + htel + ", distance=" + distance + "]";
    }
}