package backend.goldenlink.service;

import backend.goldenlink.entity.Board;
import backend.goldenlink.entity.EntityUser;
import backend.goldenlink.repository.BoardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true) // 기본적으로 읽기 전용
public class BoardService {

    private final BoardRepository boardRepository;

    @Autowired
    public BoardService(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    // ✅ 게시글 작성 (관리자 권한 체크 포함)
    @Transactional // 쓰기 작업
    public Board save(Board board, EntityUser loginUser) {
        // 공지사항(NOTICE)은 관리자만 작성 가능
        if ("NOTICE".equals(board.getCategory()) && !"admin".equalsIgnoreCase(loginUser.getRole())) {
            throw new RuntimeException("공지사항은 관리자만 등록할 수 있습니다.");
        }

        board.setUser(loginUser); // 작성자 정보 설정
        return boardRepository.save(board);
    }

    // ✅ 기본 저장 메서드 (필요시 사용)
    @Transactional // 쓰기 작업
    public Board save(Board board) {
        return boardRepository.save(board);
    }

    // ✅ 전체 게시글 조회 (최신순)
    public List<Board> findAll() {
        List<Board> boards = boardRepository.findAllByOrderByIdDesc();
        // LAZY 로딩 초기화
        boards.forEach(board -> {
            board.getUser().getName();
            try {
                board.getComments().size();
            } catch (Exception e) {
                // LAZY 로딩 실패 무시
            }
        });
        return boards;
    }

    // ✅ 게시글 상세 조회
    public Board findById(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. id=" + id));
        
        // LAZY 로딩 초기화
        board.getUser().getName();
        try {
            board.getComments().size();
        } catch (Exception e) {
            // LAZY 로딩 실패 무시
        }
        
        return board;
    }

    // ✅ 카테고리별 조회 (INFO, QNA, NOTICE) - 페이징 없음, 최신순
    public List<Board> findByCategory(String category) {
        List<Board> boards = boardRepository.findByCategoryOrderByIdDesc(category);
        // LAZY 로딩 초기화
        boards.forEach(board -> {
            board.getUser().getName();
            try {
                board.getComments().size();
            } catch (Exception e) {
                // LAZY 로딩 실패 무시
            }
        });
        return boards;
    }

    // ✅ 제목 검색
    public List<Board> searchByTitle(String keyword) {
        return boardRepository.findByTitleContaining(keyword);
    }

    // ========== ✅ 페이징 + 검색 기능 (최신순) ==========
    
    /**
     * 카테고리별 게시글 조회 (페이징, 최신순)
     * @param category 게시판 카테고리 (INFO, QNA, NOTICE)
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지 크기
     * @return 페이징된 게시글 목록
     */
    public Page<Board> findByCategoryWithPaging(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Board> boardPage = boardRepository.findByCategoryOrderByIdDesc(category, pageable);
        
        // LAZY 로딩 초기화
        boardPage.getContent().forEach(board -> {
            board.getUser().getName();
            try {
                board.getComments().size();
            } catch (Exception e) {
                // LAZY 로딩 실패 무시
            }
        });
        
        return boardPage;
    }

    /**
     * 카테고리별 게시글 검색 (페이징, 최신순, 부분 검색)
     * @param category 게시판 카테고리
     * @param searchType 검색 타입 (전체, 제목, 작성자)
     * @param keyword 검색어
     * @param page 페이지 번호
     * @param size 페이지 크기
     * @return 페이징된 검색 결과
     */
    public Page<Board> searchWithPaging(String category, String searchType, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Board> boardPage;
        
        // 검색어가 비어있으면 전체 조회 (최신순)
        if (keyword == null || keyword.trim().isEmpty()) {
            boardPage = boardRepository.findByCategoryOrderByIdDesc(category, pageable);
        } else {
            // ✅ 검색어 trim (공백 제거)
            String trimmedKeyword = keyword.trim();
            
            // 검색 타입에 따라 다른 쿼리 실행 (대소문자 무시, 부분 검색)
            switch (searchType) {
                case "제목":
                    boardPage = boardRepository.searchByTitle(category, trimmedKeyword, pageable);
                    break;
                case "작성자":
                    boardPage = boardRepository.searchByAuthor(category, trimmedKeyword, pageable);
                    break;
                case "전체":
                default:
                    boardPage = boardRepository.searchAll(category, trimmedKeyword, pageable);
                    break;
            }
        }
        
        // LAZY 로딩 초기화
        boardPage.getContent().forEach(board -> {
            board.getUser().getName();
            try {
                board.getComments().size();
            } catch (Exception e) {
                // LAZY 로딩 실패 무시
            }
        });
        
        return boardPage;
    }

    // ✅ 게시글 수정
    @Transactional // 쓰기 작업
    public Board updateBoard(Long boardId, EntityUser loginUser, Board updateBoard) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        // 권한 체크: 작성자 본인이거나 관리자여야 함
        if (board.getUser().getId().longValue() != loginUser.getId().longValue()
                && !"admin".equalsIgnoreCase(loginUser.getRole())) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        board.setTitle(updateBoard.getTitle());
        board.setContent(updateBoard.getContent());
        board.setCategory(updateBoard.getCategory());

        return boardRepository.save(board);
    }

    // ✅ 게시글 삭제
    @Transactional // 쓰기 작업
    public void delete(Long id, EntityUser loginUser) {
        Board board = findById(id);

        // 권한 체크: 작성자 본인이거나 관리자여야 함
        if (!board.getUser().getId().equals(loginUser.getId()) 
                && !"admin".equalsIgnoreCase(loginUser.getRole())) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        boardRepository.delete(board);
    }
}