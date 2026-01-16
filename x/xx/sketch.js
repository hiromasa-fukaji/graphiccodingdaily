// 画像読み込み用の変数
let bg; // 背景画像
let baseImage; // 元の画像を保存
let timeOffset = 0;

function preload() {
  // 背景画像を読み込む
  bg = loadImage('bg.png');
}

function setup() {
  // A4 Ratio * 2.5
  let c = createCanvas(210 * 2.5, 297 * 2.5);
  c.style('display', 'block');
  centerCanvas(c);
  
  // --- Your Setup Code Below ---
  background(0);
  
  // 画像を描画
  if (bg) {
    // 画像をキャンバスサイズに合わせて描画
    image(bg, 0, 0, width, height);
  }
  
  // ピクセル配列を読み込んでベース画像を保存
  loadPixels();
  baseImage = new Uint8ClampedArray(pixels);
  updatePixels();
  
  console.log('Setup complete. Base image saved.');
}

function draw() {
  // ベース画像を復元
  loadPixels();
  for (let i = 0; i < baseImage.length; i++) {
    pixels[i] = baseImage[i];
  }
  
  // アニメーション用の時間変数
  timeOffset += 0.02;
  
  // ピクセルソーティングを適用
  // ランダムに行を選択してソート（確率的に）
  let sortProbability = 0.5 + sin(timeOffset) * 0.1; // 0.1〜0.7の間で変動
  
  // 各行を処理
  for (let y = 0; y < height; y++) {
    // ランダムに行を選択
    if (random() < sortProbability) {
    // 行の全ピクセルを取得
    let row = [];
    for (let x = 0; x < width; x++) {
      let index = (y * width + x) * 4;
      row.push({
        r: pixels[index],
        g: pixels[index + 1],
        b: pixels[index + 2],
        a: pixels[index + 3],
        hue: getHue(pixels[index], pixels[index + 1], pixels[index + 2])
      });
    }
    
    // 色相でソート
    row.sort((a, b) => a.hue - b.hue);
    
    // ソートしたピクセルを行に書き戻す
    for (let x = 0; x < width; x++) {
      let index = (y * width + x) * 4;
      pixels[index] = row[x].r;
      pixels[index + 1] = row[x].g;
      pixels[index + 2] = row[x].b;
      pixels[index + 3] = row[x].a;
    }
    }
  }
  
  // 一度だけupdatePixels()を呼ぶ
  updatePixels();
  
  // デバッグ情報
  if (frameCount % 60 === 0) {
    console.log('Frame:', frameCount, 'Time:', timeOffset.toFixed(2), 'Height:', height);
  }
}


// RGBから色相を取得する関数（簡略版）
function getHue(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let delta = max - min;
  
  if (delta === 0) return 0;
  
  let h = 0;
  if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }
  
  h = h * 60;
  if (h < 0) h += 360;
  
  return h;
}

// --- Helper Functions ---

function centerCanvas(c) {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  c.position(x, y);
}

function windowResized() {
  centerCanvas(select('canvas'));
}
