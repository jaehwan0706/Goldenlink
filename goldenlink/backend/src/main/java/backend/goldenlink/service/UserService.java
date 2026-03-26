package backend.goldenlink.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import backend.goldenlink.dto.UserRegisterDTO;
import backend.goldenlink.entity.EntityUser;
import backend.goldenlink.repository.UserRepository;

@Service
public class UserService {
    
    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    UserRepository userRepository;

    public void register(UserRegisterDTO userRegisterDTO) {
        if (userRepository.existsByUserid(userRegisterDTO.getUserid())) {
            throw new RuntimeException("이미 있는 아이디입니다!");
        }
        if (userRepository.existsByEmail(userRegisterDTO.getEmail())) {
            throw new RuntimeException("이미 있는 이메일입니다!");
        }
        if (userRegisterDTO.getUserpw().length() < 8){
            throw new RuntimeException("비밀번호는 최소 8자 이상이어야 합니다!");
        }
        EntityUser newUser = new EntityUser();
        newUser.setUserid(userRegisterDTO.getUserid());
        newUser.setUserpw(userRegisterDTO.getUserpw());
        newUser.setName(userRegisterDTO.getName());
        newUser.setPhone(userRegisterDTO.getPhone());
        newUser.setEmail(userRegisterDTO.getEmail());
        newUser.setAddress(userRegisterDTO.getAddress());
        // newUser.setRole(userRegisterDTO.getRole());

        userRepository.save(newUser);
    }
}
