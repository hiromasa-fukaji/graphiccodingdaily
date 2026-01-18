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
let icicles = [];
let frameCountStop = 0;
let animationStopped = false;
let bounds;

function preload() {
  // フォントを読み込む
  myFont = loadFont('IBMPlexMono-Regular.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let txt = "A";
  let fontSize = 800;

  bounds = myFont.textBounds(txt, 0, 0, fontSize);

  points = myFont.textToPoints(txt, 0, 0, fontSize, {
    sampleFactor: 0.1,
    simplifyThreshold: 0
  });

  // つららの初期化
  icicles = [];
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
        icicles.push({
          x: pt.x,
          y: pt.y,
          baseY: pt.y,
          len: 0,
          speed: random(0.5, 0.7)
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
  background(0);

  fill("#ffff00");
  textAlign(LEFT, TOP);
  textSize(12);
  text('輪郭からつららが垂れるアニメーションを作って。白から濃い青へ変化するグラデーションにして。ランダムな速度で200フレームでストップ。', 5, 5);

  fill(255);
  noStroke();
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;

  // 120フレームで停止
  if (!animationStopped) {
    frameCountStop++;
    if (frameCountStop >= 200) {
      animationStopped = true;
    }
  }

  push();
  translate(centerX, centerY);
  for (let i = 0; i < icicles.length; i++) {
    let icicle = icicles[i];
    // 停止していなければアニメーション
    if (!animationStopped) {
      icicle.len += icicle.speed;
      if (icicle.len > height - icicle.baseY) {
        icicle.len = 0;
        icicle.speed = random(0.4, 0.8);
      }
    }
    // グラデーションでつららを描画（白→青）
    let steps = 100;
    for (let j = 0; j < steps; j++) {
      let t = j / (steps - 1);
      let y0 = icicle.baseY + t * icicle.len;
      let y1 = icicle.baseY + (t + 1 / steps) * icicle.len;
      // t=0で白、t=1で濃い青
      let r = lerp(255, 0, t);
      let g = lerp(255, 40, t);
      let b = lerp(255, 180, t);
      stroke(r, g, b, 180);
      strokeWeight(10);
      line(icicle.x, y0, icicle.x, y1);
    }
    // 先端に円（青）
    fill(0, 40, 180, 200);
    noStroke();
    ellipse(icicle.x, icicle.baseY + icicle.len, 5, 5);
  }
  pop();
}