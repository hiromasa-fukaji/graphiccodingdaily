/*
 * CONTEXT: p5.js Creative Coding
 * GOAL: Perfect Pixel Sampling with createGraphics
 * Embroidery Art Style - 刺繍風アート
 */

let points = [];
let samplingStep = 40; // ドットの粗さ
let pg; // 裏紙（グラフィックバッファ）用の変数
let connections = []; // パーティクル間の接続情報
let maxConnectionDistance = 60; // 接続する最大距離
let threadColors = []; // 糸の色配列

function setup() {
  createCanvas(windowWidth, windowHeight);
  // メインキャンバスの pixelDensity は制限しません（高画質のまま）

  // // 画像書き出しボタン
  // let imgBtn = createButton('画像で書き出し');
  // imgBtn.position(20, 20);
  // imgBtn.mousePressed(exportImage);

  // 糸の色を初期化（刺繍らしい色合い）
  initializeThreadColors();

  // 最初に一度サンプリングを実行
  sampleText();
  
  // 接続を計算
  calculateConnections();
}

function initializeThreadColors() {
  // 刺繍らしい色のパレット
  threadColors = [
    color(200, 50, 50),   // 赤
    color(50, 150, 200),  // 青
    // color(200, 150, 50),  // オレンジ
    // color(150, 200, 100), // 緑
    // color(200, 100, 200), // ピンク
    // color(100, 200, 200), // シアン
    // color(255, 200, 100), // 黄色
    // color(150, 100, 200), // 紫
  ];
}

function sampleText() {
  // 1. 画面と同じサイズの「裏紙」を作る（必要なときだけ作成／作り直し）
  if (!pg || pg.width !== width || pg.height !== height) {
    pg = createGraphics(width, height);
    // ★重要: 裏紙だけ解像度を「1」に固定する
    // これにより、Retina画面でも計算が「y * width + x」だけで済みます
    pg.pixelDensity(1);
  }
  
  // 2. 裏紙に文字を描く（pg. をつける）
  pg.clear();
  pg.background(0);
  pg.fill(255);
  pg.noStroke();
  pg.textFont('Helveticaneue-bold, sans-serif'); 
  pg.textStyle(NORMAL);

  // ★ sin を使って文字サイズをアニメーションさせる
  //   min(width, height) * 1 をベースに、少し大きくなったり小さくなったり
  let t = millis() * 0.001;          // 経過時間（秒）
  let osc = (sin(t * 2.0) + 1) / 2;  // 0〜1 を往復
  let scale = 0.8 + osc * 0.6;       // 0.8〜1.2 倍の間を往復
  pg.textSize(min(width, height) * scale); // ここがアニメーションする

  pg.textAlign(CENTER, CENTER);
  pg.text("A", width / 2, height / 2+40);
  
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

function calculateConnections() {
  connections = [];
  
  // 各パーティクルから近接するパーティクルを検出
  // 重複を避けるため、i < j の条件で接続を記録
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      let dist = p5.Vector.dist(points[i], points[j]);
      if (dist < maxConnectionDistance) {
        connections.push({
          from: i,
          to: j,
          distance: dist
        });
      }
    }
  }
}

// 手書き風の揺らぎのある線を描画（刺繍風）
function drawEmbroideryThread(x1, y1, x2, y2, threadColor) {
  let segments = max(15, floor(p5.Vector.dist(createVector(x1, y1), createVector(x2, y2)) / 3)); // 距離に応じてセグメント数を調整
  let noiseScale = 0.03; // ノイズのスケール
  let noiseStrength = 2.5; // 揺らぎの強さ
  
  push();
  stroke(threadColor);
  strokeWeight(1.5);
  noFill();
  
  // 線の方向ベクトルを計算
  let dx = x2 - x1;
  let dy = y2 - y1;
  let perpX = -dy;
  let perpY = dx;
  let perpLen = sqrt(perpX * perpX + perpY * perpY);
  if (perpLen > 0) {
    perpX /= perpLen;
    perpY /= perpLen;
  }
  
  beginShape();
  for (let i = 0; i <= segments; i++) {
    let t = i / segments;
    let x = lerp(x1, x2, t);
    let y = lerp(y1, y2, t);
    
    // パーリンノイズで手書き風の揺らぎを追加
    // 時間軸を使わず、位置ベースのノイズで安定した揺らぎを生成
    let noiseVal1 = noise(x * noiseScale, y * noiseScale) - 0.5;
    let noiseVal2 = noise(x * noiseScale + 1000, y * noiseScale + 1000) - 0.5;
    
    // 線の垂直方向に揺らぎを追加
    x += perpX * noiseVal1 * noiseStrength;
    y += perpY * noiseVal2 * noiseStrength;
    
    // さらに細かい揺らぎを追加（手書き風の微細な揺らぎ）
    let fineNoise = (noise(x * 0.5, y * 0.5) - 0.5) * 1.5;
    x += perpX * fineNoise;
    y += perpY * fineNoise;
    
    vertex(x, y);
  }
  endShape();
  
  pop();
}

function exportImage() {
  saveCanvas('image', 'png');
}

function draw() {
  // テキストサイズのアニメーションに合わせて
  // 毎フレームサンプリングと接続の再計算を行う
  sampleText();
  calculateConnections();

  background(220); // 刺繍布のような背景色（ベージュ系）

  fill("#ffff00");
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  text('パーティクルとパーティクルの間を手書き風の線で結び、刺繍のように表現して。文字のサイズをsin波でゆっくりと伸縮させて。', 5, 5);
  
  // 刺繍風の糸で接続を描画
  for (let i = 0; i < connections.length; i++) {
    let conn = connections[i];
    let p1 = points[conn.from];
    let p2 = points[conn.to];
    
    // 距離と位置に基づいて色を選択（糸の色を変化させる）
    let colorIndex = floor((conn.distance / maxConnectionDistance + 
                           (p1.x + p1.y) * 0.001) * threadColors.length) % threadColors.length;
    let threadColor = threadColors[colorIndex];
    
    // 手書き風の揺らぎのある線を描画
    drawEmbroideryThread(p1.x, p1.y, p2.x, p2.y, threadColor);
  }
  
  // パーティクル（刺繍の結び目）を描画
  fill(255); // 糸の結び目らしい色
  // stroke(150, 140, 130);
  // strokeWeight(0.5);
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    // 小さな円で結び目を表現
    ellipse(pt.x, pt.y, samplingStep * 0.25, samplingStep * 0.25);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // サイズが変わったら、裏紙を作り直して再サンプリング
  sampleText();
  // 接続を再計算
  calculateConnections();
}