/**
 * AmbientLightComponent类扩展自kokomi.Component，用于管理Three.js中的环境光。
 * 它允许通过参数调整环境光的颜色和强度，并提供了一个调试界面。
 */
import * as kokomi from "kokomi.js";
import * as THREE from "three";

import type Experience from "../Experience";

export default class AmbientLightComponent extends kokomi.Component {
  declare base: Experience; // 声明Experience类型的base属性，用于访问经验组件的基础功能。
  params; // 存储环境光参数的对象。
  ambiLight: THREE.AmbientLight; // 代表Three.js中的环境光对象。

  /**
   * 构造函数初始化环境光组件。
   * @param base - 传入Experience类型实例，作为组件的基础。
   */
  constructor(base: Experience) {
    super(base);

    this.params = {
      color: 0x0f6eff, // 默认颜色值。
      intensity: 6, // 默认强度值。
    };

    // 根据参数创建一个Three.js的环境光对象。
    this.ambiLight = new THREE.AmbientLight(
      this.params.color,
      this.params.intensity
    );

    this.createDebug(); // 创建调试界面。
  }

  /**
   * 将环境光对象添加到场景容器中。
   */
  addExisting(): void {
    this.container.add(this.ambiLight);
  }

  /**
   * 创建用于调整环境光参数的调试界面。
   */
  createDebug() {
    const debug = this.base.debug; // 获取基础经验组件的调试信息。
    const params = this.params; // 获取环境光参数。

    // 如果调试模式激活，则创建调试文件夹并添加参数控制。
    if (debug.active) {
      const debugFolder = debug.ui!.addFolder("ambientLight");
      debugFolder.addColor(params, "color").onChange((val: number) => {
        this.ambiLight.color.set(val); // 颜色值改变时更新环境光颜色。
      });
      debugFolder
        .add(params, "intensity")
        .min(0)
        .max(10)
        .onChange((val: number) => {
          this.ambiLight.intensity = val; // 强度值改变时更新环境光强度。
        });
    }
  }
}