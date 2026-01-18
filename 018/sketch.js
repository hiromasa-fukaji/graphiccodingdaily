/*
 * CONTEXT: p5.js Creative Coding
 * GOAL: ボロノイ図で文字を描く（細胞の集合のように）
 * RULES:
 * 1. Use global variables declared at the top.
 * 2. Do NOT redeclare variables inside draw() (e.g., let points = ...).
 * 3. Keep the code simple and readable for students.
 */

let myFont;
let points = [];
let bounds;

let distSlider; // minDist閾値用スライダー

function preload() {
  // フォントを読み込む
  myFont = loadFont('IBMPlexMono-Regular.ttf');
}

function setup() {
      // // 画像書き出しボタンを作成
      // let saveBtn = createButton('画像を書き出し');
      // saveBtn.position(20, 70);
      // saveBtn.mousePressed(() => saveCanvas('voronoi_text', 'png'));
    // minDist閾値スライダーを作成
    distSlider = createSlider(10, 200, 60, 1);
    distSlider.position(20, 40);
    distSlider.style('width', '100px');
  createCanvas(windowWidth, windowHeight);
  
  let txt = "A";
  let fontSize = 1000;
  
  bounds = myFont.textBounds(txt, 0, 0, fontSize);
  // 文字の形に沿って点を配置（母点）
  // y座標を-bounds.yにしてベースライン→矩形上端に揃える
  points = myFont.textToPoints(txt, 0, -bounds.y, fontSize, {
    sampleFactor: 0.02,
    simplifyThreshold: 0
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(20);

  fill("#ffff00");
  textAlign(LEFT, TOP);
  textSize(12);
  text('点の位置を母点としてボロノイ図を描画して。文字の形が細胞の集合のように見えるように。', 5, 5);
  
  // 文字を中央に配置するための計算
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2;
  
  // ボロノイ図を描画（translate前に画面全体に）
  drawVoronoi(centerX, centerY);
  // スライダーの値を表示
  fill(255);
  noStroke();
  textSize(14);
  // text('minDist: ' + distSlider.value(), distSlider.x * 1.1 + distSlider.width, 55);
  
  // // 母点を描画（細胞の核のように）
  // push();
  // translate(centerX, centerY);
  // drawSeeds();
  // pop();
}

// ボロノイ図を描画する関数
function drawVoronoi(offsetX, offsetY) {
  let step = 5; // ピクセルをスキップして高速化
  
  // 画面全体を走査
  let threshold = distSlider.value();
  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < height; y += step) {
      // 最も近い母点を見つける
      let minDist = Infinity;
      let closestIndex = 0;
      for (let i = 0; i < points.length; i++) {
        let px = points[i].x + offsetX;
        let py = points[i].y + offsetY;
        let d = dist(x, y, px, py);
        if (d < minDist) {
          minDist = d;
          closestIndex = i;
        }
      }
      // 一定距離以内のみ描画（文字の周辺だけ）
      if (minDist < threshold) {
        let hue = (closestIndex * 137.5) % 240;
        fill(hue, 100, 100)
        colorMode(HSB);
        noStroke();
        ellipse(x, y, step, step);
      }
    }
  }
  
  colorMode(RGB);
}

// // 母点（細胞の核）を描画する関数
// function drawSeeds() {
//   for (let i = 0; i < points.length; i++) {
//     let pt = points[i];
    
//     // 外側の円（細胞壁のような輪郭）
//     fill(255, 255, 255, 100);
//     noStroke();
//     ellipse(pt.x, pt.y, 0, 0);
    
//     // 内側の円（核）
//     fill(255);
//     ellipse(pt.x, pt.y, 0, 0);
//   }
// }