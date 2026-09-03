import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useUserStore } from '/@/store/modules/user';
import { getJobType } from '/@/views/hazardousOperation/api/index';
const userStore: any = useUserStore();
const workTypeList = ref(userStore.getAllDictItems.work_type);
const asyncKeys = ['sceneHead', 'sceneHeadName', 'workUnitGuardian', 'workUnitGuardianName', 'startTime', 'endTime', 'start'];
export const useWorkStore = defineStore({
  id: 'app-dangerousWork',
  state: () => {
    workTypeList.value = userStore.getAllDictItems.work_type;
    return {
      workList: [
        {
          checkAdmin: '1',
          applicationUnit: userStore.getUserInfo.orgCode,
          applicantName: userStore.getUserInfo.realname,
          affiliation: userStore.getUserInfo.orgCode,
          applicant: userStore.getUserInfo.id,
          securityMeasuresUser: '',
          workType: undefined,
          possibleDanger: [],
          workTypeList: workTypeList.value,
          securityMeasuresIds: [],
          protectiveEquipmentIds: [],
          procedureIds: [],
          securityMeasuresIdList: [],
        },
      ],
    };
  },
  getters: {
    getWorkList(): any[] {
      return this.workList;
    },
  },
  actions: {
    setWorkList(workList: any[]) {
      workList.forEach((item) => {
        item.workTypeList = workTypeList.value;
      });
      this.workList = workList;
    },
    async addWorkList() {
      console.log('addWorkList:', workTypeList.value);
      workTypeList.value = await getJobType();
      this.workList.forEach((item) => {
        workTypeList.value = workTypeList.value.filter((items) => {
          return items.value != item.workType && !['5', '6', '7'].includes(items.value);
        });
      });
      const newWork = { ...this.workList[this.workList.length - 1], workTypeList: workTypeList.value };
      newWork.workType = undefined;
      newWork.workTypeName = undefined;
      newWork.possibleDanger = [];
      newWork.operator = '';
      newWork.operatorName = '';
      newWork.securityMeasuresIds = [];
      if (newWork.id) delete newWork.id;
      this.workList.push(newWork);
    },
    removeWorkList(idx: number) {
      this.workList.splice(idx, 1);
    },
    deleteWorkList(idx: number) {
      console.log('deleteWorkList', idx);
      this.workList.splice(idx, 1);
      console.log(this.workList);
      if (idx > 0 && this.workList.otherWorkApply && this.workList.otherWorkApply.length > 0) {
        this.workList.otherWorkApply.splice(idx - 1, 1);
      }
    },
    // 将otherWorkApply中的work 添加到workList中
    updateWorkList(workList: any[]) {
      workList.workTypeList = workTypeList.value;
      this.workList.push(workList);
    },
    resetWorkList() {
      workTypeList.value = ref(userStore.getAllDictItems.work_type);
      this.workList = [
        {
          checkAdmin: '1',
          applicationUnit: userStore.getUserInfo.orgCode,
          applicantName: userStore.getUserInfo.realname,
          affiliation: userStore.getUserInfo.orgCode,
          applicant: userStore.getUserInfo.id,
          securityMeasuresUser: '',
          workType: undefined,
          possibleDanger: [],
          workTypeList: workTypeList.value,
          securityMeasuresIds: [],
          protectiveEquipmentIds: [],
          procedureIds: [],
          securityMeasuresIdList: [],
        },
      ];
      console.log('resetWorkList:', this.workList);
    },
    // 同步更新每一个work
    async syncUpdateWorkList(idx: number) {
      if (this.workList.length == 1) return;
      console.log('syncUpdateWorkList:', idx, this.workList[idx]);
      asyncKeys.forEach((key) => {
        this.workList.forEach((item, index) => {
          if (index != idx) {
            try {
              item[key] = this.workList[idx][key];              
              if (key == 'workUnitGuardian') {
                item.securityMeasuresUser = this.workList[idx].securityMeasuresUser;
              }
            } catch (error) {
              console.log(error);
            }
          }
        });
      });
    },
  },
});
