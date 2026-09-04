import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { useGlobSetting } from '/@/hooks/setting';
const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;
enum Api {
  positionList = '/sys/position/list',
  userList = '/sys/user/list',
  roleList = '/sys/role/list',
  queryDepartTreeSync = '/sys/sysDepart/queryDepartTreeSync',
  queryTreeList = '/sys/sysDepart/queryTreeList',
  loadTreeData = '/sys/category/loadTreeData',
  loadDictItem = '/sys/category/loadDictItem/',
  getDictItems = '/sys/dict/getDictItems/',
  getTableList = '/sys/user/queryUserComponentData',
  getCategoryData = '/sys/category/loadAllData',
  orgList = '/jn/common/getDepart2List',
  departmentList = '/jn/common/getDepart3List',
  departTree23 = '/jn/common/getDepartTreeBy23',
  departTreeFor23 = '/jn/common/getDepartTreeFor23',
  uploadUrl = '/sys/common/upload',
  getTeamList = '/jn/common/getTeamList',
  userListByOrg = '/edu/common/pageUserList', // 分页查询
  getTimeFromServer = '/jn/common/getOrganizationNew',
  queryById = '/sys/user/queryByIds',
  sysOrgList = '/sys/common/orgList',
  getDepart3ListWithSecurity = '/jn/common/getDepart3ListWithSecurity', // 获取部门列表
  get3DepartList = '/jn/common/get3DepartList', // 获取所有部门列表-无权限
  fileUploadFile = '/filemanage/jnFileManage/uploadFile',
  selectDeptNew = '/jn/common/selectDeptNew', // 通过单位取车间
  getOrgToWork34 = '/work/api/getOrgToWork', // 按角色过滤机构数
}

/**
 * 上传父路径
 */
export const uploadUrl = `${baseUploadUrl}/sys/common/upload`;

export const fileUploadFile = `${baseUploadUrl}/filemanage/jnFileManage/uploadFile`;
/**
 * 图片预览
 */
export const picPreviewUrl = `${baseUploadUrl}/sys/common/static/`;

/**
 * 职务列表
 * @param params
 */
export const getPositionList = (params) => {
  return defHttp.get({ url: Api.positionList, params });
};

/**
 * 用户列表
 * @param params
 */
export const getUserList = (params) => {
  return defHttp.get({ url: Api.userListByOrg, params });
};

export const userListByOrg = (params) => {
  return defHttp.get({ url: Api.userListByOrg, params });
};

/**
 * 角色列表
 * @param params
 */
export const getRoleList = (params) => {
  return defHttp.get({ url: Api.roleList, params });
};

/**
 * 异步获取部门树列表
 */
export const queryDepartTreeSync = (params?) => {
  return defHttp.get({ url: Api.queryDepartTreeSync, params });
};
/**
 * 获取部门树列表
 */
export const queryTreeList = (params?) => {
  return defHttp.get({ url: Api.queryTreeList, params });
};

/**
 * 分类字典树控件 加载节点
 */
export const loadTreeData = (params?) => {
  return defHttp.get({ url: Api.loadTreeData, params });
};

/**
 * 根据字典code加载字典text
 */
export const loadDictItem = (params?) => {
  return defHttp.get({ url: Api.loadDictItem, params });
};

/**
 * 根据字典code加载字典text
 */
export const getDictItems = (dictCode) => {
  return defHttp.get({ url: Api.getDictItems + dictCode }, { joinTime: false });
};
/**
 * 部门用户modal选择列表加载list
 */
export const getTableList = (params) => {
  return defHttp.get({ url: Api.getTableList, params });
};
/**
 * 加载全部分类字典数据
 */
export const loadCategoryData = (params) => {
  return defHttp.get({ url: Api.getCategoryData, params });
};
/**
 * 文件上传
 */
export const uploadFile = (params, success, fail = () => {}) => {
  return defHttp.uploadFile({ url: Api.uploadUrl, baseURL: '' }, params, { success, fail });
};
/**
 * 下载文件
 * @param url 文件路径
 * @param fileName 文件名
 * @param parameter
 * @returns {*}
 */
export const downloadFileAll = (url, fileName?, parameter?) => {
  return getFileblob(url, parameter).then((data) => {
    console.log('downloadFileAll', data);
    if (data && data instanceof Blob) {
      // 尝试检查 Blob 的类型，如果是 JSON 则说明是错误响应
      if (data.type === 'application/json' || data.type.includes('json')) {
        return data.text().then((text) => {
          try {
            const errorData = JSON.parse(text);
            if (errorData.success === false || errorData.code === 500) {
              const errorMsg = errorData.message || '下载失败';
              message.error(errorMsg);
              throw new Error(errorMsg);
            }
          } catch (e) {
            // 解析失败，继续正常流程
          }
          return data;
        });
      }
    }
    if (!data || data.size === 0) {
      message.warning('文件下载失败');
      return;
    }
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
      window.navigator.msSaveBlob(new Blob([data]), fileName);
    } else {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); //下载完成移除元素
      window.URL.revokeObjectURL(url); //释放掉blob对象
    }
  })
};

/**
 * 下载文件 用于excel导出
 * @param url
 * @param parameter
 * @returns {*}
 */
export const getFileblob = (url, parameter) => {
  return defHttp.get(
    {
      url: url,
      params: parameter,
      responseType: 'blob',
    },
    { isTransformResponse: false }
  )
};

/**
 * 【用于评论功能】自定义文件上传-方法
 */
export const uploadMyFile = (url, data) => {
  return defHttp.uploadMyFile(url, data);
};
/**
 * 改后的文件预览
 */
export const previewFile = (filePath) => {
  return defHttp.get({ url: '/sys/common/previewPathHandle', params: { filePath } });
};
// 法律文件预览
export const doPreview = (filePath) => {
  return defHttp.get({ url: '/filemanage/jnFileManage/doPreview', params: { filePath } });
};
/**
 * 获取机构列表
 */
export const getOrgCodeList = () => {
  return defHttp.get({ url: Api.orgList });
};
/**
 * 获取部门列表
 */
export const getDepartmentList = (params) => {
  return defHttp.get({ url: Api.departmentList, params });
};
/**
 * 获取部门树
 *  */
export const getDepartTreeBy23 = () => {
  return defHttp.get({ url: Api.departTree23 });
};
/**
 * 获取部门树-解决封装组建的bug
 *  */
export const getDepartTreeFor23 = () => {
  return defHttp.get({ url: Api.departTreeFor23 });
};
/**
 * 获取班组
 */
export const getTeamList = (params) => {
  return defHttp.get({ url: Api.getTeamList, params });
};

/**
 * 获取服务器时间
 */
export function getResponseHeader() {
  return defHttp.get({ url: Api.getTimeFromServer }, { isReturnNativeResponse: true });
}
// 根据id查询用户
export const getUserById = (params) => {
  return defHttp.get({ url: Api.queryById, params });
};
/**
 * 教育培训机构列表-多级
 * @param level
 */
export function getEduOrgList(params) {
  return defHttp.get({ url: Api.sysOrgList, params });
}
// 查询三级单位
export const getDepart3ListWithSecurity = () => {
  return defHttp.get({ url: Api.getDepart3ListWithSecurity });
};
// 是否安全主管部门 34级机构
export const getOrgToWork34 = () => {
  return defHttp.get({ url: Api.getOrgToWork34 });
};
export const get3DepartList = () => {
  return defHttp.get({ url: Api.get3DepartList });
};
// 通过单位获取车间
export const selectDeptNew = (params) => defHttp.get({ url: Api.selectDeptNew, params });
// 根据角色部门,当前登录所属三级查询用户
export const getUserListByRole = (params) => {
  return defHttp.get({ url: '/edu/common/getUserListByRole', params });
};
// 查询所有角色
export const getRole = () => {
  return defHttp.get({ url: '/jn/common/getRole' });
};
// 获取岗位
export const getPost = (params) => {
  return defHttp.get({ url: '/jn/common/getPostList2', params });
};
// 获取树结构的厂和车间
// securityFlag 是否安全主管部门(默认按安全管理部，false全查)
export const getDepartTreeBy34 = (params?) => {
  return defHttp.get({ url: '/jn/common/getDepartTreeBy34', params });
};
// 查全部3级
export const getDepart3List = () => {
  return defHttp.get({ url: '/sys/common/getDepart3List' });
};
/**
 *
 * @returns 根据单位和车间查班组
 * @param orgCode(false)
 * @param workShopCode(false)
 */
export const getTeamList1 = (params) => {
  return defHttp.get({ url: '/jn/common/getTeamList1', params });
};
