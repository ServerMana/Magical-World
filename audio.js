/**
 * audio.js - 음악 시스템 모듈
 * 브라우저 자동 재생 정책(Autoplay Policy)을 우회하여 음악 재생을 관리합니다.
 */

const MusicManager = (() => {
  let hasUserInteraction = false;
  let isAudioContextReady = false;
  
  // Audio Context (Web Audio API)
  let audioContext = null;
  let masterGain = null;
  
  // BGM 관련
  let bgmAudio = null;
  let bgmGain = null;
  let bgmVolume = 0.7;
  
  // SFX 관련
  let sfxGain = null;
  let sfxVolume = 0.8;
  const sfxMap = new Map();  // 효과음 캐시
  
  /**
   * 사용자 상호작용 감지 (클릭, 키 입력 등)
   * 브라우저의 Autoplay Policy를 우회하기 위해 필요
   */
  function setupUserInteractionListener() {
    if(hasUserInteraction) return;
    
    const events = ['click', 'touch', 'keydown', 'pointerdown'];
    
    const handleInteraction = () => {
      if(!hasUserInteraction) {
        hasUserInteraction = true;
        console.log('🔊 사용자 상호작용 감지 - 음악 시스템 활성화');
        
        // AudioContext 초기화
        initAudioContext();
        
        // 모든 이벤트 리스너 제거
        events.forEach(event => {
          document.removeEventListener(event, handleInteraction);
        });
      }
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true });
    });
  }
  
  /**
   * Web Audio API AudioContext 초기화
   */
  function initAudioContext() {
    if(isAudioContextReady) return;
    
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();
      
      if(audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('✅ AudioContext 재개됨');
          isAudioContextReady = true;
        });
      } else {
        isAudioContextReady = true;
      }
      
      // 마스터 게인 노드 설정
      masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      
      // BGM 게인
      bgmGain = audioContext.createGain();
      bgmGain.connect(masterGain);
      bgmGain.gain.value = bgmVolume;
      
      // SFX 게인
      sfxGain = audioContext.createGain();
      sfxGain.connect(masterGain);
      sfxGain.gain.value = sfxVolume;
      
      console.log('✅ Web Audio API 초기화 완료');
    } catch(e) {
      console.error('❌ AudioContext 초기화 실패:', e);
    }
  }
  
  /**
   * 사용자 상호작용 권한 요청
   * HTML 요소 클릭 시 호출
   */
  function requestPermission() {
    setupUserInteractionListener();
  }
  
  /**
   * BGM 재생
   * @param {string} trackName - 음악 파일명 (확장자 제외)
   * @param {number} volume - 음량 (0~1)
   */
  function playBGM(trackName, volume = 0.7) {
    if(!hasUserInteraction) {
      console.warn('⚠️ 사용자 상호작용 대기 중. BGM 재생 예약됨.');
      return;
    }
    
    try {
      // 기존 BGM 중지
      stopBGM();
      
      // 새로운 Audio 요소 생성
      bgmAudio = new Audio();
      
      // 파일 확장자 자동 감지 (mp3 우선, m4a 대체)
      const extensions = ['mp3', 'm4a'];
      let audioSrc = null;
      
      for(const ext of extensions) {
        const testSrc = `audio/bgm/${trackName}.${ext}`;
        bgmAudio.src = testSrc;
        audioSrc = testSrc;
        break; // 첫 번째 확장자로 시도
      }
      
      bgmAudio.loop = true;
      bgmAudio.volume = bgmVolume;
      
      // Web Audio API 연결
      if(audioContext) {
        const source = audioContext.createMediaElementAudioSource(bgmAudio);
        source.connect(bgmGain);
      }
      
      bgmAudio.play().catch(err => {
        console.warn('⚠️ BGM 재생 실패:', err.message);
        // mp3 실패 시 m4a 시도
        if(audioSrc.endsWith('.mp3')) {
          bgmAudio.src = `audio/bgm/${trackName}.m4a`;
          bgmAudio.play().catch(err2 => {
            console.warn('⚠️ BGM m4a도 재생 실패:', err2.message);
          });
        }
      });
      
      console.log(`🎵 BGM 재생: ${audioSrc}`);
    } catch(e) {
      console.error('❌ BGM 재생 오류:', e);
    }
  }
  
  /**
   * BGM 일시 정지
   */
  function pauseBGM() {
    if(bgmAudio && !bgmAudio.paused) {
      bgmAudio.pause();
      console.log('⏸️  BGM 일시정지');
    }
  }
  
  /**
   * BGM 재개
   */
  function resumeBGM() {
    if(bgmAudio && bgmAudio.paused) {
      bgmAudio.play().catch(err => {
        console.warn('⚠️ BGM 재개 실패:', err.message);
      });
      console.log('▶️  BGM 재개');
    }
  }
  
  /**
   * BGM 중지
   */
  function stopBGM() {
    if(bgmAudio) {
      bgmAudio.pause();
      bgmAudio.currentTime = 0;
      bgmAudio = null;
    }
  }
  
  /**
   * 효과음 재생
   * @param {string} sfxName - 효과음 파일명 (확장자 제외)
   * @param {number} volume - 음량 배수 (0~1)
   */
  function playSFX(sfxName, volume = 1.0) {
    if(!hasUserInteraction) {
      console.warn('⚠️ 사용자 상호작용 대기 중. 효과음 재생 불가.');
      return;
    }
    
    try {
      let sfxAudio = null;
      
      // 캐시된 효과음이 있으면 복제
      if(sfxMap.has(sfxName)) {
        sfxAudio = sfxMap.get(sfxName).cloneNode();
      } else {
        sfxAudio = new Audio();
        sfxAudio.src = `audio/se/${sfxName}.mp3`;
        sfxMap.set(sfxName, sfxAudio);
      }
      
      // 음량 설정
      sfxAudio.volume = sfxVolume * volume;
      
      // Web Audio API 연결
      if(audioContext) {
        try {
          const source = audioContext.createMediaElementAudioSource(sfxAudio);
          source.connect(sfxGain);
        } catch(e) {
          // 이미 연결된 경우 무시
        }
      }
      
      sfxAudio.play().catch(err => {
        console.warn(`⚠️ 효과음 재생 실패 (${sfxName}):`, err.message);
      });
      
    } catch(e) {
      console.error('❌ 효과음 재생 오류:', e);
    }
  }
  
  /**
   * BGM 음량 설정
   * @param {number} volume - 음량 (0~1)
   */
  function setBGMVolume(volume) {
    bgmVolume = Math.max(0, Math.min(1, volume));
    
    if(bgmAudio) {
      bgmAudio.volume = bgmVolume;
    }
    
    if(bgmGain && audioContext) {
      bgmGain.gain.setTargetAtTime(bgmVolume, audioContext.currentTime, 0.1);
    }
  }
  
  /**
   * SFX 음량 설정
   * @param {number} volume - 음량 (0~1)
   */
  function setSFXVolume(volume) {
    sfxVolume = Math.max(0, Math.min(1, volume));
    
    if(sfxGain && audioContext) {
      sfxGain.gain.setTargetAtTime(sfxVolume, audioContext.currentTime, 0.1);
    }
  }
  
  /**
   * 모든 음악 중지
   */
  function stopAll() {
    stopBGM();
    
    sfxMap.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
  
  /**
   * BGM 재생 여부 확인
   */
  function isBGMPlaying() {
    return bgmAudio && !bgmAudio.paused;
  }
  
  /**
   * 현재 음량 정보 반환
   */
  function getVolumes() {
    return {
      bgm: bgmVolume,
      sfx: sfxVolume
    };
  }
  
  // Public API
  return {
    requestPermission,
    playBGM,
    pauseBGM,
    resumeBGM,
    stopBGM,
    playSFX,
    setBGMVolume,
    setSFXVolume,
    stopAll,
    isBGMPlaying,
    getVolumes
  };
})();

// 페이지 언로드 시 모든 음악 중지
window.addEventListener('beforeunload', () => {
  MusicManager.stopAll();
});
