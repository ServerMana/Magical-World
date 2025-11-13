/**
 * character.js - 캐릭터 관리 모듈
 * 각 캐릭터의 고유한 샷 패턴, 스킬 효과, 통계를 관리합니다.
 */

const CharacterManager = (() => {
  const CHARACTER_CONFIG = {
    fire: {
      name: '불 - 이그니스',
      emoji: '🔥',
      color: '#ff6b6b',
      image: 'img/character/FirePlayer.png',
      description: '높은 공격력의 열정적인 불의 원소',
      // 기본 샷
      shot: {
        baseDamage: 3.5,      // 기본 1.2 → 3.5로 증가
        fireRate: 0.15,      // 발사 간격 (초)
        bulletSpeed: 400,
        bulletCount: 1,       // 동시 발사 탄 수
        spreadAngle: 0        // 갈라지는 각도
      },
      // 스킬 (마그마 코어 폭발)
      bomb: {
        name: 'Magma Core Explosion',
        cooldown: 2.0,
        effect: 'blast',      // 중심 폭발, 지속 데미지
        damage: 30,
        duration: 1.5,
        radius: 80,
        clearBullets: true
      },
      stats: {
        attackPower: 9,      // 1~10
        speed: 7,
        defense: 5,
        special: '높은 데미지'
      }
    },
    water: {
      name: '물 - 아쿠아리스',
      emoji: '💧',
      color: '#66ddff',
      image: 'img/character/WaterPlayer.png',
      description: '방어와 정화에 능한 물의 원소',
      // 기본 샷
      shot: {
        baseDamage: 2.2,      // 기본 0.8 → 2.2로 증가
        fireRate: 0.12,
        bulletSpeed: 350,
        bulletCount: 2,       // 좌우 동시 발사
        spreadAngle: 15
      },
      // 스킬 (정화의 푸른 장막)
      bomb: {
        name: 'Purifying Blue Veil',
        cooldown: 2.5,
        effect: 'shield',     // 방어막 & 탄 흡수
        damage: 20,
        duration: 2.0,
        radius: 100,
        clearBullets: true,
        shieldDamageReduction: 0.5  // 50% 데미지 감소
      },
      stats: {
        attackPower: 6,
        speed: 6,
        defense: 8,
        special: '방어 능력'
      }
    },
    wind: {
      name: '바람 - 벤투스',
      emoji: '🌪️',
      color: '#90ee90',
      image: 'img/character/WindPlayer.png',
      description: '빠르고 민첩한 바람의 원소',
      // 기본 샷
      shot: {
        baseDamage: 1.8,      // 기본 0.7 → 1.8로 증가
        fireRate: 0.10,       // 빠른 발사
        bulletSpeed: 450,
        bulletCount: 3,
        spreadAngle: 20
      },
      // 스킬 (질풍의 궤적 소거)
      bomb: {
        name: 'Gale Trajectory Sweep',
        cooldown: 1.8,
        effect: 'dash',       // 고속 이동, 무적, 궤적 탄 생성
        damage: 25,
        duration: 0.8,
        radius: 60,
        clearBullets: true,
        invulnerable: true
      },
      stats: {
        attackPower: 5,
        speed: 9,
        defense: 4,
        special: '빠른 이동'
      }
    },
    earth: {
      name: '땅 - 테라온',
      emoji: '🪨',
      color: '#d4a373',
      image: 'img/character/EarthPlayer.png',
      description: '견고한 방어와 압박의 땅의 원소',
      // 기본 샷
      shot: {
        baseDamage: 2.8,      // 기본 1.0 → 2.8로 증가
        fireRate: 0.14,
        bulletSpeed: 380,
        bulletCount: 1,
        spreadAngle: 0
      },
      // 스킬 (대지의 압축 철벽)
      bomb: {
        name: 'Compressed Terra Wall',
        cooldown: 2.2,
        effect: 'wall',       // 좌우 기둥 생성, 보스 압착
        damage: 40,
        duration: 2.5,
        radius: 120,
        clearBullets: false,  // 탄 소거 안 함
        bossDamage: 50
      },
      stats: {
        attackPower: 8,
        speed: 5,
        defense: 9,
        special: '높은 방어'
      }
    },
    light: {
      name: '빛 - 루미네',
      emoji: '✨',
      color: '#ffff99',
      image: 'img/character/LightPlayer.png',
      description: '순간의 섬광과 정화의 빛의 원소',
      // 기본 샷
      shot: {
        baseDamage: 2.5,      // 기본 0.9 → 2.5로 증가
        fireRate: 0.11,
        bulletSpeed: 420,
        bulletCount: 2,
        spreadAngle: 10
      },
      // 스킬 (천상의 섬광 정화)
      bomb: {
        name: 'Divine Flash Purge',
        cooldown: 2.0,
        effect: 'laser',      // 화면 전체 탄막 소거 + 연속 레이저
        damage: 35,
        duration: 2.0,
        radius: 200,
        clearBullets: true,
        laserCount: 5
      },
      stats: {
        attackPower: 7,
        speed: 7,
        defense: 5,
        special: '광역 정화'
      }
    },
    dark: {
      name: '어둠 - 녹투르나',
      emoji: '🌑',
      color: '#9966ff',
      image: 'img/character/DarkPlayer.png',
      description: '미지의 힘으로 모든 것을 끌어당기는 어둠의 원소',
      // 기본 샷
      shot: {
        baseDamage: 2.3,      // 기본 0.85 → 2.3로 증가
        fireRate: 0.13,
        bulletSpeed: 400,
        bulletCount: 1,
        spreadAngle: 0
      },
      // 스킬 (영혼 포획의 그림자)
      bomb: {
        name: 'Shadow Soul Capture',
        cooldown: 2.3,
        effect: 'blackhole',  // 블랙홀 생성, 탄 흡수, 적 경직
        damage: 45,
        duration: 1.5,
        radius: 90,
        clearBullets: true,
        enemyStun: 1.0        // 보스 1초 경직
      },
      stats: {
        attackPower: 6,
        speed: 6,
        defense: 6,
        special: '적 제어'
      }
    },
    ice: {
      name: '냉기 - 프리가',
      emoji: '❄️',
      color: '#00ffff',
      image: 'img/character/IcePlayer.png',
      description: '모든 것을 얼리는 절대 영도의 냉기 원소',
      // 기본 샷
      shot: {
        baseDamage: 2.0,      // 기본 0.75 → 2.0로 증가
        fireRate: 0.16,
        bulletSpeed: 360,
        bulletCount: 1,
        spreadAngle: 0
      },
      // 스킬 (빙결의 절대 영도)
      bomb: {
        name: 'Absolute Zero Freeze',
        cooldown: 2.1,
        effect: 'freeze',     // 화면 모든 것 슬로우
        damage: 0,            // 직접 데미지 없음
        duration: 3.0,
        radius: 200,
        clearBullets: false,
        slowMultiplier: 0.7   // 70% 속도로 느려짐
      },
      stats: {
        attackPower: 5,
        speed: 5,
        defense: 6,
        special: '슬로우 효과'
      }
    },
    lightning: {
      name: '전기 - 제우스온',
      emoji: '⚡',
      color: '#ffaa00',
      image: 'img/character/LightningPlayer.png',
      description: '연쇄적인 번개로 모든 것을 파괴하는 전기 원소',
      // 기본 샷
      shot: {
        baseDamage: 2.5,      // 기본 0.95 → 2.5로 증가
        fireRate: 0.12,
        bulletSpeed: 420,
        bulletCount: 1,
        spreadAngle: 0
      },
      // 스킬 (번개 사슬의 심판)
      bomb: {
        name: 'Chain Lightning Judgment',
        cooldown: 2.0,
        effect: 'chain',      // 랜덤 적에게 연쇄 번개
        damage: 30,
        duration: 1.2,
        radius: 150,
        clearBullets: false,
        chainJumps: 8         // 최대 연쇄 수
      },
      stats: {
        attackPower: 8,
        speed: 8,
        defense: 5,
        special: '연쇄 피해'
      }
    }
  };

  /**
   * 캐릭터 설정 객체 반환
   */
  function getConfig(character = 'fire') {
    return CHARACTER_CONFIG[character] || CHARACTER_CONFIG.fire;
  }

  /**
   * 캐릭터의 기본 정보
   */
  function getInfo(character = 'fire') {
    const config = getConfig(character);
    return {
      name: config.name,
      emoji: config.emoji,
      color: config.color,
      description: config.description
    };
  }

  /**
   * 캐릭터의 기본 샷 설정
   */
  function getShotConfig(character = 'fire') {
    return { ...getConfig(character).shot };
  }

  /**
   * 캐릭터의 스킬 설정
   */
  function getBombConfig(character = 'fire') {
    return { ...getConfig(character).bomb };
  }

  /**
   * 캐릭터의 통계 정보
   */
  function getStats(character = 'fire') {
    return { ...getConfig(character).stats };
  }

  /**
   * 캐릭터 색상
   */
  function getColor(character = 'fire') {
    return getConfig(character).color;
  }

  /**
   * 캐릭터별 초기 파워 (쉽게 얻을 수 있도록)
   */
  function getInitialPowerBonus(character = 'fire') {
    const stats = getStats(character);
    // 공격력이 높을수록 더 많은 초기 파워 필요
    return Math.max(0, 10 - stats.attackPower);
  }

  /**
   * 캐릭터 비교 정보 (UI용)
   */
  function getComparisonInfo(character = 'fire') {
    const config = getConfig(character);
    return {
      name: config.name,
      emoji: config.emoji,
      color: config.color,
      description: config.description,
      bombName: config.bomb.name,
      stats: config.stats,
      shotInfo: {
        fireRate: (1 / config.shot.fireRate).toFixed(1) + '발/초',
        bulletCount: config.shot.bulletCount + '발',
        damage: config.shot.baseDamage.toFixed(1)
      }
    };
  }

  /**
   * 모든 캐릭터 목록 (메뉴용)
   */
  function getAllCharacters() {
    return Object.keys(CHARACTER_CONFIG).map(key => ({
      id: key,
      ...getInfo(key)
    }));
  }

  /**
   * 스킬 쿨다운 적용 (게임 진행 중 사용)
   */
  function applyBombEffect(character, gameState, enemyBullets, enemies, player) {
    const config = CHARACTER_CONFIG[character];
    const bombCfg = config.bomb;

    switch(bombCfg.effect) {
      case 'blast':         // 불: 폭발
        return { clearBullets: true, bossDamage: bombCfg.damage, particleCount: 50 };
      
      case 'shield':        // 물: 방어막
        return { shieldActive: true, duration: bombCfg.duration, damageReduction: bombCfg.shieldDamageReduction };
      
      case 'dash':          // 바람: 고속 이동
        return { dashMode: true, invulnerable: bombCfg.invulnerable, duration: bombCfg.duration };
      
      case 'wall':          // 땅: 암석 기둥
        return { wallActive: true, duration: bombCfg.duration, bossDamage: bombCfg.bossDamage };
      
      case 'laser':         // 빛: 레이저
        return { clearBullets: true, laserCount: bombCfg.laserCount, damage: bombCfg.damage };
      
      case 'blackhole':     // 어둠: 블랙홀
        return { blackholeActive: true, radius: bombCfg.radius, enemyStun: bombCfg.enemyStun };
      
      case 'freeze':        // 냉기: 슬로우
        return { freezeActive: true, slowMultiplier: bombCfg.slowMultiplier, duration: bombCfg.duration };
      
      case 'chain':         // 전기: 연쇄 번개
        return { chainActive: true, chainJumps: bombCfg.chainJumps, damage: bombCfg.damage };
      
      default:
        return {};
    }
  }

  /**
   * 속성 상성에 따른 데미지 계산
   * @param {string} attackerElement - 공격자 속성 ('fire', 'water', 'wind', 'earth', 'light', 'dark', 'ice', 'lightning')
   * @param {string} targetElement - 피격자 속성
   * @param {number} baseDamage - 기본 데미지
   * @returns {number} 상성에 따라 조정된 데미지
   */
  function calculateDamageWithAffinity(attackerElement, targetElement, baseDamage) {
    // 속성 상성표 (공격자 → 방어자)
    // 1.5x = 유리, 1.0x = 중립, 0.8x = 불리
    const affinityTable = {
      fire: {
        ice: 1.5,         // 불 > 얼음
        wind: 0.8,        // 불 < 바람
        earth: 1.2,       // 불 > 대지
        lightning: 0.9    // 불 < 번개
      },
      water: {
        fire: 1.5,        // 물 > 불
        earth: 0.8,       // 물 < 대지
        ice: 1.2,         // 물 > 얼음
        lightning: 0.9    // 물 < 번개
      },
      wind: {
        earth: 1.5,       // 바람 > 대지
        fire: 1.2,        // 바람 > 불
        water: 0.8,       // 바람 < 물
        ice: 0.9          // 바람 < 얼음
      },
      earth: {
        lightning: 1.5,   // 대지 > 번개
        water: 1.2,       // 대지 > 물
        wind: 0.8,        // 대지 < 바람
        fire: 0.9         // 대지 < 불
      },
      light: {
        dark: 1.5,        // 빛 > 어둠
        fire: 1.2,        // 빛 > 불
        ice: 0.8,         // 빛 < 얼음
        earth: 0.9        // 빛 < 대지
      },
      dark: {
        light: 1.5,       // 어둠 > 빛
        water: 1.2,       // 어둠 > 물
        wind: 0.8,        // 어둠 < 바람
        lightning: 0.9    // 어둠 < 번개
      },
      ice: {
        wind: 1.5,        // 얼음 > 바람
        water: 1.2,       // 얼음 > 물
        fire: 0.8,        // 얼음 < 불
        lightning: 0.9    // 얼음 < 번개
      },
      lightning: {
        water: 1.5,       // 번개 > 물
        ice: 1.2,         // 번개 > 얼음
        earth: 0.8,       // 번개 < 대지
        fire: 0.9         // 번개 < 불
      }
    };

    // 해당 속성의 상성표 조회
    const multiplier = affinityTable[attackerElement]?.[targetElement] || 1.0;
    return Math.round(baseDamage * multiplier * 100) / 100; // 소수점 2자리
  }

  /**
   * 두 속성 간 상성 텍스트 반환
   * @param {string} attackerElement - 공격자 속성
   * @param {string} targetElement - 피격자 속성
   * @returns {string} '유리', '중립', '불리'
   */
  function getAffinityText(attackerElement, targetElement) {
    const damage = calculateDamageWithAffinity(attackerElement, targetElement, 1.0);
    if(damage > 1.2) return '유리! 💪';
    if(damage < 0.95) return '불리...';
    return '중립';
  }

  return {
    getConfig,
    getInfo,
    getShotConfig,
    getBombConfig,
    getStats,
    getColor,
    getInitialPowerBonus,
    getComparisonInfo,
    getAllCharacters,
    applyBombEffect,
    calculateDamageWithAffinity,
    getAffinityText
  };
})();
