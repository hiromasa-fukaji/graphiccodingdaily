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
    sampleFactor: 0.035,
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




  // オフスクリーングラフィックを作成
  let pg = createGraphics(width, height);
  pg.background(0); // まず黒で塗りつぶす
  pg.noStroke();
  pg.fill(255);

  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;

  pg.push();
  pg.translate(centerX, centerY);
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    // ノイズによるオフセット
    let t = frameCount * 0.1;
    let nx = noise(i * 1, t);
    let ny = noise(i * 1 + 200, t);
    let dx = map(nx, 0, 1, -30, 30);
    let dy = map(ny, 0, 1, -30, 30);
    pg.ellipse(pt.x + dx, pt.y + dy, 30, 30);
  }
  pg.pop();

  // 強いBLURフィルターをかける
  pg.filter(BLUR, 10);
  // 二値化フィルター（0.5が一般的な閾値）
  pg.filter(THRESHOLD, 0.5);

  // メインキャンバスに描画
  image(pg, 0, 0);

  // 説明テキスト
  fill("#ffff00");
  textAlign(LEFT, TOP);
  textSize(12);
  text('文字の各点をノイズでゆらゆらと動かし、それらを大きな円として描画した後、BLURとTHRESHOLDフィルターを順にかけて、アメーバのように融合するメタボール表現を作って。', 5, 5);

}