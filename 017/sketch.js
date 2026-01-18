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

  fill("#ffff00");
  textAlign(LEFT, TOP);
  textSize(12);
  text('点同士の距離が一定以下のときだけ、その間に線を引いて。星座のようなネットワークを作って。', 5, 5);


  fill(225, 255, 0, 255); // 黄色＋不透明度100
  noStroke();
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;

  push();
  translate(centerX, centerY);
  // 星座のようなネットワークを描画
  let maxDist = 90; // 線を引く最大距離（ピクセル）
  stroke(255); // 半透明の白
  strokeWeight(0.5);
  for (let i = 0; i < points.length; i++) {
    let p1 = points[i];
    for (let j = i + 1; j < points.length; j++) {
      let p2 = points[j];
      let d = dist(p1.x, p1.y, p2.x, p2.y);
      if (d < maxDist) {
        line(p1.x, p1.y, p2.x, p2.y);
      }
    }
  }
  noStroke();
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    ellipse(pt.x, pt.y, 8, 8);
  }
  pop();

  

}