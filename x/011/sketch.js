let font;
let fontLoaded = false;
let points = [];
let curveStarts = [];
let noiseScale = 0.0035;
let numCurves = 800;
let curveSteps = 2;
let lineColor, textColor, bgColor;
let lineColorElm, textColorElm, bgColorElm;

let textLines = [];
let textPositions = [];

// --- ここを書き換えて好きな複数行テキスト ---
let userText = 'grap\nhic\ncodi\nng';
let txtSize = 190;
let lineSpacing = 1;
let lineOffsets = [205, 160, 155];
let lineOffsetsX = [29+5, 33+5, 32+5, 33+5];

// 見えないアトラクタ（重力点）群
let attractorPoints = [];
const attractorCount = 0; // 点の数
let attractorVelocities = [];
const maxAttractDist = 250;
const maxAttractMag = 10;

function preload() {
  font = loadFont(
    'IBMPlexMono-Bold.ttf',
    () => { fontLoaded = true; },
    () => { fontLoaded = false; }
  );
  if(typeof preloadMoveableLabel === 'function') preloadMoveableLabel();
}

function setup() {
  let c = createCanvas(210 * 2.5, 297 * 2.5);
  c.style('display', 'block');
  centerCanvas(c);

  if (fontLoaded) {
    textFont(font);
  } else {
    textFont('monospace');
    console.warn("Font loading failed. Using monospace fallback.");
  }

  background(255);
  lineColorElm = document.getElementById('lineColorPicker');
  textColorElm = document.getElementById('textColorPicker');
  bgColorElm   = document.getElementById('bgColorPicker');

  // それぞれlocalStorageから値を取得し、初期値適用
  const savedLine = localStorage.getItem('lineColorPickerValue');
  if (lineColorElm && savedLine) lineColorElm.value = savedLine;
  lineColor = color(lineColorElm.value);

  const savedText = localStorage.getItem('textColorPickerValue');
  if (textColorElm && savedText) textColorElm.value = savedText;
  textColor = color(textColorElm.value);

  const savedBg = localStorage.getItem('bgColorPickerValue');
  if (bgColorElm && savedBg) bgColorElm.value = savedBg;
  bgColor = color(bgColorElm.value);

  if (lineColorElm) {
    lineColorElm.addEventListener('input', (e) => {
      localStorage.setItem('lineColorPickerValue', e.target.value);
    });
  }
  if (textColorElm) {
    textColorElm.addEventListener('input', (e) => {
      localStorage.setItem('textColorPickerValue', e.target.value);
    });
  }
  if (bgColorElm) {
    bgColorElm.addEventListener('input', (e) => {
      localStorage.setItem('bgColorPickerValue', e.target.value);
    });
  }

  // ---- 複数行対応・均等行高（左揃え） ----
  let lines = userText.split('\n');
  textLines = lines;
  textSize(txtSize);
  let lineBounds = lines.map(line => font.textBounds(line, 0, 0, txtSize));
  let lineHeights = lineBounds.map(b => b.h);
  let maxHeight = Math.max(...lineHeights);
  let left = width * 0.075;
  let totalH = maxHeight;
  for(let i=0;i<lines.length-1;i++){
    totalH += (i<lineOffsets.length?lineOffsets[i]:maxHeight*lineSpacing);
  }
  let sy = height / 2 - totalH / 2 + maxHeight - 45;
  points = [];
  textPositions = [];
  let ty = sy;
  for (let i = 0; i < lines.length; i++) {
    let b = lineBounds[i];
    let tx = (i < lineOffsetsX.length) ? lineOffsetsX[i] - b.x : left - b.x;
    textPositions.push({x: tx, y: ty});
    let pts = font.textToPoints(lines[i], tx, ty, txtSize, {
      sampleFactor: 5,
      simplifyThreshold: 0
    });
    points.push(...pts);
    if(i<lineOffsets.length){
      ty += lineOffsets[i];
    }else{
      ty += maxHeight * lineSpacing;
    }
  }

  curveStarts = [];
  if (points.length > 0) {
    // 距離ベースの均等サンプリング
    let cumulativeDistances = [0];
    let totalDistance = 0;
    
    // 各点間の距離を累積
    for (let i = 1; i < points.length; i++) {
      let d = dist(points[i-1].x, points[i-1].y, points[i].x, points[i].y);
      totalDistance += d;
      cumulativeDistances.push(totalDistance);
    }
    
    // 最初と最後の点を閉じる（アウトラインが閉じている場合）
    let closingDist = dist(points[points.length-1].x, points[points.length-1].y, points[0].x, points[0].y);
    if (closingDist < 50) { // 50px以内なら閉じていると判断
      totalDistance += closingDist;
    }
    
    // ノイズを使ったランダムな配置で点を選択
    let pointNoiseScale = 0.15; // ノイズのスケール
    let pointNoiseRange = totalDistance * 0.0005; // ランダム化の範囲（総距離の15%）
    
    for (let i = 0; i < numCurves; i++) {
      let baseDist = (i / numCurves) * totalDistance;
      // ノイズを使ってランダムなオフセットを追加
      let noiseValue = noise(i * pointNoiseScale, 0);
      let randomOffset = map(noiseValue, 0, 1, -pointNoiseRange, pointNoiseRange);
      let targetDist = baseDist + randomOffset;
      
      // 範囲内に収める
      targetDist = constrain(targetDist, 0, totalDistance);
      
      // 二分探索で最も近い点を見つける
      let low = 0, high = cumulativeDistances.length - 1;
      let bestIdx = 0;
      let bestDist = Infinity;
      
      while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        let distDiff = Math.abs(cumulativeDistances[mid] - targetDist);
        if (distDiff < bestDist) {
          bestDist = distDiff;
          bestIdx = mid;
        }
        if (cumulativeDistances[mid] < targetDist) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      
      curveStarts.push(points[bestIdx]);
    }
  }

  // アトラクタ（見えない点）の初期化（速度も）
  attractorPoints = [];
  attractorVelocities = [];
  for(let i=0; i<attractorCount; i++){
    attractorPoints.push(createVector(random(width), random(height)));
    let a = random(TWO_PI);
    let v = p5.Vector.fromAngle(a);
    v.setMag(random(3,6));
    attractorVelocities.push(v);
  }

  // floatText（右下文字アニメ）の初期化
  if(typeof initFloatText === 'function') initFloatText();
  // moveableLabel
  if(typeof initMoveableLabel === 'function') initMoveableLabel();

  // 画像書き出しボタン連携
  setTimeout(()=> {
    const btn = document.getElementById('saveImgBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        saveCanvas('flowfield_canvas', 'png');
      });
    }
  }, 100);
}

function draw() {
  if (lineColorElm) lineColor = color(lineColorElm.value);
  if (textColorElm) textColor = color(textColorElm.value);
  if (bgColorElm)   bgColor   = color(bgColorElm.value);
  background(bgColor || color('#fff'));

  // まず「001」描画！（背面レイヤー）
  if(typeof drawMoveableLabel === 'function') drawMoveableLabel();

  // flow field本体
  fill(textColor);
  noStroke();
  textSize(txtSize);
  textFont(font);
  for (let i = 0; i < textLines.length; i++) {
    drawBoldText(textLines[i], textPositions[i].x, textPositions[i].y, 0);
  }
  for(let i=0; i<attractorCount; i++){
    attractorPoints[i].add(attractorVelocities[i]);
    if(attractorPoints[i].x < 0) {
      attractorPoints[i].x = 0;
      attractorVelocities[i].x *= -1;
    } else if(attractorPoints[i].x > width) {
      attractorPoints[i].x = width;
      attractorVelocities[i].x *= -1;
    }
    if(attractorPoints[i].y < 0) {
      attractorPoints[i].y = 0;
      attractorVelocities[i].y *= -1;
    } else if(attractorPoints[i].y > height) {
      attractorPoints[i].y = height;
      attractorVelocities[i].y *= -1;
    }
  }
  for(let i=0; i<numCurves; i++) {
    let p = createVector(curveStarts[i].x, curveStarts[i].y);
    drawNoiseCurveAnim(p, lineColor, curveSteps, frameCount * 0.0015);
  }
  // 右下floatText文字描画
  if(typeof drawFloatText === 'function') drawFloatText();
}

function mousePressed() {
  if(typeof mousePressedFloatText === 'function') mousePressedFloatText();
  if(typeof mousePressedMoveableLabel === 'function') mousePressedMoveableLabel();
}

function mouseDragged() {
  if(typeof mouseDraggedFloatText === 'function') mouseDraggedFloatText();
  if(typeof mouseDraggedMoveableLabel === 'function') mouseDraggedMoveableLabel();
}

function mouseReleased() {
  if(typeof mouseReleasedFloatText === 'function') mouseReleasedFloatText();
  if(typeof mouseReleasedMoveableLabel === 'function') mouseReleasedMoveableLabel();
}

function drawNoiseCurveAnim(start, col, steps, t) {
  let pos = start.copy();
  stroke(col);
  strokeWeight(6.5);
  strokeCap(SQUARE);
  noFill();
  beginShape();
  for(let j=0; j<steps; j++) {
    vertex(pos.x, pos.y);
    let n = noise((pos.x + t * 1000) * noiseScale, pos.y * noiseScale);
    let angle = TAU * n;
    let v = p5.Vector.fromAngle(angle);
    let mag = map(n, 0, 1, -2, 30);
    for(let i=0; i<attractorPoints.length; i++) {
      let attractor = attractorPoints[i];
      let d = dist(pos.x, pos.y, attractor.x, attractor.y);
      if(d < maxAttractDist) {
        let effect = map(d, 0, maxAttractDist, maxAttractMag, 0);
        mag += effect;
      }
    }
    v.setMag(mag);
    pos.add(v);
  }
  endShape();
}

function drawBoldText(str, x, y, weight) {
  weight = (typeof weight === 'number') ? weight : 2;
  for (let dx = -weight; dx <= weight; dx++) {
    for (let dy = -weight; dy <= weight; dy++) {
      text(str, x + dx * 0.5, y + dy * 0.5);
    }
  }
}

function centerCanvas(c) {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  c.position(x, y);
}

function windowResized() {
  centerCanvas(select('canvas'));
}
