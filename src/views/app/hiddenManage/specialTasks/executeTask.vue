<template>
  <div class="execute-task">
    <van-tabs v-model:active="active" @change="tabChange">
      <van-tab
        v-for="(item, idx) in detailInfo.itemList"
        :key="'tab' + idx"
        :title-class="[{ on_pass: item.checkResult == 1 }, { off_pass: item.checkResult == 2 }]"
        :title="idx + 1 + ''"
        :name="idx"
      >
        <div class="tab-inner">
          <div
            class="projectinfo"
            v-if="formData.checkType == '3' || formData.checkType == '4' || formData.checkType == '5' || formData.checkType == '6'"
          >
            <div><label>检查内容及标准：</label>{{ item.contentStandard }}</div>
          </div>
          <div class="projectinfo" v-if="formData.checkType == '7'">
            <div><label>违法行为描述：</label>{{ item.illegalDesc }}</div>
            <div><label>判定情形：</label>{{ item.illegalBasis }}</div>
          </div>
          <div class="projectinfo" v-if="formData.checkType == '8'">
            <div><label>辨识单元：</label>{{ item.recogUnit }}</div>
            <div><label>风险部位：</label>{{ item.riskName }}</div>
            <div><label>风险失控表现：</label>{{ item.riskFactor }}</div>
          </div>
        </div>
      </van-tab>
    </van-tabs>
    <van-form ref="formRef" class="myform" label-width="80px">
      <van-field required name="checkResult" label="检查结果" :rules="[{ required: true, message: '请选择检查方式' }]">
        <template #input>
          <van-radio-group :disabled="formData.saveFlag == 1" v-model="formData.checkResult" direction="horizontal">
            <van-radio name="1">合格</van-radio>
            <van-radio name="2">不合格</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-field v-if="formData.checkResult == '1'" v-model="formData.checkPicture" name="checkPicture" label="检查照片">
        <template #input>
          <!-- <RealCameraUpload :maxCount="10" :disabled="formData.saveFlag == 1" v-model:value="formData.checkPicture" /> -->
          <AppUpload :key="formData.id" :disabled="formData.saveFlag == 1" :watermarkText="watermarkText" v-model:fileList="formData.checkPicture" />
        </template>
      </van-field>
      <div v-if="formData.checkResult == '2' && formData.saveFlag != 1">
        <div class="yh-item" v-for="(item1, idx1) in formData.yhList" :key="idx1">
          <van-icon v-if="idx1 != 0" class="delete-icon" name="delete-o" size="20" @click="deleteYh(idx1)" />
          <van-field
            required
            v-model="item1.yhDescription"
            name="yhDescription"
            label="隐患描述"
            type="textarea"
            :rules="[{ required: true, message: '请输入隐患描述' }]"
          />
          <van-field v-model="item1.checkPicture" required name="checkPicture" label="检查照片">
            <template #input>
              <!-- <RealCameraUpload :maxCount="10" :disabled="formData.saveFlag == 1" v-model:value="item1.checkPicture" /> -->
              <AppUpload :key="item1.id" :disabled="formData.saveFlag == 1" :watermarkText="watermarkText" v-model:fileList="item1.checkPicture" />
            </template>
          </van-field>
          <van-field
            required
            v-model="item1.yhLevelLabel"
            is-link
            readonly
            name="yhLevelLabel"
            label="隐患等级"
            placeholder="请选择隐患等级"
            @click="showYhLevel = true"
            :rules="[{ required: true, message: '请选择隐患等级' }]"
          />
          <van-popup v-model:show="showYhLevel" position="bottom">
            <van-picker :columns="yh_hidden_levelList" @cancel="showYhLevel = false" @confirm="onConfirm($event, idx1)" />
          </van-popup>
          <van-field
            required
            v-model="item1.yhTypeLabel"
            is-link
            readonly
            name="yhTypeLabel"
            label="隐患类别"
            placeholder="请选择"
            @click="showYhType = true"
            :rules="[{ required: true, message: '请选择' }]"
          />
          <van-popup v-model:show="showYhType" position="bottom">
            <van-picker :columns="sk_yh_type" @cancel="showYhType = false" @confirm="onConfirm1($event, idx1)" />
          </van-popup>

          <van-field
            required
            v-model="item1.yhTypeSubLabel"
            is-link
            readonly
            name="yhTypeSubLabel"
            label="隐患子类别"
            placeholder="请选择"
            @click="showYhTypeSub = true"
            :rules="[{ required: true, message: '请选择' }]"
          />
          <van-popup v-model:show="showYhTypeSub" position="bottom">
            <van-picker :columns="sk_yh_type_sub" @cancel="showYhTypeSub = false" @confirm="onConfirm2($event, idx1)" />
          </van-popup>
          <van-field
            required
            v-model="item1.dutyDepartName"
            is-link
            readonly
            name="dutyDepartName"
            label="责任部门"
            placeholder="请选择"
            @click="showDutyDept = true"
            style="margin-bottom: 10px; border-bottom: 1px solid #f1f1f1"
            :rules="[{ required: true, message: '请选择责任部门' }]"
          />
          <van-popup v-model:show="showDutyDept" position="bottom">
            <van-picker
              :columns="deptTree"
              :columns-field-names="customFieldName"
              @cancel="showDutyDept = false"
              @confirm="onConfirm3($event, idx1)"
            />
          </van-popup>
        </div>
        <van-button plain type="primary" @click="addYh" style="margin: 10px auto; display: block">+ 新增隐患</van-button>
      </div>
      <div v-if="formData.checkResult == '2' && formData.saveFlag == 1">
        <div v-for="(item1, idx1) in formData.yhList" :key="idx1">
          <div>
            <van-cell title="隐患描述" :value="item1.yhDescription" />
            <van-field v-model:value="item1.checkPicture" name="checkPicture" label="检查照片">
              <template #input>
                <!-- <RealCameraUpload :maxCount="10" :disabled="formData.saveFlag == 1" v-model:value="item1.checkPicture" /> -->
                <AppUpload :disabled="formData.saveFlag == 1" :watermarkText="watermarkText" :fileList="item1.checkPicture" />
              </template>
            </van-field>
            <van-cell title="隐患等级" value="一般" />
            <van-cell title="隐患类别" :value="item1.yhType_dictText" />
            <van-cell title="隐患子类别" :value="item1.yhTypeSub_dictText" />
            <van-cell title="责任部门" :value="item1.dutyDepartName" />
          </div>
        </div>
      </div>
    </van-form>
    <div class="foot" v-if="detailInfo.status != 1">
      <van-button :disabled="formData.saveFlag == 1" :loading="saveLoading" @click="saveFn" type="primary">保存</van-button>
      <van-button v-if="detailInfo.itemList && active == detailInfo.itemList.length - 1" :loading="submiting" @click="submitFn" type="primary"
        >提交</van-button
      >
      <!-- <van-button :loading="allSubmiting" @click="allSubmitFn" type="primary">全部合格</van-button> -->
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { specialSetRange, saveItemForSpecial, submitTaskForSpecial, getAllUserByOrg, getDepart3List } from '../index.api';
  import { showSuccessToast, showConfirmDialog, FormInstance, showToast } from 'vant';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  // import RealCameraUpload from '/@/components/App/RealCameraUpload.vue';
  import AppUpload from '../../../../components/App/AppUpload.vue';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import { getDictItemsByCode } from '/@/utils/dict';
  import { useRouter, useRoute } from 'vue-router';
  import { reactive, ref, watch, nextTick } from 'vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';

  const route = useRoute();
  const router = useRouter();
  const userStore: any = useUserStore();
  const formRef = ref<FormInstance>();
  const active = ref(0);
  const formData = reactive<{
    id?: string;
    itemList?: any[];
    checkResult: string;
    checkType?: string;
    checkRemark?: string;
    checkPicture?: string;
    repairPicture?: string;
    repairExplain?: string;
    ignoreExplain?: string;
    saveFlag?: number | string;
    yhDescription?: string;
    departDutyPerson?: string;
    workshopManagerName?: string;
    workshopManager?: string;
    yhList: any[];
  }>({
    departDutyPerson: '',
    checkResult: '1',
    yhList: [
      {
        yhDescription: '',
        checkPicture: '',
        yhLevelLabel: '',
        yhTypeLabel: '',
        yhTypeSubLabel: '',
        dutyDepartName: '',
      },
    ],
  });
  const showYhLevel = ref(false);
  const showYhType = ref(false);
  const showYhTypeSub = ref(false);
  const showDutyDept = ref(false);
  const yh_hidden_levelList = [{ text: '一般', value: 1 }];
  const sk_yh_type = userStore.getAllDictItems.sk_yh_type;
  const sk_yh_type_sub = ref<any[]>([]);
  const userList = ref<any[]>([]);
  const customFieldName = {
    text: 'departName',
    value: 'orgCode',
  };
  const deptTree = ref<any[]>([]);
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
    });
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
  const getDetail = (first?) => {
    specialSetRange({
      id: route.query.id,
      org: route.query.orgCode,
    }).then((res) => {
      console.log('getDetail', res);
      Object.assign(detailInfo, res);
      Object.assign(formData, res.itemList[active.value]);
      console.log('formData', formData);
      if (formData.saveFlag == 1 && formData.yhList && formData.yhList.length > 0) {
        formData.yhList = res.itemList[active.value].yhList;
      } else {
        formData.yhList = [
          {
            yhDescription: '',
            checkPicture: '',
            yhLevelLabel: '',
            yhTypeLabel: '',
            yhTypeSubLabel: '',
            dutyDepartName: '',
          },
        ];
      }
      console.log('formData.yhList', formData.yhList);
      getUser();
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

  function getDeptTree() {
    let orgCode = detailInfo.org;
    getDepart3List({ orgCode }).then((res) => {
      deptTree.value = res;
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
    // 获取部门树
    getDeptTree();
  }

  const beforeChange = async () => {
    Object.assign(detailInfo.itemList[active.value], formData);
    // 当前项保存之后才能切换
    if (formData.saveFlag != 1) {
      showToast({ message: '请先保存当前项', duration: 1000 });
      return false;
    }
    return true;
  };
  // getUser();
  const tabChange = (idx) => {
    Object.assign(formData, detailInfo.itemList[idx]);
    if (formData.saveFlag != 1) {
      formData.yhList = [
        {
          yhDescription: '',
          checkPicture: '',
          yhLevelLabel: '',
          yhTypeLabel: '',
          yhTypeSubLabel: '',
          dutyDepartName: '',
        },
      ];
    }
    console.log(formData, detailInfo.itemList);
  };

  /**
   * 保存当前检查项
   * 保存成功后，如果不是最后一项则自动跳转到下一项
   * 如果是最后一项则停留在当前项
   */
  async function saveFn() {
    await formRef.value?.validate();
    if (formData.checkResult == '2') {
      const hasEmptyPicture = formData.yhList?.some((item) => !item.checkPicture);
      if (hasEmptyPicture) {
        showToast({ message: '请上传检查照片', duration: 1000 });
        return;
      }
    }
    saveLoading.value = true;
    console.log('formData', formData);
    await saveItemForSpecial({ ...formData, id: detailInfo.itemList[active.value].id })
      .then(async () => {
        // showSuccessToast({ message: '保存成功！', duration: 300 });
        saveLoading.value = false;
        // 获取最新数据并更新当前项视图
        await getDetail(false);
        
        // 保存成功后，如果不是最后一项则自动跳转到下一项
        const currentIndex = active.value;
        const isLastItem = currentIndex === detailInfo.itemList.length - 1;
        
        if (!isLastItem) {
          // 不是最后一项，跳转到下一项
          active.value = currentIndex + 1;
          tabChange(active.value);
        }
        // 如果是最后一项，停留在当前项
        
        console.log('保存成功，已更新当前项数据:', formData, detailInfo.itemList);
      })
      .catch(() => {
        saveLoading.value = false;
      });
  }

  const submitFn = () => {
    // 所有检查项都保存之后才能点提交
    let flag = true;
    detailInfo.itemList.forEach((item) => {
      if (item.saveFlag != 1) {
        flag = false;
      }
    });
    if (!flag) {
      showToast({ message: '请先保存所有检查项', duration: 1000 });
      return;
    }
    showConfirmDialog({
      title: '提交',
      message: '是否确认提交！',
    }).then(() => {
      submiting.value = true;
      submitTaskForSpecial({ id: detailInfo.id }).then(() => {
        setTimeout(() => {
          submiting.value = false;
          router.replace({ path: '/app/hiddenManage/specialTasks/detail', query: { id: route.query.id, orgCode: route.query.orgCode } });
        }, 300);
      });
    });
  };
  /**
   * 确认选择隐患等级
   */
  const onConfirm = (value, idx) => {
    console.log(value, idx);
    if (formData.yhList && formData.yhList[idx]) {
      formData.yhList[idx].yhLevel = value.selectedValues[0];
      formData.yhList[idx].yhLevelLabel = value.selectedOptions[0].text;
    }
    showYhLevel.value = false;
  };
  /**
   * 确认选择隐患类别
   */
  const onConfirm1 = (value, idx) => {
    console.log(value, idx);
    if (formData.yhList && formData.yhList[idx]) {
      formData.yhList[idx].yhType = value.selectedValues[0];
      formData.yhList[idx].yhTypeLabel = value.selectedOptions[0].text;
      sk_yh_type_sub.value = userStore.getAllDictItems[formData.yhList[idx].yhType];
      formData.yhList[idx].yhTypeSub = '';
      formData.yhList[idx].yhTypeSubLabel = '';
    }
    showYhType.value = false;
  };
  /**
   * 确认选择隐患子类别
   */
  const onConfirm2 = (value, idx) => {
    console.log(value, idx);
    if (formData.yhList && formData.yhList[idx]) {
      formData.yhList[idx].yhTypeSub = value.selectedValues[0];
      formData.yhList[idx].yhTypeSubLabel = value.selectedOptions[0].text;
    }
    showYhTypeSub.value = false;
  };
  /**
   * 确认选择责任部门
   */
  const onConfirm3 = (value, idx) => {
    console.log(value, idx);
    if (formData.yhList && formData.yhList[idx]) {
      formData.yhList[idx].dutyDepart = value.selectedOptions[0].orgCode;
      formData.yhList[idx].dutyDepartName = value.selectedOptions[0].departName;
    }
    showDutyDept.value = false;
  };
  /**
   * 新增隐患项
   */
  const addYh = () => {
    if (formData.yhList) {
      formData.yhList.push({
        yhDescription: '',
        checkPicture: '',
        yhLevelLabel: '',
        yhTypeLabel: '',
        yhTypeSubLabel: '',
        dutyDepartName: '',
      });
    }
  };
  /**
   * 删除隐患项
   */
  const deleteYh = (idx) => {
    if (formData.yhList && formData.yhList.length > idx) {
      formData.yhList.splice(idx, 1);
    }
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
  :deep(.off_pass) {
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
  :deep(.on_pass) {
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
  .delete-icon {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 100;
  }
  .yh-item {
    position: relative;
  }
</style>
