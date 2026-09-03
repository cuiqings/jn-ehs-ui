<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="600" :title="title" destroyOnClose @cancel="close">
    <a-upload-dragger
      name="file"
      multiple
      accept="image/*"
      :customRequest="customRequest"
      :beforeUpload="beforeUpload"
      :fileList="fileList"
      :show-upload-list="{ showRemoveIcon: false }"
    >
      <p class="ant-upload-drag-icon">
        <inbox-outlined />
      </p>
      <p class="ant-upload-text">{{ uploadText }}</p>
      <p class="ant-upload-hint"> {{ uploadHint }} </p>
    </a-upload-dragger>
    <template #footer>
      <div>
        <a-button @click="close">取消</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="review-release-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import { InboxOutlined } from '@ant-design/icons-vue';
  import axios from 'axios';
  import { getToken } from '/@/utils/auth';
  import { useGlobSetting } from '/@/hooks/setting';
  import { message } from 'ant-design-vue';
  const globSetting = useGlobSetting();
  const emit = defineEmits(['success', 'success-url']);
  const props = defineProps({
    uploadText: {
      type: String,
      default: '',
    },
    uploadHint: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '上传',
    },
    maxSize: {
      type: Number,
      default: 5,
    },
    fileSize: {
      type: Number,
      default: 300,
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String || null,
      default: null,
    },
  });
  const imgUrl = ref('');
  const fileList: any = ref([]);
  const [registerModal, { closeModal }] = useModalInner(async () => {});
  const beforeUpload = async (file: any) => {
    fileList.value.push(file);
  };
  // 自定义上传
  const customRequest = (option) => {
    const { file } = option;
    upload(file);
  };
  const upload = async (file) => {
    const formData = new FormData();
    formData.append('file', file); // 通过 FormData 传递文件
    formData.append('type', 'IMAGE');
    formData.append('category', props.category);
    try {
      await axios
        .post(`${globSetting.uploadUrl}/edu/resource/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-Access-Token': getToken(),
          },
        })
        .then((res) => {
          if (res.data.success) {
            imgUrl.value = res.data.result;
            message.success(`${file.name}上传成功！`);
          }
        });
    } catch (error) {
      message.error(`${file.name}上传失败！`);
    }
  };
  const close = () => {
    fileList.value = [];
    closeModal();
    emit('success');
    emit('success-url', imgUrl.value);
  };
</script>
