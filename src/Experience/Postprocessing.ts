/**
 * Postprocessing类，负责管理后处理效果，包括景深、光晕过渡等。
 * @extends kokomi.Component 从kokomi.js的Component类继承。
 */
import * as kokomi from "kokomi.js";
import * as THREE from "three";
import * as POSTPROCESSING from "postprocessing";
import gsap from "gsap";

import type Experience from "./Experience";

import BloomTranstionEffect from "./Effects/BloomTranstionEffect";

export default class Postprocessing extends kokomi.Component {
  declare base: Experience; // 声明Experience类型的base属性。
  params; // 用于存储各种后处理效果的参数。
  bt: BloomTranstionEffect; // 光晕过渡效果实例。
  dof: POSTPROCESSING.DepthOfFieldEffect; // 景深效果实例。
  
  /**
   * 构造函数，初始化后处理效果和参数。
   * @param {Experience} base - 经验实例，提供场景、相机和渲染器等。
   */
  constructor(base: Experience) {
    super(base);

    // 初始化参数。
    this.params = {
      bloomTransitionIntensity: 0,
      bloomTransitionWhiteAlpha: 0,
      dofBokehScale: 0,
      dofFocusDistance: 0,
      dofFocalLength: 0.05,
    };

    // 创建EffectComposer用于组合和管理后处理效果。
    const composer = new POSTPROCESSING.EffectComposer(this.base.renderer, {
      frameBufferType: THREE.HalfFloatType,
      multisampling: 8,
    });
    // @ts-ignore
    this.base.composer = composer;

    // 添加基础渲染pass，用于渲染原始场景。
    composer.addPass(
      new POSTPROCESSING.RenderPass(this.base.scene, this.base.camera)
    );

    // 初始化并添加光晕过渡效果。
    const bt = new BloomTranstionEffect({
      intensity: this.params.bloomTransitionIntensity,
      whiteAlpha: this.params.bloomTransitionWhiteAlpha,
    });
    this.bt = bt;

    const customEffectPass = new POSTPROCESSING.EffectPass(
      this.base.camera,
      bt
    );
    composer.addPass(customEffectPass);

    // 初始化并添加光晕效果。
    const bloom = new POSTPROCESSING.BloomEffect({
      blendFunction: POSTPROCESSING.BlendFunction.ADD,
      mipmapBlur: true,
      luminanceThreshold: 2,
      intensity: 0.6,
    });

    // 初始化并添加景深效果。
    const dof = new POSTPROCESSING.DepthOfFieldEffect(this.base.camera, {
      bokehScale: this.params.dofBokehScale,
      focusDistance: this.params.dofFocusDistance,
      focalLength: this.params.dofFocalLength,
    });
    this.dof = dof;

    // 初始化并添加色调映射效果。
    const tonemapping = new POSTPROCESSING.ToneMappingEffect({
      mode: POSTPROCESSING.ToneMappingMode.ACES_FILMIC,
    });

    // 创建包含所有效果的effect pass，并添加到composer中。
    const effectPass = new POSTPROCESSING.EffectPass(
      this.base.camera,
      bloom,
      dof,
      tonemapping
    );
    composer.addPass(effectPass);

    // 创建调试界面。
    this.createDebug();
  }

  /**
   * 创建并设置调试界面，用于调整后处理效果的参数。
   */
  createDebug() {
    const debug = this.base.debug;
    const params = this.params;

    // 如果调试模式激活，则创建并设置参数调整界面。
    if (debug.active) {
      const debugFolderBt = debug.ui!.addFolder("bloomTransition");
      debugFolderBt
        .add(params, "bloomTransitionIntensity")
        .min(0)
        .max(5)
        .name("intensity")
        .onChange((val: number) => {
          const intensity = this.bt.uniforms.get("uIntensity")!;
          intensity.value = val;
        });
      debugFolderBt
        .add(params, "bloomTransitionWhiteAlpha")
        .min(0)
        .max(1)
        .name("whiteAlpha")
        .onChange((val: number) => {
          const whiteAlpha = this.bt.uniforms.get("uWhiteAlpha")!;
          whiteAlpha.value = val;
        });

      const debugFolderDof = debug.ui!.addFolder("depthOfField");
      debugFolderDof
        .add(params, "dofBokehScale")
        .min(0)
        .max(5)
        .step(0.001)
        .name("bokehScale")
        .onChange((val: number) => {
          this.dof.bokehScale = val;
        });
      debugFolderDof
        .add(params, "dofFocusDistance")
        .min(0)
        .max(1)
        .step(0.001)
        .name("focusDistance")
        .onChange((val: number) => {
          this.dof.cocMaterial.uniforms.focusDistance.value = val;
        });
      debugFolderDof
        .add(params, "dofFocalLength")
        .min(0)
        .max(1)
        .step(0.001)
        .name("focalLength")
        .onChange((val: number) => {
          this.dof.cocMaterial.uniforms.focalLength.value = val;
        });
    }
  }

  /**
   * 光晕过渡效果入动画，用于场景切换时的过渡效果。
   */
  bloomTransitionIn() {
    const intensity = this.bt.uniforms.get("uIntensity")!;
    const whiteAlpha = this.bt.uniforms.get("uWhiteAlpha")!;
    gsap.to(intensity, {
      value: 3,
      duration: 0.84,
      ease: "power2.in",
    });
    gsap.to(whiteAlpha, {
      value: 1,
      duration: 0.2,
      delay: 0.5,
    });
  }

  /**
   * 模糊背景效果，用于突出前景物体。
   */
  blurBehind() {
    gsap.to(this.dof, {
      bokehScale: 3.6,
      ease: "power2.out",
    });
  }
}