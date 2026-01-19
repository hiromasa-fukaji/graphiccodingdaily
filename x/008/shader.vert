attribute vec3 aPosition;

void main() {
    // 頂点座標を正規化デバイス座標に変換
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    
    gl_Position = positionVec4;
}