import React, { useState, useEffect, useRef } from "react";
import "./EmergencyButton.css";

export default function EmergencyButton() {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const audioRef = useRef(null);
  
  // ✅ 응급 버튼에서 자동으로 받아온 위치 정보
  const [emergencyLocation, setEmergencyLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState("위치 정보를 가져오는 중...");
  
  // ✅ 자동으로 검색한 가장 가까운 병원
  const [nearestHospital, setNearestHospital] = useState(null);
  const [hospitalLoading, setHospitalLoading] = useState(false);

  // 응급 버튼 클릭
  const handleEmergencyClick = () => {
    setShowModal(true);
    setCountdown(5);
    setHospitalLoading(true);

    // ✅ 자동으로 현재 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setEmergencyLocation({
            lat: latitude,
            lon: longitude  // ✅ lng → lon 변경
          });
          console.log("✅ 응급 위치 받아옴:", latitude, longitude);

          // ✅ 위도/경도를 주소로 변환 (Kakao 역지오코딩)
          convertCoordToAddress(latitude, longitude);

          // ✅ 가장 가까운 병원 검색
          searchNearestHospital(latitude, longitude);
        },
        (error) => {
          console.error("❌ 위치 가져오기 실패:", error);
          setLocationAddress("위치 정보를 가져올 수 없습니다");
          setHospitalLoading(false);
        }
      );
    } else {
      setLocationAddress("브라우저가 위치 정보를 지원하지 않습니다");
      setHospitalLoading(false);
    }

    // emergency.mp3 재생
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.error("음성 재생 실패:", err);
      });
    }
  };

  // ✅ Kakao Maps API로 좌표를 주소로 변환
  const convertCoordToAddress = (lat, lng) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      console.error("Kakao Maps API가 로드되지 않았습니다");
      setLocationAddress(`위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`);
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    
    geocoder.coord2Address(lng, lat, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        if (result[0].address) {
          const addr = result[0].address;
          // 예: 서울특별시 강남구 역삼동
          const fullAddress = `${addr.region_1depth_name} ${addr.region_2depth_name} ${addr.region_3depth_name}`;
          setLocationAddress(fullAddress);
          console.log("✅ 주소 변환 성공:", fullAddress);
        } else if (result[0].road_address) {
          setLocationAddress(result[0].road_address.address_name);
        }
      } else {
        console.error("❌ 주소 변환 실패");
        setLocationAddress(`위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`);
      }
    });
  };

  // ✅ 가장 가까운 병원 검색 (백엔드 API 호출)
  const searchNearestHospital = async (lat, lon) => {
    try {
      setHospitalLoading(true);
      
      // 백엔드 API 호출: 5km 반경 내 병원 검색, 거리순 정렬, 1개만
      const response = await fetch(
        `http://localhost:8080/api/hospitals/nearby?lat=${lat}&lon=${lon}&radius=5&limit=1`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'  // ✅ JSON 강제!
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ 가까운 병원 검색 성공:", data);
        
        if (data && data.length > 0) {
          setNearestHospital(data[0]);
        } else {
          setNearestHospital(null);
          console.log("⚠️ 주변에 병원이 없습니다");
        }
      } else {
        console.error("❌ 병원 검색 실패:", response.status);
        setNearestHospital(null);
      }
    } catch (error) {
      console.error("❌ 병원 검색 에러:", error);
      setNearestHospital(null);
    } finally {
      setHospitalLoading(false);
    }
  };

  // 카운트다운
  useEffect(() => {
    if (!showModal) return;

    if (countdown === 0) {
      // 카운트다운 완료 → 위치 전송 (시뮬레이션)
      handleEmergencySend();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, showModal]);

  // 위치 전송 (⚠️ 시뮬레이션 - 실제 전송 안 됨!)
  const handleEmergencySend = () => {
    setShowModal(false);
    
    // 음성 중지
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // ⚠️ 여기는 시뮬레이션입니다!
    console.log("⚠️ 시뮬레이션: 위치 전송 (실제 전송 안 됨)");
    console.log("응급 위치:", emergencyLocation);
    console.log("주소:", locationAddress);
    console.log("가장 가까운 병원:", nearestHospital);

    // 성공 알림 표시
    setShowSuccessAlert(true);

    // 3초 후 자동 닫기
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 3000);
  };

  // 취소
  const handleCancel = () => {
    setShowModal(false);
    setCountdown(5);

    // 음성 중지
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // 가장 가까운 병원 정보 표시
  const getNearestHospitalInfo = () => {
    if (hospitalLoading) {
      return "가까운 병원을 검색 중...";
    }
    
    if (nearestHospital) {
      const distance = nearestHospital.distance 
        ? `(약 ${nearestHospital.distance.toFixed(1)}km)`
        : '';
      return `${nearestHospital.hname} ${distance}`;
    }
    
    return "주변에 병원 정보가 없습니다";
  };

  // 병원 주소 가져오기
  const getHospitalAddress = () => {
    if (nearestHospital && nearestHospital.haddress) {
      return nearestHospital.haddress;
    }
    return "";
  };

  return (
    <>
      {/* 음성 파일 */}
      <audio ref={audioRef} src="/emergency.mp3" preload="auto" />

      {/* 응급 버튼 - 하단 좌측 */}
      <button 
        className="em-btn"
        onClick={handleEmergencyClick}
        aria-label="응급 신고"
      >
        <div className="em-pulse" />
        <div className="em-pulse-2" />
        <div className="em-icon">
          {/* 경고 아이콘 (삼각형 + 느낌표) */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M12 2L2 20h20L12 2z" 
              fill="white"
            />
            <path 
              d="M12 8v5M12 16h.01" 
              stroke="#dc2626" 
              strokeWidth="2.5" 
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="em-text">응급</div>
      </button>

      {/* 카운트다운 모달 */}
      {showModal && (
        <div className="em-modal-backdrop">
          <div className="em-modal">
            <div className="em-modal-header">
              <div className="em-header-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M12 2L2 20h20L12 2z" 
                    fill="white"
                  />
                  <path 
                    d="M12 8v5M12 16h.01" 
                    stroke="#dc2626" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="em-header-text">
                <div className="em-header-title">긴급 상황</div>
                <div className="em-header-subtitle">Emergency Alert</div>
              </div>
            </div>

            <div className="em-modal-body">
              <p className="em-question">
                사용자의 위치를 전송하는 것에
                <br />
                동의하시겠습니까?
              </p>

              <p className="em-guide">
                응급 상황 발생 시 신속한 대응을 위해
                <br />
                현재 위치 정보를 응급센터에 전송합니다.
              </p>

              {/* 카운트다운 */}
              <div className="em-countdown-box">
                <div className="em-countdown-circle">
                  <span className="em-countdown-number">{countdown}</span>
                </div>
                <div className="em-countdown-text">
                  자동 전송 대기 중
                  <br />
                  <span className="em-countdown-subtext">
                    {countdown}초 후 자동으로 전송됩니다
                  </span>
                </div>
              </div>

              {/* 전송될 정보 */}
              <div className="em-info-box">
                <div className="em-info-title">전송될 정보:</div>
                <div className="em-info-item">
                  <svg className="em-info-icon" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" 
                      fill="currentColor"
                    />
                  </svg>
                  <span>현재 위치 (GPS 좌표)</span>
                </div>
                <div className="em-info-item">
                  <svg className="em-info-icon" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V6H20V18ZM6 10H8V12H6V10ZM6 14H8V16H6V14ZM10 10H18V12H10V10ZM10 14H16V16H10V14Z" 
                      fill="currentColor"
                    />
                  </svg>
                  <span>연락처 정보 (선택사항)</span>
                </div>
              </div>

              {/* 소리 아이콘 */}
              <button className="em-sound-btn" aria-label="소리">
                <svg viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M3 9V15H7L12 20V4L7 9H3Z" 
                    fill="currentColor"
                  />
                  <path 
                    d="M16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12Z" 
                    fill="currentColor"
                  />
                  <path 
                    d="M14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z" 
                    fill="currentColor"
                  />
                </svg>
              </button>

              {/* 버튼 */}
              <div className="em-actions">
                <button 
                  className="em-cancel-btn"
                  onClick={handleCancel}
                >
                  취소
                </button>
                <button 
                  className="em-send-btn"
                  onClick={handleEmergencySend}
                >
                  동의하고 전송
                </button>
              </div>

              {/* 경고 */}
              <div className="em-warning">
                ⚠️ 허위 신고 시 법적 책임이 따를 수 있습니다
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 성공 알림 */}
      {showSuccessAlert && (
        <div className="em-success-backdrop">
          <div className="em-success-alert">
            <div className="em-success-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path 
                  d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" 
                  fill="white"
                />
              </svg>
            </div>
            <div className="em-success-title">
              위치 정보가 응급센터로 전송되었습니다!
            </div>
            <div className="em-success-note">
              ⚠️ <strong>주의:</strong> 이것은 시뮬레이션입니다. 실제로는 전송되지 않습니다.
            </div>
            <div className="em-success-body">
              {/* ✅ 자동으로 받아온 사용자 위치 */}
              <div className="em-success-item">
                📍 <strong>현재 위치:</strong> {locationAddress}
              </div>
              {/* ✅ 자동으로 검색한 가장 가까운 병원 */}
              <div className="em-success-item">
                🏥 <strong>가장 가까운 응급실:</strong> {getNearestHospitalInfo()}
              </div>
              {/* 병원 주소 */}
              {getHospitalAddress() && (
                <div className="em-success-item em-success-subitem">
                  📌 {getHospitalAddress()}
                </div>
              )}
              <div className="em-success-item">
                📞 <strong>119에도 자동으로 연락됩니다.</strong>
              </div>
            </div>
            <button 
              className="em-success-confirm"
              onClick={() => setShowSuccessAlert(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}