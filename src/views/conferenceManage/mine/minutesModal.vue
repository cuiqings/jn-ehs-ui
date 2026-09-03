<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="600" title="会议纪要" :body-style="{ padding: '0 20px' }" destroyOnClose>
    <div>
      <a-form :model="info" ref="infoRef" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" autocomplete="off">
        <div>
          <div class="tit">会议主题</div>
          <div class="content">{{ info.conferenceTheme }}</div>
        </div>
        <div>
          <div class="tit">会议时间</div>
          <div class="content">{{ info.startDate }}~{{ info.endDate }}</div>
        </div>
        <div>
          <div class="tit">参会人员</div>
          <div class="content"></div>
        </div>
        <a-form-item label="会议纪要内容" name="content" :rules="[{ required: true, message: '请输入' }]">
          <a-textarea v-model:value="info.content" placeholder="请输入" :rows="3" :maxlength="300" />
        </a-form-item>
        <a-form-item label="会议纪要文件" name="name">
          <customize-upload v-model:value="info.file" :max-count="5" />
        </a-form-item>
        <a-form-item label="会议照片" name="name">
          <JImageUpload v-model:value="info.sign" :is-watermark="true" :maxCount="1" bizPath="dangerWork" fileType="image" />
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <div style="text-align: right">
        <a-button style="margin-right: 15px" @click="close">取消</a-button>
        <a-button type="primary" :loading="loading" @click="confirmClose">保存纪要</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="blacklist-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
   import CustomizeUpload from '../component/CustomizeUpload.vue';
  import { queryById } from './url/index';
  import { useUserStore } from '/@/store/modules/user';
  import { JImageUpload } from '/@/components/Form';
  import { ref, computed } from 'vue';

  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  
  const emit = defineEmits(['success']);
  const infoRef: any = ref(null);
  const loading = ref(false);
  const info: any = ref({
    id: '',
    blackRemark: '',
    blackFlag: '1',
  });
  const name = ref('');
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    queryById({id: data.data.id}).then((res) => { 
      Object.assign(info.value, res);
    });
  });
  const confirmClose = async () => {
    if(userInfo.value.signature) {
      await infoRef.value.validate();
      loading.value = true;
      const res = await addBlack(info.value);
      if (res) {
        emit('success');
        close();
      }
      loading.value = false;
    } else {
    }
  };
  const close = () => {
    closeModal();
  };

  const nextStep = (data) => {
    info.value.signature = data.sign;
  };
</script>
<style  lang="less" scoped>
  .tit{
    font-weight: 600;
    padding: 10px 0;
  }
  :deep(label){
    font-weight: 600;
  }
</style>
