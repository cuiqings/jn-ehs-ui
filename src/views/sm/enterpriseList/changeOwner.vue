<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="600" title="变更负责人" :body-style="{ padding: '0 20px' }" destroyOnClose>
    <div>
      <div style="padding-left: 10px; padding-bottom: 10px"
        >是否确认将<span style="color: #1890ff; font-weight: bold">{{ companyName }}</span
        >负责人变更？</div
      >
      <a-form :model="info" ref="infoRef" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }" autocomplete="off">
        <a-form-item label="人员：" name="personId" :rules="[{ required: true, message: '人员为必填项！' }]">
          <a-select
            v-model:value="info.personId"
            placeholder="请选择人员"
            :options="personOptions"
            showSearch
            :filterOption="
              (input, option) => {
                return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }
            "
          />
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <div style="text-align: right">
        <a-button style="margin-right: 15px" @click="close">取消</a-button>
        <a-button type="primary" :loading="loading" @click="confirmClose">提交</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="blacklist-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import { getPersonList, changeManager } from './url/index';
  const emit = defineEmits(['success']);
  const infoRef: any = ref(null);
  const loading = ref(false);
  const info: any = ref({
    id: '',
    personId: undefined,
  });
  const personOptions = ref([]);
  const companyName = ref('');
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    await infoRef.value.resetFields();
    info.value.personId = undefined;
    info.value.id = data.id;
    getPersonListApi(data.id);
    companyName.value = data.companyName;
  });
  const getPersonListApi = (id) => {
    getPersonList({
      id,
    }).then((res) => {
      personOptions.value = res.map((item: any) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
    });
  };
  const confirmClose = async () => {
    await infoRef.value.validate();
    changeManager(info.value)
      .then(() => {
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success');
      })
      .finally(() => {
        loading.value = false;
      });
  };
  const close = () => {
    closeModal();
  };
</script>
