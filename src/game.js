import { MUSHROOM_TIERS, BOMB_ITEM, getRandomDropTier } from './mushroom-data.js?v=20261027_claw_v2';
import { sound } from './audio.js';
import { PhysicsWorld, getCreatureRadiusAtAngle } from './physics.js?v=20261027_claw_v2';
import { TerrariumRenderer } from './renderer.js?v=20261027_claw_v2';

export class GameManager {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new TerrariumRenderer(this.canvas);

    // Terrarium physics boundaries within the 460x720 canvas
    this.bounds = {
      left: 30,
      right: 430,
      top: 90,
      bottom: 690,
      cornerRadius: 32
    };

    this.world = new PhysicsWorld(this.bounds);

    // Game state
    this.state = 'TITLE'; // 'TITLE', 'PLAYING', 'PAUSED', 'GAMEOVER'
    this.score = 0;
    this.bestScore = 0;
    this.totalMerges = 0;
    this.highestTier = 1;

    // Dropper queue state (shows horizontal line of next pastries)
    this.dropX = 230;
    this.nextQueue = [
      MUSHROOM_TIERS[getRandomDropTier() - 1],
      MUSHROOM_TIERS[getRandomDropTier() - 1],
      MUSHROOM_TIERS[getRandomDropTier() - 1],
      MUSHROOM_TIERS[getRandomDropTier() - 1]
    ];
    this.currentTierData = this.nextQueue[0];
    this.nextTierData = this.nextQueue[1];
    this.canDrop = true;
    this.dropCooldownTimer = 0;
    this.dropCooldownDuration = 0.45; // seconds

    // Danger Line state
    this.dangerLineY = 165;
    this.dangerTimer = 0;
    this.dangerMaxTime = 3.5;
    this.isDangerActive = false;
    this.dangerSoundTimer = 0;

    // Dropper blinking animation state
    this.heldBlinkTimer = Math.random() * 3 + 2;
    this.heldIsBlinking = false;

    // Settings
    this.settings = {
      sfxVolume: 0.8,
      musicVolume: 0.5,
      screenShake: true,
      aimGuide: true
    };

    // Compendium (Aquadex)
    this.discoveredTiers = new Set([1]); // Nudibranch unlocked by default

    // Input state
    this.keys = {};
    this.keySpeed = 340; // px/s dropper movement
    this.isDragging = false;
    this.gamepadPrevDrop = false;

    // Timing
    this.lastTime = performance.now();

    this.initStorage();
    this.setupInputs();
    this.setupUI();
    this.initLadderUI();
    this.initEvolutionBar();
    this.updateFungidexUI();
    this.updateStatsUI();

    // Start render loop
    requestAnimationFrame((t) => this.loop(t));
  }

  initStorage() {
    try {
      const savedBest = localStorage.getItem('mycomerge_best_score');
      if (savedBest) this.bestScore = parseInt(savedBest, 10) || 0;

      const savedDex = localStorage.getItem('mycomerge_fungidex');
      if (savedDex) {
        const arr = JSON.parse(savedDex);
        arr.forEach(t => {
          if (t <= MUSHROOM_TIERS.length) this.discoveredTiers.add(t);
        });
      }

      const savedSettings = localStorage.getItem('mycomerge_settings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
      this.settings.aimGuide = true;
    } catch (e) {
      console.warn('Storage read error:', e);
    }

    sound.setSFXVolume(this.settings.sfxVolume);
    sound.setMusicVolume(this.settings.musicVolume);
  }

  saveStorage() {
    try {
      localStorage.setItem('mycomerge_best_score', this.bestScore.toString());
      localStorage.setItem('mycomerge_fungidex', JSON.stringify(Array.from(this.discoveredTiers)));
      localStorage.setItem('mycomerge_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  startNewGame() {
    this.state = 'PLAYING';
    this.score = 0;
    this.totalMerges = 0;
    this.highestTier = 1;
    this.dangerTimer = 0;
    this.isDangerActive = false;
    this.world.clear();

    this.nextQueue = [
      MUSHROOM_TIERS[getRandomDropTier() - 1],
      MUSHROOM_TIERS[getRandomDropTier() - 1],
      MUSHROOM_TIERS[getRandomDropTier() - 1],
      MUSHROOM_TIERS[getRandomDropTier() - 1]
    ];
    this.currentTierData = this.nextQueue[0];
    this.nextTierData = this.nextQueue[1];
    this.clampDropX();

    this.canDrop = true;
    this.dropCooldownTimer = 0;

    sound.startBGM();
    this.updateStatsUI();
    this.updateNextPreviewUI();
    this.updateTargetTierUI();
    this.updateLadderUI();
    this.updateEvolutionBar();

    // Hide modals
    this.closeAllDialogs();
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('game-hud').classList.remove('hidden');

    // First time tutorial prompt
    const hasSeenTutorial = localStorage.getItem('mycomerge_has_seen_tutorial');
    if (!hasSeenTutorial) {
      this.openTutorial();
      localStorage.setItem('mycomerge_has_seen_tutorial', 'true');
    }
  }

  clampDropX() {
    if (!this.currentTierData) return;
    const dummy = { radius: this.currentTierData.radius, tierData: this.currentTierData, angle: 0 };
    const rLeft = getCreatureRadiusAtAngle(dummy, Math.PI);
    const rRight = getCreatureRadiusAtAngle(dummy, 0);
    const minX = this.bounds.left + rLeft + 2;
    const maxX = this.bounds.right - rRight - 2;
    this.dropX = Math.max(minX, Math.min(maxX, this.dropX));
  }

  triggerDrop() {
    if (this.state !== 'PLAYING' || !this.canDrop || !this.currentTierData) return;

    sound.playDrop();

    // Mobile tactile haptic pulse
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(15); } catch (_) {}
    }

    // Wake up any sleeping creatures in the drop trajectory so they react naturally
    this.world.wakeColumn(this.dropX, 160);

    // Check if dropping a Timed Spark Bomb (3s countdown)
    if (this.currentTierData.isBomb || this.currentTierData.id === 'plush_bomb' || this.currentTierData.tier === 99) {
      this.clampDropX();
      this.renderer.triggerClawDrop();
      this.world.addBomb(this.dropX, 76, BOMB_ITEM);
      this.renderer.addPopup(this.dropX, 76, '💣 3s Fuse Lit!');

      this.canDrop = false;
      this.dropCooldownTimer = this.dropCooldownDuration;

      // Cycle next piece through queue
      this.nextQueue.shift();
      this.nextQueue.push(MUSHROOM_TIERS[getRandomDropTier() - 1]);
      this.currentTierData = this.nextQueue[0];
      this.nextTierData = this.nextQueue[1];
      this.clampDropX();
      this.updateNextPreviewUI();
      return;
    }

    // Spawn normal plushie into the physics world from the claw grasp
    this.clampDropX();
    this.renderer.triggerClawDrop();
    this.world.addMushroom(this.dropX, 76, this.currentTierData, true);

    this.canDrop = false;
    this.dropCooldownTimer = this.dropCooldownDuration;

    // Cycle next piece through queue
    this.nextQueue.shift();
    this.nextQueue.push(MUSHROOM_TIERS[getRandomDropTier() - 1]);
    this.currentTierData = this.nextQueue[0];
    this.nextTierData = this.nextQueue[1];
    this.clampDropX();

    this.updateNextPreviewUI();
  }

  handleMerges(merges) {
    for (const merge of merges) {
      this.totalMerges++;
      const nextTierNum = merge.nextTier;
      const nextTierData = MUSHROOM_TIERS[nextTierNum - 1];

      // Remove the two colliding bodies
      this.world.removeMushroom(merge.m1.id);
      this.world.removeMushroom(merge.m2.id);

      // Spawn evolved pastry at midpoint
      this.world.addMushroom(merge.x, merge.y, nextTierData, false);

      // Wake up nearby resting pastries so they naturally adjust to newly opened space
      this.world.wakeNearby(merge.x, merge.y, nextTierData.radius * 2.2);

      // Score points
      this.score += nextTierData.points;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        this.saveStorage();
      }

      if (nextTierNum > this.highestTier) {
        this.highestTier = nextTierNum;
        this.updateTargetTierUI();
        this.updateLadderUI();
        this.updateEvolutionBar();
      }

      // Check Pastrydex new unlock
      if (!this.discoveredTiers.has(nextTierNum)) {
        this.discoveredTiers.add(nextTierNum);
        this.saveStorage();
        this.updateFungidexUI();
        this.updateLadderUI();
        this.updateEvolutionBar();
        sound.playDiscovery();
        this.showDiscoveryBanner(nextTierData);
      } else {
        sound.playMerge(nextTierNum);
      }

      // Mobile tactile merge vibration
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([15, 25, 20]); } catch (_) {}
      }

      // Visual effects & celebratory 3D comic popup ("Juicy!", "Sweet!")
      this.renderer.addMergeBurst(merge.x, merge.y, nextTierData);
      this.renderer.addFloatingScore(merge.x, merge.y, nextTierData.points);
      this.renderer.addPopup(merge.x, merge.y);

      if (this.settings.screenShake) {
        const shakePower = Math.min(10, 2.5 + nextTierNum * 0.7);
        this.renderer.triggerShake(shakePower, 0.22);
      }

      this.updateStatsUI();
    }
  }

  handleDetonations(detonations) {
    for (const det of detonations) {
      sound.playBombDetonation();
      this.renderer.addBombBlast(det.x, det.y, det.blastRadius, det.blastedBodies.length);

      let blastScore = 50;
      for (const m of det.blastedBodies) {
        this.world.removeMushroom(m.id);
        const pts = (m.tierData ? m.tierData.points : 10) * 2;
        blastScore += pts;
        this.renderer.addFloatingScore(m.x, m.y, pts);
      }

      this.score += blastScore;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        this.saveStorage();
      }
      this.updateStatsUI();
      this.updateEvolutionBar();
      this.world.wakeNearby(det.x, det.y, det.blastRadius + 140);
    }
  }

  showDiscoveryBanner(tierData) {
    const banner = document.getElementById('discovery-banner');
    if (!banner) return;

    banner.querySelector('.discovery-name').textContent = tierData.name;
    banner.querySelector('.discovery-species').textContent = tierData.species;
    banner.classList.remove('hidden');
    banner.classList.remove('pop-anim');
    void banner.offsetWidth; // trigger reflow
    banner.classList.add('pop-anim');

    setTimeout(() => {
      banner.classList.add('hidden');
    }, 3200);
  }

  triggerGameOver() {
    if (this.state === 'GAMEOVER') return;
    this.state = 'GAMEOVER';
    this.isDangerActive = false;
    sound.playGameOver();

    // Close any open dialogs first
    this.closeAllDialogs();

    // Show Results modal
    const resultsDialog = document.getElementById('results-dialog');
    if (!resultsDialog) return;

    document.getElementById('result-final-score').textContent = this.score.toLocaleString();
    document.getElementById('result-best-score').textContent = this.bestScore.toLocaleString();
    document.getElementById('result-total-merges').textContent = this.totalMerges.toString();

    const highestTierData = MUSHROOM_TIERS[this.highestTier - 1] || MUSHROOM_TIERS[0];
    document.getElementById('result-highest-name').textContent = highestTierData.name;
    document.getElementById('result-highest-tier').textContent = `Tier ${highestTierData.tier}`;

    // Render highest mushroom icon on result preview canvas
    this.renderResultHighestIcon(highestTierData);

    const isNewBest = this.score === this.bestScore && this.score > 0;
    const newBestBadge = document.getElementById('result-new-best-badge');
    if (newBestBadge) {
      newBestBadge.classList.toggle('hidden', !isNewBest);
    }

    if (!resultsDialog.open) {
      resultsDialog.showModal();
    }
  }

  renderResultHighestIcon(tierData) {
    const previewCanvas = document.getElementById('result-highest-canvas');
    if (!previewCanvas) return;
    const ctx = previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    ctx.save();
    ctx.translate(previewCanvas.width / 2, previewCanvas.height / 2);
    const scale = Math.min(1.0, 48 / tierData.radius);
    ctx.scale(scale, scale);
    this.renderer.drawMushroomBody(ctx, {
      tierData,
      isBlinking: false,
      lookX: 0,
      lookY: 0
    }, false);
    ctx.restore();
  }

  setupInputs() {
    const getCanvasPos = (clientX) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      return (clientX - rect.left) * scaleX;
    };

    let isTouchActive = false;

    // Mobile Touch: Drag horizontally to aim, release finger to drop!
    this.canvas.addEventListener('touchstart', (e) => {
      if (this.state === 'PLAYING' && e.touches.length > 0) {
        e.preventDefault();
        isTouchActive = true;
        this.dropX = getCanvasPos(e.touches[0].clientX);
        this.clampDropX();
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.state === 'PLAYING' && isTouchActive && e.touches.length > 0) {
        e.preventDefault();
        this.dropX = getCanvasPos(e.touches[0].clientX);
        this.clampDropX();
      }
    }, { passive: false });

    const finishTouchDrop = (e) => {
      if (this.state === 'PLAYING' && isTouchActive) {
        isTouchActive = false;
        if (e.changedTouches && e.changedTouches.length > 0) {
          this.dropX = getCanvasPos(e.changedTouches[0].clientX);
          this.clampDropX();
        }
        this.triggerDrop();
      }
    };

    this.canvas.addEventListener('touchend', finishTouchDrop, { passive: false });
    this.canvas.addEventListener('touchcancel', () => { isTouchActive = false; });

    // Desktop Mouse: Hover to aim, click to drop
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.state === 'PLAYING' && !isTouchActive) {
        this.dropX = getCanvasPos(e.clientX);
        this.clampDropX();
      }
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (this.state === 'PLAYING' && e.button === 0 && !isTouchActive) {
        this.dropX = getCanvasPos(e.clientX);
        this.clampDropX();
        this.triggerDrop();
      }
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;

      if (e.key === ' ' || e.key === 'Space' || e.code === 'Space' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'Enter') {
        if (this.state === 'PLAYING') {
          e.preventDefault();
          this.triggerDrop();
        }
      }

      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (this.state === 'PLAYING') {
          this.pauseGame();
        } else if (this.state === 'PAUSED') {
          this.resumeGame();
        }
      }

      if (e.key === 'm' || e.key === 'M') {
        this.toggleMute();
      }

      if (e.key === 'g' || e.key === 'G') {
        if (this.state === 'PLAYING') {
          this.triggerGameOver();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  pollGamepad(dt) {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads || !gamepads[0]) return;

    const gp = gamepads[0];
    if (!gp) return;

    // Left stick X axis
    const axisX = gp.axes[0];
    if (Math.abs(axisX) > 0.15) {
      this.dropX += axisX * this.keySpeed * dt;
      this.clampDropX();
    }

    // D-Pad left / right
    if (gp.buttons[14] && gp.buttons[14].pressed) {
      this.dropX -= this.keySpeed * dt;
      this.clampDropX();
    }
    if (gp.buttons[15] && gp.buttons[15].pressed) {
      this.dropX += this.keySpeed * dt;
      this.clampDropX();
    }

    // A / South button or RT to drop
    const dropBtnPressed = (gp.buttons[0] && gp.buttons[0].pressed) || (gp.buttons[7] && gp.buttons[7].pressed);
    if (dropBtnPressed && !this.gamepadPrevDrop) {
      if (this.state === 'PLAYING') {
        this.triggerDrop();
      }
    }
    this.gamepadPrevDrop = dropBtnPressed;

    // Start / Options button for pause
    if (gp.buttons[9] && gp.buttons[9].pressed) {
      if (this.state === 'PLAYING') {
        this.pauseGame();
      }
    }
  }

  setupUI() {
    // Title buttons
    document.getElementById('btn-play-game').addEventListener('click', () => {
      sound.playClick();
      this.startNewGame();
    });

    document.getElementById('btn-title-fungidex').addEventListener('click', () => {
      sound.playClick();
      this.openFungidex();
    });

    document.getElementById('btn-title-tutorial').addEventListener('click', () => {
      sound.playClick();
      this.openTutorial();
    });

    document.getElementById('btn-title-settings').addEventListener('click', () => {
      sound.playClick();
      this.openSettings();
    });

    // In-game HUD buttons
    const hdrBack = document.getElementById('btn-header-back');
    if (hdrBack) {
      hdrBack.addEventListener('click', () => {
        sound.playClick();
        this.pauseGame();
      });
    }

    const hdrRestart = document.getElementById('btn-header-restart');
    if (hdrRestart) {
      hdrRestart.addEventListener('click', () => {
        sound.playClick();
        this.startNewGame();
      });
    }

    const pwShake = document.getElementById('btn-powerup-shake');
    if (pwShake) {
      pwShake.addEventListener('click', () => {
        if (this.state !== 'PLAYING') return;
        sound.playShake();
        this.world.shake(8);
        this.renderer.triggerShake(7, 0.35);
        this.renderer.addPopup(230, 260, 'Shake!');
      });
    }

    const pwBomb = document.getElementById('btn-powerup-bomb');
    if (pwBomb) {
      pwBomb.addEventListener('click', () => {
        if (this.state !== 'PLAYING') return;
        sound.playBombArm();
        this.currentTierData = BOMB_ITEM;
        this.clampDropX();
        this.updateNextPreviewUI();
        this.renderer.addPopup(this.dropX, 100, '💣 Bomb Ready! Drop it!');
      });
    }

    document.getElementById('btn-hud-pause').addEventListener('click', () => {
      sound.playClick();
      this.pauseGame();
    });

    document.getElementById('btn-hud-mute').addEventListener('click', () => {
      this.toggleMute();
    });

    document.getElementById('btn-hud-fungidex').addEventListener('click', () => {
      sound.playClick();
      this.openFungidex();
    });

    // Desktop Sidebar buttons
    const sideDex = document.getElementById('btn-side-fungidex');
    if (sideDex) {
      sideDex.addEventListener('click', () => {
        sound.playClick();
        this.openFungidex();
      });
    }

    const sideTut = document.getElementById('btn-side-tutorial');
    if (sideTut) {
      sideTut.addEventListener('click', () => {
        sound.playClick();
        this.openTutorial();
      });
    }

    const sideSet = document.getElementById('btn-side-settings');
    if (sideSet) {
      sideSet.addEventListener('click', () => {
        sound.playClick();
        this.openSettings();
      });
    }

    const sideMute = document.getElementById('btn-side-mute');
    if (sideMute) {
      sideMute.addEventListener('click', () => {
        this.toggleMute();
      });
    }

    // Pause Dialog buttons
    document.getElementById('btn-pause-resume').addEventListener('click', () => {
      sound.playClick();
      this.resumeGame();
    });

    document.getElementById('btn-pause-restart').addEventListener('click', () => {
      sound.playClick();
      this.startNewGame();
    });

    document.getElementById('btn-pause-settings').addEventListener('click', () => {
      sound.playClick();
      this.openSettings();
    });

    document.getElementById('btn-pause-title').addEventListener('click', () => {
      sound.playClick();
      this.quitToTitle();
    });

    // Results Dialog buttons
    document.getElementById('btn-result-retry').addEventListener('click', () => {
      sound.playClick();
      this.startNewGame();
    });

    document.getElementById('btn-result-fungidex').addEventListener('click', () => {
      sound.playClick();
      this.openFungidex();
    });

    document.getElementById('btn-result-title').addEventListener('click', () => {
      sound.playClick();
      this.quitToTitle();
    });

    // Dialog close buttons
    document.querySelectorAll('.btn-dialog-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sound.playClick();
        const dialog = e.target.closest('dialog');
        if (dialog) dialog.close();
      });
    });

    // Settings controls
    const sfxSlider = document.getElementById('slider-sfx-vol');
    const musicSlider = document.getElementById('slider-music-vol');
    const shakeToggle = document.getElementById('toggle-screen-shake');
    const aimToggle = document.getElementById('toggle-aim-guide');

    sfxSlider.value = this.settings.sfxVolume * 100;
    musicSlider.value = this.settings.musicVolume * 100;
    shakeToggle.checked = this.settings.screenShake;
    aimToggle.checked = this.settings.aimGuide;

    sfxSlider.addEventListener('input', (e) => {
      this.settings.sfxVolume = e.target.value / 100;
      sound.setSFXVolume(this.settings.sfxVolume);
      this.saveStorage();
    });

    musicSlider.addEventListener('input', (e) => {
      this.settings.musicVolume = e.target.value / 100;
      sound.setMusicVolume(this.settings.musicVolume);
      this.saveStorage();
    });

    shakeToggle.addEventListener('change', (e) => {
      this.settings.screenShake = e.target.checked;
      this.saveStorage();
    });

    aimToggle.addEventListener('change', (e) => {
      this.settings.aimGuide = e.target.checked;
      this.saveStorage();
    });

    document.getElementById('btn-clear-data').addEventListener('click', () => {
      if (confirm('Reset your best score and compendium unlocks?')) {
        sound.playClick();
        localStorage.clear();
        this.bestScore = 0;
        this.discoveredTiers = new Set([1]);
        this.updateStatsUI();
        this.updateFungidexUI();
        this.updateLadderUI();
        alert('Compendium data reset.');
      }
    });

    // Close dialog when clicking backdrop
    document.querySelectorAll('dialog').forEach(dialog => {
      dialog.addEventListener('click', (e) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY && e.clientY <= rect.bottom &&
          rect.left <= e.clientX && e.clientX <= rect.right
        );
        if (!isInDialog) {
          dialog.close();
        }
      });
    });
  }

  toggleMute() {
    const isMuted = sound.toggleMute();
    const muteBtn = document.getElementById('btn-hud-mute');
    if (muteBtn) {
      muteBtn.textContent = isMuted ? '🔇' : '🔊';
      muteBtn.title = isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)';
    }

    const sideMuteIcon = document.getElementById('side-mute-icon');
    const sideMuteText = document.getElementById('side-mute-text');
    if (sideMuteIcon && sideMuteText) {
      sideMuteIcon.textContent = isMuted ? '🔇' : '🔊';
      sideMuteText.textContent = isMuted ? 'Sound: OFF' : 'Sound: ON';
    }
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    const pauseDialog = document.getElementById('pause-dialog');
    pauseDialog.showModal();
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    const pauseDialog = document.getElementById('pause-dialog');
    pauseDialog.close();
  }

  quitToTitle() {
    this.state = 'TITLE';
    this.closeAllDialogs();
    document.getElementById('game-hud').classList.add('hidden');
    document.getElementById('title-screen').classList.remove('hidden');
    this.world.clear();
  }

  openTutorial() {
    const tutorialDialog = document.getElementById('tutorial-dialog');
    tutorialDialog.showModal();
  }

  openSettings() {
    const settingsDialog = document.getElementById('settings-dialog');
    settingsDialog.showModal();
  }

  openFungidex() {
    this.updateFungidexUI();
    const dexDialog = document.getElementById('fungidex-dialog');
    dexDialog.showModal();
  }

  closeAllDialogs() {
    document.querySelectorAll('dialog').forEach(d => {
      if (d.open) d.close();
    });
  }

  updateStatsUI() {
    const formattedScore = this.score.toLocaleString();
    const formattedBest = this.bestScore.toLocaleString();

    document.getElementById('hud-score').textContent = formattedScore;
    document.getElementById('hud-best-score').textContent = formattedBest;

    const allTimeEl = document.getElementById('hud-alltime');
    if (allTimeEl) allTimeEl.textContent = formattedBest;

    const desktopScore = document.getElementById('hud-score-desktop');
    if (desktopScore) desktopScore.textContent = formattedScore;

    const desktopBest = document.getElementById('hud-best-score-desktop');
    if (desktopBest) desktopBest.textContent = formattedBest;

    const desktopMerges = document.getElementById('hud-merges-desktop');
    if (desktopMerges) desktopMerges.textContent = this.totalMerges.toString();

    const titleBest = document.getElementById('title-best-score');
    if (titleBest) titleBest.textContent = formattedBest;
  }

  updateNextPreviewUI() {
    if (!this.nextTierData) return;

    // Horizontal Next Queue Pill preview (matching reference image)
    const queueCanvas = document.getElementById('next-queue-canvas');
    if (queueCanvas && this.nextQueue) {
      const qctx = queueCanvas.getContext('2d');
      qctx.clearRect(0, 0, queueCanvas.width, queueCanvas.height);
      const count = Math.min(4, this.nextQueue.length);
      const spacing = queueCanvas.width / count;

      for (let i = 0; i < count; i++) {
        const item = this.nextQueue[i];
        if (!item) continue;
        const cx = spacing * (i + 0.5);
        const cy = queueCanvas.height / 2;

        if (i > 0) {
          qctx.strokeStyle = 'rgba(180, 140, 110, 0.25)';
          qctx.lineWidth = 1;
          qctx.beginPath();
          qctx.moveTo(spacing * i, 5);
          qctx.lineTo(spacing * i, queueCanvas.height - 5);
          qctx.stroke();
        }

        qctx.save();
        qctx.translate(cx, cy);
        const scale = Math.min(1.0, 12 / item.radius);
        qctx.scale(scale, scale);
        this.renderer.drawMushroomBody(qctx, {
          tierData: item,
          isBlinking: false,
          lookX: 0,
          lookY: 0
        }, false);
        qctx.restore();
      }
    }

    // Mobile canvas preview
    const mobileCanvas = document.getElementById('hud-next-canvas');
    if (mobileCanvas) {
      this.drawPreviewIcon(mobileCanvas, this.nextTierData, 22);
    }
    const mobileName = document.getElementById('hud-next-name');
    if (mobileName) mobileName.textContent = this.nextTierData.name;

    // Desktop canvas preview
    const desktopCanvas = document.getElementById('hud-next-canvas-desktop');
    if (desktopCanvas) {
      this.drawPreviewIcon(desktopCanvas, this.nextTierData, 34);
    }
    const desktopName = document.getElementById('hud-next-name-desktop');
    if (desktopName) desktopName.textContent = this.nextTierData.name;
  }

  initEvolutionBar() {
    const track = document.getElementById('evolution-track-pill');
    if (!track) return;
    track.innerHTML = '';

    for (const tierData of MUSHROOM_TIERS) {
      const slot = document.createElement('div');
      slot.className = 'evo-slot locked';
      slot.id = `evo-slot-${tierData.tier}`;
      slot.title = `Tier ${tierData.tier}: ${tierData.name}`;

      const canvas = document.createElement('canvas');
      canvas.width = 30;
      canvas.height = 30;
      canvas.className = 'evo-canvas';

      slot.appendChild(canvas);
      track.appendChild(slot);
    }
    this.updateEvolutionBar();
  }

  updateEvolutionBar() {
    for (const tierData of MUSHROOM_TIERS) {
      const slot = document.getElementById(`evo-slot-${tierData.tier}`);
      if (!slot) continue;

      const isDiscovered = this.discoveredTiers.has(tierData.tier);
      const isHighest = tierData.tier === this.highestTier;

      slot.className = `evo-slot ${isDiscovered ? 'unlocked' : 'locked'} ${isHighest ? 'active-highest' : ''}`;

      const canvas = slot.querySelector('canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);

        if (isDiscovered) {
          const scale = Math.min(1.0, 13 / tierData.radius);
          ctx.scale(scale, scale);
          this.renderer.drawMushroomBody(ctx, {
            tierData,
            isBlinking: false,
            lookX: 0,
            lookY: 0
          }, false);
        } else {
          // Silhouette placeholder
          ctx.fillStyle = 'rgba(180, 150, 120, 0.35)';
          ctx.beginPath();
          ctx.arc(0, 0, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 10px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', 0, 0);
        }
        ctx.restore();
      }
    }
  }

  updateTargetTierUI() {
    const nextTargetTier = Math.min(11, this.highestTier + 1);
    const targetData = MUSHROOM_TIERS[nextTargetTier - 1];
    const isUnlocked = this.discoveredTiers.has(nextTargetTier);

    const desktopCanvas = document.getElementById('hud-target-canvas-desktop');
    if (desktopCanvas) {
      const ctx = desktopCanvas.getContext('2d');
      ctx.clearRect(0, 0, desktopCanvas.width, desktopCanvas.height);
      ctx.save();
      ctx.translate(desktopCanvas.width / 2, desktopCanvas.height / 2);

      if (isUnlocked) {
        const scale = Math.min(1.0, 34 / targetData.radius);
        ctx.scale(scale, scale);
        this.renderer.drawMushroomBody(ctx, {
          tierData: targetData,
          isBlinking: false,
          lookX: 0,
          lookY: 0
        }, false);
      } else {
        // Mysterious silhouette
        ctx.fillStyle = '#1D2E22';
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#659654';
        ctx.font = 'bold 24px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);
      }
      ctx.restore();
    }

    const desktopName = document.getElementById('hud-target-name-desktop');
    if (desktopName) {
      desktopName.textContent = isUnlocked ? targetData.name : 'Unknown Species';
    }
  }

  drawPreviewIcon(canvas, tierData, maxRadius) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    const scale = Math.min(1.0, maxRadius / tierData.radius);
    ctx.scale(scale, scale);
    this.renderer.drawMushroomBody(ctx, {
      tierData,
      isBlinking: false,
      lookX: 0,
      lookY: 0
    }, false);
    ctx.restore();
  }

  initLadderUI() {
    const ladderContainer = document.getElementById('ladder-list');
    if (!ladderContainer) return;
    ladderContainer.innerHTML = '';

    for (const tierData of MUSHROOM_TIERS) {
      const item = document.createElement('div');
      item.id = `ladder-item-${tierData.tier}`;
      item.className = 'ladder-item locked';

      const dot = document.createElement('span');
      dot.className = 'ladder-dot';
      dot.style.backgroundColor = tierData.color;

      const name = document.createElement('span');
      name.className = 'ladder-name';
      name.textContent = `T${tierData.tier} ${tierData.name}`;

      item.appendChild(dot);
      item.appendChild(name);
      ladderContainer.appendChild(item);
    }
  }

  updateLadderUI() {
    for (const tierData of MUSHROOM_TIERS) {
      const item = document.getElementById(`ladder-item-${tierData.tier}`);
      if (!item) continue;

      const isDiscovered = this.discoveredTiers.has(tierData.tier);
      const isHighest = tierData.tier === this.highestTier;

      item.className = 'ladder-item';
      if (isDiscovered) item.classList.add('unlocked');
      else item.classList.add('locked');

      if (isHighest) {
        item.classList.add('active-highest');
      }
    }
  }

  updateFungidexUI() {
    const grid = document.getElementById('fungidex-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const discoveredCount = this.discoveredTiers.size;
    const progressEl = document.getElementById('fungidex-progress');
    if (progressEl) {
      progressEl.textContent = `${discoveredCount} / ${MUSHROOM_TIERS.length} Discovered`;
    }

    for (const tierData of MUSHROOM_TIERS) {
      const isUnlocked = this.discoveredTiers.has(tierData.tier);
      const card = document.createElement('div');
      card.className = `dex-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      const canvas = document.createElement('canvas');
      canvas.width = 90;
      canvas.height = 90;
      canvas.className = 'dex-canvas';
      const ctx = canvas.getContext('2d');
      ctx.translate(45, 45);

      if (isUnlocked) {
        const scale = Math.min(1.0, 40 / tierData.radius);
        ctx.scale(scale, scale);
        this.renderer.drawMushroomBody(ctx, {
          tierData,
          isBlinking: false,
          lookX: 0,
          lookY: 0
        }, false);
      } else {
        ctx.fillStyle = '#EFE5D8';
        ctx.beginPath();
        ctx.arc(0, 0, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#9B816B';
        ctx.font = 'bold 28px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);
      }

      const info = document.createElement('div');
      info.className = 'dex-info';
      info.innerHTML = `
        <div class="dex-tier">Tier ${tierData.tier}</div>
        <div class="dex-name">${isUnlocked ? tierData.name : 'Unknown Creature'}</div>
        <div class="dex-species">${isUnlocked ? tierData.species : 'Undiscovered'}</div>
        <div class="dex-desc">${isUnlocked ? tierData.description : `Merge two Tier ${tierData.tier - 1}s to discover!`}</div>
        <div class="dex-points">${tierData.points} pts</div>
      `;

      card.appendChild(canvas);
      card.appendChild(info);
      grid.appendChild(card);
    }
  }

  loop(currentTime) {
    const dt = Math.min(0.05, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // Handle smooth keyboard glide
    if (this.state === 'PLAYING') {
      if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
        this.dropX -= this.keySpeed * dt;
        this.clampDropX();
      }
      if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
        this.dropX += this.keySpeed * dt;
        this.clampDropX();
      }

      this.pollGamepad(dt);

      // Dropper creature eye blinking
      this.heldBlinkTimer -= dt;
      if (this.heldBlinkTimer <= 0) {
        if (!this.heldIsBlinking) {
          this.heldIsBlinking = true;
          this.heldBlinkTimer = 0.14;
        } else {
          this.heldIsBlinking = false;
          this.heldBlinkTimer = Math.random() * 4 + 2.5;
        }
      }

      // Reload cooldown
      if (!this.canDrop) {
        this.dropCooldownTimer -= dt;
        if (this.dropCooldownTimer <= 0) {
          this.canDrop = true;
        }
      }

      // Update Physics
      const merges = this.world.update(dt, (typeOrRadius, param2) => {
        if (typeOrRadius === 'fuse_tick') {
          sound.playFuseTick(1.0 + (param2 / 3.0) * 0.5);
        } else {
          sound.playBounce(typeOrRadius, param2);
        }
      });

      if (merges.detonations && merges.detonations.length > 0) {
        this.handleDetonations(merges.detonations);
      }

      if (merges.length > 0) {
        this.handleMerges(merges);
      }

      // Check Danger Line Overflow
      let isAnyAboveDanger = false;
      for (const m of this.world.mushrooms) {
        if (m.isMerging) continue;
        const age = (currentTime - m.createdAt) / 1000;

        // A mushroom is considered landed/settled in the terrarium if:
        // 1. It has been in the jar for > 0.75s (completed its drop entry), OR
        // 2. It has entered sleep/resting state, OR
        // 3. Its downward velocity has settled (vy < 1.0 after 0.35s)
        const isLanded = age > 0.75 || m.isSleeping || (age > 0.35 && m.vy < 1.0);

        const rUp = getCreatureRadiusAtAngle(m, -Math.PI * 0.5);
        if (isLanded && (m.y - rUp) < this.dangerLineY) {
          isAnyAboveDanger = true;
          break;
        }
      }

      if (isAnyAboveDanger) {
        this.isDangerActive = true;
        this.dangerTimer += dt;
        this.dangerSoundTimer -= dt;
        if (this.dangerSoundTimer <= 0) {
          sound.playDangerTick();
          this.dangerSoundTimer = 0.45;
        }

        if (this.dangerTimer >= this.dangerMaxTime) {
          this.triggerGameOver();
        }
      } else {
        this.isDangerActive = false;
        this.dangerTimer = Math.max(0, this.dangerTimer - dt * 0.8);
      }
    }

    // Update Renderer particles & FX
    this.renderer.update(dt);

    // Render frame
    this.renderer.render({
      world: this.world,
      heldMushroom: this.state === 'PLAYING' && this.currentTierData ? { ...this.currentTierData, isBlinking: this.heldIsBlinking } : null,
      dropX: this.dropX,
      aimAssisted: this.settings.aimGuide !== false,
      dangerLineY: this.dangerLineY,
      dangerTimer: this.dangerTimer,
      dangerMaxTime: this.dangerMaxTime,
      isDangerActive: this.isDangerActive,
      canDrop: this.canDrop
    });

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameManager();
});
