/*
 * CONTEXT: p5.js Creative Coding
 * GOAL: Create generative art using textToPoints
 * RULES:
 * 1. Use global variables declared at the top.
 * 2. Do NOT redeclare variables inside draw() (e.g., let points = ...).
 * 3. Keep the code simple and readable for students.
 * 4. Use vector math (p5.Vector) for physics.
 */



let myFont;

let pointsArr = []; // 各文字の点配列
let boundsArr = []; // 各文字のバウンディングボックス
let morphPoints = [];
let morphAmt = 0;
let morphDir = 1; // 使わないが互換のため残す
let pauseFrames = 0; // 静止用カウンタ
const PAUSE_DURATION = 30; // 静止フレーム数（約0.5秒）
let morphFrom = 0;
let morphTo = 1;
const chars = ["A", "B", "C","D","E"];


function preload() {
  // フォントを読み込む
  myFont = loadFont('IBMPlexMono-Regular.ttf');
}


function setup() {
  createCanvas(windowWidth, windowHeight);

  let fontSize = 1000;
  // 文字ごとに点配列とバウンディングボックスを取得
  let maxLen = 0;
  for (let i = 0; i < chars.length; i++) {
    let bounds = myFont.textBounds(chars[i], 0, 0, fontSize);
    let pts = myFont.textToPoints(chars[i], 0, 0, fontSize, {
      sampleFactor: 0.05,
      simplifyThreshold: 0
    });
    boundsArr.push(bounds);
    pointsArr.push(pts);
    if (pts.length > maxLen) maxLen = pts.length;
  }
  // 各点配列の長さを揃える
  for (let i = 0; i < pointsArr.length; i++) {
    pointsArr[i] = equalizePoints(pointsArr[i], maxLen);
  }
  // morphPoints初期化
  for (let i = 0; i < maxLen; i++) {
    morphPoints[i] = createVector(pointsArr[0][i].x, pointsArr[0][i].y);
  }

  // // 画像書き出しボタンを作成
  // let imgBtn = createButton('画像で書き出し');
  // imgBtn.position(20, 20);
  // imgBtn.mousePressed(exportImage);
}

// 配列長を揃える関数
function equalizePoints(arr, targetLen) {
  let res = [];
  for (let i = 0; i < targetLen; i++) {
    let idx = floor(map(i, 0, targetLen, 0, arr.length));
    res.push(arr[idx]);
  }
  return res;
}
// 画像書き出し関数
function exportImage() {
  saveCanvas('A_image', 'png');
}

function windowResized() {
  // ウィンドウがリサイズされたら、キャンバスの大きさも再設定する
  resizeCanvas(windowWidth, windowHeight);
}


function draw() {
  background(120);

  fill("#ffff00");
  textAlign(LEFT, TOP);
  textSize(12);
  text('A→B→C→D→Eの輪郭点をそれぞれ取得し、配列の長さを揃えてから、lerpを使って形状を行き来するモーフィングアニメーションを作って。', 5, 5);

  // 補間率を更新
  if (pauseFrames > 0) {
    pauseFrames--;
  } else {
    morphAmt += 0.01;
    if (morphAmt >= 1) {
      morphAmt = 1;
      pauseFrames = PAUSE_DURATION;
      // 次のペアへ
      morphFrom = morphTo;
      morphTo = (morphTo + 1) % chars.length;
      // morphAmtを0にリセットして次のモーフィングへ
      morphAmt = 0;
    }
  }

  // 中心位置を計算（from/toの中心を補間）
  let boundsFrom = boundsArr[morphFrom];
  let boundsTo = boundsArr[morphTo];
  let centerXA = (width - boundsFrom.w) / 2 - boundsFrom.x;
  let centerYA = (height - boundsFrom.h) / 2 - boundsFrom.y;
  let centerXB = (width - boundsTo.w) / 2 - boundsTo.x;
  let centerYB = (height - boundsTo.h) / 2 - boundsTo.y;
  let centerX = lerp(centerXA, centerXB, morphAmt);
  let centerY = lerp(centerYA, centerYB, morphAmt);

  // 各点を補間
  let ptsFrom = pointsArr[morphFrom];
  let ptsTo = pointsArr[morphTo];
  for (let i = 0; i < morphPoints.length; i++) {
    let ax = ptsFrom[i].x;
    let ay = ptsFrom[i].y;
    let bx = ptsTo[i].x;
    let by = ptsTo[i].y;
    morphPoints[i].x = lerp(ax, bx, morphAmt);
    morphPoints[i].y = lerp(ay, by, morphAmt);
  }

  fill(255);
  //noStroke();
  push();
  translate(centerX, centerY);
  for (let i = 0; i < morphPoints.length; i++) {
    let pt = morphPoints[i];
    ellipse(pt.x, pt.y, 15, 15);
  }
  pop();
}