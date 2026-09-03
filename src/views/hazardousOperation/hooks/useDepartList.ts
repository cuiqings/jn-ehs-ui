import { ref } from 'vue';
import { getEduOrgList } from '/@/api/common/api';
import { useUserStore } from '/@/store/modules/user';
// canSelect: 可选择的部门等级
export const useDepartList = async (canSelect = 12, permission = 0, xgfCheck = true) => {
  const userStore: any = useUserStore();
  const applicationUnitList = ref<any[]>([]);
  // app回显用
  const applicationUnitName = ref('');
  const init = async () => {
    let params: any = { level: 4 };
    if (permission) params.permission = permission;
    const res = await getEduOrgList(params);
    applicationUnitList.value = splitDeptNames(res, '敬业');
  };
  await init();

  function splitDeptNames(arr, name) {
    arr.forEach((item) => {
      if (item.key.length < canSelect && !item.key.startsWith('A04B12')) item.selectable = false;
      if (item.key == 'A04B12') item.selectable = false;
      if (item.children) {
        splitDeptNames(item.children, item.title);
      }
      if (!item.children || item.children.length === 0) {
        // 如果没有子节点，则将部门名称前加上父级部门名称
        item.title = name + '-' + item.title;
      }
      if (item.key == userStore.getUserInfo.orgCode) {
        applicationUnitName.value = item.title;
      }
      item['id'] = item.key;
      item['text'] = item.title;
    });
    return arr;
  }
  return {
    applicationUnitList,
    applicationUnitName,
  };
};
