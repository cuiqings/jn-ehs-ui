<template>
  <basic-modal
    v-bind="$attrs"
    :canFullscreen="false"
    @register="registerModal"
    :width="600"
    :title="title"
    :body-style="{ padding: '0 20px' }"
    destroyOnClose
  >
    <div>
      <a-form :model="info" ref="infoRef" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" autocomplete="off">
        <div v-if="type === 'examine'">
          <a-form-item label="检查结果：" name="checkResult" :rules="[{ required: true, message: '检查结果为必填项！' }]">
            <a-select v-model:value="info.checkResult" placeholder="请选择">
              <a-select-option value="1">合格</a-select-option>
              <a-select-option value="2">不合格</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            v-if="info.checkResult === '2'"
            label="不合格原因："
            name="checkComment"
            :rules="[{ required: true, message: '不合格原因为必填项！' }]"
          >
            <a-textarea v-model:value="info.checkComment" placeholder="请输入" rows="4" />
          </a-form-item>
          <a-form-item label="相关图片：" name="checkImg">
            <j-image-upload
              v-model:value="info.checkImg"
              :fileMax="10 - (info.checkFile === '' && !info.checkFile ? 0 : info.checkFile?.split(',').length)"
              text=""
              bizPath="sm"
            />
          </a-form-item>
          <a-form-item label="相关文件：" name="checkFile">
            <customize-upload
              v-model:value="info.checkFile"
              :max-count="10 - (info.checkImg === '' && !info.checkImg ? 0 : info.checkImg?.split(',').length)"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />
          </a-form-item>
        </div>
        <div v-if="type === 'rectify'">
          <a-form-item label="整改措施：" name="repairMsr" :rules="[{ required: true, message: '整改措施为必填项！' }]">
            <a-textarea v-model:value="info.repairMsr" placeholder="请输入" rows="4" />
          </a-form-item>
          <a-form-item label="整改后照片：" name="repairPicture" :rules="[{ required: true, message: '整改后照片为必填项！' }]">
            <j-image-upload v-model:value="info.repairPicture" :fileMax="10" text="" bizPath="sm" />
          </a-form-item>
        </div>
        <div v-if="type === 'acceptance'">
          <a-form-item label="验收结果：" name="checkResult" :rules="[{ required: true, message: '验收结果为必填项！' }]">
            <a-select v-model:value="info.checkResult" placeholder="请选择">
              <a-select-option value="1">合格</a-select-option>
              <a-select-option value="2">不合格</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            v-if="info.checkResult === '2'"
            label="不合格原因："
            name="checkReason"
            :rules="[{ required: true, message: '不合格原因为必填项！' }]"
          >
            <a-textarea v-model:value="info.checkReason" placeholder="请输入" rows="4" />
          </a-form-item>
        </div>
      </a-form>
    </div>
    <template #footer>
      <div style="text-align: right">
        <a-button @click="close">取消</a-button>
        <a-button type="primary" :loading="loading" @click="confirmClose">提交</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="review-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { edit, repair, check } from './url/index';
  import { JImageUpload } from '/@/components/Form';
  import CustomizeUpload from '../../sm/components/CustomizeUpload.vue';
  import { ref } from 'vue';
  const emit = defineEmits(['success']);
  const infoRef: any = ref(null);
  const loading = ref(false);
  const title = ref('');
  const type = ref('');
  const info: any = ref({
    id: '',
  });
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    await infoRef.value.resetFields();
    title.value = data.title;
    type.value = data.type;
    if (type.value === 'examine') {
      info.value = {
        id: data.data.id,
        checkResult: '1',
        checkComment: '',
        checkFile: '',
      };
    } else if (type.value === 'rectify') {
      info.value = {
        busId: data.data.id,
        repairMsr: '',
        repairPicture: '',
      };
    } else if (type.value === 'acceptance') {
      info.value = {
        busId: data.data.id,
        checkResult: '1',
        checkReason: '',
      };
    }
  });
  const confirmClose = async () => {
    await infoRef.value.validate();
    const data = JSON.parse(JSON.stringify(info.value));
    loading.value = true;
    try {
      let res = null;
      if (type.value === 'examine') {
        res = await edit(data);
      } else if (type.value === 'rectify') {
        res = await repair(data);
      } else if (type.value === 'acceptance') {
        res = await check(data);
      }
      if (res) {
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success');
      }
    } finally {
      loading.value = false;
    }
  };
  const close = () => {
    closeModal();
  };
</script>
<style lang="less"></style>
