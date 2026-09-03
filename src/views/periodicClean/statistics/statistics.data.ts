// import { ref } from 'vue'
import { BasicColumn, FormSchema } from '/@/components/Table'
import { render } from '/@/utils/common/renderUtils'
// import { defHttp } from '/@/utils/http/axios'

export const columns: BasicColumn[] = [
  {
    title: '类型',
    width: 100,
    dataIndex: 'type',
    customRender: ({ text }) => {
      return render.renderDict(text, 'clean_plan_type')
    }
  },
  {
    title: '所属机构',
    width: 150,
    dataIndex: 'organization'
  },
  {
    title: '工序',
    dataIndex: 'productionProcessse',
    width: 100
  },
  {
    title: '设备/区域',
    width: 160,
    dataIndex: 'deviceRegion'
  },
  {
    title: '项目',
    dataIndex: 'entryName',
    width: 200
  },
  {
    title: '应执行次数',
    dataIndex: 'yzxNum',
    width: 120
  },
  {
    title: '实际执行次数',
    dataIndex: 'sjzxNum',
    width: 120
  },
  {
    title: '异常次数',
    dataIndex: 'abnormalNum',
    width: 100,
    slots: { customRender: 'abnormalNum' }
  },
  {
    title: '周期',
    dataIndex: 'cycle',
    width: 100,
    customRender: ({ text, record }) => {
      if(text==='5'){
          return fmtCycle(record)
      } else {
          return render.renderDict(text, 'cycle');
      }
    }
  },
  {
    title: '本次维护时间',
    dataIndex: 'thisMaintenanceTime',
    width: 160
  },
  {
    title: '执行人',
    width: 160,
    dataIndex: 'executor'
  },
  {
    title: '监督人',
    width: 160,
    dataIndex: 'supervisor'
  },
  {
    title: '下次维护时间',
    dataIndex: 'nextExecutionTime',
    width: 200
  },
  {
    title: '当前状态',
    dataIndex: 'status',
    width: 100,
    slots: { customRender: 'status' }
  }
]


function fmtCycle(record:any){
  return record.dayNum ? record.dayNum + '天' : render.renderDict(record.cycle, 'cycle')
}

export const searchFormSchema: FormSchema[] = [
  {
    label: '类型',
    field: 'type',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'clean_plan_type',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false
    },
    colProps: { span: 6 }
  },
  {
    label: '所属机构',
    field: 'organizationCode',
    component: 'Select',
    componentProps: {
      options: [],
      placeholder: '请选择',
      // disabled: orgOptions.value.length === 1,
    },
    colProps: { span: 6 }
  },
  {
    label: '统计日期',
    field: 'time',
    component: 'RangeDate',
    colProps: { span: 6 }
  },
  {
    label: '工序',
    field: 'productionProcessse',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'deviceRegion',
    label: '设备/区域',
    component: 'Input',
    colProps: { span: 6 },
  }
]

export const abnormalColumns: BasicColumn[] = [
  {
    title: '周期',
    width: 60,
    dataIndex: '',
    slots: { customRender: 'cycle' }
  },
  {
    title: '异常周期',
    dataIndex: 'lastMaintenanceTime',
    width: 280,
    customRender: ({ text, record }) => {
      const data:any = record || {}
      return text + '至' + data.maintenanceTime
    }
  },
  {
    title: '超期天数',
    dataIndex: 'remarks',
    width: 120
  },
  {
    title: '异常原因',
    // width: 120,
    dataIndex: 'abnormalNotes',
    slots: { customRender: 'abnormalNotes' }
  }
]
