package backend.goldenlink.dto;

public class UserLoginDTO {
    private String userid;
    private String userpw;

    public UserLoginDTO() {
    }

    public UserLoginDTO(String userid, String userpw) {
        this.userid = userid;
        this.userpw = userpw;
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

    @Override
    public String toString() {
        return "UserLoginDTO [userid=" + userid + ", userpw=" + userpw + "]";
    }
}
