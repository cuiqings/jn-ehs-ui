<template>
  <div>
    <BasicModal
      v-bind="$attrs"
      @register="registerModal"
      :width="820"
      :bodyStyle="{ padding: '10px 0 0 0', height: '700px' }"
      :title="title"
      destroyOnClose
    >
      <!-- 基本信息 -->
      <div style="margin-bottom: 24px">
        <div style="font-weight: bold; margin-bottom: 12px">基本信息</div>
        <a-row style="background: #fafafa; padding: 18px 12px; border-radius: 8px">
          <template v-for="item in baseInfoList" :key="item.key">
            <a-col :span="12" style="margin-bottom: 8px">
              <span style="color: #888">{{ item.label }}：</span>{{ item.value }}
            </a-col>
          </template>
        </a-row>
      </div>
      <a-form ref="formRef" :model="form" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
        <a-row>
          <a-card title="职业健康三同时" style="width: 100%; background-color: #fafafa; border-radius: 5px">
            <a-form-item label="职业病危害控制效果评价" name="zyjkFile1" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <customize-upload v-model:value="form.zyjkFile1" :max-count="1" disabled />
            </a-form-item>
            <a-form-item label="职业病危害预评价" name="zyjkFile2" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <customize-upload v-model:value="form.zyjkFile2" :max-count="1" disabled />
            </a-form-item>
            <a-form-item label="职业病危害现状评价" name="zyjkFile3" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <customize-upload v-model:value="form.zyjkFile3" :max-count="1" disabled />
            </a-form-item>
          </a-card>
        </a-row>
        <a-row>
          <a-card title="安全设备三同时" style="width: 100%; margin-top: 20px; background-color: #fafafa; border-radius: 5px">
            <a-form-item label="安全预评价" name="aqsbFile1" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <customize-upload v-model:value="form.aqsbFile1" :max-count="1" disabled />
            </a-form-item>
            <a-form-item label="安全设施设计" name="aqsbFile2" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <customize-upload v-model:value="form.aqsbFile2" :max-count="1" disabled />
            </a-form-item>
            <a-form-item label="验收报告" name="aqsbFile3" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <customize-upload v-model:value="form.aqsbFile3" :max-count="1" disabled />
            </a-form-item>
            <a-form-item label="省厅批复" name="aqsbFile4" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <customize-upload v-model:value="form.aqsbFile4" :max-count="1" disabled />
            </a-form-item>
          </a-card>
        </a-row>
        <a-row>
          <a-card title="消防三同时" style="width: 100%; margin-top: 20px; background-color: #fafafa; border-radius: 5px">
            <a-form-item label="消防设计" name="xfFile1" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <customize-upload v-model:value="form.xfFile1" :max-count="1" disabled />
            </a-form-item>
            <a-form-item label="消防设计审核" name="xfFile2" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <customize-upload v-model:value="form.xfFile2" :max-count="1" disabled />
            </a-form-item>
            <a-form-item label="消防验收" name="xfFile3" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <customize-upload v-model:value="form.xfFile3" :max-count="1" disabled />
            </a-form-item>
          </a-card>
        </a-row>
      </a-form>
      <template #footer>
        <div style="text-align: center">
          <a-button @click="close">关闭</a-button>
        </div>
      </template>
    </BasicModal>
  </div>
</template>

<script lang="ts" name="three-simultaneity-view-modal" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import CustomizeUpload from './CustomizeUpload.vue';
  import { detail } from './api';
  const title = ref('三同时台账详情');
  const baseInfoList = ref([
    { key: 'orgName', label: '建设单位', value: '' },
    { key: 'constructProject', label: '建设项目', value: '' },
    { key: 'preEvaluateUnit', label: '预评价编写单位', value: '' },
    { key: 'designUnit', label: '设计单位', value: '' },
    { key: 'checkUnit', label: '验收单位', value: '' },
  ]);
  const form = ref({
    zyjkFile1: '',
    zyjkFile2: '',
    zyjkFile3: '',
    aqsbFile1: '',
    aqsbFile2: '',
    aqsbFile3: '',
    aqsbFile4: '',
    xfFile1: '',
    xfFile2: '',
    xfFile3: '',
  });
  const [registerModal, { closeModal }] = useModalInner((data) => {
    detail({ id: data.record.id }).then((res) => {
      if (res) {
        baseInfoList.value.forEach((item) => {
          item.value = res[item.key] || '';
        });
        form.value = res;
      }
    });
  });

  const close = () => {
    closeModal();
  };
</script>

<style lang="less" scoped>
  :deep(.ant-card-body) {
    padding: 10px 20px;
  }
  :deep(.ant-form-item-control-input-content) {
    display: flex;
  }
</style>
