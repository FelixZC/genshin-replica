
import * as POSTPROCESSING from "postprocessing";
import * as THREE from "three";

import bloomTransitionFragmentShader from "../Shaders/BloomTransition/frag.glsl";

/**
 * BloomTransitionEffect类，继承自POSTPROCESSING.Effect，用于实现 bloom 过渡效果。
 * @param {Object} 参数对象，包含效果的强度和白色透明度。
 * @param {number} intensity 效果的强度，默认为 0。
 * @param {number} whiteAlpha 白色透明度，默认为 0。
 */
export default class BloomTranstionEffect extends POSTPROCESSING.Effect {
  constructor({ intensity = 0, whiteAlpha = 0 } = {}) {
    super("BloomTranstionEffect", bloomTransitionFragmentShader, {
      // 创建统一变量映射，用于在着色器中访问
      uniforms: new Map([
        ["uIntensity", new THREE.Uniform(intensity)],
        ["uWhiteAlpha", new THREE.Uniform(whiteAlpha)],
      ]),
    });
  }
}