/*
 * CONTEXT: p5.js Creative Coding
 * GOAL: Create generative art using textToPoints
 * RULES:
 * 1. Use global variables declared at the top.
 * 2. Do NOT redeclare variables inside draw() (e.g., let points = ...).
 * 3. Keep the code simple and readable for students.
 * 4. Use vector math (p5.Vector) for physics.
 */

let myFont;
let particles = [];
let repelRadius = 200;
let repelStrength = 0.01;
let movers = [
  { pos: null, t: 0, phase: 0 },
  { pos: null, t: 0, phase: Math.PI }
];
let bounds;

function preload() {
  // フォントを読み込む
  myFont = loadFont('IBMPlexMono-Regular.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let txt = "A";
  let fontSize = 1000;

  bounds = myFont.textBounds(txt, 0, 0, fontSize);

  // Aの内側をグリッドで埋める
  particles = [];
  let step = 10; // パーティクル間隔
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;
  for (let y = bounds.y; y < bounds.y + bounds.h; y += step) {
    for (let x = bounds.x; x < bounds.x + bounds.w; x += step) {
      // 文字の内側か判定
      if (isInsideText(x, y, txt, fontSize)) {
        let pos = createVector(x + centerX, y + centerY);
        let p = {
          pos: pos.copy(),
          base: pos.copy(),
          vel: createVector(0, 0)
        };
        particles.push(p);
      }
    }
  }

  // 動くリペル点の初期化（2つ）
  for (let i = 0; i < movers.length; i++) {
    movers[i].pos = createVector(width/2, height/2);
    movers[i].t = 0;
  }

  // // 画像書き出しボタンを作成
  // let imgBtn = createButton('画像で書き出し');
  // imgBtn.position(20, 20);
  // imgBtn.mousePressed(exportImage);
}

// 文字の内側かどうか判定する関数
function isInsideText(x, y, txt, fontSize) {
  // オフスクリーンバッファでピクセル判定
  if (!isInsideText.gfx) {
    isInsideText.gfx = createGraphics(bounds.w, bounds.h);
    isInsideText.gfx.pixelDensity(1);
    isInsideText.gfx.background(0);
    isInsideText.gfx.fill(255);
    isInsideText.gfx.noStroke();
    isInsideText.gfx.textFont(myFont);
    isInsideText.gfx.textSize(fontSize);
    isInsideText.gfx.text(txt, -bounds.x, -bounds.y);
    isInsideText.gfx.loadPixels();
  }
  let gx = Math.floor(x - bounds.x);
  let gy = Math.floor(y - bounds.y);
  if (gx < 0 || gy < 0 || gx >= bounds.w || gy >= bounds.h) return false;
  let idx = 4 * (gx + gy * isInsideText.gfx.width);
  return isInsideText.gfx.pixels[idx] > 0;
}
// 画像書き出し関数
function exportImage() {
  saveCanvas('A_image', 'png');
}

function windowResized() {
  // ウィンドウがリサイズされたら、キャンバスの大きさも再設定する
  resizeCanvas(windowWidth, windowHeight);
}


function draw() {
  background(120);

  fill("#ffff00");
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  text('Aの内側を砂粒のようなパーティクルで満たして。その中を見えない球体が泳ぎ回り、砂粒をかき分けていくアニメーションを作って。', 5, 5);

  noStroke();
  fill(255, 220, 40, 220);

  // 2つの動くリペル点の座標を更新・描画
  let r = min(width, height) * 0.32;
  for (let i = 0; i < movers.length; i++) {
    let m = movers[i];
    m.t += 0.02;
    let mx = width/2 + cos(m.t * 1.1 + m.phase) * r;
    let my = height/2 + sin(m.t * 0.9 + m.phase) * r * 0.8;
    m.pos.set(mx, my);
    noStroke();
    noFill();
    ellipse(m.pos.x, m.pos.y, 1, 1);
  }

  fill(255);
  stroke("#0026ff");
  strokeWeight(1.5);
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];

    // 2つのリペル点からの反発力
    for (let j = 0; j < movers.length; j++) {
      let m = movers[j];
      let dir = p.pos.copy().sub(m.pos);
      let d = dir.mag();
      if (d < repelRadius) {
        dir.normalize();
        let force = (repelRadius - d) * repelStrength;
        p.vel.add(dir.mult(force));
      }
    }

    // 元の位置に戻る力
    let home = p.base.copy().sub(p.pos).mult(0.01);
    p.vel.add(home);

    // 摩擦
    p.vel.mult(0.85);

    // 位置更新
    p.pos.add(p.vel);

    ellipse(p.pos.x, p.pos.y, 10, 10);
  }
}