<template>
  <div class="execute-task">
    <van-tabs v-model:active="active" :before-change="beforeChange" @change="tabChange">
      <van-tab
        v-for="(item, idx) in detailInfo.itemList"
        :key="'tab' + idx"
        :title-class="{ already_pass: item.checkResult == 2 }"
        :title="idx + 1 + ''"
        :name="idx"
      >
        <div class="tab-inner">
          <div class="projectinfo">
            <div><label>风险ID：</label>{{ item.riskId }}</div>
            <div><label>区域位置（单元）：</label>{{ item.rgLcName }}</div>
            <div><label>风险名称：</label>{{ item.riskName }}</div>
            <div><label>排查方法：</label>{{ filterDictTextByCache('ht_check_type', item.checkMethod) }}</div>
          </div>
        </div>
      </van-tab>
    </van-tabs>
    <van-form ref="formRef" class="myform" label-width="75px">
      <van-field required name="checkResult" label="检查结果" :rules="[{ required: true, message: '请选择检查方式' }]">
        <template #input>
          <van-radio-group :disabled="formData.saveFlag == 1" v-model="formData.checkResult" direction="horizontal">
            <van-radio name="1">合格</van-radio>
            <van-radio name="2">不合格</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-field
        v-if="formData.checkResult == '2'"
        required
        v-model="formData.problemDescription"
        name="problemDescription"
        label="问题描述"
        type="textarea"
        :rules="[{ required: true, message: '请输入问题描述' }]"
      />
      <van-field :required="picflag" v-if="formData.checkResult == '1'" name="checkPicture" :rules="[{ required: picflag, message: '请上传照片' }]" label="检查照片">
        <template #input>
          <AppUpload :key="formData.id" :disabled="formData.saveFlag == 1" :watermarkText="watermarkText" v-model:fileList="formData.checkPicture" />
        </template>
      </van-field>
      <van-field :required="picflag" v-if="formData.checkResult == '2'" name="checkPicture" :rules="[{ required: picflag, message: '请上传照片' }]" label="检查照片">
        <template #input>
          <AppUpload :key="formData.id" :disabled="formData.saveFlag == 1" :watermarkText="watermarkText" v-model:fileList="formData.checkPicture" />
        </template>
      </van-field>
      <van-field
        v-if="formData.checkResult == '2'"
        name="repairPicture"
        :required="picflag"
        :rules="[{ required: picflag, message: '请上传整改后照片' }]"
        label="整改后照片"
      >
        <template #input>
          <AppUpload :key="formData.id" :disabled="formData.saveFlag == 1" :watermarkText="watermarkText" v-model:fileList="formData.repairPicture" />
        </template>
      </van-field>
      <van-field
        label-width="85"
        required
        v-if="formData.checkResult == '2' && flowType == '2'"
        v-model="formData.workshopManagerName"
        is-link
        readonly
        name="workshopManager"
        label="车间负责人"
        placeholder="请选择"
        @click="userShow = true"
        :rules="[{ required: true, message: '请选择' }]"
      />
      <TreeSelect
        :value="formData.departDutyPerson"
        :not-tree="true"
        value-key="id"
        :is-radio="true"
        title-key="realname"
        v-model:show="userShow"
        :items="userList"
        @change="onConfirm"
      />
    </van-form>
    <div class="foot" v-if="detailInfo.status != 1">
      <!-- <van-button :disabled="formData.saveFlag == 1" :loading="saveLoading" @click="saveFn" type="primary">保存</van-button> -->
      <van-button :loading="submiting" @click="submitFn" type="primary">提交</van-button>
      <van-button :loading="allSubmiting" @click="allSubmitFn" type="primary">全部合格</van-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { skYhPlanQueryById, saveItem, submitTaskApp, getAllUserByOrg, taskSubmit, getFlowType } from '../index.api';
  import { showSuccessToast, showConfirmDialog, FormInstance } from 'vant';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import AppUpload from '../../../../components/App/AppUpload.vue';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import { getDictItemsByCode } from '/@/utils/dict';
  import { useRouter, useRoute } from 'vue-router';
  import { reactive, ref, watch, nextTick } from 'vue';
  import TreeSelect from '../../components/treeSelect.vue';

  const route = useRoute();
  const router = useRouter();
  const userStore: any = useUserStore();
  const formRef = ref<FormInstance>();
  const active = ref(0);
  const formData = reactive<{
    itemList?: any[];
    checkWay: string;
    checkResult: string;
    checkRemark?: string;
    checkPicture?: string;
    repairPicture?: string;
    repairExplain?: string;
    ignoreExplain?: string;
    saveFlag?: number | string;
    problemDescription?: string;
    departDutyPerson?: string;
    workshopManagerName?: string;
    workshopManager?: string;
  }>({
    departDutyPerson: '',
    checkResult: '1',
    checkWay: '1',
  });

  const userShow = ref(false);
  const userList = ref<any[]>([]);

  const watermarkText = ref(
    `${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} 上传`
  );

  const subDisable = ref(true);
  const saveLoading = ref(false);
  const submiting = ref(false);
  const picflag = ref(false);

  const detailInfo = reactive<any>({});

  const validatorPic = (value: any) => {
    console.log(value);
    
    return new Promise((resolve, reject) => {
      if (picflag.value && value.length == 0) {
        reject(false);
      } else {
        resolve(true);
      }
    })
    
  };

  watch(active, () => {
    if (detailInfo.itemList[active.value].pictureFlag == 1) {
      picflag.value = true;
    } else {
      picflag.value = false;
    }
    nextTick(() => {
      formRef.value?.resetValidation();
    });
  });
  const flowType = ref('1'); // 判断二三级都不是安全主管部门 2
  const getDetail = (first?) => {
    skYhPlanQueryById({
      id: route.query.id,
    }).then((res) => {
      Object.assign(detailInfo, res);
      if (!res.itemList[active.value].checkWay) res.itemList[active.value].checkWay = '1';
      Object.assign(formData, res.itemList[active.value], { checkResult: null });
      getUser();
      picflag.value = res.itemList[active.value].pictureFlag == 1;
      nextTick(() => {
        formRef.value?.resetValidation();
      });
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
    getFlowType(userStore.getUserInfo.id).then((res) => {
      flowType.value = res;
    });
  };
  getDetail(true);

  function getUser() {
    getAllUserByOrg({
      orgCode: detailInfo.org,
      pageSize: 9999,
      pageNo: 1,
    }).then((res) => {
      userList.value = res;
    });
  }

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

  const beforeChange = async () => {
    if (formData.checkResult == '2') {
      await formRef.value?.validate();
    }
    Object.assign(detailInfo.itemList[active.value], formData);
    formRef.value?.resetValidation();
    return true;
  };
  // getUser();
  const tabChange = (idx) => {
    if (!detailInfo.itemList[idx].checkWay) detailInfo.itemList[idx].checkWay = '1';
    Object.assign(formData, detailInfo.itemList[idx]);
    console.log(formData, detailInfo.itemList);
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
    }).then(async () => {
      if (formData.checkResult == '2') {
        await formRef.value?.validate();
        Object.assign(detailInfo.itemList[active.value], formData);
      }
      submiting.value = true;
      detailInfo.itemList.forEach((item) => {
        if(!item.checkResult){
          item.checkResult = 1;
        }
      })
      taskSubmit(detailInfo.itemList).then((res) => {
        setTimeout(() => {
          submiting.value = false;
          router.replace({ path: '/app/hiddenDangerNew/dailyTasks/detail', query: { id: detailInfo.id } });
        }, 300);
      });
      // submitTaskApp({ id: detailInfo.id }).then(() => {
      //   // showSuccessToast({ message: '提交成功！', duration: 300 });
      //   setTimeout(() => {
      //     submiting.value = false;
      //     router.replace({ path: '/app/hiddenDangerNew/dailyTasks/detail', query: { id: detailInfo.id } });
      //   }, 300);
      // });
    });
  };
  const allSubmiting = ref(false);
  const allSubmitFn = () => {
    showConfirmDialog({
      title: '全部合格',
      message: '是否确认全部合格？',
    }).then(() => {
      allSubmiting.value = true;
      detailInfo.itemList.forEach((item) => {
        item.checkResult = 1;
      })
      taskSubmit(detailInfo.itemList).then((res) => {
        setTimeout(() => {
          submiting.value = false;
          router.replace({ path: '/app/hiddenDangerNew/dailyTasks/detail', query: { id: detailInfo.id } });
        }, 300);
      });
      // submitTaskApp({ id: detailInfo.id })
      //   .then(() => {
      //     setTimeout(() => {
      //       allSubmiting.value = false;
      //       router.replace({ path: '/app/hiddenDangerNew/dailyTasks/detail', query: { id: detailInfo.id } });
      //     }, 300);
      //   })
      //   .catch(() => (allSubmiting.value = false));
    });
  };

  const onConfirm = (val) => {
    console.log(val);
    formData.workshopManager = val.id;
    formData.workshopManagerName = val.realname;
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
      background-color: rgb(242, 97, 75);
      color: #ffffff;
      border-radius: 50%;
      text-align: center;
      line-height: 20px;
    }
  }
</style>
