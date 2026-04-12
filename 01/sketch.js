let myFont;
let points = [];
let bounds;

function preload() {
  // フォントを読み込む
  myFont = loadFont('CormorantGaramond-Bold.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let txt = "A";
  let fontSize = 500;

  bounds = myFont.textBounds(txt, 0, 0, fontSize);

  points = myFont.textToPoints(txt, 0, 0, fontSize, {
    sampleFactor: 0.5,
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
  background(255);

    // コメントを画面上部に表示
  fill("#000000");
  textAlign(LEFT, TOP);
  textSize(12);
  text('textToPointsで取得した文字のアウトライン頂点にノイズをかけてウネウネと動くアニメーションを作って', 5, 5);

  fill(0);
  noStroke();
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;

  push();
  translate(centerX, centerY);

  // for (let i = 0; i < points.length; i++) {
  //   const pt = points[i];
  //   //rect(pt.x, pt.y, 10, 10);
  // }

  // 隣接点間の距離が大きく跳んだら別の輪郭とみなしてグループ化
  let contours = [];
  let threshold = 50; // この距離以上離れたら新しい輪郭
  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    if (i === 0) {
      contours.push([p]);
    } else {
      let prev = points[i - 1];
      let d = dist(prev.x, prev.y, p.x, p.y);
      if (d > threshold) {
        contours.push([]);
      }
      contours[contours.length - 1].push(p);
    }
  }

  // 各輪郭を独立して描画
  for (let contour of contours) {
    beginShape();
    for (let p of contour) {
      let nx = noise(p.x * 0.1, p.y * 0.1, frameCount * 0.01) * 100 - 100 / 2;
      let ny = noise(p.y * 0.1, p.x * 0.1, frameCount * 0.01) * 100 - 100 / 2;
      vertex(p.x + nx, p.y + ny);
    }
    endShape(CLOSE);
  }
  pop();


}
