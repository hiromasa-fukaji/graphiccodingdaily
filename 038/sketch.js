/*
 * CONTEXT: p5.js Creative Coding
 * GOAL: Perfect Pixel Sampling with createGraphics
 */

let points = [];
let samplingStep = 15; // ドットの粗さ
let pg; // 裏紙（グラフィックバッファ）用の変数

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
  pg.textFont('HelveticaNeue-Bold, sans-serif'); 
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
        // パーティクルとして登録（位置＋寿命情報）
        let life = random(60, 240); // 各パーティクルの寿命（フレーム数）
        points.push({
          x: x,
          y: y,
          life: life,                 // 寿命
          age: random(0, life)        // 進行度をランダムにずらしておく
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
  background(60); // 背景色

  fill("#ffff00");
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  text('パーティクルに寿命を持たせて、ランダムなタイミングで消えては、また元の位置にふわっと現れるようにして。儚い光の点滅のように', 5, 5);
  
  noStroke();
  
  // パーティクルを描画
  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    
    // 寿命の進行
    p.age++;
    if (p.age >= p.life) {
      // 寿命が尽きたら、また同じ位置で生まれ変わる
      p.life = random(200, 400);
      p.age = 0;
    }

    // 0 → 1 で一生分の進行度
    let t = p.age / p.life;

    // 前半でフェードイン、後半でフェードアウトする三角波的なアルファ
    let alpha;
    if (t < 0.5) {
      alpha = map(t, 0, 0.5, 0, 255);
    } else {
      alpha = map(t, 0.5, 1, 255, 0);
    }

    // 儚い光っぽい色と大きさ（アルファに応じてサイズも少し変える）
    let size = samplingStep * map(alpha, 0, 255, 0, 1.5);
    fill(255, 255, 255, alpha);
    ellipse(p.x, p.y, size, size);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // サイズが変わったら、裏紙を作り直して再サンプリング
  sampleText();
}