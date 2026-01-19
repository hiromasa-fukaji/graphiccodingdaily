uniform sampler2D u_mask;
// サイケデリック流体アート用GLSLフラグメントシェーダー
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_noiseScale;
uniform float u_fbmOctaves;
uniform float u_fbmGain;
uniform float u_fbmLacunarity;
uniform float u_warpStrength;
uniform float u_colorSpeed;
uniform float u_grainStrength;



// --- パレット色定義 ---
const vec3 COLOR_MAGENTA = vec3(1.0, 0.0, 0.5); // ネオンマゼンタ
const vec3 COLOR_CYAN    = vec3(0.0, 1.0, 1.0); // エレクトリックシアン
const vec3 COLOR_BLUE    = vec3(0.0, 0.0, 0.5); // ディープブルー
const vec3 COLOR_BLACK   = vec3(0.0, 0.0, 0.0); // ブラック

// --- 乱数・ノイズ関数 ---
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// --- fBm（Fractal Brownian Motion） ---
float fbm(vec2 p, float octaves, float gain, float lacunarity) {
    float sum = 0.0;
    float amp = 1.0;
    float freq = 1.0;
    for (int i = 0; i < 8; i++) {
        if(float(i) >= octaves) break;
        sum += amp * noise(p * freq);
        freq *= lacunarity;
        amp *= gain;
    }
    return sum / (2.0 - pow(gain, octaves));
}

// --- ドメインワーピング ---
vec2 domainWarp(vec2 p, float t, float strength) {
    float n1 = fbm(p + t * 0.1, u_fbmOctaves, u_fbmGain, u_fbmLacunarity);
    float n2 = fbm(p + vec2(5.2, 1.3) + t * 0.13, u_fbmOctaves, u_fbmGain, u_fbmLacunarity);
    return p + strength * vec2(n1, n2);
}

// --- カラーマッピング ---
vec3 palette(float t) {
    // 0.0〜1.0のtで4色を滑らかに補間
    vec3 c1 = mix(COLOR_MAGENTA, COLOR_CYAN, smoothstep(0.0, 0.33, t));
    vec3 c2 = mix(COLOR_CYAN, COLOR_BLUE, smoothstep(0.33, 0.66, t));
    vec3 c3 = mix(COLOR_BLUE, COLOR_BLACK, smoothstep(0.66, 1.0, t));
    if (t < 0.33) return c1;
    else if (t < 0.66) return c2;
    else return c3;
}

// --- グレインノイズ ---
float grain(vec2 uv, float t) {
    return hash(uv * u_resolution.xy * t) * 2.0 - 1.0;
}

void main() {

    vec2 uv = vUv;
    uv = uv * 2.0 - 1.0; // Convert UV coords to be centered (-1.0 to 1.0)

    // マスク画像の値を取得（Aの形状）
    float mask = texture2D(u_mask, vUv).r;

    // 時間で回転・流動感
    float t = u_time * u_colorSpeed;
    float angle = t * 0.1;
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    uv = rot * uv;

    // マスク値でA部分のワーピングをさらに強調
    float localWarp = mix(u_warpStrength * 0.2, u_warpStrength * 4.0, mask);
    vec2 warped = domainWarp(uv * u_noiseScale, t, localWarp);

        // Aの部分を明るく補正
        float aBoost = smoothstep(0.2, 0.8, mask); // Aの形状で明るさ補正

    // fBmノイズ
    float n = fbm(warped + t, u_fbmOctaves, u_fbmGain, u_fbmLacunarity);
    n = smoothstep(0.0, 1.0, n);

    // カラーマッピング
        vec3 col = palette(n);
        col = mix(col, vec3(1.0), aBoost * 0.7); // A部分を白方向にブレンド

    // グレインノイズ
    float g = grain(uv, u_time) * u_grainStrength;
    col += g;
    col = clamp(col, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
}
