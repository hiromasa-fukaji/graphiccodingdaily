const magnet = 0.06; // 磁力（元の位置に戻る力）
const repelRadius = 10; // 反発半径（ローカル座標系でのサイズ感に合わせて調整）
let invisiblePoints = []; // 赤い円（障害物）
let pstep = 2.5;
let rradius = 30;
let rnum = 10;
let rspeed = 2;
let pradius = 2.5;
let system;
let attractorPicker;
let attractorColor;
let strokePicker;
let strokeColor;

// 表示する文字の候補
const chars = "gc";

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

  // 目に見えない点（赤い円）を初期化
  // ここでは空にしておき、draw内で時間差で追加する
  invisiblePoints = [];

  // --- アトラクター文字のカラーピッカー ---
  let savedAttractorColor = localStorage.getItem('attractorColor');
  if (savedAttractorColor) {
    attractorColor = color(savedAttractorColor);
  } else {
    attractorColor = color(0, 255, 0);
  }

  attractorPicker = createColorPicker(attractorColor);
  attractorPicker.position(10, 10);
  attractorPicker.style('width', '50px');
  attractorPicker.input(() => {
    attractorColor = attractorPicker.color();
    localStorage.setItem('attractorColor', attractorPicker.value());
  });

  // --- パーティクル枠線のカラーピッカー ---
  let savedStrokeColor = localStorage.getItem('particleStrokeColor');
  if (savedStrokeColor) {
    strokeColor = color(savedStrokeColor);
  } else {
    strokeColor = color(0, 0, 255); // デフォルト青
  }

  strokePicker = createColorPicker(strokeColor);
  strokePicker.position(70, 10); // 横に並べる
  strokePicker.style('width', '50px');
  strokePicker.input(() => {
    strokeColor = strokePicker.color();
    localStorage.setItem('particleStrokeColor', strokePicker.value());
  });
}

function draw() {
  // --- 1. Outside: 全体の環境 ---
  //background(17);

  // 数秒後（2秒 = 120フレーム）に一度に全部出現
  if (frameCount === 60 && invisiblePoints.length === 0) {
    for (let i = 0; i < rnum; i++) {
      // gとcが半分ずつになるように割り当て
      const char = (i % 2 === 0) ? 'g' : 'c';

      invisiblePoints.push({
        pos: createVector(random(width), random(height)),
        vel: p5.Vector.random2D().mult(random(rspeed, rspeed)),
        angle: random(TWO_PI),
        angleVel: random(0.04, 0.04), // 回転速度
        char: char // 文字を保持
      });
    }
  }

  // 赤い円の衝突判定と反射（Outsideでの物理演算）
  for (let i = 0; i < invisiblePoints.length; i++) {
    let ptA = invisiblePoints[i];
    ptA.pos.add(ptA.vel);

    // 壁での反射
    if (ptA.pos.x < 0 || ptA.pos.x > width) ptA.vel.x *= -1;
    if (ptA.pos.y < 0 || ptA.pos.y > height) ptA.vel.y *= -1;

    // 円同士の衝突
    for (let j = i + 1; j < invisiblePoints.length; j++) {
      let ptB = invisiblePoints[j];
      let distAB = p5.Vector.dist(ptA.pos, ptB.pos);
      let r = rradius / 2; // 半径
      if (distAB < r * 2) {
        // 速度ベクトルを入れ替えて反射
        let temp = ptA.vel.copy();
        ptA.vel = ptB.vel.copy();
        ptB.vel = temp;
        // 衝突後、重なりを解消
        let overlap = r * 2 - distAB;
        let dir = p5.Vector.sub(ptA.pos, ptB.pos).normalize();
        ptA.pos.add(dir.mult(overlap / 2));
        ptB.pos.sub(dir.mult(overlap / 2));
      }
    }
  }

  // --- 2. System: 基本レンダリング ---
  system.render();

  // --- 3. Inside: 個別の作り込み（パーティクル） ---
  system.drawInside('logo', (ctx) => {
    // A. データの初期化（変更検知付き）
    if (!ctx.state.init || ctx.elementChanged()) {
      let points = [];
      const step = pstep; // パーティクルの間隔

      // ケース1: getPointsメソッドを持っている場合（TextElement, VectorElement）
      if (typeof ctx.element.getPoints === 'function') {
        points = ctx.element.getPoints(step);
      }
      // ケース2: 画像要素の場合（ImageElement）
      // ライブラリを変更せずにここで直接処理する
      else if (ctx.element.img && ctx.element.img.width) {
        const img = ctx.element.img;
        const w = img.width;
        const h = img.height;
        const cx = w / 2;
        const cy = h / 2;

        // ピクセルデータのロード
        img.loadPixels();

        // スキャン（ローカル座標系）
        const scanStep = Math.max(1, Math.floor(step));

        for (let y = 0; y < h; y += scanStep) {
          for (let x = 0; x < w; x += scanStep) {
            const i = 4 * (x + y * w);
            if (i >= img.pixels.length) continue;

            const r = img.pixels[i];
            const g = img.pixels[i + 1];
            const b = img.pixels[i + 2];
            const a = img.pixels[i + 3];

            // 判定: 黒っぽくて透明でない部分
            const isDark = (r < 50 && g < 50 && b < 50);
            const isVisible = a > 50;

            if (isVisible && isDark) {
              points.push({
                x: x - cx,
                y: y - cy
              });
            }
          }
        }
      }

      // パーティクルを生成
      ctx.state.particles = points.map(p => new Particle(p.x, p.y));
      ctx.state.init = true;
      ctx.markAsProcessed();
    }

    // Outsideの障害物（Global）をInside（Local）座標系に変換
    const localInvisiblePoints = invisiblePoints.map(pt => {
      return globalToLocal(ctx.element, pt.pos.x, pt.pos.y);
    });

    // マウス位置（ctx.mouseX, ctx.mouseY は既にLocal座標）
    const localMouse = createVector(ctx.mouseX, ctx.mouseY);

    // B. 描画
    if (ctx.state.particles) {
      // UIで設定された色を取得して適用
      let c = ctx.element.color;

      for (let p of ctx.state.particles) {
        p.update(localMouse, localInvisiblePoints);
        p.show(c);
      }
    }
  });

  // --- 4. Outside: ランダムな文字を描画 ---
  if (attractorColor) {
    fill(attractorColor);
  } else {
    fill(0, 255, 0);
  }

  noStroke();
  textSize(40);
  textFont('Helvetica Neue'); // フォント指定
  //textStyle(BOLD);       // 太字指定
  textAlign(CENTER, CENTER);
  for (let pt of invisiblePoints) {
    pt.angle += pt.angleVel; // 回転を更新
    push();
    translate(pt.pos.x, pt.pos.y);
    rotate(pt.angle);
    text(pt.char, 0, 0); // ランダムに選ばれた文字を描画
    pop();
  }
}


// グローバル座標を要素のローカル座標に変換するヘルパー関数
function globalToLocal(el, gx, gy) {
  let dx = gx - el.x;
  let dy = gy - el.y;
  let cosA = cos(-el.angle);
  let sinA = sin(-el.angle);

  // 回転の逆変換
  let rx = dx * cosA - dy * sinA;
  let ry = dx * sinA + dy * cosA;

  // スケールの逆変換
  let sx = el.scale * (typeof el.scaleX === 'number' ? el.scaleX : 1);
  let sy = el.scale * (typeof el.scaleY === 'number' ? el.scaleY : 1);

  return createVector(rx / sx, ry / sy);
}

class Particle {
  constructor(x, y) {
    this.base = createVector(x, y);
    // 初期位置を少し散らす
    this.pos = createVector(x + random(0, 0), y + random(0, 0));
    this.vel = p5.Vector.random2D().mult(random(0, 0));
    this.acc = createVector(0, 0);
    this.r = random(pradius, pradius);
    this.t = random(TWO_PI);
  }

  update(mouseLocal, invisiblePointsLocal) {
    // 1. 元の位置に戻る力（磁力）
    // this.pos と this.base はLocal座標
    let force = p5.Vector.sub(this.base, this.pos).mult(magnet);
    this.acc.add(force);

    // 2. マウスから逃げる力
    let d = p5.Vector.dist(this.pos, mouseLocal);
    // 要素サイズによって repulRadius の見え方が変わるが、Local系で計算
    let rRadius = repelRadius;
    if (d < rRadius) {
      let repel = p5.Vector.sub(this.pos, mouseLocal);
      repel.setMag((rRadius - d) * 0.5); // 強めに反発
      this.acc.add(repel);
    }

    // 3. 目に見えない点（赤い円）からも反発
    for (let ptLocal of invisiblePointsLocal) {
      // ポイントとの距離チェック
      let d2 = p5.Vector.dist(this.pos, ptLocal);
      if (d2 < rRadius) {
        let repel2 = p5.Vector.sub(this.pos, ptLocal);
        repel2.setMag((rRadius - d2) * 0.5);
        this.acc.add(repel2);
      }
    }

    // 物理更新
    this.vel.add(this.acc);
    this.vel.mult(0.4); // 摩擦
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  show(c) {
    if (c) {
      if (strokeColor) {
        stroke(strokeColor);
      } else {
        stroke(0, 0, 255);
      }
      fill(c);
    } else {
      stroke(0, 0, 255);
      fill(0, 200, 255); // デフォルト: 不透明な青
    }

    strokeWeight(0.25);
    // Local座標系で描画（既にDesignSystemがtransformしてくれている）
    rect(this.pos.x, this.pos.y, this.r, this.r);
  }
}
