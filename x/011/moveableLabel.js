// moveableLabel.js
// 右下に「001」をroboto regularで配置・ドラッグ移動＆位置保存

let moveLabelFont = null;

// デフォルト位置（localStorageの現在の値を設定）
const moveLabelDefaultX = 374.6;
const moveLabelDefaultY = 716.5013458950199;

let moveLabelObj = {
  text: '002',
  baseX: null,
  baseY: null,
  curX: null,
  curY: null,
  fontSize: 80,
  dragging: false,
  dragOffsetX: 0,
  dragOffsetY: 0,
};

function preloadMoveableLabel() {
  if (!moveLabelFont) {
    moveLabelFont = loadFont('Roboto-Regular.ttf'); // ← Regularに変更
  }
}

function initMoveableLabel() {
  preloadMoveableLabel();
  textSize(moveLabelObj.fontSize);
  // フォント指定忘れず！
  textFont(moveLabelFont);

  let w = textWidth(moveLabelObj.text);
  let x = width - w - 32;
  let y = height - 24;

  // デフォルト位置が設定されている場合はそれを使用
  if(moveLabelDefaultX !== null && moveLabelDefaultY !== null) {
    moveLabelObj.baseX = moveLabelDefaultX;
    moveLabelObj.baseY = moveLabelDefaultY;
    moveLabelObj.curX = moveLabelDefaultX;
    moveLabelObj.curY = moveLabelDefaultY;
  } else {
    // デフォルト位置が設定されていない場合のみ、計算して使用
    moveLabelObj.baseX = x;
    moveLabelObj.baseY = y;
    moveLabelObj.curX = x;
    moveLabelObj.curY = y;
  }
  moveLabelObj.dragging = false;
}

function drawMoveableLabel() {
  if (!moveLabelFont) return;
  textSize(moveLabelObj.fontSize);
  textFont(moveLabelFont);
  fill(textColor);
  noStroke();
  text(moveLabelObj.text, moveLabelObj.curX, moveLabelObj.curY);
}

function mousePressedMoveableLabel() {
  textSize(moveLabelObj.fontSize);
  // Regularフォントをしっかり適用
  textFont(moveLabelFont);
  let w = textWidth(moveLabelObj.text);
  let h = moveLabelObj.fontSize;
  let x1 = moveLabelObj.curX,
      x2 = moveLabelObj.curX + w,
      y1 = moveLabelObj.curY - h,
      y2 = moveLabelObj.curY + h*0.2;
  if(mouseX >= x1 && mouseX <= x2 && mouseY >= y1 && mouseY <= y2) {
    moveLabelObj.dragging = true;
    moveLabelObj.dragOffsetX = mouseX - moveLabelObj.curX;
    moveLabelObj.dragOffsetY = mouseY - moveLabelObj.curY;
  }
}

function mouseDraggedMoveableLabel() {
  if(moveLabelObj.dragging) {
    moveLabelObj.curX = mouseX - moveLabelObj.dragOffsetX;
    moveLabelObj.curY = mouseY - moveLabelObj.dragOffsetY;
  }
}

function mouseReleasedMoveableLabel() {
  if(moveLabelObj.dragging) {
    moveLabelObj.baseX = moveLabelObj.curX;
    moveLabelObj.baseY = moveLabelObj.curY;
    moveLabelObj.dragging = false;
    saveMoveableLabelPos();
  }
}

function saveMoveableLabelPos() {
  localStorage.setItem('moveLabelPos', JSON.stringify({
    baseX: moveLabelObj.baseX,
    baseY: moveLabelObj.baseY
  }));
}
function loadMoveableLabelPos() {
  const saved = localStorage.getItem('moveLabelPos');
  if (saved) return JSON.parse(saved);
  return null;
}
