package backend.goldenlink.repository;

import java.util.Optional;
import backend.goldenlink.entity.EntityUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<EntityUser, Long> {
    Optional<EntityUser> findByUserid(String userid);
    Optional<EntityUser> findByUserpw(String userpw);
    Optional<EntityUser> findByEmail(String email);
    Optional<EntityUser> findByPhone(String phone);
    Optional<EntityUser> findByName(String name);
    boolean existsByUserid(String userid);
    boolean existsByUserpw(String userpw);
    boolean existsByEmail(String email);
}
