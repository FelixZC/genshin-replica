#include "/node_modules/lygia/generative/random.glsl"

// 定义全局变量
uniform float iTime; // 时间统一变量，用于动画效果
uniform vec3 iResolution; // 屏幕分辨率统一变量
uniform vec4 iMouse; // 鼠标位置统一变量

// 定义varying变量，用于片段着色器和顶点着色器之间的通信
varying vec2 vUv;

// 纹理采样器统一变量
uniform sampler2D uTexture;

// 用于传递世界位置和随机值到片段着色器
varying vec3 vWorldPosition;
varying vec3 vRandom;

// 主函数，负责生成最终的像素颜色
void main(){
    vec2 uv=gl_PointCoord;
    
    // 使用随机函数对粒子进行随机化处理
    float seed=random(vRandom);
    float randId=floor(seed*3.)/3.; // 生成一个在0到1之间的随机ID
    float mask=texture(uTexture,vec2(uv.x/3.+randId,uv.y)).r; // 从纹理中获取遮罩值
    
    vec3 col=vRandom;
    col+=.5; // 将随机颜色调整到中间色调
    
    // 使用遮罩值作为颜色的透明度
    float alpha=mask;
    
    // 通过时间来实现闪烁效果
    alpha*=smoothstep(0.,.2,sin(iTime*(1.2*seed+.4)+seed)-.8);
    
    // 设置最终的颜色输出
    gl_FragColor=vec4(col,alpha);
}