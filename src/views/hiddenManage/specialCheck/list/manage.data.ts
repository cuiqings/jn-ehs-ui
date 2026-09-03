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
    title: '检查类型',
    width: 120,
    dataIndex: 'checkType',
    customRender: ({ record }) => {
      // 检查类别（3综合检查 4季节性检查 5节假日检查 6专项检查 7重大事故隐患检查）
      if (record.checkType == '3') {
        return '综合检查';
      } else if (record.checkType == '4') {
        return '季节性检查';
      } else if (record.checkType == '5') {
        return '节假日检查';
      } else if (record.checkType == '6') {
        return '专项检查';
      } else if (record.checkType == '7') {
        return '重大事故隐患检查';
      }
      return '';
    },

  },
  {
    title: '检查表名称',
    width: 160,
    dataIndex: 'checkTable',
  },
  {
    title: '编制单位',
    width: 120,
    dataIndex: 'orgName',
  },
  {
    title: '备注',
    width: 100,
    dataIndex: 'remark',
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
