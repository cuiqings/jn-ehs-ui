import { ref, computed } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { getDeviceList } from './config.api';
import { useUserStore } from '/@/store/modules/user';
const userStore = useUserStore();
console.log('userStore', userStore);
const userinfo = computed(() => userStore.getUserInfo);
let orgCodeBak = userinfo.value.orgCode.substring('0', '6');
const deviceOptions = ref([]);
getDeviceOptions(userinfo.value.orgCode);
function getDeviceOptions(orgCode) {
  let params = {};
  // 截取6位
  params.orgCode = orgCode.substring(0, 6);
  params.pageSize = 9999;
  params.pageNo = 1;
  getDeviceList(params).then((res) => {
    console.log('res', res);
    if (res.records && res.records.length > 0) {
      res.records.map((item) => {
        deviceOptions.value.push({
          label: item.name,
          value: item.id + '',
        });
      });
    }
  });
}
export const columns: BasicColumn[] = [
  {
    title: '所属机构',
    align: 'center',
    width: 150,
    ellipsis: true,
    dataIndex: 'sysDepartName',
  },
  {
    title: '唯一号',
    align: 'center',
    ellipsis: true,
    dataIndex: 'warnConfigNo',
  },
  {
    title: '设备名称',
    align: 'center',
    ellipsis: true,
    dataIndex: 'deviceName',
  },
  {
    title: '报警名称',
    align: 'center',
    width: 150,
    ellipsis: true,
    dataIndex: 'warnName',
  },
  {
    title: '报警等级',
    align: 'center',
    dataIndex: 'warnLevel_dictText',
  },
  {
    title: '报警类别',
    align: 'center',
    dataIndex: 'warnCategory_dictText',
  },
  {
    title: '报警类型',
    align: 'center',
    dataIndex: 'warnConfigType_dictText',
  },
  {
    title: '启/停用',
    align: 'center',
    dataIndex: 'warnStartStop',
    slots: { customRender: 'warnStartStop' },
  },
  {
    title: '时间',
    align: 'center',
    width: 200,
    dataIndex: 'updateTime',
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    label: '所属机构',
    field: 'sysOrgCode',
    component: 'JTreeSelect1',
    componentProps: ({ formActionType, formModel }) => {
      console.log('formModel', formModel);
      return {
        url: '/jn/common/getDepartTreeFor23',
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
          options: 'children',
        },
        isLeaf: false,
        load: false,
        treeNodeFilterProp: 'departName',
        onChange: (e) => {
          if (e) {
            getDeviceOptions(e);
          }
        },
      };
    },
    colProps: { span: 6 },
  },
  {
    label: '报警等级',
    field: 'warnLevel',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'warn_level',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '报警类别',
    field: 'warnCategory',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'warn_category',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '报警类型',
    field: 'warnConfigType',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'warn_config_type',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '设备名称',
    field: 'deviceId',
    component: 'Select',
    componentProps: () => {
      return {
        options: deviceOptions,
        placeholder: '请选择',
      };
    },
    colProps: { span: 6 },
  },
  {
    label: '报警名称',
    field: 'warnName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '启/停用',
    field: 'warnStartStop',
    component: 'Select',
    componentProps: {
      options: [
        { label: '启用', value: '0' },
        { label: '停用', value: '1' },
      ],
    },
    colProps: { span: 6 },
  },
];
export const indicatorColumns: BasicColumn[] = [
  {
    title: '所属机构',
    align: 'center',
    dataIndex: 'departName',
  },
  {
    title: '设备名称',
    align: 'center',
    dataIndex: 'deviceName',
  },
  {
    title: '属性名称',
    align: 'center',
    dataIndex: 'pointName',
  },
];

export const pointColumns: BasicColumn[] = [
  {
    title: '设备名称',
    dataIndex: 'deviceName',
  },
  {
    title: '属性名称',
    dataIndex: 'pointName',
  },
];
