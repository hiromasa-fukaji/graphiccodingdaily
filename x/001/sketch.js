// --- パラメータ調整 ---
let WAVE_STRENGTH = 0.00; // 波の強さ
let GLITCH_AMOUNT = 0.03; // グリッチのずれ幅
let GLITCH_BLOCKS = 300.0; // グリッチの細かさ
let NOISE_STRENGTH = 0.0; // ノイズの強さ
let ANIMATION_SPEED = 2; // アニメーション速度
let TRAIL_OFFSET = 0.0; // RGBシフトのずらし量
let FONT_SIZE = 300;
let TEXT_STRING = "ABC";

let pg, shaderObj;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  pg = createGraphics(width, height);
  pg.pixelDensity(1);
  pg.background(0);
  // システムフォント（ゴシック体）を指定。'Helvetica'がなければ'Arial'が使われます。
  pg.textFont('Helvetica, Arial');
  pg.textSize(FONT_SIZE);
  pg.textAlign(CENTER, CENTER);
  shaderObj = createShader(vertShader, fragShader);
}

function draw() {
  // オフスクリーンにテキスト描画
  pg.background(0);
  pg.fill(255);
  pg.text(TEXT_STRING, pg.width/2, pg.height/2);

  // シェーダーにパラメータ渡す
  shader(shaderObj);
  shaderObj.setUniform('u_tex', pg);
  shaderObj.setUniform('u_resolution', [width, height]);
  shaderObj.setUniform('u_time', millis() * 0.001 * ANIMATION_SPEED);
  shaderObj.setUniform('u_waveStrength', WAVE_STRENGTH);
  shaderObj.setUniform('u_glitchAmount', GLITCH_AMOUNT);
  shaderObj.setUniform('u_glitchBlocks', GLITCH_BLOCKS);
  shaderObj.setUniform('u_noiseStrength', NOISE_STRENGTH);
  shaderObj.setUniform('u_trailOffset', TRAIL_OFFSET);

  rect(-width/2, -height/2, width, height);
}

// --- 頂点シェーダ ---
const vertShader = `
#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

// p5.jsから渡される標準的なユニフォーム変数
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

void main() {
  vTexCoord = aTexCoord;
  // モデルビュー・プロジェクション行列を適用して座標を変換
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}`;

// --- フラグメントシェーダ ---
const fragShader = `
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_waveStrength;
uniform float u_glitchAmount;
uniform float u_glitchBlocks;
uniform float u_noiseStrength;
uniform float u_trailOffset;
varying vec2 vTexCoord;

// 2Dパーリンノイズ
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// 歪み適用
vec2 distort(vec2 uv, float t, float offset) {
  // 波動
  float wave = sin(uv.y * 8.0 + t*1.2) * u_waveStrength;
  // グリッチスライス
  float block = floor(uv.y * u_glitchBlocks);
  float glitch = sin(block*2.0 + t*1.0 + offset*10.0) * u_glitchAmount;
  // ノイズ
  float n = (noise(uv*6.0 + t*0.7 + offset*5.0) - 0.5) * 2.0 * u_noiseStrength;
  uv.x += wave + glitch + n;
  return uv;
}

void main() {
  vec2 uv = vTexCoord;
  // RGBシフト
  vec3 col = vec3(0.0);
  for(int i=0; i<3; i++) {
    float o = float(i-1) * u_trailOffset;
    vec2 duv = distort(uv + vec2(o,0.0), u_time, o);
    vec3 tex = texture2D(u_tex, duv).rgb;
    float lum = tex.r; // 白黒なのでrでOK
    vec3 yellow = mix(vec3(0.0), vec3(1.0,0.9,0.0), lum);
    col[i] = yellow[i];
  }
  gl_FragColor = vec4(col, 1.0);
}`;

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pg.resizeCanvas(width, height);
}
