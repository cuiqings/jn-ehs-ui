import { useRoute } from 'vue-router';
import { useUserStore } from '/@/store/modules/user';
export const UnhazardousWork = () => {
    const route = useRoute();
    console.log('UnhazardousWork route:', route);
    // Check if the current route is 'UnhazardousWork-WorkRequisition'  
    return route.name === 'UnhazardousWork-WorkRequisition'
};
export const getWorkName = (workList) => {
    const userStore = useUserStore();
    let name = '';
    userStore.getAllDictItems.work_type.forEach((item) => {
      if (item.value == workList[0].workType) {
        name += item.label + ',';
      }
      if (workList[0].otherWorkApply && workList[0].otherWorkApply.length > 0) {
        workList[0].otherWorkApply.forEach((citem) => {
          if (item.value == citem.workType) {
            name += item.label + ',';
          }
        });
      }
    });
    return name.substring(0, name.length - 1);
  }