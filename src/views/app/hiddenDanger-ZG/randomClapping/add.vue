<!-- 随手拍新增 -->
<template>
  <div class="hd-add">
    <van-form @submit="onSubmit" label-width="76px">
      <van-field
        required
        v-model="formData.yhDescription"
        name="yhDescription"
        autosize
        type="textarea"
        label=" 隐患描述"
        :maxlength="300"
        placeholder="请输入"
        :rules="[{ required: true, message: '请填写隐患描述' }]"
      />

      <van-field name="yhPicture" label="隐患照片">
        <template #input>
          <AppUpload :watermarkText="watermarkText" v-model:fileList="formData.yhPicture" />
        </template>
      </van-field>

      <van-field
        required
        v-model="formData.orgName"
        is-link
        readonly
        name="depart"
        label="所属单位"
        placeholder="请选择"
        :disabled="['2', '3'].includes(flowType)"
        @click="orgClick"
        :rules="[{ required: true, message: '请选择' }]"
      />

      <van-field
        v-model="formData.departName"
        is-link
        readonly
        :required="['2', '3'].includes(flowType)"
        name="depart"
        label="所属车间"
        placeholder="请选择"
        @click="showDepart = true"
        :rules="[{ required: ['2', '3'].includes(flowType), message: '请选择' }]"
      >
        <template #right-icon>
          <van-icon style="padding-right: 10px; opacity: 0.4" v-show="formData.departName" @click.stop="clearDepart" name="cross" />
        </template>
      </van-field>

      <van-field
        v-model="formData.teamName"
        v-if="['2'].includes(flowType)"
        required
        is-link
        readonly
        name="depart"
        label="所属班组"
        placeholder="请选择"
        @click="teamClick"
        :rules="[{ required: true, message: '请选择' }]"
      >
        <template #right-icon>
          <van-icon @click.stop="clearDepart" v-show="formData.teamName" name="clear" />
        </template>
      </van-field>

      <van-field
        required
        v-model="formData.yhLevelLabel"
        is-link
        readonly
        name="yhLevelLabel"
        label="隐患等级"
        placeholder="请选择隐患等级"
        @click="showYhLevel = true"
        :rules="[{ required: true, message: '请选择隐患等级' }]"
      />

      <van-popup v-model:show="showYhLevel" position="bottom">
        <van-picker :columns="yh_hidden_levelList" @confirm="onConfirm($event, 'showYhLevel', 'yhLevel')" @cancel="showYhLevel = false" />
      </van-popup>

      <van-field v-model="formData.checkTime" is-link readonly name="checkTime" label="检查日期" placeholder="点击选择" @click="showCalendar1 = true">
        <template #input>
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center">
            <span v-if="formData.checkTime">{{ formData.checkTime }}</span>
            <span v-else style="color: #c8c9cc">请选择</span>
            <van-icon style="padding-right: 10px; opacity: 0.4" v-if="formData.checkTime" @click.stop="formData.checkTime = ''" name="cross" />
          </div>
        </template>
      </van-field>

      <van-calendar :min-date="minDate1" :max-date="minDate" v-model:show="showCalendar1" @confirm="endDtConfirm($event, 'checkTime')" />

      <van-field readonly v-model="formData.checkPersonName" name="checkPersonName" label="检查人" placeholder="检查人" />

      <van-field
        v-if="flowType != '2'"
        required
        v-model="formData.yhTypeLabel"
        is-link
        readonly
        name="yhTypeLabel"
        label="隐患分类"
        placeholder="请选择"
        @click="showyhType = true"
        :rules="[{ required: true, message: '请选择' }]"
      />
      <van-popup v-model:show="showyhType" position="bottom">
        <van-picker :columns="sk_yh_type" @confirm="onConfirm($event, 'showyhType', 'yhType')" @cancel="showyhType = false" />
      </van-popup>

      <van-field
        v-if="flowType != '2'"
        required
        v-model="formData.yhTypeSubLabel"
        is-link
        readonly
        name="yhTypeSubLabel"
        label="子类"
        placeholder="请选择"
        @click="showyhTypeSub = true"
        :rules="[{ required: true, message: '请选择' }]"
      />
      <van-popup v-model:show="showyhTypeSub" position="bottom">
        <van-picker :columns="sk_yh_type_1" @confirm="onConfirm($event, 'showyhTypeSub', 'yhTypeSub')" @cancel="showyhTypeSub = false" />
      </van-popup>

      <van-field v-model="formData.riskName" is-link readonly name="riskName" label="风险ID" placeholder="请选择" @click="showriskId = true" />
      <!-- required
      :rules="[{ required: true, message: '请选择' }]" -->
      <van-popup v-model:show="showriskId" position="bottom">
        <van-picker :columns="riskList" @confirm="onConfirm($event, 'showriskId', 'riskId')" @cancel="showriskId = false" />
      </van-popup>

      <van-field v-model="formData.remark" name="remark" autosize type="textarea" label="备注" :maxlength="100" placeholder="请输入" />

      <van-field required name="radio" label="整改要求" :rules="[{ required: true, message: '请选择整改情况' }]">
        <template #input>
          <van-radio-group v-model="formData.repairRequire" direction="horizontal">
            <van-radio name="1">现场整改</van-radio>
            <van-radio name="2">限期整改</van-radio>
            <!-- <van-radio name="2" v-if="formData.yhLevel != 2 && flowType != '3'">限期整改</van-radio> -->
          </van-radio-group>
          <a href="#">{{ repairNotice }}</a>
        </template>
      </van-field>

      <van-field
        required
        v-if="flowType == '2' && formData.yhLevel == 1"
        v-model="formData.repairPersonName"
        is-link
        readonly
        name="depart"
        label="整改人"
        placeholder="请选择"
        @click="
          getUser();
          userShow = true;
        "
        :rules="[{ required: true, message: '请选择' }]"
      />

      <!-- <van-popup v-model:show="userShow" position="bottom">
        <van-picker
          :columns-field-names="{ text: 'realname', value: 'id' }"
          :columns="userList"
          @confirm="onConfirm($event, 'userShow', 'repairPerson')"
          @cancel="userShow = false"
        />
      </van-popup> -->
      <TreeSelect
        :value="formData.teamDutyPerson"
        :isRadio="true"
        :not-tree="true"
        value-key="id"
        title-key="realname"
        v-model:show="userShow"
        :items="userList"
        @change="onConfirm($event, 'userShow', 'repairPerson')"
      />

      <van-field
        v-model="formData.repairTimeLimit"
        required
        is-link
        readonly
        label-width="100"
        name="repairTimeLimit"
        label=" 整改期限"
        placeholder="点击选择"
        @click="showCalendar2 = true"
        :rules="[{ required: true, message: '请选择整改期限' }]"
      >
        <template #input>
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center">
            <span v-if="formData.repairTimeLimit">{{ formData.repairTimeLimit }}</span>
            <span v-else style="color: #c8c9cc">请选择</span>
            <van-icon
              style="padding-right: 10px; opacity: 0.4"
              v-if="formData.repairTimeLimit"
              @click.stop="formData.repairTimeLimit = ''"
              name="cross"
            />
          </div>
        </template>
      </van-field>
      <van-calendar :min-date="minDate" v-model:show="showCalendar2" @confirm="endDtConfirm($event, 'repairTimeLimit')" />

      <van-field v-if="formData.repairRequire == 1" name="repairPicture" label="整改后照片">
        <template #input>
          <AppUpload :watermarkText="watermarkText" v-model:fileList="formData.repairPicture" />
        </template>
      </van-field>

      <van-field
        required
        v-if="formData.repairRequire == 2"
        label-width="300"
        label-align="top"
        type="textarea"
        :rules="[{ required: true, message: '请输入' }]"
        v-model="formData.sugRepairMsr"
        name="sugRepairMsr"
        label="建议整改措施"
        placeholder="请输入"
      />

      <van-popup v-model:show="showArea" position="bottom">
        <van-picker
          :columns-field-names="customFieldName"
          :columns="orgTree"
          @confirm="onConfirm($event, 'showArea', 'orgName')"
          @cancel="showArea = false"
        />
      </van-popup>

      <van-popup v-model:show="showDepart" position="bottom">
        <van-picker
          :columns-field-names="customFieldName"
          :columns="deptTree"
          @confirm="onConfirm($event, 'showDepart', 'departName')"
          @cancel="showDepart = false"
        />
      </van-popup>

      <van-popup v-model:show="showTeam" position="bottom">
        <van-picker
          :columns-field-names="{ text: 'sectionName', value: 'id' }"
          :columns="teamList"
          @confirm="onConfirm($event, 'showTeam', 'team')"
          @cancel="showTeam = false"
        />
      </van-popup>

      <div style="padding: 16px">
        <van-button round block type="primary" :loading="submiting" native-type="submit"> 提交 </van-button>
      </div>
    </van-form>
    <PersonDialog ref="personDialogRef" @cancel="submiting = false" @confirm="confirmPerson" />
  </div>
</template>

<script setup lang="ts">
  import {
    jnYhSspSubmit,
    getTeamList,
    ifSecurityByOrg,
    queryByOrgOrDeptCode,
    getOrganizationNew,
    getDepart3List,
    getFlowType,
    getUserInfo,
  } from '../index.api';
  import AppUpload from '../../../../components/App/AppUpload.vue';
  import { showFailToast } from 'vant';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import PersonDialog from '../components/personDialog.vue';
  import { useRouter } from 'vue-router';
  import { useRoute } from 'vue-router';
  import { ref, reactive } from 'vue';
  import TreeSelect from '../../components/treeSelect.vue';

  const router = useRouter();
  const route = useRoute();
  console.log(route.query);
  
  const showArea = ref(false);
  const showDepart = ref(false);
  const showTeam = ref(false);
  let orgTree = reactive([]);
  let deptTree = reactive([]);
  let teamList = reactive([]);
  const submiting = ref(false);
  const userStore: any = useUserStore();
  const flowType = ref('1'); // 部门类型
  const userShow = ref(false);
  const repairNotice = ref('');
  const personDialogRef = ref<HTMLElement | null>(null);

  getFlowType(userStore.getUserInfo.id).then((res) => {
    flowType.value = res;
    getOrgTree();
  });

  const watermarkText = ref(
    `${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} 上传`
  );
  const showCalendar1 = ref(false);
  const showCalendar2 = ref(false);
  const showYhLevel = ref(false);
  const showyhType = ref(false);
  const showyhTypeSub = ref(false);
  const showriskId = ref(false);
  const yh_hidden_levelList = [
    { text: '一般', value: 1 },
    { text: '重大', value: 2 },
  ];
  const sk_yh_type = userStore.getAllDictItems.sk_yh_type;
  const sk_yh_type_1 = ref(userStore.getAllDictItems.sk_yh_type_sub);

  const riskList = ref<any[]>([]);

  const formData = reactive<any>({
    yhPicture: '',
    repairPicture: '',
    yhDescription: '',
    repairExplain: '',
    checkPersonName: userStore.userInfo.realname,
    checkPerson: userStore.userInfo.id,
    reporter: userStore.userInfo.realname,
    reporterPhone: userStore.userInfo.phone,
    departName: '',
    orgName: '',
    depart: '',
    org: '',
    yhLevel: 1,
    yhLevelLabel: '一般',
    checkTime: dateFormat(new Date(), 'yyyy-MM-dd'),
    repairTimeLimit: dateFormat(new Date(), 'yyyy-MM-dd'),
  });
  if (route.query.yhPicture) {
    formData.yhPicture = route.query.yhPicture;
  }
  if (route.query.yhDescription) {
    formData.yhDescription = route.query.yhDescription;
  }
  const minDate = ref(new Date(dateFormat(new Date(), 'yyyy-MM-dd')));
  const minDate1 = ref(new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000));

  // 图片校验
  const picValid = () => !!formData.yhPicture;
  const customFieldName = {
    text: 'departName',
    value: 'orgCode',
  };
  const getOrgTree = () => {
    getOrganizationNew({}).then((res) => {
      orgTree = res;
      orgTree.forEach((item: any) => {
        if (userStore.getUserInfo.orgCode.includes(item.orgCode) && ['2', '3'].includes(flowType.value)) {
          formData.org = item.orgCode;
          formData.orgName = item.departName;
          getDepartTree();
        }
      });
    });
  };

  const teamClick = () => {
    // if (!teamList || teamList.length == 0) {
    //   showFailToast('暂无可选班组');
    //   return;
    // }
    showTeam.value = true;
  };

  const orgClick = () => {
    if (!['2', '3'].includes(flowType.value)) {
      showArea.value = true;
    }
  };

  const getDepartTree = () => {
    getDepart3List({ orgCode: formData.org }).then((res) => {
      deptTree = res;
    });
  };
  getOrgTree();

  const clearDepart = () => {
    formData.depart = '';
    formData.departName = '';
    getRiskList(formData.org, '');
  };

  const onConfirm = (value, show, key) => {
    switch (key) {
      case 'yhLevel':
        formData.yhLevel = value.selectedValues[0];
        formData.yhLevelLabel = value.selectedOptions[0].text;
        showYhLevel.value = false;
        break;
      case 'yhType':
        formData.yhType = value.selectedValues[0];
        formData.yhTypeLabel = value.selectedOptions[0].text;
        showyhType.value = false;
        // sk_yh_type_1.value = userStore.getAllDictItems[formData.yhType];
        break;
      case 'yhTypeSub':
        formData.yhTypeSub = value.selectedValues[0];
        formData.yhTypeSubLabel = value.selectedOptions[0].text;
        showyhTypeSub.value = false;
        break;
      case 'orgName':
        showArea.value = false;
        formData.org = value.selectedOptions[0].orgCode;
        formData.orgName = value.selectedOptions[0].departName;
        getRiskList(formData.org, '');
        // getTeamListFn(formData.org, '');
        getDepartTree();
        getUser();
        break;
      case 'departName':
        showDepart.value = false;
        formData.depart = value.selectedOptions[0].orgCode;
        formData.departName = value.selectedOptions[0].departName;
        getRiskList(formData.org, formData.depart);
        getTeamListFn(formData.depart);
        getUser();
        break;
      case 'riskId':
        showriskId.value = false;
        formData.riskId = value.selectedOptions[0].uniqueCode;
        formData.riskName = value.selectedOptions[0].text;
        break;
      case 'team':
        showTeam.value = false;
        formData.team = value.selectedOptions[0].id;
        formData.teamName = value.selectedOptions[0].sectionName;
        break;
      case 'repairPerson':
        userShow.value = false;
        formData.repairPerson = value.id;
        formData.repairPersonName = value.realname;
        break;
    }
  };

  const getRiskList = (o, d) => {
    queryByOrgOrDeptCode({
      orgCode: o,
      departCode: d,
    }).then((res) => {
      if (res.length) {
        res.forEach((item) => {
          item.text = item.uniqueCode + '-' + item.riskName;
        });
      }
      riskList.value = res;
    });
  };

  const getTeamListFn = (d) => {
    getTeamList({
      workShopCode: d.slice(0, 6),
    }).then((res) => {
      teamList = res;
    });
  };

  const endDtConfirm = (value, key) => {
    formData[key] = dateFormat(value, 'yyyy-MM-dd');
    showCalendar1.value = false;
    showCalendar2.value = false;
  };

  const showDate = ref(false);
  // 判断当前用户所属二级是否是安全主管部门
  const ifSecurity = () => {
    ifSecurityByOrg().then((res) => {
      showDate.value = res;
    });
  };
  ifSecurity();

  const confirmPerson = (data) => {
    let params = { ...formData, ...data };
    if (!formData.depart) delete params.departName;
    if (!showDate.value) delete params.repairDate;
    jnYhSspSubmit(params)
      .then((res) => {
        submiting.value = false;
        // showSuccessToast(res);
        setTimeout(() => {
          router.back();
        }, 300);
      })
      .catch((err) => {
        console.log(err);
        showFailToast('新增失败，请联系管理员');
        submiting.value = false;
      });
  };

  const onSubmit = (values) => {
    submiting.value = true;
    let params = { ...formData };
    if (!formData.depart) delete params.departName;
    if (!showDate.value) delete params.repairDate;
    personDialogRef.value?.getAssigneeData({
      currentNode: 11,
      org: formData.org,
      depart: formData.depart,
      flowType: flowType.value,
      repairRequire: formData.repairRequire,
      yhLevel: formData.yhLevel,
    });
  };

  const userList = ref([]);
  function getUser() {
    getUserInfo(formData?.org).then((res) => {
      userList.value = res;
    });
  }
</script>
<style scoped lang="less">
  .gary {
    color: #9a9b9b;
  }
  .gary-text {
    color: #9a9b9b !important;
  }
  * {
    --van-field-input-disabled-text-color: #9a9b9b;
    --van-field-disabled-text-color: #9a9b9b;
  }
</style>
