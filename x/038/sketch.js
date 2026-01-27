let particles = [];
let samplingStep = 5; // ドットの粗さ
let pg; // 裏紙（グラフィックバッファ）用の変数

function setup() {
  createCanvas(windowWidth, windowHeight);
  // メインキャンバスの pixelDensity は制限しません（高画質のまま）

  // 画像書き出しボタン
  let imgBtn = createButton('画像で書き出し');
  imgBtn.position(20, 20);
  imgBtn.mousePressed(exportImage);

  // 最初に一度サンプリングを実行
  sampleText();
}

function sampleText() {
  // 1. 画面と同じサイズの「裏紙」を作る
  pg = createGraphics(width, height);
  
  // ★重要: 裏紙だけ解像度を「1」に固定する
  // これにより、Retina画面でも計算が「y * width + x」だけで済みます
  pg.pixelDensity(1);
  
  // 2. 裏紙に文字を描く（pg. をつける）
  pg.background(0);
  pg.fill(255);
  pg.noStroke();
  pg.textFont('Helveticaneue-bold, sans-serif'); 
  pg.textStyle(NORMAL);
  pg.textSize(min(width, height) * 1); // 画面サイズに合わせて調整
  pg.textAlign(CENTER, CENTER);
  pg.text("A", width / 2, height / 2+20);
  
  // 3. 裏紙のピクセルをロード
  pg.loadPixels();
  particles = [];
  
  // 4. シンプルな計算でサンプリング
  // pg.pixelDensity(1) なので、pdの掛け算は一切不要！
  for (let y = 0; y < height; y += samplingStep) {
    for (let x = 0; x < width; x += samplingStep) {
      
      // 非常にシンプルなインデックス計算
      let index = 4 * (y * width + x);
      
      // pg.pixels（裏紙のデータ）を参照
      let r = pg.pixels[index];
      
      // しきい値判定（白ければ点に追加）
      if (r > 128) {
        // 各ピクセルをパーティクルとして登録
        let pos = createVector(x, y);
        let vel = p5.Vector.random2D().mult(random(0.5, 2));
        particles.push({
          pos,
          vel
        });
      }
    }
  }
  
  // メモリ節約のため、使い終わった裏紙は削除しても良いですが
  // p5.jsでは再代入でガベージコレクションされるのでそのままでもOK
}

function exportImage() {
  saveCanvas('image', 'png');
}

function draw() {
  background(0); // 宇宙っぽい黒背景

  // fill("#ffff00");
  // noStroke();
  // textAlign(LEFT, TOP);
  // textSize(12);
  // text('プロンプトが入ります', 5, 5);
  
  // マウス位置をブラックホールとして描画
  push();
  noFill();
  stroke(255, 200);
  strokeWeight(2);
  ellipse(mouseX, mouseY, 1, 1); // イベントホライズン
  stroke(150, 150, 255, 150);
  ellipse(mouseX, mouseY, 100, 100); // 重力レンズのイメージ
  pop();

  // パーティクルを更新 & 描画
  //noStroke();
  fill(255);
  stroke("#ff0000");
  strokeWeight(1);

  let blackHole = createVector(mouseX, mouseY);

  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];

    // ブラックホールへのベクトル
    let dir = p5.Vector.sub(blackHole, p.pos);
    let dist = dir.mag();

    // あまりにも遠い・近い時の暴走を抑える
    let safeDist = constrain(dist, 10, max(width, height));

    // 引力（中心方向の力）
    let gravityStrength = 5000 / (safeDist * safeDist); // 1/r^2 的な減衰
    let gravity = dir.setMag(gravityStrength);

    // 接線方向（回転させるための力）
    let tangent = createVector(-dir.y, dir.x);
    tangent.setMag(gravityStrength * 1);

    // 速度更新
    p.vel.add(gravity);
    p.vel.add(tangent);

    // 摩擦（減衰）と最大速度制限
    p.vel.mult(0.95);
    p.vel.limit(1);

    // 位置更新
    p.pos.add(p.vel);

    // ブラックホールのごく近くまで来たら、遠くに再配置してループさせる
    if (dist < 25 || isOffScreen(p.pos)) {
      resetParticle(p);
    }

    // パーティクル描画
    rect(p.pos.x, p.pos.y, samplingStep * 5 , samplingStep * 5);
  }
}

// 画面外に出たかどうか
function isOffScreen(pos) {
  const margin = 50;
  return (
    pos.x < -margin ||
    pos.x > width + margin ||
    pos.y < -margin ||
    pos.y > height + margin
  );
}

// ブラックホールに吸い込まれたパーティクルを、遠くから再スタートさせる
function resetParticle(p) {
  let angle = random(TWO_PI);
  let radius = max(width, height) * 0.8;
  let center = createVector(width / 2, height / 2);

  p.pos = p5.Vector.add(center, p5.Vector.fromAngle(angle).mult(radius));
  p.vel = p5.Vector.random2D().mult(random(1, 3));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // サイズが変わったら、裏紙を作り直して再サンプリング
  sampleText();
}