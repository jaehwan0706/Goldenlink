package backend.goldenlink.repository;

import backend.goldenlink.entity.Bookmark;
import backend.goldenlink.entity.EntityUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    
    // 특정 사용자의 모든 즐겨찾기 조회
    List<Bookmark> findByUser(EntityUser user);
    
    // 특정 사용자의 즐겨찾기를 생성일자 역순으로 조회
    List<Bookmark> findByUserOrderByCreatedAtDesc(EntityUser user);
    
    // 특정 사용자가 특정 병원을 즐겨찾기 했는지 확인
    Optional<Bookmark> findByUserAndHid(EntityUser user, String hid);
    
    // 특정 사용자의 특정 병원 즐겨찾기 존재 여부 확인
    boolean existsByUserAndHid(EntityUser user, String hid);
    
    // 특정 사용자의 즐겨찾기 개수
    long countByUser(EntityUser user);
    
    // 특정 사용자 ID로 즐겨찾기 삭제
    void deleteByUserAndHid(EntityUser user, String hid);
}
