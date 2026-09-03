<template>
  <BasicModal @register="register" v-bind="$attrs" :bodyStyle="{ height: '108px', overflow: 'hidden' }"
    :canFullscreen="false" title="导入" width="550" height="auto" @cancel="cancel" @ok="handleSubmit" destroyOnClose>
    <div class="main" v-loading="loading">
      <div class="text">
        参保单位: <a-select style="width: 220px" v-model:value="insuredUnit" placeholder="请选择" :options="dList"></a-select>
      </div>
      <a-space :size="24">
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>
      </a-space>
    </div>
    <template #footer>
      <a-space :size="24">
        <a-button @click="close">关闭</a-button>
      </a-space>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { useContent } from '../hooks/useContent';
import { useMethods } from '/@/hooks/system/useMethods';
const { handleImportXls } = useMethods();
import { useMessage } from '/@/hooks/web/useMessage';

const { createMessage } = useMessage();
const insuredUnit = ref('敬业钢铁有限公司');
const dList = [
  {value: '敬业钢铁有限公司', label: '敬业钢铁有限公司'},
  {value: '河北敬业宽板科技有限公司', label: '河北敬业宽板科技有限公司'},
  {value: '平山县洁创环保科技有限公司', label: '平山县洁创环保科技有限公司'},
  {value: '河北敬业高品钢科技有限公司', label: '河北敬业高品钢科技有限公司'}
]

const { reload } = useContent(() => {});
const loading = ref(false);
const onImportXls = (file) => {
  if(!insuredUnit.value) {
    createMessage.success('请选择参保单位');
    return;
  }
  loading.value = true;
  handleImportXls(
    file,
    '/businessAdmin/import',
    () => {
      loading.value = false;
      reload();
      close();
    },
    {
      insuredUnit: insuredUnit.value,
    }
  )
};

const [register, { closeModal }] = useModalInner(async () => {
});
const close = () => {
  closeModal();
  insuredUnit.value = '敬业钢铁有限公司';
};


</script>
<style lang="less" scoped>
.main {
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 0 15px;

  h3,
  p {
    padding: 0;
    margin: 0;
  }

  h3 {
    font-weight: 600;
  }
}
</style>
