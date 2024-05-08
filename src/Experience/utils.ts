/**
 * 该模块提供了一系列函数，用于创建具有不同图形风格的Three.js材质，
 * 适用于卡通化渲染效果。
 */

import * as THREE from "three";

// 引入GLSL着色器代码片段
import lights_fragment_beginToon from "../Experience/Shaders/Common/lights_fragment_beginToon.glsl";
import ACES_fog_fragment from "../Experience/Shaders/Common/ACES_fog_fragment.glsl";
import RE_Direct_ToonPhysical from "../Experience/Shaders/Common/RE_Direct_ToonPhysical.glsl";
import RE_Direct_ToonPhysical_Road from "../Experience/Shaders/Common/RE_Direct_ToonPhysical_Road.glsl";

/**
 * 创建用于柱状物体的卡通材质。
 * @param material - 一个Three.js的MeshStandardMaterial对象，将基于此材料进行定制。
 * @returns 修改后的MeshStandardMaterial对象，应用了卡通化渲染效果。
 */
const getToonMaterialColumn = (material: THREE.MeshStandardMaterial) => {
  material.metalness = 0.3;
  // 在编译材质前，注入自定义的着色器代码，以实现特殊的卡通化渲染效果
  material.onBeforeCompile = (shader) => {
    let fragment = shader.fragmentShader;
    // 替换物理灯光参数部分，加入定制的卡通化物理光照处理
    fragment = fragment.replace(
      "#include <lights_physical_pars_fragment>",
      `
            #include <lights_physical_pars_fragment>
            ${RE_Direct_ToonPhysical}
            `
    );
    // 替换灯光片段开始部分，加入自定义的灯光处理代码
    fragment = fragment.replace(
      "#include <lights_fragment_begin>",
      `
            ${lights_fragment_beginToon}
            `
    );
    // 替换雾效处理部分，加入自定义的雾效代码
    fragment = fragment.replace(
      "#include <fog_fragment>",
      `
            ${ACES_fog_fragment}
            `
    );
    shader.fragmentShader = fragment;
  };
  return material;
};

/**
 * 创建用于道路物体的卡通材质。
 * @param material - 一个Three.js的MeshStandardMaterial对象，将基于此材料进行定制。
 * @param renderer - 一个Three.js的WebGLRenderer对象，用于获取渲染器的能力和设置。
 * @returns 修改后的MeshStandardMaterial对象，应用了卡通化渲染效果，特别适用于道路表现。
 */
const getToonMaterialRoad = (
  material: THREE.MeshStandardMaterial,
  renderer: THREE.WebGLRenderer
) => {
  // 配置材质颜色和粗糙度，适用于道路的表现
  material.color.multiply(
    new THREE.Color("#fffcfe").add(new THREE.Color().setRGB(0.015, 0, 0))
  );
  material.normalMap!.minFilter = THREE.LinearMipmapLinearFilter;
  // 设置各向异性过滤，提升纹理的表现质量
  material.normalMap!.anisotropy = renderer.capabilities.getMaxAnisotropy() / 2;
  material.roughnessMap!.anisotropy = renderer.capabilities.getMaxAnisotropy() / 2;
  material.map!.anisotropy = renderer.capabilities.getMaxAnisotropy() / 2;
  // 设置材质的粗糙度和金属度
  material.roughness = 5;
  material.metalness = 0;
  // 和柱状物材质相似，但在着色器中使用不同的光照处理代码
  material.onBeforeCompile = (shader) => {
    let fragment = shader.fragmentShader;
    fragment = fragment.replace(
      "#include <lights_physical_pars_fragment>",
      `
          #include <lights_physical_pars_fragment>
          ${RE_Direct_ToonPhysical_Road}
          `
    );
    fragment = fragment.replace(
      "#include <lights_fragment_begin>",
      `
          ${lights_fragment_beginToon}
          `
    );
    shader.fragmentShader = fragment;
  };
  return material;
};

/**
 * 创建用于门物体的卡通材质。
 * @param material - 一个Three.js的MeshStandardMaterial对象，将基于此材料进行定制。
 * @returns 修改后的MeshStandardMaterial对象，应用了卡通化渲染效果，特别适用于门的表现。
 */
const getToonMaterialDoor = (material: THREE.MeshStandardMaterial) => {
  // 设置门的金属度和颜色
  material.metalness = 0.15;
  material.color = new THREE.Color("#454545");
  // 和前两个材质类似，修改着色器代码以实现卡通化效果
  material.onBeforeCompile = (shader) => {
    let fragment = shader.fragmentShader;
    fragment = fragment.replace(
      "#include <lights_physical_pars_fragment>",
      `
          #include <lights_physical_pars_fragment>
          ${RE_Direct_ToonPhysical_Road}
          `
    );
    fragment = fragment.replace(
      "#include <lights_fragment_begin>",
      `
          ${lights_fragment_beginToon}
          `
    );
    shader.fragmentShader = fragment;
  };
  return material;
};

// 导出创建的材质处理函数
export { getToonMaterialColumn, getToonMaterialRoad, getToonMaterialDoor };