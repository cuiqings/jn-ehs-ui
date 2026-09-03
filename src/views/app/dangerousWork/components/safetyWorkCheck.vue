<template>
  <van-dialog
    :style="{ top: dTop + '%' }"
    ref="dialogRef"
    v-model:show="show"
    title="安全作业检查"
    show-cancel-button
    @cancel="cancel"
    :before-close="dialogConfirm"
  >
    <van-form v-model="dialogFormData" ref="dialogForm" label-width="80" style="max-height: 70vh; overflow-y: auto">
      <van-field
        class="description-field"
        required
        :maxlength="200"
        v-model="dialogFormData.desc"
        name="desc"
        label="检查描述"
        label-align="top"
        type="textarea"
        rows="4"
        :autosize="{ minHeight: 100, maxHeight: 200 }"
        show-word-limit
        placeholder="请输入"
        :rules="[{ required: true, message: '请输入' }]"
      />
      <van-field required name="result" label="检查结果" :rules="[{ required: true, message: '请选择' }]">
        <template #input>
          <van-radio-group v-model="dialogFormData.result" direction="horizontal">
            <van-radio icon-size="16px" name="1">合格</van-radio>
            <van-radio icon-size="16px" name="2">不合格</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-field
        v-if="dialogFormData.result == '2'"
        required
        v-model="dialogFormData.yhlbLabel"
        is-link
        readonly
        name="yhlbLabel"
        label="隐患类别"
        placeholder="请选择"
        @click="showyhType = true"
        :rules="[{ required: true, message: '请选择隐患类别' }]"
      />
      <van-field v-if="!isUnhazardous" required name="imgList" label="检查照片" label-align="top" :rules="[{ validator: fileValidator }]">
        <template #input>
          <CheckImgUpload ref="checkImgUploadRef" :businessId="curItem.id" v-model:value="dialogFormData.imgMap" />
        </template>
      </van-field>
      <van-field v-else required name="imgUrl" label="检查照片" :rules="[{ validator: fileValidator, message: '图片上传中请稍后！' }]">
        <template #input>
          <RealCameraUpload
            :key="curItem.id"
            ref="realCameraUploadRef"
            :businessId="curItem.id"
            :id="curItem.id"
            :maxCount="10"
            v-model:value="dialogFormData.imgUrl"
            albumText="离线相册"
            biz="dangerousWork"
          />
        </template>
      </van-field>
      <van-field name="sceneHead" label="责任人" disabled v-if="dialogFormData.result == '2'">
        <template #input>
          {{ curItem.sceneHeadName }}
        </template>
      </van-field>
    </van-form>
  </van-dialog>
  <van-popup v-model:show="showyhType" position="bottom">
    <van-picker :columns="sk_yh_type" @confirm="yhTypeConfirm" @cancel="showyhType = false" />
  </van-popup>
  <!-- 开始时间 -->
  <DateTimePicker
    :values="dialogFormData.analysisTime"
    @change-value="showPickeranalysisTime = false"
    :showPicker="showPickeranalysisTime"
    @confirm="onConfirm($event, 'analysisTime')"
  />
</template>
<script lang="ts" setup>
  import DateTimePicker from '/@/views/app/components/appDateTimePicker.vue';
  import { securityConfirmation } from '../../../hazardousOperation/api/index';
  import { FormInstance, showFailToast } from 'vant';
  import { useRoute } from 'vue-router';
  import { ref, reactive, computed, watch, nextTick } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import { uploadFile } from '/@/api/common/api';
  import CheckImgUpload from './checkImgUpload.vue';
  import RealCameraUpload from '/@/components/App/RealCameraUpload.vue';
  import { buildImgList, createCheckImgMap, IMG_TYPE_NEW, IMG_TYPE_OLD, toUrlList } from '/@/views/hazardousOperation/constants/checkImg';
  import type { CheckImgMap } from '/@/views/hazardousOperation/constants/checkImg';

  const route = useRoute();
  // 非高危作业只传默认检查照片（imgUrl），不分5类
  const isUnhazardous = computed(() => route.name === 'AppUnhazardousWorkManage');
  const checkImgUploadRef = ref<any>(null);
  const realCameraUploadRef = ref<any>(null);
  const userStore: any = useUserStore();
  const dialogForm = ref<FormInstance>();
  const showyhType = ref(false);
  const sk_yh_type = userStore.getAllDictItems.sk_yh_type;
  const showPickeranalysisTime = ref(false);
  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    curItem: {
      type: Object,
      default: () => ({}),
    },
  });
  console.log(userStore.getUserInfo);
  const emits = defineEmits(['submit', 'update:show']);
  const show = computed(() => {
    if (props.show) {
      Object.assign(dialogFormData, {
        imgMap: createCheckImgMap(),
        imgUrl: '',
        desc: '',
        result: '',
        yhlb: '',
        yhlbLabel: '',
      });
    }
    return props.show;
  });
  interface WorkAnalysisItems {
    imgMap: CheckImgMap;
    imgUrl: string | string[] | undefined;
    desc: string;
    result: string;
    yhlb: string;
    yhlbLabel: string;
    analysisTime: string | undefined;
  }

  const dialogFormData = reactive<WorkAnalysisItems>({
    imgMap: createCheckImgMap(),
    imgUrl: undefined,
    desc: '',
    result: '',
    yhlb: '',
    yhlbLabel: '',
    analysisTime: undefined,
  });

  const cancel = () => {
    emits('update:show', false);
    dialogFormData.imgMap = createCheckImgMap();
    dialogFormData.imgUrl = '';
    dialogFormData.desc = '';
    dialogFormData.result = '';
    dialogFormData.yhlb = '';
    dialogFormData.yhlbLabel = '';
  };

  const dTop = ref(45);
  const dialogRef = ref(null);

  const fileValidator = () => {
    if (!isUnhazardous.value) return checkImgUploadRef.value?.validate();
    return imgUrlValidator();
  };

  /** 非高危：默认检查照片必填，base64（拍照失败缓存）提交前补传 */
  const imgUrlValidator = () => {
    const imgUrl = dialogFormData.imgUrl;
    if (typeof imgUrl === 'string') {
      return imgUrl.trim().length > 0 ? true : '请上传！';
    }
    if (!imgUrl || imgUrl.length === 0) return '请上传！';

    const promiseAll: any[] = [];
    (imgUrl as string[]).forEach((str, i) => {
      if (!str || !str.startsWith('data:image')) return;
      const p = new Promise<void>(async (resolve, reject) => {
        const params = {
          file: await base64ToFile_Simple(str, `photo${i}.jpg`),
          data: { biz: 'dangerousWork' },
        };
        uploadFile(
          params,
          (res) => {
            if (res.success) {
              (dialogFormData.imgUrl as string[])[i] = res.message;
              resolve();
            } else {
              showFailToast('网络环境不佳请稍后重试！');
              reject();
            }
          },
          () => reject()
        );
      });
      promiseAll.push(p);
    });
    return Promise.all(promiseAll)
      .then(() => true)
      .catch(() => false);
  };

  const base64ToFile_Simple = async (base64Str: string, fileName: string): Promise<File> => {
    const res = await fetch(base64Str);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
  };

  const cloneCheckImgMap = (sourceMap: CheckImgMap) => {
    const result = createCheckImgMap();
    Object.keys(sourceMap).forEach((key) => {
      result[key] = toUrlList(sourceMap[key]);
    });
    return result;
  };

  const mergeCheckImgMap = (before: CheckImgMap, after: CheckImgMap) => {
    const result = createCheckImgMap();
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    keys.forEach((key) => {
      result[key] = Array.from(new Set([...toUrlList(before[key]), ...toUrlList(after[key])]));
    });
    return result;
  };

  const removeSubmittedPhotoCache = async (originalImgMap: CheckImgMap, originalImgUrl: string[]) => {
    if (isUnhazardous.value) {
      const submittedSources = Array.from(new Set([...originalImgUrl, ...toUrlList(dialogFormData.imgUrl)]));
      await realCameraUploadRef.value?.removeCachedPhotos(submittedSources);
      return;
    }
    await checkImgUploadRef.value?.removeCachedPhotos(mergeCheckImgMap(originalImgMap, dialogFormData.imgMap));
  };

  const dialogConfirm = async (action?: string) => {
    if (action === 'cancel') {
      return true;
    }
    if (!dialogForm.value) return false;

    const originalImgMap = cloneCheckImgMap(dialogFormData.imgMap);
    const originalImgUrl = toUrlList(dialogFormData.imgUrl);
    try {
      await dialogForm.value.validate();
      const { imgMap, imgUrl, ...rest } = dialogFormData;
      const imgData = isUnhazardous.value
        ? { imgUrl: Array.isArray(imgUrl) ? imgUrl.join(',') : imgUrl, imgType: IMG_TYPE_OLD }
        : { imgList: buildImgList(imgMap), imgType: IMG_TYPE_NEW };
      await securityConfirmation({
        ...rest,
        ...imgData,
        id: props.curItem.id,
      });
      await removeSubmittedPhotoCache(originalImgMap, originalImgUrl);
      emits('submit');
      emits('update:show', false);
      return true;
    } catch (err) {
      return false;
    }
  };

  const getDefaultDialogFormData = (): WorkAnalysisItems => ({
    imgUrl: undefined,
    desc: '',
    result: '',
    yhlb: '',
    yhlbLabel: '',
    analysisTime: undefined,
  });

  const resetForm = async () => {
    Object.assign(dialogFormData, getDefaultDialogFormData());
    showyhType.value = false;
    showPickeranalysisTime.value = false;
    await nextTick();
    dialogForm.value?.resetValidation();
  };

  watch(
    () => props.show,
    (visible) => {
      if (!visible) {
        resetForm();
      }
    },
    { flush: 'post' }
  );

  defineExpose({ resetForm });

  // 日期选择
  const onConfirm = (e) => {
    dialogFormData.analysisTime = e;
    showPickeranalysisTime.value = false;
  };
  const yhTypeConfirm = (e) => {
    console.log(e);
    dialogFormData.yhlb = e.selectedOptions[0].value;
    dialogFormData.yhlbLabel = e.selectedOptions[0].label;
    showyhType.value = false;
  };
</script>
<style lang="less" scoped>
  .description-field {
    :deep(textarea.van-field__control) {
      min-height: 100px !important;
      max-height: 200px;
    }
  }

  // :deep(.van-field__body) {
  //   background-color: #f5f5f5 !important;
  // }
  // :deep(.van-cell){
  //   padding: 10px 10px !important
  // }
  .divinput {
    :deep(.van-cell) {
      padding: 10px 0 !important;
    }
  }
</style>
