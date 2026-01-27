let system;

function setup() {
  // キャンバスのサイズ
  let c = createCanvas(210*3, 297*3);
  // キャンバスのIDを設定
  c.id('main-canvas');
  background(0);

  // デザインツール化ライブラリの読み込み
  system = new DesignSystem();
  // ファイルドロップのイベントハンドラを設定
  c.drop((file) => system.handleFileDrop(file, mouseX, mouseY));
}

function draw() {
 // プログラムを書き込む場所





  // デザインツールの描画
  system.render();
}
