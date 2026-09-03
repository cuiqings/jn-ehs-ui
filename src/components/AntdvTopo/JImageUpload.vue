<template>
  <div class="clearfix">
    <a-upload
      :listType="listType"
      accept="image/*"
      :multiple="multiple"
      :show-upload-list="false"
      :action="uploadUrl"
      :headers="headers"
      :data="{ biz: bizPath }"
      v-model:fileList="uploadFileList"
      :beforeUpload="beforeUpload"
      :disabled="disabled"
      :max-count="fileMax"
      @change="handleChange"
      @preview="handlePreview"
    >
      <div v-if="uploadFileList.length > 0" :style="{'width':'104px','height':'104px'}">
        <img :src="fmtUrl" style="width:100%;height:100%"/>
      </div>
      <div v-else>
        <LoadingOutlined v-if="loading" />
        <UploadOutlined v-else />
        <div class="ant-upload-text">{{ text }}</div>
      </div>
    </a-upload>
    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel()">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType, ref, reactive, watchEffect, computed, unref, watch, onMounted } from 'vue';
  import { LoadingOutlined, UploadOutlined } from '@ant-design/icons-vue';
  import { useRuleFormItem } from '/@/hooks/component/useFormItem';
  import { propTypes } from '/@/utils/propTypes';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getFileAccessHttpUrl, getRandom, dateFormat } from '/@/utils/common/compUtils';
  import { uploadUrl } from '/@/api/common/api';
  import { getToken, getLoginBackInfo } from '/@/utils/auth';

  const { createMessage, createErrorModal } = useMessage();
  export default defineComponent({
    name: 'JImageUpload',
    components: { LoadingOutlined, UploadOutlined },
    inheritAttrs: false,
    props: {
      //绑定值
      value: propTypes.oneOfType([propTypes.string, propTypes.array]),
      //按钮文本
      listType: {
        type: String,
        required: false,
        default: 'picture-card',
      },
      //按钮文本
      text: {
        type: String,
        required: false,
        default: '上传',
      },
      //这个属性用于控制文件上传的业务路径
      bizPath: {
        type: String,
        required: false,
        default: 'temp',
      },
      //是否禁用
      disabled: {
        type: Boolean,
        required: false,
        default: false,
      },
      //上传数量
      fileMax: {
        type: Number,
        required: false,
        default: 1,
      },
      // 是否添加水印
      isWatermark: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    emits: ['options-change', 'change', 'update:value'],
    setup(props, { emit, refs }) {
      const emitData = ref<any[]>([]);
      const attrs = useAttrs();
      const [state] = useRuleFormItem(props, 'value', 'change', emitData);
      //获取文件名
      const getFileName = (path) => {
        if (path.lastIndexOf('\\') >= 0) {
          let reg = new RegExp('\\\\', 'g');
          path = path.replace(reg, '/');
        }
        return path.substring(path.lastIndexOf('/') + 1);
      };
      //token
      const headers = ref<object>({
        'X-Access-Token': getToken(),
      });
      //上传状态
      const loading = ref<boolean>(false);
      //是否是初始化加载
      const initTag = ref<boolean>(true);
      //文件列表
      let uploadFileList = ref<any[]>([]);
      //预览图
      const previewImage = ref<string | undefined>('');
      //预览框状态
      const previewVisible = ref<boolean>(false);

      //计算是否开启多图上传
      const multiple = computed(() => {
        return props['fileMax'] > 1;
      });

      //计算是否可以继续上传
      const uploadVisible = computed(() => {
        return uploadFileList.value.length < props['fileMax'];
      });

      const fmtUrl = computed(() => {
        const url = uploadFileList.value[0]?.response?.message
        return getFileAccessHttpUrl(url)
      });
      
      // 获取工号
      const userInfo = <any>getLoginBackInfo();
      /**
       * 监听value变化
       */
      watch(
        () => props.value,
        (val, prevCount) => {
          //update-begin---author:liusq ---date:20230601  for：【issues/556】JImageUpload组件value赋初始值没显示图片------------
          if (val && val instanceof Array) {
            val = val.join(',');
          }
          if (initTag.value == true) {
            initFileList(val);
          }
        },
        { immediate: true }
        //update-end---author:liusq ---date:20230601  for：【issues/556】JImageUpload组件value赋初始值没显示图片------------
      );
      /**
       * 初始化文件列表
       */
      function initFileList(paths) {
        if (!paths || paths.length == 0) {
          uploadFileList.value = [];
          return;
        }
        let files = [];
        let arr = paths.split(',');
        arr.forEach((value) => {
          let url = getFileAccessHttpUrl(value);
          files.push({
            uid: getRandom(10),
            name: getFileName(value),
            status: 'done',
            url: url,
            response: {
              status: 'history',
              message: value,
            },
          });
        });
        uploadFileList.value = files;
      }

      /**
       * 上传前校验
       */
      function beforeUpload(file) {
        let fileType = file.type;
        if (fileType.indexOf('image') < 0) {
          createMessage.info('请上传图片');
          return false;
        }
        if (props.isWatermark) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file); // file转base64
            reader.onload = (e: any) => {
              const canvas = document.createElement('canvas');
              const img = new Image();
              img.src = e.target.result;
              img.onload = () => {
                const ctx: any = canvas.getContext('2d');
                let data = '';
                const imgWidth = img.width;
                const imgHeight = img.height;
                canvas.width = imgWidth; // 画布宽度
                canvas.height = imgHeight; // 画布高度
                ctx.drawImage(img, 0, 0, imgWidth, imgHeight); // 绘制图片大小和先前图片一致
                const fontSize = Math.min(imgWidth, imgHeight) / 10; // 根据图片大小确定文字大小
                const watermarkText = `${dateFormat(new Date(), 'yyyy-MM-dd')} ${userInfo.userInfo.workNo} 上传`;
                for (let i = 0; i < 12; i++) {
                  ctx.save();
                  ctx.translate(i - 10, i + 10);
                  ctx.rotate((45 * Math.PI) / 180);
                  ctx.fillStyle = 'rgb(0,0,0,0.1)'; // 水印颜色，透明度
                  ctx.textBaseline = 'middle'; // 水印对其的基准线
                  ctx.font = `${fontSize}px Verdana`; // 文字大小
                  ctx.fillText(
                    watermarkText,
                    imgWidth / 2 - i * (imgWidth / 12),
                    imgHeight / 2 - i * (imgHeight / 6)
                  ); // 添加的文字
                  ctx.restore();
                }
                data = canvas.toDataURL(file.type); // 输出压缩后的base64
                // base64转file
                const arr: any = data.split(',');
                const mime = arr[0].match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                  u8arr[n] = bstr.charCodeAt(n);
                }
                const files: any = new File([new Blob([u8arr], { type: mime })], file.name, { type: file.type });
                files.uid = file.uid;
                resolve(files);
              };
            };
          });
        }
      }
      /**
       * 文件上传结果回调
       */
      function handleChange({ file, fileList, event }) {
        initTag.value = false;
        uploadFileList.value = fileList;
        if (file.status === 'error') {
          createMessage.error(`${file.name} 上传失败.`);
        }
        let fileUrls = [];
        //上传完成
        if (file.status != 'uploading') {
          fileList.forEach((file) => {
            if (file.status === 'done') {
              //update-begin---author:wangshuai ---date:20221121  for：[issues/248]原生表单内使用图片组件,关闭弹窗图片组件值不会被清空------------
              // initTag.value = true;
              //update-end---author:wangshuai ---date:20221121  for：[issues/248]原生表单内使用图片组件,关闭弹窗图片组件值不会被清空------------
              fileUrls.push(file.response.message);
            }
          });
          if (file.status === 'removed') {
            handleDelete(file);
          }
        }
        // emitData.value = fileUrls.join(',');
        state.value = fileUrls.join(',');
        emit('update:value', fileUrls.join(','));
      }

      /**
       * 删除图片
       */
      function handleDelete(file) {
        //如有需要新增 删除逻辑
        console.log(file);
      }

      /**
       * 预览图片
       */
      function handlePreview(file) {
        previewImage.value = file.url || file.thumbUrl;
        previewVisible.value = true;
      }

      function getAvatarView() {
        if (uploadFileList.length > 0) {
          let url = uploadFileList[0].url;
          return getFileAccessHttpUrl(url, null);
        }
      }

      function handleCancel() {
        previewVisible.value = false;
      }
      return {
        state,
        attrs,
        previewImage,
        previewVisible,
        uploadFileList,
        multiple,
        headers,
        loading,
        uploadUrl,
        beforeUpload,
        uploadVisible,
        handlePreview,
        handleCancel,
        handleChange,
        fmtUrl
      };
    },
  });
</script>
<style scoped>
  .ant-upload-select-picture-card i {
    font-size: 32px;
    color: #999;
  }

  .ant-upload-select-picture-card .ant-upload-text {
    margin-top: 8px;
    color: #666;
  }
</style>
