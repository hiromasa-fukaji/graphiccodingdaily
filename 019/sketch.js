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
    sampleFactor: 1,
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
  background(0);

  fill("#ffff00");
  textAlign(LEFT, TOP);
  textSize(12);
  text('各y座標ごとに異なる速度で文字を横にスライドさせ、グリッチのようなスリットスキャン効果を作って。', 5, 5);

  fill(255);
  noStroke();
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;

  push();
  translate(centerX, centerY);
  // y座標ごとに速度を変えて横にスライド
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    // y座標ごとに異なる速度を与える
    let speed = map(sin(pt.y * 0.03 + frameCount * 0.03), -1, 1, -8, 8);
    // さらにグリッチ感を出すためにノイズも加える
    let glitch = map(noise(pt.y * 0.02, frameCount * 0.01), 0, 1, -100, 100);
    let xOffset = speed * 10 + glitch;
    ellipse(pt.x + xOffset, pt.y, 2, 2);
  }
  pop();
}