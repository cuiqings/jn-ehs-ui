import { ref, computed, onMounted } from 'vue';
import { getDepart3ListWithSecurity, getDepartmentList } from '/@/api/common/api';
import { useUserStore } from '/@/store/modules/user';

const userStore = useUserStore();
const userinfo: any = computed(() => userStore.getUserInfo);

// 获取查询表单默认值
const orgCode = ref(undefined);
const departCode = ref(undefined);

// 初始化时设置默认值
onMounted(() => {
  if (userinfo.value.orgCode > 9) {
    orgCode.value = userinfo.value.orgCode.slice(0, 9);
    departCode.value = userinfo.value.orgCode.slice(0, 12);
    if (orgCode.value) {
      getDepartList(orgCode.value);
    }
  } else if (userinfo.value.orgCode == 9) {
    orgCode.value = userinfo.value.orgCode;
    departCode.value = undefined;
    if (orgCode.value) {
      getDepartList(orgCode.value);
    }
  } else {
    orgCode.value = undefined;
    departCode.value = undefined;
  }
});

/**
 * 获取组织机构选项
 */
export const orgOptions: any = ref([]);
export const departOptions: any = ref([]);

/**
 * 获取所属单位选项列表
 */
function getOrgList() {
  getDepart3ListWithSecurity().then((res) => {
    orgOptions.value = res.map((item) => {
      return {
        label: item.departName,
        value: item.orgCode,
      };
    });
  });
}
getOrgList();

/**
 * 获取车间选项
 */
export function getDepartList(orgCode: string) {
  getDepartmentList({ orgCode: orgCode }).then((res) => {
    departOptions.value = res.map((item) => {
      return {
        label: item.departName,
        value: item.orgCode,
      };
    });
  });
}

/**
 * 类型选项
 */
export const typeOptions = [
  {
    label: '科段级及以上',
    value: '2',
  },
  {
    label: '科段级以下',
    value: '1',
  },
];

/**
 * 考评周期选项
 */
export const cycleOptions = [
  {
    label: '每月',
    value: '1',
  },
  {
    label: '每季',
    value: '2',
  },
];

/**
 * 审核状态选项
 */
export const statusOptions = [
  {
    label: '待审核',
    value: '待审核',
  },
  {
    label: '审核通过',
    value: '审核通过',
  },
];

/**
 * 履职结果选项
 */
export const resultOptions = [
  {
    label: '合格',
    value: '2',
  },
  {
    label: '基本合格',
    value: '1',
  },
  {
    label: '不合格',
    value: '0',
  },
];

/**
 * 手机端筛选选项配置
 */
export const filterOptions = {
  type: typeOptions,
  cycle: cycleOptions,
  status: statusOptions,
  result: resultOptions,
};