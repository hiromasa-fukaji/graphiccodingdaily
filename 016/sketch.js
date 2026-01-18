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
    sampleFactor: 0.05,
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

  // コメントを画面上部に表示
  fill("#ffff00");
  textAlign(LEFT, TOP);
  textSize(12);
  text('文字が風に吹かれているように、波打つような動きをつけて。', 5, 5);

  fill(255);
  noStroke();
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;

  // 波のパラメータ
  let amplitude = 30; // 波の高さ
  let wavelength = 20; // 波の長さ
  let speed = 0.05; // 波の進む速さ

  push();
  translate(centerX, centerY);
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    // サイン波でY座標を揺らす
    let wave = sin((pt.x / wavelength) + (frameCount * speed));
    let yOffset = wave * amplitude;
    ellipse(pt.x, pt.y + yOffset, 10, 10);
  }
  pop();
}