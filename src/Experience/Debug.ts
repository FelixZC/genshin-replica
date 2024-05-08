/**
 * Debug类用于管理和控制lil-gui的界面实例。
 * 该类激活状态依赖于浏览器URL的hash值是否为"#debug"。
 * 当激活时，它会创建并管理一个lil-gui的界面实例。
 */
import * as dat from "lil-gui";

export default class Debug {
  active: boolean; // 指示Debug类是否处于激活状态
  ui: dat.GUI | null; // 存储lil-gui的界面实例，未激活时为null

  /**
   * Debug类的构造函数。
   * 通过检查浏览器的URL hash值来决定是否激活Debug模式。
   * 如果处于激活状态，则创建一个新的dat.GUI实例。
   */
  constructor() {
    // 根据浏览器的URL hash值决定是否激活Debug模式
    this.active = window.location.hash === "#debug";

    // 默认情况下，ui为null
    this.ui = null;

    // 如果Debug模式被激活，则创建一个新的GUI实例
    if (this.active) {
      this.ui = new dat.GUI();
    }
  }
}