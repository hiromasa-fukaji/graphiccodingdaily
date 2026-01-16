// floatText.js
// 右下 "flowfield" 文字の配置・描画・ドラッグ制御のみ

const floatText = 'flowfield';
const floatTextNum = floatText.length;
const floatTextSize = 24;
const floatTextMargin = 0;
const floatTextSpacing = 0; // 文字間
const floatTextYRange = 2; // 揺れ幅

// デフォルト位置（localStorageの現在の値を設定）
const floatTextDefaultPositions = [
  {"baseX":338.4000000000001,"baseY":631.0633119515586},
  {"baseX":354.80000000000007,"baseY":622.4898849924423},
  {"baseX":367.2000000000001,"baseY":623.0525936458109},
  {"baseX":384.60000000000014,"baseY":613.1645641221681},
  {"baseX":367.0000000000001,"baseY":679.4290519016968},
  {"baseX":387.4000000000001,"baseY":669.1932491362442},
  {"baseX":400.80000000000007,"baseY":673.4564196591081},
  {"baseX":427.20000000000005,"baseY":663.649512741951},
  {"baseX":439.6,"baseY":667.348636119177}
];

let floatTextPhases = [];
let floatCharObjs = [];
let floatTextDraggingIdx = -1; // 今ドラッグ中の文字番号
let floatTextDragOffset = {x: 0, y: 0};

// フォント用変数を用意
globalThis.interFontBold = null;

function preloadFloatTextFont() {
  // sketch.jsでpreloadされていなければ、ここでloadFontも可
  if(!globalThis.interFontBold) {
    try {
      globalThis.interFontBold = loadFont('Inter_18pt-Bold.ttf');
    } catch (e) {
      globalThis.interFontBold = null;
    }
  }
}

function saveFloatTextState() {
  localStorage.setItem('floatTextPositions', JSON.stringify(floatCharObjs.map(obj => ({baseX: obj.baseX, baseY: obj.baseY}))));
}

function loadFloatTextState() {
  const saved = localStorage.getItem('floatTextPositions');
  if(saved) {
    const arr = JSON.parse(saved);
    if(arr.length === floatCharObjs.length) {
      for(let i=0;i<arr.length;i++) {
        floatCharObjs[i].baseX = arr[i].baseX;
        floatCharObjs[i].baseY = arr[i].baseY;
        floatCharObjs[i].curX = arr[i].baseX;
        floatCharObjs[i].curY = arr[i].baseY;
      }
    }
  }
}

function initFloatText() {
  preloadFloatTextFont(); // Regularの読み込みをここでもCall
  floatTextPhases = [];
  floatCharObjs = [];
  textSize(floatTextSize);
  
  // デフォルト位置が設定されている場合はそれを使用
  if(floatTextDefaultPositions && floatTextDefaultPositions.length === floatTextNum) {
    for(let i=0; i<floatTextNum; i++){
      let phase = random(TWO_PI);
      floatTextPhases.push(phase);
      floatCharObjs.push({
        char: floatText[i],
        baseX: floatTextDefaultPositions[i].baseX,
        baseY: floatTextDefaultPositions[i].baseY,
        curX: floatTextDefaultPositions[i].baseX,
        curY: floatTextDefaultPositions[i].baseY,
        phase: phase
      });
    }
    return; // デフォルト位置を使用したので終了
  }
  
  // デフォルト位置が設定されていない場合のみ、計算して使用
  // （ローカルストレージからの読み込みは行わない）
  
  // 保存された位置がない場合のみデフォルト位置を計算
  let totalW = 0;
  for(let i=0; i<floatTextNum; i++){
    let w = textWidth(floatText[i]);
    totalW += (i!==0 ? floatTextSpacing : 0) + w;
  }
  let startX = width - totalW - floatTextMargin;
  let accX = startX;
  for(let i=0; i<floatTextNum; i++){
    let phase = random(TWO_PI);
    floatTextPhases.push(phase);
    floatCharObjs.push({
      char: floatText[i],
      baseX: accX,
      baseY: height - floatTextMargin,
      curX: accX,
      curY: height - floatTextMargin,
      phase: phase
    });
    accX += textWidth(floatText[i]) + floatTextSpacing;
  }
}

function drawFloatText() {
  textSize(floatTextSize);
  // IBMPlexMono-Regular.ttfを指定：ファイルからロードしたfont変数を使う
  if(globalThis.interFontBold) {
    textFont(globalThis.interFontBold);
  }
  fill(lineColor);
  noStroke(); // ★ 縁（ストローク）を消す
  for(let i=0; i<floatTextNum; i++){
    let obj = floatCharObjs[i];
    // ドラッグ中ならcurX/curY、それ以外はsin揺れ
    if(floatTextDraggingIdx === i) {
      text(obj.char, obj.curX, obj.curY);
    } else {
      let y = obj.baseY + Math.sin(obj.phase + frameCount * 0.04 + i) * floatTextYRange;
      obj.curY = y;
      obj.curX = obj.baseX;
      text(obj.char, obj.baseX, y);
    }
  }
}

function mousePressedFloatText() {
  textSize(floatTextSize);
  for(let i=floatTextNum-1; i>=0; i--){
    let obj = floatCharObjs[i];
    let w = textWidth(obj.char);
    let x1 = obj.curX, x2 = obj.curX + w, y1 = obj.curY - floatTextSize, y2 = obj.curY + floatTextSize*0.2;
    if(mouseX >= x1 && mouseX <= x2 && mouseY >= y1 && mouseY <= y2){
      floatTextDraggingIdx = i;
      floatTextDragOffset.x = mouseX - obj.curX;
      floatTextDragOffset.y = mouseY - obj.curY;
      break;
    }
  }
}

function mouseDraggedFloatText() {
  if(floatTextDraggingIdx >= 0) {
    let obj = floatCharObjs[floatTextDraggingIdx];
    obj.curX = mouseX - floatTextDragOffset.x;
    obj.curY = mouseY - floatTextDragOffset.y;
  }
}

function mouseReleasedFloatText() {
  if(floatTextDraggingIdx >= 0){
    let obj = floatCharObjs[floatTextDraggingIdx];
    obj.baseX = obj.curX;
    obj.baseY = obj.curY;
    floatTextDraggingIdx = -1;
    saveFloatTextState(); // ★ 追加：位置保存
  }
}
