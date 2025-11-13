// 탄막 슈팅 게임 - 메인 엔진
(function(){
  // ===== 게임 상태 =====
  let gameState = {
    currentScreen: 'title',
    selectedDifficulty: 'normal',
    selectedCharacter: 'fire',
    isPaused: false,
    isGameRunning: false,
    score: 0,
    hiScore: localStorage.getItem('hiScore') || 0,
    settings: {
      bgmVolume: parseInt(localStorage.getItem('bgmVolume')) || 70,
      sfxVolume: parseInt(localStorage.getItem('sfxVolume')) || 80,
      screenFlash: localStorage.getItem('screenFlash') !== 'false',
      particleEffects: localStorage.getItem('particleEffects') !== 'false'
    }
  };

  // ===== 화면 전환 함수 =====
  window.goToMenu = function(screenName) {
    // 사용자 클릭으로 음악 권한 획득
    MusicManager.requestPermission();
    
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    const targetScreen = document.getElementById(`screen-${screenName}`);
    if(targetScreen) {
      targetScreen.classList.add('active');
      gameState.currentScreen = screenName;
      
      // 타이틀 화면에서 BGM 재생 및 배경 이미지 시작
      if(screenName === 'title') {
        MusicManager.playBGM('bgm', 0.5);
        initializeTitleBackground();
      }
      
      // 캐릭터 선택 화면 진입 시 저장된 Canvas 크기 표시
      if(screenName === 'character') {
        setTimeout(() => {
          const widthInput = document.getElementById('character-canvas-width');
          const heightInput = document.getElementById('character-canvas-height');
          if(widthInput && heightInput) {
            widthInput.value = canvasWidth;
            heightInput.value = canvasHeight;
          }
        }, 100);
      }
      
      // 설정 화면 진입 시 저장된 Canvas 크기 표시
      if(screenName === 'settings') {
        setTimeout(() => {
          const widthInput = document.getElementById('canvas-width');
          const heightInput = document.getElementById('canvas-height');
          if(widthInput && heightInput) {
            widthInput.value = canvasWidth;
            heightInput.value = canvasHeight;
          }
        }, 100);
      }
      
      if(screenName === 'game') {
        initializeGame();
      }
    }
  };

  // ===== 난이도 선택 =====
  window.selectDifficulty = function(difficulty) {
    gameState.selectedDifficulty = difficulty;
    goToMenu('character');
  };

  // ===== 캐릭터 선택 =====
  window.selectCharacter = function(character) {
    gameState.selectedCharacter = character;
    showGameConfirm();  // 확인 화면으로 이동
  };

  // ===== 게임 설정 확인 화면 =====
  function showGameConfirm() {
    const diffInfo = DifficultyManager.getDifficultyInfo(gameState.selectedDifficulty);
    const charInfo = CharacterManager.getInfo(gameState.selectedCharacter);
    const bombName = CharacterManager.getBombConfig(gameState.selectedCharacter).name;
    
    document.getElementById('confirm-difficulty').innerText = diffInfo.label;
    document.getElementById('confirm-character').innerText = charInfo.name;
    document.getElementById('confirm-skill').innerText = bombName;
    
    // 능력치 표시
    updateStatsPanel();
    
    // 캐릭터 이미지 표시
    const confirmIconEmoji = document.getElementById('confirm-icon-emoji');
    const confirmIconImage = document.getElementById('confirm-icon-image');
    const imagePath = charInfo.image;
    
    // 이미 로드된 캐릭터 이미지 객체 사용
    const loadedImage = characterImages[gameState.selectedCharacter];
    
    if(loadedImage && loadedImage.loaded && loadedImage.complete) {
      // 로드된 이미지 사용
      confirmIconEmoji.style.display = 'none';
      confirmIconImage.style.display = 'block';
      confirmIconImage.src = loadedImage.src;
      console.log(`✅ 확인 화면 캐릭터 이미지 표시: ${gameState.selectedCharacter}`);
    } else if(imagePath) {
      // fallback: 직접 경로 사용
      confirmIconEmoji.style.display = 'none';
      confirmIconImage.style.display = 'block';
      confirmIconImage.src = imagePath;
      
      // 이미지 로드 실패 처리
      confirmIconImage.onerror = function() {
        console.error(`❌ 확인 화면 이미지 로드 실패: ${imagePath}`);
        confirmIconEmoji.style.display = 'flex';
        confirmIconImage.style.display = 'none';
        confirmIconEmoji.innerText = charInfo.emoji;
      };
      
      confirmIconImage.onload = function() {
        console.log(`✅ 확인 화면 이미지 로드 성공: ${imagePath}`);
      };
    } else {
      // 이미지 없으면 이모지 표시
      console.warn(`⚠️ 캐릭터 이미지 없음, 이모지 사용: ${gameState.selectedCharacter}`);
      confirmIconEmoji.style.display = 'flex';
      confirmIconImage.style.display = 'none';
      confirmIconEmoji.innerText = charInfo.emoji;
    }
    
    goToMenu('confirm');
  }

  // ===== 능력치 패널 업데이트 =====
  function updateStatsPanel() {
    const charInfo = CharacterManager.getInfo(gameState.selectedCharacter);
    const shotConfig = CharacterManager.getShotConfig(gameState.selectedCharacter);
    const bombConfig = CharacterManager.getBombConfig(gameState.selectedCharacter);
    const comparisonInfo = CharacterManager.getComparisonInfo(gameState.selectedCharacter);
    
    // 능력치를 1-5 스타로 변환하는 함수
    function getStarRating(value, max) {
      const rating = Math.min(5, Math.max(1, Math.round((value / max) * 5)));
      let stars = '';
      for(let i = 0; i < 5; i++) {
        stars += i < rating ? '★' : '☆';
      }
      return stars;
    }
    
    // 공격력 (baseDamage 기준, 최대 3.5)
    const attackStars = getStarRating(shotConfig.baseDamage, 3.5);
    document.getElementById('stat-attack-display').innerText = attackStars;
    
    // 발사속도 (bulletCount 기준, 최대 3)
    const speedStars = getStarRating(shotConfig.bulletCount, 3);
    document.getElementById('stat-speed-display').innerText = speedStars;
    
    // 탄막범위 (spreadAngle 기준, 최대 30)
    const spreadStars = getStarRating(shotConfig.spreadAngle, 30);
    document.getElementById('stat-spread-display').innerText = spreadStars;
    
    // 스킬위력 (bombDamage 기준, 최대 5)
    const bombStars = getStarRating(bombConfig.damage, 5);
    document.getElementById('stat-bomb-display').innerText = bombStars;
  }

  // ===== 게임 시작 =====
  window.startGame = function() {
    goToMenu('game');
  };

  // ===== 게임 초기화 =====
  function initializeGame() {
    gameState.isGameRunning = true;
    gameState.isPaused = false;
    gameState.score = 0;

    const diffInfo = DifficultyManager.getDifficultyInfo(gameState.selectedDifficulty);
    const charInfo = CharacterManager.getInfo(gameState.selectedCharacter);
    document.getElementById('difficulty-display').innerText = `DIFFICULTY: ${diffInfo.label}`;
    document.getElementById('character-display').innerText = `CHARACTER: ${charInfo.name}`;

    // 게임 BGM 재생
    MusicManager.playBGM('bgm', 0.7);

    setupGameEngine();
    gameLoop();
  }

  // ===== 게임 일시정지 =====
  window.resumeGame = function() {
    gameState.isPaused = false;
    document.getElementById('pause-menu').style.display = 'none';
    MusicManager.resumeBGM();
    gameLoop();
  };

  window.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && gameState.isGameRunning && gameState.currentScreen === 'game') {
      gameState.isPaused = !gameState.isPaused;
      if(gameState.isPaused) {
        document.getElementById('pause-menu').style.display = 'flex';
        MusicManager.pauseBGM();
      } else {
        document.getElementById('pause-menu').style.display = 'none';
        MusicManager.resumeBGM();
        gameLoop();
      }
    }
  });

  // ===== 설정 =====
  document.getElementById('bgm-volume')?.addEventListener('input', (e) => {
    const value = e.target.value;
    gameState.settings.bgmVolume = value;
    document.getElementById('bgm-value').innerText = value + '%';
    localStorage.setItem('bgmVolume', value);
    MusicManager.setBGMVolume(value / 100);
  });

  document.getElementById('sfx-volume')?.addEventListener('input', (e) => {
    const value = e.target.value;
    gameState.settings.sfxVolume = value;
    document.getElementById('sfx-value').innerText = value + '%';
    localStorage.setItem('sfxVolume', value);
    MusicManager.setSFXVolume(value / 100);
  });

  document.getElementById('screen-flash')?.addEventListener('change', (e) => {
    gameState.settings.screenFlash = e.target.checked;
    localStorage.setItem('screenFlash', e.target.checked);
  });

  document.getElementById('particle-effects')?.addEventListener('change', (e) => {
    gameState.settings.particleEffects = e.target.checked;
    localStorage.setItem('particleEffects', e.target.checked);
  });

  window.resetSettings = function() {
    gameState.settings = {
      bgmVolume: 70,
      sfxVolume: 80,
      screenFlash: true,
      particleEffects: true
    };
    document.getElementById('bgm-volume').value = 70;
    document.getElementById('sfx-volume').value = 70;
    document.getElementById('bgm-value').innerText = '70%';
    document.getElementById('sfx-value').innerText = '80%';
    document.getElementById('screen-flash').checked = true;
    document.getElementById('particle-effects').checked = true;

    Object.keys(gameState.settings).forEach(key => {
      localStorage.removeItem(key);
    });
  };

  // ===== 게임 엔진 =====
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  
  // 기본 캔버스 크기 (1920×1080) - 설정 저장소에서 불러오기
  let canvasWidth = parseInt(localStorage.getItem('canvasWidth')) || 1920;
  let canvasHeight = parseInt(localStorage.getItem('canvasHeight')) || 1080;
  
  // Canvas 크기 초기화
  function initializeCanvasSize() {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
  }
  
  initializeCanvasSize();
  let W = canvasWidth;
  let H = canvasHeight;
  
  // Canvas 크기 동적 업데이트 함수 (게임 중에도 적용 가능)
  function updateCanvasSize(newWidth, newHeight) {
    canvasWidth = newWidth;
    canvasHeight = newHeight;
    W = newWidth;
    H = newHeight;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    
    localStorage.setItem('canvasWidth', canvasWidth);
    localStorage.setItem('canvasHeight', canvasHeight);
    
    console.log(`✅ Canvas 크기 변경: ${canvasWidth} × ${canvasHeight}`);
  }
  
  // Canvas 크기 적용 함수 (설정 화면용)
  window.applyCanvasSize = function() {
    const widthInput = document.getElementById('canvas-width');
    const heightInput = document.getElementById('canvas-height');
    
    if(!widthInput || !heightInput) {
      alert('입력 필드를 찾을 수 없습니다.');
      return;
    }
    
    const newWidth = parseInt(widthInput.value);
    const newHeight = parseInt(heightInput.value);
    
    if(!isNaN(newWidth) && !isNaN(newHeight) && 
       newWidth >= 640 && newWidth <= 1920 && 
       newHeight >= 480 && newHeight <= 1080) {
      updateCanvasSize(newWidth, newHeight);
      alert(`✅ 캔버스 크기가 ${canvasWidth} × ${canvasHeight}로 설정되었습니다!`);
    } else {
      alert('❌ 유효한 범위: 가로 640~1920, 세로 480~1080');
    }
  };
  
  // Canvas 크기 적용 함수 (캐릭터 선택 화면용)
  window.applyCanvasFromCharacter = function() {
    const widthInput = document.getElementById('character-canvas-width');
    const heightInput = document.getElementById('character-canvas-height');
    
    if(!widthInput || !heightInput) {
      console.error('Canvas 입력 필드를 찾을 수 없습니다.');
      alert('입력 필드를 찾을 수 없습니다.');
      return;
    }
    
    const newWidth = parseInt(widthInput.value);
    const newHeight = parseInt(heightInput.value);
    
    if(!isNaN(newWidth) && !isNaN(newHeight) && 
       newWidth >= 640 && newWidth <= 1920 && 
       newHeight >= 480 && newHeight <= 1080) {
      updateCanvasSize(newWidth, newHeight);
      alert(`✅ 캔버스 크기가 ${canvasWidth} × ${canvasHeight}로 설정되었습니다!`);
    } else {
      alert('❌ 유효한 범위: 가로 640~1920, 세로 480~1080');
    }
  };

  // 캐릭터 이미지 로드
  const characterImages = {};
  const characters = ['fire', 'water', 'wind', 'earth', 'light', 'dark', 'ice', 'lightning'];
  
  for(const char of characters) {
    const img = new Image();
    const imagePath = `img/character/${char.charAt(0).toUpperCase() + char.slice(1)}Player.png`;
    
    // 즉시 등록 (로딩 중에도 참조 가능)
    characterImages[char] = img;
    img.loaded = false;
    
    img.onload = () => {
      img.loaded = true;
      console.log(`✅ 캐릭터 이미지 로드 성공: ${imagePath}`);
    };
    
    img.onerror = () => {
      img.loaded = false;
      console.error(`❌ 캐릭터 이미지 로드 실패: ${imagePath}`);
      console.log(`파일 경로를 확인하세요: ${imagePath}`);
      
      // 브라우저에서 직접 테스트할 수 있는 링크 제공
      console.log(`브라우저에서 확인: ${window.location.origin}/${imagePath}`);
    };
    
    img.src = imagePath; // src 설정을 마지막에 해서 이벤트 핸들러가 먼저 등록되도록
  }

  // 디버깅용: 이미지 로딩 상태 확인 함수
  window.checkCharacterImages = function() {
    console.log('=== 캐릭터 이미지 상태 ===');
    characters.forEach(char => {
      const img = characterImages[char];
      console.log(`${char}: 로드됨=${img?.loaded}, 완료됨=${img?.complete}, 존재=${!!img}`);
    });
  };

  let gameEngine = {
    bullets: [],
    enemyBullets: [],
    enemies: [],
    particles: [],
    items: [],
    player: null,
    stage: 1,
    waveCount: 0,
    waveTimer: 0,
    spawnRate: 2,
    keys: {},
    blackhole: null,  // 블랙홀 상태 추가
    boss: null,  // 보스 객체
    bossSpawnTimer: 90,  // 1분 30초 후 첫 보스
    nextBossTimer: 60,   // 보스 처치 후 1분 후 다음 보스
    bossDefeated: false,
    stageCleared: false
  };

  function setupGameEngine() {
    const playerStats = DifficultyManager.getPlayerInitialStats(gameState.selectedDifficulty);
    const spawnInterval = DifficultyManager.getSpawnInterval(gameState.selectedDifficulty);
    
    gameEngine = {
      bullets: [],
      enemyBullets: [],
      enemies: [],
      particles: [],
      items: [],
      player: {
        x: 80,
        y: 240,
        r: 12,  /* 8 → 12로 증가 (히트박스 확대) */
        speed: 140,  /* 200 → 140으로 축소 */
        hp: playerStats.hp,
        maxHp: playerStats.maxHp,
        bomb: playerStats.bomb,
        maxBomb: playerStats.maxBomb,
        power: playerStats.power,
        maxPower: playerStats.maxPower,
        invulnerable: 0,
        shotCooldown: 0
      },
      stage: 1,
      waveCount: 0,
      waveTimer: 0,
      spawnRate: spawnInterval,
      keys: {},
      lastTime: performance.now(),
      elapsedTime: 0,  // 게임 경과 시간 (초)
      blackhole: null,  // 블랙홀 상태 추가
      boss: null,  // 보스 객체
      bossSpawnTimer: 90,  // 1분 30초 후 첫 보스
      nextBossTimer: 60,   // 보스 처치 후 1분 후 다음 보스
      bossDefeated: false,
      stageCleared: false
    };

    // 입력 초기화
    window.addEventListener('keydown', (e) => {
      gameEngine.keys[e.key.toLowerCase()] = true;
      if(e.key === ' ') e.preventDefault();
    });

    window.addEventListener('keyup', (e) => {
      gameEngine.keys[e.key.toLowerCase()] = false;
    });
  }

  function gameLoop() {
    if(gameState.isPaused) return;
    if(!gameState.isGameRunning) return;

    const now = performance.now();
    const dt = Math.min(0.05, (now - gameEngine.lastTime) / 1000);
    gameEngine.lastTime = now;

    updateGame(dt);
    drawGame();

    requestAnimationFrame(gameLoop);
  }

  function updateGame(dt) {
    const player = gameEngine.player;
    const keys = gameEngine.keys;
    const difficulty = gameState.selectedDifficulty;
    
    // 게임 경과 시간 업데이트
    gameEngine.elapsedTime += dt;

    // 플레이어 이동
    const focus = keys['shift'];
    const moveSpeed = focus ? player.speed * 0.45 : player.speed;
    if(keys['arrowup'] || keys['w']) player.y -= moveSpeed * dt;
    if(keys['arrowdown'] || keys['s']) player.y += moveSpeed * dt;
    if(keys['arrowleft'] || keys['a']) player.x -= moveSpeed * dt;
    if(keys['arrowright'] || keys['d']) player.x += moveSpeed * dt;
    player.x = Math.max(10, Math.min(W - 10, player.x));
    player.y = Math.max(10, Math.min(H - 10, player.y));

    // 샷
    const shotConfig = CharacterManager.getShotConfig(gameState.selectedCharacter);
    if(keys['z']) {
      if(player.shotCooldown <= 0) {
        const baseDamage = shotConfig.baseDamage * (1 + player.power * 0.01);
        const angle = shotConfig.spreadAngle;
        
        // 여러 발 동시 발사 (캐릭터별)
        for(let i = 0; i < shotConfig.bulletCount; i++) {
          const offsetAngle = (i - (shotConfig.bulletCount - 1) / 2) * angle * (Math.PI / 180);
          const dx = Math.cos(offsetAngle) * shotConfig.bulletSpeed;
          const dy = Math.sin(offsetAngle) * shotConfig.bulletSpeed;
          gameEngine.bullets.push({
            x: player.x + 12,
            y: player.y,
            dx: dx,
            dy: dy,
            r: 3,
            damage: baseDamage
          });
        }
        player.shotCooldown = shotConfig.fireRate;
      }
    }
    if(player.shotCooldown > 0) player.shotCooldown -= dt;

    // 스킬
    const bombConfig = CharacterManager.getBombConfig(gameState.selectedCharacter);
    if(keys['x'] && player.bomb > 0) {
      player.bomb--;
      keys['x'] = false;
      
      // 캐릭터별 스킬 효과 적용
      const bombEffect = CharacterManager.applyBombEffect(gameState.selectedCharacter, gameState, gameEngine.enemyBullets, gameEngine.enemies, player);
      
      if(bombEffect.clearBullets) {
        gameEngine.enemyBullets = [];
      }
      
      // 블랙홀 효과: 블랙홀 생성 (플레이어 앞쪽에 생성, 크기 확대)
      if(bombEffect.blackholeActive) {
        gameEngine.blackhole = {
          x: player.x + 80,  // 플레이어 앞쪽 (우측)
          y: player.y,
          radius: bombEffect.radius * 1.5,  // 크기 50% 확대
          duration: bombConfig.duration,
          maxDuration: bombConfig.duration,
          damage: bombConfig.damage
        };
      }
      
      // 모든 캐릭터 공통: 모든 적에게 데미지 (블랙홀이 아닌 경우)
      if(!bombEffect.blackholeActive) {
        gameEngine.enemies.forEach(e => {
          const damage = bombEffect.bossDamage || bombConfig.damage;
          e.hp -= damage;
        });
      }
      
      // 파티클 생성
      const particleCount = bombEffect.particleCount || 30;
      addParticles(player.x, player.y, particleCount);
      
      if(gameState.settings.screenFlash) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(0, 0, W, H);
      }
    }

    // 탄 이동 및 화면 밖 제거
    gameEngine.bullets = gameEngine.bullets.filter(b => {
      b.x += b.dx * dt;
      b.y += b.dy * dt;
      return b.x > -10 && b.x < W + 10 && b.y > -10 && b.y < H + 10;
    });

    gameEngine.enemyBullets = gameEngine.enemyBullets.filter(b => {
      return EnemyManager.updateEnemyBullet(b, player, dt);
    });

    // 블랙홀 업데이트 및 적/탄막 빨아들이기
    if(gameEngine.blackhole) {
      gameEngine.blackhole.duration -= dt;
      
      // 블랙홀 범위 내 적들을 빨아들임
      for(const e of gameEngine.enemies) {
        const dx = gameEngine.blackhole.x - e.x;
        const dy = gameEngine.blackhole.y - e.y;
        const distance = Math.hypot(dx, dy);
        
        if(distance < gameEngine.blackhole.radius) {
          // 블랙홀 중심으로 이동
          const speed = 200; // 빨아들이는 속도
          const moveX = (dx / distance) * speed * dt;
          const moveY = (dy / distance) * speed * dt;
          
          e.x += moveX;
          e.y += moveY;
          
          // 충분히 가까워지면 제거 및 데미지
          if(distance < 10) {
            e.hp -= gameEngine.blackhole.damage * dt * 2;
            // 파티클 생성
            addParticles(e.x, e.y, 2);
          }
        }
      }
      
      // 블랙홀 범위 내 탄막들을 빨아들이고 제거
      gameEngine.enemyBullets = gameEngine.enemyBullets.filter(b => {
        const dx = gameEngine.blackhole.x - b.x;
        const dy = gameEngine.blackhole.y - b.y;
        const distance = Math.hypot(dx, dy);
        
        if(distance < gameEngine.blackhole.radius) {
          // 블랙홀 중심으로 이동
          const speed = 250; // 탄막은 더 빠르게 빨려들어감
          const moveX = (dx / distance) * speed * dt;
          const moveY = (dy / distance) * speed * dt;
          
          b.x += moveX;
          b.y += moveY;
          
          // 중심에 가까워지면 제거
          if(distance < 15) {
            addParticles(b.x, b.y, 1);
            return false; // 탄막 제거
          }
          return true;
        }
        return true;
      });
      
      // 블랙홀 지속 시간 끝나면 삭제
      if(gameEngine.blackhole.duration <= 0) {
        gameEngine.blackhole = null;
      }
    }

    // 적 업데이트 및 샷
    for(const e of gameEngine.enemies) {
      EnemyManager.updateEnemy(e, player, gameEngine.enemyBullets, dt, difficulty);
    }

    // 적 스폰
    gameEngine.waveTimer -= dt;
    
    // 보스 스폰 시스템
    if(!gameEngine.boss && !gameEngine.stageCleared) {
      if(!gameEngine.bossDefeated && gameEngine.bossSpawnTimer > 0) {
        gameEngine.bossSpawnTimer -= dt;
        if(gameEngine.bossSpawnTimer <= 0) {
          // 첫 번째 보스 스폰
          gameEngine.boss = BossManager.createBoss(gameEngine.stage);
          console.log(`Stage ${gameEngine.stage} 보스 등장: ${gameEngine.boss.name}`);
        }
      } else if(gameEngine.bossDefeated && gameEngine.nextBossTimer > 0) {
        gameEngine.nextBossTimer -= dt;
        if(gameEngine.nextBossTimer <= 0 && gameEngine.stage < 8) {
          // 다음 스테이지 보스 스폰
          gameEngine.stage++;
          gameEngine.boss = BossManager.createBoss(gameEngine.stage);
          gameEngine.bossDefeated = false;
          gameEngine.nextBossTimer = 60;  // 리셋
          console.log(`Stage ${gameEngine.stage} 보스 등장: ${gameEngine.boss.name}`);
        }
      }
    }
    
    // 보스 업데이트
    if(gameEngine.boss) {
      BossManager.updateBoss(gameEngine.boss, dt, player);
      BossManager.executeAttackPattern(gameEngine.boss, player, gameEngine.enemyBullets);
    }
    
    // 적 스폰 (보스가 없을 때만)
    if(!gameEngine.boss && gameEngine.waveTimer <= 0) {
      const maxEnemies = DifficultyManager.getMaxEnemiesPerWave(difficulty);
      const enemyCount = Math.min(maxEnemies, 1 + Math.floor(gameEngine.waveCount * 0.3));
      const enemyHp = DifficultyManager.getEnemyHp(difficulty, gameEngine.stage, gameEngine.elapsedTime);
      const enemyElement = DifficultyManager.getEnemyElement(difficulty, gameEngine.stage);
      
      // EnemyManager를 사용하여 적 웨이브 생성
      const newEnemies = EnemyManager.spawnEnemyWave(enemyCount, W, H, enemyElement, enemyHp, difficulty, gameEngine.stage);
      gameEngine.enemies.push(...newEnemies);
      
      gameEngine.waveCount++;
      const spawnInterval = DifficultyManager.getSpawnInterval(difficulty);
      gameEngine.waveTimer = spawnInterval;
    }

    // 탄과 적 충돌
    for(const e of gameEngine.enemies) {
      for(const b of gameEngine.bullets) {
        if(circleCollision(b, {x: e.x, y: e.y, r: e.r})) {
          // 속성 상성에 따른 데미지 계산
          const playerElement = gameState.selectedCharacter;
          const enemyElement = e.element;
          const finalDamage = CharacterManager.calculateDamageWithAffinity(playerElement, enemyElement, b.damage);
          
          e.hp -= finalDamage;
          b._hit = true;
          gameState.score += 5;
          addParticles(b.x, b.y, 8);
        }
      }
    }
    
    // 탄과 보스 충돌
    if(gameEngine.boss && gameEngine.boss.isAlive) {
      for(const b of gameEngine.bullets) {
        if(circleCollision(b, {x: gameEngine.boss.x, y: gameEngine.boss.y, r: gameEngine.boss.size})) {
          const playerElement = gameState.selectedCharacter;
          const bossElement = gameEngine.boss.element;
          const finalDamage = CharacterManager.calculateDamageWithAffinity(playerElement, bossElement, b.damage);
          
          gameEngine.boss.hp -= finalDamage;
          b._hit = true;
          gameState.score += 100;  // 보스 공격 시 높은 점수
          addParticles(b.x, b.y, 15);
          
          // 보스 처치 확인
          if(gameEngine.boss.hp <= 0) {
            gameEngine.boss.isAlive = false;
            gameEngine.bossDefeated = true;
            gameState.score += 10000;  // 보스 격파 보너스
            addParticles(gameEngine.boss.x, gameEngine.boss.y, 100);
            
            // 스테이지 8 클리어 시 게임 완료
            if(gameEngine.stage >= 8) {
              gameEngine.stageCleared = true;
              setTimeout(() => {
                alert(`게임 클리어! 모든 보스를 물리쳤습니다!\n최종 점수: ${gameState.score}`);
                goToMenu('title');
              }, 2000);
            } else {
              gameEngine.boss = null;
            }
          }
        }
      }
    }
    
    gameEngine.bullets = gameEngine.bullets.filter(b => !b._hit);

    // 적 파괴
    const itemDropRate = DifficultyManager.getItemDropRate(difficulty);
    for(const e of gameEngine.enemies) {
      if(e.hp <= 0) {
        e._dead = true;
        gameState.score += 200;
        addParticles(e.x, e.y, 20);
        
        // DifficultyManager에서 아이템 드롭 처리
        const droppedItems = DifficultyManager.generateDropItems(difficulty, e.x, e.y);
        droppedItems.forEach(item => {
          gameEngine.items.push(item);
        });
      }
    }
    gameEngine.enemies = gameEngine.enemies.filter(e => !e._dead && e.x > -50);


    // 적탄과 플레이어 충돌
    if(player.invulnerable > 0) player.invulnerable -= dt;
    if(player.invulnerable <= 0) {
      for(const b of gameEngine.enemyBullets) {
        if(circleCollision({x: player.x, y: player.y, r: player.r}, b)) {
          player.hp--;
          player.invulnerable = 1.5;
          gameEngine.enemyBullets = [];
          addParticles(player.x, player.y, 30);
          gameState.score = Math.max(0, gameState.score - 100);
          if(player.hp <= 0) {
            gameState.isGameRunning = false;
            MusicManager.stopBGM();
            showGameOver();
          }
          break;
        }
      }
    }

    // 아이템 처리
    for(const item of gameEngine.items) {
      // 아이템 이동 및 수집 확인
      const isCollected = DifficultyManager.updateItemMovement(item, player, dt);
      
      if(isCollected) {
        // 자석으로 끌려가서 수집됨
        item._collected = true;
        if(item.type === 'power') {
          player.power = Math.min(player.maxPower, player.power + 10);
          gameState.score += 50;
        } else if(item.type === 'bomb') {
          player.bomb = Math.min(player.maxBomb, player.bomb + 1);
          gameState.score += 100;
        } else if(item.type === 'life') {
          player.hp = Math.min(player.maxHp, player.hp + 1);
          gameState.score += 200;
        }
      }
      // 화면 밖으로 나간 아이템 제거
      if(item.x < -50) item._collected = true;
    }
    gameEngine.items = gameEngine.items.filter(item => !item._collected);

    // 파티클 업데이트
    gameEngine.particles = gameEngine.particles.filter(p => {
      p.t = (p.t || 0) + dt;
      return p.t < 1.0;
    });

    // 하이스코어 업데이트
    if(gameState.score > gameState.hiScore) {
      gameState.hiScore = gameState.score;
      localStorage.setItem('high-Score', gameState.hiScore);
    }

    // UI 업데이트
    document.getElementById('score').innerText = `SCORE: ${gameState.score}`;
    document.getElementById('hiscore').innerText = `HIGH-SCORE: ${gameState.hiScore}`;
    document.getElementById('lives').innerText = `LIVES: ${'❤️'.repeat(Math.max(0, player.hp))}`;
    document.getElementById('bombs').innerText = `BOMB: ${'💣'.repeat(Math.max(0, player.bomb))}`;
    const powerBar = Math.round((player.power / player.maxPower) * 10);
    document.getElementById('power').innerText = `POWER: ${'▮'.repeat(powerBar)}${'▯'.repeat(10 - powerBar)}`;
    // 경과 시간 표시
    const minutes = Math.floor(gameEngine.elapsedTime / 60);
    const seconds = Math.floor(gameEngine.elapsedTime % 60);
    document.getElementById('time').innerText = `TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function drawGame() {
    const player = gameEngine.player;
    
    // 정수 배수 캔버스 크기로 픽셀 크리스프니스 최적화
    ctx.imageSmoothingEnabled = false;  // 픽셀 아트 방식
    ctx.clearRect(0, 0, W, H);

    // 배경
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#071022');
    grad.addColorStop(1, '#03121a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 플레이어
    const characterImage = characterImages[gameState.selectedCharacter];
    if(characterImage && characterImage.loaded && characterImage.complete) {
      // 캐릭터 이미지 표시 (좌우 반전, 고품질 축소)
      ctx.save();
      ctx.imageSmoothingEnabled = true;  // 고품질 이미지 렌더링
      ctx.imageSmoothingQuality = 'high'; // 최고 품질
      ctx.translate(player.x, player.y);
      ctx.scale(-1, 1); // 좌우 반전
      ctx.drawImage(characterImage, -player.r * 4, -player.r * 4, player.r * 8, player.r * 8);
      ctx.restore();
    } else {
      // 이미지 로드 실패 또는 로딩 중일 때 기존 원형 표시
      if(!characterImage) {
        console.warn(`❌ 캐릭터 이미지 객체가 없음: ${gameState.selectedCharacter}`);
      } else if(!characterImage.loaded) {
        console.warn(`⏳ 캐릭터 이미지 로딩 중: ${gameState.selectedCharacter}`);
      } else if(!characterImage.complete) {
        console.warn(`⚠️ 캐릭터 이미지 로딩 미완료: ${gameState.selectedCharacter}`);
      }
      
      ctx.fillStyle = CharacterManager.getColor(gameState.selectedCharacter);
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
      ctx.fill();
    }
    
    if(player.invulnerable > 0 && Math.floor(player.invulnerable * 10) % 2) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 플레이어 샷 (캐릭터 색상)
    const playerColor = CharacterManager.getColor(gameState.selectedCharacter);
    ctx.fillStyle = playerColor;
    for(const b of gameEngine.bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 적
    const enemyMaxHp = DifficultyManager.getEnemyHp(gameState.selectedDifficulty, gameEngine.stage, gameEngine.elapsedTime);
    
    for(const e of gameEngine.enemies) {
      EnemyManager.renderEnemy(ctx, e, enemyMaxHp);
    }

    // 보스 렌더링
    if(gameEngine.boss && gameEngine.boss.isAlive) {
      const boss = gameEngine.boss;
      
      // 보스 몸체 (큰 원형)
      ctx.fillStyle = boss.color;
      ctx.beginPath();
      ctx.arc(boss.x, boss.y, boss.size, 0, Math.PI * 2);
      ctx.fill();
      
      // 보스 테두리 (2중)
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(boss.x, boss.y, boss.size, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = boss.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(boss.x, boss.y, boss.size + 4, 0, Math.PI * 2);
      ctx.stroke();
      
      // 보스 HP 바 (상단 중앙)
      const barWidth = 300;
      const barHeight = 20;
      const barX = (W - barWidth) / 2;
      const barY = 20;
      
      // HP 바 배경
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // HP 바
      const hpPercent = Math.max(0, boss.hp / boss.maxHp);
      let hpColor = '#7fff7f';
      if(hpPercent < 0.5) hpColor = '#ffff00';
      if(hpPercent < 0.25) hpColor = '#ff6b6b';
      
      ctx.fillStyle = hpColor;
      ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
      
      // HP 바 테두리
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
      
      // 보스 이름
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(boss.name, W / 2, barY - 5);
      
      // HP 텍스트
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText(`${Math.ceil(boss.hp)} / ${boss.maxHp}`, W / 2, barY + 15);
      
      // 페이즈 표시
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`Phase ${boss.currentPhase}`, boss.x, boss.y + boss.size + 20);
    }

    // 적탄 (보스 탄 포함)
    for(const b of gameEngine.enemyBullets) {
      // 적 탄환인지 보스 탄환인지 구분하여 렌더링
      if(b.color) {
        EnemyManager.renderEnemyBullet(ctx, b);
      } else {
        // 기존 보스 탄환 렌더링 유지
        ctx.fillStyle = '#ffdd55';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 아이템
    for(const item of gameEngine.items) {
      const colors = { power: '#ff00ff', bomb: '#ffff00', life: '#ff0000' };
      ctx.fillStyle = colors[item.type];
      ctx.beginPath();
      ctx.arc(item.x, item.y, 5, 0, Math.PI * 2);  /* 8 → 5로 축소 */
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 파티클
    for(const p of gameEngine.particles) {
      ctx.fillStyle = `rgba(255, 255, 255, ${1 - p.t})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * (1 - p.t), 0, Math.PI * 2);
      ctx.fill();
    }

    // 블랙홀 렌더링
    if(gameEngine.blackhole) {
      const bh = gameEngine.blackhole;
      const progress = 1 - (bh.duration / bh.maxDuration); // 0 ~ 1
      
      // 블랙홀 외부 빛 (보라색 오라)
      ctx.fillStyle = `rgba(139, 0, 255, ${0.4 * (1 - progress)})`;
      ctx.beginPath();
      ctx.arc(bh.x, bh.y, bh.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // 블랙홀 외부 링 (회전)
      ctx.strokeStyle = '#8b00ff';
      ctx.lineWidth = 2;
      for(let i = 0; i < 3; i++) {
        ctx.globalAlpha = 0.8 - i * 0.2;
        ctx.beginPath();
        const swirl = gameEngine.elapsedTime * (2 + i * 0.5);
        const r = bh.radius * (0.9 - i * 0.25);
        ctx.arc(bh.x, bh.y, r, swirl, swirl + Math.PI * 1.2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      
      // 검은 중심 (빨아들이는 느낌)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(bh.x, bh.y, bh.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // 중심의 밝은 점 (에너지)
      ctx.fillStyle = '#ff00ff';
      ctx.globalAlpha = 0.7 + Math.sin(gameEngine.elapsedTime * 8) * 0.3;
      ctx.beginPath();
      ctx.arc(bh.x, bh.y, bh.radius * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function circleCollision(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy <= (a.r + b.r) * (a.r + b.r);
  }

  function addParticles(x, y, count) {
    if(!gameState.settings.particleEffects) return;
    for(let i = 0; i < count; i++) {
      gameEngine.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        t: 0
      });
    }
  }

  /**
   * 스킬 이미지를 Canvas에 그리는 함수
   * 각 원소별로 특징 있는 비주얼로 표현
   */
  function drawSkillIcon(ctx, character, x, y, size = 60) {
    const time = gameEngine.elapsedTime || 0;
    
    switch(character) {
      case 'fire': // 불 - 마그마 폭발
        drawMagmaExplosion(ctx, x, y, size, time);
        break;
      case 'water': // 물 - 정화 장막
        drawPurifyingShield(ctx, x, y, size, time);
        break;
      case 'wind': // 바람 - 질풍 궤적
        drawWindTrail(ctx, x, y, size, time);
        break;
      case 'earth': // 땅 - 암석 압착
        drawRockCrush(ctx, x, y, size, time);
        break;
      case 'light': // 빛 - 레이저 정화
        drawLaserPurify(ctx, x, y, size, time);
        break;
      case 'dark': // 어둠 - 블랙홀
        drawBlackHole(ctx, x, y, size, time);
        break;
      case 'ice': // 냉기 - 빙결 영도
        drawFrostZone(ctx, x, y, size, time);
        break;
      case 'lightning': // 전기 - 연쇄 번개
        drawChainLightning(ctx, x, y, size, time);
        break;
    }
  }

  function drawMagmaExplosion(ctx, x, y, size, time) {
    const radius = size / 2;
    const pulse = Math.sin(time * 4) * 0.2 + 0.8;
    
    // 중심 폭발 형태
    ctx.fillStyle = '#ff4500';
    ctx.beginPath();
    ctx.arc(x, y, radius * pulse, 0, Math.PI * 2);
    ctx.fill();
    
    // 외부 화염
    ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
    for(let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + time * 2;
      const px = x + Math.cos(angle) * radius * 1.3;
      const py = y + Math.sin(angle) * radius * 1.3;
      ctx.beginPath();
      ctx.arc(px, py, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPurifyingShield(ctx, x, y, size, time) {
    const radius = size / 2;
    
    // 기본 원형 방어막
    ctx.strokeStyle = '#66ddff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 내부 물 흐름
    ctx.fillStyle = 'rgba(102, 221, 255, 0.3)';
    for(let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 + time * 1.5;
      const px = x + Math.cos(angle) * radius * 0.6;
      const py = y + Math.sin(angle) * radius * 0.6;
      ctx.beginPath();
      ctx.arc(px, py, radius * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 중심 물 구슬
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawWindTrail(ctx, x, y, size, time) {
    const radius = size / 2;
    
    // 소용돌이 패턴
    ctx.strokeStyle = '#90ee90';
    ctx.lineWidth = 2;
    for(let i = 0; i < 3; i++) {
      ctx.beginPath();
      const startAngle = (Math.PI * 2 * i) / 3 + time * 2;
      const endAngle = startAngle + Math.PI * 0.8;
      ctx.arc(x, y, radius * (0.5 + i * 0.25), startAngle, endAngle);
      ctx.stroke();
    }
    
    // 중심 원
    ctx.fillStyle = 'rgba(144, 238, 144, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRockCrush(ctx, x, y, size, time) {
    const radius = size / 2;
    const squeeze = Math.sin(time * 3) * 0.15 + 0.85;
    
    // 위 돌
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(x - radius * 0.7, y - radius * squeeze, radius * 1.4, radius * 0.4);
    
    // 아래 돌
    ctx.fillRect(x - radius * 0.7, y + radius * squeeze - radius * 0.4, radius * 1.4, radius * 0.4);
    
    // 균열 선
    ctx.strokeStyle = '#cd853f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - radius * 0.5, y);
    ctx.lineTo(x + radius * 0.5, y);
    ctx.stroke();
  }

  function drawLaserPurify(ctx, x, y, size, time) {
    const radius = size / 2;
    
    // 중심 밝은 점
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // 방사형 레이저
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    for(let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const length = radius * (0.7 + Math.sin(time * 4 + i) * 0.2);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(angle) * length,
        y + Math.sin(angle) * length
      );
      ctx.stroke();
    }
    
    // 외부 고리
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawBlackHole(ctx, x, y, size, time) {
    const radius = size / 2;
    
    // 외부 강한 보라색 오라
    ctx.fillStyle = 'rgba(139, 0, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 회전하는 소용돌이 링 (여러 개)
    ctx.strokeStyle = '#8b00ff';
    for(let i = 0; i < 5; i++) {
      ctx.lineWidth = 3 - i * 0.5;
      ctx.globalAlpha = 0.9 - i * 0.15;
      ctx.beginPath();
      const swirl = time * (2 + i * 0.3);
      const r = radius * (0.85 - i * 0.15);
      ctx.arc(x, y, r, swirl, swirl + Math.PI * 1.3);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    
    // 중간 어두운 원
    ctx.fillStyle = 'rgba(50, 0, 100, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
    
    // 중심 검은 구 (깊이감)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // 중심의 밝은 에너지 (깜빡임)
    ctx.fillStyle = '#ff00ff';
    ctx.globalAlpha = 0.6 + Math.sin(time * 10) * 0.4;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // 외곽 테두리
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fill();
  }

  function drawFrostZone(ctx, x, y, size, time) {
    const radius = size / 2;
    
    // 얼음 결정 패턴
    ctx.strokeStyle = '#00bfff';
    ctx.lineWidth = 2;
    for(let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * radius * 0.8, y + Math.sin(angle) * radius * 0.8);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    
    // 중심에서 파동
    ctx.strokeStyle = 'rgba(0, 191, 255, 0.5)';
    ctx.lineWidth = 1;
    const wave = (time * 3) % 1;
    ctx.beginPath();
    ctx.arc(x, y, radius * wave, 0, Math.PI * 2);
    ctx.stroke();
    
    // 중심 얼음
    ctx.fillStyle = '#87ceeb';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawChainLightning(ctx, x, y, size, time) {
    const radius = size / 2;
    
    // 번개 중심 구 (밝은 노란색)
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    
    // 번개 방사형 선들
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    for(let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 + time * 2;
      const wobble = Math.sin(time * 5 + i) * 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      // 지그재그 번개
      const segments = 4;
      for(let s = 0; s < segments; s++) {
        const progress = (s + 1) / segments;
        const tx = x + Math.cos(angle) * radius * progress;
        const ty = y + Math.sin(angle) * radius * progress;
        const offsetX = (s % 2 === 0 ? 1 : -1) * wobble;
        ctx.lineTo(tx + offsetX, ty);
      }
      ctx.stroke();
    }
    
    // 외부 전기 오라
    ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function showGameOver() {
    // 게임오버 BGM 재생 (me 폴더의 m4a 파일)
    MusicManager.stopBGM();
    
    // me 폴더의 파일을 재생하기 위해 직접 Audio 객체 생성
    try {
      const gameoverAudio = new Audio();
      gameoverAudio.src = 'audio/me/Gameover1.m4a';
      gameoverAudio.volume = 0.8;
      gameoverAudio.play().catch(err => {
        console.warn('⚠️ 게임오버 BGM 재생 실패:', err.message);
      });
      console.log('🎵 게임오버 BGM 재생: audio/me/Gameover1.m4a');
    } catch(e) {
      console.error('❌ 게임오버 BGM 재생 오류:', e);
    }
    
    // 게임 상태 중지
    gameState.isGameRunning = false;
    gameState.isPaused = false;
    
    // 게임오버 데이터 설정
    gameState.finalScore = gameState.score;
    updateGameOverScreen();
    
    // 게임오버 화면으로 이동
    goToMenu('gameover');
  }

  // 게임오버 화면 업데이트
  function updateGameOverScreen() {
    const finalScore = gameState.score;
    const hiScore = gameState.hiScore;
    const isNewRecord = finalScore > hiScore;
    
    // 점수 표시
    document.getElementById('final-score-value').innerText = finalScore;
    document.getElementById('final-hiscore-value').innerText = Math.max(finalScore, hiScore);
    
    // 신기록 표시
    const newRecordElement = document.getElementById('new-record');
    if(isNewRecord) {
      newRecordElement.style.display = 'block';
    } else {
      newRecordElement.style.display = 'none';
    }
    
    // 통계 표시
    const minutes = Math.floor(gameEngine.elapsedTime / 60);
    const seconds = Math.floor(gameEngine.elapsedTime % 60);
    document.getElementById('final-time').innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('final-stage').innerText = gameEngine.stage;
    
    const charInfo = CharacterManager.getInfo(gameState.selectedCharacter);
    const diffInfo = DifficultyManager.getDifficultyInfo(gameState.selectedDifficulty);
    document.getElementById('final-character').innerText = charInfo.name;
    document.getElementById('final-difficulty').innerText = diffInfo.label;
  }

  // 다시 시작 함수
  window.restartGame = function() {
    // 같은 설정으로 다시 시작
    startGame();
  };

  // ===== 타이틀 배경 이미지 시스템 =====
  let titleBackgroundSystem = {
    images: [],
    animationId: null,
    isRunning: false
  };

  function initializeTitleBackground() {
    const container = document.querySelector('.title-background');
    if (!container) return;

    // 기존 이미지들 제거
    container.innerHTML = '';
    titleBackgroundSystem.images = [];
    
    // 8개 Title.jpg 이미지 생성
    for (let i = 0; i < 8; i++) {
      const imageData = createTitleImage(i);
      titleBackgroundSystem.images.push(imageData);
      container.appendChild(imageData.element);
    }
    
    // 애니메이션 시작
    if (!titleBackgroundSystem.isRunning) {
      titleBackgroundSystem.isRunning = true;
      animateTitleBackground();
    }
  }

  function createTitleImage(index) {
    const img = document.createElement('img');
    img.src = 'img/title/Title.png';
    img.className = 'title-background-image';
    img.style.pointerEvents = 'none';
    
    // 화면 크기 기준으로 랜덤 위치 설정
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    return {
      element: img,
      x: Math.random() * (screenWidth - 120),
      y: Math.random() * (screenHeight - 120),
      vx: (Math.random() - 0.5) * 0.8, // 느린 속도
      vy: (Math.random() - 0.5) * 0.8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      scale: 0.8 + Math.random() * 0.4, // 0.8 ~ 1.2 크기
      opacity: 0.1 + Math.random() * 0.1 // 0.1 ~ 0.2 투명도
    };
  }

  function animateTitleBackground() {
    if (!titleBackgroundSystem.isRunning) return;
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    titleBackgroundSystem.images.forEach(imageData => {
      // 위치 업데이트
      imageData.x += imageData.vx;
      imageData.y += imageData.vy;
      imageData.rotation += imageData.rotationSpeed;
      
      // 화면 경계에서 반사
      if (imageData.x <= 0 || imageData.x >= screenWidth - 120) {
        imageData.vx = -imageData.vx;
      }
      if (imageData.y <= 0 || imageData.y >= screenHeight - 120) {
        imageData.vy = -imageData.vy;
      }
      
      // DOM 업데이트
      const element = imageData.element;
      element.style.left = imageData.x + 'px';
      element.style.top = imageData.y + 'px';
      element.style.transform = `rotate(${imageData.rotation}deg) scale(${imageData.scale})`;
      element.style.opacity = imageData.opacity;
    });
    
    titleBackgroundSystem.animationId = requestAnimationFrame(animateTitleBackground);
  }

  function stopTitleBackground() {
    titleBackgroundSystem.isRunning = false;
    if (titleBackgroundSystem.animationId) {
      cancelAnimationFrame(titleBackgroundSystem.animationId);
      titleBackgroundSystem.animationId = null;
    }
  }

  // 화면 전환 시 타이틀 배경 정리
  const originalGoToMenu = window.goToMenu;
  window.goToMenu = function(screenName) {
    // 타이틀이 아닌 다른 화면으로 이동할 때 배경 애니메이션 정지
    if (screenName !== 'title') {
      stopTitleBackground();
    }
    
    originalGoToMenu(screenName);
  };

  // 초기화
  document.addEventListener('DOMContentLoaded', () => {
    goToMenu('title');
  });

})();
