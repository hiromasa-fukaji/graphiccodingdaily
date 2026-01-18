// Matter.jsのモジュール初期化
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Runner = Matter.Runner;

let system;
let engine;
let world;
let fallingChars = []; // 文字オブジェクトを管理
let charPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let ground, wallLeft, wallRight;
let defaultFont = 'Helvetica Neue';
const MAX_CHARS = 100; // 文字の上限数

function setup() {
  // キャンバス作成
  let c = createCanvas(210*3, 297*3);
  c.id('main-canvas');
  background(0);
  textFont(defaultFont);
  textAlign(CENTER, CENTER);

  // DesignSystemの初期化
  system = new DesignSystem();
  c.drop((file) => system.handleFileDrop(file, mouseX, mouseY));

  // 1. 物理エンジンのセットアップ
  engine = Engine.create();
  world = engine.world;
  
  // 重力の調整
  world.gravity.y = 3;
  
  // 衝突解決の感度を調整（位置補正を弱める）
  engine.positionIterations = 4; // デフォルト6 → 4に減らす
  engine.velocityIterations = 4; // デフォルト4 → 4のまま
  
  // 衝突時に速度を直接制御するイベントリスナー
  Matter.Events.on(engine, 'collisionStart', (event) => {
    const pairs = event.pairs;
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;
      
      // 両方の物体の速度を大幅に減らす（反発を防ぐ）
      bodyA.velocity.x *= 0.1;
      bodyA.velocity.y *= 0.1;
      bodyB.velocity.x *= 0.1;
      bodyB.velocity.y *= 0.1;
      
      // 角速度も減らす（回転を止める）
      bodyA.angularVelocity *= 0.1;
      bodyB.angularVelocity *= 0.1;
    }
  });
  
  // 衝突中も速度を制御（連続的に減衰させる）
  Matter.Events.on(engine, 'collisionActive', (event) => {
    const pairs = event.pairs;
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;
      
      // 衝突中は速度をさらに減らす
      bodyA.velocity.x *= 0.8;
      bodyA.velocity.y *= 0.8;
      bodyB.velocity.x *= 0.8;
      bodyB.velocity.y *= 0.8;
      
      bodyA.angularVelocity *= 0.8;
      bodyB.angularVelocity *= 0.8;
    }
  });
  
  // ランナーを作成して実行（これで物理計算が回り始めます）
  let runner = Runner.create();
  Runner.run(runner, engine);

  // 2. 床と壁を作成（静止物体 isStatic: true）
  const wallOptions = { isStatic: true, render: { visible: false } };
  const thickness = 100;
  
  // 床
  ground = Bodies.rectangle(width/2, height + thickness/2, width, thickness, wallOptions);
  // 左壁
  wallLeft = Bodies.rectangle(-thickness/2, height/2, thickness, height, wallOptions);
  // 右壁
  wallRight = Bodies.rectangle(width + thickness/2, height/2, thickness, height, wallOptions);

  World.add(world, [ground, wallLeft, wallRight]);

  console.log('Setup complete! Canvas size:', width, 'x', height);
  console.log('Matter.js initialized');
}

function draw() {
  // --- 1. Outside: 全体の環境 ---
  background(20, 20, 30);

  // --- 文字の生成 ---
  // 一定確率で新しい文字を生成（最大数制限付き）
  if (fallingChars.length < MAX_CHARS && frameCount % 5 === 0) {
    spawnChar();
  }

  // --- 2. System: 基本レンダリング ---
  // DesignSystemの要素を描画（背景は上書きしない）
  system.render({ skipBackground: true });

  // --- 3. Outside: 文字の描画 ---
  // Matter.jsの計算結果(body.position/angle)を使ってp5.jsで描画
  for (let i = 0; i < fallingChars.length; i++) {
    let item = fallingChars[i];
    let pos = item.body.position;
    let angle = item.body.angle;

    push();
    translate(pos.x, pos.y);
    rotate(angle);
    
    // 色設定
    fill(item.color);
    noStroke();
    textFont(defaultFont);
    textSize(item.size);
    
    // 文字を描画
    text(item.char, 0, 0);
    
    // デバッグ用：当たり判定の箱を表示（コメントアウトを外すと表示）
    // noFill(); 
    // stroke(255, 50); 
    // rectMode(CENTER);
    // rect(0, 0, item.w, item.h);
    
    pop();
    
    // 画面外（下）に落ちた文字は削除（処理軽減）
    if (pos.y > height + 200) {
      Matter.World.remove(world, item.body);
      fallingChars.splice(i, 1);
      i--;
    }
  }

  // デバッグ情報
  push();
  fill(255, 255, 0);
  noStroke();
  textFont(defaultFont);
  textSize(20);
  textAlign(LEFT, TOP);
  text(`Chars: ${fallingChars.length}/${MAX_CHARS}`, 10, 10);
  text(`Frame: ${frameCount}`, 10, 40);
  pop();
}

function spawnChar() {
  const char = random(charPool.split(''));
  // フォントサイズ
  const fontSize = random(20, 100);
  
  // 文字の幅と高さを計算（当たり判定用）
  textFont(defaultFont);
  textSize(fontSize);
  const w = textWidth(char);
  const h = textAscent() * 0.75; // 余白を削るため少し小さめに

  // 出現位置
  const x = random(50, width - 100);
  const y = 0;

  // 3. 物理ボディ（剛体）の作成
  // 文字そのものは複雑な形ですが、当たり判定は「四角形」にすると計算が爆速で安定します
  const body = Bodies.rectangle(x, y, w, h, {
    restitution: 0.3,        // 跳ね返り係数 (0〜1) - 完全非弾性
    friction: 0.5,         // 摩擦 (0〜1) - 高めに設定
    frictionAir: 0.05,     // 空気抵抗 - 動きを鈍らせる
    density: 0.001,        // 密度 - 重くして慣性を大きく
    //inertia: Infinity,     // 慣性モーメント - 回転を無効化
    angle: random(TWO_PI)              // 初期回転なし
  });

  // ワールドに追加
  World.add(world, body);

  // 描画用に情報をオブジェクトとして保存
  fallingChars.push({
    body: body,
    char: char,
    size: fontSize,
    w: w,
    h: h,
    color: randomColor()
  });

  console.log(`Spawned char: "${char}" at (${x}, ${y}), size: ${fontSize}`);
}

function randomColor() {
  const colors = [
    '#FF6B6B'
  ];
  return color(random(colors));
}
