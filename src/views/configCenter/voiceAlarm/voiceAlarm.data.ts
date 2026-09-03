import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '编号',
    align: 'center',
    dataIndex: 'code',
  },
  {
    title: '所属机构',
    align: 'center',
    dataIndex: 'orgCode_dictText',
  },
  {
    title: '名称',
    align: 'center',
    dataIndex: 'name',
    width: 130,
  },
  {
    title: '位置',
    align: 'center',
    dataIndex: 'site',
  },
  {
    title: '安装方式',
    align: 'center',
    dataIndex: 'installType',
  },
  {
    title: '音量',
    align: 'center',
    dataIndex: 'volume',
  },
  {
    title: '播放模式',
    align: 'center',
    dataIndex: 'playMode',
    customRender: ({ text, record }) => {
      if (text === '0') {
        return record.playMode_dictText + record.cycleCount + '次' + '(' + record.cycleInterval + '秒)'
      } else {
        return record.playMode_dictText

      }
    },
  },
  {
    title: '发声',
    align: 'center',
    dataIndex: 'voiceType_dictText',
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    field: 'orgCode',
    label: '所属机构',
    component: 'JTreeSelect1',
    // defaultValue: initOrgCode(),
    componentProps: ({ formModel }) => {
      return {
        url: '/jn/common/getDepartTreeBy23',
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
          options: 'children',
        },
      };
    },
    colProps: { span: 6 },
  },
  {
    label: '编号',
    field: 'code',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '名称',
    field: 'name',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '位置',
    field: 'deviceSiteCategoryId',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '安装方式',
    field: 'installType',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '音量',
    field: 'volume',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '播放模式',
    field: 'playMode',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'alertor_play_mode',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '发声',
    field: 'voiceType',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'alertor_voice_type',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  }
];

export const formSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '编号',
    field: 'code',
    required: true,
    component: 'Input',
  },
  {
    label: '串口名称',
    field: 'serialPortName',
    required: true,
    component: 'Input',
  },
  {
    label: '所属机构',
    field: 'orgCode',
    component: 'JTreeSelect1',
    required: true,
    componentProps: ({ formModel }) => {
      return {
        url: '/jn/common/getDepartTreeBy23',
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
          options: 'children',
        },
      };
    },
  },
  {
    label: '名称',
    field: 'name',
    required: true,
    component: 'Input',
  },
  {
    label: '位置',
    field: 'site',
    component: 'Input',
  },
  {
    label: '安装方式',
    field: 'installType',
    component: 'Input',
  },
  {
    label: '音量',
    field: 'volume',
    required: true,
    component: 'InputNumber',
    componentProps: {
      style: {
        width: '100%',
      },
      min: 1,
      max: 30,
      addonAfter: '级',
    },
  },
  {
    label: '播放模式',
    field: 'playMode',
    component: 'JDictSelectTag',
    required: true,
    defaultValue: '1',
    componentProps: {
      type: 'radio',
      dictCode: 'alertor_play_mode',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
  },
  {
    label: '循环次数',
    field: 'cycleCount',
    required: true,
    component: 'InputNumber',
    componentProps: {
      style: {
        width: '100%',
      },
      min: 1,
      max: 20,
      addonAfter: '次',
    },
    ifShow: ({ values }) => {
      return values.playMode === '0';
    }
  },
  {
    label: '循环间隔',
    field: 'cycleInterval',
    required: true,
    component: 'InputNumber',
    componentProps: {
      style: {
        width: '100%',
      },
      min: 1,
      max: 60,
      addonAfter: '秒',
    },
    ifShow: ({ values }) => {
      return values.playMode === '0';
    }
  },
  {
    label: '发声',
    field: 'voiceType',
    component: 'JDictSelectTag',
    required: true,
    defaultValue: '0',
    componentProps: {
      type: 'radio',
      dictCode: 'alertor_voice_type',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
  },
];
