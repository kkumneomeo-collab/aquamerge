/**
 * Custom 2D Circle Physics Engine for Mushroom Merge Terrarium
 * Tuned for solid downward gravity, zero edge sliding, instant settling,
 * and stable resting state (stays completely still until struck).
/**
 * Calculates the exact collision radius of a sea creature in direction `angle`.
 * Uses the precomputed 36-sample boundary profile so creatures fit their actual
 * shape on every side without unnatural empty gaps.
 */
export function getCreatureRadiusAtAngle(m, angle) {
  const profile = m.tierData && m.tierData.features && m.tierData.features.radialProfile;
  if (!profile || profile.length === 0) return m.radius;
  // Account for m.angle if tilted
  const relAngle = angle - (m.angle || 0);
  const TWO_PI = Math.PI * 2;
  const normAngle = ((relAngle % TWO_PI) + TWO_PI) % TWO_PI;
  const samplePos = (normAngle / TWO_PI) * profile.length;
  const idx0 = Math.floor(samplePos) % profile.length;
  const idx1 = (idx0 + 1) % profile.length;
  const frac = samplePos - Math.floor(samplePos);
  const ratio = profile[idx0] * (1 - frac) + profile[idx1] * frac;
  return m.radius * ratio;
}

export class PhysicsWorld {
  constructor(bounds) {
    this.bounds = bounds; // { left, right, top, bottom }
    this.gravity = 0.72; // Solid, crisp downward gravity
    this.airResistance = 0.995;
    this.friction = 0.55; // Natural rolling over mushroom caps
    this.restitution = 0.04; // Very low bounce - no bouncy ball effect
    this.substeps = 10; // High precision for rock-solid stability
    this.mushrooms = [];
    this.nextId = 1;
  }

  setBounds(bounds) {
    this.bounds = bounds;
  }

  addMushroom(x, y, tierData, isDrop = false) {
    const isBomb = !!(tierData.isBomb || tierData.tier === 99 || tierData.id === 'plush_bomb');
    const mushroom = {
      id: this.nextId++,
      x,
      y,
      vx: 0,
      vy: isDrop ? 1.2 : 0, // Solid downward start on drop, zero initial velocity on merge
      radius: tierData.radius,
      tier: tierData.tier,
      tierData,
      mass: Math.PI * tierData.radius * tierData.radius * (isBomb ? 1.5 : 1.0),
      angle: 0,
      angularVelocity: isBomb ? (Math.random() - 0.5) * 0.05 : 0,
      scale: isDrop ? 1.0 : 0.3,
      targetScale: 1.0,
      squishX: 1.0,
      squishY: 1.0,
      isMerging: false,
      isSleeping: false,
      sleepTimer: 0,
      settledTime: 0,
      createdAt: performance.now(),
      // Bomb properties (3 seconds fuse timer)
      isBomb,
      fuseTimer: isBomb ? 3.0 : 0,
      maxFuse: isBomb ? 3.0 : 0,
      blastRadius: isBomb ? 160 : 0,
      hasDetonated: false,
      fuseSoundTimer: 0.1,
      // Living animation state
      blinkTimer: Math.random() * 3 + 2,
      isBlinking: false,
      lookX: 0,
      lookY: 0,
      wobble: 0,
    };

    this.mushrooms.push(mushroom);
    return mushroom;
  }

  addBomb(x, y, bombData) {
    return this.addMushroom(x, y, bombData, true);
  }

  removeMushroom(id) {
    const idx = this.mushrooms.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.mushrooms.splice(idx, 1);
    }
  }

  clear() {
    this.mushrooms = [];
  }

  /**
   * Wake up all mushrooms in the vicinity of (x, y)
   */
  wakeNearby(x, y, radius = 120) {
    for (const m of this.mushrooms) {
      if (m.isSleeping) {
        const dist = Math.hypot(m.x - x, m.y - y);
        if (dist < radius + m.radius) {
          m.isSleeping = false;
          m.sleepTimer = 0;
        }
      }
    }
  }

  /**
   * Wake up all mushrooms in the drop column
   */
  wakeColumn(x, width = 160) {
    for (const m of this.mushrooms) {
      if (m.isSleeping && Math.abs(m.x - x) < width * 0.5 + m.radius) {
        m.isSleeping = false;
        m.sleepTimer = 0;
      }
    }
  }

  update(dt, onBounce = null) {
    const merges = [];
    const subDt = dt / this.substeps;
    const subGravity = this.gravity * (subDt * 60);

    for (let step = 0; step < this.substeps; step++) {
      // 1. Integrate motion for active (non-sleeping) mushrooms
      for (let i = 0; i < this.mushrooms.length; i++) {
        const m = this.mushrooms[i];
        if (m.isMerging || m.isSleeping) continue;

        m.vy += subGravity;
        m.vx *= Math.pow(this.airResistance, 1 / this.substeps);
        m.vy *= Math.pow(this.airResistance, 1 / this.substeps);

        m.x += m.vx * subDt * 60;
        m.y += m.vy * subDt * 60;
        m.angle += m.angularVelocity * subDt * 60;
        // Natural aquatic upright buoyancy torque
        m.angularVelocity += -m.angle * 0.08;
        m.angularVelocity *= 0.82;
        if (Math.abs(m.angle) < 0.008 && Math.abs(m.angularVelocity) < 0.015) {
          m.angle = 0;
          m.angularVelocity = 0;
        }
      }

      // 2. Resolve Mushroom vs Straight Flat Walls & Floor
      for (let i = 0; i < this.mushrooms.length; i++) {
        const m = this.mushrooms[i];
        if (m.isMerging) continue;
        this.resolveWallCollision(m, onBounce, step === 0);
      }

      // 3. Resolve Mushroom vs Mushroom Collisions & Merges
      for (let i = 0; i < this.mushrooms.length; i++) {
        const a = this.mushrooms[i];
        if (a.isMerging) continue;

        for (let j = i + 1; j < this.mushrooms.length; j++) {
          const b = this.mushrooms[j];
          if (b.isMerging) continue;

          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let distSq = dx * dx + dy * dy;

          // Fast broadphase bounding check
          const maxRadiusSum = (a.radius + b.radius) * 1.15;
          if (distSq >= maxRadiusSum * maxRadiusSum) {
            continue;
          }

          if (distSq < 0.00001) {
            dx = 0.001;
            dy = 0.001;
            distSq = dx * dx + dy * dy;
          }
          let dist = Math.sqrt(distSq);

          // Exact angle-dependent contour radii from each creature's radial profile
          const angleA = Math.atan2(dy, dx);
          const angleB = Math.atan2(-dy, -dx);
          const ra = getCreatureRadiusAtAngle(a, angleA);
          const rb = getCreatureRadiusAtAngle(b, angleB);
          const minDist = ra + rb;

          // If both sleeping and not in contact, skip
          if (a.isSleeping && b.isSleeping && dist >= minDist) {
            continue;
          }

          if (dist < minDist) {
            let nx = dx / dist;
            let ny = dy / dist;

            // Calculate relative speed
            const relSpeed = Math.hypot(a.vx - b.vx, a.vy - b.vy);

            // Natural unstable equilibrium deflection:
            // Two curved bodies cannot balance on a single mathematical 0px apex.
            // If stacked vertically (|dx| < 2.0 and |dy| > 0.3 * minDist),
            // roll down predictably away from walls without random jitter.
            if (Math.abs(dx) < 2.0 && Math.abs(dy) > 0.3 * minDist && relSpeed > 0.12) {
              const { left, right } = this.bounds;
              let nudgeDir = 0;
              // If near the left wall, always nudge right (away from wall)
              if (a.x - ra < left + 15 || b.x - rb < left + 15) {
                nudgeDir = 1.2;
              } else if (a.x + ra > right - 15 || b.x + rb > right - 15) {
                // If near the right wall, always nudge left (away from wall)
                nudgeDir = -1.2;
              } else {
                // In open water, use deterministic ID hash so it never flips back and forth
                nudgeDir = ((a.id + b.id) % 2 === 0 ? 1.0 : -1.0);
              }
              dx += nudgeDir;
              distSq = dx * dx + dy * dy;
              dist = Math.sqrt(distSq);
              nx = dx / dist;
              ny = dy / dist;
            }

            // Matching tier merge condition
            if (a.tier === b.tier && a.tier < 11 && !a.isMerging && !b.isMerging) {
              a.isMerging = true;
              b.isMerging = true;
              merges.push({
                tier: a.tier,
                nextTier: a.tier + 1,
                x: (a.x + b.x) * 0.5,
                y: (a.y + b.y) * 0.5,
                m1: a,
                m2: b
              });
              continue;
            }

            // Overlapping bodies CANNOT stay asleep! Wake them so they push apart
            if (a.isSleeping) { a.isSleeping = false; a.sleepTimer = 0; }
            if (b.isSleeping) { b.isSleeping = false; b.sleepTimer = 0; }

            // Clean position separation - NO clamp so overlap is 100% eliminated!
            const overlap = minDist - dist;
            if (overlap > 0) {
              const sep = overlap * 0.85;
              // Clamp mass ratio so small bodies don't blast large heavy creatures
              const clampedMassA = Math.max(a.mass, b.mass * 0.2);
              const clampedMassB = Math.max(b.mass, a.mass * 0.2);
              const totalMass = clampedMassA + clampedMassB;
              const aShare = clampedMassB / totalMass;
              const bShare = clampedMassA / totalMass;

              a.x -= nx * sep * aShare;
              a.y -= ny * sep * aShare;
              b.x += nx * sep * bShare;
              b.y += ny * sep * bShare;
            }

            // Gravitational slope rolling off rounded caps:
            // Only smaller or similar-sized creatures roll off (never a giant otter off a tiny nudibranch!)
            if (!b.isSleeping && dy < -0.2 * minDist && b.radius <= a.radius * 1.25) {
              const slopeRoll = (dx / dist) * subGravity * 0.35;
              const bLeftR = getCreatureRadiusAtAngle(b, Math.PI);
              const bRightR = getCreatureRadiusAtAngle(b, 0);
              if (!(slopeRoll < 0 && b.x - bLeftR <= this.bounds.left + 2) &&
                  !(slopeRoll > 0 && b.x + bRightR >= this.bounds.right - 2)) {
                b.vx += slopeRoll;
              }
            } else if (!a.isSleeping && dy > 0.2 * minDist && a.radius <= b.radius * 1.25) {
              const slopeRoll = (-dx / dist) * subGravity * 0.35;
              const aLeftR = getCreatureRadiusAtAngle(a, Math.PI);
              const aRightR = getCreatureRadiusAtAngle(a, 0);
              if (!(slopeRoll < 0 && a.x - aLeftR <= this.bounds.left + 2) &&
                  !(slopeRoll > 0 && a.x + aRightR >= this.bounds.right - 2)) {
                a.vx += slopeRoll;
              }
            }

            // Velocity impulse
            const rvx = b.vx - a.vx;
            const rvy = b.vy - a.vy;
            const velAlongNormal = rvx * nx + rvy * ny;

            if (velAlongNormal < -0.25) {
              // Only apply restitution impulse if closing velocity is significant
              const impulse = -(1 + this.restitution) * velAlongNormal / (1 / a.mass + 1 / b.mass);
              const ix = impulse * nx;
              const iy = impulse * ny;

              a.vx -= ix / a.mass;
              a.vy -= iy / a.mass;
              b.vx += ix / b.mass;
              b.vy += iy / b.mass;

              // Moderate friction
              const tx = -ny;
              const ty = nx;
              const velAlongTangent = rvx * tx + rvy * ty;
              const frictionImpulse = -velAlongTangent * this.friction * 0.4;
              a.vx -= (frictionImpulse * tx) / a.mass;
              a.vy -= (frictionImpulse * ty) / a.mass;
              b.vx += (frictionImpulse * tx) / b.mass;
              b.vy += (frictionImpulse * ty) / b.mass;

              a.angularVelocity *= 0.8;
              b.angularVelocity *= 0.8;

              // Play soft thud sound on significant impact
              const impactSpeed = Math.abs(velAlongNormal);
              if (onBounce && step === 0 && impactSpeed > 2.5) {
                onBounce((a.radius + b.radius) * 0.5, impactSpeed);
              }
            } else if (velAlongNormal < 0) {
              // Micro-contacts: damp velocities directly without bouncy impulses to eliminate jitter
              a.vx *= 0.92;
              a.vy *= 0.92;
              b.vx *= 0.92;
              b.vy *= 0.92;
              a.angularVelocity *= 0.8;
              b.angularVelocity *= 0.8;
            }
          }
        }
      }

      // Post-substep wall clamp: ensure no creature penetrates walls or floor
      for (let i = 0; i < this.mushrooms.length; i++) {
        const m = this.mushrooms[i];
        if (m.isMerging) continue;
        this.resolveWallCollision(m, null, false);
      }
    }

    // 4. Update scale, sleeping state, and stability
    // 4. Bomb fuse countdown & detonation processing (3 seconds after drop)
    const detonations = [];
    for (let i = 0; i < this.mushrooms.length; i++) {
      const m = this.mushrooms[i];
      if (!m.isBomb) continue;

      m.fuseTimer -= dt;
      m.isSleeping = false;
      m.sleepTimer = 0;

      // Sizzling / ticking fuse audio trigger
      m.fuseSoundTimer = (m.fuseSoundTimer || 0) - dt;
      if (m.fuseSoundTimer <= 0 && m.fuseTimer > 0) {
        // Ticks faster as fuse burns down
        const tickRate = Math.max(0.08, m.fuseTimer * 0.12);
        m.fuseSoundTimer = tickRate;
        if (onBounce && typeof onBounce === 'function') {
          // Send fuse tick event
          onBounce('fuse_tick', 3.0 - m.fuseTimer);
        }
      }

      // Visual pulse as fuse burns down (vibrates faster towards 0s)
      if (m.fuseTimer > 0) {
        const elapsed = 3.0 - m.fuseTimer;
        const freq = 6 + elapsed * 8;
        m.scale = 1.0 + 0.07 * Math.sin(elapsed * freq);
      }

      // Detonation at 3 seconds!
      if (m.fuseTimer <= 0 && !m.hasDetonated) {
        m.hasDetonated = true;
        m.isMerging = true;

        const blastedBodies = [];
        for (const other of this.mushrooms) {
          if (other.id === m.id || other.isMerging) continue;
          const dist = Math.hypot(other.x - m.x, other.y - m.y);
          // Destroy all plushies within blast radius around the bomb!
          if (dist <= m.blastRadius + other.radius * 0.4) {
            other.isMerging = true;
            blastedBodies.push(other);
          } else if (dist <= m.blastRadius + 140) {
            // Outward shockwave physical push for nearby survivors
            const angle = Math.atan2(other.y - m.y, other.x - m.x);
            const force = (1.0 - (dist - m.blastRadius) / 140) * 12.0;
            other.vx += Math.cos(angle) * force;
            other.vy += Math.sin(angle) * force - 3.8;
            other.isSleeping = false;
            other.sleepTimer = 0;
          }
        }

        detonations.push({
          bomb: m,
          x: m.x,
          y: m.y,
          blastRadius: m.blastRadius,
          blastedBodies
        });
      }
    }

    // Remove detonated bombs
    for (let i = this.mushrooms.length - 1; i >= 0; i--) {
      if (this.mushrooms[i].isBomb && this.mushrooms[i].hasDetonated) {
        this.mushrooms.splice(i, 1);
      }
    }

    // 5. Update scale, sleeping state, and stability
    for (let i = 0; i < this.mushrooms.length; i++) {
      const m = this.mushrooms[i];
      if (m.isBomb) continue; // Bombs never sleep while fuse burns

      // Spawn scale animation on merge
      if (m.scale < m.targetScale) {
        m.scale += (m.targetScale - m.scale) * 0.25;
        if (Math.abs(m.scale - m.targetScale) < 0.01) {
          m.scale = m.targetScale;
        }
      }

      // Fast decay of any residual squish
      m.squishX += (1.0 - m.squishX) * 0.35;
      m.squishY += (1.0 - m.squishY) * 0.35;

      const rDown = getCreatureRadiusAtAngle(m, Math.PI * 0.5);
      const rLeft = getCreatureRadiusAtAngle(m, Math.PI);
      const rRight = getCreatureRadiusAtAngle(m, 0);

      const speed = Math.hypot(m.vx, m.vy);
      const isOnFloor = (m.y + rDown) >= (this.bounds.bottom - 2.0);

      // Resting / Sleep detection:
      // Floor items sleep in 0.35s. Stacked/crowded items require 0.50s of stable settling.
      if (speed < 0.35 && Math.abs(m.angularVelocity) < 0.08) {
        m.sleepTimer += dt;
        m.settledTime += dt;
        const requiredSleepTime = isOnFloor ? 0.35 : 0.50;
        if (m.sleepTimer > requiredSleepTime) {
          m.isSleeping = true;
          m.vx = 0;
          m.vy = 0;
          m.angularVelocity = 0;
          m.angle = 0; // Lock perfectly upright!
          // Clamp solidly to container bounds using exact directional radii
          if (m.x - rLeft < this.bounds.left) m.x = this.bounds.left + rLeft;
          if (m.x + rRight > this.bounds.right) m.x = this.bounds.right - rRight;
          if (m.y + rDown > this.bounds.bottom) m.y = this.bounds.bottom - rDown;
        }
      } else {
        m.sleepTimer = 0;
        m.isSleeping = false;
        m.settledTime = Math.max(0, m.settledTime - dt * 2);
      }

      // Blinking animation
      m.blinkTimer -= dt;
      if (m.blinkTimer <= 0) {
        if (!m.isBlinking) {
          m.isBlinking = true;
          m.blinkTimer = 0.12;
        } else {
          m.isBlinking = false;
          m.blinkTimer = Math.random() * 4 + 2.5;
        }
      }

      // No wobbling
      m.wobble = 0;
    }

    merges.detonations = detonations;
    return merges;
  }

  /**
   * Straight Vertical Walls & Flat Bottom Floor:
   * Edge drops fall straight down and stay exactly in place without drifting.
   */
  resolveWallCollision(m, onBounce, isFirstSubstep) {
    const { left, right, bottom } = this.bounds;
    const rDown = getCreatureRadiusAtAngle(m, Math.PI * 0.5);
    const rLeft = getCreatureRadiusAtAngle(m, Math.PI);
    const rRight = getCreatureRadiusAtAngle(m, 0);

    // Flat bottom floor - no floating gaps, sits directly on coral sand!
    if (m.y + rDown > bottom) {
      m.y = bottom - rDown;
      if (m.vy > 0) {
        if (isFirstSubstep && m.vy > 2.2 && onBounce) {
          onBounce(m.radius, m.vy);
        }
        // Zero bounce on floor - solid thud!
        m.vy = 0;
        m.vx *= 0.7; // high ground friction
        m.angularVelocity *= 0.7;
      }
    }

    // Straight left vertical wall - stops creature precisely at outer edge with zero poking
    if (m.x - rLeft < left) {
      m.x = left + rLeft;
      if (m.vx < 0) {
        m.vx = 0; // stop horizontal motion instantly against wall
      }
      m.angularVelocity *= 0.8;
    }

    // Straight right vertical wall - stops creature precisely at outer edge with zero poking
    if (m.x + rRight > right) {
      m.x = right - rRight;
      if (m.vx > 0) {
        m.vx = 0; // stop horizontal motion instantly against wall
      }
      m.angularVelocity *= 0.8;
    }
  }

  /**
   * Raycast downwards from dropX to find the first landing contact
   */
  getLandingPreviewY(dropX, radius, tierData = null) {
    const dummyHeld = { radius, tierData, angle: 0 };
    const heldBottomR = getCreatureRadiusAtAngle(dummyHeld, Math.PI * 0.5);
    let landingY = this.bounds.bottom - heldBottomR;

    for (let i = 0; i < this.mushrooms.length; i++) {
      const m = this.mushrooms[i];
      if (m.isMerging) continue;

      const dx = dropX - m.x;
      const maxCombinedR = radius * 1.15 + m.radius * 1.15;
      if (Math.abs(dx) >= maxCombinedR) continue;

      // Iteratively find contact dy using exact radial profiles
      let dy = -Math.sqrt(Math.max(0, maxCombinedR * maxCombinedR - dx * dx));
      for (let iter = 0; iter < 4; iter++) {
        const angleM = Math.atan2(dy, dx);
        const angleHeld = Math.atan2(-dy, -dx);
        const rm = getCreatureRadiusAtAngle(m, angleM);
        const rHeld = getCreatureRadiusAtAngle(dummyHeld, angleHeld);
        const combinedR = rm + rHeld;
        if (Math.abs(dx) >= combinedR) {
          dy = 0;
          break;
        }
        dy = -Math.sqrt(combinedR * combinedR - dx * dx);
      }

      if (dy < 0) {
        const contactY = m.y + dy;
        if (contactY < landingY) {
          landingY = contactY;
        }
      }
    }

    return landingY;
  }

  /**
   * Power-up: Shake the container to jiggle and settle pieces
   */
  shake(strength = 7) {
    for (const m of this.mushrooms) {
      if (m.isMerging) continue;
      m.isSleeping = false;
      m.sleepTimer = 0;
      m.vx += (Math.random() - 0.5) * strength;
      m.vy -= Math.random() * (strength * 0.7);
    }
  }

  /**
   * Power-up: Pop the smallest active pastry
   */
  popSmallest() {
    if (this.mushrooms.length === 0) return null;
    let smallest = null;
    for (const m of this.mushrooms) {
      if (m.isMerging) continue;
      if (!smallest || m.tier < smallest.tier) {
        smallest = m;
      }
    }
    if (smallest) {
      const idx = this.mushrooms.indexOf(smallest);
      if (idx !== -1) {
        this.mushrooms.splice(idx, 1);
        return smallest;
      }
    }
    return null;
  }
}
