<template>
  <BasicDrawer
    forceRender
    v-bind="$attrs"
    @register="register"
    @close="close"
    :title="title"
    width="50%"
    showFooter
    @ok="handleSubmit"
    destroyOnClose
  >
    <div class="d-inner">
      <a-form class="d-form" ref="formRef" :model="formState" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="单位" name="orgCode">
              {{ detailInfo.orgCodeName }}
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="指标类型" name="indicatorType">
              {{ detailInfo.indicatorType }}
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="目标内容" name="type">
              {{ detailInfo.content }}
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="目标要求" name="value">
              {{ detailInfo.requirements || '' }} {{ detailInfo.value }}
            </a-form-item>
          </a-col>
          <a-col :span="24" v-if="detailInfo.indicatorType == '可量化'">
            <a-form-item style="flex: 1" label="实际完成值" name="completionValue" :rules="[{ required: true, message: '请输入' }]">
              <a-input-number v-if="detailInfo.unit" style="width: 100%" placeholder="请输入" v-model:value="formState.completionValue" addon-after="%" />
              <a-input-number v-else style="width: 100%" placeholder="请输入" v-model:value="formState.completionValue" />
            </a-form-item>
          </a-col>
          <a-col :span="24" v-if="detailInfo.indicatorType == '非量化'">
            <a-form-item style="flex: 1" label="完成情况描述" name="completionValue" :rules="[{ required: true, message: '请输入' }]">
              <a-input style="width: 100%" placeholder="请输入" v-model:value="formState.completionValue" />
            </a-form-item>
            <a-form-item style="flex: 1" label="自评完成率" name="completionRate" :rules="[{ required: true, message: '请输入' }]">
              <a-input-number style="width: 100%" placeholder="请输入" v-model:value="formState.completionRate" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item style="flex: 1" label="佐证材料" name="supportingMaterials" :rules="[{ required: true, message: '请输入' }]">
              <JUpload :maxCount="10" v-model:value="formState.supportingMaterials" text="上传附件" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { unitAddOrUpd, unitStatisticsDetail } from '../api';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { ref, reactive } from 'vue';
  import { FormInstance } from 'ant-design-vue/es/form';
  import { useUserStore } from '/@/store/modules/user';

  const userStore = useUserStore();
  const readonly = ref(false);
  const formRef = ref<FormInstance | null>(null);
  const title = ref('录入指标');
  const departList = ref<any[]>([]);
  const detailInfo = ref<any>({});
  const formState = reactive({
    id: '',
    completionValue: '',
    supportingMaterials: '',
    completionRate: '',
  });

  const emits = defineEmits(['submitSuccess']);

  const [register, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
    title.value = data.title;
    departList.value = await getDepart3ListWithSecurity();
    unitStatisticsDetail({ id: data.record.id }).then((res) => {
      Object.assign(detailInfo.value, res);
      formState.id = data.record.id;
    });
    if (title.value == '编辑') {
    }
    if (title.value == '详情') {
      Object.assign(formState, data.record);
      readonly.value = true;
    }
  });

  const submitIng = ref(false);
  const handleSubmit = (type) => {
    formRef.value
      ?.validate()
      .then(() => {
        submitIng.value = true;
        const params = JSON.parse(JSON.stringify(formState));
        unitAddOrUpd(params)
          .then((res) => {
            emits('submitSuccess', res);
            closeDrawer();
            formRef.value?.resetFields();
          })
          .finally(() => {
            setTimeout(() => {
              submitIng.value = false;
            }, 500);
          });
      })
      .catch(() => {
        submitIng.value = false;
      });
  };

  const close = () => {
    formRef.value?.resetFields();
    closeDrawer();
  };
</script>
<style lang="less" scoped>
  .title {
    font-size: 16px;
    font-weight: 600;
    padding: 16px 0;
  }
  .d-inner {
    width: 100%;
    height: 100%;
    padding-bottom: 55px;
    .d-form {
      flex: 1;
    }
  }
  .footer {
    width: 100%;
    height: 55px;
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    // 盒子顶部阴影
    box-shadow: 0 -2px 5px 0 rgba(0, 0, 0, 0.09);
  }
</style>
