// 包含所需的外部GLSL文件
#include "/node_modules/lygia/generative/cnoise.glsl"
#include "/node_modules/lygia/math/saturate.glsl"

// 定义统一变量，用于传入外部参数
uniform float iTime; // 时间统一变量
uniform vec3 iResolution; // 分辨率统一变量
uniform vec4 iMouse; // 鼠标位置统一变量

// 定义传入片段着色器的变量
varying vec2 vUv; // UV坐标
varying vec3 vWorldPosition; // 世界空间位置

/**
 * 根据给定的三维位置模拟噪声雾效果。
 * 
 * @param p 位置向量，表示要计算噪声的点
 * @return 噪声值，用于模拟雾效的不透明度
 */
float getNoise(vec3 p){
    float noise=0.;

    // 应用两种不同尺度的噪声，以增加复杂性
    noise=saturate(cnoise(p*vec3(.012,.012,0.)+vec3(iTime*.25))+.2);
    noise+=saturate(cnoise(p*vec3(.004,.004,0.)-vec3(iTime*.15))+.1);
    
    // 确保噪声值在0到1之间
    noise=saturate(noise);
    
    // 根据Y轴位置调整噪声的强度和分布
    noise*=(1.-smoothstep(-5.,45.,p.y));
    noise*=(smoothstep(-200.,-35.,p.y));
    
    // 根据X轴位置调整噪声的强度和分布
    noise*=(smoothstep(0.,40.,p.x)+(1.-smoothstep(-40.,-0.,p.x)));

    return noise;
}

void main(){
    vec2 uv=vUv; // 使用UV坐标
    
    vec3 col=vec3(3.); // 设置基础颜色
    
    // 应用噪声雾效果
    float alpha=getNoise(vWorldPosition);
    alpha*=.3; // 调整雾的不透明度
    
    // 设置最终的颜色和透明度
    gl_FragColor=vec4(col,alpha);
}