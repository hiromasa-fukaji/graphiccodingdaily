// グリッチタイポグラフィ（スリットスキャン方式）
// p5.jsスケッチ

let buffer;
const textStr = "ABC";
const fontSize = 300;
const sliceHeight = 20; // スライスの高さ

function setup() {
  createCanvas(windowWidth, windowHeight);
  buffer = createGraphics(width, height);
  buffer.background(0);
  buffer.textAlign(CENTER, CENTER);
  buffer.textSize(fontSize);
  buffer.textStyle(BOLD);
  buffer.fill('#FFD700');
  buffer.noStroke();
  // サンセリフ体（なければデフォルト）
  buffer.textFont('Arial Black, Arial, sans-serif');
  buffer.text(textStr, width / 2, height / 2);
}

function draw() {
  background(0);
  for (let y = 0; y < height; y += sliceHeight) {
    // サイン波による横ずらし
    let wave = sin(y * 0.05 + frameCount * 0.1) * 20;
    // グリッチ: たまに大きくずらす
    let glitch = 0;
    if (random() < 0.00) {
      glitch = random(-60, 60) * noise(y * 0.1, frameCount * 0.01);
    }
    let offsetX = wave + glitch;
    // スライスをコピー
    copy(
      buffer,
      0, y, width, sliceHeight, // src
      offsetX, y, width, sliceHeight // dst
    );
  }
}
