/**
 * enemy.js - 적 관리 모듈
 * 일반 적의 생성, 움직임, 공격, 렌더링을 중앙에서 관리합니다.
 */

const EnemyManager = (() => {
  // 속성별 색상 정의
  const ELEMENT_COLORS = {
    fire: '#ff6b6b',
    water: '#4a90e2',
    wind: '#7cb342',
    earth: '#a1887f',
    light: '#ffeb3b',
    dark: '#5e35b1',
    ice: '#4dd0e1',
    lightning: '#ffea00',
    god: '#ffffff'
  };

  // 적 이미지 로드
  const enemyImages = {};
  const elements = ['Fire', 'Water', 'Wind', 'Earth', 'Light', 'Dark', 'Ice', 'Lightning'];
  
  for(const element of elements) {
    const img = new Image();
    const imagePath = `img/enemy/${element}Enemy.png`;
    
    // 즉시 등록 (로딩 중에도 참조 가능)
    enemyImages[element.toLowerCase()] = img;
    img.loaded = false;
    
    img.onload = () => {
      img.loaded = true;
      console.log(`✅ 적 이미지 로드 성공: ${imagePath}`);
    };
    
    img.onerror = () => {
      img.loaded = false;
      console.error(`❌ 적 이미지 로드 실패: ${imagePath}`);
    };
    
    img.src = imagePath;
  }

  // 적 기본 설정
  const ENEMY_CONFIG = {
    baseRadius: 18,  // 12 → 18로 증가 (적 크기 확대)
    baseSpeed: 20,
    baseShotInterval: 1.2,
    shotSpread: 0.5,  // 발사 간격 랜덤 요소
    bulletRadius: 4  // 3 → 4로 증가 (탄환 크기 확대)
  };

  /**
   * 새로운 적 생성
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {string} element - 속성 ('fire', 'water', 'wind', 'earth', 'light', 'dark', 'ice', 'lightning')
   * @param {number} hp - 체력
   * @param {string} difficulty - 난이도
   * @param {number} stage - 스테이지
   * @returns {Object} 적 객체
   */
  function createEnemy(x, y, element, hp, difficulty = 'normal', stage = 1) {
    return {
      x: x,
      y: y,
      r: ENEMY_CONFIG.baseRadius,
      hp: hp,
      maxHp: hp,
      element: element,
      color: ELEMENT_COLORS[element] || '#ff6b6b',
      speed: ENEMY_CONFIG.baseSpeed,
      shootTimer: ENEMY_CONFIG.baseShotInterval + Math.random() * ENEMY_CONFIG.shotSpread,
      difficulty: difficulty,
      stage: stage,
      // 움직임 패턴을 위한 추가 속성
      movePattern: 'linear',  // 'linear', 'wave', 'zigzag'
      moveTimer: 0,
      isAlive: true,
      _dead: false
    };
  }

  /**
   * 적 업데이트 (움직임, 공격)
   * @param {Object} enemy - 적 객체
   * @param {Object} player - 플레이어 객체
   * @param {Array} enemyBullets - 적 탄환 배열
   * @param {number} dt - 델타 시간
   * @param {string} difficulty - 현재 난이도
   */
  function updateEnemy(enemy, player, enemyBullets, dt, difficulty) {
    if (!enemy.isAlive) return;

    // 움직임 업데이트
    updateEnemyMovement(enemy, dt);

    // 공격 업데이트
    updateEnemyShooting(enemy, player, enemyBullets, dt, difficulty);

    // 체력 확인
    if (enemy.hp <= 0) {
      enemy.isAlive = false;
      enemy._dead = true;
    }
  }

  /**
   * 적 움직임 패턴 업데이트
   * @param {Object} enemy - 적 객체
   * @param {number} dt - 델타 시간
   */
  function updateEnemyMovement(enemy, dt) {
    enemy.moveTimer += dt;

    switch (enemy.movePattern) {
      case 'linear':
        // 직선 이동 (왼쪽으로)
        enemy.x -= enemy.speed * dt;
        break;

      case 'wave':
        // 파도 움직임
        enemy.x -= enemy.speed * dt;
        enemy.y += Math.sin(enemy.moveTimer * 3) * 30 * dt;
        break;

      case 'zigzag':
        // 지그재그 움직임
        enemy.x -= enemy.speed * dt;
        enemy.y += Math.sin(enemy.moveTimer * 5) * 50 * dt;
        break;

      default:
        enemy.x -= enemy.speed * dt;
        break;
    }
  }

  /**
   * 적 공격 업데이트
   * @param {Object} enemy - 적 객체
   * @param {Object} player - 플레이어 객체
   * @param {Array} enemyBullets - 적 탄환 배열
   * @param {number} dt - 델타 시간
   * @param {string} difficulty - 난이도
   */
  function updateEnemyShooting(enemy, player, enemyBullets, dt, difficulty) {
    enemy.shootTimer -= dt;

    if (enemy.shootTimer <= 0) {
      // 플레이어를 향해 발사
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const mag = Math.hypot(dx, dy);

      if (mag > 0) {
        const speed = DifficultyManager.getEnemyBulletSpeed(difficulty);
        
        // 속성별 탄환 패턴
        createEnemyBullet(enemy, player, enemyBullets, speed, dx / mag, dy / mag);
      }

      // 다음 발사 시간 설정
      const shootInterval = DifficultyManager.getEnemyShootInterval(difficulty);
      enemy.shootTimer = shootInterval + Math.random() * ENEMY_CONFIG.shotSpread;
    }
  }

  /**
   * 속성별 적 탄환 생성
   * @param {Object} enemy - 적 객체
   * @param {Object} player - 플레이어 객체
   * @param {Array} enemyBullets - 적 탄환 배열
   * @param {number} speed - 탄환 속도
   * @param {number} dirX - X 방향 (정규화됨)
   * @param {number} dirY - Y 방향 (정규화됨)
   */
  function createEnemyBullet(enemy, player, enemyBullets, speed, dirX, dirY) {
    const bulletColor = enemy.color;

    switch (enemy.element) {
      case 'fire':
        // 화염: 단일 탄환 + 작은 확산
        enemyBullets.push({
          x: enemy.x, y: enemy.y,
          dx: dirX * speed, dy: dirY * speed,
          r: ENEMY_CONFIG.bulletRadius, color: bulletColor
        });
        break;

      case 'water':
        // 물: 3발 연속 (약간의 지연)
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            enemyBullets.push({
              x: enemy.x, y: enemy.y,
              dx: dirX * speed, dy: dirY * speed,
              r: ENEMY_CONFIG.bulletRadius, color: bulletColor
            });
          }, i * 100);
        }
        break;

      case 'wind':
        // 바람: 곡선 탄환 (좌우로 휘어짐)
        const curve = (Math.random() - 0.5) * 0.3;
        enemyBullets.push({
          x: enemy.x, y: enemy.y,
          dx: dirX * speed + curve, dy: dirY * speed,
          r: ENEMY_CONFIG.bulletRadius, color: bulletColor
        });
        break;

      case 'earth':
        // 땅: 큰 탄환 1발
        enemyBullets.push({
          x: enemy.x, y: enemy.y,
          dx: dirX * speed * 0.8, dy: dirY * speed * 0.8,
          r: ENEMY_CONFIG.bulletRadius + 2, color: bulletColor
        });
        break;

      case 'light':
        // 빛: 빠른 탄환
        enemyBullets.push({
          x: enemy.x, y: enemy.y,
          dx: dirX * speed * 1.3, dy: dirY * speed * 1.3,
          r: ENEMY_CONFIG.bulletRadius - 1, color: bulletColor
        });
        break;

      case 'dark':
        // 어둠: 추적 탄환 (느림)
        enemyBullets.push({
          x: enemy.x, y: enemy.y,
          dx: dirX * speed * 0.7, dy: dirY * speed * 0.7,
          r: ENEMY_CONFIG.bulletRadius, color: bulletColor,
          homing: true  // 추적 기능 플래그
        });
        break;

      case 'ice':
        // 얼음: 직선 탄환 + 잔상
        enemyBullets.push({
          x: enemy.x, y: enemy.y,
          dx: dirX * speed, dy: dirY * speed,
          r: ENEMY_CONFIG.bulletRadius, color: bulletColor,
          trail: true  // 잔상 플래그
        });
        break;

      case 'lightning':
        // 번개: 지그재그 탄환
        enemyBullets.push({
          x: enemy.x, y: enemy.y,
          dx: dirX * speed, dy: dirY * speed,
          r: ENEMY_CONFIG.bulletRadius, color: bulletColor,
          zigzag: true  // 지그재그 플래그
        });
        break;

      case 'god':
        // 신: 십자형 탄환 (4방향 동시 발사)
        const directions = [0, Math.PI/2, Math.PI, Math.PI*3/2];
        for(let dir of directions) {
          enemyBullets.push({
            x: enemy.x, y: enemy.y,
            dx: Math.cos(dir) * speed, dy: Math.sin(dir) * speed,
            r: ENEMY_CONFIG.bulletRadius + 1, color: bulletColor,
            divine: true  // 신성 플래그
          });
        }
        break;

      default:
        // 기본 탄환
        enemyBullets.push({
          x: enemy.x, y: enemy.y,
          dx: dirX * speed, dy: dirY * speed,
          r: ENEMY_CONFIG.bulletRadius, color: bulletColor
        });
        break;
    }
  }

  /**
   * 적 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {Object} enemy - 적 객체
   * @param {number} maxHp - 해당 스테이지 적의 최대 체력 (HP바 표시용)
   */
  function renderEnemy(ctx, enemy, maxHp) {
    if (!enemy.isAlive) return;

    // 적 이미지 표시
    const enemyImage = enemyImages[enemy.element];
    if (enemyImage && enemyImage.loaded && enemyImage.complete) {
      // 적 이미지 렌더링 (고품질)
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // 이미지 크기를 적의 반지름에 맞춰 조정 (반지름의 2배 크기)
      const imageSize = enemy.r * 2;
      ctx.drawImage(enemyImage, 
        enemy.x - imageSize / 2, 
        enemy.y - imageSize / 2, 
        imageSize, 
        imageSize
      );
      ctx.restore();
    } else {
      // 이미지 로딩 실패 시 기존 원형 표시
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 속성별 추가 시각 효과
    renderElementEffect(ctx, enemy);

    // HP 바
    renderEnemyHealthBar(ctx, enemy, maxHp);
  }

  /**
   * 속성별 시각 효과 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {Object} enemy - 적 객체
   */
  function renderElementEffect(ctx, enemy) {
    const time = enemy.moveTimer;

    switch (enemy.element) {
      case 'fire':
        // 화염 효과: 작은 파티클
        ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
        for (let i = 0; i < 3; i++) {
          const angle = time * 5 + i * 2;
          const x = enemy.x + Math.cos(angle) * (enemy.r + 3);
          const y = enemy.y + Math.sin(angle) * (enemy.r + 3);
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'water':
        // 물 효과: 물방울
        ctx.strokeStyle = 'rgba(102, 221, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.r + 2, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'wind':
        // 바람 효과: 소용돌이
        ctx.strokeStyle = 'rgba(144, 238, 144, 0.7)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const radius = enemy.r + 1 + i * 2;
          const rotation = time * (2 + i);
          ctx.beginPath();
          ctx.arc(enemy.x + Math.cos(rotation) * 2, enemy.y + Math.sin(rotation) * 2, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      case 'earth':
        // 땅 효과: 각진 테두리
        ctx.strokeStyle = 'rgba(139, 115, 85, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(enemy.x - enemy.r, enemy.y - enemy.r, enemy.r * 2, enemy.r * 2);
        ctx.stroke();
        break;

      case 'light':
        // 빛 효과: 광채
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        break;

      case 'dark':
        // 어둠 효과: 어두운 오라
        ctx.fillStyle = 'rgba(94, 53, 177, 0.3)';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.r + 5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'ice':
        // 얼음 효과: 결정 패턴
        ctx.strokeStyle = 'rgba(0, 191, 255, 0.6)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x1 = enemy.x + Math.cos(angle) * enemy.r;
          const y1 = enemy.y + Math.sin(angle) * enemy.r;
          ctx.beginPath();
          ctx.moveTo(enemy.x, enemy.y);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
        break;

      case 'lightning':
        // 번개 효과: 전기 스파크
        ctx.strokeStyle = 'rgba(255, 234, 0, 0.8)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const angle = time * 10 + i * Math.PI / 2;
          const x1 = enemy.x + Math.cos(angle) * enemy.r;
          const y1 = enemy.y + Math.sin(angle) * enemy.r;
          const x2 = enemy.x + Math.cos(angle) * (enemy.r + 5);
          const y2 = enemy.y + Math.sin(angle) * (enemy.r + 5);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        break;

      case 'god':
        // 신 효과: 신성한 오라와 십자 빛
        // 밝은 오라
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.r + 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // 십자 형태의 빛
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 3;
        // 수직선
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y - enemy.r - 10);
        ctx.lineTo(enemy.x, enemy.y + enemy.r + 10);
        ctx.stroke();
        // 수평선
        ctx.beginPath();
        ctx.moveTo(enemy.x - enemy.r - 10, enemy.y);
        ctx.lineTo(enemy.x + enemy.r + 10, enemy.y);
        ctx.stroke();
        break;
    }
  }

  /**
   * 적 체력바 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {Object} enemy - 적 객체
   * @param {number} maxHp - 최대 체력
   */
  function renderEnemyHealthBar(ctx, enemy, maxHp) {
    const barWidth = 44;
    const barHeight = 6;
    const barX = enemy.x - barWidth / 2;
    const barY = enemy.y - enemy.r - 16;

    // 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // 체력바
    const hpPercent = Math.max(0, enemy.hp / maxHp);
    let hpColor = '#7fff7f';
    if (hpPercent < 0.5) hpColor = '#ffff7f';
    if (hpPercent < 0.25) hpColor = '#ff7f7f';

    ctx.fillStyle = hpColor;
    ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
  }

  /**
   * 웨이브 스폰 - 여러 적을 한번에 생성
   * @param {number} count - 스폰할 적 수
   * @param {number} canvasWidth - Canvas 너비
   * @param {number} canvasHeight - Canvas 높이
   * @param {string} element - 속성
   * @param {number} hp - 체력
   * @param {string} difficulty - 난이도
   * @param {number} stage - 스테이지
   * @returns {Array} 생성된 적 배열
   */
  function spawnEnemyWave(count, canvasWidth, canvasHeight, element, hp, difficulty, stage) {
    const enemies = [];
    const spawnX = canvasWidth - canvasWidth * 0.09375;  // 오른쪽에서 스폰

    for (let i = 0; i < count; i++) {
      // Y 좌표는 화면의 10-90% 영역에 랜덤 배치
      const spawnY = Math.random() * (canvasHeight - canvasHeight * 0.16667) + canvasHeight * 0.08333;
      
      // 움직임 패턴 랜덤 선택 (높은 스테이지일수록 복잡한 패턴)
      let movePattern = 'linear';
      if (stage >= 3 && Math.random() < 0.3) movePattern = 'wave';
      if (stage >= 5 && Math.random() < 0.2) movePattern = 'zigzag';

      const enemy = createEnemy(spawnX, spawnY, element, hp, difficulty, stage);
      enemy.movePattern = movePattern;

      enemies.push(enemy);
    }

    return enemies;
  }

  /**
   * 적 탄환 업데이트 (특수 효과 포함)
   * @param {Object} bullet - 탄환 객체
   * @param {Object} player - 플레이어 객체
   * @param {number} dt - 델타 시간
   * @returns {boolean} 탄환이 계속 존재해야 하면 true
   */
  function updateEnemyBullet(bullet, player, dt) {
    // 기본 이동
    bullet.x += bullet.dx * dt;
    bullet.y += bullet.dy * dt;

    // 특수 효과 처리
    if (bullet.homing && player) {
      // 추적 탄환 (어둠 속성)
      const dx = player.x - bullet.x;
      const dy = player.y - bullet.y;
      const mag = Math.hypot(dx, dy);
      
      if (mag > 0) {
        const homingForce = 50; // 추적 강도
        bullet.dx += (dx / mag) * homingForce * dt;
        bullet.dy += (dy / mag) * homingForce * dt;
      }
    }

    if (bullet.zigzag) {
      // 지그재그 탄환 (번개 속성)
      bullet._zigzagTimer = (bullet._zigzagTimer || 0) + dt;
      bullet.y += Math.sin(bullet._zigzagTimer * 10) * 30 * dt;
    }

    // 화면 밖 확인
    return bullet.x > -20 && bullet.x < 2000 && bullet.y > -20 && bullet.y < 1200;
  }

  /**
   * 적 탄환 렌더링 (특수 효과 포함)
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {Object} bullet - 탄환 객체
   */
  function renderEnemyBullet(ctx, bullet) {
    // 기본 탄환 렌더링
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
    ctx.fill();

    // 특수 효과 렌더링
    if (bullet.trail) {
      // 잔상 효과 (얼음 속성)
      ctx.fillStyle = bullet.color.replace(')', ', 0.3)').replace('rgb', 'rgba');
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(bullet.x - bullet.dx * i * 0.02, bullet.y - bullet.dy * i * 0.02, bullet.r * (1 - i * 0.2), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (bullet.homing) {
      // 추적 표시 (어둠 속성)
      ctx.strokeStyle = 'rgba(255, 0, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.r + 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (bullet.divine) {
      // 신성 표시 (신 속성)
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.r + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  return {
    createEnemy,
    updateEnemy,
    renderEnemy,
    spawnEnemyWave,
    updateEnemyBullet,
    renderEnemyBullet,
    ELEMENT_COLORS,
    ENEMY_CONFIG
  };
})();