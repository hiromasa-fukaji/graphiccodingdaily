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
let pointColors = [];
let bounds;

function preload() {
  // フォントを読み込む
  myFont = loadFont('IBMPlexMono-Regular.ttf');
}

// バーの動きにランダム性を与えるためのオフセット
let barOffsets = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100); // HSBカラーモードでカラフルに

  let txt = "A";
  let fontSize = 1000;

  bounds = myFont.textBounds(txt, 0, 0, fontSize);


  points = myFont.textToPoints(txt, 0, 0, fontSize, {
    sampleFactor: 1,
    simplifyThreshold: 0
  });

  // 各点ごとにランダムな色を決めて保存
  pointColors = [];
  for (let i = 0; i < points.length; i++) {
    let h = random(360);
    let s = random(60, 100);
    let b = random(70, 100);
    pointColors.push([h, s, b]);
  }

  // 各バーにランダムなノイズオフセットを与える
  barOffsets = [random(1000), random(1000), random(1000)];

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
  background(120, 10, 20)

  // fill("#ffff00");
  // textAlign(LEFT, TOP);
  // textSize(12);
  // text('点の位置を母点としてボロノイ図を描画して。文字の形が細胞の集合のように見えるように。', 5, 5);

  fill(255);
  noStroke();
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;


  // 横棒のY座標をsin波＋ノイズでアニメーション（3本）
  let barY1 = height / 2 + sin(frameCount * 0.01 + barOffsets[0]) * (height / 3)
              + map(noise(frameCount * 0.001 + barOffsets[0]), 0, 1, -100, 100);
  let barY2 = height / 2 + sin(frameCount * 0.01 + PI + barOffsets[1]) * (height / 3)
              + map(noise(frameCount * 0.0012 + barOffsets[1]), 0, 1, -100, 100);
  let barY3 = height / 2 + sin(frameCount * 0.01 + PI + barOffsets[2]) * (height / 3)
              + map(noise(frameCount * 0.0014 + barOffsets[2]), 0, 1, -100, 100);
  let threshold = 20; // 近さのしきい値

  // 横棒の描画
  line(0, barY1, width, barY1);
  line(0, barY2, width, barY2);
  line(0, barY3, width, barY3);

  noStroke();

  push();
  translate(centerX, centerY);
  //stroke(0);

  
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    // 横棒のY座標に近い点だけX座標をゆっくり振動させる
    let d1 = abs((pt.y + centerY) - barY1);
    let d2 = abs((pt.y + centerY) - barY2);
    let d3 = abs((pt.y + centerY) - barY3);
    let x = pt.x;
    if (d1 < threshold || d2 < threshold || d3 < threshold) {
      let t = frameCount * 0.0001 + i * 0.05; // 各点のノイズ空間を近づけて全体がゆっくり動く印象に
      let n = noise(t);
      x += map(n, 0, 1, -200, 200);
    }
    // 各点ごとに固定の色を使用
    let [h, s, b] = pointColors[i];
    fill(h, s, b, 90);
    ellipse(x, pt.y, 40, 40);
  }
  pop();

  

}