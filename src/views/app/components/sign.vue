<template>
  <div :class="sign ? 'sign-container' : 'sign-container sign-button'">
    <div style="line-height: 30px">{{ label }}</div>
    <div>
      <Image style="width: 100%" v-if="sign" :src="sign" @click="openImg(sign)" />
      <div class="btn-wrap" v-if="!disabled" style="text-align: center">
        <van-button type="default" v-if="sign && resetSign" @click="onModal">重新签名</van-button>
        <van-button type="primary" style="padding: 18px" v-if="!sign" @click="onModal">签名</van-button>
      </div>
      <div v-if="!disabled && trigger" style="text-align: center">
        <van-button type="primary" v-if="sign" style="margin-top: 15px" @click="onSubmit">提交</van-button>
      </div>
    </div>
  </div>
  <basic-modal :zIndex="9999" v-bind="$attrs" @register="registerModal" :width="900" title="签字" :footer="null" destroyOnClose>
    <van-signature
      style="width: 100%; height: 100%"
      background-color="rgb(255,255,255)"
      clear-button-text="重新签字"
      @clear="onClear"
      @submit="onSigning"
    />
  </basic-modal>
</template>
<script lang="ts" name="sign" setup>
  import { BasicModal, useModal } from '/@/components/Modal';
  import { useUserStore } from '/@/store/modules/user';
  import { Image } from 'vant';
  import { ref, watch, computed } from 'vue';
  import { createImgPreview } from '/@/components/Preview/index';
  import { uploadFile } from '/@/api/common/api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  // 用户信息
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const props = defineProps({
    value: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    // 是否当作提交使用
    trigger: {
      type: Boolean,
      default: false,
    },
    resetSign: {
      type: Boolean,
      default: true,
    },
  });
  const emit = defineEmits(['update:value', 'click-sign', 'submit']);
  const sign = ref('');
  const [registerModal, { openModal, closeModal }] = useModal();
  watch(
    () => props.value,
    (val) => {
      if (!val || val == '') {
        if (/^http/i.test(userInfo.value.signature)) sign.value = userInfo.value.signature;
        emit('update:value', sign.value);
      } else {
        if (/^http/i.test(val)) sign.value = val;
        else sign.value = getFileAccessHttpUrl(val);
      }
    },
    {
      immediate: true,
    }
  );
  const onModal = () => {
    if (!props.trigger) openModal(true);
    else
      emit('click-sign', (is) => {
        if (is) openModal(true);
      });
  };
  const onSigning = (data) => {
    if (data.image) {
      uploadFile({ file: base64ImgtoFile(data.image), data: { biz: 'app' } }, (res) => {
        if (res.success) {
          emit('update:value', res.message);
          if (!props.trigger) {
            closeModal();
            emit('submit', res.message);
          } else {
            emit('submit', res.message);
          }
        }
      });
    } else {
      if (!props.trigger) {
        return createMessage.info('签名为必填项！');
      }
    }
  };
  const onSubmit = () => {
    console.log('onSubmit', sign.value);
    emit('submit', sign.value);
  };
  const onClear = () => {
    sign.value = '';
    emit('update:value', '');
  };
  const base64ImgtoFile = (dataurl, filename = 'file') => {
    let arr = dataurl.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let suffix = mime.split('/')[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], `${filename}.${suffix}`, {
      type: mime,
    });
  };
  const openImg = (url) => {
    createImgPreview({
      imageList: [url],
      defaultWidth: 400,
      rememberState: true,
      scaleStep: 10,
    });
  };
</script>
<style lang="less" scoped>
  /deep/.van-button {
    height: 32px;
  }
  .sign-container {
    display: flex;
    // justify-content: right;
    // margin-left: calc(100% - 180px);
  }
  .sign-button {
    // margin-left: calc(100% - 140px);
    display: flex;
    flex-direction: column;
    .btn-wrap {
      width: 100%;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
  }
</style>
