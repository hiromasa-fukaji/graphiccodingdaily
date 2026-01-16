// Swarm Typography: VIBE
// p5.js sketch
let font;
let canvas;
let particles = [];
let points = [];
let sizeSlider;
let finalCircleSize = 8;
let colorPicker;
let particleColor = '#ffffff';
let bgColorPicker;
let canvasBgColor = '#141414';
let saveBtn;
let bg;
let sampleSlider;
let finalSampleFactor = 0.1;
let uiVisible = true;
let toggleUIBtn;

function preload() {
  font = loadFont('IBMPlexMono-Regular.ttf');
  bg = loadImage('bg.png');
}

function setup() {
          // UI表示切替ボタン
          toggleUIBtn = createButton('UIを隠す');
          toggleUIBtn.position(20, 220);
          toggleUIBtn.mousePressed(() => {
            uiVisible = !uiVisible;
            sizeSlider.style('display', uiVisible ? 'block' : 'none');
            sampleSlider.style('display', uiVisible ? 'block' : 'none');
            colorPicker.style('display', uiVisible ? 'block' : 'none');
            bgColorPicker.style('display', uiVisible ? 'block' : 'none');
            saveBtn.style('display', uiVisible ? 'block' : 'none');
            toggleUIBtn.style('display', uiVisible ? 'block' : 'none');
            // 再表示時のみボタンのテキストを戻す
            if (uiVisible) toggleUIBtn.html('UIを隠す');
          });
        // 保存ボタン
        saveBtn = createButton('画像を保存');
        saveBtn.position(20, 180);
        saveBtn.mousePressed(() => {
          saveCanvas(canvas, 'canvas_image', 'png');
        });
      // キャンバス背景色カラーピッカー
      let savedBgColor = localStorage.getItem('canvasBgColor');
      canvasBgColor = savedBgColor ? savedBgColor : '#141414';
      bgColorPicker = createColorPicker(canvasBgColor);
      bgColorPicker.position(20, 140);
      bgColorPicker.input(() => {
        canvasBgColor = bgColorPicker.value();
        localStorage.setItem('canvasBgColor', canvasBgColor);
      });
    // パーティクル色カラーピッカー
    let savedColor = localStorage.getItem('particleColor');
    particleColor = savedColor ? savedColor : '#ffffff';
    colorPicker = createColorPicker(particleColor);
    colorPicker.position(20, 100);
    colorPicker.input(() => {
      particleColor = colorPicker.value();
      localStorage.setItem('particleColor', particleColor);
    });
  canvas = createCanvas(210*2.5, 297*2.5);
  centerCanvas();
  canvas.style('display', 'block');
  // 円サイズ調整スライダー
  let savedSize = localStorage.getItem('circleSize');
  finalCircleSize = savedSize ? parseInt(savedSize) : 8;
  sizeSlider = createSlider(2, 40, finalCircleSize, 1);
  sizeSlider.position(20, 20);
  sizeSlider.style('width', '200px');
  sizeSlider.input(() => {});
  sizeSlider.changed(() => {
    finalCircleSize = sizeSlider.value();
    localStorage.setItem('circleSize', finalCircleSize);
  });

  // sampleFactor調整スライダー
  let savedSample = localStorage.getItem('sampleFactor');
  finalSampleFactor = savedSample ? parseFloat(savedSample) : 0.1;
  sampleSlider = createSlider(0.02, 0.3, finalSampleFactor, 0.01);
  sampleSlider.position(20, 60);
  sampleSlider.style('width', '200px');
  sampleSlider.input(() => {});
  sampleSlider.changed(() => {
    finalSampleFactor = sampleSlider.value();
    localStorage.setItem('sampleFactor', finalSampleFactor);
    location.reload(); // サンプル間隔は再生成が必要なのでリロード
  });
  function windowResized() {
    centerCanvas();
  }

  function centerCanvas() {
    // ウインドウ中央にcanvasを配置
    let x = (windowWidth - width) / 2;
    let y = (windowHeight - height) / 2;
    canvas.position(x, y);
  }
  // bodyのマージンを除去（p5.jsの外部CSS対策）
  document.body.style.margin = '0';
  background(20);
  textFont(font);
  
  let txt = 'g\nra\nco'; // 改行対応: 'G\nRA\nCO' のように \n で改行可能
  let fontSize = 490;
  textSize(fontSize);
  
  // 改行で分割
  let lines = txt.split('\n');
  let lineGap = fontSize * -0.16; // 行間
  
  // 各行のバウンディングボックス取得
  let bboxes = lines.map((line) => font.textBounds(line, 0, 0, fontSize));
  
  // 全体の高さ計算
  let totalHeight = bboxes.reduce((sum, b) => sum + b.h, 0) + lineGap * (lines.length - 1);
  
  // デバッグ: バウンディングボックスの値を確認
  console.log('Canvas size:', width, 'x', height);
  console.log('Lines:', lines);
  console.log('Bboxes:', bboxes);
  
  // 各行の左端（G, R, Cなど）が揃うように配置
  points = [];
  // 全体の最小xを基準に中央配置
  let minX = Math.min(...bboxes.map(b => b.x));
  let maxRight = Math.max(...bboxes.map(b => b.x + b.w));
  let blockWidth = maxRight - minX;
  let baseX = width / 2 - blockWidth / 2 - minX + 25; // 全体を右に80px移動
    let yCursor = height / 2 - totalHeight / 2 - 3; // 全体を3px上に移動
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let bbox = bboxes[i];
    let x = baseX;
    let y = yCursor - bbox.y;
    // 1文字ずつ分解してchar情報を付与
    let charX = x;
    for (let c = 0; c < line.length; c++) {
      let ch = line[c];
      let charBounds = font.textBounds(ch, 0, 0, fontSize);
      let pts = font.textToPoints(ch, charX, y, fontSize, {
        sampleFactor: finalSampleFactor,
        simplifyThreshold: 0
      });
      // 文字ごとに個別オフセット
      let xOffset = 0;
      if (ch.toLowerCase() === 'o') xOffset = 40;
      if (ch.toLowerCase() === 'a') xOffset = 20;
      pts = pts.map(pt => ({
        x: pt.x + xOffset + random(-1, 1),
        y: pt.y + random(-1, 1),
        char: ch
      }));
      points.push(...pts);
      charX += charBounds.w; // カーニング調整は省略
    }
    yCursor += bbox.h + lineGap;
  }
  
  // Create a particle for each point
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let p = new Particle(random(width), random(height), pt.x, pt.y, pt.char);
    particles.push(p);
  }

}

function draw() {
  background(canvasBgColor);
  for (let p of particles) {
    p.arrive();
    p.update();
    p.show();
  }
  if (bg) {
    image(bg, 0, 0, width, height);
  }
}

class Particle {
  constructor(x, y, tx, ty, char) {
    this.pos = createVector(x, y);
    this.target = createVector(tx, ty);
    this.vel = p5.Vector.random2D();
    this.acc = createVector();
    this.r = 10;
    this.maxSpeed = 10;
    this.maxForce = 0.22;
    this.char = char;
  }

  arrive() {
    let desired = p5.Vector.sub(this.target, this.pos);
    let d = desired.mag();
    let speed = this.maxSpeed;
    if (d < 200) {
      speed = map(d, 0, 200, 0, this.maxSpeed);
    }
    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }

  applyForce(f) {
    this.acc.add(f);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  show() {
    noStroke();
    // rとoだけ色を変える
    if (this.char && (this.char.toLowerCase() === 'r' || this.char.toLowerCase() === 'o')) {
      fill('#00ff73ff');
    } else {
      fill(particleColor);
    }
    let r = finalCircleSize;
    ellipse(this.pos.x, this.pos.y, r, r);
  }
}
