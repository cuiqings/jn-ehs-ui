<template>
  <BasicDrawer v-bind="$attrs" @register="register" @close="close" :title="title" width="1300px" style="padding-bottom: 60px;">
    <plan-form ref="formElRef" :detail="detail" :disabled="disabled" @cancel="closeDrawer"
      @submit="closeDrawer"></plan-form>
    <div class="step-tit">演练记录 <a-button type="primary" :loading="submitIng" @click="download">下载演练记录</a-button></div>
    <a-form :model="formState" ref="contentFormElRef" name="basic" :layout="'vertical'" :label-col="{ span: 3 }"
      :wrapper-col="{ span: 16 }">
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
        <a-form-item :labelCol="{ span: 5 }" label="5、演练总结" name="drillSummary">
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
      <div class="exaime">
        <div class="tit">计划审批</div>
        <ul>
          <li v-for="item in detail.examineList">
            <div class="name">{{ item.nodeName }}</div>
            <div class="names">
              <span style="padding-right: 15px;">{{ item.userName }}</span> <span>{{ item.finishTime }}</span>
            </div>
            <div v-if="item.backReason">退回原因：<span style="color: #ff4d4f">{{item.backReason}}</span></div>
            <img v-if="item.sign" :src="getFileAccessHttpUrl(item.sign)" alt="">
          </li>
        </ul>
      </div>
    </a-form>
  </BasicDrawer>

  <a-modal v-model:visible="htmlShow" :footer="null" :title="htmlTitle" @cancel="htmlShow = false" width="960px">
    <div style="padding: 0 10px;">
      <iframe ref="htmlRef" :srcdoc="htmlContent" frameborder="0" width="100%" height="680"></iframe>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { taskDetail, drillTaskView, downloadTrainRecord } from '../api';
import planForm from './components/planForm.vue';
import type { FormInstance } from 'ant-design-vue';
import dayjs from 'dayjs';
import { ref } from 'vue';
import {getFileAccessHttpUrl} from "/@/utils/common/compUtils";

const emits = defineEmits(['success']);
const title = ref('新增');
const disabled = ref(false);
const detail = ref<any>({});
const formElRef = ref<InstanceType<typeof planForm> | null>(null);
const contentFormElRef = ref<FormInstance|null>(null)
const [register, { closeDrawer }] = useDrawerInner((data) => {
  title.value = data.title;
  if (data.id) {
    formState.value.id = data.id;
    formState.value.drillEmergencyPlan = data.drillEmergencyPlan
    taskDetail(data.id).then(res => {
      detail.value = res
      formElRef.value?.init(res)
      res.drillScheme = res.drillScheme.join(',');
      res.drillEmergencyPlan = res.drillEmergencyPlan.join(',');
      res.drillScript = res.drillScript.join(',');
      Object.assign(formState.value, res);
      console.log(formState.value);

    });
  }
});

const close = () => {
  contentFormElRef.value?.resetFields();
};

const formState = ref<any>({})
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

const submitIng = ref(false)
const download = () => {
  submitIng.value = true
  downloadTrainRecord(detail.value.id).then(res => {
    let blobOptions = { type: 'application/vnd.zip' };
    let fileSuffix = '.zip';
    let url = window.URL.createObjectURL(new Blob([res], blobOptions));
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', `演练记录-${dayjs(new Date()).format('YYYY-MM-DD')}${fileSuffix}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    submitIng.value = false
  }).catch(e => {
    submitIng.value = false
  })
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

.record-list {
  width: 500px;

  .tit {
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 36px;

    span {
      color: #1890ff;
      cursor: pointer;
    }
  }
}

.form-main {
  padding-left: 56px;
}

.step-tit {
  color: #1890ff;
  width: 200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
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
</style>
