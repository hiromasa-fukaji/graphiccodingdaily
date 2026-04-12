let system;

// --- 波紋エフェクトのパラメータ（logo用） ---
let rippleSpeed = 0.2;       // 波紋が広がるスピード
let rippleSpacing = 26;      // 線と線の間隔
let rippleLineWeight = 1;    // 白い線の太さ
let numRings = 6;           // 波紋のリング数

// --- 波紋エフェクトのパラメータ（logo2用） ---
let rippleSpacing2 = 26;     // 線と線の間隔
let rippleLineWeight2 = 0.9;   // 白い線の太さ
let numRings2 = 5;          // 波紋のリング数

// --- 波紋塗り色ピッカー用 ---
let ripplePane;
let rippleParams = { fillColor: '#000000' };
let rippleFillInput;
let lastSelectedLogoEl = null;

// --- 波紋塗り色の永続化 ---
function saveRippleFillColors() {
  const data = {};
  system.elements.forEach((el, i) => {
    if (el.tag === 'logo' && el._rippleFillColor) {
      data[i] = el._rippleFillColor;
    }
  });
  localStorage.setItem('rippleFillColors', JSON.stringify(data));
}

function loadRippleFillColors() {
  try {
    const raw = localStorage.getItem('rippleFillColors');
    if (!raw) return;
    const data = JSON.parse(raw);
    Object.keys(data).forEach(key => {
      const idx = parseInt(key);
      if (system.elements[idx] && system.elements[idx].tag === 'logo') {
        system.elements[idx]._rippleFillColor = data[idx];
      }
    });
  } catch (e) {
    console.warn('Failed to load ripple fill colors:', e);
  }
}

function setup() {
  // キャンバスのサイズ
  let c = createCanvas(210 * 3, 297 * 3);
  // キャンバスのIDを設定
  c.id('main-canvas');
  background(0);

  // デザインツール化ライブラリの読み込み
  system = new DesignSystem();
  // ファイルドロップのイベントハンドラを設定
  c.drop((file) => system.handleFileDrop(file, mouseX, mouseY));

  // --- 波紋の塗り色ピッカーUI ---
  ripplePane = new Tweakpane.Pane({
    title: 'Ripple Fill',
    container: document.body,
  });
  ripplePane.element.style.position = 'fixed';
  ripplePane.element.style.top = '8px';
  ripplePane.element.style.right = '300px';
  ripplePane.element.style.width = '200px';
  ripplePane.element.style.zIndex = '1000';

  rippleFillInput = ripplePane.addInput(rippleParams, 'fillColor', {
    label: 'Fill Color',
  });

  rippleFillInput.on('change', (ev) => {
    if (lastSelectedLogoEl) {
      lastSelectedLogoEl._rippleFillColor = ev.value;
      saveRippleFillColors();
    }
  });

  // DesignSystemのロード完了後に塗り色を復元
  setTimeout(() => loadRippleFillColors(), 0);

  // 初期状態では非表示
  ripplePane.element.style.display = 'none';
}

function draw() {
  // デザインツールの描画
  system.render();

  // --- 選択中のlogo要素を検出してピッカーを表示/非表示 ---
  const selectedLogo = system.elements.find(
    el => el.isSelected && el.tag === 'logo'
  );

  if (selectedLogo) {
    // 選択中のlogo要素が変わったらピッカーを更新
    if (lastSelectedLogoEl !== selectedLogo) {
      lastSelectedLogoEl = selectedLogo;
      // 要素に保存された塗り色があればそれを使用、なければ背景色をデフォルトに
      rippleParams.fillColor = selectedLogo._rippleFillColor || system.backgroundColor;
      ripplePane.refresh();
    }
    ripplePane.element.style.display = '';
  } else {
    if (lastSelectedLogoEl) {
      lastSelectedLogoEl = null;
    }
    ripplePane.element.style.display = 'none';
  }

  // --- 波紋エフェクト: "logo" タグに適用 ---
  system.drawInside('logo', (ctx) => {
    const el = ctx.element;

    // ★ 要素個別の塗り色を使用（未設定なら背景色をフォールバック）
    const fillHex = el._rippleFillColor || system.backgroundColor;
    const [bgR, bgG, bgB] = el._getRGBFromHex(fillHex);
    // ★ テキストカラーを線の色として使用（UIのカラーピッカーに連動）
    const [lineR, lineG, lineB] = el._getRGBFromHex(el.color);

    // アニメーション: 等高線が3→numRingsまで増えてループ
    const minRings = 5;
    const growRange = (numRings - minRings) * rippleSpacing;
    const currentMaxW = minRings * rippleSpacing + (frameCount * rippleSpeed) % growRange;

    // テキスト描画の基本設定
    textAlign(CENTER, CENTER);
    textFont(el.font);
    textSize(el.fontSize);

    // 外側（成長中の最外リング）から内側に向かって描画
    for (let w = currentMaxW; w >= 0; w -= rippleSpacing) {
      const currentW = w;

      // 1. 線（等高線）を描画（UIのテキストカラー）
      stroke(lineR, lineG, lineB);
      strokeWeight(currentW);
      strokeJoin(MITER);
      fill(bgR, bgG, bgB);
      text(el.text, 0, 0);

      // 2. 塗り色のマスク（線の内側を塗りつぶし、線幅だけ残す）
      const maskW = currentW - rippleLineWeight * 2;
      if (maskW > 0) {
        stroke(bgR, bgG, bgB);
        strokeWeight(maskW);
        fill(bgR, bgG, bgB);
        text(el.text, 0, 0);
      }
    }

    // Show Originalがオンの場合のみ、中心のベーステキストを描画
    if (el.visible !== false) {
      stroke(lineR, lineG, lineB);
      strokeWeight(rippleLineWeight);
      fill(bgR, bgG, bgB);
      text(el.text, 0, 0);
    }
  });

  // --- 波紋エフェクト: "logo2" タグに適用（個別パラメータ） ---
  system.drawInside('logo2', (ctx) => {
    const el = ctx.element;

    const fillHex = el._rippleFillColor || system.backgroundColor;
    const [bgR, bgG, bgB] = el._getRGBFromHex(fillHex);
    const [lineR, lineG, lineB] = el._getRGBFromHex(el.color);

    const minRings2 = 4;
    const growRange2 = (numRings2 - minRings2) * rippleSpacing2;
    const currentMaxW = minRings2 * rippleSpacing2 + (frameCount * rippleSpeed) % growRange2;

    textAlign(CENTER, CENTER);
    textFont(el.font);
    textSize(el.fontSize);

    for (let w = currentMaxW; w >= 0; w -= rippleSpacing2) {
      const currentW = w;

      stroke(lineR, lineG, lineB);
      strokeWeight(currentW);
      strokeJoin(MITER);
      fill(bgR, bgG, bgB);
      text(el.text, 0, 0);

      const maskW = currentW - rippleLineWeight2 * 2;
      if (maskW > 0) {
        stroke(bgR, bgG, bgB);
        strokeWeight(maskW);
        fill(bgR, bgG, bgB);
        text(el.text, 0, 0);
      }
    }

    if (el.visible !== false) {
      stroke(lineR, lineG, lineB);
      strokeWeight(rippleLineWeight2);
      fill(bgR, bgG, bgB);
      text(el.text, 0, 0);
    }
  });

  // --- タグなしテキスト等を最前面に再描画 ---
  for (let el of system.elements) {
    if (el.tag !== 'logo' && el.tag !== 'logo2') {
      el.display();
    }
  }
}
