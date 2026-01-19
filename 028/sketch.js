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
let boids = [];
let numBoids = 300;

function preload() {
  // フォントを読み込む
  myFont = loadFont('IBMPlexMono-Regular.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // // 画像書き出しボタンを作成
  // let imgBtn = createButton('画像で書き出し');
  // imgBtn.position(20, 20);
  // imgBtn.mousePressed(exportImage);

  reinitBoids();
}
// 画像書き出し関数
function exportImage() {
  saveCanvas('A_image', 'png');
}

function windowResized() {
  // ウィンドウがリサイズされたら、キャンバスの大きさも再設定する
  resizeCanvas(windowWidth, windowHeight);
  reinitBoids();
}


function draw() {
  // フォントがまだ読み込まれていなければ何もしない
  if (!myFont) return;
  // 画面サイズやpointsが変化していたらBoidsを再初期化
  if (points.length === 0 || boids.length === 0) {
    reinitBoids();
  }
  background(120);

  fill("#ffff00");
  textAlign(LEFT, TOP);
  textSize(12);
  text('Aの輪郭点をターゲットとして、数百のBoidsが画面の一番近い端から飛び立ち、ステアリング操舵力を使って滑らかに集合する群衆アニメーションを作って。', 5, 5);

  // Boidsの更新と描画
  for (let i = 0; i < boids.length; i++) {
    boids[i].update();
    boids[i].show();
  }
}

function reinitBoids() {
  let txt = "A";
  let fontSize = 1000;
  bounds = myFont.textBounds(txt, 0, 0, fontSize);
  points = myFont.textToPoints(txt, 0, 0, fontSize, {
    sampleFactor: 0.017,
    simplifyThreshold: 0
  });
  boids = [];
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;
    for (let i = 0; i < numBoids; i++) {
      let targetIdx = floor(random(points.length));
      let pt = points[targetIdx];
      let target = createVector(pt.x + centerX, pt.y + centerY);
      // ターゲットから一番近いウインドウ枠上の点を計算
      let tx = target.x;
      let ty = target.y;
      let dists = [
        {x: tx, y: 0, dist: abs(ty - 0)}, // 上
        {x: tx, y: height, dist: abs(ty - height)}, // 下
        {x: 0, y: ty, dist: abs(tx - 0)}, // 左
        {x: width, y: ty, dist: abs(tx - width)} // 右
      ];
      // 最小距離の枠を選ぶ
      let min = dists[0];
      for (let j = 1; j < dists.length; j++) {
        if (dists[j].dist < min.dist) min = dists[j];
      }
      let pos = createVector(min.x, min.y);
      boids.push(new Boid(pos, target, targetIdx));
  }
}

// Boidクラス
class Boid {
  constructor(pos, target, targetIdx) {
    this.pos = pos.copy();
    this.vel = p5.Vector.random2D().mult(random(1, 1));
    this.acc = createVector(0, 0);
    this.targetIdx = targetIdx;
    // targetはp5.Vector型で受け取り、そのままcopy
    this.target = target.copy();
    this.maxSpeed = 11;
    this.maxForce = 0.5;
    this.noiseSeed = random(1000);
  }

  update() {
    // ターゲットを少しずつ変化させて、点の周りを乱雑に飛ぶ
    let t = millis() * 0.0005 + this.noiseSeed;
    // points[this.targetIdx]は{x, y}なので、必ずp5.Vectorに変換
    let pt = points[this.targetIdx];
    let baseTarget = createVector(pt.x, pt.y);
    let offset = p5.Vector.fromAngle(noise(t, this.targetIdx) * TWO_PI * 2).mult(5 + noise(t + 100, this.targetIdx) * 12);
    let dynamicTarget = p5.Vector.add(baseTarget, offset);
    // 文字の中心に配置
    let centerX = (width - bounds.w) / 2 - bounds.x;
    let centerY = (height - bounds.h) / 2 - bounds.y;
    dynamicTarget.x += centerX;
    dynamicTarget.y += centerY;

    // ターゲットへの到達力
    let desired = p5.Vector.sub(dynamicTarget, this.pos);
    let d = desired.mag();
    desired.setMag(this.maxSpeed);
    if (d < 100) {
      // ターゲット近くでは減速
      desired.setMag(map(d, 0, 100, 0, this.maxSpeed));
    }
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);

    // 群れのランダム性
    let wander = p5.Vector.random2D().mult(0.1);

    // ターゲットに十分近づいたら動きを止める
    if (d < 10) {
      this.vel.set(0, 0);
      this.acc.set(0, 0);
    } else {
      this.acc.add(steer);
      this.acc.add(wander);
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.mult(0);
    }
  }

  show() {
    noStroke();
    fill(255, 220, 80);
    rect(this.pos.x, this.pos.y, 30, 30);
  }
}