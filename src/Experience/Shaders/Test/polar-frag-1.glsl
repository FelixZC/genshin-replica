// iChannel0设置为一个网络图像的URL，用于纹理采样
#iChannel0"https://s2.loli.net/2023/09/10/QozT59R6KsYmb3q.jpg"

/**
 * 主要的图像处理函数。
 * 
 * @param fragColor 输出颜色，是一个vec4类型，表示像素的颜色。
 * @param fragCoord 输入的片段坐标，是一个vec2类型，表示当前处理的像素在图像中的坐标。
 */
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // 将片段坐标转换为归一化纹理坐标
    vec2 uv = fragCoord / iResolution.xy;
    
    // 从纹理采样并进行处理，这里使用了两个不同的采样点来混合颜色
    vec3 tex = 1.5 * texture(iChannel0, uv + vec2(iTime * .015, 0.)).xyz;
    tex += texture(iChannel0, uv * vec2(.4, 1.) + vec2(iTime * -.0075, 0.)).xyz;
    
    // 将处理后的颜色设置为片段的颜色
    fragColor = vec4(tex, 1.);
}