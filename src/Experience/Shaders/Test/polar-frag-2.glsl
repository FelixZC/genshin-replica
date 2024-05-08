/**
 * 主要图像处理函数
 * 
 * 该函数计算并设置像素的颜色，基于输入的片段坐标和屏幕分辨率的比例进行处理。
 * 
 * @param fragColor 输出参数，代表生成的像素颜色，是一个vec4向量。
 * @param fragCoord 输入参数，代表当前处理的像素在屏幕上的坐标，是一个vec2向量。
 */
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // 根据屏幕分辨率缩放输入的片段坐标，得到归一化的UV坐标
    vec2 uv = fragCoord / iResolution.xy;
    
    // 初始化一个遮罩层，初始值为1.0
    float mask1 = 1.0;
    
    // 应用垂直方向的平滑阈值，限制Y坐标的范围在0.0到0.5之间
    mask1 *= smoothstep(0., 0.5, uv.y);
    // 应用水平方向的平滑阈值，限制X坐标的范围在0.0到0.1之间
    mask1 *= smoothstep(0., 0.1, uv.x);
    // 应用水平方向的平滑阈值，限制X坐标的范围在0.9到1.0之间
    mask1 *= smoothstep(1., 0.9, uv.x);
    
    // 设置像素颜色，使用mask1作为颜色的强度值
    fragColor = vec4(vec3(mask1), 1.0);
}