let font;
let textPoints = [];
let curves = [];
let numCurves = 1000;
let noiseScale = 0.00;
let noiseStrength = 2;

function preload() {
  font = loadFont('IBMPlexMono-Regular.ttf');
}

function setup() {
  let c = createCanvas(210 * 2.5, 297 * 2.5);
  c.style('display', 'block');
  centerCanvas(c);
  
  background("#000000ff");
  textFont(font);
  
  // テキスト「A」のポイントを取得
  let fontSize = 500;
  textSize(fontSize);
  
  // バウンディングボックスを取得して中央配置の座標を計算
  let bounds = font.textBounds('a', 0, 0, fontSize);
  let x = width / 2 - bounds.w / 2;
  let y = height / 2 - bounds.h / 2 - bounds.y;
  
  textPoints = font.textToPoints('a', x, y, fontSize, {
    sampleFactor: 0.5, // 線の密度（粗めで軽量）
    simplifyThreshold: 0.01
  });
  
  // カーブを初期化（テキストポイントからランダムに開始点を選択）
  for (let i = 0; i < numCurves; i++) {
    if (textPoints.length > 0) {
      let startPoint = random(textPoints);
      curves.push({
        points: [createVector(startPoint.x, startPoint.y)],
        maxLength: random(100, 100), // 線を長く
        finished: false
      });
    }
  }
}

function draw() {
  background("#6a3636ff");
  
  // カーブを成長させる
  for (let i = 0; i < 2; i++) {
    for (let curve of curves) {
      if (!curve.finished && curve.points.length < curve.maxLength) {
        let lastPoint = curve.points[curve.points.length - 1];
        let angle = noise(lastPoint.x * noiseScale, lastPoint.y * noiseScale, frameCount * 0.1) * TWO_PI * 0.1;
        let nextX = lastPoint.x + cos(angle) * noiseStrength;
        let nextY = lastPoint.y + sin(angle) * noiseStrength;
        
        if (isInsideText(nextX, nextY)) {
          curve.points.push(createVector(nextX, nextY));
        } else {
          curve.finished = true;
        }
      }
    }
  }
  
  // カーブを描画
  for (let curve of curves) {
    if (curve.points.length >= 2) {
      drawCurve(curve);
    }
  }
}

function drawCurve(curve) {
  noFill();
  strokeWeight(1.5);
  
  beginShape();
  for (let i = 0; i < curve.points.length; i++) {
    let p = curve.points[i];
    let t = i / curve.points.length;
    let from = color(0, 255, 255, 255); // 不透明度255
    let to = color(180, 0, 255, 255);  // 不透明度255
    let col = lerpColor(from, to, t);
    stroke(col);
    
    curveVertex(p.x, p.y);
    if (i === 0) curveVertex(p.x, p.y);
    if (i === curve.points.length - 1) curveVertex(p.x, p.y);
  }
  endShape();
}

function isInsideText(x, y) {
  let threshold = 10;
  for (let p of textPoints) {
    let d = dist(x, y, p.x, p.y);
    if (d < threshold) {
      return true;
    }
  }
  return false;
}

function centerCanvas(c) {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  c.position(x, y);
}

function windowResized() {
  centerCanvas(select('canvas'));
}

function mousePressed() {
  curves = [];
  for (let i = 0; i < numCurves; i++) {
    if (textPoints.length > 0) {
      let startPoint = random(textPoints);
      curves.push({
        points: [createVector(startPoint.x, startPoint.y)],
        maxLength: random(150, 400),
        finished: false
      });
    }
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('vector_field_typography_012', 'png');
  }
}
