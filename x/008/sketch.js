// ===== パラメータ設定 =====
const PARAMS = {
    // ノイズのスケール
    noiseScale: 0.0001,
    // 時間の進行速度
    timeSpeed: 0.0001,
    // ドメインワーピングの強度
    warpStrength: 10,
    // fBmのオクターブ数
    octaves: 3,
    // グレインノイズの強度
    grainIntensity: 0.01,
};

let theShader;

function preload() {
    // シェーダーファイルの読み込み
    theShader = loadShader('shader.vert', 'shader.frag');
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    noStroke();
    pixelDensity(1); // パフォーマンス最適化
}

function draw() {
    // シェーダーを適用
    shader(theShader);
    
    // Uniformsの設定
    theShader.setUniform('u_resolution', [width, height]);
    theShader.setUniform('u_time', millis() / 1000.0 * PARAMS.timeSpeed);
    theShader.setUniform('u_noiseScale', PARAMS.noiseScale);
    theShader.setUniform('u_warpStrength', PARAMS.warpStrength);
    theShader.setUniform('u_octaves', PARAMS.octaves);
    theShader.setUniform('u_grainIntensity', PARAMS.grainIntensity);
    
    // フルスクリーン四角形を描画
    rect(-width/2, -height/2, width, height);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}