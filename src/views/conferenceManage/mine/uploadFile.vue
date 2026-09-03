<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="800" title="会议纪要" :body-style="{ padding: '0 20px' }" destroyOnClose>
    <a-form :model="info" ref="infoRef" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" autocomplete="off">
      <div class="item">
        <div class="tit">会议主题</div>
        <div class="content">{{ info.conferenceTheme }}</div>
      </div>
      <div class="item">
        <div class="tit">会议时间</div>
        <div class="content">{{ info.startDate }}~{{ info.endDate }}</div>
      </div>
      <div class="item">
        <div class="tit">参会人员</div>
        <div class="content">
          <span v-for="item in info.userList"> {{ item.realname }}({{ item.username }}) </span>
        </div>
      </div>
      <a-form-item label="会议纪要内容" name="minutesContent" :rules="[{ required: true, message: '请输入' }]">
        <a-textarea v-model:value="info.minutesContent" placeholder="请输入" :rows="3" :maxlength="300" />
      </a-form-item>
      <a-form-item label="会议纪要文件" name="minutesDocument">
        <customize-upload accept=".pdf,.doc,.docx,.xls,.xlsx" :maxCount="1" v-model:value="info.minutesDocument" />
      </a-form-item>
      <a-form-item label="会议照片" name="photos">
        <JImageUpload :file-max="10" v-model:value="info.photos" :is-watermark="true" bizPath="dangerWork" fileType="image" />
      </a-form-item>
    </a-form>
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
  import { minutes } from './url/index';
  import { useUserStore } from '/@/store/modules/user';
  import { JImageUpload } from '/@/components/Form';
  import { ref, computed } from 'vue';
  import { queryById } from './url/index';

  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  
  const emit = defineEmits(['success']);
  const infoRef: any = ref(null);
  const loading = ref(false);
  const info: any = ref({
    id: '',
    photos: '',
    minutesContent: '',
    minutesDocument: ''
  });
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    await infoRef.value.resetFields();
    queryById({id: data.id}).then((res) => { 
      Object.assign(info.value, res);
    });
  });
  const confirmClose = async () => {
    if(userInfo.value.signature) {
      await infoRef.value.validate();
      loading.value = true;
      const res = await minutes(info.value);
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
</script>
<style  lang="less" scoped>
  .tit{
    font-weight: 600;
    padding-top: 10px;
  }
  .item{
    padding-bottom: 10px;
    border-bottom: 1px solid #eaeaea;
  }
  :deep(label){
    font-weight: 600;
  }
</style>
