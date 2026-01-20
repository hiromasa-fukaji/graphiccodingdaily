// 等高線の数をアニメーションさせるためのグローバル変数
let contourCount = 1;
let contourDir = 1; // 増減方向（1:増やす, -1:減らす）
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
    sampleFactor: 0.016,
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
  text('輪郭の各点からのSDFを計算し、等高線を描画して。文字から外側に向かって等高線が増減を繰り返すアニメーションを作って。', 5, 5);

  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;

  // SDF（距離場）を使って等高線を描画
  let gridStep = 2.5; // グリッドの細かさ
  let contourStep = 10; // 等高線の間隔
  noStroke();
  for (let y = 0; y < height; y += gridStep) {
    for (let x = 0; x < width; x += gridStep) {
      // キャンバス座標を文字の中心座標系に変換
      let px = x - centerX;
      let py = y - centerY;
      // 各点から最短距離を計算
      let minDist = Infinity;
      for (let i = 0; i < points.length; i++) {
        let pt = points[i];
        let d = dist(px, py, pt.x, pt.y);
        if (d < minDist) minDist = d;
      }
      // 等高線の描画
      for (let c = 0; c < contourCount; c++) {
        let threshold = c * contourStep;
        if (abs(minDist - threshold) < gridStep) {
          fill(255, 255, 0);
          ellipse(x, y, gridStep * 1.5, gridStep * 1.5);
        }
      }
    }
  }

  // 文字の点を表示（参考用）
  fill(255);
  noStroke();
  push();
  translate(centerX, centerY);
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    //ellipse(pt.x, pt.y, 5, 5);
  }
  pop();

  // contourCountを1から9まで増やし、9で減少、1で増加に切り替える
  contourCount += contourDir;
  if (contourCount >= 9) {
    contourCount = 9;
    contourDir = -1;
  } else if (contourCount <= 1) {
    contourCount = 1;
    contourDir = 1;
  }
}