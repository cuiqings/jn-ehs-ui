import { ref } from 'vue';
import { getApplyForUnit, getApprovalNew, getLoginUserOrg } from '../api';
import { getDepartTreeBy23, getDepart3ListWithSecurity  } from '/@/api/common/api';
import { useUserStore } from '/@/store/modules/user';
declare type Unit = {
  id: number;
  name: string;
  parentId: number;
  level: number;
  children: Unit[];
  orgCode: string;
  departName: string;
};
const unit = ref<Unit[]>([]);
const organization = ref<Unit[]>([]);
const workUnit = ref<Unit[]>([]);
const teamList = ref<any[]>([]);
const workUnitApp = ref<Unit[]>([]);
const person = ref<any[]>([]);
const rootUser = ref<any[]>([]);
const queryToDhUserList = ref<any[]>([]);
const lookFireList = ref<any[]>([]);
const workType = ref<Object[]>([]);
const userStore = useUserStore();
const userInfoPrev = ref<any>({id: ''});
export const useApiData = async () => {
  console.log(userInfoPrev.value.realname || '', userInfoPrev.value.id || '');
  if (unit.value.length === 0 || userInfoPrev.value.id != userStore.getUserInfo.id) {
    unit.value = await getLoginUserOrg();
  } else if (userStore.getUserInfo.orgCode?.length > 6 || userStore.getUserInfo.orgCode?.substring(0, 6) !== unit.value[0].orgCode) {
    unit.value = await getLoginUserOrg();
  }
  if (organization.value.length === 0 || userInfoPrev.value.id != userStore.getUserInfo.id) {
    organization.value = await getDepart3ListWithSecurity();
  }
 
  if (workUnit.value.length === 0 || person.value.length === 0 || userInfoPrev.value.id != userStore.getUserInfo.id) {
    workUnit.value = await getDepartTreeBy23();
    workUnit.value && workUnit.value.forEach((item: any) => {
      delete item.key;
      item.selectable = false;
      item.text = item.departName;
      item.id = item.orgCode;
      if(item.children && item.children.length > 0){
        item.children.forEach(val => {
          delete val.key;
          val.text = val.departName;
          val.id = val.orgCode;
          // return val.orgAttribute == 2
        })
      }
    });
    person.value = await getApprovalNew({ departIds: '' });
    person.value.map((val) => {
      val.realname = val.title;
    });
  }

  userInfoPrev.value = JSON.parse(JSON.stringify(userStore.getUserInfo));
  console.log(userInfoPrev.value);

  const getUserByorg = (orgCode: string, includes: boolean = false) => {
    let users = [];
    if(includes){
      users = person.value.filter((val) => {
        if(val.orgCode){
          val.username = val.realname
          val.text = val.realname
          return val.orgCode.includes(orgCode)
        } else {
          val.username = val.realname
          val.text = val.realname
          return false;
        }
    }) as never[];
    } else {
      users = person.value.filter((val) => {
        val.username = val.realname
        val.text = val.realname
        return val.orgCode == orgCode;
      }) as never[];
    }
    return users;
  };
  workType.value = userStore.getAllDictItems.work_type;
  return { unit, workUnit, workUnitApp, person, organization, rootUser, queryToDhUserList, getUserByorg, lookFireList, workType };
};
export default useApiData;
