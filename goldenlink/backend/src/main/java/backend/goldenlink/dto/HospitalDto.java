package backend.goldenlink.dto;

public class HospitalDto {

    private String hid;      // ✅ 병원 고유 ID
    private String hname;    // 병원명
    private String haddress; // 주소
    private String htel;     // 전화번호
    private Double hlat;     // 위도
    private Double hlon;     // 경도
    private Double distance; // ✅ 거리 (km) - 응급 버튼용

    // 기본 생성자
    public HospitalDto() {
    }

    // ✅ 전체 생성자 (hid 포함)
    public HospitalDto(String hid, String hname, String haddress, String htel, Double hlat, Double hlon) {
        this.hid = hid;
        this.hname = hname;
        this.haddress = haddress;
        this.htel = htel;
        this.hlat = hlat;
        this.hlon = hlon;
    }

    // ✅ 기존 생성자 (hid 없이) - 하위 호환성 유지
    public HospitalDto(String hname, String haddress, String htel, Double hlat, Double hlon) {
        this.hname = hname;
        this.haddress = haddress;
        this.htel = htel;
        this.hlat = hlat;
        this.hlon = hlon;
    }

    // ✅ Getter & Setter - hid
    public String getHid() {
        return hid;
    }

    public void setHid(String hid) {
        this.hid = hid;
    }

    // Getter & Setter - hname
    public String getHname() {
        return hname;
    }

    public void setHname(String hname) {
        this.hname = hname;
    }

    // Getter & Setter - haddress
    public String getHaddress() {
        return haddress;
    }

    public void setHaddress(String haddress) {
        this.haddress = haddress;
    }

    // Getter & Setter - htel
    public String getHtel() {
        return htel;
    }

    public void setHtel(String htel) {
        this.htel = htel;
    }

    // Getter & Setter - hlat
    public Double getHlat() {
        return hlat;
    }

    public void setHlat(Double hlat) {
        this.hlat = hlat;
    }

    // Getter & Setter - hlon
    public Double getHlon() {
        return hlon;
    }

    public void setHlon(Double hlon) {
        this.hlon = hlon;
    }

    // ✅ Getter & Setter - distance (응급 버튼용)
    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    @Override
    public String toString() {
        return "HospitalDto [hid=" + hid + ", hname=" + hname + ", haddress=" + haddress 
                + ", htel=" + htel + ", hlat=" + hlat + ", hlon=" + hlon 
                + ", distance=" + distance + "]";
    }
}