let aWarpSlider;
let sliders = {};
// 画像のアルファ値からバウンディングボックスを検出し、中央・最大サイズで描画
function drawMaskAtoCenter(g, img) {
  g.clear();
  // 一時キャンバスで画像を取得
  let temp = createImage(img.width, img.height);
  temp.copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
  temp.loadPixels();
  let minX = img.width, minY = img.height, maxX = 0, maxY = 0;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let idx = 4 * (y * img.width + x);
      if (temp.pixels[idx + 3] > 16) { // アルファ閾値
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  let bw = maxX - minX + 1;
  let bh = maxY - minY + 1;
  if (bw <= 0 || bh <= 0) return; // 何も検出されなければ終了
  // 描画サイズ計算（アスペクト比維持で最大化）
  let canvasAspect = g.width / g.height;
  let boxAspect = bw / bh;
  let drawW, drawH;
  if (boxAspect > canvasAspect) {
    drawW = g.width;
    drawH = g.width / boxAspect;
  } else {
    drawH = g.height;
    drawW = g.height * boxAspect;
  }
  let cx = (g.width - drawW) / 2;
  let cy = (g.height - drawH) / 2;
  g.image(img, cx, cy, drawW, drawH, minX, minY, bw, bh);
}
// SVGをアスペクト比を維持して中央に最大サイズで描画
function drawMaskToCenter(g, img) {
  g.clear();
  let svgAspect = img.width / img.height;
  let canvasAspect = g.width / g.height;
  let drawW, drawH;
  if (svgAspect > canvasAspect) {
    drawW = g.width;
    drawH = g.width / svgAspect;
  } else {
    drawH = g.height;
    drawW = g.height * svgAspect;
  }
  let cx = (g.width - drawW) / 2;
  let cy = (g.height - drawH) / 2;
  g.image(img, cx, cy, drawW, drawH);
}
// --- パラメータ調整用 ---
const PARAMS = {
  noiseScale: 2.5,        // ノイズのスケール
  fbmOctaves: 5,         // fBmのオクターブ数
  fbmGain: 0.5,          // fBmのゲイン
  fbmLacunarity: 2.0,    // fBmのラキュナリティ
  warpStrength: 1.2,     // ドメインワーピングの強さ
  colorSpeed: 0.08,      // 色変化の速度
  grainStrength: 0       // グレインノイズの強さ
};


let theShader;
let maskImg;
let maskG;

function preload() {
  theShader = loadShader('shader.vert', 'shader.frag');
  maskImg = loadImage('a.svg'); // SVGを画像として読み込む
}

function setup() {
      // A部分用ワーピング強度スライダー
      aWarpSlider = createSlider(0, 5, 2.0, 0.01).position(10, 220).style('width', '200px');
    // パラメータ用スライダーを作成
    sliders.noiseScale = createSlider(0.1, 10, PARAMS.noiseScale, 0.01).position(10, 10).style('width', '200px');
    createSpan('ノイズスケール').position(220, 10);
    sliders.fbmOctaves = createSlider(1, 8, PARAMS.fbmOctaves, 1).position(10, 40).style('width', '200px');
    createSpan('fBmオクターブ数').position(220, 40);
    sliders.fbmGain = createSlider(0.1, 1, PARAMS.fbmGain, 0.01).position(10, 70).style('width', '200px');
    createSpan('fBmゲイン').position(220, 70);
    sliders.fbmLacunarity = createSlider(1, 4, PARAMS.fbmLacunarity, 0.01).position(10, 100).style('width', '200px');
    createSpan('fBmラキュナリティ').position(220, 100);
    sliders.warpStrength = createSlider(0, 3, PARAMS.warpStrength, 0.01).position(10, 130).style('width', '200px');
    createSpan('ドメインワーピング強さ').position(220, 130);
    sliders.colorSpeed = createSlider(0, 0.3, PARAMS.colorSpeed, 0.001).position(10, 160).style('width', '200px');
    createSpan('色変化速度').position(220, 160);
    sliders.grainStrength = createSlider(0, 0.3, PARAMS.grainStrength, 0.001).position(10, 190).style('width', '200px');
    createSpan('グレインノイズ強さ').position(220, 190);
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  noStroke();
  // マスク用グラフィックを作成し、Aを中央に描画
  maskG = createGraphics(width, height);
  drawMaskAtoCenter(maskG, maskImg);
  ortho(); // 正射影カメラでplaneが全体を覆う
  shader(theShader);
}

function draw() {
      let aWarpStrength = aWarpSlider.value();
    // スライダー値をPARAMSに反映
    PARAMS.noiseScale = sliders.noiseScale.value();
    PARAMS.fbmOctaves = sliders.fbmOctaves.value();
    PARAMS.fbmGain = sliders.fbmGain.value();
    PARAMS.fbmLacunarity = sliders.fbmLacunarity.value();
    PARAMS.warpStrength = sliders.warpStrength.value();
    PARAMS.colorSpeed = sliders.colorSpeed.value();
    PARAMS.grainStrength = sliders.grainStrength.value();
  theShader.setUniform('u_resolution', [windowWidth, windowHeight]);
  theShader.setUniform('u_mask', maskG);
  theShader.setUniform('u_time', millis() * 0.001);
  theShader.setUniform('u_noiseScale', PARAMS.noiseScale);
  theShader.setUniform('u_fbmOctaves', PARAMS.fbmOctaves);
  theShader.setUniform('u_fbmGain', PARAMS.fbmGain);
  theShader.setUniform('u_fbmLacunarity', PARAMS.fbmLacunarity);
  theShader.setUniform('u_warpStrength', PARAMS.warpStrength);
  theShader.setUniform('u_colorSpeed', PARAMS.colorSpeed);
  theShader.setUniform('u_grainStrength', PARAMS.grainStrength);
  theShader.setUniform('u_aWarpStrength', aWarpStrength);
  plane(windowWidth, windowHeight, 100, 100);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ortho(); // リサイズ時もカメラを再設定
  // マスク用グラフィックもリサイズ・再描画
  maskG = createGraphics(windowWidth, windowHeight);
  drawMaskAtoCenter(maskG, maskImg);
  shader(theShader);
}
