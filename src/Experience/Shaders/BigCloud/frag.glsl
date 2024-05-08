#include "../Common/aces.glsl"

uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;

varying vec2 vUv;

uniform sampler2D uTexture;

varying vec3 vWorldPosition;

// 主渲染函数
//
// 参数:
//   iTime: 流逝的时间，用于动画效果
//   iResolution: 屏幕的分辨率，用于根据屏幕大小调整渲染
//   iMouse: 鼠标位置，可用于交互式效果
//   vUv: 纹理坐标，用于映射纹理
//   uTexture: 一个采样器，用于读取纹理数据
//   vWorldPosition: 物体在世界空间的位置，可用于计算光照等
//
// 返回值:
//   gl_FragColor: 输出的颜色，包含RGB和透明度信息

void main(){
    vec2 uv=vUv; // 使用纹理坐标uv
    
    vec4 tex=texture(uTexture,uv); // 从纹理采样得到颜色
    
    vec3 col=vec3(.090,.569,.980); // 定义一个基础颜色
    // 根据纹理的红色分量调整颜色，使颜色更亮或更暗
    col=mix(col,vec3(.93),vec3(pow(tex.r,.4)));
    
    float alpha=tex.a; // 获取纹理的透明度
    
    // 应用ACES颜色校正
    col=ACES_Inv(col);
    
    // 设置最终的颜色，并输出
    gl_FragColor=vec4(col,alpha);
}