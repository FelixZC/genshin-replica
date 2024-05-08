#include "/node_modules/lygia/generative/random.glsl"

// uniform变量声明:
// iTime - 时间统一变量，用于动画等时间相关变化
// iResolution - 屏幕分辨率统一变量，影响全局像素尺寸相关计算
// iMouse - 鼠标位置统一变量，可用于鼠标交互效果
uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;

// varying变量声明:
// vUv - 纹理坐标变量，从顶点着色器传递到片段着色器
// vWorldPosition - 物体在世界空间中的位置，从顶点着色器传递到片段着色器
varying vec2 vUv;
varying vec3 vWorldPosition;

/**
 * 扭曲UV坐标
 * 通过给定的偏移量对UV坐标进行随机化扭曲
 * 
 * @param uv 原始的UV坐标
 * @param offset 随机化过程中的偏移量（影响随机种子）
 * @return 被扭曲后的UV坐标
 */
vec2 distortUV(vec2 uv, vec2 offset){
    vec2 wh = vec2(2., 4.); // 定义一个区域大小（宽高）
    uv /= wh; // 将UV坐标标准化
    float rn = ceil(random(offset) * wh.x * wh.y); // 通过offset生成一个随机数
    vec2 cell = vec2(1., 1.) / wh; // 计算单元格大小
    // 应用随机数对UV进行偏移
    uv += vec2(cell.x * mod(rn, wh.x), cell.y * (ceil(rn / wh.x) - 1.));
    return uv; // 返回偏移后的UV坐标
}

void main(){
    vec3 p = position; // 获取默认位置
    
    // 如果启用了实例化，对位置进行实例矩阵变换
    #ifdef USE_INSTANCING
    p = vec3(instanceMatrix * vec4(p, 1.));
    
    // 计算实例位置
    vec3 instPosition = vec3(instanceMatrix * vec4(vec3(0.), 1.));
    #endif
    
    // 计算最终的屏幕位置
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
    
    // 应用UV扭曲
    vUv = distortUV(uv, instPosition.xy);
    // 计算世界空间中的位置
    vWorldPosition = vec3(modelMatrix * vec4(p, 1));
}