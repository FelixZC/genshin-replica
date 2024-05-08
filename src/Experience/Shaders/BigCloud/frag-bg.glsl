uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;

varying vec2 vUv;

uniform sampler2D uTexture;

varying vec3 vWorldPosition;

// 主渲染函数
// 
// 参数:
//   iTime: 浮点型，统一变量，表示当前时间。
//   iResolution: 三维向量，统一变量，表示渲染目标的分辨率。
//   iMouse: 四维向量，统一变量，表示当前鼠标的位置和状态。
//   vUv: 二维向量，变化变量，表示纹理的UV坐标。
//   uTexture: 纹理采样器2D，统一变量，用于纹理采样。
//   vWorldPosition: 三维向量，变化变量，表示当前像素的世界位置。
// 
// 返回值:
//   无
void main(){
    vec2 uv = vUv; // 使用varying变量vUv作为纹理采样的UV坐标。

    vec4 tex = texture(uTexture, uv); // 从纹理采样器uTexture中采样得到tex。

    vec3 col = vec3(1.8); // 设置颜色。

    float alpha = tex.r * .4; // 通过tex的红色分量计算透明度。

    gl_FragColor = vec4(col, alpha); // 设置片段的颜色。
}