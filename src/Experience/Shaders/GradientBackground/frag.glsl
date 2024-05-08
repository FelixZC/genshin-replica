uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uStop1;
uniform float uStop2;

#include "../Common/aces.glsl"
// 主要的图像渲染函数
// 
// @param fragColor 输出颜色，vec4类型，代表最终的像素颜色
// @param fragCoord 输入坐标，vec2类型，代表当前处理的像素坐标
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // 计算当前像素的UV坐标
    vec2 uv = fragCoord / iResolution.xy;
    
    // 使用uniform变量而不是硬编码的颜色，增加灵活性
    vec3 col1 = uColor1; // 第一种颜色
    vec3 col2 = uColor2; // 第二种颜色
    vec3 col3 = uColor3; // 第三种颜色
    
    vec3 col = vec3(0.); // 初始化最终颜色为黑色
    
    // 使用uniform变量而不是硬编码的停止点，增加灵活性
    float stop1 = uStop1; // 第一个停止点
    float stop2 = uStop2; // 第二个停止点
    
    // 计算基于像素位置的遮罩值，用于混合颜色
    float y = 1. - uv.y;
    float mask1 = 1. - smoothstep(0., stop1, y); // 第一个遮罩，用于过渡到第一种颜色
    float mask2 = smoothstep(0., stop1, y) * (1. - smoothstep(stop1, stop2, y)); // 第二个遮罩，用于过渡到第二种颜色
    float mask3 = smoothstep(stop1, stop2, y); // 第三个遮罩，用于过渡到第三种颜色
    
    // 应用遮罩值来混合三种颜色
    col += col1 * mask1;
    col += col2 * mask2;
    col += col3 * mask3;
    
    // 应用ACES反转来调整颜色，以达到更好的视觉效果
    col = ACES_Inv(col);
    
    // 设置最终的像素颜色
    fragColor = vec4(col, 1.);
}