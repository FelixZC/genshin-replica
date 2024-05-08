/**
 * ForwardCamera类，继承自kokomi.Component，用于控制相机的向前移动和特殊动作（如停止和潜水）。
 * @extends kokomi.Component
 */
import * as kokomi from "kokomi.js";
import * as THREE from "three";
import gsap from "gsap";

import type Experience from "../Experience";

export default class ForwardCamera extends kokomi.Component {
  declare base: Experience; // 声明Experience类型的基类
  params; // 控制参数对象
  center: THREE.Vector3; // 相机移动的中心点
  t1: ReturnType<typeof gsap.timeline>; // gsap时间线对象，用于动画控制

  /**
   * ForwardCamera类的构造函数。
   * @param {Experience} base - 继承自Experience的实例，作为组件的基础对象。
   */
  constructor(base: Experience) {
    super(base);

    this.params = {
      speed: 88, // 相机移动速度
      isRunning: true, // 控制相机是否正在移动的标志
    };

    this.center = new THREE.Vector3(0, 0, 0); // 初始化中心点位置

    this.t1 = gsap.timeline(); // 创建gsap时间线

    this.createDebug(); // 创建调试界面
  }

  /**
   * 每帧更新函数，用于控制相机的向前移动。
   */
  update(): void {
    if (this.params.isRunning) {
      const delta = this.base.clock.deltaTime; // 获取时间差
      this.center.add(
        new THREE.Vector3(0, 0, -this.params.speed).multiplyScalar(delta) // 根据速度和时间差更新中心点位置
      );
      this.base.camera.position.copy(this.center); // 将相机位置更新为中心点位置
    }
  }

  /**
   * 创建调试界面，允许调整相机移动速度和启停。
   */
  createDebug() {
    const debug = this.base.debug;
    const params = this.params;

    if (debug.active) { // 如果调试模式开启
      const debugFolder = debug.ui!.addFolder("forwardCamera"); // 创建调试文件夹
      debugFolder.add(params, "speed").min(-500).max(500); // 添加速度控制器
      debugFolder.add(params, "isRunning"); // 添加启停控制器
    }
  }

  /**
   * 停止相机运动的函数。
   */
  stop() {
    this.params.isRunning = false; // 将相机移动标志设置为停止
    const originPos = this.base.camera.position.clone(); // 克隆相机当前位置
    this.t1.to(this.base.camera.position, { // 创建动画，平滑停止相机
      x: originPos.x,
      y: originPos.y,
      z: originPos.z - 165,
      duration: 5,
      ease: "power2.out",
    });
  }

  /**
   * 让相机快速向内移动的函数，用于特殊效果。
   */
  diveIn() {
    const originPos = this.base.camera.position.clone(); // 克隆相机当前位置
    this.t1.clear(); // 清除当前时间线上的所有动画
    this.t1.to(this.base.camera.position, { // 创建动画，让相机迅速向内移动
      x: originPos.x,
      y: originPos.y,
      z: originPos.z - 400,
      duration: 0.6,
      ease: "power2.in",
    });
  }
}