// 定义一个模块，用于处理 *.glsl 文件的导入，将其作为字符串默认导出
declare module "*.glsl" {
  const value: string;
  export default value;
}

/**
 * 定义一个 MeshInfo 接口，用于描述一个网格信息
 * @property {string} object - 网格对象的名称
 * @property {THREE.Vector3} position - 网格的位置信息
 * @property {THREE.Quaternion} rotation - 网格的旋转信息
 * @property {THREE.Vector3} scale - 网格的缩放信息
 */
interface MeshInfo {
  object: string;
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  scale: THREE.Vector3;
}

/**
 * 定义一个 InstanceInfo 接口，用于描述实例化信息
 * @property {string} object - 实例对象的名称
 * @property {MeshInfo[]} instanceList - 实例化网格的信息列表
 * @property {THREE.InstancedMesh[]} meshList - 实例化网格的Three.js实例列表
 */
interface InstanceInfo {
  object: string;
  instanceList: MeshInfo[];
  meshList: THREE.InstancedMesh[];
}