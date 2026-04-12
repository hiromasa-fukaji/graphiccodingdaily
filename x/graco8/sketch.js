let system;
const PARAMS = {
  textStrokeColor: localStorage.getItem('textStrokeColor') || '#000000',
  copyStrokeColor: localStorage.getItem('copyStrokeColor') || '#000000',
};

function setup() {
  let c = createCanvas(210 * 3, 297 * 3);
  c.id('main-canvas');
  background(0);
  system = new DesignSystem();
  c.drop((file) => system.handleFileDrop(file, mouseX, mouseY));

  // カラーピッカーUI（右下に配置して他のUIと被らないように）
  const paneContainer = document.createElement('div');
  paneContainer.style.cssText = 'position:fixed; bottom:10px; right:10px; z-index:1000;';
  document.body.appendChild(paneContainer);
  const pane = new Tweakpane.Pane({ container: paneContainer });
  pane.addInput(PARAMS, 'textStrokeColor', { label: 'Text Stroke' }).on('change', (ev) => {
    localStorage.setItem('textStrokeColor', ev.value);
  });
  pane.addInput(PARAMS, 'copyStrokeColor', { label: 'Copy Stroke' }).on('change', (ev) => {
    localStorage.setItem('copyStrokeColor', ev.value);
  });
}

function draw() {
  system.render();

  // --- 'logo' タグの要素にスリットスキャンエフェクト ---
  const targets = system.getGroup('logo');

  // デバッグ：フレームごとに1回だけログ出力
  if (frameCount % 60 === 0) {
    console.log(`[DEBUG] Frame ${frameCount}: Found ${targets.length} elements with tag 'logo'`);
    if (targets.length > 0) {
      console.log('[DEBUG] Element names:', targets.map(el => el.name || 'unnamed'));
    }
  }

  for (const el of targets) {
    if (frameCount % 60 === 0) {
      console.log(`[DEBUG] Calling _applySlit for element:`, el.name || 'unnamed');
    }
    _applySlit(el, 0);
  }

  // --- 'logo2' タグの要素：半拍遅れ ---
  const targets2 = system.getGroup('logo2');
  for (const el of targets2) {
    _applySlit(el, 1.0);  // 半拍（周期2.0の半分）オフセット
  }

  // --- 'logo3' タグの要素：1/4拍遅れ ---
  const targets3 = system.getGroup('logo3');
  for (const el of targets3) {
    _applySlit(el, 0.5);  // 1/4拍（周期2.0の1/4）オフセット
  }

  // --- 'logo4' タグの要素：3/4拍遅れ ---
  const targets4 = system.getGroup('logo4');
  for (const el of targets4) {
    _applySlit(el, 1.5);  // 3/4拍（周期2.0の3/4）オフセット
  }

  // --- 'text' タグの要素：完全に独立したエフェクト ---
  const textTargets = system.getGroup('text');
  for (const el of textTargets) {
    _applyTextSlit(el, 0.5);
  }

  // --- 'copy' タグの要素：ストロークのみ個別設定（エフェクトなし） ---
  const copyTargets = system.getGroup('copy');
  for (const el of copyTargets) {
    _applyCopyStroke(el);
  }
}

function _applySlit(el, phaseOffset = 0) {
  if (!(el instanceof TextElement)) {
    return;
  }

  const w0 = el.getWidth();
  const h0 = el.getHeight();
  if (w0 <= 0 || h0 <= 0) return;

  const sx = el.scale * (typeof el.scaleX === 'number' ? el.scaleX : 1);
  const sy = el.scale * (typeof el.scaleY === 'number' ? el.scaleY : 1);

  // ガラス越しエフェクト：水平帯でクリップし、帯ごとにテキストを垂直にずらす
  const sliceH = 10;              // 水平帯の高さ
  const t = frameCount * 0.04;
  const shiftAmount = 30;        // 垂直ずらし量の最大値

  push();
  translate(el.x, el.y);
  rotate(el.angle);
  scale(sx, sy);

  // テキストスタイル設定
  const [r, g, b] = el._getRGBFromHex(el.color);
  fill(r, g, b, el.opacity * 255);
  //noStroke();
  const [sr, sg, sb] = el._getRGBFromHex(PARAMS.textStrokeColor);
  stroke(sr, sg, sb);
  strokeWeight(2);
  textAlign(CENTER, CENTER);
  textFont(el.font);
  textSize(el.fontSize);

  // テキスト領域
  const textH = el.fontSize * 1;
  const totalH = textH * 2;       // クリップ領域の高さ（上下余裕をもたせる）
  const startY = -totalH / 2;
  const numSlices = Math.ceil(totalH / sliceH);

  for (let i = 0; i < numSlices; i++) {
    const clipY = startY + i * sliceH;

    // リニアなリズムでリピート（鋸波：-1→+1を直線的に繰り返す）
    const norm = i / numSlices;
    const phase = (norm * 5 + t * 0.15 + phaseOffset) % 2.0;  // 0→2 を繰り返す（+位相オフセット）
    const linear = (phase < 1.0) ? phase : (2.0 - phase);  // 0→1→0 三角波
    const vertShift = (linear * 2 - 1) * shiftAmount;      // -1→+1 にマッピング

    push();

    // クリップ位置は固定（帯の位置）
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(-w0 / 2, clipY, w0, sliceH);
    drawingContext.clip();

    // テキストを垂直にずらして描画
    text(el.text, 0, vertShift);

    drawingContext.restore();
    pop();
  }

  pop();
}

// === 'text' タグ用の独立エフェクト（logoとは完全に分離） ===
function _applyTextSlit(el, phaseOffset = 0) {
  if (!(el instanceof TextElement)) {
    return;
  }

  const w0 = el.getWidth();
  const h0 = el.getHeight();
  if (w0 <= 0 || h0 <= 0) return;

  const sx = el.scale * (typeof el.scaleX === 'number' ? el.scaleX : 1);
  const sy = el.scale * (typeof el.scaleY === 'number' ? el.scaleY : 1);

  // --- textタグ用エフェクト設定（ここを自由に調整） ---
  const sliceH = 20;              // 水平帯の高さ
  const t = frameCount * 0.09;
  const shiftAmount = 20;        // 垂直ずらし量の最大値

  push();
  translate(el.x, el.y);
  rotate(el.angle);
  scale(sx, sy);

  // --- textタグ用テキストスタイル（logoとは独立） ---
  const [r, g, b] = el._getRGBFromHex(el.color);
  fill(r, g, b, el.opacity * 255);
  //noStroke();
  const [sr, sg, sb] = el._getRGBFromHex(PARAMS.textStrokeColor);
  stroke(sr, sg, sb);
  strokeWeight(3.25);
  textAlign(CENTER, CENTER);
  textFont(el.font);
  textSize(el.fontSize);

  // テキスト領域
  const textH = el.fontSize * 1;
  const totalH = textH * 2;
  const startY = -totalH / 2;
  const numSlices = Math.ceil(totalH / sliceH);

  for (let i = 0; i < numSlices; i++) {
    const clipY = startY + i * sliceH;

    // リニアなリズムでリピート
    const norm = i / numSlices;
    const phase = (norm * 6 + t * 0.15 + phaseOffset) % 2.0;
    const linear = (phase < 1.0) ? phase : (2.0 - phase);
    const vertShift = (linear * 2 - 1) * shiftAmount;

    push();

    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(-w0 / 2, clipY, w0, sliceH);
    drawingContext.clip();

    text(el.text, 0, vertShift);

    drawingContext.restore();
    pop();
  }

  pop();
}

// === 'copy' タグ用：ストロークのみ適用（エフェクトなし） ===
function _applyCopyStroke(el) {
  if (!(el instanceof TextElement)) return;

  const sx = el.scale * (typeof el.scaleX === 'number' ? el.scaleX : 1);
  const sy = el.scale * (typeof el.scaleY === 'number' ? el.scaleY : 1);

  push();
  translate(el.x, el.y);
  rotate(el.angle);
  scale(sx, sy);

  const [r, g, b] = el._getRGBFromHex(el.color);
  fill(r, g, b, el.opacity * 255);
  const [sr, sg, sb] = el._getRGBFromHex(PARAMS.copyStrokeColor);
  stroke(sr, sg, sb);
  strokeWeight(0);
  textAlign(CENTER, CENTER);
  textFont(el.font);
  textSize(el.fontSize);

  // 上下にゆらゆら
  const yOffset = sin(frameCount * 0.025) * 3;
  text(el.text, 0, yOffset);

  pop();
}
