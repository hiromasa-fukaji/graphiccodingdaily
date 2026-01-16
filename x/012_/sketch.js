let system;

function setup() {
  let c = createCanvas(210*3, 297*3);
  c.id('main-canvas');
  background(0);
  
  system = new DesignSystem();
  c.drop((file) => system.handleFileDrop(file, mouseX, mouseY));

}


function draw() {
  background(system.backgroundColor);
  
  system.render();

  // tag:logoの要素をパーティクルで表現
  system.drawInside('logo', (ctx) => {
    // 初回、または要素のプロパティ（フォントサイズなど）が変更された場合に再初期化
    if (!ctx.state.init || ctx.elementChanged()) {
      // テキストの形状から点を取得
      const targetPoints = ctx.element.getPoints(5);
      ctx.state.particles = [];
      ctx.state.targetPoints = targetPoints;
      
      // パーティクルのサイズをフォントサイズに比例させる
      const baseParticleSize = ctx.fontSize ? ctx.fontSize / 15 : 3;
      
      // 各ターゲットポイントに対してパーティクルを作成
      for (let i = 0; i < targetPoints.length; i++) {
        const target = targetPoints[i];
        ctx.state.particles.push({
          x: target.x + (random() - 0.5) * 200, // 初期位置をランダムに
          y: target.y + (random() - 0.5) * 200,
          targetX: target.x,
          targetY: target.y,
          vx: 0,
          vy: 0,
          size: random(baseParticleSize * 0.8, baseParticleSize * 1.2)
        });
      }
      
      ctx.state.init = true;
      ctx.markAsProcessed(); // 変更を処理済みとしてマーク
    }
    
    // パーティクルの更新と描画
    const particles = ctx.state.particles;
    const targetPoints = ctx.state.targetPoints;
    
    // マウスとの距離を計算
    const mouseRadius = 100;
    const mouseInfluence = 0.3;
    
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const target = targetPoints[i % targetPoints.length];
      
      // ターゲット位置への復元力
      const spring = 0.05;
      const dx = target.x - p.x;
      const dy = target.y - p.y;
      
      // マウスの影響
      const mouseDx = ctx.mouseX - p.x;
      const mouseDy = ctx.mouseY - p.y;
      const mouseDist = sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
      
      let fx = dx * spring;
      let fy = dy * spring;
      
      // マウスが近い場合、反発力を追加
      if (mouseDist < mouseRadius && mouseDist > 0) {
        const force = (1 - mouseDist / mouseRadius) * mouseInfluence;
        fx -= (mouseDx / mouseDist) * force * 10;
        fy -= (mouseDy / mouseDist) * force * 10;
      }
      
      // 速度の更新
      p.vx += fx;
      p.vy += fy;
      p.vx *= 0.9; // 摩擦
      p.vy *= 0.9;
      
      // 位置の更新
      p.x += p.vx;
      p.y += p.vy;
    }
    
    // パーティクルの描画
    const [r, g, b] = ctx.element._getRGBFromHex(ctx.element.color);
    noStroke();
    fill(r, g, b, ctx.element.opacity * 255);
    
    for (let p of particles) {
      ellipse(p.x, p.y, p.size, p.size);
    }
  });
  
}