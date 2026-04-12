let system;

// モーフィングパラメータ（localStorage保存）
const morphParams = {
  strokeColor: localStorage.getItem('morphStrokeColor') || '#787878',
  textColor: localStorage.getItem('morphTextColor') || '#ffffff',
};

function setup() {
  let c = createCanvas(210 * 3, 297 * 3);
  c.id('main-canvas');
  background(0);

  system = new DesignSystem();
  c.drop((file) => system.handleFileDrop(file, mouseX, mouseY));

  // ストロークカラーピッカーUI
  const pane = new Tweakpane.Pane({ title: 'Morph Settings' });
  pane.addInput(morphParams, 'strokeColor', { label: 'Stroke' }).on('change', (ev) => {
    localStorage.setItem('morphStrokeColor', ev.value);
  });
  pane.addInput(morphParams, 'textColor', { label: 'Text Color' }).on('change', (ev) => {
    localStorage.setItem('morphTextColor', ev.value);
  });
}

function draw() {
  // --- 1. Outside: 全体の環境 ---
  //background(220);

  // --- 2. System: 基本レンダリング ---
  system.render();

  // --- 3. Inside: 各ロゴのモーフィングアニメーション ---
  morphInside('logo1', ['a', 'a', 'd', 'b', 'b', 'a'], 0.2);
  morphInside('logo2', ['b', 'b', 'o', 'u', 'e', 'p'], 0.1);
  morphInside('logo3', ['c', 'c', 'g', 'g', 'e', 'e'], 0);

  // --- 4. Outside: logo4 → logo5 へ移動アニメーション ---
  moveLerp('logo4', 'logo5');

  // --- 5. テキストツールの色を強制上書き ---
  for (const el of system.elements) {
    if (el instanceof TextElement && !el.tag.startsWith('logo')) {
      el.color = morphParams.textColor;
    }
  }
}

// タグごとのモーフィングアニメーション
function morphInside(tag, letters, delay) {
  system.drawInside(tag, (ctx) => {
    // A. データの初期化（変更検知付き）
    if (!ctx.state.init || ctx.elementChanged()) {
      const fs = ctx.fontSize || 80;
      const font = ctx.element.font || 'sans-serif';
      const step = 1;
      const allPoints = letters.map(ch => sampleLetterPoints(ch, fs, font, step));

      const maxCount = Math.max(...allPoints.map(p => p.length));
      ctx.state.shapes = allPoints.map(pts => normalizePointCount(pts, maxCount));
      ctx.state.letterCount = letters.length;

      ctx.state.step = step;
      ctx.state.morphProgress = delay || 0;
      ctx.state.currentShape = 0;
      ctx.state.init = true;
      ctx.markAsProcessed();
    }

    // B. モーフィング進行（ホールド → トランジション）
    // 0〜holdEnd: 文字がそのまま表示（ホールド）
    // holdEnd〜1: 次の文字へモーフィング
    const holdEnd = 0.1; // ホールド比率（0.6 = 60%の時間は静止）
    ctx.state.morphProgress += 0.006;

    if (ctx.state.morphProgress >= 1) {
      ctx.state.morphProgress = 0;
      ctx.state.currentShape = (ctx.state.currentShape + 1) % ctx.state.letterCount;
    }

    // ホールド中は t=0（変形なし）、トランジション中は 0→1
    const rawT = ctx.state.morphProgress <= holdEnd
      ? 0
      : (ctx.state.morphProgress - holdEnd) / (1 - holdEnd);

    // C. 現在と次の形状を決定
    const currentPoints = ctx.state.shapes[ctx.state.currentShape];
    const nextPoints = ctx.state.shapes[(ctx.state.currentShape + 1) % ctx.state.letterCount];

    if (!currentPoints || !nextPoints || currentPoints.length === 0) return;

    // D. easeでなめらかに補間して描画
    const t = easeInOutCubic(rawT);

    push();
    strokeWeight(0.2);
    stroke(morphParams.strokeColor);
    const col = ctx.element._getRGBFromHex(ctx.element.color);
    fill(col[0], col[1], col[2]);

    for (let i = 0; i < currentPoints.length; i++) {
      const p1 = currentPoints[i];
      const p2 = nextPoints[i];
      const x = lerp(p1.x, p2.x, t);
      const y = lerp(p1.y, p2.y, t);
      ellipse(x, y, ctx.state.step * 30, ctx.state.step * 1);
    }
    pop();
  });
}

// logo4 → logo5 へのlerp移動アニメーション
let _moveState = null;

function moveLerp(fromTag, toTag) {
  const fromEls = system.getGroup(fromTag);
  const toEls = system.getGroup(toTag);
  if (fromEls.length === 0 || toEls.length === 0) return;

  // logo5 を非表示（drawInsideで何も描画しない）
  system.drawInside(toTag, (ctx) => {
    // 何も描画しない → Show Originalをオフにすれば非表示
  });

  // 初期化
  if (!_moveState) {
    _moveState = {
      startPositions: fromEls.map(el => ({ x: el.x, y: el.y })),
      progress: 0,
      waitFrames: 180, // 静止フレーム数（120 ≈ 2秒 @60fps）
    };
  }

  // 待機中はスキップ
  if (_moveState.waitFrames > 0) {
    _moveState.waitFrames--;
    return;
  }

  // 進行
  _moveState.progress += 0.01;
  if (_moveState.progress > 1) _moveState.progress = 1;

  const t = easeInOutCubic(_moveState.progress);

  // 各要素をlerpで移動
  for (let i = 0; i < fromEls.length; i++) {
    const target = toEls[i % toEls.length];
    const start = _moveState.startPositions[i];
    fromEls[i].x = lerp(start.x, target.x, t);
    fromEls[i].y = lerp(start.y, target.y, t);
  }
}

// --- ヘルパー関数群 ---

// Canvas APIで文字の点群をサンプリング（中心原点）
function sampleLetterPoints(letter, fontSize, font, step) {
  const padding = fontSize;
  const w = Math.ceil(fontSize * 2 + padding);
  const h = Math.ceil(fontSize * 2 + padding);
  const cvs = document.createElement('canvas');
  cvs.width = w;
  cvs.height = h;
  const c = cvs.getContext('2d');

  c.fillStyle = 'black';
  c.fillRect(0, 0, w, h);
  c.fillStyle = 'white';
  c.font = `${fontSize}px "${font}"`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(letter, w / 2, h / 2);

  const imageData = c.getImageData(0, 0, w, h);
  const pixels = imageData.data;
  const points = [];
  const cx = w / 2;
  const cy = h / 2;

  for (let py = 0; py < h; py += step) {
    for (let px = 0; px < w; px += step) {
      const idx = (py * w + px) * 4;
      if (pixels[idx] > 128) {
        points.push({ x: px - cx, y: py - cy });
      }
    }
  }
  return points;
}

// 点数を targetCount に揃える（足りなければ複製、多ければ間引き）
function normalizePointCount(points, targetCount) {
  if (points.length === 0) return Array.from({ length: targetCount }, () => ({ x: 0, y: 0 }));
  if (points.length === targetCount) return points;

  const result = [];
  for (let i = 0; i < targetCount; i++) {
    const srcIdx = (i / targetCount) * points.length;
    result.push(points[Math.floor(srcIdx) % points.length]);
  }
  return result;
}

// イージング関数
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
