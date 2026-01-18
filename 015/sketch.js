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
let velocities = [];
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

  points = myFont.textToPoints(txt, 0, 0, fontSize, {
    sampleFactor: 0.1,
    simplifyThreshold: 0
  });

  // 各点に速度ベクトルを与える（最初は0、ランダムな微小値を加える）
  velocities = [];
  for (let i = 0; i < points.length; i++) {
    // y方向にランダムな初期速度（0.5〜2.5）
    velocities.push(createVector(0, random(0.01, 1)));
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
  background(30, 30, 50);

  fill(255, 220, 200, 200);
  noStroke();
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;

  push();
  translate(centerX, centerY);
  for (let i = 0; i < points.length; i++) {
    // 点の位置を更新
    points[i].y += velocities[i].y;
    // 徐々に速度を増やして溶ける感じを出す
    velocities[i].y += random(0, 0.1);
    // 少し横にも揺らぎを加える
    points[i].x += noise(i, frameCount * 0.02) * 5.0 - 5.0 / 2;

    ellipse(points[i].x, points[i].y, 20, 20);
  }
  pop();
}