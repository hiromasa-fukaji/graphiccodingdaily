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
let bounds;

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
    sampleFactor: 0.032,
    simplifyThreshold: 0
  });


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
  background("#bdbdbd");


  
  fill("#ffff00");
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  text('点を丸ではなく、aからzのランダムなアルファベットに置き換えて。文字の集合体で大きな文字を作って。', 5, 5);
  

  fill(255);
  stroke("#00aeff");
  strokeWeight(3);
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;

  push();
  translate(centerX, centerY);

  textAlign(CENTER, CENTER);

  textFont(myFont);
  textSize(70); // 小さな文字のサイズ
  // 各点ごとにランダムな文字（a〜z）を表示
  // 文字の更新を2フレームごとに制限
  if (typeof window.randChars === 'undefined' || frameCount % 10 === 0) {
    window.randChars = [];
    for (let i = 0; i < points.length; i++) {
      let randCharCode = 97 + floor(random(26));
      window.randChars[i] = String.fromCharCode(randCharCode);
    }
  }
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    text(window.randChars[i], pt.x, pt.y);
  }
  pop();

  

}