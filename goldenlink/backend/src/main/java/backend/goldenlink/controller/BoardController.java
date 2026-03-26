package backend.goldenlink.controller;

import backend.goldenlink.entity.Board;
import backend.goldenlink.entity.EntityUser;
import backend.goldenlink.service.BoardService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/boards")
public class BoardController {

    private final BoardService boardService;

    @Autowired
    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    // ✅ 게시글 작성
    @PostMapping
    public Board createBoard(@RequestBody Board board, HttpSession session) {
        EntityUser LoginUser = (EntityUser) session.getAttribute("LoginUser");
        if (LoginUser == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        return boardService.save(board, LoginUser);
    }

    // ✅ 전체 조회
    @GetMapping
    public List<Board> getAllBoards() {
        return boardService.findAll();
    }

    // ✅ 상세 조회
    @GetMapping("/{id}")
    public Board getBoard(@PathVariable("id") Long id) {
        return boardService.findById(id);
    }

    // ✅ 게시글 수정
    @PutMapping("/{id}")
    public Board updateBoard(@PathVariable("id") Long id, @RequestBody Board board, HttpSession session) {
        EntityUser loginUser = (EntityUser) session.getAttribute("LoginUser");
        if (loginUser == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        return boardService.updateBoard(id, loginUser, board);
    }

    // ✅ 게시글 삭제
    @DeleteMapping("/{id}")
    public String deleteBoard(@PathVariable("id") Long id, HttpSession session) {
        EntityUser loginUser = (EntityUser) session.getAttribute("LoginUser");
        if (loginUser == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        boardService.delete(id, loginUser);
        return "게시글이 삭제되었습니다.";
    }

    // ✅ 카테고리별 조회 (페이징 없음 - 기존 호환성 유지)
    @GetMapping("/category/{category}")
    public List<Board> getByCategory(@PathVariable("category") String category) {
        return boardService.findByCategory(category);
    }

    // ✅ 제목 검색 (페이징 없음 - 기존 호환성 유지)
    @GetMapping("/search")
    public List<Board> search(@RequestParam("keyword") String keyword) {
        return boardService.searchByTitle(keyword);
    }

    // ========== ✅ 새로운 페이징 + 검색 API ==========

    /**
     * 카테고리별 게시글 조회 (페이징 + 검색)
     * 
     * 예시:
     * - 전체 조회: GET /boards/category/INFO/page?page=0&size=10
     * - 검색: GET /boards/category/INFO/page?page=0&size=10&searchType=제목&keyword=병원
     * 
     * @param category 게시판 카테고리 (INFO, QNA, NOTICE)
     * @param page 페이지 번호 (0부터 시작, 기본값: 0)
     * @param size 페이지 크기 (기본값: 10)
     * @param searchType 검색 타입 (전체, 제목, 작성자, 기본값: 전체)
     * @param keyword 검색어 (비어있으면 전체 조회)
     * @return 페이징 정보와 게시글 목록
     */
    @GetMapping("/category/{category}/page")
    public Map<String, Object> getByCategoryWithPaging(
            @PathVariable("category") String category,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "searchType", defaultValue = "전체") String searchType,
            @RequestParam(value = "keyword", defaultValue = "") String keyword
    ) {
        Page<Board> boardPage = boardService.searchWithPaging(category, searchType, keyword, page, size);
        
        // 프론트엔드에서 사용하기 쉽도록 정보를 Map으로 반환
        Map<String, Object> response = new HashMap<>();
        response.put("content", boardPage.getContent());          // 게시글 목록
        response.put("currentPage", boardPage.getNumber());       // 현재 페이지 (0부터 시작)
        response.put("totalPages", boardPage.getTotalPages());    // 전체 페이지 수
        response.put("totalElements", boardPage.getTotalElements()); // 전체 게시글 수
        response.put("size", boardPage.getSize());                // 페이지 크기
        response.put("hasNext", boardPage.hasNext());             // 다음 페이지 존재 여부
        response.put("hasPrevious", boardPage.hasPrevious());     // 이전 페이지 존재 여부
        
        return response;
    }
}