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
let walkers = [];

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

  // 各点からウォーカーを生成
  walkers = [];
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    // ランダムな方向ベクトル
    let dir = p5.Vector.random2D();
    // ウォーカーの初期位置と方向、履歴
    walkers.push({
      pos: createVector(pt.x + centerX, pt.y + centerY),
      dir: dir,
      history: [createVector(pt.x + centerX, pt.y + centerY)],
      speed: random(1, 2)
    });
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
  background(120); 

  fill("#ffff00");
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  text('Aの各点から自律的ウォーカーを生成し、それぞれがランダムに這い回り、その軌跡を描画することで樹木のような有機的な増殖アニメーションを作って。', 5, 5);

  noFill();
  stroke(255); // 半透明の白
  strokeWeight(0.5);

  // ウォーカーを動かして線を描画
  for (let i = 0; i < walkers.length; i++) {
    let w = walkers[i];
    // 軌跡を描画
    beginShape();
    for (let j = 0; j < w.history.length; j++) {
      vertex(w.history[j].x, w.history[j].y);
    }
    endShape();

    // 方向を少しランダムに変化させる
    let angleChange = random(0.1, 1.25);
    w.dir.rotate(angleChange);
    // 速度で進む
    w.pos.add(p5.Vector.mult(w.dir, w.speed));
    // 履歴に追加
    w.history.push(w.pos.copy());
    // 履歴が長すぎたら古いものを消す
    if (w.history.length > 2000) {
      w.history.shift();
    }
    // 画面外に出たら止める（またはリセットしたい場合はここでposを戻す）
    if (
      w.pos.x < -50 || w.pos.x > width + 50 ||
      w.pos.y < -50 || w.pos.y > height + 50
    ) {
      // 画面外に出たら何もしない（消える）
      // リセットしたい場合はコメントアウト解除
      // w.pos = w.history[0].copy();
      // w.history = [w.pos.copy()];
    }
  }
}