<template>
  <div class="execute-task">
    <van-tabs v-model:active="active" @change="tabChange">
      <van-tab
        v-for="(item, idx) in detailInfo.itemList"
        :key="'tab' + idx"
        :title-class="{ already_pass: item.saveFlag == 1 }"
        :title="idx + 1 + ''"
        :name="idx"
      >
        <div class="tab-inner">
          <div class="projectinfo">
            <div><label>检查项分类：</label>{{ item.itemTypeName }}</div>
            <div><label>检查项：</label>{{ item.itemName }}</div>
            <div><label>检查内容/方法：</label>{{ item.checkContent }}</div>
            <div><label>检查标准：</label>{{ item.checkStandard }}</div>
            <div><label>检查照片：</label>{{ { 0: '非必填', 1: '必填' }[item.pictureFlag] }}</div>
          </div>
        </div>
      </van-tab>
    </van-tabs>
    <van-form ref="formRef" class="myform" label-width="75px">
      <van-field required name="checkWay" label="检查方式" :rules="[{ required: true, message: '请选择检查方式' }]">
        <template #input>
          <van-radio-group :disabled="formData.saveFlag == 1" v-model="formData.checkWay" direction="horizontal">
            <van-radio name="1">现场检查</van-radio>
            <van-radio name="2">文件查阅</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-field required name="checkResult" label="检查结果" :rules="[{ required: true, message: '请选择检查方式' }]">
        <template #input>
          <van-radio-group :disabled="formData.saveFlag == 1" v-model="formData.checkResult" direction="horizontal">
            <van-radio name="1">合格</van-radio>
            <van-radio name="2">不合格</van-radio>
            <van-radio name="3">忽略</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <div v-if="formData.checkResult == '1'">
        <van-field :required="picflag" name="checkPicture" label="检查照片" :rules="[{ required: picflag, message: '请上传检查照片' }]">
          <template #input>
            <AppUpload :key="formData.id"
            :disabled="formData.saveFlag == 1"
              capture="camera"
              :accept="'.jpeg,.png,.jpg,.gif,.bmp'"
              :watermarkText="watermarkText"
              v-model:fileList="formData.checkPicture"
            />
          </template>
        </van-field>
      </div>
      <div v-if="formData.checkResult == '2'">
        <van-field
        :disabled="formData.saveFlag == 1"
          required
          v-model="formData.problemDescription"
          name="problemDescription"
          autosize
          maxlength="200"
          type="textarea"
          label="问题描述"
          placeholder="请填写问题描述"
          :rules="[{ required: true, message: '请填写问题描述' }]"
        />
        <van-field :required="picflag" name="checkPicture" label="检查照片" :rules="[{ required: picflag, message: '请上传检查照片' }]">
          <template #input>
            <AppUpload
              :disabled="formData.saveFlag == 1"
              capture="camera"
              :accept="'.jpeg,.png,.jpg,.gif,.bmp'"
              :watermarkText="watermarkText"
              v-model:fileList="formData.checkPicture"
            />
          </template>
        </van-field>
        <van-field name="repairPicture" label="整改照片">
          <template #input>
            <AppUpload :disabled="formData.saveFlag == 1" :watermarkText="watermarkText" v-model:fileList="formData.repairPicture" />
          </template>
        </van-field>
        <van-field
        :disabled="formData.saveFlag == 1"
          v-model="formData.repairExplain"
          name="repairExplain"
          maxlength="200"
          autosize
          type="textarea"
          label="整改说明"
          placeholder="请填写整改说明"
        />
      </div>
      <div v-if="formData.checkResult == '3'">
        <van-field
          :disabled="formData.saveFlag == 1"
          required
          v-model="formData.ignoreExplain"
          name="ignoreExplain"
          autosize
          maxlength="200"
          type="textarea"
          label=" 忽略说明"
          placeholder="请填写忽略说明"
          :rules="[{ required: true, message: '请填写忽略说明' }]"
        />
      </div>
    </van-form>
    <div class="foot" v-if="detailInfo.status != 1">
      <van-button :disabled="formData.saveFlag == 1" :loading="saveLoading" @click="saveFn" type="primary">保存</van-button>
      <van-button :disabled="subDisable" :loading="submiting" @click="submitFn" type="primary">提交</van-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { jnYhPlanExecuteDetailZX, saveItem, jnYhPlanExecuteSubmit } from '../index.api';
  import { showSuccessToast, showConfirmDialog, FormInstance } from 'vant';
  import AppUpload from '../../../../components/App/AppUploadCamera.vue';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import { getDictItemsByCode } from '/@/utils/dict';
  import { useRouter, useRoute } from 'vue-router';
  import { reactive, ref, watch } from 'vue';

  const route = useRoute();
  const router = useRouter();
  const userStore: any = useUserStore();
  const formRef = ref<FormInstance>();
  const active = ref(0);
  const formData = reactive<{
    itemList?: any[];
    checkWay: string;
    checkResult?: string;
    checkRemark?: string;
    checkPicture?: string;
    repairPicture?: string;
    repairExplain?: string;
    ignoreExplain?: string;
    saveFlag?: number | string;
    problemDescription?: string;
  }>({
    checkWay: '1',
  });

  const watermarkText = ref(
    `${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} 上传`
  );

  const subDisable = ref(true);
  const saveLoading = ref(false);
  const submiting = ref(false);
  const picflag = ref(false);

  const detailInfo = reactive<any>({});

  watch(active, () => {
    if (detailInfo.itemList[active.value].pictureFlag == 1) {
      picflag.value = true;
    } else {
      picflag.value = false;
    }
  });

  const getDetail = (first?) => {
    jnYhPlanExecuteDetailZX({
      id: route.query.id,
    }).then((res) => {
      Object.assign(detailInfo, res);
      if (!res.itemList[active.value].checkWay) res.itemList[active.value].checkWay = '1';
      Object.assign(formData, res.itemList[active.value]);
      picflag.value = res.itemList[active.value].pictureFlag == 1;
      if (first) {
        pageInit();
      } else {
        let flag = false;
        detailInfo.itemList.map((item) => {
          if (item.saveFlag == 0) {
            flag = true;
          }
        });
        subDisable.value = flag;
      }
    });
  };
  getDetail(true);

  function pageInit() {
    Promise.all([
      getDictItemsByCode('check_sort'), // 检查项分类
    ]).then((res) => {
      let flag = false; // 初始化提交按钮状态
      if (res[0].length && res[0].length > 0) {
        res[0].map((val) => {
          if (detailInfo.itemList.length && detailInfo.itemList.length > 0) {
            detailInfo.itemList.map((item) => {
              if (item.itemType == val.value) {
                item['itemTypeName'] = val.text; // 初始化字典值
              }
              if (item.saveFlag == 0) {
                flag = true;
              }
            });
          }
        });
        for (var i = detailInfo.itemList.length - 1; i >= 0; i--) {
          active.value = i;
          tabChange(active.value);
          if (detailInfo.itemList[i].saveFlag == 1) {
            break;
          }
        }
      }
      subDisable.value = flag;
    });
  }

  const tabChange = (idx) => {
    formRef.value?.resetValidation();
    if (!detailInfo.itemList[idx].checkWay) detailInfo.itemList[idx].checkWay = '1';
    Object.assign(formData, detailInfo.itemList[idx]);
    console.log(formData);
  };

  async function saveFn() {
    await formRef.value?.validate();
    saveLoading.value = true;
    saveItem({ ...formData, id: detailInfo.itemList[active.value].id })
      .then(() => {
        // showSuccessToast({ message: '保存成功！', duration: 300 });
        saveLoading.value = false;
        getDetail();
        if (active.value < detailInfo.itemList.length - 1) {
          active.value++;
          tabChange(active.value);
        }
      })
      .catch(() => {
        saveLoading.value = false;
      });
  }

  const submitFn = () => {
    showConfirmDialog({
      title: '提交',
      message: '是否确认提交！',
    }).then(() => {
      submiting.value = true;
      jnYhPlanExecuteSubmit({ id: detailInfo.id }).then(() => {
        // showSuccessToast({ message: '提交成功！', duration: 300 });
        setTimeout(() => {
          submiting.value = false;
          router.replace({ path: '/app/hiddenDanger/dailyTasks/detail', query: { id: detailInfo.id } });
        }, 300);
      });
    });
  };
</script>

<style lang="less" scoped>
  .execute-task {
    width: 100%;
    height: 100%;
    .myform {
      padding-bottom: 70px;
    }
    .tab-inner {
      height: auto;
      overflow-y: scroll;
      background: #ffffff;
    }

    .projectinfo {
      font-size: 14px;
      padding: 10px 16px;
      background: #eff1f5;
      line-height: 32px;
      label {
        width: 80px;
        text-align: left;
      }
    }
    .foot {
      width: 100%;
      height: 55px;
      position: fixed;
      bottom: 0;
      left: 0;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      border-top: 1px solid #f5f5f5;
      .van-button {
        margin-right: 15px;
      }
    }
  }
  :deep(.already_pass) {
    span {
      display: inline-block;
      width: 20px;
      height: 20px;
      background-color: rgb(6, 180, 6);
      color: #ffffff;
      border-radius: 50%;
      text-align: center;
      line-height: 20px;
    }
  }
</style>
