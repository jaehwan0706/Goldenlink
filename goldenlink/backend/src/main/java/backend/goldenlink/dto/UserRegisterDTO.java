package backend.goldenlink.dto;

public class UserRegisterDTO {
    private String userid;
    private String userpw;
    private String name;
    private String phone;
    private String email;
    private String address;
    // private String role;

    public UserRegisterDTO() {
    }
    public UserRegisterDTO(String userid, String userpw, String name, String phone, String email, String address,
            String role) {
        this.userid = userid;
        this.userpw = userpw;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.address = address;
        // this.role = role;
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
    public String getAddress() {
        return address;
    }
    public void setAddress(String address) {
        this.address = address;
    }
    // public String getRole() {
    //     return role;
    // }
    // public void setRole(String role) {
    //     this.role = role;
    // }
    @Override
    public String toString() {
        return "UserRegisterDTO [userid=" + userid + ", userpw=" + userpw + ", name=" + name + ", phone=" + phone
                + ", email=" + email + ", address=" + address +"]";
    }
    
}
