<template>
  <div>
    <div class="title">Ai识隐患</div>
    <div class="hdAI-camera">
      <div class="ai-camera">
        <van-uploader
          v-model:value="yhPicture"
          :max-size="300 * 1024 * 1024"
          :after-read="afterRead"
          accept="image/jpeg,image/png,image/jpg"
          :capture="captureCam"
          :before-read="beforeRead"
          :preview-size="[340, 170]"
          upload-text="拍照"
          :uploadIcon="camera"
        />
      </div>
      <div class="ai-camera">
        <van-uploader
          v-model:value="yhPicture"
          :max-size="300 * 1024 * 1024"
          :after-read="afterRead"
          accept="image/*"
          :before-read="beforeRead"
          :preview-size="[340, 170]"
          upload-text="上传图片"
          :uploadIcon="picture"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import AppUploadCamera from '/@/components/App/AppUploadCamera.vue';
  import AppUpload from '/@/components/App/AppUpload.vue';
  import { uploadFile } from '/@/api/common/api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { showToast } from 'vant';
  import { useRouter } from 'vue-router';
  import camera from '/@/assets/app/camera@2x.png';
  import picture from '/@/assets/app/picture@2x.png';
  const router = useRouter();
  const yhPicture = ref('');
  const checkPicture = ref('');
  const captureCam = 'camera';
  // 文件上传完毕后会触发
  const afterRead = async (file) => {
    // console.log(file,'sssss----')
    if (file instanceof Array && file.length) {
      file.forEach(async (item) => {
        let params = {};
        params = {
          file: item.file,
          data: { biz: 'app' },
        };
        uploadFile(params, (res) => {
          if (res.success) {
            item.status = 'done';
            item.message = '';
            item.objectUrl = '';
            item.content = '';
            item.url = getFileAccessHttpUrl(res.message);
            item.uri = res.message;
          } else {
            showToast(res.message);
            item.status = 'failed';
            item.message = '上传失败';
          }
        });
      });
    } else {
      file.status = 'uploading';
      file.message = '上传中...';
      let params = {};
      params = {
        file: file.file,
        data: { biz: 'app' },
      };
      uploadFile(params, (res) => {
        if (res.success) {
          file.status = 'done';
          file.message = '';
          file.objectUrl = '';
          file.content = '';
          file.url = getFileAccessHttpUrl(res.message);
          file.uri = res.message;
          // 路由跳转
          //   router.push({ path: '/app/library/hdAI/camera/detail' });
          router.push({ path: '/app/library/hdAI/camera/detail', query: { yhPicture: res.message } });
        } else {
          showToast(res.message);
          file.status = 'failed';
          file.message = '上传失败';
        }
        // console.log(fileList.value,'fileList00000-----')
      });
    }
  };
  const beforeRead = (file) => {
    if (file instanceof Array && file.length) {
      // let arr:any=[]
      file.forEach(async (item) => {
        if (item.type !== 'image/jpeg' && item.type !== 'image/png' && item.type !== 'image/jpg') {
          showToast('请选择正确图片格式上传');
          return false;
        }
        // const res = await watermark(item)
        // console.log(res, 'item===')
        // arr.push(res)
        // if(index === file.length-1){
        //   console.log(arr, '00009999===')
        //   return arr
        // }
      });
      return file;
    } else {
      if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/jpg') {
        showToast('请选择正确图片格式上传');
        return false;
      }
      return file;
      // return watermark(file)
    }
  };
</script>

<style scoped lang="less">
  .hdAI-camera {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 12px 16px;
  }
  .ai-camera {
    width: 343px;
    height: 172px;
    background: #f7f8fa;
    border-radius: 4px 4px 4px 4px;
    border: 1px dashed #3e87f8;
    margin-bottom: 28px;
  }
  .title {
    margin: 16px;
    font-family: Source Han Sans CN, Source Han Sans CN;
    font-weight: 500;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
  }
  :deep(.van-uploader__upload-icon) {
    color: var(--van-uploader-icon-color);
    font-size: 40px;
  }
  :deep(.van-uploader__upload-text) {
    margin-top: var(--van-padding-xs);
    color: var(--van-uploader-text-color);
    font-size: 14px;
  }
</style>
