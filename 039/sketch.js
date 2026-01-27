/*
 * CONTEXT: p5.js Creative Coding
 * GOAL: Perfect Pixel Sampling with createGraphics
 */

let points = [];
let samplingStep =4; // ドットの粗さ
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
  pg.textFont('Helveticaneue-Light, sans-serif'); 
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
        // ランダムなZ深度（0〜1）。Zが大きいほど手前。
        let z = random(0.0, 1.0);

        // Zに応じてサイズを変化（手前ほど大きい）
        let size = samplingStep * map(z, 0, 1, 3, 6);

        // Zに応じて移動速度を変化（手前ほど速い）
        let baseSpeed = map(z, 0, 1, 0.2, 0.4);
        let angle = random(TWO_PI);
        let vx = cos(angle) * baseSpeed;
        let vy = sin(angle) * baseSpeed;

        // Zに応じて色を変化（奥ほど暗く、手前ほど明るい）
        // 近景カラー: 明るい黄色, 遠景カラー: 暗いグレー寄りの黄色
        let nearCol = color(255, 255, 0);
        let farCol = color(60, 60, 20);
        let col = lerpColor(farCol, nearCol, z);

        points.push({
          pos: createVector(x, y),
          z: z,
          size: size,
          vx: vx,
          vy: vy,
          col: col
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
  background(0); // 背景色

  fill("#ffff00");
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  text('パーティクルごとにランダムなZ深度を設定し、手前にある（Zが大きい）パーティクルほど大きく、速く動くようにして。奥にあるパーティクルは色を暗くして。', 5, 5);
  
  noStroke();

  // Zが小さいもの（奥）から大きいもの（手前）へソートして描画順を制御
  points.sort((a, b) => a.z - b.z);

  // 点を描画（パーティクルにパララックスを適用）
  for (let i = 0; i < points.length; i++) {
    let p = points[i];

    // 位置を更新（手前ほど速く動く）
    p.pos.x += p.vx;
    p.pos.y += p.vy;

    // // 画面外に出たら反対側から出てくるようにラップ
    // if (p.pos.x < 0) p.pos.x += width;
    // if (p.pos.x > width) p.pos.x -= width;
    // if (p.pos.y < 0) p.pos.y += height;
    // if (p.pos.y > height) p.pos.y -= height;

    // Z深度に応じた色（奥ほど暗く、手前ほど明るい）
    fill(p.col);

    // Z深度に応じたサイズ（手前ほど大きい）
    ellipse(p.pos.x, p.pos.y, p.size, p.size);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // サイズが変わったら、裏紙を作り直して再サンプリング
  sampleText();
}