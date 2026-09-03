import { ref, computed, h, onMounted, watch } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { getDepart3ListWithSecurity, getDepartmentList } from '/@/api/common/api';
import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
import { useUserStore } from '/@/store/modules/user';
import { useMessage } from '/@/hooks/web/useMessage';
const { createMessage } = useMessage();
const userStore = useUserStore();
const userinfo: any = computed(() => userStore.getUserInfo);
// 获取查询表单和新增表单 所属单位和所属部门的默认值
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
 * 表格列定义
 */
export const columns: BasicColumn[] = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 80,
    customRender: ({ index }) => index + 1,
  },
  {
    title: '类型',
    dataIndex: 'postType',
    width: 120,
  },
  {
    title: '所属单位',
    dataIndex: 'orgCode',
    width: 150,
  },
  {
    title: '所属车间',
    dataIndex: 'workshop',
    width: 150,
  },
  {
    title: '岗位',
    dataIndex: 'post',
    width: 120,
  },
  {
    title: '考评周期',
    dataIndex: 'cycle',
    width: 100,
  },
];

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
 * 自定义查询条件相关配置
 */
export const labelCol = {
  xs: { span: 24 },
  sm: { span: 5 },
};

export const wrapperCol = {
  xs: { span: 24 },
  sm: { span: 19 },
};

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
