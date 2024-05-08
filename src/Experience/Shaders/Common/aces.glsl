// ACES是一种广泛用于电影、电视和广告制作的颜色管理系统

/**
 * 对给定的向量应用RRT和ODT fitting。
 * @param v 输入的RGB颜色向量。
 * @return 应用了RRT和ODT fitting后的RGB颜色向量。
 */
vec3 rrt_odt_fit(vec3 v)
{
    vec3 a=v*(v+.0245786)-.000090537;
    vec3 b=v*(.983729*v+.4329510)+.238081;
    return a/b;
}

/**
 * 对给定的向量应用RRT和ODT的反向fitting。
 * @param v 输入的RGB颜色向量。
 * @return 应用了反向RRT和ODT fitting后的RGB颜色向量。
 */
vec3 inv_rrt_odt_fit(vec3 v)
{
    vec3 a=-(sqrt(10.)*sqrt((-187248350.*pow(v,vec3(2.)))+232585567.*v+241290.)+21650.*v-1230.);
    vec3 b=(98370.*v-100000.);
    return a/b;
}

/**
 * 通过给定的行向量创建一个3x3的矩阵，并返回该矩阵。
 * @param c0 第一行向量。
 * @param c1 第二行向量。
 * @param c2 第三行向量。
 * @return 由给定向量构成的3x3矩阵的转置。
 */
mat3 mat3_from_rows(vec3 c0,vec3 c1,vec3 c2)
{
    mat3 m=mat3(c0,c1,c2);
    m=transpose(m);
    
    return m;
}

/**
 * 使用给定的矩阵和向量进行乘法。
 * @param m 3x3矩阵。
 * @param v 3维向量。
 * @return 矩阵和向量乘积的结果向量。
 */
vec3 mul(mat3 m,vec3 v)
{
    return m*v;
}

/**
 * 使用两个给定的矩阵进行乘法。
 * @param m1 第一个3x3矩阵。
 * @param m2 第二个3x3矩阵。
 * @return 两个矩阵乘积的结果矩阵。
 */
mat3 mul(mat3 m1,mat3 m2)
{
    return m1*m2;
}

/**
 * 将给定的颜色转换为ACES颜色空间。
 * @param color 输入的RGB颜色向量。
 * @return 转换到ACES颜色空间后的RGB颜色向量。
 */
vec3 aces_fitted(vec3 color)
{
    // 定义ACES输入矩阵
    mat3 ACES_INPUT_MAT=mat3_from_rows(
        vec3(.59719,.35458,.04823),
        vec3(.07600,.90834,.01566),
        vec3(.02840,.13383,.83777));
        
    // 定义ACES输出矩阵
    mat3 ACES_OUTPUT_MAT=mat3_from_rows(
        vec3(1.60475,-.53108,-.07367),
        vec3(-.10208,1.10813,-.00605),
        vec3(-.00327,-.07276,1.07602));
            
    // 应用ACES输入矩阵
    color=mul(ACES_INPUT_MAT,color);
    
    // 应用RRT和ODT
    color=rrt_odt_fit(color);
    
    // 应用ACES输出矩阵
    color=mul(ACES_OUTPUT_MAT,color);
    
    return color;
}

/**
 * 将给定的ACES颜色转换回原始颜色空间。
 * @param color 输入的RGB颜色向量（在ACES颜色空间中）。
 * @return 转换回原始颜色空间后的RGB颜色向量。
 */
vec3 ACES_Inv(vec3 color)
{
    // 定义ACES输入矩阵
    mat3 ACES_INPUT_MAT=mat3_from_rows(
        vec3(1.76474,-.67577,-.08896),
        vec3(-.14702,1.16025,-.01322),
        vec3(-.03633,-.16243,1.19877));
                
    // 定义ACES输出矩阵
    mat3 ACES_OUTPUT_MAT=mat3_from_rows(
        vec3(.64304,.31119,.04578),
        vec3(.05926,.93144,.00929),
        vec3(.00596,.06393,.93012));
                    
    // 应用ACES输出矩阵
    color=mul(ACES_OUTPUT_MAT,color);
    
    // 应用反向RRT和ODT
    color=inv_rrt_odt_fit(color);
    
    // 应用ACES输入矩阵
    color=mul(ACES_INPUT_MAT,color);
    
    return color;
}