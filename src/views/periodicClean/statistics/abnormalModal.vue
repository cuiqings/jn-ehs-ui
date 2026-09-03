<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    title="异常次数"
    width="800px"
    :showCancelBtn="false"
    :showOkBtn="false">
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
      <template #cycle>
        {{ curRecord.cycle === '5' ? curRecord.dayNum + '天' : filterMultiDictText(dictOptionsCycle, curRecord.cycle) }}
      </template>
      <template #abnormalNotes="{text, record}">
        <a-input 
          v-if="abnormalNotesObj.hasOwnProperty(record.id)"
          :id="'abnormalNotes'+record.id"
          v-model:value="abnormalNotesObj[record.id]" 
          placeholder="请输入" 
        />
        <span v-else>{{ text }}</span>
      </template>
    </BasicTable>
    <div class="timeline" v-if="recordList.length">
      <div class="title">操作记录</div>
      <div class="step-box">
        <div class="part" v-for="(item, index) in recordList" :key="index">
          <div class="time">{{ item.updateTime }}</div>
          <div class="axle">
            <div class="circle"></div>
            <div class="line" v-if="index !== recordList.length - 1"></div>
          </div>
          <div class="text">{{ item.operationRecord }}</div>
        </div>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal'
import { BasicTable, TableAction } from '/@/components/Table'
import { useListPage } from '/@/hooks/system/useListPage'
import { abnormalRecord, abnormalEdit } from '/@/views/periodicClean/app/app.api';
import { abnormalOperationStatistics } from '/@/views/periodicClean/statistics/statistics.api'
import { abnormalColumns } from '/@/views/periodicClean/statistics/statistics.data';
import { initDictOptions } from '/@/utils/dict';
import { filterMultiDictText } from '/@/utils/dict/JDictSelectUtil.js';
import { message } from 'ant-design-vue';

const recordId = ref('')
const curRecord:any = ref({})
const abnormalNotesObj=ref({})
const dataSource=ref([])
const recordList:any=ref([])
const dictOptionsCycle = ref<any>([]);
/**
 * 初始化字典选项
 */
 async function initDictConfig() {
  dictOptionsCycle.value = await initDictOptions('cycle');
}
onMounted(() => {
  //初始化字典选项
  initDictConfig();
});

const getList = () => {
  abnormalRecord({id:recordId.value}).then(res => {
    dataSource.value = res || []
  })
}

const getRecordList = () => {
  abnormalOperationStatistics({id:recordId.value}).then(res => {
    recordList.value = res || []
  })
}
abnormalOperationStatistics

const { tableContext } = useListPage({
  designScope: 'abnormal',
  tableProps: {
    title: '',
    // api: getList,
    dataSource: dataSource,
    columns: abnormalColumns,
    useSearchForm: false,
    showIndexColumn: true,
    actionColumn: {
      width: 100,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right'
    },
    pagination: false,
    maxHeight: 200
  }
})
const [registerTable] = tableContext

// 操作列
function getActions(record) {
  return [
    {
      label: record.abnormalNotes ? '修改备注' : '备注',
      onClick: editNotes.bind(null, record),
      ifShow: !abnormalNotesObj.value.hasOwnProperty(record.id)
    },
    {
      label: '保存',
      onClick: abnormalNotesSave.bind(null, record),
      ifShow: abnormalNotesObj.value.hasOwnProperty(record.id)
    }
  ]
}

// 添加/修改备注
function editNotes(record:any) {
  abnormalNotesObj.value = {
    [record.id]: record.abnormalNotes
  }
  nextTick(() => {
    const dom = document.getElementById('abnormalNotes'+record.id)
    dom && dom.focus();
  });
}
function abnormalNotesSave(record:any) {
  const val = abnormalNotesObj.value[record.id]
  if(val.length > 50) {
    message.warning('不能超过50个字符')
    return
  }
  abnormalEdit({
    id: record.id,
    abnormalNotes: abnormalNotesObj.value[record.id]
  }).then(() => {
    abnormalNotesObj.value = {}
    getList()
  })
}

const [register, {}] = useModalInner(async (data) => {
  console.log(data, 'dddd====')
  abnormalNotesObj.value = {}
  recordId.value = data.record.id
  curRecord.value = data.record
  dataSource.value = []
  getList()
  getRecordList()
})

</script>

<style lang="less" scoped>
.timeline {
  background: rgba(0, 0, 0, 0.02);
  color: rgba(0, 0, 0, 0.87);
  padding: 16px;

  .title {
    font-weight: bold;
  }

  .step-box {
    margin-top: 17px;
    height: 200px;
    overflow: auto;
    .part {
      display: flex;
      .time{
        width: 150px;
      }
      .text{
        flex: 1;
      }
      .axle {
        margin: 8px 12px 0;

        .circle {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 2px solid #1890FF;
        }

        .line {
          width: 2px;
          height: 46px;
          background: #E9E9E9;
          position: relative;
          left: 3px;
        }
      }
    }
  }
}
</style>
