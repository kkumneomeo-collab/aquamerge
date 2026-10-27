import { MUSHROOM_TIERS, BOMB_ITEM } from './mushroom-data.js?v=20261027_claw_v2';

/**
 * Canvas Renderer for Cozy Plushie Toybox Merge Puzzle
 * Handles Transparent 3D Toybox Showcase, Animated Living Plushies with Eye Blinking,
 * Timed Spark Bomb with 3s Countdown & Detonation Blast, Floating Scores, and Stitched FX.
 */
export class TerrariumRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.floatingScores = [];
    this.ambientSpores = [];
    this.popups = []; // Animated comic popups ("Cozy!", "Cuddles!", "Plush Pop!")
    this.shakeTime = 0;
    this.shakeIntensity = 0;
    this.clawOpenTimer = 0; // Arcade claw machine opening recoil timer

    // Preload plushie character sprites (both open eyes and cute blinking eyes)
    this.animalImages = {};
    this.blinkImages = {};
    for (const tierData of MUSHROOM_TIERS) {
      if (tierData.imageSrc) {
        const img = new Image();
        img.src = tierData.imageSrc;
        this.animalImages[tierData.tier] = img;
      }
      if (tierData.blinkSrc) {
        const bImg = new Image();
        bImg.src = tierData.blinkSrc;
        this.blinkImages[tierData.tier] = bImg;
      }
    }

    // Preload Pink Felt Sparkle Bomb Sprite
    this.bombImage = new Image();
    this.bombImage.src = BOMB_ITEM.imageSrc;
    this.animalImages[99] = this.bombImage;
    this.animalImages['plush_bomb'] = this.bombImage;

    this.initAmbientSpores();
  }

  initAmbientSpores() {
    this.ambientSpores = [];
    for (let i = 0; i < 28; i++) {
      this.ambientSpores.push({
        x: Math.random() * 460,
        y: Math.random() * 720,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.3 - Math.random() * 0.45, // gentle rising cotton fluff / fairy sparkle
        size: Math.random() * 3.5 + 2.0,
        alpha: Math.random() * 0.4 + 0.35,
        wobblePhase: Math.random() * Math.PI * 2
      });
    }
  }

  addPopup(x, y, customWord = null) {
    const words = ['Cozy!', 'So Soft!', 'Cuddles!', 'Plush Pop!', 'Sparkle!', 'Delight!'];
    const chosen = customWord || words[Math.floor(Math.random() * words.length)];
    this.popups.push({
      x,
      y: y - 10,
      vy: -1.4,
      text: chosen,
      scale: 0.3,
      targetScale: 1.15,
      alpha: 1.0,
      life: 0.85,
      maxLife: 0.85
    });
  }

  triggerShake(intensity = 6, duration = 0.25) {
    this.shakeIntensity = intensity;
    this.shakeTime = duration;
  }

  triggerClawDrop() {
    this.clawOpenTimer = 0.35; // Arcade claw prongs spring open!
  }

  /**
   * Detonation Visual FX for the 3-Second Timed Spark Bomb
   */
  addBombBlast(x, y, radius = 160, blastedCount = 0) {
    // 1. Mighty Screen Shake!
    this.triggerShake(15, 0.45);

    // 2. Twin Expanding Shockwave Rings
    this.particles.push({
      type: 'shockwave',
      x,
      y,
      radius: 12,
      maxRadius: radius * 1.35,
      growthSpeed: 440,
      alpha: 1.0,
      life: 0.55,
      maxLife: 0.55,
      color: '#F43F5E',
      lineWidth: 8
    });
    this.particles.push({
      type: 'shockwave',
      x,
      y,
      radius: 6,
      maxRadius: radius * 1.1,
      growthSpeed: 360,
      alpha: 1.0,
      life: 0.45,
      maxLife: 0.45,
      color: '#FBBF24',
      lineWidth: 5
    });

    // 3. Fluffy Cotton Cloud Puffs
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5.5 + 2.0;
      this.particles.push({
        type: 'cotton',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.random() * 18 + 12,
        alpha: 0.9,
        life: 0.65,
        maxLife: 0.65,
        color: i % 2 === 0 ? '#FFFFFF' : '#FECDD3'
      });
    }

    // 4. Star & Heart Felt Confetti
    const colors = ['#F43F5E', '#FBBF24', '#38BDF8', '#C084FC', '#34D399', '#FB7185'];
    for (let i = 0; i < 36; i++) {
      const angle = (Math.PI * 2 * i) / 36 + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 7.5 + 3.0;
      this.particles.push({
        type: 'sparkle_star',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: Math.random() * 7 + 4,
        alpha: 1.0,
        life: 0.75,
        maxLife: 0.75,
        color: colors[i % colors.length]
      });
    }

    // 5. Giant Comic Popup
    const text = blastedCount > 1 ? `KABOOM! ${blastedCount} POPPED!` : 'BOOM! BLAST!';
    this.addPopup(x, y - 20, text);
  }

  addMergeBurst(x, y, tierData) {
    const bubbleCount = 14 + tierData.tier * 2;
    // 1. Soft Cotton Puffs & Sparkles
    for (let i = 0; i < bubbleCount; i++) {
      const angle = (Math.PI * 2 * i) / bubbleCount + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 3.5 + 1.2;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed * 0.65,
        vy: -Math.abs(Math.sin(angle) * speed) - 2.0, // Rises UP!
        size: Math.random() * 5 + 4,
        maxSize: Math.random() * 8 + 8,
        wobblePhase: Math.random() * Math.PI * 2,
        alpha: 1.0,
        life: 0.75 + Math.random() * 0.45,
        maxLife: 1.2,
        type: 'bubble'
      });
    }

    // 2. Sparkling aqua stars
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 20;
      this.particles.push({
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 2.0,
        vy: (Math.random() - 0.5) * 2.0 - 1.0,
        size: Math.random() * 6 + 4,
        color: '#BAE6FD',
        alpha: 1.0,
        life: 0.5,
        maxLife: 0.5,
        type: 'star'
      });
    }

    // 3. Aqua shockwave ring
    this.particles.push({
      x,
      y,
      radius: tierData.radius * 0.4,
      targetRadius: tierData.radius * 1.8,
      color: '#38BDF8',
      alpha: 0.85,
      life: 0.35,
      maxLife: 0.35,
      type: 'ring'
    });
  }

  addFloatingScore(x, y, points, color = '#FFD700') {
    this.floatingScores.push({
      x,
      y,
      text: `+${points}`,
      color,
      vy: -2.2,
      alpha: 1.0,
      scale: 1.3,
      life: 0.9,
      maxLife: 0.9
    });
  }

  update(dt) {
    // Screen shake decay
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      if (this.shakeTime <= 0) {
        this.shakeIntensity = 0;
      }
    }

    // Arcade claw recoil timer decay
    if (this.clawOpenTimer > 0) {
      this.clawOpenTimer -= dt;
    }

    // Update ambient rising bubbles
    for (const s of this.ambientSpores) {
      s.x += s.vx + Math.sin((performance.now() + s.y) * 0.003) * 0.3;
      s.y += s.vy;
      if (s.y < 50) {
        s.y = 715;
        s.x = Math.random() * 460;
      }
    }

    // Update FX particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.type === 'shockwave') {
        p.radius += p.growthSpeed * dt;
      } else if (p.type === 'cotton') {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.size += 0.2;
      } else if (p.type === 'sparkle_star') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.vx *= 0.96;
      } else if (p.type === 'bubble') {
        p.x += p.vx + Math.sin(performance.now() * 0.007 + p.wobblePhase) * 0.6;
        p.y += p.vy;
        p.vy -= 0.08; // upward buoyancy
        p.size = Math.min(p.maxSize, p.size + 0.05);
      } else if (p.type === 'spore' || p.type === 'star') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // slight gravity
      } else if (p.type === 'ring') {
        const progress = 1 - (p.life / p.maxLife);
        p.radius += (p.targetRadius - p.radius) * 0.18;
      }
    }

    // Update floating scores
    for (let i = this.floatingScores.length - 1; i >= 0; i--) {
      const fs = this.floatingScores[i];
      fs.life -= dt;
      if (fs.life <= 0) {
        this.floatingScores.splice(i, 1);
        continue;
      }
      fs.y += fs.vy;
      fs.scale += (1.0 - fs.scale) * 0.1;
      fs.alpha = Math.max(0, fs.life / fs.maxLife);
    }

    // Update celebration 3D popups ("Juicy!", "Sweet!", "Yummy!")
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.popups.splice(i, 1);
        continue;
      }
      p.y += p.vy;
      p.scale += (p.targetScale - p.scale) * 0.18;
      if (p.life < 0.35) {
        p.alpha = Math.max(0, p.life / 0.35);
      }
    }
  }

  render({
    world,
    heldMushroom,
    dropX,
    aimAssisted,
    dangerLineY,
    dangerTimer,
    dangerMaxTime,
    isDangerActive,
    canDrop
  }) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const bounds = world.bounds;

    ctx.save();

    // Screen shake
    if (this.shakeIntensity > 0) {
      const offsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const offsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      ctx.translate(offsetX, offsetY);
    }

    // 1. Clear background
    ctx.clearRect(0, 0, width, height);

    // 2. Render Acrylic Box Interior Backdrop
    this.renderTerrariumBackdrop(ctx, bounds, dangerTimer / dangerMaxTime);

    // 3. Render Ambient Floating Sugar Sparkles
    this.renderAmbientSpores(ctx, bounds);

    // 4. Render Aiming Raycast Guide (if holding a pastry)
    if (heldMushroom && aimAssisted) {
      const landingY = world.getLandingPreviewY(dropX, heldMushroom.radius, heldMushroom);
      this.renderAimingGuide(ctx, dropX, heldMushroom, landingY, bounds, dangerLineY);
    }

    // 5. Render Settled & Falling Pastries in Box
    for (const m of world.mushrooms) {
      this.renderMushroom(ctx, m, dangerLineY, isDangerActive);
    }

    // 6. Render Transparent 3D Acrylic Box Frame & Highlights
    this.renderGlassJar(ctx, bounds);

    // 7. Render Danger Line & Warning Gauge
    this.renderDangerLine(ctx, bounds, dangerLineY, dangerTimer, dangerMaxTime, isDangerActive);

    // 8. Render Particles & Floating Scores
    this.renderParticles(ctx);
    this.renderFloatingScores(ctx);

    // 9. Render Celebration 3D Popups ("Juicy!", "Sweet!")
    this.renderPopups(ctx);

    // 10. Render Claw Machine Crane & Held Plushie
    this.renderClawCrane(ctx, dropX, heldMushroom, canDrop, bounds);

    ctx.restore();
  }

  renderPopups(ctx) {
    ctx.save();
    for (const pop of this.popups) {
      ctx.save();
      ctx.translate(pop.x, pop.y);
      ctx.scale(pop.scale, pop.scale);
      ctx.globalAlpha = pop.alpha;

      ctx.font = '900 42px "Fredoka", "Outfit", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 3D Extrusion Depth Shadows
      ctx.fillStyle = '#4A0E17';
      for (let offset = 5; offset >= 1; offset--) {
        ctx.fillText(pop.text, 0, offset);
      }

      // Dark Crimson/Berry Outline
      ctx.strokeStyle = '#4A0E17';
      ctx.lineWidth = 7;
      ctx.lineJoin = 'round';
      ctx.strokeText(pop.text, 0, 0);

      // Vibrant Gradient Fill (like Juicy! in reference image: magenta-pink to sunny peach/gold)
      const grad = ctx.createLinearGradient(0, -22, 0, 22);
      grad.addColorStop(0, '#FF3377');
      grad.addColorStop(0.5, '#FF6B8B');
      grad.addColorStop(1, '#FFD54F');
      ctx.fillStyle = grad;
      ctx.fillText(pop.text, 0, 0);

      ctx.restore();
    }
    ctx.restore();
  }

  renderTerrariumBackdrop(ctx, bounds, dangerRatio) {
    const { left, right, top, bottom } = bounds;
    const w = right - left;
    const h = bottom - top;

    ctx.save();

    // Clip to container interior
    ctx.beginPath();
    ctx.rect(left, top, w, h);
    ctx.closePath();
    ctx.clip();

    // Plain, aesthetic soft pastel pink velvet interior
    const bgGrad = ctx.createLinearGradient(0, top, 0, bottom);
    if (dangerRatio > 0.3) {
      bgGrad.addColorStop(0, '#FFF1F2');
      bgGrad.addColorStop(1, '#FECDD3');
    } else {
      bgGrad.addColorStop(0, '#FFF5F7');
      bgGrad.addColorStop(0.5, '#FDF2F8');
      bgGrad.addColorStop(1, '#FCE7F3');
    }
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Soft stitched pink felt cushion bed at the toybox floor
    const floorH = 18;
    const floorY = bottom - floorH;
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, bottom);
    floorGrad.addColorStop(0, '#F472B6');
    floorGrad.addColorStop(0.5, '#EC4899');
    floorGrad.addColorStop(1, '#DB2777');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(left, floorY, w, floorH);

    // Stitched quilted embroidery line across cushion
    ctx.save();
    ctx.strokeStyle = '#FDF2F8';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(left + 8, floorY + 6);
    ctx.lineTo(right - 8, floorY + 6);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  renderAmbientSpores(ctx, bounds) {
    ctx.save();
    for (const s of this.ambientSpores) {
      if (s.x >= bounds.left - 20 && s.x <= bounds.right + 20 && s.y >= bounds.top - 40 && s.y <= bounds.bottom) {
        ctx.save();
        ctx.globalAlpha = s.alpha * 0.75;
        ctx.translate(s.x, s.y);

        // Soft floating cotton fluff & fairy sparkle
        const grad = ctx.createRadialGradient(-s.size * 0.2, -s.size * 0.2, s.size * 0.1, 0, 0, s.size);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.5, 'rgba(254, 240, 138, 0.65)');
        grad.addColorStop(1, 'rgba(244, 63, 94, 0.25)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, s.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }
    ctx.restore();
  }

  renderAimingGuide(ctx, dropX, heldMushroom, landingY, bounds, dangerLineY) {
    ctx.save();

    // 1. Dotted vertical drop beam with circular dots (strawberry rose)
    const dotSpacing = 16;
    const dotRadius = 3.5;
    const dotColor = '#F43F5E';

    const startBeamY = 76 + heldMushroom.radius + 6;
    ctx.fillStyle = dotColor;
    for (let y = startBeamY; y < landingY - 6; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(dropX, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Ghost preview matching actual creature silhouette at landing position
    ctx.save();
    ctx.translate(dropX, landingY);

    const data = heldMushroom;
    const r = data.radius;
    let img = null;
    if (data.isBomb || data.id === 'plush_bomb' || data.tier === 99) {
      img = this.bombImage;
    } else if (this.animalImages && this.animalImages[data.tier] && this.animalImages[data.tier].complete && this.animalImages[data.tier].naturalWidth > 0) {
      img = this.animalImages[data.tier];
    }

    if (img) {
      const drawScale = (data.features && data.features.drawScale) || 2.12;
      const aspect = img.naturalWidth / img.naturalHeight;
      let dw, dh;
      if (aspect >= 1) {
        dw = r * drawScale;
        dh = dw / aspect;
      } else {
        dh = r * drawScale;
        dw = dh * aspect;
      }
      const ox = ((data.features && data.features.offsetX) || 0) * (r / 50);
      const oy = ((data.features && data.features.offsetY) || 0) * (r / 50);

      ctx.save();
      ctx.globalAlpha = 0.38;
      ctx.drawImage(img, -dw / 2 + ox, -dh / 2 + oy, dw, dh);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = heldMushroom.color;
      ctx.globalAlpha = 0.22;
      ctx.fill();
    }

    // Ghost landing center anchor point
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#F43F5E';
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  renderGlassJar(ctx, bounds) {
    const { left, right, top, bottom } = bounds;
    const w = right - left;
    const h = bottom - top;

    ctx.save();

    const depthX = 22;
    const depthY = 28;

    // 1. 3D Rear Wall Back Corner Lines (sweet pink toybox depth)
    ctx.beginPath();
    ctx.moveTo(left + depthX, top - depthY);
    ctx.lineTo(left + depthX, bottom - 12);
    ctx.moveTo(right - depthX, top - depthY);
    ctx.lineTo(right - depthX, bottom - 12);
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. 3D Open Top Rim (Perspective opening)
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left + depthX, top - depthY);
    ctx.lineTo(right - depthX, top - depthY);
    ctx.lineTo(right, top);
    ctx.closePath();

    ctx.fillStyle = 'rgba(253, 242, 248, 0.45)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 3. Front Acrylic Showcase Outer Walls
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.lineTo(right, top);

    ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // 4. Warm Edge Highlights (left and right)
    ctx.beginPath();
    ctx.moveTo(left + 4, top + 10);
    ctx.lineTo(left + 4, bottom - 4);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(right - 4, top + 15);
    ctx.lineTo(right - 4, bottom - 4);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 5. Sweet Pink Arcade Base Stand
    const baseW = w + 16;
    const baseX = left - 8;
    const baseY = bottom;
    const baseH = 10;

    const baseGrad = ctx.createLinearGradient(0, baseY, 0, baseY + baseH);
    baseGrad.addColorStop(0, '#F472B6');
    baseGrad.addColorStop(0.5, '#EC4899');
    baseGrad.addColorStop(1, '#DB2777');
    ctx.fillStyle = baseGrad;

    ctx.beginPath();
    ctx.roundRect(baseX, baseY, baseW, baseH, [0, 0, 6, 6]);
    ctx.fill();
    ctx.strokeStyle = '#BE185D';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  renderDangerLine(ctx, bounds, dangerLineY, dangerTimer, dangerMaxTime, isDangerActive) {
    const { left, right } = bounds;
    const dangerRatio = Math.min(1.0, dangerTimer / dangerMaxTime);

    ctx.save();

    // Dashed warning line
    ctx.beginPath();
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = isDangerActive ? performance.now() * 0.05 : 0;
    ctx.moveTo(left + 4, dangerLineY);
    ctx.lineTo(right - 4, dangerLineY);

    if (isDangerActive) {
      // Flashing alert colors
      const flash = (Math.sin(performance.now() * 0.015) + 1) * 0.5;
      const r = Math.round(255);
      const g = Math.round(60 + flash * 60);
      const b = 60;
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Danger Label & Gauge
    if (isDangerActive) {
      const badgeW = 126;
      const badgeH = 22;
      const badgeX = (left + right) * 0.5 - badgeW * 0.5;
      const badgeY = dangerLineY - 14;

      ctx.fillStyle = 'rgba(50, 15, 15, 0.9)';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
      ctx.fill();
      ctx.stroke();

      // Gauge fill bar
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.roundRect(badgeX + 2, badgeY + 2, (badgeW - 4) * dangerRatio, badgeH - 4, 4);
      ctx.fill();

      // Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const timeLeft = Math.max(0, (dangerMaxTime - dangerTimer)).toFixed(1);
      ctx.fillText(`OVERFLOW: ${timeLeft}s`, (left + right) * 0.5, badgeY + badgeH * 0.5);
    } else {
      // Peaceful danger tag
      ctx.fillStyle = 'rgba(217, 119, 6, 0.75)';
      ctx.font = '9px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('TOYBOX OVERFLOW LIMIT', left + 10, dangerLineY - 4);
    }

    ctx.restore();
  }

  renderClawCrane(ctx, dropX, heldMushroom, canDrop, bounds) {
    const { left, right } = bounds;

    ctx.save();

    // 1. Top Gantry Crane Horizontal Rails (across top of cabinet)
    const railY1 = 12;
    const railY2 = 18;
    const railLeft = left - 6;
    const railRight = right + 6;

    // Dual stainless steel chrome rails
    ctx.save();
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(railLeft, railY1);
    ctx.lineTo(railRight, railY1);
    ctx.moveTo(railLeft, railY2);
    ctx.lineTo(railRight, railY2);
    ctx.stroke();

    // Rail specular gleam
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(railLeft, railY1 - 0.5);
    ctx.lineTo(railRight, railY1 - 0.5);
    ctx.stroke();

    // End bumper brackets on left and right
    ctx.fillStyle = '#EC4899';
    ctx.beginPath();
    ctx.roundRect(railLeft - 4, railY1 - 4, 10, 14, 3);
    ctx.roundRect(railRight - 6, railY1 - 4, 10, 14, 3);
    ctx.fill();
    ctx.strokeStyle = '#BE185D';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 2. Motorized Crane Carriage / Trolley (slides along rail to dropX)
    const carriageW = 48;
    const carriageH = 16;
    const carriageX = dropX - carriageW / 2;
    const carriageY = 7;

    // Trolley guide wheels resting on the rails
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(dropX - 16, railY1, 4, 0, Math.PI * 2);
    ctx.arc(dropX + 16, railY1, 4, 0, Math.PI * 2);
    ctx.fill();

    // Trolley main body (cute arcade pastel pink with chrome trim)
    const trolleyGrad = ctx.createLinearGradient(0, carriageY, 0, carriageY + carriageH);
    trolleyGrad.addColorStop(0, '#F472B6');
    trolleyGrad.addColorStop(0.5, '#EC4899');
    trolleyGrad.addColorStop(1, '#DB2777');
    ctx.fillStyle = trolleyGrad;
    ctx.beginPath();
    ctx.roundRect(carriageX, carriageY, carriageW, carriageH, 6);
    ctx.fill();

    ctx.strokeStyle = '#FDA4AF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Twin stainless steel rivets on trolley face
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.arc(carriageX + 7, carriageY + carriageH / 2, 2.2, 0, Math.PI * 2);
    ctx.arc(carriageX + carriageW - 7, carriageY + carriageH / 2, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Arcade Claw Status LED Jewel (glowing green when ready, amber when reloading)
    const isReady = canDrop && !!heldMushroom;
    const ledColor = isReady ? '#10B981' : '#F59E0B';
    const ledGlow = isReady ? '#34D399' : '#FBBF24';

    ctx.save();
    ctx.shadowColor = ledGlow;
    ctx.shadowBlur = 8;
    ctx.fillStyle = ledColor;
    ctx.beginPath();
    ctx.arc(dropX, carriageY + carriageH / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Vertical Steel Cable / Telescopic Crane Rod
    const plushieCenterY = 76;
    const plushieR = heldMushroom ? heldMushroom.radius : 24;
    const hubY = plushieCenterY - plushieR - 10;
    const cableTopY = carriageY + carriageH;

    // Cable line
    ctx.save();
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(dropX, cableTopY);
    ctx.lineTo(dropX, hubY);
    ctx.stroke();

    // Hydraulic joint ring collars
    ctx.fillStyle = '#CBD5E1';
    for (let cy = cableTopY + 8; cy < hubY - 4; cy += 12) {
      ctx.fillRect(dropX - 3.5, cy, 7, 3);
    }
    ctx.restore();

    // 4. Rear Claw Prong (depth behind plushie)
    const isOpening = !heldMushroom || !canDrop || (this.clawOpenTimer > 0);
    const clawSpread = isOpening ? 28 : (plushieR + 5);

    ctx.save();
    ctx.translate(dropX, hubY + 12);
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, plushieR * 0.9);
    ctx.stroke();
    ctx.restore();

    // 5. Render Held Plushie Body in the center of the claw
    if (heldMushroom) {
      ctx.save();
      ctx.translate(dropX, plushieCenterY);
      const fakeBody = {
        x: 0,
        y: 0,
        radius: heldMushroom.radius,
        tier: heldMushroom.tier,
        tierData: heldMushroom,
        scale: 1.0,
        squishX: 1.0,
        squishY: 1.0,
        angle: 0,
        isBlinking: heldMushroom.isBlinking || false,
        lookX: 0,
        lookY: 0.2,
        wobble: 0,
        id: 0,
        isSleeping: false,
        isBomb: !!(heldMushroom.isBomb || heldMushroom.tier === 99 || heldMushroom.id === 'plush_bomb')
      };
      this.drawMushroomBody(ctx, fakeBody, false);
      ctx.restore();
    }

    // 6. Claw Mechanical Hub (Bell housing)
    ctx.save();
    ctx.translate(dropX, hubY);

    const hubW = 32;
    const hubH = 18;
    const hubGrad = ctx.createLinearGradient(0, 0, 0, hubH);
    hubGrad.addColorStop(0, '#FDA4AF');
    hubGrad.addColorStop(0.5, '#F43F5E');
    hubGrad.addColorStop(1, '#BE185D');
    ctx.fillStyle = hubGrad;

    ctx.beginPath();
    ctx.roundRect(-hubW / 2, 0, hubW, hubH, [8, 8, 4, 4]);
    ctx.fill();
    ctx.strokeStyle = '#FFF1F2';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Decorative arcade golden star on the hub
    ctx.fillStyle = '#FEF08A';
    this.drawStar(ctx, 0, hubH / 2, 4.5, 2.2);

    // Left and Right mechanical hinge pins
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.arc(-11, hubH - 3, 2.8, 0, Math.PI * 2);
    ctx.arc(11, hubH - 3, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // 7. Articulated Left and Right Claw Prongs (Tongs)
    const hingeY = hubH - 3;
    const prongColor = '#E2E8F0';
    const prongBorder = '#64748B';
    const padColor = '#FB7185';

    // Left Prong
    ctx.save();
    ctx.translate(-11, hingeY);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isOpening) {
      // Open Claw Pose
      ctx.strokeStyle = prongBorder;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-24, 18);
      ctx.lineTo(-32, 38);
      ctx.stroke();

      ctx.strokeStyle = prongColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-24, 18);
      ctx.lineTo(-32, 38);
      ctx.stroke();

      // Rubber grip pad
      ctx.fillStyle = padColor;
      ctx.beginPath();
      ctx.arc(-32, 38, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Grasping Claw Pose (hugging plushie sides snugly!)
      const armOut = clawSpread * 0.95;
      const armDown = plushieR * 0.55 + 10;
      const tipIn = clawSpread * 0.78;
      const tipDown = plushieR * 1.15 + 10;

      // Dark outline
      ctx.strokeStyle = prongBorder;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-armOut, armDown);
      ctx.lineTo(-tipIn, tipDown);
      ctx.stroke();

      // Chrome highlight
      ctx.strokeStyle = prongColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-armOut, armDown);
      ctx.lineTo(-tipIn, tipDown);
      ctx.stroke();

      // Rubber grip pad tip touching plushie
      ctx.fillStyle = padColor;
      ctx.beginPath();
      ctx.arc(-tipIn, tipDown, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Right Prong
    ctx.save();
    ctx.translate(11, hingeY);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isOpening) {
      // Open Claw Pose
      ctx.strokeStyle = prongBorder;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(24, 18);
      ctx.lineTo(32, 38);
      ctx.stroke();

      ctx.strokeStyle = prongColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(24, 18);
      ctx.lineTo(32, 38);
      ctx.stroke();

      // Rubber grip pad
      ctx.fillStyle = padColor;
      ctx.beginPath();
      ctx.arc(32, 38, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Grasping Claw Pose (hugging plushie sides snugly!)
      const armOut = clawSpread * 0.95;
      const armDown = plushieR * 0.55 + 10;
      const tipIn = clawSpread * 0.78;
      const tipDown = plushieR * 1.15 + 10;

      // Dark outline
      ctx.strokeStyle = prongBorder;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(armOut, armDown);
      ctx.lineTo(tipIn, tipDown);
      ctx.stroke();

      // Chrome highlight
      ctx.strokeStyle = prongColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(armOut, armDown);
      ctx.lineTo(tipIn, tipDown);
      ctx.stroke();

      // Rubber grip pad tip touching plushie
      ctx.fillStyle = padColor;
      ctx.beginPath();
      ctx.arc(tipIn, tipDown, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore(); // hub translate
    ctx.restore(); // claw crane save
  }

  renderMushroom(ctx, m, dangerLineY, isTerrariumInDanger) {
    const isNearDanger = (m.y - m.radius) < (dangerLineY + 30);

    ctx.save();
    ctx.translate(m.x, m.y);
    // Upright bias so cute sea creatures stay upright without tipping into walls
    const rot = m.isSleeping ? 0 : (m.angle * 0.12);
    ctx.rotate(rot);
    ctx.scale(m.scale * m.squishX, m.scale * m.squishY);

    this.drawMushroomBody(ctx, m, isNearDanger && isTerrariumInDanger);

    ctx.restore();
  }

  /**
   * High-Resolution Sprite Drawing for the 10 living animal tiers
   */
  drawMushroomBody(ctx, m, isWorried) {
    const data = m.tierData;
    if (!data) return;
    const r = data.radius;

    ctx.save();

    // Timed Spark Bomb rendering (3 seconds fuse timer)
    if (m.isBomb || data.isBomb || data.tier === 99 || data.id === 'plush_bomb') {
      const bombImg = this.bombImage;
      if (bombImg && bombImg.complete && bombImg.naturalWidth > 0) {
        const drawScale = (data.features && data.features.drawScale) || 2.22;
        const dw = r * drawScale;
        const dh = dw;
        ctx.drawImage(bombImg, -dw / 2, -dh / 2, dw, dh);
      } else {
        ctx.fillStyle = '#F43F5E';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 1. Animated Sparkling Star Fuse at top right of bomb
      const fuseScale = (r * 2.22) / 512;
      const fuseX = 134 * fuseScale;
      const fuseY = -201 * fuseScale;
      const now = performance.now() * 0.006;

      ctx.save();
      ctx.translate(fuseX, fuseY);

      // Bright glowing spark aura
      const auraGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 18);
      auraGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      auraGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.75)');
      auraGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic golden star spark rays
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 2.2;
      for (let s = 0; s < 6; s++) {
        const a = (Math.PI * 2 * s) / 6 + now * 4.5;
        const len = 7 + 6 * Math.sin(now * 8 + s * 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
      }
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. 3-Second Countdown Display Badge above the bomb!
      if (m.fuseTimer !== undefined && m.fuseTimer > 0) {
        ctx.save();
        const secondsLeft = Math.max(0.1, m.fuseTimer);
        const displaySec = Math.ceil(secondsLeft); // 3, 2, 1
        const isUrgent = secondsLeft < 1.0;

        ctx.translate(0, -r - 18);
        const badgeColor = isUrgent ? '#EF4444' : '#F59E0B';
        ctx.shadowColor = badgeColor;
        ctx.shadowBlur = isUrgent ? 14 : 7;

        ctx.fillStyle = badgeColor;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 15px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displaySec.toString(), 0, 1);
        ctx.restore();
      }

      ctx.restore();
      return;
    }
    let img = null;
    if (m.isBlinking && this.blinkImages && this.blinkImages[data.tier] && this.blinkImages[data.tier].complete && this.blinkImages[data.tier].naturalWidth > 0) {
      img = this.blinkImages[data.tier];
    } else if (this.animalImages && this.animalImages[data.tier] && this.animalImages[data.tier].complete && this.animalImages[data.tier].naturalWidth > 0) {
      img = this.animalImages[data.tier];
    }

    if (img && img.complete && img.naturalWidth > 0) {
      // Calculate drawing dimensions to fill physics circle nicely
      const drawScale = (data.features && data.features.drawScale) || 2.2;
      const aspect = img.naturalWidth / img.naturalHeight;
      let dw, dh;
      if (aspect >= 1) {
        dw = r * drawScale;
        dh = dw / aspect;
      } else {
        dh = r * drawScale;
        dw = dh * aspect;
      }

      // Visual center offset
      const ox = ((data.features && data.features.offsetX) || 0) * (r / 50);
      const oy = ((data.features && data.features.offsetY) || 0) * (r / 50);

      // Render crisp animal character sprite directly without shadows or swimming distortion
      ctx.drawImage(img, -dw / 2 + ox, -dh / 2 + oy, dw, dh);

      // If in danger state, draw a cute worried sweat bead
      if (isWorried) {
        ctx.save();
        ctx.fillStyle = '#60A5FA';
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(r * 0.65, -r * 0.75, 4, 7, 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    } else {
      // Clean fallback if image is still loading
      ctx.fillStyle = data.color || '#FBBF24';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawSpeciesCap(ctx, data, r) {
    const capColor = data.capColor || data.color;
    const stemColor = data.stemColor || '#FFF';

    switch (data.features.type) {
      case 'sprout': {
        // Bulbous teardrop seed
        ctx.fillStyle = capColor;
        ctx.beginPath();
        ctx.ellipse(0, 2, r, r * 0.95, 0, 0, Math.PI * 2);
        ctx.fill();

        // Twin green sprouting leaves on head
        ctx.fillStyle = data.accentColor;
        ctx.beginPath();
        ctx.ellipse(-r * 0.25, -r * 0.85, r * 0.35, r * 0.18, -0.6, 0, Math.PI * 2);
        ctx.ellipse(r * 0.25, -r * 0.85, r * 0.35, r * 0.18, 0.6, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'button': {
        // Classic button dome cap
        ctx.fillStyle = capColor;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Soft rim cushion
        ctx.fillStyle = data.color;
        ctx.beginPath();
        ctx.ellipse(0, r * 0.45, r * 0.85, r * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'morel': {
        // Full golden honeycomb dome - completely fills bounding circle
        ctx.fillStyle = capColor;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'inkcap': {
        // Full midnight indigo dome - completely fills bounding circle
        ctx.fillStyle = capColor;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'bonnet': {
        // Full coral bonnet dome - completely fills bounding circle
        ctx.fillStyle = capColor;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Soft scalloped rim along the lower cap
        ctx.fillStyle = data.accentColor;
        ctx.beginPath();
        ctx.ellipse(0, r * 0.5, r * 0.85, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'chanterelle': {
        // Full golden trumpet dome - completely fills bounding circle, zero empty space!
        ctx.fillStyle = capColor;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Fluted trumpet rim cushion at top
        ctx.fillStyle = data.accentColor;
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.5, r * 0.75, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Radiating chanterelle gill ridges
        ctx.strokeStyle = data.accentColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let a = -0.65; a <= 0.65; a += 0.26) {
          ctx.moveTo(a * r * 0.9, -r * 0.4);
          ctx.quadraticCurveTo(a * r * 0.5, r * 0.1, a * r * 0.2, r * 0.75);
        }
        ctx.stroke();
        break;
      }

      case 'amanita': {
        // Bold crimson dome
        ctx.fillStyle = capColor;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'bolete': {
        // Heavy velvet dome
        ctx.fillStyle = capColor;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'ghost': {
        // Glowing tiered parasol
        ctx.fillStyle = capColor;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'veil': {
        // Elegant pointed cap
        ctx.fillStyle = capColor;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'eldermyce': {
        // Grand ancient celestial dome
        ctx.fillStyle = capColor;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      default: {
        ctx.fillStyle = capColor;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawSpeciesAccents(ctx, data, r) {
    // Polka dots
    if (data.features.dots) {
      ctx.fillStyle = data.features.dotColor || '#FFFFFF';
      const positions = [
        [-r * 0.45, -r * 0.35, r * 0.15],
        [r * 0.4, -r * 0.4, r * 0.14],
        [0, -r * 0.6, r * 0.18],
        [-r * 0.65, 0, r * 0.12],
        [r * 0.65, -0.05, r * 0.13]
      ];
      for (const [px, py, pr] of positions) {
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Honeycomb pits for Morel
    if (data.features.honeycomb) {
      ctx.fillStyle = data.accentColor;
      const pits = [
        [0, -r * 0.65], [-r * 0.35, -r * 0.4], [r * 0.35, -r * 0.4],
        [-r * 0.5, -0.05], [0, -0.1], [r * 0.5, -0.05],
        [-r * 0.3, 0.3], [r * 0.3, 0.3]
      ];
      for (const [px, py] of pits) {
        ctx.beginPath();
        ctx.ellipse(px, py, r * 0.14, r * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Bioluminescent drips for Inkcap
    if (data.features.drips) {
      ctx.fillStyle = data.features.dripColor;
      const drips = [-r * 0.55, -r * 0.2, r * 0.2, r * 0.6];
      for (const dx of drips) {
        ctx.beginPath();
        ctx.arc(dx, r * 0.65, r * 0.14, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Star spots for Amanita
    if (data.features.stars) {
      ctx.fillStyle = '#FFFFFF';
      const stars = [
        [0, -r * 0.55], [-r * 0.45, -r * 0.35], [r * 0.45, -r * 0.35],
        [-r * 0.65, 0.1], [r * 0.65, 0.1]
      ];
      for (const [sx, sy] of stars) {
        this.drawStar(ctx, sx, sy, r * 0.16, r * 0.08);
      }
    }

    // Moss whiskers for Bolete
    if (data.features.mossWhiskers) {
      ctx.fillStyle = data.features.whiskersColor;
      // Cute fluffy cheeks
      ctx.beginPath();
      ctx.arc(-r * 0.55, r * 0.35, r * 0.18, 0, Math.PI * 2);
      ctx.arc(r * 0.55, r * 0.35, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ethereal tier halos for Ghost Glow
    if (data.features.halo) {
      ctx.strokeStyle = data.features.glow;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Gossamer lace skirt for Celestial Veil
    if (data.features.laceSkirt) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let lx = -r * 0.7; lx <= r * 0.7; lx += r * 0.22) {
        ctx.moveTo(lx, r * 0.2);
        ctx.lineTo(lx * 1.2, r * 0.85);
      }
      ctx.stroke();

      // Tiara
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(-r * 0.3, -r * 0.8);
      ctx.lineTo(-r * 0.15, -r * 0.98);
      ctx.lineTo(0, -r * 0.85);
      ctx.lineTo(r * 0.15, -r * 0.98);
      ctx.lineTo(r * 0.3, -r * 0.8);
      ctx.closePath();
      ctx.fill();
    }

    // Eldermyce Antlers & Living Forest
    if (data.features.antlers) {
      // Golden wooden branch horns
      ctx.strokeStyle = '#D4A373';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      // Left branch
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, -r * 0.7);
      ctx.quadraticCurveTo(-r * 0.8, -r * 1.1, -r * 0.75, -r * 1.35);
      ctx.moveTo(-r * 0.65, -r * 0.95);
      ctx.lineTo(-r * 0.95, -r * 1.05);
      ctx.stroke();

      // Right branch
      ctx.beginPath();
      ctx.moveTo(r * 0.5, -r * 0.7);
      ctx.quadraticCurveTo(r * 0.8, -r * 1.1, r * 0.75, -r * 1.35);
      ctx.moveTo(r * 0.65, -r * 0.95);
      ctx.lineTo(r * 0.95, -r * 1.05);
      ctx.stroke();

      // Constellation stars on cap
      ctx.fillStyle = '#FFD700';
      const consts = [
        [-r * 0.35, -r * 0.45], [0, -r * 0.55], [r * 0.35, -r * 0.45],
        [-r * 0.2, -r * 0.2], [r * 0.2, -r * 0.2]
      ];
      for (const [cx, cy] of consts) {
        this.drawStar(ctx, cx, cy, 5, 2.5);
      }
    }
  }

  drawStar(ctx, cx, cy, outerRadius, innerRadius) {
    ctx.beginPath();
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / 4;
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    ctx.closePath();
    ctx.fill();
  }

  drawMushroomFace(ctx, m, data, r, isWorried) {
    const eyeSpacing = r * 0.32;
    const eyeY = r * 0.05;
    const eyeRadius = Math.max(2.5, r * 0.11 * (data.features.eyeScale || 1.0));

    // Blushing rosy cheeks
    if (data.features.blush) {
      ctx.fillStyle = data.features.blush;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.ellipse(-eyeSpacing - r * 0.12, eyeY + eyeRadius * 0.9, eyeRadius * 1.2, eyeRadius * 0.7, 0, 0, Math.PI * 2);
      ctx.ellipse(eyeSpacing + r * 0.12, eyeY + eyeRadius * 0.9, eyeRadius * 1.2, eyeRadius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Eyes
    if (m.isBlinking) {
      // Closed happy blink arcs
      ctx.strokeStyle = '#231815';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, eyeRadius * 0.9, 0.2, Math.PI - 0.2);
      ctx.arc(eyeSpacing, eyeY, eyeRadius * 0.9, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else if (isWorried) {
      // Worried wide eyes with little sweat bead
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, eyeRadius * 1.2, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, eyeRadius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY - 1, eyeRadius * 0.6, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY - 1, eyeRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Sweat drop
      ctx.fillStyle = '#5CF2E3';
      ctx.beginPath();
      ctx.arc(eyeSpacing + eyeRadius * 1.6, eyeY - eyeRadius * 1.2, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal living eyes with glossy highlights
      ctx.fillStyle = '#1D1310';
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Catchlight reflections
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-eyeSpacing - eyeRadius * 0.3, eyeY - eyeRadius * 0.3, eyeRadius * 0.35, 0, Math.PI * 2);
      ctx.arc(eyeSpacing - eyeRadius * 0.3, eyeY - eyeRadius * 0.3, eyeRadius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouth
    ctx.strokeStyle = '#231815';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    if (isWorried) {
      // Wavy nervous mouth
      ctx.beginPath();
      ctx.moveTo(-eyeRadius * 0.8, eyeY + eyeRadius * 1.8);
      ctx.quadraticCurveTo(0, eyeY + eyeRadius * 1.2, eyeRadius * 0.8, eyeY + eyeRadius * 1.8);
      ctx.stroke();
    } else {
      // Cute happy smile
      ctx.beginPath();
      ctx.arc(0, eyeY + eyeRadius * 0.9, eyeRadius * 0.75, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }
  }

  renderParticles(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      if (p.type === 'bubble') {
        // Translucent iridescent rising water bubble
        ctx.save();
        ctx.translate(p.x, p.y);

        const r = Math.max(1, p.size);
        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.05, 0, 0, r);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        grad.addColorStop(0.3, 'rgba(186, 230, 253, 0.5)');
        grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.55)');
        grad.addColorStop(1, 'rgba(2, 132, 199, 0.8)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Shiny rim
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = Math.max(1, r * 0.12);
        ctx.stroke();

        // Specular glint arc
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.ellipse(-r * 0.4, -r * 0.4, r * 0.3, r * 0.14, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (p.type === 'shockwave') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.lineWidth || 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.radius), 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'cotton') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(p.x - p.size * 0.25, p.y - p.size * 0.25, p.size * 0.55, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'sparkle_star') {
        ctx.fillStyle = p.color;
        this.drawStar(ctx, p.x, p.y, p.size, p.size * 0.45);
      } else if (p.type === 'spore') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'star') {
        ctx.fillStyle = p.color;
        this.drawStar(ctx, p.x, p.y, p.size, p.size * 0.5);
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  renderFloatingScores(ctx) {
    ctx.save();
    for (const fs of this.floatingScores) {
      ctx.globalAlpha = fs.alpha;
      ctx.fillStyle = fs.color;
      ctx.font = `bold ${Math.round(18 * fs.scale)}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 6;
      ctx.fillText(fs.text, fs.x, fs.y);
    }
    ctx.restore();
  }
}
