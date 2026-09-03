import { defineStore } from 'pinia';
import { store } from '/@/store';

interface EduState {
  examConfig: object,
}
export const useEduStore = defineStore({
  id: 'education',
  state: (): EduState => ({
    examConfig: getSession('examConfig') || {cutScreen: false},
  }),
  getters: {
    getExamConfig():object{
      return this.examConfig;
    }
  },
  actions: {
    setExamConfig(params: any): void {
      this.examConfig = params;
      sessionStorage.setItem('examConfig', toString(params));
    }
  },
});

// Need to be used outside the setup
export function useEduStoreWithOut() {
  return useEduStore(store);
}

function getSession(key) {
    let data = sessionStorage.getItem(key);
    if (data) {
      return JSON.parse(decodeURI(data));
    }
    return {};
}

function toString(obj) {
    return encodeURI(JSON.stringify(obj));
}

