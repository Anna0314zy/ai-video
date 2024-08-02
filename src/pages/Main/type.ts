export interface IData {
  name: string
  type: DesignType // 1 对应剧本设计 2 对应镜头设计
}
// 剧本设计  镜头图片设计 镜头视频设计 镜头旁白设计

export enum DesignType {
  ScriptDesign = 1,
  ImageDesign = 2,
  VideoDesign = 3,
  NarrationDesign = 4,
}
