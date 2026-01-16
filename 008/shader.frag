#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_noiseScale;
uniform float u_warpStrength;
uniform int u_octaves;
uniform float u_grainIntensity;

// ===== シンプレックスノイズ実装 =====
// Simplex Noise by Ian McEwan, Ashima Arts
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// ===== Fractal Brownian Motion =====
float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 8; i++) {
        if(i >= u_octaves) break;
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}

// ===== ドメインワーピング =====
float domainWarp(vec2 p, float time) {
    // 第1層のワーピング
    vec2 q = vec2(
        fbm(vec3(p * u_noiseScale, time)),
        fbm(vec3(p * u_noiseScale + vec2(5.2, 1.3), time))
    );
    
    // 第2層のワーピング
    vec2 r = vec2(
        fbm(vec3(p + u_warpStrength * q + vec2(1.7, 9.2), time * 0.8)),
        fbm(vec3(p + u_warpStrength * q + vec2(8.3, 2.8), time * 0.9))
    );
    
    // 最終的なノイズ値
    return fbm(vec3(p + u_warpStrength * r, time * 0.5));
}

// ===== カラーパレット =====
vec3 getColor(float t) {
    // カラーパレット定義
    vec3 color1 = vec3(0.0, 0.0, 0.0);          // ブラック
    vec3 color2 = vec3(0.0, 0.0, 0.5);          // ディープブルー
    vec3 color3 = vec3(0.0, 1.0, 1.0);          // エレクトリックシアン
    vec3 color4 = vec3(1.0, 0.0, 0.5);          // ネオンマゼンタ
    
    // ノイズ値を0-1に正規化
    t = (t + 1.0) * 0.5;
    t = clamp(t, 0.0, 1.0);
    
    // 複雑なグラデーション作成
    vec3 color;
    if(t < 0.25) {
        color = mix(color1, color2, t * 4.0);
    } else if(t < 0.5) {
        color = mix(color2, color3, (t - 0.25) * 4.0);
    } else if(t < 0.75) {
        color = mix(color3, color4, (t - 0.5) * 4.0);
    } else {
        color = mix(color4, color1, (t - 0.75) * 4.0);
    }
    
    // 彩度とコントラストを強調
    color = pow(color, vec3(0.8));
    
    return color;
}

// ===== ランダム関数（グレインノイズ用）=====
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    // UV座標を計算（アスペクト比補正）
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;
    
    // ドメインワーピングでノイズ値を取得
    float noiseValue = domainWarp(p, u_time);
    
    // 追加の流動性（渦巻き効果）
    float angle = atan(p.y, p.x);
    float radius = length(p);
    float spiral = sin(angle * 3.0 + radius * 5.0 - u_time * 2.0) * 0.3;
    noiseValue += spiral;
    
    // カラーマッピング
    vec3 color = getColor(noiseValue);
    
    // グレインノイズを追加（フィルムグレイン効果）
    float grain = random(uv + u_time * 0.1) * 2.0 - 1.0;
    color += grain * u_grainIntensity;
    
    // 周辺減光効果（ビネット）
    float vignette = 1.0 - length(uv - 0.5) * 0.8;
    color *= vignette;
    
    gl_FragColor = vec4(color, 1.0);
}