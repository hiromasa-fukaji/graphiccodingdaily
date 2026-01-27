/*
 * CONTEXT: p5.js Creative Coding
 * GOAL: Perfect Pixel Sampling with createGraphics
 */

let points = [];
let samplingStep = 28; // ドットの粗さ
let pg; // 裏紙（グラフィックバッファ）用の変数
let hueSpeed = 1; // 色相回転の速さ（大きいほど速く変化）

function setup() {
  createCanvas(windowWidth, windowHeight);
  // メインキャンバスの pixelDensity は制限しません（高画質のまま）

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
  // 背景を黒にして光が映えるように
  background(0);

  // テキスト表示用に一旦 RGB にしてから描画
  colorMode(RGB, 255);

  fill("#ffff00");
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  text('HSBモードを使い、各パーティクルの色をノイズで座標と時間を色相にマッピングして、色がなめらかにうねりながら変化する虹色のグラデーションを表示して。', 5, 5);
  
  // 点描画は HSB で色相を時間とともに回転させる
  colorMode(HSB, 360, 100, 100, 1);
  noStroke();

  // 時間に応じたベース色相
  let baseHue = (frameCount * hueSpeed) % 360;

  // 点を描画（ノイズを使って色順を決める）
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    // 座標 + 時間を入力にしたノイズで 0〜1 の値を取得
    let n = noise(pt.x * 0.01, pt.y * 0.01, frameCount * 0.000001);
    // ノイズ値を 0〜360 の色相にマッピング
    let hue = (baseHue + n * 360) % 360;

    // 明るさもノイズ + 時間で少し揺らす
    // let bNoise = noise(pt.x * 0.02 + 1000, pt.y * 0.02 + 1000, frameCount * 0.02);
    // let b = 70 + 30 * bNoise;
    let b = 100;

    fill(hue, 100, b);
    ellipse(pt.x, pt.y, samplingStep * 2.5, samplingStep * 2.5);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // サイズが変わったら、裏紙を作り直して再サンプリング
  sampleText();
}