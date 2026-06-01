package backend.goldenlink.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.goldenlink.dto.FindidDTO;
import backend.goldenlink.dto.FindpwDTO;
import backend.goldenlink.dto.UserLoginDTO;
import backend.goldenlink.dto.UserRegisterDTO;
import backend.goldenlink.entity.EntityUser;
import backend.goldenlink.repository.UserRepository;
import backend.goldenlink.service.UserService;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/goldenlink")
public class UserController {

    private final UserRepository userRepository;

    private final UserService userService;
    
    @Autowired
    public UserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegisterDTO userRegisterDTO) {
        try{
            userService.register(userRegisterDTO);
            return ResponseEntity.ok("회원가입 성공!");
        }catch(RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginDTO userLoginDTO, HttpSession session) {
        Optional<EntityUser> userID = userRepository.findByUserid(userLoginDTO.getUserid());
        if (userID.isPresent() && userID.get().getUserpw().equals(userLoginDTO.getUserpw())) {
            // userid가 있다면 레코드 값 중 userpw를 불러와 DTO pw와 대조
            // HttpSession session = allowSession.getSession();

            session.setAttribute("LoginUser", userID.get());
            return ResponseEntity.ok("로그인 성공!");
        } else {
            return ResponseEntity.badRequest().body("로그인 실패!");
        }
    }

    @PostMapping("/findId")
    public ResponseEntity<?> findId(@RequestBody FindidDTO findId) {
        Optional<EntityUser> Fid = userRepository.findByName(findId.getName());
        if(Fid.isPresent() && Fid.get().getEmail().equals(findId.getEmail())){
            String findUserid = Fid.get().getUserid();
            return ResponseEntity.ok("당신의 ID는 " + findUserid +" 입니다!");
        }else{
            return ResponseEntity.badRequest().body("정보 오류입니다!");
        }
    }

    @PostMapping("/findPw")
    public ResponseEntity<?> findPw(@RequestBody FindpwDTO findPw) {
        Optional<EntityUser> Fpw = userRepository.findByPhone(findPw.getPhone());
        if(Fpw.isPresent() && Fpw.get().getUserid().equals(findPw.getUserid())){
            String findUserpw = Fpw.get().getUserpw();
            return ResponseEntity.ok("당신의 PW는 " + findUserpw + " 입니다");
        }else{
            return ResponseEntity.badRequest().body("정보 오류입니다!");
        }
    }

}