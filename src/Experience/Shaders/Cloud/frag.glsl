#include "../Common/aces.glsl"

uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;

varying vec2 vUv;

uniform sampler2D uTexture;

varying vec3 vWorldPosition;
varying vec3 vInstPosition;

uniform vec3 uColor1;
uniform vec3 uColor2;
// 主渲染函数
// 输入：
//   iTime: 流逝的时间
//   iResolution: 屏幕分辨率
//   iMouse: 鼠标位置
//   uTexture: 采样纹理
//   vUv: 纹理坐标
//   vWorldPosition: 世界空间位置
//   vInstPosition: 实例空间位置
//   uColor1: 第一种颜色
//   uColor2: 第二种颜色
// 输出：
//   gl_FragColor: 输出的颜色
void main(){
    vec2 uv = vUv; // 使用传入的纹理坐标
    
    vec4 tex = texture(uTexture, uv); // 从纹理中采样
    
    vec3 col = uColor1; // 初始化颜色为第一种颜色
    col = mix(col, uColor2, pow(tex.r, .6)); // 根据纹理的红色通道混合第二种颜色
    
    float alpha = tex.a; // 从纹理采样得到的透明度
    
    col = ACES_Inv(col); // 应用ACES反转色调映射
    
    gl_FragColor = vec4(col, alpha); // 设置最终输出的颜色
}