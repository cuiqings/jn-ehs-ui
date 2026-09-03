import { ref } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import { defHttp } from '/@/utils/http/axios';

export const columns: BasicColumn[] = [
  {
    title: '所属机构',
    width: 150,
    dataIndex: 'organizationName',
  },
  {
    title: '项目名称',
    dataIndex: 'entryName',
    width: 300,
  },
  {
    title: '类型',
    width: 100,
    dataIndex: 'clearType',
    customRender: ({ text }) => {
      return render.renderDict(text, 'clean_plan_type');
    },
  },
  {
    title: '执行项',
    // width: 160,
    dataIndex: 'qlqzp',
    customRender: ({ record }) => {
      return fmtZxx(record);
    },
  },
];
function fmtZxx(record: any) {
  let arr: any = [];
  if (record.qlqzp === '0' || record.qlqzp === '1') {
    arr.push('清理前照片');
  }
  if (record.qlhzp === '0' || record.qlhzp === '1') {
    arr.push('清理后照片');
  }
  if (record.hcghsl === '0' || record.hcghsl === '1') {
    arr.push('耗材更换数量');
  }
  if (record.csfpzl === '0' || record.csfpzl === '1') {
    arr.push('产生废品重量');
  }
  if (record.csfpqx === '0' || record.csfpqx === '1') {
    arr.push('产生废品去向');
  }
  if (record.qlsm === '0' || record.qlsm === '1') {
    arr.push('清理说明');
  }
  if (record.wbzp === '0' || record.wbzp === '1') {
    arr.push('维保照片');
  }
  return arr.join(',');
}
const orgOptions: any = ref([]);
function getOrgList() {
  defHttp.get({ url: '/jn/common/getOrganizationNew' }).then((res) => {
    res.map((item: any) => {
      orgOptions.value.push({
        label: item.departName,
        value: item.orgCode,
      });
    });
  });
}
getOrgList();

export const searchFormSchema: FormSchema[] = [
  {
    label: '所属机构',
    field: 'organizationCode',
    component: 'Select',
    componentProps: {
      options: [],
    },
    colProps: { span: 6 },
  },
  {
    field: 'entryName',
    label: '项目名称',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '类型',
    field: 'clearType',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'clean_plan_type',
      placeholder: '请选择',
      stringToNumber: false,
    },
    colProps: { span: 6 },
  },
];
