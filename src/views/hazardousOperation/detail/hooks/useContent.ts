import { ref } from 'vue';
import { getEduOrgList } from '/@/api/common/api';
import { useWorkStore } from '/@/store/modules/dangerousWork';
export const useContent = () => {
  const workStore = useWorkStore();
  const workList = workStore.getWorkList;

  const applicationUnitList = ref<any[]>([]);

  const init = async () => {
    const res = await getEduOrgList({ level: 4 });
    applicationUnitList.value = splitDeptNames(res, '敬业');
  };
  function splitDeptNames(arr, name) {
    arr.forEach((item) => {
      if (item.children) {
        splitDeptNames(item.children, item.title);
      }
      if (item.key.length == 12) {
        item.title = name + '-' + item.title;
      }
    });
    return arr;
  }

  return {
    init,
    workList,
    applicationUnitList,
  };
};
