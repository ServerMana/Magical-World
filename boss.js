/**
 * boss.js - 보스 관리 모듈
 * 8개 스테이지별 속성 보스와 고유 패턴을 관리합니다.
 */

const BossManager = (() => {
  
  const BOSS_CONFIG = {
    // Stage 1: 불 속성 보스
    fire: {
      name: '???',
      element: 'fire',
      color: '#ff4500',
      image: 'img/boss/Boss.png',
      hp: 800,
      maxHp: 800,
      size: 45,  // 35 → 45로 증가
      x: 500,
      y: 240,
      phases: [
        {
          phase: 1,
          hpThreshold: 1.0,
          bulletPattern: 'flame_spiral',
          shootInterval: 1.2,
          bulletCount: 8,
          bulletSpeed: 120
        },
        {
          phase: 2,
          hpThreshold: 0.66,
          bulletPattern: 'fire_rain',
          shootInterval: 0.8,
          bulletCount: 12,
          bulletSpeed: 140
        },
        {
          phase: 3,
          hpThreshold: 0.33,
          bulletPattern: 'inferno_burst',
          shootInterval: 0.6,
          bulletCount: 16,
          bulletSpeed: 160
        }
      ]
    },

    // Stage 2: 물 속성 보스
    water: {
      name: '???',
      element: 'water',
      color: '#4a90e2',
      image: 'img/boss/Boss.png',
      hp: 900,
      maxHp: 900,
      size: 40,
      x: 500,
      y: 240,
      phases: [
        {
          phase: 1,
          hpThreshold: 1.0,
          bulletPattern: 'wave_cascade',
          shootInterval: 1.0,
          bulletCount: 6,
          bulletSpeed: 100
        },
        {
          phase: 2,
          hpThreshold: 0.66,
          bulletPattern: 'tidal_wave',
          shootInterval: 0.7,
          bulletCount: 10,
          bulletSpeed: 120
        },
        {
          phase: 3,
          hpThreshold: 0.33,
          bulletPattern: 'tsunami',
          shootInterval: 0.5,
          bulletCount: 20,
          bulletSpeed: 150
        }
      ]
    },

    // Stage 3: 바람 속성 보스
    wind: {
      name: '???',
      element: 'wind',
      color: '#7cb342',
      image: 'img/boss/Boss.png',
      hp: 700,
      maxHp: 700,
      size: 32,
      x: 500,
      y: 240,
      phases: [
        {
          phase: 1,
          hpThreshold: 1.0,
          bulletPattern: 'wind_spiral',
          shootInterval: 0.8,
          bulletCount: 12,
          bulletSpeed: 180
        },
        {
          phase: 2,
          hpThreshold: 0.66,
          bulletPattern: 'tornado',
          shootInterval: 0.6,
          bulletCount: 16,
          bulletSpeed: 200
        },
        {
          phase: 3,
          hpThreshold: 0.33,
          bulletPattern: 'hurricane',
          shootInterval: 0.4,
          bulletCount: 24,
          bulletSpeed: 220
        }
      ]
    },

    // Stage 4: 땅 속성 보스
    earth: {
      name: '???',
      element: 'earth',
      color: '#a1887f',
      image: 'img/boss/Boss.png',
      hp: 1400,
      maxHp: 1400,
      size: 55,  // 45 → 55로 증가
      x: 500,
      y: 240,
      phases: [
        {
          phase: 1,
          hpThreshold: 1.0,
          bulletPattern: 'rock_shower',
          shootInterval: 1.5,
          bulletCount: 8,
          bulletSpeed: 80
        },
        {
          phase: 2,
          hpThreshold: 0.66,
          bulletPattern: 'earthquake',
          shootInterval: 1.0,
          bulletCount: 12,
          bulletSpeed: 100
        },
        {
          phase: 3,
          hpThreshold: 0.33,
          bulletPattern: 'avalanche',
          shootInterval: 0.7,
          bulletCount: 20,
          bulletSpeed: 120
        }
      ]
    },

    // Stage 5: 빛 속성 보스
    light: {
      name: '???',
      element: 'light',
      color: '#ffeb3b',
      image: 'img/boss/Boss.png',
      hp: 1600,
      maxHp: 1600,
      size: 48,  // 38 → 48로 증가
      x: 500,
      y: 240,
      phases: [
        {
          phase: 1,
          hpThreshold: 1.0,
          bulletPattern: 'holy_ray',
          shootInterval: 1.0,
          bulletCount: 8,
          bulletSpeed: 150
        },
        {
          phase: 2,
          hpThreshold: 0.66,
          bulletPattern: 'divine_cross',
          shootInterval: 0.8,
          bulletCount: 12,
          bulletSpeed: 170
        },
        {
          phase: 3,
          hpThreshold: 0.33,
          bulletPattern: 'judgement',
          shootInterval: 0.6,
          bulletCount: 16,
          bulletSpeed: 190
        }
      ]
    },

    // Stage 6: 어둠 속성 보스
    dark: {
      name: '???',
      element: 'dark',
      color: '#5e35b1',
      image: 'img/boss/Boss.png',
      hp: 1800,
      maxHp: 1800,
      size: 52,  // 42 → 52로 증가
      x: 500,
      y: 240,
      phases: [
        {
          phase: 1,
          hpThreshold: 1.0,
          bulletPattern: 'dark_spiral',
          shootInterval: 1.1,
          bulletCount: 10,
          bulletSpeed: 130
        },
        {
          phase: 2,
          hpThreshold: 0.66,
          bulletPattern: 'void_burst',
          shootInterval: 0.9,
          bulletCount: 14,
          bulletSpeed: 150
        },
        {
          phase: 3,
          hpThreshold: 0.33,
          bulletPattern: 'black_hole',
          shootInterval: 0.7,
          bulletCount: 18,
          bulletSpeed: 170
        }
      ]
    },

    // Stage 7: 얼음 속성 보스
    ice: {
      name: '???',
      element: 'ice',
      color: '#4dd0e1',
      image: 'img/boss/Boss.png',
      hp: 950,
      maxHp: 950,
      size: 36,
      x: 500,
      y: 240,
      phases: [
        {
          phase: 1,
          hpThreshold: 1.0,
          bulletPattern: 'ice_shard',
          shootInterval: 1.2,
          bulletCount: 6,
          bulletSpeed: 110
        },
        {
          phase: 2,
          hpThreshold: 0.66,
          bulletPattern: 'blizzard',
          shootInterval: 0.8,
          bulletCount: 12,
          bulletSpeed: 130
        },
        {
          phase: 3,
          hpThreshold: 0.33,
          bulletPattern: 'absolute_zero',
          shootInterval: 0.6,
          bulletCount: 24,
          bulletSpeed: 160
        }
      ]
    },

    // Stage 8: 번개 속성 보스 (최종 보스)
    lightning: {
      name: '???',
      element: 'lightning',
      color: '#ffea00',
      image: 'img/boss/Boss.png',
      hp: 1500,
      maxHp: 1500,
      size: 50,
      x: 500,
      y: 240,
      phases: [
        {
          phase: 1,
          hpThreshold: 1.0,
          bulletPattern: 'lightning_bolt',
          shootInterval: 0.9,
          bulletCount: 10,
          bulletSpeed: 200
        },
        {
          phase: 2,
          hpThreshold: 0.66,
          bulletPattern: 'thunder_storm',
          shootInterval: 0.7,
          bulletCount: 16,
          bulletSpeed: 220
        },
        {
          phase: 3,
          hpThreshold: 0.33,
          bulletPattern: 'divine_thunder',
          shootInterval: 0.5,
          bulletCount: 32,
          bulletSpeed: 250
        }
      ]
    },

    // Stage 9: 신 속성 최종 보스
    god: {
      name: '???',
      element: 'god',
      color: '#ffffff',
      image: 'img/boss/Boss.png',
      hp: 3000,
      maxHp: 3000,
      size: 70,  // 60 → 70으로 증가
      x: 500,
      y: 240,
      phases: [
        {
          phase: 1,
          hpThreshold: 1.0,
          bulletPattern: 'divine_cross',
          shootInterval: 0.8,
          bulletCount: 12,
          bulletSpeed: 180
        },
        {
          phase: 2,
          hpThreshold: 0.66,
          bulletPattern: 'judgement',
          shootInterval: 0.6,
          bulletCount: 20,
          bulletSpeed: 200
        },
        {
          phase: 3,
          hpThreshold: 0.33,
          bulletPattern: 'divine_thunder',
          shootInterval: 0.4,
          bulletCount: 40,
          bulletSpeed: 250
        }
      ]
    }
  };

  /**
   * 스테이지에 따른 보스 생성
   */
  function createBoss(stage) {
    const elements = ['fire', 'water', 'wind', 'earth', 'light', 'dark', 'ice', 'lightning', 'god'];
    let element;
    
    if (stage >= 9) {
      element = 'god';  // 9스테이지 이상은 최종 보스
    } else {
      element = elements[Math.min(stage - 1, 7)];
    }
    
    const config = BOSS_CONFIG[element];
    
    return {
      ...config,
      stage: stage,
      currentPhase: 1,
      shootTimer: 0,
      patternTimer: 0,
      moveDirection: 1,
      moveSpeed: 50,
      isAlive: true
    };
  }

  /**
   * 보스 업데이트 (이동, 페이즈 변경)
   */
  function updateBoss(boss, dt, player) {
    if (!boss || !boss.isAlive) return;

    // 보스 이동 (위아래로 천천히 움직임)
    boss.y += boss.moveDirection * boss.moveSpeed * dt;
    if (boss.y <= 100) {
      boss.y = 100;
      boss.moveDirection = 1;
    } else if (boss.y >= 380) {
      boss.y = 380;
      boss.moveDirection = -1;
    }

    // 페이즈 확인
    const hpPercent = boss.hp / boss.maxHp;
    const currentPhaseConfig = boss.phases.find(p => hpPercent >= p.hpThreshold);
    if (currentPhaseConfig && boss.currentPhase !== currentPhaseConfig.phase) {
      boss.currentPhase = currentPhaseConfig.phase;
    }

    // 타이머 업데이트
    boss.shootTimer -= dt;
    boss.patternTimer += dt;
  }

  /**
   * 보스 공격 패턴 실행
   */
  function executeAttackPattern(boss, player, enemyBullets) {
    if (!boss || !boss.isAlive || boss.shootTimer > 0) return;

    const phaseConfig = boss.phases.find(p => p.phase === boss.currentPhase);
    if (!phaseConfig) return;

    const pattern = phaseConfig.bulletPattern;
    const bulletCount = phaseConfig.bulletCount;
    const bulletSpeed = phaseConfig.bulletSpeed;

    switch (pattern) {
      case 'flame_spiral':
        createFlameSpiral(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'fire_rain':
        createFireRain(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'inferno_burst':
        createInfernoBurst(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'wave_cascade':
        createWaveCascade(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'tidal_wave':
        createTidalWave(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'tsunami':
        createTsunami(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'wind_spiral':
        createWindSpiral(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'tornado':
        createTornado(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'hurricane':
        createHurricane(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'rock_shower':
        createRockShower(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'earthquake':
        createEarthquake(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'avalanche':
        createAvalanche(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'holy_ray':
        createHolyRay(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'divine_cross':
        createDivineCross(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'judgement':
        createJudgement(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'dark_spiral':
        createDarkSpiral(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'void_burst':
        createVoidBurst(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'black_hole':
        createBlackHole(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'ice_shard':
        createIceShard(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'blizzard':
        createBlizzard(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'absolute_zero':
        createAbsoluteZero(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'lightning_bolt':
        createLightningBolt(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'thunder_storm':
        createThunderStorm(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
      case 'divine_thunder':
        createDivineThunder(boss, player, enemyBullets, bulletCount, bulletSpeed);
        break;
    }

    boss.shootTimer = phaseConfig.shootInterval;
  }

  // ===== 공격 패턴 구현 =====

  // 불 속성 패턴들
  function createFlameSpiral(boss, player, enemyBullets, count, speed) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i / count) + boss.patternTimer;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 4, color: '#ff4500'
      });
    }
  }

  function createFireRain(boss, player, enemyBullets, count, speed) {
    for (let i = 0; i < count; i++) {
      const targetAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
      const spread = (Math.PI / 4) * (Math.random() - 0.5);
      const angle = targetAngle + spread;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 4, color: '#ff6b6b'
      });
    }
  }

  function createInfernoBurst(boss, player, enemyBullets, count, speed) {
    // 원형 폭발 + 플레이어 추적
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i / count);
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 5, color: '#ff0000'
      });
    }
  }

  // 물 속성 패턴들
  function createWaveCascade(boss, player, enemyBullets, count, speed) {
    const waveHeight = Math.sin(boss.patternTimer * 3) * 30;
    for (let i = 0; i < count; i++) {
      const angle = Math.PI + (i - count/2) * 0.2;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed + waveHeight;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 4, color: '#4a90e2'
      });
    }
  }

  function createTidalWave(boss, player, enemyBullets, count, speed) {
    // 좌우로 퍼지는 파도
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const angle = Math.PI + side * Math.PI / 6;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 4, color: '#66ddff'
      });
    }
  }

  function createTsunami(boss, player, enemyBullets, count, speed) {
    // 전체 화면을 덮는 거대한 파도
    for (let i = 0; i < count; i++) {
      const angle = Math.PI * (0.5 + (i / count) * 1);
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 6, color: '#0066cc'
      });
    }
  }

  // 바람 속성 패턴들  
  function createWindSpiral(boss, player, enemyBullets, count, speed) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i / count) + boss.patternTimer * 2;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 3, color: '#7cb342'
      });
    }
  }

  function createTornado(boss, player, enemyBullets, count, speed) {
    // 토네이도 형태의 나선
    for (let i = 0; i < count; i++) {
      const radius = 50 + (i * 10);
      const angle = boss.patternTimer * 3 + (i * 0.5);
      const x = boss.x + Math.cos(angle) * radius;
      const y = boss.y + Math.sin(angle) * radius;
      const dx = Math.cos(angle + Math.PI/2) * speed;
      const dy = Math.sin(angle + Math.PI/2) * speed;
      enemyBullets.push({
        x: x, y: y, dx: dx, dy: dy, r: 3, color: '#90ee90'
      });
    }
  }

  function createHurricane(boss, player, enemyBullets, count, speed) {
    // 거대한 허리케인
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i / count) + boss.patternTimer * 4;
      const radius = 30 + Math.sin(boss.patternTimer * 2) * 20;
      const x = boss.x + Math.cos(angle) * radius;
      const y = boss.y + Math.sin(angle) * radius;
      const dx = Math.cos(angle + Math.PI/2) * speed * 1.5;
      const dy = Math.sin(angle + Math.PI/2) * speed * 1.5;
      enemyBullets.push({
        x: x, y: y, dx: dx, dy: dy, r: 4, color: '#66cc66'
      });
    }
  }

  // 땅 속성 패턴들
  function createRockShower(boss, player, enemyBullets, count, speed) {
    // 위에서 떨어지는 바위들
    for (let i = 0; i < count; i++) {
      const x = boss.x + (Math.random() - 0.5) * 200;
      enemyBullets.push({
        x: x, y: 0, dx: 0, dy: speed, r: 6, color: '#a1887f'
      });
    }
  }

  function createEarthquake(boss, player, enemyBullets, count, speed) {
    // 지면에서 솟아오르는 바위
    for (let i = 0; i < count; i++) {
      const angle = Math.PI/2 + (Math.random() - 0.5) * Math.PI/3;
      const dx = Math.cos(angle) * speed * 0.5;
      const dy = Math.sin(angle) * speed;
      enemyBullets.push({
        x: boss.x + (Math.random() - 0.5) * 100, 
        y: boss.y + 50, 
        dx: dx, dy: dy, r: 5, color: '#8d6e63'
      });
    }
  }

  function createAvalanche(boss, player, enemyBullets, count, speed) {
    // 눈사태처럼 쏟아지는 바위
    for (let i = 0; i < count; i++) {
      const targetX = player.x + (Math.random() - 0.5) * 100;
      const angle = Math.atan2(400 - boss.y, targetX - boss.x);
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 7, color: '#795548'
      });
    }
  }

  // 빛 속성 패턴들
  function createHolyRay(boss, player, enemyBullets, count, speed) {
    // 방사형 빛줄기
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i / count);
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 4, color: '#ffeb3b'
      });
    }
  }

  function createDivineCross(boss, player, enemyBullets, count, speed) {
    // 십자 형태로 발사
    const directions = [0, Math.PI/2, Math.PI, Math.PI*3/2];
    for (let dir of directions) {
      for (let i = 0; i < count/4; i++) {
        const dx = Math.cos(dir) * speed;
        const dy = Math.sin(dir) * speed;
        enemyBullets.push({
          x: boss.x, y: boss.y, dx: dx, dy: dy, r: 4, color: '#fff59d'
        });
      }
    }
  }

  function createJudgement(boss, player, enemyBullets, count, speed) {
    // 플레이어를 향한 강력한 빛줄기
    const targetAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
    for (let i = 0; i < count; i++) {
      const spread = (i - count/2) * 0.1;
      const angle = targetAngle + spread;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 5, color: '#fdd835'
      });
    }
  }

  // 어둠 속성 패턴들
  function createDarkSpiral(boss, player, enemyBullets, count, speed) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i / count) - boss.patternTimer;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 4, color: '#5e35b1'
      });
    }
  }

  function createVoidBurst(boss, player, enemyBullets, count, speed) {
    // 무작위 방향으로 폭발
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 5, color: '#7e57c2'
      });
    }
  }

  function createBlackHole(boss, player, enemyBullets, count, speed) {
    // 블랙홀 효과 - 안쪽으로 빨려들어가는 듯한 패턴
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i / count) + boss.patternTimer * 5;
      const radius = 80;
      const x = boss.x + Math.cos(angle) * radius;
      const y = boss.y + Math.sin(angle) * radius;
      const dx = Math.cos(angle + Math.PI) * speed;
      const dy = Math.sin(angle + Math.PI) * speed;
      enemyBullets.push({
        x: x, y: y, dx: dx, dy: dy, r: 4, color: '#4a148c'
      });
    }
  }

  // 얼음 속성 패턴들
  function createIceShard(boss, player, enemyBullets, count, speed) {
    // 얼음 파편들
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i / count) + Math.random() * 0.3;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 4, color: '#4dd0e1'
      });
    }
  }

  function createBlizzard(boss, player, enemyBullets, count, speed) {
    // 눈보라 - 불규칙한 움직임
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const wobble = Math.sin(boss.patternTimer * 3 + i) * 30;
      const dx = Math.cos(angle) * speed + wobble;
      const dy = Math.sin(angle) * speed + wobble;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 3, color: '#80deea'
      });
    }
  }

  function createAbsoluteZero(boss, player, enemyBullets, count, speed) {
    // 절대영도 - 모든 방향으로 얼음 파동
    const rings = 3;
    for (let ring = 0; ring < rings; ring++) {
      for (let i = 0; i < count/rings; i++) {
        const angle = (Math.PI * 2 * i / (count/rings));
        const delayedSpeed = speed - (ring * 30);
        const dx = Math.cos(angle) * delayedSpeed;
        const dy = Math.sin(angle) * delayedSpeed;
        enemyBullets.push({
          x: boss.x, y: boss.y, dx: dx, dy: dy, r: 5, color: '#00bcd4'
        });
      }
    }
  }

  // 번개 속성 패턴들
  function createLightningBolt(boss, player, enemyBullets, count, speed) {
    // 지그재그 번개
    const targetAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
    for (let i = 0; i < count; i++) {
      const zigzag = Math.sin(i * 0.5) * 0.3;
      const angle = targetAngle + zigzag;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 3, color: '#ffea00'
      });
    }
  }

  function createThunderStorm(boss, player, enemyBullets, count, speed) {
    // 번개 폭풍
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const erratic = (Math.random() - 0.5) * speed * 0.5;
      const dx = Math.cos(angle) * speed + erratic;
      const dy = Math.sin(angle) * speed + erratic;
      enemyBullets.push({
        x: boss.x + (Math.random() - 0.5) * 50, 
        y: boss.y + (Math.random() - 0.5) * 50, 
        dx: dx, dy: dy, r: 4, color: '#ffc107'
      });
    }
  }

  function createDivineThunder(boss, player, enemyBullets, count, speed) {
    // 신의 번개 - 최종 보스 패턴
    // 플레이어 추적 + 원형 폭발
    const targetAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
    for (let i = 0; i < count/2; i++) {
      const spread = (i - count/4) * 0.05;
      const angle = targetAngle + spread;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 6, color: '#ff6f00'
      });
    }
    
    // 원형 폭발
    for (let i = 0; i < count/2; i++) {
      const angle = (Math.PI * 2 * i / (count/2)) + boss.patternTimer * 3;
      const dx = Math.cos(angle) * speed * 1.2;
      const dy = Math.sin(angle) * speed * 1.2;
      enemyBullets.push({
        x: boss.x, y: boss.y, dx: dx, dy: dy, r: 5, color: '#ff8f00'
      });
    }
  }

  return {
    createBoss,
    updateBoss,
    executeAttackPattern,
    BOSS_CONFIG
  };
})();