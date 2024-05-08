// 定义一个全局的纹理通道0，这里使用了一个网络图片地址。
#iChannel0"https://s2.loli.net/2023/09/10/QozT59R6KsYmb3q.jpg"

/**
 * 生成基于二维坐标uv的随机数。
 * @param uv 二维坐标。
 * @return 返回基于uv计算的随机浮点数。
 */
float random(vec2 uv)
{
    // 使用sin函数和dot函数的组合以及一个固定的向量来生成一个随机数。
    return fract(sin(dot(uv,vec2(12.9898,78.233)))*43758.5453);
}

/**
 * 对给定的UV坐标进行失真处理。
 * @param uv 初始的UV坐标。
 * @param offset 偏移量，用于计算随机数的种子。
 * @return 返回失真后的UV坐标。
 */
vec2 distortUV(vec2 uv,vec2 offset){
    vec2 wh=vec2(2.,4.); // 定义屏幕的宽高比。
    uv/=wh; // 根据宽高比缩放uv。
    float rn=ceil(random(offset)*wh.x*wh.y); // 生成一个基于offset的随机数。
    vec2 cell=vec2(1.,1.)/wh; // 计算每个像素对应的UV变化量。
    // 根据随机数调整UV坐标，实现失真效果。
    uv+=vec2(cell.x*mod(rn,wh.x),cell.y*(ceil(rn/wh.x)-1.));
    return uv;
}

/**
 * GLSL主函数，负责处理图像渲染。
 * @param fragColor 输出的颜色值。
 * @param fragCoord 片元的坐标。
 */
void mainImage(out vec4 fragColor,in vec2 fragCoord){
    vec2 uv=fragCoord/iResolution.xy; // 将片元坐标转换为UV坐标。
    // 应用UV失真效果。
    uv=distortUV(uv,uv);
    // 从纹理通道0中采样颜色。
    vec3 tex=texture(iChannel0,uv).xyz;
    // 设置最终的颜色输出。
    fragColor=vec4(tex,1.);
}  