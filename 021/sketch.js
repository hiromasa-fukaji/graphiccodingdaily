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
  background(120);

  fill("#ffff00");
  textAlign(LEFT, TOP);
  textSize(12);
  text('文字を構成する円の色が青から赤にグラデーショナルに移り変わるアニメーションにして。各円が独立した周期で色変化するように。', 5, 5);

  noStroke();
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;

  push();
  translate(centerX, centerY);
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    // グラデーションのための補間値を計算
    // 各円が独立した周期で色変化するように、iごとに異なる位相を加える
    let t = (frameCount * 0.01 + i * 0.08) % 1;
    // 青から赤へ
    let r = lerp(0, 255, t);
    let g = 0;
    let b = lerp(255, 0, t);
    fill(r, g, b);
    ellipse(pt.x, pt.y, 40, 40);
  }
  pop();
}