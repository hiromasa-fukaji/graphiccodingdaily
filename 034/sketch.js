/*
 * CONTEXT: p5.js Creative Coding
 * GOAL: Perfect Pixel Sampling with createGraphics
 */

let points = [];
let samplingStep = 2; // ドットの粗さ
let pg; // 裏紙（グラフィックバッファ）用の変数

// グリッチエフェクト用の変数
let glitchActive = false;
let glitchedIndices = []; // グリッチが発生しているパーティクルのインデックス
let glitchOffsets = []; // 各パーティクルのグリッチオフセット
let normalFrameRate = 10; // 通常のフレームレート

function setup() {
  createCanvas(windowWidth, windowHeight);
  // メインキャンバスの pixelDensity は制限しません（高画質のまま）

  // 通常のフレームレートを設定
  normalFrameRate = 60;
  frameRate(normalFrameRate);

  // // 画像書き出しボタン
  // let imgBtn = createButton('画像で書き出し');
  // imgBtn.position(20, 20);
  // imgBtn.mousePressed(exportImage);

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
  pg.textFont('Helvetica Neue, sans-serif'); 
  pg.textStyle(NORMAL);
  pg.textSize(min(width, height) * 0.9); // 画面サイズに合わせて調整
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
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  text('ランダムなタイミングで一部のパーティクルの座標が一瞬だけ激しくズレる接触不良のモニターのような「グリッチエフェクト」を追加してください', 5, 5);
  
  fill(255);
  noStroke();
  
  // グリッチエフェクトの処理
  if (random(100) < 20) {
    glitchActive = true;
    glitchedIndices = [];
    glitchOffsets = [];
    
    // グリッチ発生時にフレームレートを下げて静止感を出す
    frameRate(8); // 一時的にフレームレートを下げる
    
    // パーティクルの10-20%をランダムに選んでグリッチを適用
    let glitchCount = floor(random(points.length * 0.1, points.length * 0.2));
    for (let i = 0; i < glitchCount; i++) {
      let randomIndex = floor(random(points.length));
      if (!glitchedIndices.includes(randomIndex)) {
        glitchedIndices.push(randomIndex);
        // 激しくズレるオフセット（画面サイズの5-15%程度）
        let offsetX = random(-width * 0.1, width * 0.1);
        let offsetY = random(-height * 0.1, height * 0.1);
        glitchOffsets.push({x: offsetX, y: offsetY});
      }
    }
  } else {
    // グリッチが発生していない場合は、前のフレームのグリッチをリセット
    if (glitchActive) {
      glitchActive = false;
      glitchedIndices = [];
      glitchOffsets = [];
      // フレームレートを元に戻す
      frameRate(normalFrameRate);
    }
  }
  
  // 点を描画
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let drawX = pt.x;
    let drawY = pt.y;
    
    // グリッチが発生しているパーティクルの場合は座標をズラす
    if (glitchActive && glitchedIndices.includes(i)) {
      let glitchIndex = glitchedIndices.indexOf(i);
      drawX = pt.x + glitchOffsets[glitchIndex].x;
      drawY = pt.y + glitchOffsets[glitchIndex].y;
    }
    
    ellipse(drawX, drawY, samplingStep * 1, samplingStep * 1);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // サイズが変わったら、裏紙を作り直して再サンプリング
  sampleText();
}