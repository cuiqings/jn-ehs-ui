<template>
  <van-uploader
    v-model="fileList"
    :multiple="multiple"
    :max-count="maxCount"
    :max-size="300 * 1024 * 1024"
    :before-read="beforeRead"
    :after-read="afterRead"
    :accept="accept"
    :disabled="disabled"
    :deletable="!disabled"
    @oversize="onOversize"
  >
    <a type="primary">添加附件</a>
  </van-uploader>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue';
  import { showToast } from 'vant';
  import { uploadFile } from '/@/api/common/api';
  import { getFileAccessHttpUrl,dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from "/@/store/modules/user";
  const emit = defineEmits(['update:fileList','change']);
  const props = defineProps({
    fileList: { type: String, default: '' }, // 例：‘1.doc,2.pdf’
    multiple: { type: Boolean, default: false },
    maxCount: { type: Number, default: 10 },
    maxSize: { type: Number, default: 300 }, // 300M
    accept: { type: String, default: 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    disabled: { type: Boolean, default: false },
    biz: { type: String, default: 'app' }
  })
  const userStore:any = useUserStore();
  const fileList = ref<any[]>([])
  onMounted(() => {
    if(props.fileList){
      props.fileList.split(',').forEach(item => {
        fileList.value.push({
          url: getFileAccessHttpUrl(item),
          uri: item,
        })
      })
    }
  });

  watch(
    () => fileList.value,
    (v: any) => {
      // 先筛选上传成功的
      const val = v.filter(item => item.uri).map(item => item.uri)
      emit('update:fileList', val.join(','));
    },
    {
      deep: true,
    }
  );

  // 文件上传完毕后会触发
  const afterRead = async (file) => {
    // console.log(file,'sssss----')
    if (file instanceof Array && file.length) {
      file.forEach(async item => {
        let params = {
          file: item.file,
          data: {biz: props.biz}
        };
        uploadFile(params, (res) => {
          if (res.success) {
            item.status = 'done';
            item.message = '';
            item.objectUrl = ''
            item.content = ''
            item.url = getFileAccessHttpUrl(res.message)
            item.uri = res.message
          } else {
            showToast(res.message);
            item.status = 'failed';
            item.message = '上传失败';
          }
        })
      })
    } else {
      file.status = 'uploading';
      file.message = '上传中...';
      let params = {
        file: file.file,
        data: {biz: props.biz}
      };
      uploadFile(params, (res) => {
        if (res.success) {
          file.status = 'done';
          file.message = '';
          file.objectUrl = ''
          file.content = ''
          file.url = getFileAccessHttpUrl(res.message)
          file.uri = res.message
        } else {
          showToast(res.message);
          file.status = 'failed';
          file.message = '上传失败';
        }
      })
    }
  };

  const onOversize = (file) => {
    showToast('文件大小不能超过 300M');
  };
  const beforeRead = (file) => {
    if (file instanceof Array && file.length) {
      let arr:any=[]
      file.forEach(async (item) => {
        const isPdf = item.type === 'application/pdf';
        const isDoc = item.type === 'application/msword';
        const isDocx = item.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        if (isPdf && isDoc && isDocx) {
          showToast(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`)
          return false
        }
      })
      return file
    } else {
      if (file.type === 'application/pdf' && file.type === 'application/msword' && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        showToast(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`)
        return false
      }
      return file
    }
  };

</script>

<style lang="less" scoped>

</style>
