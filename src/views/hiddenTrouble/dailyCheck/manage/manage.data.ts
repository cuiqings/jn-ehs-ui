import { BasicColumn, FormSchema } from '/@/components/Table';
import { defHttp } from '/@/utils/http/axios';
import { ref } from 'vue';
getOrgList();
const orgOptions = ref([]);
async function getOrgList() {
  await defHttp.get({ url: '/jn/common/getOrganizationNew' }).then((res) => {
    orgOptions.value = res.map((item) => {
      return {
        label: item.departName,
        value: item.orgCode,
      };
    });
  });
}
export const columns: BasicColumn[] = [
  {
    title: '所属单位',
    width: 120,
    dataIndex: 'orgName',
  },
  {
    title: '所属车间',
    dataIndex: 'departName',
    width: 120,
  },
  {
    title: '计划名称',
    width: 160,
    dataIndex: 'planName',
  },
  {
    title: '计划类型',
    width: 150,
    dataIndex: 'planType_dictText',
  },
 
  {
    title: '巡检周期',
    width: 100,
    dataIndex: 'checkCycle_dictText',
  },
  {
    title: '责任人',
    dataIndex: 'checkDutyPersonName',
    width: 120,
  },
  {
    title: '执行人',
    dataIndex: 'executePersonName',
    width: 160,
  },
  {
    title: '计划状态',
    width: 120,
    dataIndex: 'useFlag',
    customRender: ({ text }) => {
      return text === '1' ? '启用' : '停用';
    },
  },
];
export const checkLibraryColumns: BasicColumn[] = [
  {
    title: '所属机构',
    width: 100,
    dataIndex: 'orgName',
  },
  {
    title: '所属部门',
    dataIndex: 'departName',
    width: 100,
  },
  {
    title: '检查项分类',
    width: 100,
    dataIndex: 'itemType_dictText',
  },
  {
    title: '检查项',
    dataIndex: 'itemName',
    width: 100,
  },
  {
    title: '检查内容/方法',
    dataIndex: 'checkContent',
    width: 100,
  },
  {
    title: '检查标准',
    dataIndex: 'checkStandard',
    width: 100,
  },
];
export const searchCheckLibraryFormSchema: FormSchema[] = [
  {
    field: 'org',
    label: '所属机构',
    component: 'Select',
    componentProps: () => {
      return {
        options: orgOptions,
        placeholder: '请选择',
      };
    },
    colProps: { span: 6 },
  },
  {
    field: 'itemType',
    label: '检查项分类',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'check_sort',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    field: 'itemName',
    label: '检查项',
    component: 'Input',
    colProps: { span: 6 },
  },
];
