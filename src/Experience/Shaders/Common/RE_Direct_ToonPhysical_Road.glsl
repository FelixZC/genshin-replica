#include "./aces.glsl"
/**
 * 计算直接光照对物理材质的影响，采用卡通化光照模型。
 * 
 * @param directLight 直接光源信息。
 * @param geometryPosition 几何位置。
 * @param geometryNormal 几何法线。
 * @param geometryViewDir 观察方向。
 * @param geometryClearcoatNormal 清漆法线（如果使用清漆）。
 * @param material 物理材质参数。
 * @param reflectedLight 反射光信息，输入和输出。
 * @param metalnessFactor 金属度影响因子。
 * 
 * 该函数不返回值，但会通过reflectedLight参数影响后续光照计算。
 */
void RE_Direct_ToonPhysical(const in IncidentLight directLight,const in vec3 geometryPosition,const in vec3 geometryNormal,const in vec3 geometryViewDir,const in vec3 geometryClearcoatNormal,const in PhysicalMaterial material,inout ReflectedLight reflectedLight,const in float metalnessFactor){
    // 计算没有饱和的法线与光线的点积
    float dotNL_noSaturate=dot(geometryNormal,directLight.direction);
    // 饱和点积值，防止过强的光照
    float dotNL=saturate(dotNL_noSaturate);
    // 应用卡通化光照效果
    float dotNL_toon=smoothstep(.25,.27,dotNL)*pow(dotNL,.5)*1.4;
    dotNL_toon+=smoothstep(.75,.8,dotNL)*pow(dotNL,1.);
    // 计算卡通化后的光照强度
    vec3 irradiance=dotNL_toon*directLight.color;
    #ifdef USE_CLEARCOAT
    // 如果使用清漆层，计算清漆的反射
    float dotNLcc=saturate(dot(geometryClearcoatNormal,directLight.direction));
    vec3 ccIrradiance=dotNLcc*directLight.color;
    // 清漆的镜面反射计算
    clearcoatSpecular+=ccIrradiance*BRDF_GGX_Clearcoat(directLight.direction,geometryViewDir,geometryClearcoatNormal,material);
    #endif
    #ifdef USE_SHEEN
    // 如果使用sheen材质，计算sheen的反射
    sheenSpecular+=irradiance*BRDF_Sheen(directLight.direction,geometryViewDir,geometryNormal,material.sheenColor,material.sheenRoughness);
    #endif
    
    // 根据金属度优化材质粗糙度
    float new_roughness=(1.-metalnessFactor)*pow(material.roughness,.4);
    new_roughness+=metalnessFactor*pow(material.roughness,1.2);
    PhysicalMaterial new_material=material;
    new_material.roughness=new_roughness;
    
    // 计算材质的镜面反射和漫反射
    reflectedLight.directSpecular+=irradiance*BRDF_GGX(directLight.direction,geometryViewDir,geometryNormal,new_material);
    reflectedLight.directDiffuse+=irradiance*BRDF_Lambert(new_material.diffuseColor);
}