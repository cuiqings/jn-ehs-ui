<template>
  <BasicDrawer v-bind="$attrs" @register="register" :title="title" :width="1300" :bodyStyle="{ marginBottom: '40px' }" @close="close">
    <plan-form ref="formElRef" :detail="detail" :disabled="disabled" @cancel="closeDrawer" @submit="closeDrawer" />
    <div class="step-tit">{{ title == '动员培训' ? '动员培训' : '演练记录' }}</div>
    <a-form class="emergency-form" :model="formState" ref="contentFormElRef" name="basic" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
      <div class="form-main">
        <template v-if="['演练方案', '详情'].includes(title)">
          <a-form-item label="1、演练方案" name="drillScheme" :rules="[{ required: true, message: '请上传' }]">
            <JUpload
              ref="uploadRef"
              :disabled="title == '详情'"
              accept=".doc,.docx,.pdf,.xls,.xlsx"
              :maxCount="10"
              v-model:value="formState.drillScheme"
              text="上传附件"
            />
          </a-form-item>
          <a-form-item label="2、演练应急预案" name="drillEmergencyPlan" :rules="[{ required: true, message: '请上传' }]">
            <JUpload
              accept=".doc,.docx,.pdf,.xls,.xlsx"
              :disabled="title == '详情'"
              ref="uploadRef"
              :maxCount="10"
              v-model:value="formState.drillEmergencyPlan"
              text="上传附件"
            />
          </a-form-item>
          <a-form-item label="3、演练脚本" name="drillScript" :rules="[{ required: true, message: '请上传' }]">
            <JUpload
              accept=".doc,.docx,.pdf,.xls,.xlsx"
              :disabled="title == '详情'"
              ref="uploadRef"
              :maxCount="10"
              v-model:value="formState.drillScript"
              text="上传附件"
            />
          </a-form-item>
        </template>
        <template v-if="['演练总结'].includes(title)">
          <a-form-item :labelCol="{ span: 5 }" label="5、演练总结" name="drillSummary" :rules="[{ required: true, message: '请上传' }]">
            <JUpload accept=".doc,.docx,.pdf,.xls,.xlsx" ref="uploadRef" :maxCount="10" v-model:value="formState.drillSummary" text="上传附件" />
          </a-form-item>
          <a-form-item
            :labelCol="{ span: 5 }"
            label="6、演练存在不足之处整改落实情况"
            name="drillCorrective"
            :rules="[{ required: true, message: '请上传' }]"
          >
            <JUpload accept=".doc,.docx,.pdf,.xls,.xlsx" ref="uploadRef" :maxCount="10" v-model:value="formState.drillCorrective" text="上传附件" />
          </a-form-item>
        </template>
        <template v-if="['影像资料', '详情'].includes(title)">
          <a-form-item label="7、演练影像资料" name="drillVideoData" :rules="[{ required: true, message: '请上传' }]">
            <JUpload
              ref="uploadRef"
              :disabled="title == '详情'"
              accept="image/*, video/*"
              :maxCount="20"
              v-model:value="formState.drillVideoData"
              text="上传附件"
            />
          </a-form-item>
        </template>
        <template v-if="['动员培训', '详情'].includes(title)">
          <a-form-item label="学习内容" name="trainContent" :rules="[{ required: true, message: '请输入' }]">
            <a-textarea :disabled="title == '详情'" max-length="500" v-model:value="formState.trainContent" placeholder="请输入" />
          </a-form-item>
        </template>
        <template v-if="['演练记录', '详情'].includes(title)">
          <a-form-item label="演练目的" name="purpose1" :rules="[{ required: true, message: '请输入' }]">
            <div style="display: flex; align-items: center">
              <InputTextArea auto-size style="width: calc(100% - 100px)" v-model:value="formState.purpose1" placeholder="请输入" />
              <a-button style="margin-left: 12px" type="primary" @click="handleModal('md', '演练目的模板')">填写模板</a-button>
            </div>
          </a-form-item>
          <a-form-item label="演练记录" name="record1" :rules="[{ required: true, message: '请输入' }]">
            <div style="display: flex; align-items: center">
              <InputTextArea auto-size style="width: calc(100% - 100px)" v-model:value="formState.record1" placeholder="请输入" />
              <a-button style="margin-left: 12px" type="primary" @click="handleModal('jl', '演练记录模板')">填写模板</a-button>
            </div>
          </a-form-item>
          <a-form-item label="现场救援讲评" name="rescue1" :rules="[{ required: true, message: '请输入' }]">
            <div style="display: flex; align-items: center">
              <InputTextArea auto-size style="width: calc(100% - 100px)" v-model:value="formState.rescue1" placeholder="请输入" allow-clear />
              <a-button style="margin-left: 12px" type="primary" @click="handleModal('jp', '现场救援讲评模板')">填写模板</a-button>
            </div>
          </a-form-item>
        </template>
      </div>
      <div class="step-tit" v-if="title == '演练记录'">评估报告</div>
      <div class="form-main" v-if="title == '演练记录'">
        <a-form-item label="评审人" name="reviewer" :rules="[{ required: true, message: '请选择', trigger: 'submit' }]">
          <JUserModal v-model:value="formState.reviewer" placeholder="请选择" />
        </a-form-item>
        <a-form-item label="批准人" name="approver" :rules="[{ required: true, message: '请选择', trigger: 'submit' }]">
          <JUserModal v-model:value="formState.approver" placeholder="请选择" />
        </a-form-item>
        <a-form-item label="安全部审批人" name="aqb" :rules="[{ required: true, message: '请选择', trigger: 'change' }]">
<!--          <JUserModal v-model:value="formState.aqbApprover" role-code="yjylaqbspr" placeholder="请选择" />-->
          <a-input readonly value="应急演练安全部审批人"></a-input>
        </a-form-item>
        <a-form-item label="评估地点" name="reviewPlace">
          <a-input v-model:value="formState.reviewPlace" placeholder="请输入" allow-clear />
        </a-form-item>
        <a-form-item label="参加人员" name="reviewMember" :rules="[{ required: true, message: '请输入' }]">
          <a-input v-model:value="formState.reviewMember" placeholder="请输入" allow-clear />
        </a-form-item>
        <a-form-item label="评估依据" name="reviewProof" :rules="[{ required: true, message: '请输入' }]">
          <a-input v-model:value="formState.reviewProof" placeholder="请输入" allow-clear />
        </a-form-item>
        <a-form-item label="评估内容" name="reviewContent1" :rules="[{ required: true, message: '请输入' }]">
          <div style="display: flex; align-items: center">
            <InputTextArea auto-size style="width: calc(100% - 100px)" v-model:value="formState.reviewContent1" placeholder="请输入" />
            <a-button style="margin-left: 12px" type="primary" @click="handleModal('nr', '评审内容模板')">填写模板</a-button>
          </div>
        </a-form-item>
        <a-form-item label="评估过程" name="reviewProcess" :rules="[{ required: true, message: '请输入' }]">
          <a-textarea v-model:value="formState.reviewProcess" placeholder="请输入" allow-clear />
        </a-form-item>
        <a-form-item label="评估结论" name="reviewResult" :rules="[{ required: true, message: '请输入' }]">
          <a-textarea v-model:value="formState.reviewResult" placeholder="请输入" allow-clear />
        </a-form-item>
      </div>
      <div class="step-tit" v-if="title == '演练记录'">演练评价表</div>
      <div class="form-main" v-if="title == '演练记录'">
        <a-form-item
          v-for="(item, index) in pingkjia"
          :key="index"
          :label="item.text"
          :rules="[{ required: true, message: '请输入' }]"
          :name="item.key"
        >
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
        <span>说明</span><a-textarea v-model:value="backreson" :auto-size="{ minRows: 3, maxRows: 5 }" placeholder="请输入退回原因" />
      </div>
      <div class="hint" v-show="empty">请输入</div>
    </div>
  </a-modal>
  <signModal @register="registerSignModal" @close="signSuccess" />
  <a-modal v-model:visible="visible" :width="800" :title="fillTitle" @cancel="() => (visible = false)" class="template-modal" :footer="null">
    <div class="template-content">
      <div v-for="(item, index) in fillData" :key="index" class="template-item">
        <div class="template-text">{{ item }}</div>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { videoData, drillScheme, taskDetail, trainContent, drillRecord, drillSummary, examineBack } from '../api';
  import type { FormInstance } from 'ant-design-vue';
  import signModal from './components/signModal.vue';
  import planForm from './components/planForm.vue';
  import { JUserModal } from '/@/components/Form';
  import { useModal } from '/@/components/Modal';
  import { useData } from './hooks/useData';
  import { ref } from 'vue';
  import { Input } from 'ant-design-vue';
  const InputTextArea = Input.TextArea;
  const emits = defineEmits(['success']);
  const title = ref('新增');
  const disabled = ref(false);
  const detail: any = ref({});
  const backOpen = ref(false);
  const formElRef = ref<InstanceType<typeof planForm> | null>(null);
  const contentFormElRef = ref<FormInstance | null>(null);
  const empty = ref(false);
  const submitIng = ref(false);
  const detailInfo = ref<any>({});
  const visible = ref(false);
  const fillTitle = ref('');
  const fillData = ref([]);
  const [register, { closeDrawer }] = useDrawerInner((data) => {
    title.value = data.title;
    if (data.id) {
      formState.value.id = data.id;
      detailInfo.value.drillEmergencyPlan = data.drillEmergencyPlan;
      taskDetail(data.id).then((res) => {
        detail.value = res;
        formElRef.value?.init(res);
        res.drillScheme = res.drillScheme?.join(',');
        res.drillEmergencyPlan = res.drillEmergencyPlan?.join(',');
        res.drillScript = res.drillScript?.join(',');
        Object.assign(detailInfo.value, res);
        if(res.approvalStatus == 2) {
          const jsonObject = data.jsonObject
          Object.assign(formState.value, jsonObject)
          let keys = ['purpose', 'record', 'rescue'];
          keys.map((k) => {
            if (jsonObject[k]) {
              formState.value[k+'1'] = jsonObject[k][0]
            }
          });
          if (jsonObject.reviewContent) {
            formState.value.reviewContent1 = jsonObject.reviewContent[0].content
          }
          let key2 = ['personArrival', 'workMaterial', 'personalProtection', 'overallOrganization', 'organizationDivision', 'practicalEffect', 'reportSuperior',
            'safetyDepartment', 'rescueEffect', 'alertCooperation'];
          key2.map(k => {
            if(jsonObject[k] && jsonObject[k].length) {
              formState.value[k] = jsonObject[k].map(item => {
                if(item.isSelect == 'true') {
                  return item.content
                }
              })
            }
          })
        }
      });
    }
  });

  const formState = ref<any>({
    purpose1: '',
    record1: '',
    rescue1: '',
    personArrival: ['迅速准确、按时到位'],
    workMaterial: ['充分、有效'],
    personalProtection: ['防护到位'],
    overallOrganization: ['准确、高效、满足要求'],
    organizationDivision: ['安全、快速'],
    practicalEffect: ['达到预期目标'],
    reportSuperior: ['报告及时'],
    safetyDepartment: ['按要求协作'],
    rescueEffect: ['按要求协作'],
    alertCooperation: ['按要求配合'],
    aqb: '应急演练安全部审批人'
  });
  const [registerSignModal, { openModal: openSignModal }] = useModal();
  const { pingkjia, fillTemplate } = useData();
  const backreson = ref('');
  const backFn = () => {
    closeDrawer();
    close();
  };
  const confirmLoading = ref(false);
  const backOk = () => {
    if (!backreson.value) {
      empty.value = true;
      return;
    }
    confirmLoading.value = true;
    examineBack({
      id: getId(),
      backReason: backreson.value,
    })
      .then(() => {
        backOpen.value = false;
        empty.value = false;
        confirmLoading.value = false;
        closeDrawer();
        emits('success');
      })
      .catch(() => {
        confirmLoading.value = false;
      });
  };
  const cancel = () => {
    backOpen.value = false;
    backreson.value = '';
    empty.value = false;
  };

  const submitFn = async () => {
    await contentFormElRef.value?.validate();
    submitIng.value = true;
    console.log(formState.value);
    let params = JSON.parse(JSON.stringify(formState.value));
    if (title.value == '演练方案') {
      params.drillScheme = params.drillScheme.split(',');
      params.drillEmergencyPlan = params.drillEmergencyPlan.split(',');
      params.drillScript = params.drillScript.split(',');
      drillScheme(params)
        .then(() => {
          submitIng.value = false;
          closeDrawer();
          emits('success');
        })
        .catch(() => {
          submitIng.value = false;
        });
      return false;
    }
    if (title.value == '影像资料') {
      params.drillVideoData = params.drillVideoData.split(',');
      videoData(params)
        .then(() => {
          submitIng.value = false;
          closeDrawer();
          emits('success');
        })
        .catch(() => {
          submitIng.value = false;
        });
      return false;
    }
    if (title.value == '动员培训') {
      trainContent(params)
        .then(() => {
          submitIng.value = false;
          closeDrawer();
          emits('success');
        })
        .catch(() => {
          submitIng.value = false;
        });
      return false;
    }
    if (title.value == '演练记录') {
      let keys = ['purpose', 'record', 'rescue'];
      params.purpose = [];
      params.record = [];
      params.rescue = [];
      params.reviewContent = [];
      keys.map((k) => {
        if (params[k + '1']) {
          params[k].push(params[k + '1']);
        }
      });
      if (params.reviewContent1) {
        params.reviewContent.push({
          serialNumber: '1',
          content: params.reviewContent1,
          isSelect: true,
        });
      }
      pingkjia.map((item) => {
        params[item.key] = item.items.map((citem, i) => {
          if (params[item.key].includes(citem)) {
            return {
              serialNumber: i + 1,
              isSelect: true,
              content: citem,
            };
          } else {
            return {
              serialNumber: i + 1,
              isSelect: false,
              content: citem,
            };
          }
        });
      });
      drillRecord(params)
        .then(() => {
          submitIng.value = false;
          closeDrawer();
          emits('success');
        })
        .catch(() => {
          submitIng.value = false;
        });
      return false;
    }
    if (title.value == '演练总结') {
      params.drillSummary = params.drillSummary.split(',');
      params.drillCorrective = params.drillCorrective.split(',');
      drillSummary(params)
        .then(() => {
          submitIng.value = false;
          closeDrawer();
          emits('success');
        })
        .catch(() => {
          submitIng.value = false;
        });
      return false;
    }
    openSignModal(true, { id: getId() });
  };
  const close = () => {
    contentFormElRef.value?.resetFields();
    contentFormElRef.value?.clearValidate();
  };
  const getId = () => {
    let nodeId = '';
    for (var i = 0; i < detail.value.examineList.length; i++) {
      if (detail.value.examineList[i].state === null) {
        nodeId = detail.value.examineList[i].id;
        break;
      }
    }
    return nodeId;
  };

  const signSuccess = () => {
    emits('success');
    closeDrawer();
  };
  const handleModal = (type, title) => {
    visible.value = true;
    fillTitle.value = title;
    fillData.value = fillTemplate[type];
  };
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
    padding: 0;
  }

  .btns {
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  // 模板模态框样式
  .template-modal {
    .ant-modal-body {
      padding: 0;
    }
  }

  .template-content {
    max-height: 500px;
    overflow-y: auto;
    padding: 16px;
  }

  .template-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    margin-bottom: 8px;
    background: #fafafa;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #f0f9ff;
      border-color: #1890ff;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .template-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    margin-right: 16px;
    word-break: break-all;
  }
</style>
