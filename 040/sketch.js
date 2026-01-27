/*
 * CONTEXT: p5.js Creative Coding
 * GOAL: Perfect Pixel Sampling with createGraphics
 */

let points = [];
let samplingStep = 30; // ドットの粗さ
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
  pg.textFont('Helveticaneue-bold, sans-serif'); 
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
  background(0); // 背景を黒に変更（色収差効果が見やすくなる）

  fill("#ffff00");
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  text('描画モードをADDにして、パーティクルをRGBの3成分に分解して。それぞれの描画位置をずらし、ズレる方向を120度ずつ等間隔に保ったまま、時間経過でぐるぐると回転させて。', 5, 5);
  
  noStroke();
  
  // 色収差効果：RGB各成分をずらして描画
  // ずらす量を設定
  let offset = 9; // ずらすピクセル数
  
  // 時間経過に応じて角度を回転させる
  // 回転速度を調整（値が大きいほど速く回る）
  let rotationSpeed = 0.05;
  let baseAngle = frameCount * rotationSpeed;
  
  // RGBの各成分をループで描画
  // 各色を120度ずつずらして配置（0度、120度、240度）
  let colors = [
    { r: 255, g: 0, b: 0, angleOffset: 0 },      // 赤：0度
    { r: 0, g: 255, b: 0, angleOffset: TWO_PI / 3 }, // 緑：120度
    { r: 0, g: 0, b: 255, angleOffset: TWO_PI * 2 / 3 } // 青：240度
  ];
  
  // ブレンドモードを加算に設定（色が重なって白くなる）
  blendMode(ADD);
  
  for (let c = 0; c < colors.length; c++) {
    let colorInfo = colors[c];
    
    // 各色の角度を計算（ベース角度 + 色固有のオフセット）
    let angle = baseAngle + colorInfo.angleOffset;
    
    // 角度からX、Yオフセットを計算
    let offsetX = cos(angle) * offset;
    let offsetY = sin(angle) * offset;
    
    fill(colorInfo.r, colorInfo.g, colorInfo.b);
    
    // 点を描画（各色で座標をずらす）
    for (let i = 0; i < points.length; i++) {
      let pt = points[i];
      ellipse(
        pt.x + offsetX, 
        pt.y + offsetY, 
        samplingStep * 0.8, 
        samplingStep * 0.8
      );
    }
  }
  
  // ブレンドモードをリセット
  blendMode(BLEND);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // サイズが変わったら、裏紙を作り直して再サンプリング
  sampleText();
}