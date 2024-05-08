#include "/node_modules/lygia/color/space.glsl"
#include "/node_modules/lygia/math/saturate.glsl"
#include "../Common/aces.glsl"

#define iTime time
#define iResolution resolution
#define iChannel0 inputBuffer

uniform float uIntensity;
uniform float uWhiteAlpha;
/**
 * 主要图像处理函数，应用ACES颜色校正和明度增强效果。
 * 
 * @param inputColor 输入颜色，一个vec4变量，包含颜色和透明度信息。
 * @param uv 输入纹理的UV坐标。
 * @param outputColor 输出颜色，一个vec4变量，处理后的颜色和透明度信息。
 */
void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor)
{
    // 从输入缓冲区获取纹理颜色
    vec4 diffuseBase=texture(iChannel0,uv);
    
    // 提取纹理颜色的RGB分量
    vec3 col=diffuseBase.rgb;
    
    // 将线性颜色空间转换到ACES适应的颜色空间
    vec3 linear=aces_fitted(col.rgb);
    
    // 将颜色从RGB转换到HSV颜色空间以便调整明度
    vec3 hsv=rgb2hsv(linear);
    
    // 增加明度以实现炫白效果
    hsv.z+=uIntensity;
    
    // 将HSV颜色转换回RGB
    vec3 rgb=hsv2rgb(hsv);
    col=rgb;
    // 混合颜色以调整白色alpha值
    col=mix(col,vec3(1.),uWhiteAlpha);
    // 保持颜色饱和度和亮度在有效范围内
    col=saturate(col);
    // 将颜色从ACES适应空间转换回线性空间
    col=ACES_Inv(col);
    
    // 提取原始纹理的透明度
    float alpha=diffuseBase.a;
    
    // 输出最终处理后的颜色和透明度
    outputColor=vec4(col,alpha);
}