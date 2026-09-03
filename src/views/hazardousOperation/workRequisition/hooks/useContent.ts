import { computed } from 'vue';
import { useWorkStore } from '/@/store/modules/dangerousWork';
import { useDepartList } from '../../hooks/useDepartList';
export const useContent = async () => {
  const workStore = useWorkStore();
  const workList = computed(() => workStore.getWorkList);

  const { applicationUnitList } = await useDepartList();

  return {
    // init,
    workList,
    applicationUnitList,
  };
};
