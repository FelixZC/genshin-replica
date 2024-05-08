/**
 * `DirectionalLightComponent`类扩展自kokomi.Component，用于创建和管理Three.js中的方向光源。
 * 该组件使得光源能够跟随相机移动，并提供调试界面来调整光源参数。
 */
import * as kokomi from "kokomi.js";
import * as THREE from "three";

import type Experience from "../Experience";

export default class DirectionalLightComponent extends kokomi.Component {
  declare base: Experience; // 声明Experience类型的基类
  params; // 存放光源参数的对象
  dirLight: THREE.DirectionalLight; // Three.js中的方向光源对象
  target: THREE.Object3D; // 光源目标对象，用于调整光源方向
  originPos: THREE.Vector3; // 光源的原始位置

  /**
   * 构造函数
   * @param base {Experience} - 继承的Experience基类实例，提供场景和相机等基础元素。
   */
  constructor(base: Experience) {
    super(base);

    // 初始化光源参数
    this.params = {
      color: 0xff6222,
      intensity: 35,
    };

    // 创建并配置方向光源
    const dirLight = new THREE.DirectionalLight(
      this.params.color,
      this.params.intensity
    );
    this.dirLight = dirLight;
    dirLight.castShadow = true; // 光源投射阴影
    // 配置阴影映射的大小和相机参数
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.top = 400;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 400;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 50000;
    dirLight.shadow.bias = -0.00005; // 阴影偏移量调整

    // 创建光源目标对象并设置初始位置
    const target = new THREE.Object3D();
    this.target = target;
    dirLight.target = target;

    // 计算并设置光源的原始位置
    const originPos = new THREE.Vector3(10000, 0, 6000);
    originPos.y = Math.hypot(originPos.x, originPos.z) / 1.35;
    this.originPos = originPos;

    // 创建调试界面元素
    this.createDebug();
  }

  /**
   * 将光源和光源目标对象添加到场景容器中
   */
  addExisting(): void {
    this.container.add(this.dirLight);
    this.container.add(this.target);
  }

  /**
   * 更新函数，每帧调用，用于调整光源位置使其跟随相机。
   */
  update(): void {
    // 根据相机位置和原始位置更新光源位置
    this.dirLight.position.copy(
      this.base.camera.position.clone().add(this.originPos)
    );
    // 设置光源目标位置为相机位置
    this.dirLight.target.position.copy(this.base.camera.position);
  }

  /**
   * 创建光源的调试界面，允许调整光源颜色和强度。
   */
  createDebug() {
    const debug = this.base.debug;
    const params = this.params;

    // 如果调试模式开启，创建并配置光源的调试界面
    if (debug.active) {
      const debugFolder = debug.ui!.addFolder("directionalLight");
      debugFolder.addColor(params, "color").onChange((val: number) => {
        this.dirLight.color.set(val);
      });
      debugFolder
        .add(params, "intensity")
        .min(0)
        .max(50)
        .onChange((val: number) => {
          this.dirLight.intensity = val;
        });
    }
  }
}