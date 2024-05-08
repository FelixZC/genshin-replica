/**
 * 使用kokomi.js组件框架和THREE.js渲染器，实现一个基于着色器的渐变背景组件。
 */
import * as kokomi from "kokomi.js";
import * as THREE from "three";

import type Experience from "../Experience";

import gradientBackgroundFragmentShader from "../Shaders/GradientBackground/frag.glsl";

/**
 * GradientBackground类，用于创建和管理一个渐变背景。
 */
export default class GradientBackground extends kokomi.Component {
  declare base: Experience; // 声明Experience类型的基类
  params; // 渐变背景的参数
  quad: kokomi.ScreenQuad; // 屏幕四边形，用于渲染背景

  /**
   * 构造函数，初始化渐变背景组件。
   * @param base - Experience类型，表示组件的基类实例。
   */
  constructor(base: Experience) {
    super(base);

    // 初始化渐变背景的参数
    this.params = {
      color1: "#001c54",
      color2: "#023fa1",
      color3: "#26a8ff",
      stop1: 0.2,
      stop2: 0.6,
    };

    // 创建一个使用着色器的屏幕四边形，用于渲染背景
    this.quad = new kokomi.ScreenQuad(this.base, {
      fragmentShader: gradientBackgroundFragmentShader,
      shadertoyMode: true,
      uniforms: {
        uColor1: {
          value: new THREE.Color(this.params.color1),
        },
        uColor2: {
          value: new THREE.Color(this.params.color2),
        },
        uColor3: {
          value: new THREE.Color(this.params.color3),
        },
        uStop1: {
          value: this.params.stop1,
        },
        uStop2: {
          value: this.params.stop2,
        },
      },
    });

    // 配置平面的渲染顺序和位置，使其成为背景
    const mesh = this.quad.mesh;
    mesh.position.z = -1000;
    mesh.renderOrder = -1; // 设置渲染顺序为最后
    mesh.frustumCulled = false; // 禁用视锥体剪裁

    const material = this.quad.mesh.material as THREE.ShaderMaterial;
    material.depthWrite = false; // 禁止深度写入，以便于背景始终在最前

    this.createDebug(); // 创建调试界面
  }

  /**
   * 将已存在的屏幕四边形添加到当前场景。
   */
  addExisting(): void {
    this.quad.addExisting();
  }

  /**
   * 创建调试界面，用于调整渐变背景的参数。
   */
  createDebug() {
    const debug = this.base.debug;
    const params = this.params;
    const material = this.quad.mesh.material as THREE.ShaderMaterial;

    // 如果调试模式开启，则创建参数调整界面
    if (debug.active) {
      const debugFolder = debug.ui!.addFolder("background");
      debugFolder.addColor(params, "color1").onChange((val: number) => {
        material.uniforms.uColor1.value = new THREE.Color(val);
      });
      debugFolder.addColor(params, "color2").onChange((val: number) => {
        material.uniforms.uColor2.value = new THREE.Color(val);
      });
      debugFolder.addColor(params, "color3").onChange((val: number) => {
        material.uniforms.uColor3.value = new THREE.Color(val);
      });
      debugFolder
        .add(params, "stop1")
        .min(0)
        .max(1)
        .onChange((val: number) => {
          material.uniforms.uStop1.value = val;
        });
      debugFolder
        .add(params, "stop2")
        .min(0)
        .max(1)
        .onChange((val: number) => {
          material.uniforms.uStop2.value = val;
        });
    }
  }
}