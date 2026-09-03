<template>
  <BasicDrawer v-bind="$attrs" @register="register" :title="title" width="1300px" style="padding-bottom: 60px;">
    <plan-form ref="formElRef" :detail="detail" :disabled="disabled" @cancel="closeDrawer"
      @submit="closeDrawer"></plan-form>
    <div class="step-tit">{{ title == '动员培训' ? '动员培训' : '演练记录' }}</div>
    <a-form style="padding-bottom: 60px;" :model="formState" ref="contentFormElRef" name="basic"
      :label-col="{ span: 3 }" :wrapper-col="{ span: 16 }">
      <div class="form-main">
        <template v-if="['演练方案', '详情'].includes(title)">
          <a-form-item label="1、演练方案" name="drillScheme" :rules="[{ required: true, message: '请上传' }]">
            <JUpload ref="uploadRef" :disabled="title == '详情'" accept=".doc,.docx,.pdf,.xls,.xlsx" :maxCount="10"
              v-model:value="formState.drillScheme" text="上传附件" />
          </a-form-item>
          <a-form-item label="2、演练应急预案" name="drillEmergencyPlan" :rules="[{ required: true, message: '请上传' }]">
            <JUpload accept=".doc,.docx,.pdf,.xls,.xlsx" :disabled="title == '详情'" ref="uploadRef" :maxCount="10"
              v-model:value="formState.drillEmergencyPlan" text="上传附件" />
          </a-form-item>
          <a-form-item label="3、演练脚本" name="drillScript" :rules="[{ required: true, message: '请上传' }]">
            <JUpload accept=".doc,.docx,.pdf,.xls,.xlsx" :disabled="title == '详情'" ref="uploadRef" :maxCount="10"
              v-model:value="formState.drillScript" text="上传附件" />
          </a-form-item>
        </template>
        <template v-if="['影像资料', '详情'].includes(title)">
          <a-form-item label="7、演练影像资料" name="drillVideoData" :rules="[{ required: true, message: '请上传' }]">
            <JUpload ref="uploadRef" :disabled="title == '详情'" accept="image/*, video/*" :maxCount="20"
              v-model:value="formState.drillVideoData" text="上传附件" />
          </a-form-item>
        </template>
        <template v-if="['动员培训', '详情'].includes(title)">
          <a-form-item label="学习内容" name="trainContent" :rules="[{ required: true, message: '请输入' }]">
            <a-textarea :disabled="title == '详情'" max-length="500" v-model:value="formState.trainContent"
              placeholder="请输入" allow-clear />
          </a-form-item>
        </template>
        <template v-if="['演练记录', '详情'].includes(title)">
          <a-form-item label="演练目的" name="purpose" :rules="[{ required: true, message: '请选择' }]">
            <a-table :columns="yanlianmudiColumn" :dataSource="yanlianmudi" :pagination="false" rowKey="sort" bordered
              :row-selection="{
                columnTitle: '是否涉及',
                columnWidth: 100,
                selectedRowKeys: formState.securityMeasuresIds,
                fixed: false,
                onChange: (e, rows) => checkChange(e, rows, 'purpose'),
                getCheckboxProps: () => {
                  return readonly ? { disabled: true } : {};
                },
              }">
              <template #bodyCell="{ column, index }">
                <template v-if="column.dataIndex === 'id'">
                  {{ index + 1 }}
                </template>
              </template>
            </a-table>
          </a-form-item>
          <a-form-item label="其它演练目的" name="purpose1">
            <a-input v-model:value="formState.purpose1" placeholder="请输入" allow-clear />
          </a-form-item>
          <a-form-item label="演练记录" name="record" :rules="[{ required: true, message: '请选择' }]">
            <a-table :columns="yanlianjiluColumn" :dataSource="yanlianjilu" :pagination="false" rowKey="sort" bordered
              :row-selection="{
                columnTitle: '是否涉及',
                columnWidth: 100,
                selectedRowKeys: formState.securityMeasuresIds,
                fixed: false,
                onChange: (e, rows) => checkChange(e, rows, 'record'),
                getCheckboxProps: () => {
                  return readonly ? { disabled: true } : {};
                },
              }">
              <template #bodyCell="{ column, index }">
                <template v-if="column.dataIndex === 'id'">
                  {{ index + 1 }}
                </template>
              </template>
            </a-table>
          </a-form-item>
          <a-form-item label="其它演练记录" name="record1">
            <a-input v-model:value="formState.record1" placeholder="请输入" allow-clear />
          </a-form-item>
          <a-form-item label="现场救援讲评" name="rescue" :rules="[{ required: true, message: '请选择' }]">
            <a-table :columns="jiangpingColumn" :dataSource="jiangping" :pagination="false" rowKey="sort" bordered
              :row-selection="{
                columnTitle: '是否涉及',
                columnWidth: 100,
                selectedRowKeys: formState.securityMeasuresIds,
                fixed: false,
                onChange: (e, rows) => checkChange(e, rows, 'rescue'),
                getCheckboxProps: () => {
                  return readonly ? { disabled: true } : {};
                },
              }">
              <template #bodyCell="{ column, index }">
                <template v-if="column.dataIndex === 'id'">
                  {{ index + 1 }}
                </template>
              </template>
            </a-table>
          </a-form-item>
          <a-form-item label="其它救援讲评" name="rescue1">
            <a-input v-model:value="formState.rescue1" placeholder="请输入" allow-clear />
          </a-form-item>
        </template>
      </div>
      <div class="step-tit" v-if="title == '演练记录'">评估报告</div>
      <div class="form-main" v-if="title == '演练记录'">
        <a-form-item label="评审人" name="reviewer" :rules="[{ required: true, message: '请选择' }]">
          <JUserModal v-model:value="formState.reviewer" placeholder="请选择" />
        </a-form-item>
        <a-form-item label="批准人" name="approver" :rules="[{ required: true, message: '请选择' }]">
          <JUserModal v-model:value="formState.approver" placeholder="请选择" />
        </a-form-item>
        <a-form-item label="评审地点" name="reviewPlace">
          <a-input v-model:value="formState.reviewPlace" placeholder="请输入" allow-clear />
        </a-form-item>
        <a-form-item label="评审内容" name="reviewContent" :rules="[{ required: true, message: '请选择' }]">
          <a-table :columns="pingshenColumn" :dataSource="pingshen" :pagination="false" rowKey="sort" bordered
            :row-selection="{
              columnTitle: '是否涉及',
              columnWidth: 100,
              selectedRowKeys: formState.securityMeasuresIds,
              fixed: false,
              onChange: (e, rows) => checkChange(e, rows, 'reviewContent'),
              getCheckboxProps: () => {
                return readonly ? { disabled: true } : {};
              },
            }">
            <template #bodyCell="{ column, index }">
              <template v-if="column.dataIndex === 'id'">
                {{ index + 1 }}
              </template>
            </template>
          </a-table>
        </a-form-item>
        <a-form-item label="其它评审内容" name="reviewContent1">
          <a-input v-model:value="formState.reviewContent1" placeholder="请输入" allow-clear />
        </a-form-item>
        <a-form-item label="评审过程" name="reviewProcess" :rules="[{ required: true, message: '请输入' }]">
          <a-textarea v-model:value="formState.reviewProcess" placeholder="请输入" allow-clear />
        </a-form-item>
        <a-form-item label="评审结论" name="reviewResult" :rules="[{ required: true, message: '请输入' }]">
          <a-textarea v-model:value="formState.reviewResult" placeholder="请输入" allow-clear />
        </a-form-item>
      </div>
      <div class="step-tit" v-if="title == '演练记录'">演练评价表</div>
      <div class="form-main" v-if="title == '演练记录'">
        <a-form-item v-for="item in pingkjia" :label="item.text" :rules="[{ required: true, message: '请输入' }]"
          :name="item.key">
          <a-checkbox-group v-model:value="formState[item.key]" name="checkboxgroup" :options="item.items" />
        </a-form-item>
        <a-form-item label="总体评价" name="overallEvaluation" :rules="[{ required: true, message: '请输入' }]">
          <a-textarea v-model:value="formState.overallEvaluation" placeholder="请输入" allow-clear />
        </a-form-item>
      </div>
    </a-form>

    <template v-if="title != '详情'" #footer>
      <div class="btns">
        <a-space :size="24">
          <a-button type="default" @click="backFn">取消</a-button>
          <a-button type="primary" :loading="submitIng" @click="submitFn">确认</a-button>
        </a-space>
      </div>
    </template>
  </BasicDrawer>
  <a-modal v-model:visible="backOpen" title="审批退回" @cancel="cancel" @ok="backOk" :confirmLoading="confirmLoading">
    <div class="back-reson">
      <div class="main">
        <span>说明</span><a-textarea v-model:value="backreson" :auto-size="{ minRows: 3, maxRows: 5 }"
          placeholder="请输入退回原因" />
      </div>
      <div class="hint" v-show="empty">请输入</div>
    </div>
  </a-modal>
  <signModal @register="registerSignModal" @close="signSuccess" />
</template>
<script lang="ts" setup>
import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { videoData, drillScheme, taskDetail, trainContent, drillRecord } from '../api';
import signModal from './components/signModal.vue';
import planForm from './components/planForm.vue';
import { JUserModal } from '/@/components/Form';
import { useModal } from '/@/components/Modal';
import { useData } from './hooks/useData'
import { ref } from 'vue';

const emits = defineEmits(['success']);
const title = ref('新增');
const activeKey = ref('1');
const disabled = ref(false);
const detail = ref({});
const backOpen = ref(false);
const formElRef = ref<InstanceType<typeof planForm> | null>(null);
const contentFormElRef = ref(null)
const empty = ref(false);
const submitIng = ref(false);
const detailInfo = ref<any>({});
const [register, { closeDrawer }] = useDrawerInner((data) => {
  title.value = data.title;
  if (data.id) {
    formState.value.id = data.id;
    detailInfo.value.drillEmergencyPlan = data.drillEmergencyPlan
    taskDetail(data.id).then(res => {
      detail.value = res
      formElRef.value?.init(res)
      res.drillScheme = res.drillScheme.join(',');
      res.drillEmergencyPlan = res.drillEmergencyPlan.join(',');
      res.drillScript = res.drillScript.join(',');
      Object.assign(detailInfo.value, res);
      console.log(formState.value);

    });
  }
});

const formState = ref<any>({})

const [registerSignModal, { openModal: openSignModal }] = useModal();
const {
  yanlianmudi,
  yanlianmudiColumn,
  yanlianjilu,
  yanlianjiluColumn,
  jiangping,
  jiangpingColumn,
  pingshen,
  pingshenColumn,
  pingkjia
} = useData()
const checkChange = (e, rows, type) => {
  let arr: any[] = []
  if (type == 'reviewContent') {
    formState.value[type] = rows.map(item => {
      item.isSelect = true
      return item
    });
  } else {
    arr = rows.map(item => item.text)
    formState.value[type] = arr;
  }
}

const backreson = ref('');
const backFn = () => {
  backOpen.value = true;
  console.log(backOpen.value);

};
const confirmLoading = ref(false);
const backOk = () => {
  if (!backreson.value) {
    empty.value = true;
    return;
  };

  confirmLoading.value = true;
  examineBack({
    id: getId(),
    backReason: backreson.value
  }).then(() => {
    backOpen.value = false;
    empty.value = false;
    confirmLoading.value = false;
    closeDrawer();
    emits('success')
  }).catch(() => {
    confirmLoading.value = false;
  })
}
const cancel = () => {
  backOpen.value = false;
  backreson.value = '';
  empty.value = false;
}

const submitFn = async () => {
  await contentFormElRef.value?.validate()
  submitIng.value = true;
  console.log(formState.value);
  let params = JSON.parse(JSON.stringify(formState.value));
  if (title.value == '演练方案') {
    params.drillScheme = params.drillScheme.split(',');
    params.drillEmergencyPlan = params.drillEmergencyPlan.split(',');
    params.drillScript = params.drillScript.split(',');
    drillScheme(params).then(res => {
      submitIng.value = false;
      closeDrawer();
      emits('success')
    }).catch(err => {
      submitIng.value = false;
    })
    return false;
  }
  if (title.value == '影像资料') {
    params.drillVideoData = params.drillVideoData.split(',');
    videoData(params).then(res => {
      submitIng.value = false;
      closeDrawer();
      emits('success')
    }).catch(err => {
      submitIng.value = false;
    })
    return false;
  }
  if (title.value == '动员培训') {
    trainContent(params).then(res => {
      submitIng.value = false;
      closeDrawer();
      emits('success')
    }).catch(err => {
      submitIng.value = false;
    })
    return false;
  }
  if (title.value == '演练记录') {
    let keys = ['purpose', 'record', 'rescue']
    keys.map(k => {
      if (params[k + '1']) {
        params[k].push(params[k + '1'])
      }
    })
    if (params.reviewContent1) {
      params.reviewContent.push({
        content: params.reviewContent1,
        isSelect: true
      })
    }
    pingkjia.map(item => {
      params[item.key] = item.items.map((citem, i) => {
        if (params[item.key].includes(citem)) {
          return {
            serialNumber: i + 1,
            isSelect: true,
            content: citem
          }
        } else {
          return {
            serialNumber: i + 1,
            isSelect: false,
            content: citem
          }
        }
      })
    })
    console.log(params);
    drillRecord(params).then(res => {
      submitIng.value = false;
      closeDrawer();
      emits('success')
    }).catch(err => {
      submitIng.value = false;
    })
    return false;
  }
  openSignModal(true, { id: getId() })
}
const getId = () => {
  let nodeId = '';
  for (var i = 0; i < detail.value.examineList.length; i++) {
    if (detail.value.examineList[i].state === null) {
      nodeId = detail.value.examineList[i].id;
      break;
    }
  }
  return nodeId;
}

const signSuccess = () => {
  emits('success')
  closeDrawer();
}

</script>
<style lang="less" scoped>
.back-reson {
  height: 180px;
  padding: 16px;

  .main {
    display: flex;
  }

  span {
    width: 70px;

    &:before {
      display: inline-block;
      margin-right: 4px;
      color: #ff4d4f;
      font-size: 14px;
      font-family: SimSun, sans-serif;
      line-height: 1;
      content: '*';
    }
  }

  .hint {
    padding-left: 70px;
    color: #ff4d4f;
  }
}

.form-main {
  // padding-left: 56px;
}
.btns {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
