import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import {rules} from '/@/utils/helper/validator';
import {render} from '/@/utils/common/renderUtils';
import {defHttp} from "/@/utils/http/axios";
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '治理设备类别',
    align: "center",
    dataIndex: 'deviceType',
    customRender: ({ text }) => {
      return render.renderDict(text, 'ehsEcmDevice_deviceType');
    },
  },
  {
    title: '治理设备名称',
    align: "center",
    dataIndex: 'deviceName'
  },
  {
    title: '属地单位',
    align: "center",
    dataIndex: 'orgName'
  },
  {
    title: '数量',
    align: "center",
    dataIndex: 'amount',
  },
  {
    title: '运行状态',
    align: "center",
    dataIndex: 'runningStatus',
  },
  {
    title: '设备归属地',
    align: "center",
    dataIndex: 'belongingAreaName',
  },
  {
    title: '设备维修负责单位',
    align: "center",
    dataIndex: 'repairUnit',
  },
  {
    title: '维护保养负责单位',
    align: "center",
    dataIndex: 'maintenanceUnit',
  },
  {
    title: '维护保养内容',
    align: "center",
    dataIndex: 'maintenanceContent',
  },
  {
    title: '维保计划',
    align: "center",
    dataIndex: 'maintenancePlanName',
    slots: { customRender: 'maintenancePlanName' },
  },
  {
    title: '维保状态',
    align: "center",
    dataIndex: 'maintenancePlanStatus',
  },
  {
    title: '上次维保时间',
    align: "center",
    dataIndex: 'lastMaintenanceTime',
  },
];

/**
 * 所属机构change事件
 */
import {h, ref} from 'vue';
import dayjs from "dayjs";
import {message, Upload} from "ant-design-vue";
import {Api} from "/@/views/system/message/template/template.api";
import {useModal} from "/@/components/Modal";
const orgOptions = ref<any>([]);
getOrgList();
async function getOrgList() {
  await defHttp.get({ url: '/jn/common/getOrganizationNew' }).then((res) => {
    res.map((item) => {
      orgOptions.value.push({
        label: item.departName,
        value: item.orgCode,
      });
    });
  });
}
// orgOptions.value.push({label: "一号线", value: "A04",})
//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    label: '治理设备类别',
    field: 'deviceType',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'ehsEcmDevice_deviceType',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    field: 'deviceName',
    label: '治理设备名称',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'orgCode',
    label: '属地单位',
    component: 'Select',
    componentProps: {
      options: orgOptions,
      showChooseOption: false,
    },
    defaultValue: '',
    colProps: { span: 6 },
  },
  {
    field: 'runningStatus',
    label: '运行状态',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'belongingAreaCode',
    label: '设备归属地',
    component: 'Select',
    componentProps: {
      options: orgOptions,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    field: 'repairUnit',
    label: '设备维修负责单位',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'maintenanceUnit',
    label: '维护保养负责单位',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'maintenanceContent',
    label: '维护保养内容',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '维保状态',
    field: 'maintenancePlanStatus',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'ehsEcmDevice_maintenancePlanStatus',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  }
];
