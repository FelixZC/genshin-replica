#include "/node_modules/lygia/generative/random.glsl"

// 定义全局变量
uniform float iTime; // 时间
uniform vec3 iResolution; // 视口分辨率
uniform vec4 iMouse; // 鼠标位置

varying vec2 vUv; // 纹理坐标

// 定义材质点大小和像素比率
uniform float uPointSize; // 点的大小
uniform float uPixelRatio; // 像素比率

// 定义顶点属性
attribute vec3 aRandom; // 随机值属性，用于每个粒子的随机化

varying vec3 vWorldPosition; // 世界空间中的顶点位置
varying vec3 vRandom; // 传递给片段着色器的随机值

/**
 * 对给定的位置向量进行随机扰动。
 * @param p 原始位置向量
 * @return 扰动后的位置向量
 */
vec3 distort(vec3 p){
    float seed=random(aRandom); // 基于随机属性生成种子
    float strength=500.0; // 扰动强度
    float t=sin(iTime*(.1*seed)); // 时间影响因素
    // 在每个坐标轴上应用扰动
    p.x+=(seed-.5)*2.*strength;
    p.y+=(seed-.8)*2.*strength;
    p.z+=((seed-.5)*2.*t+seed)*strength;
    return p; // 返回扰动后的位置
}

void main(){
    vec3 p=position; // 默认位置
    p=distort(p); // 应用随机扰动
    // 计算屏幕空间中的位置
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
    
    // 计算点大小，考虑像素比率
    gl_PointSize=uPointSize*uPixelRatio;
    // 根据视口深度调整点大小
    vec4 mvPosition=modelViewMatrix*vec4(p,1.0);
    gl_PointSize*=(1./-mvPosition.z);
    
    vUv=uv; // 传递纹理坐标
    // 计算世界空间中的顶点位置
    vWorldPosition=vec3(modelMatrix*vec4(p,1.0));
    vRandom=aRandom; // 传递随机值
}