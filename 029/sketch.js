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
let springs = [];
let velocities = [];
let masses = [];
let anchors = [];
let k = 0.0005; // バネ定数（弱める）
let k_anchor = 0.003; // アンカー（弱める）
let restLength = 0; // バネの自然長（後で初期化）
let mouseRadius = 30; // リペル点の干渉半径（広げる）
let repelStrength = 2.0; // リペル点の反発力（さらに強化）
let repelPoints = [];
let repelVelocities = [];
let numRepel = 5; // リペル点の数

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

  // Spring, velocity, mass, anchorの初期化
  springs = [];
  velocities = [];
  masses = [];
  anchors = [];
  for (let i = 0; i < points.length; i++) {
    velocities.push(createVector(0, 0));
    masses.push(1);
    anchors.push(createVector(points[i].x, points[i].y)); // 初期位置を保存
    // 隣り合う点同士をバネでつなぐ
    if (i < points.length - 1) {
      springs.push({
        a: i,
        b: i + 1,
        restLength: dist(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y)
      });
    }
  }

  // リペル点の初期化
  repelPoints = [];
  repelVelocities = [];
  for (let i = 0; i < numRepel; i++) {
    repelPoints.push(createVector(random(width), random(height)));
    repelVelocities.push(p5.Vector.random2D().mult(random(8, 8)));
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
  textAlign(LEFT, TOP);
  textSize(12);
  text('文字の輪郭点同士をバネで連結して弾力のある鎖を作り、画面内を跳ね回る複数のリペル点が衝突して、ぐにゃぐにゃと歪む物理シミュレーションを作って。', 5, 5);

  fill(255);
  noStroke();
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;

  // 物理シミュレーション
  // 1. バネの力
  for (let i = 0; i < springs.length; i++) {
    let a = springs[i].a;
    let b = springs[i].b;
    let pa = points[a];
    let pb = points[b];
    let va = velocities[a];
    let vb = velocities[b];
    let dir = createVector(pb.x - pa.x, pb.y - pa.y);
    let d = dir.mag();
    let stretch = d - springs[i].restLength;
    if (d !== 0) dir.div(d);
    let force = dir.copy().mult(stretch * k);
    va.add(force);
    vb.sub(force);
  }

  // 2. アンカー（元の位置に戻す力）
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let anchor = anchors[i];
    let v = velocities[i];
    let dir = createVector(anchor.x - pt.x, anchor.y - pt.y);
    v.add(dir.mult(k_anchor));
  }

  // 3. リペル点との干渉（中央配置後の座標で判定）
  for (let r = 0; r < repelPoints.length; r++) {
    let rx = repelPoints[r].x;
    let ry = repelPoints[r].y;
    for (let i = 0; i < points.length; i++) {
      let pt = points[i];
      let v = velocities[i];
      // 文字の点のキャンバス座標
      let px = pt.x + centerX;
      let py = pt.y + centerY;
      let d = dist(px, py, rx, ry);
      if (d < mouseRadius) {
        let repel = createVector(px - rx, py - ry);
        if (repel.mag() > 0) {
          repel.setMag(repelStrength);
          // 力を文字の点のローカル座標に変換して加算
          v.add(repel);
        }
      }
    }
  }

  // 4. 位置・速度の更新と減衰
  for (let i = 0; i < points.length; i++) {
    let v = velocities[i];
    v.mult(0.9); // 減衰
    points[i].x += v.x;
    points[i].y += v.y;
  }

  // リペル点の移動
  for (let r = 0; r < repelPoints.length; r++) {
    repelPoints[r].add(repelVelocities[r]);
    // 減衰をなくすことで止まらず動き続ける
    // 壁反射
    if (repelPoints[r].x < 0) {
      repelPoints[r].x = 0;
      repelVelocities[r].x *= -1;
    }
    if (repelPoints[r].x > width) {
      repelPoints[r].x = width;
      repelVelocities[r].x *= -1;
    }
    if (repelPoints[r].y < 0) {
      repelPoints[r].y = 0;
      repelVelocities[r].y *= -1;
    }
    if (repelPoints[r].y > height) {
      repelPoints[r].y = height;
      repelVelocities[r].y *= -1;
    }
  }

  // 描画
  push();
  translate(centerX, centerY);
  stroke(255);
  strokeWeight(1);
  noFill();
  // バネ（線）
  beginShape();
  for (let i = 0; i < points.length; i++) {
    vertex(points[i].x, points[i].y);
  }
  endShape();
  // 点
  noStroke();
  fill(0);
  for (let i = 0; i < points.length; i++) {
    ellipse(points[i].x, points[i].y, 12, 12);
  }
  pop();

  // リペル点の描画
  noStroke();
  fill(255, 0, 100, 0);
  for (let r = 0; r < repelPoints.length; r++) {
    ellipse(repelPoints[r].x, repelPoints[r].y, mouseRadius * 0.7, mouseRadius * 0.7);
  }
}