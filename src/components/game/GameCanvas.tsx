"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CELESTIAL_BODIES,
  NPC_ARCHETYPES,
  WAVE_THEMES,
  type CelestialBody,
  type NpcArchetype,
} from "./data";

const CANVAS_W = 960;
const CANVAS_H = 640;

type Difficulty = "easy" | "medium" | "hard" | "ultra";

const DIFFICULTY: Record<Difficulty, {
  label: string;
  color: string;
  spawnDivisor: number; // higher = slower enemy spawns
  speedMult: number;
  hpMult: number;
  dmgMult: number;
  fireRateMult: number; // higher = slower enemy shooting
  playerHp: number;
  scoreMult: number;
}> = {
  easy: { label: "Easy", color: "#34d399", spawnDivisor: 1.7, speedMult: 0.7, hpMult: 0.55, dmgMult: 0.6, fireRateMult: 1.6, playerHp: 160, scoreMult: 0.7 },
  medium: { label: "Medium", color: "#fbbf24", spawnDivisor: 1.0, speedMult: 1.0, hpMult: 1.0, dmgMult: 1.0, fireRateMult: 1.0, playerHp: 100, scoreMult: 1.0 },
  hard: { label: "Hard", color: "#f87171", spawnDivisor: 0.75, speedMult: 1.3, hpMult: 1.4, dmgMult: 1.3, fireRateMult: 0.85, playerHp: 80, scoreMult: 1.6 },
  ultra: { label: "Ultra Hard", color: "#7c3aed", spawnDivisor: 0.5, speedMult: 1.7, hpMult: 2.1, dmgMult: 1.7, fireRateMult: 0.65, playerHp: 55, scoreMult: 2.5 },
};

type Vec = { x: number; y: number };

// ---------------------------------------------------------------------------
// Audio (Web Audio API, no external assets)
// ---------------------------------------------------------------------------
let audioCtx: AudioContext | null = null;

function ensureAudio() {
  if (audioCtx) return audioCtx;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
}

function playTone(
  type: OscillatorType,
  freq: number,
  duration: number,
  vol = 0.1,
  fade = true,
) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(vol, t);
  if (fade) {
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  }
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration);
}

function sfxShoot() {
  playTone("square", 880, 0.06, 0.08);
  playTone("square", 660, 0.06, 0.06);
}
function sfxHit() {
  playTone("square", 220, 0.12, 0.1);
}
function sfxExplode() {
  playTone("sawtooth", 110, 0.25, 0.15);
  playTone("sawtooth", 80, 0.35, 0.1);
}
function sfxPowerup() {
  playTone("sine", 880, 0.15, 0.1);
  playTone("sine", 1320, 0.15, 0.1);
}
function sfxWave() {
  playTone("square", 520, 0.12, 0.1);
  playTone("square", 780, 0.12, 0.1);
}

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;

  constructor(x: number, y: number, color: string, speed = 3) {
    const angle = Math.random() * Math.PI * 2;
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * (Math.random() * speed + 0.5);
    this.vy = Math.sin(angle) * (Math.random() * speed + 0.5);
    this.life = 1;
    this.maxLife = 30 + Math.random() * 30;
    this.color = color;
    this.size = Math.random() * 4 + 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 1 / this.maxLife;
    this.vx *= 0.92;
    this.vy *= 0.92;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  dead() {
    return this.life <= 0;
  }
}

class Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius = 3;
  damage: number;
  owner: "player" | "enemy";
  life = 60;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number,
    owner: "player" | "enemy",
  ) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.owner = owner;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.owner === "player" ? "#22d3ee" : "#f87171";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  dead() {
    return (
      this.life <= 0 ||
      this.x < 0 ||
      this.x > CANVAS_W ||
      this.y < 0 ||
      this.y > CANVAS_H
    );
  }
}

class Enemy {
  x: number;
  y: number;
  archetype: NpcArchetype;
  vx: number;
  vy: number;
  hp: number;
  shield: number;
  maxHp: number;
  radius: number;
  shootTimer = 0;
  angle = 0;

  constructor(x: number, y: number, archetype: NpcArchetype, target: Vec) {
    this.x = x;
    this.y = y;
    this.archetype = archetype;
    this.hp = archetype.hull;
    this.shield = archetype.shield;
    this.maxHp = archetype.hull;
    this.radius = archetype.size;

    const dx = target.x - x;
    const dy = target.y - y;
    const dist = Math.hypot(dx, dy) || 1;
    this.vx = (dx / dist) * archetype.speed;
    this.vy = (dy / dist) * archetype.speed;
    this.angle = Math.atan2(dy, dx);
  }

  update(player: Vec) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const steer = 0.05;
    this.vx += (dx / dist) * steer;
    this.vy += (dy / dist) * steer;
    const curSpeed = Math.hypot(this.vx, this.vy);
    const maxSpeed = this.archetype.speed * 2.2;
    if (curSpeed > maxSpeed) {
      const s = maxSpeed / curSpeed;
      this.vx *= s;
      this.vy *= s;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.angle = Math.atan2(dy, dx);
    if (this.shootTimer > 0) this.shootTimer--;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, angle, radius, archetype } = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = archetype.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = archetype.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(-radius * 0.6, -radius * 0.8);
    ctx.lineTo(-radius * 0.6, radius * 0.8);
    ctx.closePath();
    ctx.stroke();
    if (this.shield > 0) {
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  dead() {
    return this.hp <= 0 && this.shield <= 0;
  }
}

class Player {
  x: number;
  y: number;
  angle = 0;
  radius = 10;
  hp = 100;
  maxHp = 100;
  shield = 0;
  shootTimer = 0;
  invuln = 0;
  speed = 4.5;

  constructor() {
    this.x = CANVAS_W / 2;
    this.y = CANVAS_H / 2;
  }

  update(keys: Set<string>, target: Vec) {
    let dx = 0;
    let dy = 0;
    if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) dy -= 1;
    if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) dy += 1;
    if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) dx -= 1;
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) dx += 1;
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      this.x += (dx / len) * this.speed;
      this.y += (dy / len) * this.speed;
    }
    this.x = Math.max(this.radius, Math.min(CANVAS_W - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(CANVAS_H - this.radius, this.y));

    this.angle = Math.atan2(target.y - this.y, target.x - this.x);

    if (this.shootTimer > 0) this.shootTimer--;
    if (this.invuln > 0) this.invuln--;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.shadowColor = "#22d3ee";
    ctx.shadowBlur = this.invuln > 0 ? 0 : 14;
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(this.radius, 0);
    ctx.lineTo(-this.radius * 0.7, -this.radius * 0.9);
    ctx.lineTo(-this.radius * 0.5, 0);
    ctx.lineTo(-this.radius * 0.7, this.radius * 0.9);
    ctx.closePath();
    ctx.stroke();
    if (this.shield > 0) {
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawHealthBar(ctx: CanvasRenderingContext2D) {
    const w = 120;
    const h = 8;
    const x = CANVAS_W / 2 - w / 2;
    const y = CANVAS_H - 26;
    ctx.fillStyle = "#12121a";
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(x, y, w, h);
    const pct = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = "#22d3ee";
    ctx.fillRect(x, y, w * pct, h);
    if (this.shield > 0) {
      ctx.fillStyle = "#60a5fa";
      ctx.fillRect(x, y, w * Math.min(1, this.shield / 60), h);
    }
  }
}

// ---------------------------------------------------------------------------
// Main Game Component
// ---------------------------------------------------------------------------
export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const mouseRef = useRef({ x: CANVAS_W / 2, y: CANVAS_H / 2 });
  const mouseDownRef = useRef(false);

  const [state, setState] = useState<"menu" | "playing" | "gameover">("menu");
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "ultra">("medium");

  // Refs mirror the display state so the fixed game loop always reads current
  // values without restarting (and resetting) on every frame.
  const scoreRef = useRef(0);
  const waveRef = useRef(1);
  const highScoreRef = useRef(0);
  const difficultyRef = useRef<"easy" | "medium" | "hard" | "ultra">("medium");
  scoreRef.current = score;
  waveRef.current = wave;
  highScoreRef.current = highScore;
  difficultyRef.current = difficulty;

  useEffect(() => {
    const stored = localStorage.getItem("spaceShooterHighScore");
    if (stored) setHighScore(parseInt(stored, 10) || 0);
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setWave(1);
    scoreRef.current = 0;
    waveRef.current = 1;
    setState("playing");
  }, []);

  const restart = useCallback(() => {
    startGame();
  }, [startGame]);

  const [theme, setTheme] = useState<CelestialBody | null>(null);
  const [waveArchetypes, setWaveArchetypes] = useState<NpcArchetype[]>([]);
  const themeRef = useRef<CelestialBody | null>(null);
  const archetypesRef = useRef<NpcArchetype[]>([]);
  themeRef.current = theme;
  archetypesRef.current = waveArchetypes;

  // Recompute wave theme when the wave number changes (display refs updated
  // above; the loop reads refs so it never restarts mid-wave).
  useEffect(() => {
    const themeDef =
      WAVE_THEMES.find((t) => t.wave === wave) ||
      WAVE_THEMES[WAVE_THEMES.length - 1];
    const body =
      CELESTIAL_BODIES.find((b) => b.id === themeDef.basedOn) || null;
    setTheme(body);
    const archs = themeDef.enemyIds
      .map((id) => NPC_ARCHETYPES.find((n) => n.id === id))
      .filter(Boolean) as NpcArchetype[];
    setWaveArchetypes(archs);
  }, [wave]);

  // --- Game loop -----------------------------------------------------------
  const startLoop = useCallback(() => {
    if (state !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const player = new Player();
    player.hp = DIFFICULTY[difficultyRef.current].playerHp;
    player.maxHp = player.hp;
    const bullets: Bullet[] = [];
    const enemies: Enemy[] = [];
    const particles: Particle[] = [];
    let enemySpawnTimer = 0;
    let frame = 0;
    let gameOver = false;

    let lastTime = performance.now();
    const targetFps = 60;
    const msPerFrame = 1000 / targetFps;
    let accumulator = 0;

    function spawnEnemy() {
      const archs = archetypesRef.current;
      if (archs.length === 0) return;
      const base = archs[Math.floor(Math.random() * archs.length)];
      const diff = DIFFICULTY[difficultyRef.current];
      const arch: NpcArchetype = {
        ...base,
        speed: base.speed * diff.speedMult,
        hull: Math.max(1, Math.round(base.hull * diff.hpMult)),
        shield: Math.round(base.shield * diff.hpMult),
        fireRate: Math.max(10, Math.round(base.fireRate * diff.fireRateMult)),
      };
      const side = Math.floor(Math.random() * 4);
      let x: number, y: number;
      if (side === 0) {
        x = Math.random() * CANVAS_W;
        y = -arch.size - 10;
      } else if (side === 1) {
        x = CANVAS_W + arch.size + 10;
        y = Math.random() * CANVAS_H;
      } else if (side === 2) {
        x = Math.random() * CANVAS_W;
        y = CANVAS_H + arch.size + 10;
      } else {
        x = -arch.size - 10;
        y = Math.random() * CANVAS_H;
      }
      enemies.push(new Enemy(x, y, arch, { x: player.x, y: player.y }));
    }

    function explode(x: number, y: number, color: string, count = 12, speed = 4) {
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color, speed));
      }
      sfxExplode();
    }

    function finishGame() {
      gameOver = true;
      setState("gameover");
      const final = scoreRef.current;
      if (final > highScoreRef.current) {
        localStorage.setItem("spaceShooterHighScore", String(final));
        setHighScore(final);
        highScoreRef.current = final;
      }
    }

    function step() {
      if (gameOver) {
        sfxExplode();
        finishGame();
        return;
      }

      frame++;
      const w = waveRef.current;
      const diff = DIFFICULTY[difficultyRef.current];
      const baseSpawn = Math.max(15, Math.round((120 - w * 10) * diff.spawnDivisor));
      enemySpawnTimer++;
      if (enemySpawnTimer > baseSpawn) {
        const count = 1 + Math.floor(w / 3);
        for (let i = 0; i < count; i++) spawnEnemy();
        enemySpawnTimer = 0;
      }

      // Player shooting (left click or SPACE)
      if (player.shootTimer <= 0 && (mouseDownRef.current || keysRef.current.has(" "))) {
        player.shootTimer = 14 - Math.min(w, 6);
        const vx = Math.cos(player.angle) * 9;
        const vy = Math.sin(player.angle) * 9;
        bullets.push(new Bullet(player.x, player.y, vx, vy, 12, "player"));
        sfxShoot();
      }

      player.update(keysRef.current, mouseRef.current);

      for (const b of bullets) b.update();
      for (const e of enemies) {
        e.update({ x: player.x, y: player.y });
        if (e.shootTimer <= 0) {
          e.shootTimer = e.archetype.fireRate - Math.min(w * 2, 20);
          const dx = player.x - e.x;
          const dy = player.y - e.y;
          const dist = Math.hypot(dx, dy) || 1;
          bullets.push(
            new Bullet(
              e.x,
              e.y,
              (dx / dist) * e.archetype.bulletSpeed,
              (dy / dist) * e.archetype.bulletSpeed,
              Math.round(e.archetype.bulletDamage * diff.dmgMult),
              "enemy",
            ),
          );
        }
      }

      // collisions: player bullets vs enemies
      for (let b = bullets.length - 1; b >= 0; b--) {
        const bullet = bullets[b];
        if (bullet.owner !== "player") continue;
        for (let e = enemies.length - 1; e >= 0; e--) {
          const enemy = enemies[e];
          const d = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
          if (d < bullet.radius + enemy.radius) {
            bullets.splice(b, 1);
            sfxHit();
            if (enemy.shield > 0) {
              enemy.shield -= bullet.damage;
            } else {
              enemy.hp -= bullet.damage;
            }
            if (enemy.dead()) {
              scoreRef.current += Math.round(enemy.archetype.scoreValue * diff.scoreMult);
              setScore(scoreRef.current);
              explode(enemy.x, enemy.y, enemy.archetype.color, 14, 5);
              enemies.splice(e, 1);
            }
            break;
          }
        }
      }

      // collisions: enemy bullets vs player
      for (let b = bullets.length - 1; b >= 0; b--) {
        const bullet = bullets[b];
        if (bullet.owner !== "enemy") continue;
        const d = Math.hypot(bullet.x - player.x, bullet.y - player.y);
        if (d < bullet.radius + player.radius) {
          bullets.splice(b, 1);
          if (player.invuln > 0) continue;
          if (player.shield > 0) {
            player.shield -= bullet.damage;
          } else {
            player.hp -= bullet.damage;
          }
          player.invuln = 40;
          sfxHit();
          if (player.hp <= 0) gameOver = true;
        }
      }

      // collisions: enemies vs player
      for (const e of enemies) {
        const d = Math.hypot(e.x - player.x, e.y - player.y);
        if (d < e.radius + player.radius && player.invuln <= 0) {
          if (player.shield > 0) {
            player.shield -= 10;
          } else {
            player.hp -= 10;
          }
          player.invuln = 60;
          sfxHit();
          explode(player.x, player.y, "#ef4444", 6, 3);
          if (player.hp <= 0) gameOver = true;
        }
      }

      // cleanup
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].dead()) particles.splice(i, 1);
      }
      for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].dead()) bullets.splice(i, 1);
      }

      // wave complete check
      if (
        enemies.length === 0 &&
        enemySpawnTimer > baseSpawn + 30 &&
        !gameOver
      ) {
        setWave((wv) => wv + 1);
        enemySpawnTimer = 0;
        sfxWave();
      }
    }

    function drawStarfield() {
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      const tint = themeRef.current?.themeColor || "#6366f1";
      ctx.fillStyle = tint;
      ctx.globalAlpha = 0.12;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.globalAlpha = 1;
      const seed = frame * 0.01;
      ctx.fillStyle = "#e7e7ef";
      for (let i = 0; i < 120; i++) {
        const r = Math.abs((Math.sin(i * 123.45 + seed) * 10000) % 1);
        const g = Math.abs((Math.cos(i * 97.13 + seed) * 10000) % 1);
        const x = ((i * 137.5 + frame * 0.15) % CANVAS_W) * (0.7 + r * 0.6);
        const y = ((i * 73.3 + frame * 0.08) % CANVAS_H) * (0.7 + g * 0.6);
        const alpha = Math.max(0, Math.min(1, 0.4 + r * 0.6));
        const radius = Math.max(0.5, 1 + Math.abs(g) * 1.2);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (themeRef.current) {
        const grad = ctx.createRadialGradient(
          CANVAS_W / 2,
          CANVAS_H / 2,
          100,
          CANVAS_W / 2,
          CANVAS_H / 2,
          420,
        );
        grad.addColorStop(0, tint + "1a");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      }
    }

    function draw() {
      drawStarfield();

      // HUD
      ctx.fillStyle = "#e7e7ef";
      ctx.font = "16px 'Geist Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`WAVE ${waveRef.current}`, 20, 30);
      ctx.fillText(`SCORE ${scoreRef.current}`, 20, 52);
      ctx.fillText(`HI ${highScoreRef.current}`, CANVAS_W - 100, 30);
      const diff = DIFFICULTY[difficultyRef.current];
      ctx.fillStyle = diff.color;
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(`MODE: ${diff.label}`, CANVAS_W - 150, 30);
      ctx.textAlign = "right";
      ctx.fillText(`ARCHIVE: /game#archive`, CANVAS_W - 20, 52);
      ctx.textAlign = "left";
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px sans-serif";
      ctx.fillText(
        "WASD/Arrows move • Mouse aims • LEFT CLICK or SPACE to shoot",
        20,
        CANVAS_H - 12,
      );

      // wave theme banner
      const t = themeRef.current;
      if (t) {
        ctx.fillStyle = "#12121a";
        ctx.globalAlpha = 0.75;
        ctx.fillRect(20, 78, 340, 46);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = t.themeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 78, 340, 46);
        ctx.fillStyle = t.themeColor;
        ctx.font = "bold 15px sans-serif";
        ctx.fillText(t.name, 28, 102);
        ctx.fillStyle = "#e7e7ef";
        ctx.font = "12px sans-serif";
        ctx.fillText(
          `Based on ${t.designation} (${t.distanceLy.toFixed(1)} ly away)`,
          28,
          118,
        );
      }

      for (const p of particles) p.draw(ctx);
      for (const b of bullets) b.draw(ctx);
      for (const e of enemies) e.draw(ctx);
      player.draw(ctx);
      player.drawHealthBar(ctx);

      if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = "#f87171";
        ctx.font = "bold 40px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CRITICAL FAILURE", CANVAS_W / 2, CANVAS_H / 2 - 20);
        ctx.fillStyle = "#e7e7ef";
        ctx.font = "18px sans-serif";
        ctx.fillText(`Final Score: ${scoreRef.current}`, CANVAS_W / 2, CANVAS_H / 2 + 22);
        ctx.fillText("Press SPACE to restart", CANVAS_W / 2, CANVAS_H / 2 + 56);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    function loop(now: number) {
      accumulator += now - lastTime;
      lastTime = now;
      while (accumulator >= msPerFrame) {
        step();
        accumulator -= msPerFrame;
      }
      draw();
    }

    drawStarfield();
    rafRef.current = requestAnimationFrame(loop);
  }, [state]);

  // Input listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key);
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    const onMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) mouseDownRef.current = true;
    };
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 0) mouseDownRef.current = false;
    };
    const onCanvasClick = () => {
      ensureAudio();
      if (state === "menu") startGame();
      else if (state === "gameover") restart();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    canvasRef.current?.addEventListener("click", onCanvasClick);
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        ensureAudio();
        if (state === "menu") startGame();
        else if (state === "gameover") restart();
      }
    });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      canvasRef.current?.removeEventListener("click", onCanvasClick);
    };
  }, [state, startGame, restart]);

  // Start loop when entering playing
  useEffect(() => {
    if (state === "playing") {
      ensureAudio();
      startLoop();
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state, startLoop]);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div
      className="relative w-full max-w-[960px] aspect-game rounded-2xl border border-border bg-black shadow-2xl overflow-hidden mx-auto"
      style={{ aspectRatio: "960 / 640" }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="block w-full h-full"
        aria-label="Space shooter game canvas"
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        {state === "menu" && (
          <div className="pointer-events-auto flex flex-col items-center gap-3 text-center">
            <h1 className="text-4xl font-mono font-bold tracking-wider text-[#22d3ee] drop-shadow-[0_0_12px_rgba(34,211,234,0.6)]">
              STELLAR INTERCEPTOR
            </h1>
            <p className="text-[#94a3b8] text-sm max-w-xs mx-auto">
              Defend the frontier. Enemy ships and levels designed from real
              NASA/JPL celestial data.
            </p>
            <div className="flex gap-2">
              {(["easy", "medium", "hard", "ultra"] as const).map((d) => {
                const cfg = DIFFICULTY[d];
                return (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition border ${
                      difficulty === d
                        ? `bg-[#050508] text-white border-${cfg.color === "#34d399" ? "green" : cfg.color === "#fbbf24" ? "yellow" : cfg.color === "#f87171" ? "red" : "purple"}-500`
                        : "bg-surface-2 border-border text-muted hover:bg-surface"
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 mt-4 bg-[#22d3ee] text-[#050508] font-bold rounded-xl shadow-[0_0_20px_rgba(34,211,234,0.5)] hover:shadow-[0_0_30px_rgba(34,211,234,0.8)] transition"
            >
              INITIATE SEQUENCE
            </button>
          </div>
        )}
        {state === "gameover" && (
          <div className="pointer-events-auto flex flex-col items-center gap-3 text-center">
            <h2 className="text-3xl font-mono font-bold text-[#f87171] drop-shadow-[0_0_12px_rgba(248,113,113,0.6)]">
              CRITICAL FAILURE
            </h2>
            <p className="text-[#94a3b8] text-sm">Final Score: {score}</p>
            <p className="text-xs text-[#6b7280]">Mode: {DIFFICULTY[difficultyRef.current].label}</p>
            <button
              onClick={restart}
              className="px-8 py-3 bg-[#f87171] text-[#050508] font-bold rounded-xl shadow-[0_0_20px_rgba(248,113,113,0.5)] hover:shadow-[0_0_30px_rgba(248,113,113,0.8)] transition"
            >
              REBOOT
            </button>
          </div>
        )}
      </div>

      {isMobile && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
          <div className="pointer-events-auto w-16 h-16 rounded-full border border-border bg-white/10 flex items-center justify-center text-xs text-[#94a3b8]">
            THRUST
          </div>
          <div className="pointer-events-auto w-16 h-16 rounded-full border border-border bg-white/10 flex items-center justify-center text-xs text-[#94a3b8]">
            FIRE
          </div>
        </div>
      )}
    </div>
  );
}
