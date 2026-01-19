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
let points = [];
let movingPoints = [];
let bounds;
let beatActive = false;
let beatInterval = 60; // フレーム数（鼓動の周期）

function preload() {
  // フォントを読み込む
  myFont = loadFont('IBMPlexMono-Regular.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let txt = "A";
  let fontSize = 1000;

  bounds = myFont.textBounds(txt, 0, 0, fontSize);

  points = myFont.textToPoints(txt, 0, 0, fontSize, {
    sampleFactor: 0.05,
    simplifyThreshold: 0
  });

  // 各点に「目標位置」と「現在位置」を持たせる
  movingPoints = [];
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    movingPoints.push({
      target: createVector(pt.x, pt.y),
      pos: createVector(pt.x, pt.y)
    });
  }


  // // 画像書き出しボタンを作成
  // let imgBtn = createButton('画像で書き出し');
  // imgBtn.position(20, 20);
  // imgBtn.mousePressed(exportImage);
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
  // 心臓の鼓動のようなON/OFF
  if (frameCount % (beatInterval * 0.5) < beatInterval / 20) {
    beatActive = true;
  } else {
    beatActive = false;
  }
  background(120);

  fill("#ffff00");
  textAlign(LEFT, TOP);
  textSize(12);
  text('心臓の鼓動のように定期的に点がランダムに弾け飛び、その後lerpを使って滑らかに元の形に戻るアニメーションを作って。', 5, 5);

  fill(255);
  //noStroke();
  strokeWeight(1.5);
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;

  push();
  translate(centerX, centerY);
  for (let i = 0; i < movingPoints.length; i++) {
    let pt = movingPoints[i];
    // 鼓動中はランダム方向に発散
    if (beatActive) {
      let angle = random(TWO_PI);
      let mag = random(10, 50);
      let offset = p5.Vector.fromAngle(angle).mult(mag);
      pt.pos.add(offset);
    } else {
      // 離すとlerpで目標位置に戻る
      pt.pos.lerp(pt.target, 0.15);
    }
    ellipse(pt.pos.x, pt.pos.y, 25, 25);
  }
  pop();

  

}