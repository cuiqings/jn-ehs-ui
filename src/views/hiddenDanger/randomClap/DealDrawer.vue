<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    title="隐患确认"
    ok-text="提交"
    width="1000px"
    @ok="handleSubmit"
    :show-footer="true"
    destroyOnClose
  >
    <!-- 基本信息 -->
    <div class="info-wrapper">
      <div class="info">
        <div class="split-line"></div>
        <div class="info-title">基本信息</div>
      </div>
      <div class="info-content">
        <div class="item" v-if="typeString == 'confirm'">
          <div class="item-title">隐患来源：</div>
          <div class="item-content">{{ filterDictTextByCache('yh_hidden_source', sourceType) }}</div>
        </div>
        <!-- 隐患排查 -->
        <div v-if="typeString == 'confirm' && sourceType == '1'">
          <div class="item">
            <div class="item-title">巡检计划：</div>
            <div class="item-content" v-if="historyData.plan">{{ historyData.plan.planName }}</div>
          </div>
          <div class="item">
            <div class="item-title">检查项：</div>
            <div class="item-content"
              >{{ filterDictTextByCache('check_sort', historyData.itemType) }}<span v-if="historyData.itemName">></span>
              {{ historyData.itemName }}</div
            >
          </div>
        </div>
        <div class="item">
          <div class="item-title">隐患照片：</div>
          <div class="item-content">
            <a-upload action="" list-type="picture-card" v-model:file-list="fileList" @preview="handlePreview" :disabled="true"> </a-upload>
            <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
              <img alt="example" style="width: 100%" :src="previewImage" />
            </a-modal>
          </div>
        </div>
        <div class="item">
          <div class="item-title">隐患描述：</div>
          <div class="item-content">{{ historyData.yhDescription || historyData.problemDescription }}</div>
        </div>
        <div class="item">
          <div class="item-title">隐患地点：</div>
          <div class="item-content"
            >{{ historyData.orgName }}<span v-if="historyData.orgName && historyData.departName">></span>{{ historyData.departName }}</div
          >
        </div>
        <div v-if="historyData.confirm && sourceType == '1'">
          <div class="item">
            <div class="item-title">检查人：</div>
            <div class="item-content">{{ historyData.reporterName }}</div>
          </div>
          <div class="item">
            <div class="item-title">检查时间：</div>
            <div class="item-content">{{ historyData.reportTime }}</div>
          </div>
        </div>
        <div v-else>
          <div class="item">
            <div class="item-title">提报人：</div>
            <div class="item-content">{{ historyData.reporterName }}</div>
          </div>
          <div class="item">
            <div class="item-title">提报人电话：</div>
            <div class="item-content">{{ historyData.reporterPhone }}</div>
          </div>
          <div class="item">
            <div class="item-title">提报时间：</div>
            <div class="item-content">{{ historyData.reportTime }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 整改信息 -->
    <div class="info-wrapper" v-if="historyData.repairExplain || historyData.repairPicture">
      <div class="info">
        <div class="split-line"></div>
        <div class="info-title">整改信息</div>
      </div>
      <div class="info-content">
        <div class="item" v-if="historyData.repairPicture">
          <div class="item-title">整改后照片：</div>
          <div class="item-content">
            <a-upload action="" list-type="picture-card" v-model:file-list="fileList1" @preview="handlePreview" :disabled="true"> </a-upload>
            <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
              <img alt="example" style="width: 100%" :src="previewImage" />
            </a-modal>
          </div>
        </div>
        <div class="item" v-if="historyData.repairExplain">
          <div class="item-title">整改说明：</div>
          <div class="item-content">{{ historyData.repairExplain }}</div>
        </div>
      </div>
    </div>
    <!-- 隐患确认 -->
    <div class="info-wrapper">
      <div class="info">
        <div class="split-line"></div>
        <div class="info-title">隐患确认</div>
      </div>
      <div class="info-content">
        <!-- 表单 -->
        <a-form ref="infoRef" :model="info" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
          <a-form-item v-if="historyData.confirm && historyData.confirm.currentNode == '21'" label="隐患确认" name="handleResult">
            <a-radio-group v-model:value="info.handleResult" name="radioGroup">
              <a-radio value="2">确认隐患</a-radio>
              <a-radio value="1">非隐患</a-radio>
            </a-radio-group>
          </a-form-item>
          <div v-if="info.handleResult == 1">
            <a-form-item label="整改情况" name="ifRepair" :rules="[{ required: true, message: '请选择整改情况！' }]">
              <a-radio-group v-model:value="info.ifRepair" name="radioGroup">
                <a-radio value="1">整改完成</a-radio>
                <a-radio value="2">继续整改</a-radio>
              </a-radio-group>
            </a-form-item>
            <!-- 整改完成 -->
            <div v-if="info.ifRepair == 1" style="margin-left: 80px">
              <a-form-item label="处理说明" name="handleExplain">
                <a-textarea placeholder="请输入" v-model:value="info.handleExplain" show-count :maxlength="200" :rows="4" />
              </a-form-item>
              <a-form-item label="" name="handlePicture">
                <div class="rectification-pic">
                  <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.handlePicture" />
                </div>
              </a-form-item>
            </div>
            <!-- 整改未完成 -->
            <div v-if="info.ifRepair == 2" style="margin-left: 80px">
              <a-form-item label="限定整改日期：" name="repairDate" :rules="[{ required: true, message: '请选择限定整改日期！' }]">
                <a-date-picker style="width: 100%" :disabled-date="disabledDate" v-model:value="info.repairDate" valueFormat="YYYY-MM-DD" />
              </a-form-item>
              <a-form-item label="责任部门：" name="dutyDept" :rules="[{ required: true, message: '请选择责任部门！' }]">
                <a-tree-select
                  v-model:value="info.dutyDept"
                  style="width: 100%"
                  :tree-data="treeData"
                  tree-default-expand-all
                  :show-checked-strategy="SHOW_PARENT"
                  placeholder="请选择"
                  :allowClear="true"
                  :rules="[{ required: true, message: '请选择责任部门！' }]"
                  tree-node-filter-prop="title"
                  @change="dutyOrgSelectChange"
                />
              </a-form-item>
              <a-form-item label="责任人：" name="dutyPeople" :rules="[{ required: true, message: '请选择责任人！' }]">
                <a-select placeholder="请选择" show-search :filter-option="filterOption" v-model:value="info.dutyPeople" @change="changeDutyPerson">
                  <a-select-option v-for="(item, index) in personOptions" :value="item.id" :key="index">
                    {{ item.realname }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </div>
          <div v-if="info.handleResult == 2">
            <a-form-item label="隐患等级" name="yhLevel" :rules="[{ required: true, message: '请选择隐患等级！' }]">
              <a-radio-group v-model:value="info.yhLevel" name="radioGroup">
                <a-radio value="1">一般</a-radio>
                <a-radio value="2">较大</a-radio>
                <a-radio value="3" style="color: red">重大</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="隐患类型" name="yhType" :rules="[{ required: true, message: '请选择隐患类型！' }]">
              <a-select v-model:value="info.yhType" placeholder="请选择">
                <a-select-option v-for="(item, key) in dataSourceDangerType" :key="key" :value="item.value">
                  {{ item.title }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="隐患地点" name="yhPlace" :rules="[{ required: true, message: '请选择隐患地点！' }]">
              <a-tree-select
                v-model:value="info.yhPlace"
                style="width: 100%"
                :tree-data="treeData"
                tree-default-expand-all
                :show-checked-strategy="SHOW_PARENT"
                placeholder="请选择"
                :allowClear="true"
                :rules="[{ required: true, message: '请选择隐患地点！' }]"
                tree-node-filter-prop="title"
                @change="departSelectChange"
              />
            </a-form-item>
            <a-form-item label="检查层级" name="checkHierarchy">
              <a-input v-model:value="info.checkHierarchy" :maxlength="30" placeholder="请输入"></a-input>
            </a-form-item>
            <a-form-item label="防控手段" name="handleMeans" :rules="[{ required: true, message: '请选择防控手段！' }]">
              <a-select v-model:value="info.handleMeans" placeholder="请选择">
                <a-select-option v-for="(item, key) in dataMeansType" :key="key" :value="item.value">
                  {{ item.title }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <!-- 关联风险 -->
            <a-form-item label="关联风险" name="risk">
              <InputTextArea v-model:value="info.riskPointName" placeholder="请选择" auto-size readonly @click="selectRiskPoints" />
            </a-form-item>
            <a-form-item label="整改情况" name="repairResult" :rules="[{ required: true, message: '请选择整改情况！' }]">
              <a-radio-group v-model:value="info.repairResult" @change="changeRepairResult">
                <a-radio value="1">整改完成</a-radio>
                <a-radio value="2">整改未完成</a-radio>
              </a-radio-group>
            </a-form-item>
            <!-- 整改完成 -->
            <div v-if="info.repairResult == 1" style="margin-left: 80px">
              <a-form-item label="临时措施：" name="tempMeasure">
                <a-textarea placeholder="请输入" v-model:value="info.tempMeasure" show-count :maxlength="200" :rows="4" />
              </a-form-item>

              <a-form-item label="限定整改日期：" name="repairDate1" :rules="[{ required: true, message: '请选择限定整改日期！' }]">
                <a-date-picker style="width: 100%" :disabled="repairDate1Disabled" v-model:value="info.repairDate1" valueFormat="YYYY-MM-DD" />
              </a-form-item>
              <a-form-item label="责任部门：" name="dutyDept" :rules="[{ required: true, message: '请选择责任部门！' }]">
                <a-tree-select
                  v-model:value="info.dutyDept"
                  style="width: 100%"
                  :tree-data="treeData"
                  tree-default-expand-all
                  placeholder="请选择"
                  :allowClear="true"
                  :rules="[{ required: true, message: '请选择责任部门！' }]"
                  tree-node-filter-prop="label"
                  @change="dutyOrgSelectChange"
                />
              </a-form-item>
              <a-form-item label="责任人：" name="dutyPeople" :rules="[{ required: true, message: '请选择责任人！' }]">
                <a-select placeholder="请选择" show-search :filter-option="filterOption" v-model:value="info.dutyPeople" @change="changeDutyPerson">
                  <a-select-option v-for="(item, index) in personOptions" :value="item.id" :key="index">
                    {{ item.realname }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="复查结果：" name="recheckResult">
                <a-textarea placeholder="请输入" v-model:value="info.recheckResult" show-count :maxlength="200" :rows="4" />
              </a-form-item>
              <a-form-item label="" name="recheckPicture">
                <div class="rectification-pic">
                  <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.recheckPicture" />
                </div>
              </a-form-item>
            </div>
            <!-- 整改未完成 -->
            <div v-if="info.repairResult == 2" style="margin-left: 80px">
              <a-form-item label="临时措施：" name="tempMeasure">
                <a-textarea placeholder="请输入" v-model:value="info.tempMeasure" show-count :maxlength="200" :rows="4" />
              </a-form-item>

              <a-form-item label="限定整改日期：" name="repairDate" :rules="[{ required: true, message: '请选择限定整改日期！' }]">
                <a-date-picker
                  style="width: 100%"
                  :disabled-date="disabledDate"
                  :disabled="repairDateDisabled"
                  v-model:value="info.repairDate"
                  valueFormat="YYYY-MM-DD"
                />
              </a-form-item>
              <a-form-item label="责任部门：" name="dutyDept" :rules="[{ required: true, message: '请选择责任部门！' }]">
                <a-tree-select
                  v-model:value="info.dutyDept"
                  style="width: 100%"
                  :tree-data="treeData"
                  tree-default-expand-all
                  :show-checked-strategy="SHOW_PARENT"
                  placeholder="请选择"
                  :allowClear="true"
                  :rules="[{ required: true, message: '请选择责任部门！' }]"
                  tree-node-filter-prop="title"
                  @change="dutyOrgSelectChange"
                />
              </a-form-item>
              <a-form-item label="责任人：" name="dutyPeople" :rules="[{ required: true, message: '请选择责任人！' }]">
                <a-select placeholder="请选择" show-search :filter-option="filterOption" v-model:value="info.dutyPeople" @change="changeDutyPerson">
                  <a-select-option v-for="(item, index) in personOptions" :value="item.id" :key="index">
                    {{ item.realname }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </div>
        </a-form>
      </div>
    </div>
    <RiskPointsModal @register="registerRiskPointsModal" @select="selectRiskPointsOk" />
  </BasicDrawer>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { Input } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import { BasicDrawer, useDrawerInner } from '/src/components/Drawer';
import { useModal } from '/@/components/Modal';
import type { UploadProps } from 'ant-design-vue';
import { TreeSelect } from 'ant-design-vue';
import RiskPointsModal from '../check/RiskPointsModal.vue';
import { JImageUpload } from '/@/components/Form';
import { defHttp } from '/@/utils/http/axios';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { initDictOptions } from '/@/utils/dict';
import { hiddenConfirm } from './randomClap.api';
import { riskByIds } from '../check/check.api';
import { useMessage } from '/@/hooks/web/useMessage';
import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
import dayjs from 'dayjs';
import { render } from '/@/utils/common/renderUtils';
const InputTextArea = Input.TextArea;
const { createMessage } = useMessage();
const infoRef = ref<any>(null);
const emit = defineEmits(['register', 'success']);
const historyData = ref({});
const previewVisible = ref(false);
const previewImage = ref('');
const info = ref<any>({
  handleResult: '2',
  yhLevel: '1',
  yhType: undefined,
  checkHierarchy: '',
  yhPlace: undefined,
  riskPointName: '',
  riskPoint: '',
  repairResult: '',
  recheckResult: '',
  recheckPicture: '',
  tempMeasure: '',
  repairDate1: ref<Dayjs>(dayjs(dayjs(new Date()).format('YYYY-MM-DD'), 'YYYY-MM-DD')),
  repairDate: ref<Dayjs>(),
  dutyDept: undefined,
  dutyDeptName: '',
  dutyPeople: undefined,
  dutyPeopleName: '',
  ifRepair: '',
  handleExplain: '',
  handlePicture: '',
});
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const treeData = ref<any[]>([]);
const treeData1 = ref<any[]>([]);
const personOptions = ref<any[]>([]);
const dataSourceDangerType = ref([]);
const dataMeansType = ref([]);
const fileList = ref<any[]>([]);
const fileList1 = ref<any[]>([]);
const confirmId = ref('');
const confirmData = ref({});
const riskIdEdit = ref([]);
const typeString = ref('');
const sourceType = ref('');
const riskDataSource: any = ref([]);
const riskIdArr: any = ref([]);
const repairDate1Disabled = ref(false);
const repairDateDisabled = ref(false);
const [registerRiskPointsModal, { openModal: openRiskPointsModal }] = useModal();
initDictConfig();
// 初始化字典
async function initDictConfig() {
  dataSourceDangerType.value = await initDictOptions('yh_hidden_type');
  dataMeansType.value = await initDictOptions('yh_control_means');
}
const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
  setDrawerProps({ confirmLoading: false });
  riskDataSource.value = [];
  riskIdArr.value = [];
  // historyData.value = data.record;
  // 查询详情，取详情里面的id
  // 隐患确认传 sourceId
  typeString.value = data.record.typeString;
  sourceType.value = data.record.sourceType;
  if (data.record.riskPoint) {
    riskByIds({
      ids: data.record.riskPoint,
    }).then((res) => {
      if (res) {
        riskDataSource.value = res;
      } else {
        riskDataSource.value = [];
      }
    });
  }
  if (data.record.typeString == 'confirm') {
    if (data.record.sourceType == '1') {
      let params = {
        id: data.record.sourceId,
      };
      let res = await defHttp.get({ url: '/hiddenDangerChecks/jnYhPlanExecute/itemDetail', params }, { isTransformResponse: false });
      console.log('res', res);
      if (res.success && res.result) {
        historyData.value = res.result;
        if (res.result.confirm) {
          confirmData.value = res.result.confirm;
        }
      } else {
        console.log('查询详情异常', res);
      }
    } else {
      let params = {
        id: data.record.sourceId,
      };
      let res = await defHttp.get({ url: '/hiddenDangerChecks/jnYhSsp/detail', params }, { isTransformResponse: false });
      console.log('res', res);
      if (res.success && res.result) {
        confirmId.value = res.result.confirm.id;
        historyData.value = res.result;
        if (res.result.confirm && res.result.confirm.currentNode != '21') {
          info.value.handleResult = '2';
        }
        if (res.result.confirm) {
          confirmData.value = res.result.confirm;
        }
      } else {
        console.log('查询详情异常', res);
      }
    }
  } else {
    // 随手拍-隐患确认传 sourceId
    let params = {
      id: data.record.id,
    };
    let res = await defHttp.get({ url: '/hiddenDangerChecks/jnYhSsp/detail', params }, { isTransformResponse: false });
    console.log('res', res);
    if (res.success && res.result) {
      historyData.value = res.result;
      confirmId.value = res.result.confirm.id;
      if (res.result.confirm && res.result.confirm.currentNode != '21') {
        info.value.handleResult = '2';
      }
      if (res.result.confirm) {
        confirmData.value = res.result.confirm;
      }
    } else {
      console.log('查询详情异常', res);
    }
  }
  // 构建filelist
  let fileListBak = [];
  if (historyData.value.yhPicture) {
    let picList = historyData.value.yhPicture.split(',');
    picList.map((item) => {
      fileListBak.push({
        uid: item,
        name: item,
        status: 'done',
        url: getFileAccessHttpUrl(item),
      });
    });
  }
  if (historyData.value.checkPicture) {
    let picList = historyData.value.checkPicture.split(',');
    picList.map((item) => {
      fileListBak.push({
        uid: item,
        name: item,
        status: 'done',
        url: getFileAccessHttpUrl(item),
      });
    });
  }
  fileList.value = fileListBak;
  // 构建filelist1
  let fileListBak1 = [];
  if (historyData.value.repairPicture) {
    let picList = historyData.value.repairPicture.split(',');
    picList.map((item) => {
      fileListBak1.push({
        uid: item,
        name: item,
        status: 'done',
        url: getFileAccessHttpUrl(item),
      });
    });
  }
  fileList1.value = fileListBak1;
  if (confirmData.value.yhLevel && confirmData.value.yhLevel == '3') {
    info.value = JSON.parse(JSON.stringify(confirmData.value));
    info.value.handleResult = '2';

    // 整改完成-限定整改日期赋值
    if (info.value.repairResult == '1') {
      if (historyData.value.repairDate) {
        info.value.repairDate1 = historyData.value.repairDate;
        repairDate1Disabled.value = true;
      } else {
        info.value.repairDate1 = info.value.repairDate;
        repairDate1Disabled.value = false;
      }
    }
    if (info.value.repairResult == '2') {
      if (historyData.value.repairDate) {
        info.value.repairDate = historyData.value.repairDate;
        repairDateDisabled.value = true;
      } else {
        info.value.repairDate = info.value.repairDate;
        repairDateDisabled.value = false;
      }
    }
    if (info.value.yhPlaceDepart) {
      info.value.yhPlace = info.value.yhPlaceDepart;
    } else {
      info.value.yhPlace = info.value.yhPlaceOrg;
    }
    if (info.value.dutyDept) {
      personSelectChange(info.value.dutyDept);
    }
  } else {
    // 初始化info
    resetInfo();
  }
});
// 加载部门数
loadRoot();
async function changeRepairResult(value) {
  console.log('changeRepairResult', value);
  if (value.target.value == '1') {
    info.value.tempMeasure = '';
    info.value.repairDate1 = ref<Dayjs>(dayjs(dayjs(new Date()).format('YYYY-MM-DD'), 'YYYY-MM-DD'));
    if (historyData.value.depart) {
      info.value.dutyDept = historyData.value.depart;
    } else {
      info.value.dutyDept = historyData.value.org;
    }
    // 整改完成-限定整改日期赋值
    if (historyData.value.repairDate) {
      info.value.repairDate1 = historyData.value.repairDate;
      repairDate1Disabled.value = true;
    } else {
      info.value.repairDate1 = ref<Dayjs>(dayjs(dayjs(new Date()).format('YYYY-MM-DD'), 'YYYY-MM-DD'));
      repairDate1Disabled.value = false;
    }
    info.value.dutyPeople = undefined;
    info.value.recheckResult = '';
    info.value.recheckPicture = '';
    await personSelectChange(historyData.value.depart);
  } else {
    info.value.tempMeasure = '';
    info.value.repairDate = ref<Dayjs>();
    info.value.dutyDept = undefined;
    info.value.dutyPeople = undefined;
    personOptions.value = [];
    // 整改完成-限定整改日期赋值
    if (historyData.value.repairDate) {
      info.value.repairDate = historyData.value.repairDate;
      repairDateDisabled.value = true;
    } else {
      info.value.repairDate = ref<Dayjs>();
      repairDateDisabled.value = false;
    }
  }
}
const changeDutyPerson = (value) => {
  console.log('changeDutyPerson', value);
  // 翻译成名称
  let dutyPeopleName = '';
  for (let i of personOptions.value) {
    if (i.id == value) {
      dutyPeopleName = i.realname;
      break;
    }
  }
  info.value.dutyPeopleName = dutyPeopleName;
};
const handleCancel = () => {
  previewVisible.value = false;
};
const handlePreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
};
const filterOption = (input: string, option: any) => {
  return option.children()[0].children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
function selectRiskPoints() {
  if (info.value.riskPoint) {
    riskIdEdit.value = info.value.riskPoint.split(',');
  } else riskIdEdit.value = [];
  openRiskPointsModal(true, { riskId: riskIdEdit.value, data: riskDataSource.value });
}
function selectRiskPointsOk(data) {
  riskDataSource.value = data.dataSource;
  let riskPointsName = '';
  data.dataSource.forEach((item) => {
    riskPointsName += `${item.orgName}>${render.renderDictText(item.riskType, 'risk_type')}>${item.jobActivity}>${
      item.checkItem ? item.checkItem + '>' + item.riskDescription + '、' : item.riskDescription + '、'
    }`;
  });
  if (riskPointsName.endsWith('、')) {
    riskPointsName = riskPointsName.slice(0, -1);
  }
  info.value.riskPointName = riskPointsName;
  info.value.riskPoint = data.selectedRowKeys.join(',');
}
/**
 * 加载下拉树形数据
 */
async function loadRoot() {
  let params = {};
  let res = await defHttp.get({ url: '/jn/common/getDepartTreeBy23', params }, { isTransformResponse: false });
  if (res.success && res.result) {
    //深拷贝res.result
    let resCopy = JSON.parse(JSON.stringify(res.result));
    for (let i of res.result) {
      i.key = i.orgCode;
      i.label = i.departName;
      i.value = i.orgCode;
      i.isLeaf = !!i.isLeaf;
      if (!i.isLeaf) {
        toData(i.children, i.isLeaf);
      }
    }
    treeData.value = [...res.result];
    console.log(treeData.value);
    for (let i of resCopy) {
      i.key = i.orgCode;
      i.label = i.departName;
      i.value = i.orgCode;
      i.isLeaf = !!i.isLeaf;
      i.selectable = false;
      if (!i.isLeaf) {
        toData(i.children, i.isLeaf);
      }
    }
    treeData1.value = [...resCopy];
    console.log(treeData1.value);
  } else {
    console.log('数根节点查询结果异常', res);
  }
}

function toData(children, isLeaf) {
  if (!isLeaf) {
    for (let i of children) {
      i.key = i.orgCode;
      i.label = i.departName;
      i.value = i.orgCode;
      i.isLeaf = !!i.isLeaf;
      toData(i.children, i.isLeaf);
    }
  }
}
/**
 * 隐患地点变化
 */
async function departSelectChange(value) {
  console.log('departSelectChange', value);
  // 翻译成部门名称
  let departName = '';
  for (let i of treeData.value) {
    if (i.orgCode == value) {
      departName = i.departName;
      break;
    }
    if (i.children) {
      for (let j of i.children) {
        if (j.orgCode == value) {
          departName = j.departName;
          break;
        }
      }
    }
  }
  // info.value.yhPlace = value;
  info.value.yhPlaceName = departName;
  // await personSelectChange(value);
}
/**
 * 责任部门变化
 */
async function dutyOrgSelectChange(value) {
  console.log('dutyOrgSelectChange', value);
  // 翻译成部门名称
  personOptions.value = [];
  let departName = '';
  for (let i of treeData1.value) {
    if (i.orgCode == value) {
      departName = i.departName;
      break;
    }
    if (i.children) {
      for (let j of i.children) {
        if (j.orgCode == value) {
          departName = j.departName;
          break;
        }
      }
    }
    info.value.dutyDeptName = departName;
    info.value.dutyPeople = undefined;
    await personSelectChange(value);
  }
  info.value.dutyDeptName = departName;
  info.value.dutyPeople = undefined;
  await personSelectChange(value);
}
/**
 * 加载责任人
 */
async function personSelectChange(value) {
  console.log('personSelectChange', value);
  let params = {
    orgCode: value,
  };
  let res = await defHttp.get(
    {
      url: '/jn/common/getUserListByOrg',
      params,
    },
    { isTransformResponse: false }
  );
  if (res.success && res.result) {
    personOptions.value = [...res.result];
  } else {
    console.log('数根节点查询结果异常', res);
  }
}
//表单提交事件
async function handleSubmit() {
  try {
    const values = await infoRef.value.validate();
    console.log('validate value', values);
    console.log('validate info', info);
    if (info.value.handleResult == '2' && info.value.repairResult == '1') {
      if (!info.value.recheckResult && !info.value.recheckPicture) {
        createMessage.error('请填写复查结果或上传复查图片');
        return false;
      }
      info.value.repairDate = info.value.repairDate1;
    }
    if (info.value.handleResult == '1' && info.value.ifRepair == '1') {
      if (!info.value.handleExplain && !info.value.handlePicture) {
        createMessage.error('请填写处理说明或上传处理图片');
        return false;
      }
    }
    setDrawerProps({ confirmLoading: true });
    if (historyData.value.confirm.currentNode != '21') {
      info.value.handleResult = '2';
    }
    console.log('info.value', info.value);
    // info.value.id = confirmId.value;
    // 隐患地点格式化
    if (info.value.yhPlace) {
      if (info.value.yhPlace.length == 6) {
        info.value.yhPlaceOrg = info.value.yhPlace;
        info.value.yhPlaceOrgName = info.value.yhPlaceName;
      } else {
        info.value.yhPlaceDepart = info.value.yhPlace;
        info.value.yhPlaceDepartName = info.value.yhPlaceName;
      }
    }
    info.value.sourceType = sourceType.value;
    // 随手拍和隐患排查都是传详情confirm里面的id
    info.value.id = historyData.value.confirm.id;
    await hiddenConfirm(info.value).then((res) => {
      if (res) {
        // 初始化info
        resetInfo();
        //刷新列表
        emit('success');
        //关闭弹窗
        closeDrawer();
      }
    });
  } finally {
    setDrawerProps({ confirmLoading: false });
  }
}
function resetInfo() {
  // 初始化info
  info.value = {
    handleResult: '2',
    yhLevel: '1',
    yhType: undefined,
    checkHierarchy: '',
    yhPlace: undefined,
    riskPointName: '',
    riskPoint: '',
    repairResult: '',
    recheckResult: '',
    recheckPicture: '',
    tempMeasure: '',
    repairDate1: ref<Dayjs>(dayjs(dayjs(new Date()).format('YYYY-MM-DD'), 'YYYY-MM-DD')),
    repairDate: ref<Dayjs>(),
    dutyDept: undefined,
    dutyDeptName: '',
    dutyPeople: undefined,
    dutyPeopleName: '',
    ifRepair: '',
    handleExplain: '',
    handlePicture: '',
  };
}
const disabledDate = (current: Dayjs) => {
  // Can not select days before today
  return current < dayjs().startOf('day');
};
</script>
<style lang="less" scoped>
.step-wrapper {
  padding: 20px 12px;
}
.info-wrapper {
  padding: 0 12px;
}
.hi-wrapper {
  padding: 0 12px;
}
.info {
  display: flex;
  margin: 10px 0;

  .split-line {
    width: 4px;
    height: 20px;
    background: #3e87f8;
    margin-right: 10px;
    margin-top: 1px;
  }
  .info-title {
    font-size: 16px;
    font-family: SourceHanSansCN-Medium, SourceHanSansCN-Medium;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.87);
  }
}
.info-content {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  .item {
    // width: 50%;
    display: flex;
    margin-bottom: 15px;
    .item-title {
      width: 120px;
      font-size: 14px;
      font-family: SourceHanSansCN-Regular, SourceHanSansCN;
      font-weight: normal;
      color: rgba(0, 0, 0, 0.68);
      text-align: right;
    }
    .item-content {
      width: calc(100% - 120px);
      font-size: 14px;
      font-family: SourceHanSansCN-Regular, SourceHanSansCN;
      font-weight: normal;
      color: rgba(0, 0, 0, 0.9);
    }
  }
}
.line-wrapper {
  padding: 24px;
}
.his-detail {
  display: flex;
  position: relative;
  .his-time {
    width: 160px;
    margin-right: 5px;
  }
  .more-btn {
    position: absolute;
    right: 0;
    top: 0;
  }
}
.his-content {
  // width: 850px;
  .history-explain {
    width: 100%;
    margin-top: 10px;
    display: flex;
    .explain-label {
      width: 90px;
      text-align: right;
    }
    .explain-text {
      // width: 750px;
      color: #666;
    }
  }
}
.rectification-pic {
  margin-left: 120px;
}
</style>
