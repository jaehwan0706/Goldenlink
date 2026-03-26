package backend.goldenlink.dto;

public class FindpwDTO {
    private String userid;
    private String name;
    private String phone;

    public FindpwDTO() {
    }
    public FindpwDTO(String userid, String name, String phone) {
        this.userid = userid;
        this.name = name;
        this.phone = phone;
    }
    public String getUserid() {
        return userid;
    }
    public void setUserid(String userid) {
        this.userid = userid;
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
}