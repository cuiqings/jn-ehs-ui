/**
 * 安全作业检查 - 检查照片分类
 * 检查、整改、整改确认、回显共用
 */

export interface ImgData {
  id: string;
  name: string;
  url: string;
}

export interface CheckImgCategory {
  id: string;
  name: string;
  required: boolean;
}

/** 固定 5 类检查照片，其他措施非必填 */
export const CHECK_IMG_CATEGORIES: CheckImgCategory[] = [
  { id: '1', name: '作业票', required: true },
  { id: '2', name: '核心措施', required: true },
  { id: '3', name: '干部会签', required: true },
  { id: '4', name: '监护人履职', required: true },
  { id: '5', name: '其他措施', required: false },
];

/** 每类最多上传的照片数 */
export const CHECK_IMG_MAX_COUNT = 10;

/** imgType: 1 分类照片(imgJson) 2 旧的不分类照片(imgUrl) */
export const IMG_TYPE_NEW = '1';
export const IMG_TYPE_OLD = '2';

/** 分类id -> 该类下的图片地址列表 */
export type CheckImgMap = Record<string, string[]>;

export const createCheckImgMap = (): CheckImgMap => {
  const map: CheckImgMap = {};
  CHECK_IMG_CATEGORIES.forEach((cat) => (map[cat.id] = []));
  return map;
};

/** 逗号拼接的地址串 / 数组 统一成数组 */
export const toUrlList = (url: string | string[] | undefined | null): string[] => {
  if (!url) return [];
  const list = Array.isArray(url) ? url : String(url).split(',');
  return list.filter((item) => item && String(item).trim());
};

/** 提交用：分类map -> ImgData[]，一个类别一条，url 为该类图片逗号拼接，空类别不提交 */
export const buildImgList = (map: CheckImgMap): ImgData[] => {
  return CHECK_IMG_CATEGORIES.map((cat) => ({
    id: cat.id,
    name: cat.name,
    url: toUrlList(map[cat.id]).join(','),
  })).filter((img) => img.url);
};

/** 校验必填类别，返回缺失的类别名，全部通过返回 [] */
export const findMissingCategories = (map: CheckImgMap): CheckImgCategory[] => {
  return CHECK_IMG_CATEGORIES.filter((cat) => cat.required && toUrlList(map[cat.id]).length === 0);
};

export const parseImgJson = (imgJson: string | ImgData[] | undefined | null): ImgData[] => {
  if (!imgJson) return [];
  if (Array.isArray(imgJson)) return imgJson;
  try {
    const parsed = JSON.parse(imgJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('checkImg-parseImgJson-err', err, imgJson);
    return [];
  }
};

export interface CheckImgGroup {
  /** 分类id，旧数据为空 */
  id: string;
  /** 分类名，旧数据为空 */
  name: string;
  /** 该组图片逗号拼接 */
  url: string;
}

/**
 * 回显用：按 imgType 兼容新旧数据
 * imgType=1 走 imgList 的 5 类分组，否则退回旧的不分类 imgUrl
 */
export const resolveCheckImgGroups = (record: any): CheckImgGroup[] => {
  if (!record) return [];
  if (String(record.imgType) !== IMG_TYPE_NEW) {
    const url = toUrlList(record.imgUrl).join(',');
    return url ? [{ id: '', name: '', url }] : [];
  }
  // 服务端回显返回 imgList(数组)，imgJson 是入库字段，做个兜底
  const list = parseImgJson(record.imgList ?? record.imgJson);
  return CHECK_IMG_CATEGORIES.map((cat) => {
    const hit = list.find((img) => String(img.id) === cat.id);
    return { id: cat.id, name: cat.name, url: toUrlList(hit?.url).join(',') };
  }).filter((group) => group.url);
};

/** 是否有可展示的照片 */
export const hasCheckImg = (record: any): boolean => resolveCheckImgGroups(record).length > 0;
