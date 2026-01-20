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
let points = [];
let bounds;

let particles = [];
let particleLife = 1000; // 粒子の寿命（フレーム数）
let noiseScale = 0.003; // フローフィールドのスケール

function preload() {
  // フォントを読み込む
  myFont = loadFont('IBMPlexMono-Regular.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let txt = "A";
  let fontSize = 1000;

  bounds = myFont.textBounds(txt, 0, 0, fontSize);

  points = myFont.textToPoints(txt, 0, 0, fontSize, {
    sampleFactor: 1,
    simplifyThreshold: 0
  });

  // 粒子を初期化
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;
  particles = [];
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let pos = createVector(pt.x + centerX, pt.y + centerY);
    particles.push({
      pos: pos.copy(),
      prev: pos.copy(),
      alpha: 255,
      life: particleLife
    });
  }

  // // 画像書き出しボタンを作成
  // let imgBtn = createButton('画像で書き出し');
  // imgBtn.position(20, 20);
  // imgBtn.mousePressed(exportImage);
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
  background(120, 0); // うっすら残像を残す

  fill("#ffff00");
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  text('輪郭点を始点としてパーリンノイズのフローフィールドに沿って粒子が流れるアニメーションを作って。背景はクリアせずに軌跡を線で描き重ね、粒子は徐々に消えていくように。', 5, 5);

  noFill();
  stroke(255);
  strokeWeight(1);

  // 粒子の更新と描画
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    if (p.life > 0 && p.alpha > 0) {
      // 現在位置を保存
      p.prev.set(p.pos);

      // パーリンノイズによる角度
      let n = noise(p.pos.x * noiseScale, p.pos.y * noiseScale, frameCount * 0.005);
      let angle = n * TAU * 2;
      let v = p5.Vector.fromAngle(angle);
      v.mult(1); // 速度
      p.pos.add(v);

      // 線で軌跡を描画
      stroke(255, p.alpha);
      line(p.prev.x, p.prev.y, p.pos.x, p.pos.y);

      // アルファと寿命を減らす
      p.alpha *= 0.98
    }
  }
}