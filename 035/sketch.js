/*
 * CONTEXT: p5.js Creative Coding
 * GOAL: Perfect Pixel Sampling with createGraphics
 */

let points = [];
let samplingStep = 16; // ドットの粗さ
let pg; // 裏紙（グラフィックバッファ）用の変数
let maxDistance = 150; // 距離の最大値（この距離以上は最小サイズ）
let minSize = samplingStep * 0.8; // 最小サイズ
let maxSize = samplingStep * 6; // 最大サイズ
let agents = []; // 動き回る点の配列
let numAgents = 25; // 動く点の数
let agentSpeed = 1.5; // エージェントの一定の速さ

function setup() {
  createCanvas(windowWidth, windowHeight);
  // メインキャンバスの pixelDensity は制限しません（高画質のまま）

  // // 画像書き出しボタン
  // let imgBtn = createButton('画像で書き出し');
  // imgBtn.position(20, 20);
  // imgBtn.mousePressed(exportImage);

  // 動き回る点を初期化（すべて一定の速さで動く）
  for (let i = 0; i < numAgents; i++) {
    // ランダムな角度を選ぶ
    let angle = random(TWO_PI);
    // その角度方向に一定の速さで動くベクトルを設定
    agents.push({
      x: random(width),
      y: random(height),
      vx: cos(angle) * agentSpeed,
      vy: sin(angle) * agentSpeed
    });
  }

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
  pg.textFont('HelveticaNeue-bold, sans-serif'); 
  pg.textStyle(NORMAL);
  pg.textSize(min(width, height) * 1); // 画面サイズに合わせて調整
  pg.textAlign(CENTER, CENTER);
  pg.text("A", width / 2, height / 2+20);
  
  // 3. 裏紙のピクセルをロード
  pg.loadPixels();
  points = [];
  
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
        points.push(createVector(x, y));
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
  background(120); // 背景色

  fill("#ffff00");
  //noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  text('キャンバスを縦横無尽に移動する複数の見えないエージェントが、Aのパーティクルに影響を与えるような表現にして。エージェントが近づくと周辺のパーティクルが大きく膨らみ、通り過ぎると元のサイズに戻るようにして。', 5, 5);
  
  // 動き回る点を更新
  for (let i = 0; i < agents.length; i++) {
    let agent = agents[i];
    
    // 位置を更新
    agent.x += agent.vx;
    agent.y += agent.vy;
    
    // 画面端で跳ね返る
    if (agent.x < 0 || agent.x > width) {
      agent.vx *= -1;
      agent.x = constrain(agent.x, 0, width);
    }
    if (agent.y < 0 || agent.y > height) {
      agent.vy *= -1;
      agent.y = constrain(agent.y, 0, height);
    }
  }
  
  fill(255);
  strokeWeight(1);
  //noStroke();
  
  // 点を描画（動く点との距離に応じてサイズを変更）
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    
    // すべての動く点との距離を計算し、最小距離を取得
    let minDistance = Infinity;
    for (let j = 0; j < agents.length; j++) {
      let agent = agents[j];
      let distance = dist(pt.x, pt.y, agent.x, agent.y);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    
    // 距離に応じてサイズを計算（近いほど大きく、遠いほど小さく）
    // 距離が0の場合は最大サイズ、maxDistance以上の場合は最小サイズ
    let normalizedDistance = constrain(minDistance / maxDistance, 0, 1);
    let size = map(normalizedDistance, 0, 1, maxSize, minSize);
    
    ellipse(pt.x, pt.y, size, size);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // サイズが変わったら、裏紙を作り直して再サンプリング
  sampleText();
}