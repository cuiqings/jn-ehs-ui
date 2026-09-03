<template>
  <van-popup class="check-work" position="bottom" :style="{ height: '80%' }" v-model:show="show" show-cancel-button @cancel="cancel">
    <div class="popup-body">
      <div class="tit">{{ curItem.reformType == '1' ? '去整改' : '确认整改' }}</div>
      <van-tabs :lazy-render="false" v-model:active="active">
        <van-tab v-for="(item, index) in checkInfo" :title="'第' + (index + 1) + '条'" :key="index">
          <van-form v-model="item.dialogFormData" ref="dialogForm" label-width="80">
            <template v-if="curItem.reformType == '1'">
              <van-field
                required
                :maxlength="100"
                v-model="item.dialogFormData.result"
                name="result"
                label="整改措施"
                placeholder="请输入"
                :rules="[{ required: true, message: '请输入' }]"
              />
              <van-field required name="imgUrl" label="整改后照片" :rules="[{validator: () => fileValidator(index), message: '图片上传中请稍后！'}]">
                <template #input>
                  <RealCameraUpload  ref="realCameraUploadRef" :businessId="item.id" :key="item.id" :id="item.id" :maxCount="10" v-model:value="item.dialogFormData.imgUrl" biz="dangerousWork" />
                </template>
              </van-field>
            </template>
            <template v-if="curItem.reformType != '1'">
              <van-field
                required
                :maxlength="100"
                :rules="[{ required: true, message: '请选择' }]"
                v-model="item.dialogFormData.result"
                name="result"
                label="检查结果"
              >
                <template #input>
                  <van-radio-group v-model="item.dialogFormData.result" direction="horizontal">
                    <van-radio name="1">合格</van-radio>
                    <van-radio name="2">不合格</van-radio>
                  </van-radio-group>
                </template>
              </van-field>
              <van-field
                required
                :rules="[{ required: true, message: '请输入' }]"
                v-if="item.dialogFormData.result == '2'"
                v-model="item.dialogFormData.desc"
                rows="2"
                autosize
                label="不合格描述"
                type="textarea"
                maxlength="100"
                placeholder="请输入留言"
              />
            </template>
          </van-form>
          <van-collapse v-model="activeNames">
            <van-collapse-item title="整改记录" name="1" v-if="item.reformList && item.reformList.length > 0">
              <div class="reform-list" v-for="(citem, idx) in item.reformList" :style="{ background: idx % 2 == 0 ? '#f5f5f5' : '' }">
                <p>{{ citem.head }} {{ citem.reformTime }}</p>
                <p
                  >整改措施：<span>{{ citem.result }}</span>
                </p>
                <p
                  >整改后照片：
                  <AppUpload v-model:fileList="citem.imgUrl" :disabled="true" text="" />
                </p>
                <p v-if="citem.confirmDesc">
                  不合格描述：<span style="color: #ff4d4f">{{ citem.confirmDesc }}</span>
                </p>
              </div>
            </van-collapse-item>
            <van-collapse-item title="安全作业检查" name="2">
              <div class="reform-list" style="padding: 0 15px">
                <p>{{ item.head }} {{ item.checkTime }}</p>
                <p
                  >检查结果：<span style="color: #ff4d4f">{{ item.result }}</span>
                </p>
                <p
                >隐患类别：<span>{{ item.yhlb }}</span>
                </p>
                <p
                  >检查描述：<span>{{ item.remark }}</span>
                </p>
                <p>检查照片：</p>
                <CheckImgView :record="item" />
              </div>
            </van-collapse-item>
          </van-collapse>
        </van-tab>
      </van-tabs>
    </div>
    <div class="foot">
      <van-button class="cancel-btn" @click="cancel">取消</van-button>
      <van-button type="primary" class="submit-btn" :loading="confirmLoading" @click="dialogConfirm">提交</van-button>
    </div>
  </van-popup>
</template>
<script lang="ts" setup>
  import { workCheckList, workCheck, workCheckconfirm } from '/@/views/hazardousOperation/api/index';
  import AppUpload from '../../../../components/App/AppUpload.vue';
  import RealCameraUpload from "/@/components/App/RealCameraUpload.vue";
  import CheckImgView from './checkImgView.vue';
  import { ref, reactive, computed, toRefs } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import type { FormInstance } from 'vant';
  import { showFailToast } from 'vant';
  import { uploadFile } from '/@/api/common/api';

  const realCameraUploadRef = ref<any>(null);
  const active = ref(0);
  const activeNames = ref(['1', '2']);
  const userStore = useUserStore();
  const dialogForm = ref<FormInstance>();
  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    curItem: {
      type: Object,
      default: () => ({}),
    },
    isIn: {
      type: Boolean,
      default: true, // true表示进入空间，false表示出来空间
    },
  });

  const { curItem } = toRefs(props);
  const emits = defineEmits(['submit', 'update:show']);
  const show = computed(() => {
    if (props.show) {
      init();
    }
    return props.show;
  });

  const checkInfo = ref<any>({});
  const init = async () => {
    await workCheckList({ id: curItem.value.id, type: curItem.value.reformType }).then((res) => {
      res.forEach((item, idx) => {
        item.dialogFormData = { result: '', imgUrl: '', id: item.id, desc: '' };
      });
      checkInfo.value = res;
    });
  };

  const cancel = () => {
    emits('update:show', false);
    active.value = 0; // 重置选项卡
    dialogForm.value?.forEach((el) => {
      el.resetValidation();
    });
  };

  const fileValidator = async (idx) => {
    const imgUrl = checkInfo.value[idx].dialogFormData.imgUrl;
    if (!imgUrl || imgUrl.length === 0) return '请上传！';

    const promiseAll: any[] = [];
    imgUrl.forEach((str: string, i: number) => {
      if (!str || !str.startsWith('data:image')) return; // 已是 URL，跳过
      const p = new Promise(async (resolve, reject) => {
        const params = {
          file: await base64ToFile_Simple(str, `photo${i}.jpg`),
          data: { biz: 'dangerousWork' },
        };
        uploadFile(params, (res) => {
          if (res.success) {
            checkInfo.value[idx].dialogFormData.imgUrl[i] = res.message;
            resolve(true);
          } else {
            showFailToast('网络环境不佳请稍后重试！');
            reject(false);
          }
        }, () => reject(false));
      });
      promiseAll.push(p);
    });

    return Promise.all(promiseAll).then(() => true).catch(() => false);
  };

  const confirmLoading = ref(false);
  const dialogConfirm = () => {
    let promiseAll = [];
    dialogForm.value?.forEach((item) => {
      promiseAll.push(item.validate());
    });
    return new Promise(async (resolve, reject) => {
      Promise.all(promiseAll)
        .then(async (res) => {
          confirmLoading.value = true;
          const isReform = curItem.value.reformType == '1';
          const arr: any[] = checkInfo.value.map((item: any) => {
            const { id, result, desc, imgUrl } = item.dialogFormData;
            // 整改确认只填结果和描述，不传照片
            if (!isReform) return { id, result, desc };
            return { id, result, imgUrl: Array.isArray(imgUrl) ? imgUrl.join(',') : imgUrl };
          });

          if (isReform) {
            // 去整改
            await workCheck(arr)
              .then((res) => {
                clearPhotoCache();
                resolve(true);
                cancel();
                emits('submit');
                confirmLoading.value = false;
              })
              .catch((err) => {
                showFailToast(err.message || '操作失败');
                resolve(false);
                confirmLoading.value = false;
              });
          } else {
            // 确认整改
            await workCheckconfirm(arr)
              .then((res) => {
                resolve(true);
                emits('update:show', false);
                emits('submit');
                cancel();
                confirmLoading.value = false;
              })
              .catch((err) => {
                showFailToast(err.message || '操作失败');
                resolve(false);
                confirmLoading.value = false;
              });
          }
        })
        .catch((res) => {
          showFailToast('请填写必填项');
        });
    });
  };

  const clearPhotoCache = async () => {
    const uploadRef = realCameraUploadRef.value;
    if (Array.isArray(uploadRef)) {
      await Promise.all(uploadRef.map((item) => item.clearCachedPhotos()));
      return;
    }
    await uploadRef?.clearCachedPhotos();
  };
  const base64ToFile_Simple = async (base64Str, fileName) => {
    const res = await fetch(base64Str);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
  };
</script>
<style lang="less" scoped>
  .check-work {
  }
  .divinput {
    :deep(.van-cell) {
      padding: 10px 0 !important;
    }
  }

  .popup-body {
    width: 100%;
    height: calc(100% - 60px);
    padding: 20px 0;
    overflow-y: auto;
    padding-bottom: 60px;
    position: relative;
    color: #222222;
    .tit {
      font-weight: 600;
      color: #1989fa;
      padding-left: 16px;
    }
  }
  .reform-list {
    color: #222222;
    padding: 15px;
  }
  .foot {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 50px;
    z-index: 999;
    background-color: #ffffff;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    // 上面有阴影
    box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
  }
</style>
