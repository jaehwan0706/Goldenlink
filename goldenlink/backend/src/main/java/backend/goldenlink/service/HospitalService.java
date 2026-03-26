package backend.goldenlink.service;

import backend.goldenlink.dto.HospitalDto;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HospitalService {

    @Value("${openapi.serviceKey}")
    private String serviceKey;

    @Value("${kakao.restKey}")
    private String kakaoKey;

    private final WebClient nemcClient = WebClient.builder()
            .baseUrl("https://apis.data.go.kr/B552657/ErmctInfoInqireService")
            .build();

    private final XmlMapper xmlMapper = new XmlMapper();

    // 🔥 전국 병원 캐시 (초기 로드용)
    private List<HospitalDto> allHospitals = Collections.synchronizedList(new ArrayList<>());
    private volatile boolean isLoaded = false;

    // ===================================
    // 🚀 서버 시작 시 전국 병원 데이터 로드
    // ===================================
    @PostConstruct
    public void loadAllHospitals() {
        System.out.println("\n🚀 ============================================");
        System.out.println("🚀 전국 응급의료센터 데이터 로드 시작...");
        System.out.println("🚀 ============================================\n");
        
        try {
            int pageNo = 1;
            int pageSize = 200;
            boolean hasMore = true;

            while (hasMore) {
                String uri = "/getEgytListInfoInqire?serviceKey=" + serviceKey
                        + "&pageNo=" + pageNo
                        + "&numOfRows=" + pageSize;

                String xml = nemcClient.get()
                        .uri(uri)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                Map map = xmlMapper.readValue(xml, Map.class);
                Map body = (Map) map.get("body");
                
                if (body == null) {
                    System.out.println("❌ Body가 null입니다. 로드 종료.");
                    break;
                }

                Map items = (Map) body.get("items");
                if (items == null) {
                    System.out.println("❌ 더 이상 데이터가 없습니다.");
                    hasMore = false;
                    break;
                }

                Object itemObj = items.get("item");
                if (itemObj == null) {
                    hasMore = false;
                    break;
                }

                List<Map<String, Object>> itemList;
                if (itemObj instanceof List) {
                    itemList = (List<Map<String, Object>>) itemObj;
                } else {
                    itemList = List.of((Map<String, Object>) itemObj);
                }

                for (Map<String, Object> item : itemList) {
                    // ✅ API에서 hid 가져오기 (hpid 또는 dutyId)
                    String hid = extractHospitalId(item);
                    
                    HospitalDto dto = new HospitalDto(
                            hid,  // ✅ 고유 ID 추가
                            (String) item.get("dutyName"),
                            (String) item.get("dutyAddr"),
                            pickTel(item),
                            parseDouble(item.get("wgs84Lat")),
                            parseDouble(item.get("wgs84Lon"))
                    );
                    allHospitals.add(dto);
                }

                System.out.println("✅ 페이지 " + pageNo + " 로드 완료 (누적: " + allHospitals.size() + "개)");

                if (itemList.size() < pageSize) {
                    hasMore = false;
                }
                pageNo++;
            }

            isLoaded = true;
            System.out.println("\n✅ ============================================");
            System.out.println("✅ 전국 응급의료센터 로드 완료!");
            System.out.println("✅ 총 " + allHospitals.size() + "개 병원 준비됨");
            System.out.println("✅ ============================================\n");

        } catch (Exception e) {
            System.out.println("❌ 응급의료센터 로드 중 에러:");
            e.printStackTrace();
        }
    }

    // =========================
    // 0️⃣ 전국 모든 병원 조회 (초기 로드용)
    // =========================
    public List<HospitalDto> getAllHospitals() {
        if (!isLoaded) {
            loadAllHospitals();
        }
        System.out.println("🌐 전국 모든 병원 조회: " + allHospitals.size() + "개");
        return new ArrayList<>(allHospitals);
    }

    // =========================
    // 1️⃣ 병원 이름 검색 (원래 코드 그대로 - 캐시에서 검색)
    // =========================
    public List<HospitalDto> searchByName(String keyword) {
        // 🔒 검색어가 없으면 전체 반환
        if (keyword == null || keyword.trim().isEmpty()) {
            System.out.println("🌐 검색어 없음 → 전국 모든 병원 반환 (" + allHospitals.size() + "개)");
            return getAllHospitals();
        }

        List<HospitalDto> result = new ArrayList<>();
        String lowerKeyword = keyword.toLowerCase().trim();

        for (HospitalDto hospital : allHospitals) {
            if (hospital.getHname() != null && 
                hospital.getHname().toLowerCase().contains(lowerKeyword)) {
                result.add(hospital);
            }
        }

        System.out.println("🔍 '" + keyword + "' 검색 결과: " + result.size() + "개");
        return result;
    }

    // =========================
    // 2️⃣ 좌표 주변 검색 (원래 코드 그대로 - API가 처리)
    // =========================
    public List<HospitalDto> nearby(double lat, double lon) {
        List<HospitalDto> result = new ArrayList<>();

        try {
            String uri = "/getEgytLcinfoInqire?serviceKey=" + serviceKey
                    + "&WGS84_LAT=" + lat
                    + "&WGS84_LON=" + lon
                    + "&pageNo=1&numOfRows=20";

            System.out.println("📍 API 호출: " + uri);

            String xml = nemcClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            Map map = xmlMapper.readValue(xml, Map.class);
            Map body = (Map) map.get("body");
            
            if (body == null) {
                System.out.println("❌ body가 null입니다!");
                return result;
            }

            Map items = (Map) body.get("items");
            if (items == null) {
                System.out.println("❌ items가 null입니다!");
                return result;
            }

            Object itemObj = items.get("item");
            if (itemObj == null) {
                System.out.println("❌ 주변에 병원이 없습니다!");
                return result;
            }

            // item이 List인지 Map인지 확인
            if (itemObj instanceof List) {
                List<Map<String, Object>> itemList = (List<Map<String, Object>>) itemObj;
                System.out.println("✅ 검색된 병원 수: " + itemList.size());

                for (Map<String, Object> item : itemList) {
                    // ✅ API에서 hid 가져오기
                    String hid = extractHospitalId(item);
                    
                    HospitalDto dto = new HospitalDto(
                            hid,  // ✅ 고유 ID 추가
                            (String) item.get("dutyName"),
                            (String) item.get("dutyAddr"),
                            (String) item.get("dutyTel1"),
                            parseDouble(item.get("latitude")),
                            parseDouble(item.get("longitude")));

                    result.add(dto);
                }
            } else if (itemObj instanceof Map) {
                // 결과가 1개일 때는 Map으로 옴
                Map<String, Object> item = (Map<String, Object>) itemObj;
                System.out.println("✅ 검색된 병원 수: 1");

                // ✅ API에서 hid 가져오기
                String hid = extractHospitalId(item);
                
                HospitalDto dto = new HospitalDto(
                        hid,  // ✅ 고유 ID 추가
                        (String) item.get("dutyName"),
                        (String) item.get("dutyAddr"),
                        (String) item.get("dutyTel1"),
                        parseDouble(item.get("latitude")),
                        parseDouble(item.get("longitude")));

                result.add(dto);
            }

        } catch (Exception e) {
            System.out.println("❌ 좌표 주변 검색 에러:");
            e.printStackTrace();
        }

        System.out.println("📍 좌표 (" + lat + ", " + lon + ") 근처 병원: " + result.size() + "개");
        return result;
    }

    // =========================
    // 3️⃣ 주소 → 좌표 → 주변검색 (원래 코드 그대로)
    // =========================
    public List<HospitalDto> searchByAddress(String address) {
        try {
            WebClient kakaoClient = WebClient.builder()
                    .baseUrl("https://dapi.kakao.com")
                    .defaultHeader("Authorization", "KakaoAK " + kakaoKey)
                    .build();

            System.out.println("🏠 Kakao API 호출: 주소 '" + address + "' → 좌표 변환");

            Map response = kakaoClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v2/local/search/address.json")
                            .queryParam("query", address)
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            List<Map<String, Object>> docs = (List<Map<String, Object>>) response.get("documents");

            if (docs == null || docs.isEmpty()) {
                System.out.println("❌ Kakao에서 주소를 찾지 못했습니다: " + address);
                return List.of();
            }

            Map<String, Object> first = docs.get(0);
            double lat = Double.parseDouble((String) first.get("y"));
            double lon = Double.parseDouble((String) first.get("x"));

            System.out.println("✅ 좌표 변환 완료: lat=" + lat + ", lon=" + lon);

            // 변환된 좌표로 주변 검색
            return nearby(lat, lon);

        } catch (Exception e) {
            System.out.println("❌ searchByAddress 에러:");
            e.printStackTrace();
            return List.of();
        }
    }

    // ===================================
    // ✅ 4️⃣ 가까운 병원 검색 (응급 버튼용) - 새로 추가!
    // ===================================
    /**
     * 응급 버튼에서 사용: 사용자 위치 기반 가장 가까운 병원 검색
     * 
     * @param lat 위도
     * @param lon 경도
     * @param radiusKm 검색 반경 (km)
     * @param limit 결과 개수
     * @return 거리순으로 정렬된 병원 목록
     */
    public List<HospitalDto> findNearbyHospitals(Double lat, Double lon, Double radiusKm, Integer limit) {
        if (!isLoaded) {
            loadAllHospitals();
        }

        System.out.println("🚨 응급 버튼: 가까운 병원 검색 시작");
        System.out.println("   위치: lat=" + lat + ", lon=" + lon);
        System.out.println("   반경: " + radiusKm + "km");
        System.out.println("   최대: " + limit + "개");

        // 모든 병원에 대해 거리 계산
        List<HospitalDto> nearbyHospitals = allHospitals.stream()
                .map(hospital -> {
                    // 거리 계산
                    double distance = calculateDistance(lat, lon, hospital.getHlat(), hospital.getHlon());
                    
                    // 새 DTO 생성 (거리 포함)
                    HospitalDto dto = new HospitalDto(
                            hospital.getHid(),
                            hospital.getHname(),
                            hospital.getHaddress(),
                            hospital.getHtel(),
                            hospital.getHlat(),
                            hospital.getHlon()
                    );
                    dto.setDistance(distance);
                    
                    return dto;
                })
                .filter(dto -> dto.getDistance() <= radiusKm) // 반경 내 병원만
                .sorted(Comparator.comparingDouble(HospitalDto::getDistance)) // 거리순 정렬
                .limit(limit) // 개수 제한
                .collect(Collectors.toList());

        System.out.println("✅ 응급 버튼: " + nearbyHospitals.size() + "개 병원 검색 완료");
        if (!nearbyHospitals.isEmpty()) {
            HospitalDto nearest = nearbyHospitals.get(0);
            System.out.println("   가장 가까운 병원: " + nearest.getHname() + " (" + 
                    String.format("%.2f", nearest.getDistance()) + "km)");
        }

        return nearbyHospitals;
    }

    /**
     * ✅ 두 좌표 사이의 거리 계산 (Haversine 공식)
     * 
     * @param lat1 위도1
     * @param lon1 경도1
     * @param lat2 위도2
     * @param lon2 경도2
     * @return 거리 (km)
     */
    private double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return Double.MAX_VALUE;
        }

        final int EARTH_RADIUS = 6371; // 지구 반지름 (km)

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c; // km
    }

    // ===================================
    // ✅ 병원 고유 ID 추출 헬퍼 메서드
    // ===================================
    private String extractHospitalId(Map<String, Object> item) {
        // 1순위: hpid (Hospital ID)
        Object hpid = item.get("hpid");
        if (hpid != null && !hpid.toString().isBlank()) {
            return hpid.toString();
        }
        
        // 2순위: dutyId (Duty ID)
        Object dutyId = item.get("dutyId");
        if (dutyId != null && !dutyId.toString().isBlank()) {
            return dutyId.toString();
        }
        
        // 3순위: dutyName (병원 이름을 ID로 사용)
        Object dutyName = item.get("dutyName");
        if (dutyName != null && !dutyName.toString().isBlank()) {
            return dutyName.toString();
        }
        
        // 4순위: UUID 생성 (최후의 수단)
        return "UNKNOWN_" + UUID.randomUUID().toString().substring(0, 8);
    }

    // ===================================
    // 유틸 메서드
    // ===================================

    private Double parseDouble(Object obj) {
        try {
            if (obj == null)
                return null;
            return Double.parseDouble(obj.toString());
        } catch (Exception e) {
            return null;
        }
    }

    private String pickTel(Map<String, Object> item) {
        Object tel1 = item.get("dutyTel1");
        if (tel1 != null && !tel1.toString().isBlank()) {
            return tel1.toString();
        }

        Object tel3 = item.get("dutyTel3");
        if (tel3 != null && !tel3.toString().isBlank()) {
            return tel3.toString();
        }

        return null;
    }
}