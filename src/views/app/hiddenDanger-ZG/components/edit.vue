<!-- 随手拍新增 -->
<template>
  <div class="hd-add">
    <van-form ref="formRef" @submit="onSubmit" label-width="76px">
      <van-field v-model="formData.departName" name="departName" label="隐患来源" placeholder="隐患来源">
        <template #input>
          {{ filterDictTextByCache('sk_yh_source', formData.sourceType) }}
        </template>
      </van-field>
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

      <van-field name="yhPicture" label="隐患照片" v-if="formData.yhPicture">
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
        @click="departClick"
        :rules="[{ required: ['2', '3'].includes(flowType), message: '请选择' }]"
      >
        <template #right-icon>
          <!-- <van-icon style="padding-right: 10px; opacity: 0.4" v-show="formData.departName" @click.stop="clearDepart" name="cross" /> -->
        </template>
      </van-field>

      <van-field
        v-model="formData.teamName"
        v-if="['2', '3'].includes(flowType)"
        is-link
        readonly
        required
        name="depart"
        label="所属班组"
        placeholder="请选择"
        @click="teamClick"
        :rules="[{ required: true, message: '请选择' }]"
      >
        <template #right-icon>
          <van-icon @click.stop="clearTeam" v-show="formData.teamName" name="cross" />
        </template>
      </van-field>

      <template v-if="formData.flowType == '2' && formData.currentNode != '11' && formData.currentNode != '12'">
        <van-field
          required
          v-model="formData.departDutyPersonName"
          is-link
          readonly
          name="departDutyPersonName"
          label="车间责任人"
          placeholder="请选择"
          label-width="100"
          @click="departDutyPersonShow = true"
          :rules="[{ required: true, message: '请选择' }]"
        />

        <van-field
          v-model="formData.teamDutyPersonName"
          is-link
          readonly
          name="teamDutyPersonName"
          label="班组责任人"
          placeholder="请选择"
          @click="teamDutyPersonShow = true"
        />
      </template>

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

      <van-field v-model="formData.checkTime" is-link disabled name="checkTime" label="检查日期" placeholder="点击选择">
        <template #input>
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center">
            <span v-if="formData.checkTime">{{ formData.checkTime }}</span>
            <span v-else style="color: #c8c9cc">请选择</span>
            <!-- <van-icon style="padding-right: 10px; opacity: 0.4" v-if="formData.checkTime" @click.stop="formData.checkTime = ''" name="cross" /> -->
          </div>
        </template>
      </van-field>

      <van-calendar :min-date="minDate1" :max-date="minDate" v-model:show="showCalendar1" @confirm="endDtConfirm($event, 'checkTime')" />

      <van-field readonly v-model="formData.checkPersonName" name="checkPersonName" label="检查人" placeholder="检查人" />

      <van-field
        required
        v-if="flowType != '2'"
        v-model="formData.yhTypeLabel"
        is-link
        readonly
        name="yhTypeLabel"
        label="隐患分类"
        placeholder="请选择"
        @click="yhClassClick('showyhType')"
        :rules="[{ required: true, message: '请选择' }]"
      />
      <van-popup v-model:show="showyhType" position="bottom">
        <van-picker :columns="sk_yh_type" @confirm="onConfirm($event, 'showyhType', 'yhType')" @cancel="showyhType = false" />
      </van-popup>

      <van-field
        required
        v-model="formData.yhTypeSubLabel"
        is-link
        readonly
        v-if="flowType != '2'"
        name="yhTypeSubLabel"
        label="子类"
        placeholder="请选择"
        @click="yhClassClick('showyhTypeSub')"
        :rules="[{ required: true, message: '请选择' }]"
      />
      <van-popup v-model:show="showyhTypeSub" position="bottom">
        <van-picker :columns="sk_yh_type_1" @confirm="onConfirm($event, 'showyhTypeSub', 'yhTypeSub')" @cancel="showyhTypeSub = false" />
      </van-popup>

      <van-field v-model="formData.riskName" is-link readonly name="riskName" label="风险ID" placeholder="请选择" @click="showriskClick" />
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
        label-width="80"
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

      <van-field v-if="formData.repairRequire == 1" 
        name="repairPicture" 
        label="整改后照片"  
        label-width="80"
        :required="!formData.repairPicture && formData.flowType == '2' && formData.currentNode == '21' && formData.yhLevel == 1"
        :rules="[{ validator: validatorRepairPicture, message: '请输入' }]">
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
      <!--车间责任人-->
      <TreeSelect
        :value="formData.departDutyPerson"
        :maxLength="5"
        :not-tree="true"
        value-key="id"
        title-key="realname"
        v-model:show="departDutyPersonShow"
        :items="personOptions"
        @change="onConfirm($event, '', 'departDutyPerson')"
      />
      <!--车间责任人-->
      <TreeSelect
        :value="formData.teamDutyPerson"
        :maxLength="5"
        :not-tree="true"
        value-key="id"
        title-key="realname"
        v-model:show="teamDutyPersonShow"
        :items="personOptions"
        @change="onConfirm($event, '', 'teamDutyPerson')"
      />
    </van-form>

    <PersonDialog ref="personDialogRef" @confirm="confirmPerson" />
  </div>
</template>

<script setup lang="ts">
  import {
    jnYhSspSubmit,
    handleYh,
    getTeamList,
    ifSecurityByOrg,
    queryByOrgOrDeptCode,
    getDepart2List,
    getDepart3List,
    getFlowType,
    getUserInfo,
    jnYhSspDetail,
    getAllUserByOrg,
  } from '../index.api';
  import TreeSelect from '../../components/treeSelect.vue';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import AppUpload from '../../../../components/App/AppUpload.vue';
  import { showFailToast } from 'vant';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import PersonDialog from '../components/personDialog.vue';
  import { useRouter, useRoute } from 'vue-router';
  import { ref, reactive, watch } from 'vue';

  const router = useRouter();
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
  const formRef = ref(null);

  const departDutyPersonShow = ref(false);
  const teamDutyPersonShow = ref(false);

  getFlowType(userStore.getUserInfo.id).then((res) => {
    flowType.value = res;
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

  const minDate = ref(new Date(dateFormat(new Date(), 'yyyy-MM-dd')));
  const minDate1 = ref(new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000));

  const departClick = () => {
    if (formData.sourceType != 1 && route.query.canHandle == 'true') {
      showDepart.value = true;
    }
  };

  const teamClick = () => {
    showTeam.value = true;
  };

  const route = useRoute();
  if (route.query.id) {
    initPage();
  }
  function initPage() {
    jnYhSspDetail({ id: route.query.id })
      .then((res) => {
        Object.assign(formData, res);
        getPersonByorg();
        if (formData.yhType) {
          sk_yh_type.map((item) => {
            if (item.value == formData.yhType) {
              formData.yhTypeLabel = item.text;
            }
          });
        }
        if (formData.yhTypeSub) {
          sk_yh_type_1.value.map((item) => {
            if (item.value == formData.yhTypeSub) {
              formData.yhTypeSubLabel = item.text;
            }
          });
        }
        if (formData.riskId) {
          getRiskList(formData.org, formData.depart);
        }
        if (!formData.yhLevel) {
          formData.yhLevelLabel = null;
        }
        if (formData.org) {
          onConfirm(
            {
              selectedOptions: [
                {
                  orgCode: formData.org,
                  departName: formData.orgName,
                },
              ],
            },
            '',
            'orgName'
          );
        }
        if (formData.depart) {
          onConfirm(
            {
              selectedOptions: [
                {
                  orgCode: formData.depart,
                  departName: formData.departName,
                },
              ],
            },
            '',
            'departName'
          );
        }
        yh_hidden_levelList.some((item) => formData.yhLevel == item.value && (formData.yhLevelLabel = item.text));
      })
      .catch(() => {});
  }

  const customFieldName = {
    text: 'departName',
    value: 'orgCode',
  };
  const getOrgTree = () => {
    getDepart2List({}).then((res) => {
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

  const clearTeam = () => {
    formData.team = '';
    formData.teamName = '';
  };

  // 风险ID
  const showriskClick = () => {
    if (formData.sourceType == '1') return;
    if (route.query.canHandle != 'true') return;
    showriskId.value = true;
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
      case 'departDutyPerson':
        departDutyPersonShow.value = false;
        formData.departDutyPerson = value.ids;
        formData.departDutyPersonName = value.names;
        break;
      case 'teamDutyPerson':
        teamDutyPersonShow.value = false;
        formData.teamDutyPerson = value.ids;
        formData.teamDutyPersonName = value.names;
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
      if (formData.riskId) {
        riskList.value.map((item) => {
          if (item.uniqueCode == formData.riskId) {
            formData.riskName = item.text;
          }
        });
      }
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

  const emit = defineEmits(['submitSuccess']);
  const confirmPerson = (data) => {
    let params = { ...formData, ...data };
    if (!formData.depart) delete params.departName;
    if (!showDate.value) delete params.repairDate;
    if (['11', '12'].includes(params.currentNode)) {
      delete params.confirmLogList;
      delete params.repairLogList;
      delete params.id;
      handleYh({
        confirmId: route.query.id,
        confirmResult: 1,
        ...params,
      }).then((res) => {
        emit('submitSuccess');
      });
      return;
    }
    jnYhSspSubmit(params)
      .then((res) => {
        submiting.value = false;
        emit('submitSuccess');
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

  async function getFormData() {
    await formRef.value?.validate();
    // if (formData.flowType == 2 && ['11', '21'].includes(formData.currentNode)) {
    return formData;
    // } else {
    //   return {};
    // }
  }

  const yhClassClick = (str) => {
    if (
      (['22'].includes(formData.currentNode) && formData.flowType == 2 && formData.yhLevel == 2) ||
      (['21'].includes(formData.currentNode) && formData.flowType == 2 && formData.yhLevel == 1 && formData.sourceType != 1)
    )
      return;
    if (str == 'showyhType') {
      showyhType.value = true;
    }
    if (str == 'showyhTypeSub') {
      showyhTypeSub.value = true;
    }
  };

  const personOptions = ref([]);
  const getPersonByorg = () => {
    // 获取车间责任人列表
    let params: any = {};
    if (formData.org) {
      params.orgCode = formData.org;
    }
    params.pageSize = 9999;
    params.pageNo = 1;
    getAllUserByOrg(params).then((res) => {
      if (res) {
        personOptions.value = res;
      }
    });
  };

  const validatorRepairPicture = () => {
    console.log(formData.repairPicture);
    
    if(!formData.repairPicture && formData.flowType == '2' && formData.currentNode == '21' && formData.yhLevel == 1){
      return '整改后照片不能为空！';
    }
    return true;
  };

  defineExpose({
    onSubmit,
    getFormData,
  });
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
  .van-field--disabled .van-field__label {
    color: #323233 !important;
  }
  .van-field--disabled .van-field__control {
    color: #9a9b9b !important;
  }
</style>
