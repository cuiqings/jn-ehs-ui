<!-- 随手拍确认隐患处理 -->

<template>
  <van-form ref="formRef" label-width="75px">
    <van-field
      required
      v-model="formData.yhLevelLabel"
      is-link
      readonly
      name="yhLevelLabel"
      label="隐患等级"
      placeholder="请选择隐患等级"
      @click="show.showYhLevel = true"
      :rules="[{ required: true, message: '请选择隐患等级' }]"
    />
    <van-popup v-model:show="show.showYhLevel" position="bottom">
      <van-picker :columns="yh_hidden_levelList" @confirm="onConfirm($event, 'showYhLevel', 'yhLevel')" @cancel="show.showYhLevel = false" />
    </van-popup>

    <van-field :maxlength="30" v-model="formData.checkHierarchy" name="checkHierarchy" label="检查层级" placeholder="检查层级" />

    <van-field
      required
      v-model="formData.yhTypeLabel"
      is-link
      readonly
      name="yhTypeLabel"
      label="隐患类型"
      placeholder="请选择隐患类型"
      @click="show.showYhType = true"
      :rules="[{ required: true, message: '请选择隐患类型' }]"
    />
    <van-popup v-model:show="show.showYhType" position="bottom">
      <van-picker :columns="yh_hidden_typeList" @confirm="onConfirm($event, 'showYhType', 'yhType')" @cancel="show.showYhType = false" />
    </van-popup>

    <van-field
      required
      v-model="formData.handleMeansLabel"
      is-link
      readonly
      name="handleMeans"
      label="防控手段"
      placeholder="请选择防控手段"
      @click="show.showHandleMeans = true"
      :rules="[{ required: true, message: '请选择防控手段' }]"
    />
    <van-popup v-model:show="show.showHandleMeans" position="bottom">
      <van-picker
        :columns="yh_control_meansList"
        @confirm="onConfirm($event, 'showHandleMeans', 'handleMeans')"
        @cancel="show.showHandleMeans = false"
      />
    </van-popup>

    <van-field
      required
      v-model="formData.yhPlaceName"
      is-link
      readonly
      name="yhPlaceName"
      label="隐患地点"
      placeholder="请选择隐患地点"
      @click="show.showDepart = true"
      :rules="[{ required: true, message: '请选择隐患地点' }]"
    />
    <van-popup v-model:show="show.showDepart" position="bottom">
      <van-picker
        :columns-field-names="customFieldName"
        :columns="placeList"
        @confirm="onConfirm($event, 'showDepart', 'yhPlaceName')"
        @cancel="show.showDepart = false"
      />
    </van-popup>

    <van-field
      v-model="formData.riskPointName"
      is-link
      type="textarea"
      autosize
      readonly
      name="riskPoint"
      label="关联风险"
      placeholder="请选择"
      @click="show.showRiskPoint = true"
    />
    <!-- <van-popup :duration="0" v-model:show="show.showRiskPoint" position="bottom">
      <div style="display: flex; justify-content: space-between; height: 44px; line-height: 44px">
        <van-button style="border: none; color: #969799" @click="show.showRiskPoint = false" size="normal">取消</van-button>
        <van-button style="border: none; color: #6398fb" @click="checkedChange" size="normal">确认</van-button>
      </div>
      <div class="main">
        <van-checkbox-group v-model="selectList">
          <van-cell v-for="(item, index) in riskList" :key="index">
            <template #right-icon>
              <van-checkbox :name="item.id" />
            </template>
            <template #title>
              <div class="check-title" style="word-break: break-all">
                {{ item.riskLocation }}>{{ filterDictTextByCache('risk_type', item.riskType) }}> {{ item.riskFactor }}>{{ item.riskDescription }}
              </div>
            </template>
          </van-cell>
        </van-checkbox-group>
      </div>
    </van-popup> -->

    <div class="riskmask" :class="{ showrisk: show.showRiskPoint }">
      <div class="riskwrap">
        <div style="display: flex; justify-content: space-between; height: 44px; line-height: 44px">
          <van-button style="border: none; color: #969799" @click="show.showRiskPoint = false" size="normal">取消</van-button>
          <van-button style="border: none; color: #6398fb" @click="checkedChange" size="normal">确认</van-button>
        </div>
        <div class="main">
          <van-checkbox-group v-model="selectList">
            <div class="li" v-for="(item, index) in riskList" :key="index">
              <div class="check-title" style="word-break: break-all">
                {{ item.names }}
                <!-- {{ item.riskLocation }}>{{ filterDictTextByCache('risk_type', item.riskType) }}> {{ item.riskFactor }}>{{ item.riskDescription }} -->
              </div>
              <van-checkbox :name="item.id" />
            </div>
          </van-checkbox-group>
        </div>
      </div>
    </div>

    <van-field required name="radio" label="整改情况" :rules="[{ required: true, message: '请选择整改情况' }]">
      <template #input>
        <van-radio-group @change="repairResultChange" v-model="formData.repairResult" direction="horizontal">
          <van-radio name="1">整改完成</van-radio>
          <van-radio name="2">整改未完成</van-radio>
        </van-radio-group>
      </template>
    </van-field>

    <template v-if="['1', '2'].includes(formData.repairResult)">
      <van-field
        :maxlength="200"
        v-model="formData.tempMeasure"
        name="tempMeasure"
        label="临时措施"
        placeholder="请输入"
        @click="show.showTempMeasure = true"
      />

      <van-field
        required
        v-model="formData.repairDate"
        is-link
        readonly
        label-width="100"
        name="repairDate"
        label="限定整改日期"
        placeholder="点击选择日期"
        @click="showCalendarFn"
        :rules="[{ required: true, message: '请选择' }]"
      />
      <van-calendar :min-date="minDate" v-model:show="show.showCalendar" @confirm="onConfirm($event, 'showCalendar', 'repairDate')" />

      <van-field
        required
        v-model="formData.dutyDeptName"
        is-link
        readonly
        name="dutyDeptName"
        label="责任部门"
        placeholder="请选择"
        @click="show.showDutyDept = true"
        :rules="[{ required: true, message: '请选择责任部门' }]"
      />
      <van-popup v-model:show="show.showDutyDept" position="bottom">
        <van-picker
          :columns="deptTree"
          :columns-field-names="customFieldName"
          @confirm="onConfirm($event, 'showDutyDept', 'dutyDeptName')"
          @cancel="show.showDutyDept = false"
        />
      </van-popup>

      <van-field
        required
        v-model="formData.dutyPeopleName"
        is-link
        readonly
        name="dutyPeopleName"
        label="责任人"
        placeholder="点击选择责任人"
        @click="show.showDutyPeople = true"
        :rules="[{ required: true, message: '请选择责任人' }]"
      />
      <van-popup v-model:show="show.showDutyPeople" position="bottom">
        <van-picker
          :columns-field-names="customFieldNameUser"
          :columns="userList"
          @confirm="onConfirm($event, 'showDutyPeople', 'dutyPeopleName')"
          @cancel="show.showDutyPeople = false"
        />
      </van-popup>
    </template>

    <template v-if="formData.repairResult == '1'">
      <van-field
        v-model="formData.recheckResult"
        name="recheckResult"
        :maxlength="200"
        autosize
        type="textarea"
        label="复查结果"
        placeholder="请填写复查结果"
      />
      <van-field name="handleExplain" label=" ">
        <template #input>
          <AppUpload :maxCount="10" v-model:fileList="formData.recheckPicture" />
        </template>
      </van-field>
    </template>
  </van-form>
  <CurLoading v-if="loading" />
</template>

<script setup lang="ts">
  import { getDepartTreeBy23, getUserInfo, getRisk } from '../../index.api';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import AppUpload from '../../../../../components/App/AppUpload.vue';
  import { useUserStore } from '/@/store/modules/user';
  import { RcFormData } from '../../hd.type';
  import { FormInstance, showFailToast } from 'vant';
  import { reactive, ref, nextTick } from 'vue';
  import dayjs from 'dayjs';
  import CurLoading from '../../components/loading.vue';
  import { dateFormat } from '/@/utils/common/compUtils';

  const props = withDefaults(
    defineProps<{
      formData: any;
    }>(),
    {
      formData: () => {},
    }
  );

  const selectList = ref<any[]>([]);

  const formRef = ref<FormInstance>();
  const show = reactive({
    showCalendar: false, // 日期选择器
    showDepart: false, // 隐患地点
    showDutyPeople: false, // 责任人
    showDutyDept: false, // 责任部门
    showYhType: false, // 隐患类型
    showYhLevel: false, // 隐患等级
    showHandleMeans: false, // 防控手段
    showRiskPoint: false, // 风险点
    showTempMeasure: false, // 临时措施
  });

  const userStore: any = useUserStore();
  const loading = ref(false);

  // 字典
  const deptTree = ref<any[]>([]);
  const riskList = ref<any[]>([]);
  const userList = ref<any[]>([]);
  const placeList = ref<any[]>([]);
  const yh_hidden_typeList = userStore.getAllDictItems.yh_hidden_type;
  const yh_hidden_levelList = userStore.getAllDictItems.yh_hidden_level;
  const yh_control_meansList = userStore.getAllDictItems.yh_control_means;

  const formData = reactive<RcFormData>({
    yhLevel: '1', // 隐患等级
    yhLevelLabel: '一般',
    checkHierarchy: '', // 检查层级
    yhType: '', // 隐患类型
    yhTypeLabel: '',
    handleMeans: '', // 防控手段
    handleMeansLabel: '',
    yhPlace: '', // 隐患地点编号
    yhPlaceName: '', // 隐患地点名称
    riskPoint: '', // 风险点
    riskPointName: '',
    repairResult: '', // 整改情况
    tempMeasure: '', // 临时措施
    repairDate: '', // 限定整改日期
    dutyDeptName: '', // 责任部门
    dutyDept: '', // 责任部门
    dutyPeopleName: '', // 责任人
    dutyPeople: '', // 责任人
    recheckResult: '', // 复检结果
    recheckPicture: '', // 复检图片
  });

  const customFieldName = {
    text: 'title',
    value: 'orgCode',
    children: 'children',
  };

  const customFieldNameUser = {
    text: 'realname',
    value: 'id',
  };

  const minDate = ref(new Date(new Date().getFullYear() - 1, 1, 1));
  const repairDateDisabled = ref(false);
  const repairResultChange = (e) => {
    if (e === null) return;
    formData.dutyPeopleName = '';
    formData.dutyPeople = '';
    if (e == 1) {
      minDate.value = new Date(new Date().getFullYear() - 1, 1, 1);
      if (props.formData.repairDate) {
        repairDateDisabled.value = true;
        formData.repairDate = props.formData.repairDate;
      } else {
        formData.repairDate = ref(dateFormat(new Date(), 'yyyy-MM-dd'));
      }
    } else {
      minDate.value = new Date();
      formData.repairDate = props.formData.repairDate;
      // formData.dutyDept = '';
      // formData.dutyDeptName = '';
    }
    // deptTree.value.map((val) => {
    //     if (userStore.userInfo.orgCode.includes(val.orgCode)) {
    //       formData.dutyDept = val.orgCode;
    //       formData.dutyDeptName = val.title;
    //       if (val.children.length > 0) {
    //         val.children.map((child) => {
    //           formData.dutyDept = child.orgCode;
    //           formData.dutyDeptName =  `${val.title}->${child.title}`;
    //         });
    //       }
    //     }
    //   });
    getUserInfo(formData.dutyDept).then((res) => {
      userList.value = res;
    });
    console.log('formdata-----', formData);
  };

  const showCalendarFn = () => {
    if (repairDateDisabled.value) return;
    show.showCalendar = true;
  };

  // 下拉框确认
  const onConfirm = (value, showType, key) => {
    let len = 0;
    switch (key) {
      case 'repairDate':
        formData.repairDate = dayjs(value).format('YYYY-MM-DD');
        break;
      case 'dutyDeptName':
        len = value.selectedOptions.length - 1;
        if (value.selectedOptions[len].value == 'all') {
          formData.dutyDept = value.selectedOptions[0].orgCode;
          formData.dutyDeptName = value.selectedOptions[0].title;
        } else {
          formData.dutyDept = value.selectedOptions[len].orgCode;
          if (len > 0) {
            formData.dutyDeptName = value.selectedOptions[len - 1].title + '>' + value.selectedOptions[len].title;
          } else {
            formData.dutyDeptName = value.selectedOptions[len].title;
          }
        }
        getUserInfo(formData.dutyDept).then((res) => {
          userList.value = res;
        });
        break;
      case 'yhPlaceName':
        len = value.selectedOptions.length - 1;
        if (value.selectedOptions[len].value == 'all') {
          formData.yhPlace = value.selectedOptions[0].orgCode;
          formData.yhPlaceName = value.selectedOptions[0].title;
        } else {
          formData.yhPlace = value.selectedOptions[len].orgCode;
          if (len > 0) {
            formData.yhPlaceName = value.selectedOptions[len - 1].title + '>' + value.selectedOptions[len].title;
          } else {
            formData.yhPlaceName = value.selectedOptions[len].title;
          }
        }
        formData.dutyDept = formData.yhPlace;
        formData.dutyDeptName = formData.yhPlaceName;
        getUserInfo(formData.dutyDept).then((res) => {
          userList.value = res;
        });
        break;
      case 'dutyPeopleName':
        formData.dutyPeople = value.selectedOptions[0].id;
        formData.dutyPeopleName = value.selectedOptions[0].realname;
        break;
      default:
        formData[key] = value.selectedValues[0];
        formData[key + 'Label'] = value.selectedOptions[0].text;
    }

    show[showType] = false;
  };

  const checkedChange = () => {
    if (riskList.value.filter((item) => selectList.value.includes(item.id)).length <= 5) {
      let codes = '';
      let names = '';
      riskList.value.map((val) => {
        if (selectList.value.includes(val.id)) {
          codes += val.id + ',';
          names += val.names + '、';
        }
      });
      codes = codes.substring(0, codes.length - 1);
      names = names.substring(0, names.length - 1);
      formData.riskPoint = codes;
      formData.riskPointName = names;
      show.showRiskPoint = false;
    } else {
      showFailToast('风险最多可关联5个！');
    }
  };

  // form值校验
  const submitForm = () => {
    return new Promise((resolve, reject) => {
      formRef.value
        ?.validate()
        .then(() => {
          if (formData.repairResult == '1' && !formData.recheckResult && !formData.recheckPicture) {
            showFailToast('复查结果或复查图片至少一个不为空！');
            reject(false);
          } else {
            resolve(formData);
          }
        })
        .catch(() => {
          reject(false);
        });
    });
  };

  pageInit();
  function pageInit() {
    loading.value = true;
    Promise.all([getDepartTreeBy23(), getRisk({ pageSize: 2000 })]).then((res) => {
      loading.value = false;
      filterNull(res[0]);
      deptTree.value = res[0];
      placeList.value = JSON.parse(JSON.stringify(res[0]));
      placeList.value.forEach((item, idx) => {
        if (item.children && item.children.length > 0) {
          item.children.unshift({ title: '全部', value: 'all' });
          deptTree.value[idx].children.unshift({ title: '全部', value: 'all' });
        }
      });
      riskList.value = res[1].records;
      riskList.value.map((val) => {
        val.names = `${val.orgName}>${filterDictTextByCache('risk_type', val.riskType)}${val.jobActivity ? '>' + val.jobActivity : ''}>${
          val.checkItem ? val.checkItem + '>' + val.riskDescription : val.riskDescription
        }`;
      });
      nextTick(() => {
        reviewData();
      });
    });
  }

  function reviewData() {
    if (props.formData.confirm) {
      let data = props.formData.confirm;
      formData.dutyDept = formData.yhPlace = data.yhPlaceDepart ? data.yhPlaceDepart : data.yhPlaceOrg;
      formData.dutyDeptName = formData.yhPlaceName = data.yhPlaceDepartName
        ? data.yhPlaceOrgName + '>' + data.yhPlaceDepartName
        : data.yhPlaceOrgName;
      formData.repairResult = data.repairResult;
      formData.tempMeasure = data.tempMeasure;
      formData.repairDate = data.repairDate;
      formData.recheckResult = data.recheckResult;
      formData.recheckPicture = data.recheckPicture;
      if (data.checkHierarchy) formData.checkHierarchy = data.checkHierarchy;
      if (data.yhType) {
        yh_hidden_typeList.map((val) => {
          if (val.value == data.yhType) {
            formData.yhTypeLabel = val.label;
            formData.yhType = val.value;
          }
        });
      }
      yh_hidden_levelList.map((val) => {
        if (val.value == data.yhLevel) {
          formData.yhLevelLabel = val.label;
          formData.yhLevel = val.value;
        }
      });
      if (data.handleMeans) {
        yh_control_meansList.map((val) => {
          if (val.value == data.handleMeans) {
            formData.handleMeansLabel = val.label;
            formData.handleMeans = val.value;
          }
        });
      }
      // if (data.riskPoint) {
      //   riskList.value.map((val) => {
      //     console.log(val);
      //     if (val.riskId == data.riskPoint) {
      //       formData.riskPointName = `${val.riskType}>${val.workArea}>${val.workName}>${val.checkStep}>${val.riskEvent}`;
      //       formData.riskPoint = val.riskId;
      //     }
      //   });
      // }
      try {
        if (data.riskPoint) {
          riskList.value.map((value) => {
            if (value.riskId == data.riskPoint) {
              let str = `${value.orgName}>${filterDictTextByCache('risk_type', value.riskType)}${value.jobActivity ? '>' + value.jobActivity : ''}>${
                value.checkItem ? value.checkItem + '>' + value.riskDescription : value.riskDescription
              }`;
              formData.riskPointName = str;
            }
          });
        }
      } catch {}

      // if (data.dutyDept) {
      //   deptTree.value.map((val) => {
      //     console.log(val);

      //     if (val.orgCode.indexOf(data.dutyDept) > -1) {
      //       val.children.map((item) => {
      //         if (item.orgCode == data.dutyDept) {
      //           formData.dutyDept = val.orgCode;
      //           formData.dutyDeptName = val.title;
      //         }
      //       });
      //     }
      //   });
      // }
      Object.assign(formData, props.formData.confirm);
      formData.dutyDept = formData.yhPlace;
      formData.dutyDeptName = formData.yhPlaceName;
      if (!props.formData.yhLevel && !props.formData.confirm.yhLevel) {
        formData.yhLevel = '1';
        formData.yhLevelLabel = '一般';
      }
    }
  }

  // 过滤空子集
  function filterNull(data) {
    if (data.length == 0) return [];
    data.map((val) => {
      if (val.children && val.children.length == 0) {
        delete val.children;
      } else if (val.children) {
        // val.children.unshift({title: '全部', value: 'all'})
        filterNull(val.children);
      }
    });
  }

  defineExpose({
    submitForm,
  });
</script>

<style lang="less" scoped>
  .main {
    height: 100%;
    overflow-y: auto;
    padding-bottom: 44px;
  }
  .riskmask {
    background-color: rgba(0, 0, 0, 0.6);
    position: fixed;
    bottom: -100%;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
  }
  .riskwrap {
    width: 100%;
    height: 60%;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 999;
    background-color: #ffffff;
    .li {
      display: flex;
      line-height: 22px;
      padding: 10px;
      color: #333;
      border-bottom: #eee 1px solid;
      .check-title {
        flex: 1;
        padding-right: 8px;
      }
    }
  }
  .showrisk {
    bottom: 0;
  }
</style>
