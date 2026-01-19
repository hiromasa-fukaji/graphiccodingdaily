// p5.jsの標準的な変換を行うバーテックスシェーダー
precision mediump float;

// p5.jsから自動的に渡される属性
attribute vec3 aPosition; // 頂点位置
attribute vec2 aTexCoord; // テクスチャ座標

// p5.jsから自動的に渡されるuniform
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

// フラグメントシェーダーに渡すための変数
varying vec2 vUv;

void main() {
  // p5.jsのカメラ（orthoなど）とオブジェクトの位置を考慮して、
  // 頂点の最終的な位置を計算する
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);

  // テクスチャ座標をフラグメントシェーダーに引き渡す
  vUv = aTexCoord;
}
