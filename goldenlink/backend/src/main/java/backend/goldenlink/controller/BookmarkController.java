package backend.goldenlink.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.goldenlink.dto.BookmarkDTO;
import backend.goldenlink.dto.BookmarkRequestDTO;
import backend.goldenlink.entity.EntityUser;
import backend.goldenlink.service.BookmarkService;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/bookmarks")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class BookmarkController {

    @Autowired
    private BookmarkService bookmarkService;

    /**
     * 현재 로그인한 사용자의 즐겨찾기 목록 조회
     * GET /api/bookmarks
     */
    @GetMapping
    public ResponseEntity<?> getBookmarks(HttpSession session) {
        EntityUser user = (EntityUser) session.getAttribute("LoginUser");

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("로그인이 필요합니다."));
        }

        try {
            List<BookmarkDTO> bookmarks = bookmarkService.getUserBookmarks(user);
            return ResponseEntity.ok(bookmarks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("즐겨찾기 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 즐겨찾기 추가
     * POST /api/bookmarks
     */
    @PostMapping
    public ResponseEntity<?> addBookmark(
            @RequestBody BookmarkRequestDTO request,
            HttpSession session) {

        EntityUser user = (EntityUser) session.getAttribute("LoginUser");

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("로그인이 필요합니다."));
        }

        try {
            if (request.getHid() == null || request.getHid().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("병원 ID는 필수입니다."));
            }

            if (request.getHname() == null || request.getHname().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("병원 이름은 필수입니다."));
            }

            BookmarkDTO bookmark = bookmarkService.addBookmark(user, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(bookmark);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("즐겨찾기 추가 중 오류가 발생했습니다."));
        }
    }

    /**
     * 즐겨찾기 삭제
     * DELETE /api/bookmarks/{hid}
     */
    @DeleteMapping("/{hid}")
    public ResponseEntity<?> removeBookmark(
            @PathVariable("hid") String hid,
            HttpSession session) {


        EntityUser user = (EntityUser) session.getAttribute("LoginUser");

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("로그인이 필요합니다."));
        }

        try {
            bookmarkService.removeBookmark(user, hid);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "즐겨찾기가 삭제되었습니다.");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("즐겨찾기 삭제 중 오류가 발생했습니다."));
        }
        
    }

    /**
     * 특정 병원의 즐겨찾기 여부 확인
     * GET /api/bookmarks/check/{hid}
     */
    @GetMapping("/check/{hid}")
    public ResponseEntity<?> checkBookmark(
            @PathVariable("hid") String hid,
            HttpSession session) {


        EntityUser user = (EntityUser) session.getAttribute("LoginUser");

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("로그인이 필요합니다."));
        }

        try {
            boolean isBookmarked = bookmarkService.isBookmarked(user, hid);

            Map<String, Object> response = new HashMap<>();
            response.put("isBookmarked", isBookmarked);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("즐겨찾기 확인 중 오류가 발생했습니다."));
        }
    }

    /**
     * 즐겨찾기 개수 조회
     * GET /api/bookmarks/count
     */
    @GetMapping("/count")
    public ResponseEntity<?> getBookmarkCount(HttpSession session) {
        EntityUser user = (EntityUser) session.getAttribute("LoginUser");

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("로그인이 필요합니다."));
        }

        try {
            long count = bookmarkService.getBookmarkCount(user);

            Map<String, Object> response = new HashMap<>();
            response.put("count", count);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("즐겨찾기 개수 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 에러 응답 생성 헬퍼
     */
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}
