/**
 * difficulty.js - 난이도 관리 모듈
 * 게임의 모든 난이도별 밸런스를 중앙에서 관리합니다.
 */

const DifficultyManager = (() => {
  const DIFFICULTY_CONFIG = {
    easy: {
      label: 'EASY',
      color: '#7fff7f',
      // 적 관련
      enemyHpBase: 30,           // 기본 적 체력
      enemySpawnRate: 4.0,       // 적 스폰 간격 (초)
      enemyMaxPerWave: 1,        // 한 웨이브 최대 적 수
      enemyBulletSpeed: 100,     // 적 탄 속도
      enemyBulletInterval: 2.0,  // 적 발사 간격
      
      // 보스 관련
      bossHpBase: 500,           // 기본 보스 체력
      bossAttackFreq: 3.0,       // 공격 간격 (초)
      
      // 플레이어 유리함
      playerHp: 5,               // 초기 체력
      playerBomb: 4,             // 초기 스킬
      itemDropRate: 0.4,         // 아이템 드롭율
    },
    normal: {
      label: 'NORMAL',
      color: '#ffff00',
      // 적 관련
      enemyHpBase: 60,
      enemySpawnRate: 2.5,
      enemyMaxPerWave: 2,
      enemyBulletSpeed: 140,
      enemyBulletInterval: 1.5,
      
      // 보스 관련
      bossHpBase: 1000,
      bossAttackFreq: 2.0,
      
      // 플레이어 기본
      playerHp: 3,
      playerBomb: 2,
      itemDropRate: 0.25,
    },
    hard: {
      label: 'HARD',
      color: '#ff0000',
      // 적 관련
      enemyHpBase: 100,
      enemySpawnRate: 1.5,
      enemyMaxPerWave: 4,
      enemyBulletSpeed: 200,
      enemyBulletInterval: 1.0,
      
      // 보스 관련
      bossHpBase: 2000,
      bossAttackFreq: 1.2,
      
      // 플레이어 불리함
      playerHp: 2,
      playerBomb: 1,
      itemDropRate: 0.1,
    }
  };

  /**
   * 난이도별 설정 객체 반환
   */
  function getConfig(difficulty = 'normal') {
    return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.normal;
  }

  /**
   * 현재 난이도에서 적의 체력 계산
   * @param {string} difficulty - 난이도 ('easy', 'normal', 'hard')
   * @param {number} stage - 스테이지 번호 (1-9)
   * @param {number} elapsedTime - 게임 경과 시간 (초) - 선택사항
   */
  function getEnemyHp(difficulty = 'normal', stage = 1, elapsedTime = 0) {
    const config = getConfig(difficulty);
    const stageMultiplier = 1 + (stage - 1) * 0.15; // 스테이지마다 15% 증가
    const timeMultiplier = 1 + (elapsedTime / 60) * 0.08; // 1분마다 8% 증가 (최대 300초까지 약 40% 증가)
    return Math.round(config.enemyHpBase * stageMultiplier * timeMultiplier);
  }

  /**
   * 현재 난이도에서 보스 체력 계산
   * @param {string} difficulty - 난이도 ('easy', 'normal', 'hard')
   * @param {number} stage - 스테이지 번호 (1-9)
   * @param {number} elapsedTime - 게임 경과 시간 (초) - 선택사항
   */
  function getBossHp(difficulty = 'normal', stage = 1, elapsedTime = 0) {
    const config = getConfig(difficulty);
    const stageMultiplier = 1 + (stage - 1) * 0.2; // 스테이지마다 20% 증가
    const timeMultiplier = 1 + (elapsedTime / 60) * 0.1; // 1분마다 10% 증가 (보스는 더 높음)
    return Math.round(config.bossHpBase * stageMultiplier * timeMultiplier);
  }

  /**
   * 현재 난이도에서 적 탄 속도
   */
  function getEnemyBulletSpeed(difficulty = 'normal') {
    return getConfig(difficulty).enemyBulletSpeed;
  }

  /**
   * 현재 난이도에서 적 스폰 간격
   */
  function getSpawnInterval(difficulty = 'normal') {
    return getConfig(difficulty).enemySpawnRate;
  }

  /**
   * 현재 난이도에서 한 웨이브 적 최대 수
   */
  function getMaxEnemiesPerWave(difficulty = 'normal') {
    return getConfig(difficulty).enemyMaxPerWave;
  }

  /**
   * 현재 난이도에서 적 발사 간격
   */
  function getEnemyShootInterval(difficulty = 'normal') {
    return getConfig(difficulty).enemyBulletInterval;
  }

  /**
   * 현재 난이도에서 아이템 드롭율
   */
  function getItemDropRate(difficulty = 'normal') {
    return getConfig(difficulty).itemDropRate;
  }

  /**
   * 현재 난이도에서 초기 플레이어 설정
   */
  function getPlayerInitialStats(difficulty = 'normal') {
    const config = getConfig(difficulty);
    return {
      hp: config.playerHp,
      maxHp: config.playerHp,
      bomb: config.playerBomb,
      maxBomb: config.playerBomb,
      power: 0,
      maxPower: 100
    };
  }

  /**
   * 난이도별 라벨과 색상
   */
  function getDifficultyInfo(difficulty = 'normal') {
    const config = getConfig(difficulty);
    return {
      label: config.label,
      color: config.color
    };
  }

  /**
   * 난이도별 상세 정보 (UI용)
   */
  function getDetailedInfo(difficulty = 'normal') {
    const config = getConfig(difficulty);
    return {
      label: config.label,
      color: config.color,
      description: difficulty === 'easy' ? '탄 수 적음, 속도 느림' : 
                   difficulty === 'hard' ? '탄 수 많음, 속도 빠름' : 
                   '기본 난이도',
      stats: {
        'enemyHp': config.enemyHpBase,
        'spawnRate': config.enemySpawnRate + '초마다',
        'bulletSpeed': config.enemyBulletSpeed + 'px/s',
        'playerHp': config.playerHp,
        'itemDropRate': (config.itemDropRate * 100).toFixed(0) + '%'
      }
    };
  }

  /**
   * 적 파괴 시 드롭할 아이템 목록 생성
   * @param {string} difficulty - 난이도
   * @param {number} x - 적의 x좌표
   * @param {number} y - 적의 y좌표
   * @returns {Array} 드롭될 아이템 배열 [{type: 'power'|'bomb'|'life', x, y}, ...]
   */
  function generateDropItems(difficulty = 'normal', x, y) {
    const dropRate = getItemDropRate(difficulty);
    const items = [];

    // 파워(최고 확률)
    if(Math.random() < dropRate * 1.2) {
      items.push({ type: 'power', x: x, y: y });
    }
    
    // 스킬(중간 확률)
    if(Math.random() < dropRate * 0.6) {
      items.push({ type: 'bomb', x: x, y: y });
    }
    
    // 생명(낮은 확률)
    if(Math.random() < dropRate * 0.4) {
      items.push({ type: 'life', x: x, y: y });
    }

    return items;
  }

  /**
   * 아이템 이동 로직
   * - 왼쪽으로 천천히 이동
   * - 자석 효과: 플레이어와 거리 < magneticRange면 플레이어 방향으로 빨려감
   * @param {Object} item - 아이템 객체
   * @param {Object} player - 플레이어 객체 {x, y, r}
   * @param {number} dt - 델타 시간
   * @returns {boolean} true면 아이템 수집됨, false면 계속 존재
   */
  function updateItemMovement(item, player, dt) {
    const leftSpeed = 60;       // 왼쪽으로 가는 속도 (px/s)
    const magneticRange = 80;   // 자석 효과 범위 (px) - 줄임
    const magneticSpeed = 250;  // 자석으로 빨려들어갈 속도 (px/s)

    // 현재 거리 계산
    const dx = player.x - item.x;
    const dy = player.y - item.y;
    const distance = Math.hypot(dx, dy);

    // 자석 범위 내: 플레이어 방향으로 빨려감
    if(distance < magneticRange) {
      // 자석으로 빨려들어감
      const moveX = (dx / distance) * magneticSpeed * dt;
      const moveY = (dy / distance) * magneticSpeed * dt;
      item.x += moveX;
      item.y += moveY;
      
      // 플레이어에 도달하면 수집됨
      if(distance < player.r + 15) {
        return true; // 수집됨
      }
    } else {
      // 자석 범위 밖: 왼쪽으로만 이동 (높이는 그대로)
      item.x -= leftSpeed * dt;
    }
    
    return false; // 아직 수집 안 됨
  }

  /**
   * 난이도와 스테이지에 따른 적의 속성 결정
   * @param {string} difficulty - 난이도
   * @param {number} stage - 스테이지 (1-9)
   * @returns {string} 적의 속성 ('fire', 'water', 'wind', 'earth', 'light', 'dark', 'ice', 'lightning', 'god')
   */
  function getEnemyElement(difficulty = 'normal', stage = 1) {
    const elements = ['fire', 'water', 'wind', 'earth', 'light', 'dark', 'ice', 'lightning'];
    // 스테이지에 따른 기본 속성 (1-8 스테이지는 순서대로)
    if(stage >= 1 && stage <= 8) {
      return elements[stage - 1];
    }
    // 9 스테이지 (최종 보스): god 속성
    if(stage >= 9) {
      return 'god';
    }
    // 기타 스테이지: 랜덤
    return elements[Math.floor(Math.random() * elements.length)];
  }

  return {
    getConfig,
    getEnemyHp,
    getBossHp,
    getEnemyBulletSpeed,
    getSpawnInterval,
    getMaxEnemiesPerWave,
    getEnemyShootInterval,
    getItemDropRate,
    getPlayerInitialStats,
    getDifficultyInfo,
    getDetailedInfo,
    generateDropItems,
    updateItemMovement,
    getEnemyElement
  };
})();
