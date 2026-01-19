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
let lights = [];
let numLights = 20;

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
    sampleFactor: 0.2,
    simplifyThreshold: 0
  });

  // ライト（懐中電灯の中心）を初期化
  lights = [];
  for (let i = 0; i < numLights; i++) {
    let pos = createVector(random(width), random(height));
    let vel = p5.Vector.random2D().mult(random(1, 2));
    lights.push({ pos, vel });
  }

  // 画像書き出しボタンを作成
  let imgBtn = createButton('画像で書き出し');
  imgBtn.position(20, 20);
  imgBtn.mousePressed(exportImage);
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
  background(20);

  fill("#ffff00");
  textAlign(LEFT, TOP);
  textSize(12);
  text('ランダムに動く光で文字輪郭を照らす', 5, 5);

  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;

  // ライトの移動
  for (let i = 0; i < lights.length; i++) {
    let l = lights[i];
    l.pos.add(l.vel);
    // 端で跳ね返る
    if (l.pos.x < 0 || l.pos.x > width) l.vel.x *= -1;
    if (l.pos.y < 0 || l.pos.y > height) l.vel.y *= -1;
  }

  push();
  translate(centerX, centerY);
  stroke(255, 255, 100, 10);
  strokeWeight(1);
  noFill();
  for (let i = 0; i < lights.length; i++) {
    let l = lights[i];
    // キャンバス座標→ローカル座標
    let lx = l.pos.x - centerX;
    let ly = l.pos.y - centerY;
    for (let j = 0; j < points.length; j++) {
      let pt = points[j];
      let d = dist(lx, ly, pt.x, pt.y);
      if (d < 500) {
        line(lx, ly, pt.x, pt.y);
      }
    }
  }
  pop();
}