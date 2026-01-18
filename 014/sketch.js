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
  let fontSize = 500;

  bounds = myFont.textBounds(txt, 0, 0, fontSize);

  points = myFont.textToPoints(txt, 0, 0, fontSize, {
    sampleFactor: 0.5,
    simplifyThreshold: 0
  });


  // 画像書き出しボタンを作成
  let imgBtn = createButton('画像で書き出し');
  imgBtn.position(20, 20);
  imgBtn.mousePressed(exportImage);
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

  fill(255);
  noStroke();
  let centerX = (width - bounds.w) / 2 - bounds.x;
  let centerY = (height - bounds.h) / 2 - bounds.y;

  push();
  translate(centerX, centerY);

  // for (let i = 0; i < points.length; i++) {
  //   const pt = points[i];
  //   //rect(pt.x, pt.y, 10, 10);
  // }

  beginShape();
  for (let p of points) {
    let nx = noise(p.x * 0.1, p.y * 0.1, frameCount * 0.01) * 100-100/2;
    let ny = noise(p.y * 0.1, p.x * 0.1, frameCount * 0.01) * 100-100/2;

    // 3. ノイズを加えた座標に線を引く
    vertex(p.x + nx, p.y + ny);
  }
  endShape();
  pop();
  

}


// function draw() {
//   background(120);

//   textFont('helvetica');
//   textSize(500);
//   fill(255);
//   textAlign(CENTER, CENTER);
//   text('A', width / 2, height / 2);

// }

// // SVG書き出し関数
// function exportSVG() {
//   // SVGの内容を手動で生成
//   const w = windowWidth;
//   const h = windowHeight;
//   const fontSize = 500;
//   const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">\n  <rect width="100%" height="100%" fill="rgb(120,120,120)"/>\n  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="helvetica" font-size="${fontSize}" fill="white">A</text>\n</svg>`;
//   const blob = new Blob([svg], {type: 'image/svg+xml'});
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = 'A.svg';
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
// }

