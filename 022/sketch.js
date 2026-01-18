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
let angles = [];
let speeds = [];
let colors = [];

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
    sampleFactor: 0.024,
    simplifyThreshold: 0
  });

  // 各点ごとに角度・回転速度・色をランダムで設定
  angles = [];
  speeds = [];
  colors = [];
  for (let i = 0; i < points.length; i++) {
    angles.push(random(TWO_PI));
    speeds.push(random(0.02, 0.02));
    // 青から白のグラデーションランダムカラー
    // t=0:青, t=1:白
    let t = random(1);
    let r = lerp(0, 255, t);      // 青(0)→白(255)
    let g = lerp(80, 255, t);     // 青(80)→白(255)
    let b = lerp(200, 255, t);    // 青(200)→白(255)
    colors.push(color(r, g, b));
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
  background(40);

  fill("#ffff00");
  textAlign(LEFT, TOP);
  textSize(12);
  text('各点を回転する長方形にして。回転速度は個別にランダムにして。青から白のグラデーションカラーでランダム配色して', 5, 5);

  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;

  push();
  translate(centerX, centerY);
  rectMode(CENTER);
  noStroke();
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    push();
    translate(pt.x, pt.y);
    rotate(angles[i]);
    fill(colors[i]);
    rect(0, 0, 50, 30);
    pop();
    angles[i] += speeds[i];
  }
  pop();
}