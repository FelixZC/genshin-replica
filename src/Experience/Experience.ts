import * as kokomi from "kokomi.js";
import * as THREE from "three";

import World from "./World/World";

import Debug from "./Debug";

import Postprocessing from "./Postprocessing";

import { resources } from "./resources";
/**
 * Experience类继承自kokomi.Base，用于初始化和管理整个应用的生命周期，
 * 包括场景、调试工具、后处理效果等的初始化。
 * @param sel (可选)选择器，用于指定渲染器挂载的HTML元素，默认为"#sketch"。
 */
export default class Experience extends kokomi.Base {
  world: World;          // 场景对象
  debug: Debug;         // 调试工具对象
  post: Postprocessing; // 后处理效果对象
  am: kokomi.AssetManager; // 资源管理器对象

  constructor(sel = "#sketch") {
    super(sel, {
      autoAdaptMobile: true, // 自动适应移动设备
    });

    (window as any).experience = this; // 将当前实例绑定到全局window对象上

    this.debug = new Debug(); // 初始化调试工具

    kokomi.enableShadow(this.renderer); // 启用阴影

    // 配置THREE.js颜色和光照管理，以适应新版变化
    THREE.ColorManagement.enabled = false;
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.useLegacyLights = true;

    // 初始化资源管理器
    this.am = new kokomi.AssetManager(this, resources, {
      useDracoLoader: true, // 使用DRACO压缩解码器
    });

    // 配置相机参数
    this.camera.position.set(0, 0, 0);
    const camera = this.camera as THREE.PerspectiveCamera;
    camera.fov = 45;
    camera.near = 50;
    camera.far = 100000;
    camera.rotation.x = THREE.MathUtils.degToRad(5.5);
    camera.updateProjectionMatrix();

    this.world = new World(this); // 初始化世界对象

    this.post = new Postprocessing(this); // 初始化后处理对象

    // 事件监听：当场景需要后台模糊效果时
    this.world.on("blur-behind", () => {
      this.post.blurBehind();
    });

    // 事件监听：当场景需要淡入 bloom 效果时
    this.world.on("bloom-in", () => {
      this.post.bloomTransitionIn();
    });
  }
}