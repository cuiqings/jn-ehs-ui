<template>
  <BasicDrawer v-bind="$attrs" @register="register" :title="title" width="1300px" style="padding-bottom: 60px;">
    <plan-form ref="formElRef" :detail="detail" :disabled="disabled" @cancel="closeDrawer"
      @submit="closeDrawer"></plan-form>
    <div class="step-tit">演练记录</div>
    <a-form :model="formState" ref="contentFormElRef" name="basic" :label-col="{ span: 3 }" :wrapper-col="{ span: 16 }">
      <div class="form-main">
        <a-form-item label="1、演练方案" name="drillScheme">
          <JUpload ref="uploadRef" disabled accept=".doc,.docx,.pdf,.xls,.xlsx" :maxCount="10"
            v-model:value="formState.drillScheme" text="上传附件" />
        </a-form-item>
        <a-form-item label="2、演练应急预案" name="drillEmergencyPlan">
          <JUpload accept=".doc,.docx,.pdf,.xls,.xlsx" disabled ref="uploadRef" :maxCount="10"
            v-model:value="formState.drillEmergencyPlan" text="上传附件" />
        </a-form-item>
        <a-form-item label="3、演练脚本" name="drillScript">
          <JUpload accept=".doc,.docx,.pdf,.xls,.xlsx" disabled ref="uploadRef" :maxCount="10"
            v-model:value="formState.drillScript" text="上传附件" />
        </a-form-item>
        <a-form-item label="4、演练记录">
          <div class="record-list">
            <div class="tit">
              动员培训:<span v-if="formState.drillRecord" @click="getHtml(1)">动员培训.pdf</span>
            </div>
            <div class="tit">
              演练记录:<span v-if="formState.drillRecord" @click="getHtml(2)">演练记录.pdf</span>
            </div>
            <div class="tit">
              评估报告:<span v-if="formState.drillRecord" @click="getHtml(3)">评估报告.pdf</span>
            </div>
            <!-- <div class="tit">
              应急救援队伍名单:<span v-if="formState.drillRecord" @click="getHtml(4)">应急救援队伍名单.pdf</span>
            </div> -->
            <div class="tit">
              演练评价表:<span v-if="formState.drillRecord" @click="getHtml(5)">演练评价表.pdf</span>
            </div>
          </div>
        </a-form-item>
        <a-form-item label="5、演练总结" name="drillSummary">
          <JUpload accept=".doc,.docx,.pdf,.xls,.xlsx" disabled ref="uploadRef" :maxCount="10"
            v-model:value="formState.drillSummary" text="上传附件" />
        </a-form-item>
        <a-form-item :labelCol="{ span: 5 }" label="6、演练存在不足之处整改落实情况" name="drillCorrective">
          <JUpload accept=".doc,.docx,.pdf,.xls,.xlsx" disabled ref="uploadRef" :maxCount="10"
            v-model:value="formState.drillCorrective" text="上传附件" />
        </a-form-item>
        <a-form-item label="7、演练影像资料" name="drillVideoData">
          <JUpload ref="uploadRef" disabled accept="image/*, video/*" :maxCount="20"
            v-model:value="formState.drillVideoData" text="上传附件" />
        </a-form-item>
      </div>
    </a-form>
    <div class="exaime">
      <div class="tit">计划审批</div>
      <ul>
        <li v-for="item in detail.examineList">
          <div class="name">{{ item.nodeName }}</div>
          <div class="names">
            <span style="padding-right: 15px;">{{ item.userName }}</span> <span>{{ item.finishTime }}</span>
          </div>
          <img v-if="item.sign" :src="getFileAccessHttpUrl(item.sign)" alt="">
        </li>
      </ul>
    </div>
    <template v-if="title != '详情'" #footer>
      <div class="btns">
        <a-space :size="24">
          <a-button type="primary" danger @click="submitFail">审批退回</a-button>
          <a-button type="primary" @click="submitFn">审批同意</a-button>
        </a-space>
      </div>
    </template>
  </BasicDrawer>
  <a-modal v-model:visible="htmlShow" :footer="null" :title="htmlTitle" @cancel="htmlShow = false" width="960px">
    <div style="padding: 0 10px;">
      <iframe ref="htmlRef" :srcdoc="htmlContent" frameborder="0" width="100%" height="680"></iframe>
    </div>
  </a-modal>
  <a-modal v-model:visible="failShow" title="审批退回" @cancel="failShow = false" @ok="failOk" width="560px">
    <a-form
      ref="failForm"
      :model="failData"
      name="failForm"
      style="padding: 32px 0"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item
        label="退回原因"
        name="backReason"
        :rules="[{ required: true, message: '请输入' }]"
      >
        <a-textarea :rows="3" :maxlength="200" placeholder="请输入" v-model:value="failData.backReason" />
      </a-form-item>
    </a-form>
  </a-modal>
  <signModal @register="registerSignModal" @close="signSuccess" />
</template>
<script lang="ts" setup>
import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import {approval, approvalDetail, drillTaskView} from '../api';
import signModal from './components/signModal.vue';
import planForm from './components/planForm.vue';
import { useModal } from '/@/components/Modal';
import type { FormInstance } from 'ant-design-vue';
import { ref } from 'vue';

const emits = defineEmits(['success']);
const title = ref('新增');
const disabled = ref(false);
const detail = ref<any>({});
const failShow = ref(false);
const formElRef = ref<InstanceType<typeof planForm> | null>(null);
const contentFormElRef = ref<FormInstance | null>(null)
const submitIng = ref(false);
const [register, { closeDrawer }] = useDrawerInner((data) => {
  title.value = data.title;
  if (data.id) {
    formState.value.id = data.id;
    formState.value.drillEmergencyPlan = data.drillEmergencyPlan
    approvalDetail(data.id).then(res => {
      detail.value = res;
      formElRef.value?.init(res)
      res.drillScheme = res.drillScheme.join(',');
      res.drillEmergencyPlan = res.drillEmergencyPlan.join(',');
      res.drillScript = res.drillScript.join(',');
      Object.assign(formState.value, res);
      console.log(formState.value);
    });
  }
});

const formState = ref<any>({})

const [registerSignModal, { openModal: openSignModal }] = useModal();

const submitFn = async () => {
  await contentFormElRef.value?.validate()
  submitIng.value = true;
  openSignModal(true, { id: getId() })
}
const getId = () => {
  let nodeId = '';
  for (var i = 0; i < detail.value.examineList.length; i++) {
    if (detail.value.examineList[i].status === null) {
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

const htmlShow = ref(false)
const htmlTitle = ref('')
const htmlContent = ref('')
const htmlRef = ref(null)
const getHtml = (type) => {
  console.log(detail.value);
  const titmap = {
    1: '动员培训',
    2: '演练记录',
    3: '评估报告',
    4: '应急救援队伍名单',
    5: '演练评价表'
  }
  drillTaskView({ type: type, id: detail.value.id }).then(res => {
    htmlContent.value = res;
    htmlTitle.value = titmap[type];
    htmlShow.value = true;
  })
}
const confirmLoading = ref(false)
const failForm = ref(null)
const failData = ref({
  backReason: undefined
})
const submitFail = () => {
  failShow.value = true;
}
const failOk = () => {
  console.log(failData.value)
  if( confirmLoading.value ) return;
  failForm.value?.validate()
    .then(async () => {
      confirmLoading.value = true;
      const { id } = detail.value.examineList.find(item => !item.finishTime)
      console.log(id)
      approval({
        id: id,
        backReason: failData.value.backReason
      }).then(() => {
        failShow.value = false;
      }).finally(() => {
        confirmLoading.value = false;
        signSuccess();
      })
    })
    .catch((err) => {
      confirmLoading.value = false;
      console.log(err);
    });
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

.exaime {
  padding-bottom: 60px;

  .tit {
    font-size: 16px;
    font-weight: 600;
    color: #1890ff;
    padding: 16px 0;
  }

  .name {
    color: #1890ff;
  }

  img {
    height: 80px;
    margin-left: 58px;
  }

  ul {
    padding-left: 20px;

    li {
      margin-bottom: 20px;
    }
  }
}

.record-list {
  width: 500px;

  .tit {
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 36px;

    span {
      color: #1890ff;
    }
  }
}
.btns {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 16px;
}
</style>
