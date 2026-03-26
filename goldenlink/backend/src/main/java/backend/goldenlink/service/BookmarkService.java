package backend.goldenlink.service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import backend.goldenlink.dto.BookmarkDTO;
import backend.goldenlink.dto.BookmarkRequestDTO;
import backend.goldenlink.entity.Bookmark;
import backend.goldenlink.entity.EntityUser;
import backend.goldenlink.repository.BookmarkRepository;

@Service
public class BookmarkService {

    @Autowired
    private BookmarkRepository bookmarkRepository;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 특정 사용자의 모든 즐겨찾기 조회
     */
    public List<BookmarkDTO> getUserBookmarks(EntityUser user) {
        List<Bookmark> bookmarks = bookmarkRepository.findByUserOrderByCreatedAtDesc(user);
        return bookmarks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * 즐겨찾기 추가
     */
    @Transactional
    public BookmarkDTO addBookmark(EntityUser user, BookmarkRequestDTO request) {
        // 중복 체크
        if (bookmarkRepository.existsByUserAndHid(user, request.getHid())) {
            throw new IllegalArgumentException("이미 즐겨찾기에 추가된 병원입니다.");
        }

        Bookmark bookmark = new Bookmark(
            user,
            request.getHid(),
            request.getHname(),
            request.getHaddress(),
            request.getHtel(),
            request.getHlat(),
            request.getHlon(),
            request.getDistance()
        );

        Bookmark saved = bookmarkRepository.save(bookmark);
        return convertToDTO(saved);
    }

    /**
     * 즐겨찾기 삭제
     */
    @Transactional
    public void removeBookmark(EntityUser user, String hid) {
        Bookmark bookmark = bookmarkRepository.findByUserAndHid(user, hid)
                .orElseThrow(() -> new IllegalArgumentException("해당 즐겨찾기를 찾을 수 없습니다."));
        
        bookmarkRepository.delete(bookmark);
    }

    /**
     * 특정 병원이 즐겨찾기에 있는지 확인
     */
    public boolean isBookmarked(EntityUser user, String hid) {
        return bookmarkRepository.existsByUserAndHid(user, hid);
    }

    /**
     * 사용자의 즐겨찾기 개수
     */
    public long getBookmarkCount(EntityUser user) {
        return bookmarkRepository.countByUser(user);
    }

    /**
     * Entity to DTO 변환
     */
    private BookmarkDTO convertToDTO(Bookmark bookmark) {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setId(bookmark.getId());
        dto.setHid(bookmark.getHid());
        dto.setHname(bookmark.getHname());
        dto.setHaddress(bookmark.getHaddress());
        dto.setHtel(bookmark.getHtel());
        dto.setHlat(bookmark.getHlat());
        dto.setHlon(bookmark.getHlon());
        dto.setDistance(bookmark.getDistance());
        
        if (bookmark.getCreatedAt() != null) {
            dto.setCreatedAt(bookmark.getCreatedAt().format(formatter));
        }
        
        return dto;
    }
}