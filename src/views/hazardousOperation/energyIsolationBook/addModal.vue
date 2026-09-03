<template>
  <basic-modal
    v-bind="$attrs"
    @register="register"
    :width="600"
    :title="title"
    :body-style="{ padding: '0 10px', maxHeight: '600px', overflow: 'auto' }"
    destroyOnClose
    :zIndex="997"
    @ok="submit"
    @cancel="close"
    :show-ok-btn="title != '查看'"
    :canFullscreen="false"
  >
    <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-row :gutter="12">
        <a-col :span="24">
          <a-form-item label="所属单位" name="orgCode" :rules="[{ required: true, message: '请选择' }]">
            <a-select
              v-model:value="formState.orgCode"
              :options="departList"
              @change="orgChange"
              :disabled="readonly"
              placeholder="请选择"
              :fieldNames="{ label: 'departName', value: 'orgCode' }"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="所属车间" name="workshop">
            <a-select
              v-model:value="formState.workShop"
              :options="departList2"
              :disabled="readonly"
              placeholder="请选择"
              @change="workshopChange"
              :fieldNames="{ label: 'departName', value: 'orgCode' }"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="设备名称" name="equipmentName">
            <a-input :disabled="readonly" v-model:value="formState.equipmentName" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="编号" name="equipmentCode" :rules="[{ required: true, message: '请输入' }]">
            <a-input :disabled="readonly" v-model:value="formState.equipmentCode" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="能源隔离点位" name="isolationId" :rules="[{ required: true, message: '请选择' }]">
            <a-input v-model:value="formState.isolationName" placeholder="请输入" :disabled="readonly" readonly @click="isoClick" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="文件" name="file" :rules="[{ required: true, message: '请输入' }]">
            <CustomizeUpload v-model:value="formState.file" :max-count="1" :disabled="readonly" />
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-form-item label="编写时间" name="writeTime">
            <a-date-picker :disabledDate="(current) => current && dayjs(current).isAfter(dayjs())" v-model:value="formState.writeTime" :disabled="readonly" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </basic-modal>
  <IsolationModal @register="registerM" @success="handleSuccess" />
</template>
<script lang="ts" name="add-modal" setup>
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import CustomizeUpload from '../../sm/components/CustomizeUpload.vue';
  import type { FormInstance } from 'ant-design-vue';
  import IsolationModal from './reviewModal.vue'
  import { add, edit } from './api';
  import dayjs from 'dayjs';
  import { ref } from 'vue';
  const emit = defineEmits(['success']);
  const loading = ref(false);
  const title = ref('');
  const formRef = ref<FormInstance|null>(null);
  const readonly = ref(false);
  const formState = ref({
    orgCode: undefined,
    workShop: undefined,
    isolationId: undefined,
    isolationName: undefined,
    equipmentCode: '',
    equipmentName: '',
    file: '',
    writeTime: dayjs().format('YYYY-MM-DD'),
  });
  const departList = ref([]);
  const departList2 = ref([]);

  const [register, { closeModal, changeLoading }] = useModalInner(async (data) => {
    title.value = data.title;
    if(title.value == '编辑') {
      formState.value = data.data;
      departList2.value = await selectDeptNew({ orgCode: data.data.orgCode });
    }
    if(title.value == '查看') {
      readonly.value = true;
      formState.value = data.data;
    }
    departList.value = await getDepart3ListWithSecurity();

  })

  const orgChange = async (value) => {
    departList2.value = await selectDeptNew({ orgCode: value });
    formState.value.isolationId = undefined;
    formState.value.isolationName = undefined;
    formState.value.workShop = undefined;
  };
  const workshopChange = async () => {
    formState.value.isolationId = undefined;
    formState.value.isolationName = undefined;
  };

  const [registerM, { openModal }] = useModal();

  const isoClick = () => {
    if( title.value == '查看' ) return;
    openModal(true, {orgCode: formState.value.orgCode, workShop: formState.value.workShop, value: splitIso()});
  };

  const splitIso = () => {
    if(!formState.value.isolationId) return [];
    let ids = formState.value.isolationId.split(',');
    let names = formState.value.isolationName.split(',');
    let maps = ids.map((val, idx) => {
      return {
        id: val,
        name: names[idx],
      };
    });
    return maps;
  };

  const handleSuccess = (data) => {
    let ids = ''; 
    let names= '';
    data.map(val => {
      ids += val.id + ',';
      names += val.name + ',';
    })
    ids = ids.substring(0, ids.length - 1);
    names = names.substring(0, names.length - 1);
    formState.value.isolationId = ids;
    formState.value.isolationName = names;
  }

  const submit = async () => { 
    loading.value = true;
    formRef.value?.validate().then(async () => { 
      changeLoading(true)
      if(title.value == '编辑') {
        await edit(formState.value).then(res => {
          formRef.value?.resetFields();
          close();
        }).finally(() => {
          changeLoading(false)
          loading.value = false;
        });
        return;
      }
      await add(formState.value).then(res => {
        formRef.value?.resetFields();
        close();
      }).finally(() => {
        changeLoading(false)
        loading.value = false;
      });

    }); 
  };
  
  const close = () => {
    closeModal();
    emit('success');
    readonly.value = false;
    formRef.value?.resetFields();
    formState.value = {
      orgCode: undefined,
      workShop: undefined,
      isolationId: undefined,
      isolationName: undefined,
      equipmentCode: '',
      equipmentName: '',
      file: '',
      writeTime: dayjs().format('YYYY-MM-DD'),
    };
  };
</script>
<style lang="less" scoped>
  .record-container {
    padding: 10px;
  }

  .record-section {
    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    color: #1890ff;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .record-item {
    border: 1px solid #d9d9d9;
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 6px;
    .record-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      margin: 6px 16px 12px;
      .record-person {
        font-weight: 500;
        color: #333;
      }

      .record-time {
        color: #666;
        font-size: 13px;
        margin-left: 10px;
      }
    }

    .record-content {
      padding-left: 16px;

      .record-label {
        color: #666;
        font-weight: 500;
        margin-right: 4px;
      }

      .record-detail {
        margin-top: 8px;
        color: #333;
        line-height: 1.6;
      }

      .text-success {
        color: #52c41a;
      }

      .text-danger {
        color: #ff4d4f;
      }

      .record-images {
        margin-top: 12px;

        .image-list {
          margin-top: 8px;
        }
      }

      .record-files {
        margin-top: 12px;

        .file-list {
          margin-top: 8px;
        }
      }
    }
  }
</style>
