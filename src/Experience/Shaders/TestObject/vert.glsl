#include "/node_modules/lygia/generative/cnoise.glsl" // 引入cnoise.glsl文件，用于噪声扰动计算

//全局变量声明
uniform float iTime; // 时间 uniform变量，用于动画效果
uniform vec3 iResolution; // 屏幕分辨率 uniform变量，可用于适配不同屏幕尺寸
uniform vec4 iMouse; // 鼠标位置 uniform变量，可用于交互

varying vec2 vUv; // 纹理坐标变量，用于片段着色器中

// 扰动函数，用于对位置进行噪声扰动
uniform float uDistort; // 用户定义的扰动强度
vec3 distort(vec3 p){
    // 基于p位置和当前时间的噪声计算
    float noise=cnoise(p+iTime);
    // 使用噪声值对位置进行扰动
    p+=noise*normal*.3*uDistort;
    return p; // 返回扰动后的位置
}

// 主函数，负责物体的着色
void main(){
    vec3 p=position; // 初始化位置
    // 应用扰动函数
    p=distort(p);
    // 计算最终的屏幕位置
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
    
    vUv=uv; // 传递纹理坐标到片段着色器
}