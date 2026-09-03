<template>
  <a-form
    ref="formRef"
    :model="formState"
    v-loading="loading"
    :label-col="{ span: 8 }"
    :wrapper-col="{ span: 16 }"
    autocomplete="off"
    :rules="formRules"
    labelWrap
  >
    <a-row :gutter="12">
      <a-col :span="24">
        <div class="step-wrap">
          <a-steps labelPlacement="vertical" size="small">
            <a-step
              v-for="item in formState.workExamineNodeList"
              :key="item.sort"
              :status="item.state == '0' ? 'finish' : item.state == '1' ? 'error' : item.state == '' ? 'wait' : 'wait'"
            >
              <template #title>
                <span :style="{ color: item.state == '0' ? 'blue' : '' }">{{ item.node }}</span>
              </template>
              <template #subTitle>
                <span :style="{ color: item.state == '0' ? 'blue' : '' }">{{ item.nodeOperator }}</span>
              </template>
              <template #description>
                <span :style="{ color: item.state == '0' ? 'blue' : '' }">{{ item.nodeTime }}</span>
              </template>
            </a-step>
          </a-steps>
        </div>
      </a-col>
      <a-col :span="12" v-if="workIndex == 0">
        <a-form-item label="是否可见" :colon="false" name="checkAdmin">
          <a-switch disabled v-model:checked="formState.checkAdmin" checkedValue="1" checked-children="是" unCheckedValue="0" un-checked-children="否" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="workIndex == 0">
        <a-form-item label="作业内容" :colon="false" name="workContent">
          <my-input :type="readonly ? 'readonly' : 'input'" placeholder="请输入" :max-length="300" v-model="formState.workContent" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="workIndex == 0 && !unhazardousWork">
        <a-form-item label="高危作业等级" :colon="false" name="highWorkLevel">
          <a-select
            :disabled="readonly"
            v-model:value="formState.highWorkLevel"
            :options="levelList"
            :field-names="{ label: 'label', value: 'value' }"
            placeholder="请选择"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="!unhazardousWork">
        <a-form-item label="作业类型" :colon="false" name="workType">
          <a-select
            :disabled="readonly"
            v-model:value="formState.workType"
            :options="formState.workTypeList"
            :field-names="{ label: 'label', value: 'value' }"
            placeholder="请选择"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="!unhazardousWork">
        <a-form-item label="布控球" name="ballCameraCode">
          <a-input v-model:value="formState.ballCameraName" :disabled="readonly" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="申请单位" :colon="false" name="applicationUnit">
          <a-tree-select
            disabled
            v-model:value="formState.applicationUnit"
            placeholder="请选择"
            :tree-data="applicationUnitList"
            showSearch
            tree-node-filter-prop="title"
            :field-names="{ label: 'title', value: 'key', children: 'children' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="申请人" :colon="false" name="applicant">
          <a-input v-model:value="formState.applicantName" disabled />
          <a-input type="hidden" v-model:value="formState.applicant" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '1'">
        <a-form-item label="作业高度(m)" :colon="false" name="workHeight">
          <a-input disabled placeholder="请输入" :max-length="3" v-model:value="formState.workHeight" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '4'">
        <a-form-item label=" 起吊物重量(t)" :colon="false" name="hoistingWeight">
          <a-input placeholder="请输入" disabled :max-length="4" v-model:value="formState.hoistingWeight" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="['1', '3', '4'].includes(formState.workType as string)">
        <a-form-item label="作业等级" :colon="false" name="workGrade">
          <a-select
            :disabled="readonly"
            v-model:value="formState.workGrade"
            :options="workGradeList[formState.workType]"
            :field-names="{ label: 'label', value: 'value' }"
            placeholder="请选择"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '2'">
        <a-form-item label="所属单位" :colon="false" name="affiliation">
          <a-tree-select
            :disabled="readonly"
            v-model:value="formState.affiliation"
            placeholder="请选择"
            :tree-data="applicationUnitList"
            showSearch
            tree-node-filter-prop="title"
            :field-names="{ label: 'title', value: 'key', children: 'children' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="!unhazardousWork">
        <a-form-item label="作业单位" :colon="false" name="workUnit">
          <a-tree-select
            :disabled="readonly"
            v-model:value="formState.workUnit"
            placeholder="请选择"
            :tree-data="applicationUnitList"
            showSearch
            tree-node-filter-prop="departName"
            :field-names="{ label: 'title', value: 'key', children: 'children' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="!unhazardousWork">
        <a-form-item label="生产单位" :colon="false" name="workOrgCode">
          <a-tree-select
            :disabled="readonly"
            v-model:value="formState.workOrgCode"
            placeholder="请选择"
            :tree-data="applicationUnitList"
            showSearch
            tree-node-filter-prop="title"
            :field-names="{ label: 'title', value: 'key', children: 'children' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="作业地点" :colon="false" name="workLocation">
          <a-input disabled type="input" :max-length="100" v-model:value="formState.workLocation" placeholder="请输入" />
        </a-form-item>
      </a-col>
      <template v-if="unhazardousWork">
        <a-col :span="12">
          <a-form-item label="是否管修分离" :colon="false" name="cardFlag">
            <a-radio-group disabled v-model:value="formState.cardFlag">
              <a-radio value="1">是</a-radio>
              <a-radio value="2">否</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="formState.cardFlag == '1'">
          <a-form-item label="维修事业部作业负责人" :colon="false" name="compiler">
            <JUserModal type="checkbox" disabled v-model:value="formState.compiler" placeholder="请选择" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="岗位工" name="postWorker">
            <JUserModal type="checkbox" disabled v-model:value="formState.postWorker" placeholder="请选择" />
          </a-form-item>
        </a-col>
      </template>
      <template v-if="formState.workType == '5'">
        <a-col :span="12">
          <a-form-item label="电源接入点" name="powerPoint">
            <a-input disabled type="input" :max-length="100" v-model:value="formState.powerPoint" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="工作电压" name="operatingVoltage">
            <a-input disabled type="input" :max-length="100" v-model:value="formState.operatingVoltage" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="用电设备功率" name="consumerInfo">
            <a-input disabled type="input" :max-length="100" v-model:value="formState.consumerInfo" placeholder="请输入" />
          </a-form-item>
        </a-col>
      </template>
      <a-col :span="12" v-if="formState.workType == '2'">
        <a-form-item label="有限空间名称" :colon="false" name="limitSpaceCode">
          <a-select
            placeholder="请选择"
            :show-arrow="false"
            v-model:value="formState.limitSpaceCode"
            showSearch
            :options="limitSpaceName"
            :filterOption="(input, option) => option.name.includes(input) || option.code.includes(input)"
            :field-names="{ label: 'label', value: 'code', options: 'children' }"
            :disabled="readonly"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '2'">
        <a-form-item label="原有介质" :colon="false" name="workLocation">
          <a-input type="input" disabled :maxLength="100" v-model:value="formState.limitSpaceOriginalMedium" placeholder="请输入" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="作业负责人" :colon="false" name="sceneHead">
          <JUserModal disabled type="checkbox" v-model:value="formState.sceneHead" placeholder="请选择" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '2'">
        <a-form-item label="救援人员" :colon="false" name="rescuers">
          <JUserModal disabled type="checkbox" v-model:value="formState.rescuers" placeholder="请选择" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="作业人员" :colon="false" name="operatorName">
          <a-input :disabled="readonly" readonly placeholder="请选择" v-model:value="formState.operatorName" @click="showSelectPerson" />
        </a-form-item>
        <a-form-item v-show="false" label="作业人员" :colon="false" name="operator">
          <a-input disabled placeholder="请选择" v-model:value="formState.operator" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '3'">
        <a-form-item label="作业证号" :colon="false" name="workIdNo">
          <a-input disabled readonly placeholder="请选择" v-model:value="formState.workIdNo" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="监护人" :colon="false" name="workUnitGuardian">
          <JUserModal disabled type="checkbox" v-model:value="formState.workUnitGuardian" placeholder="请选择" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="!unhazardousWork">
        <a-form-item label="安全措施确认人" :colon="false" name="securityMeasuresUser">
          <JUserModal disabled type="checkbox" v-model:value="formState.securityMeasuresUser" placeholder="请选择" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="作业时间" :colon="false" name="start">
          <a-range-picker
            v-model:value="formState.start"
            :placeholder="['年 月 日 时 分', '年 月 日 时 分']"
            show-time
            :disabledDate="disabledDate"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled="readonly"
          >
            <template #separator>至</template>
            <template #suffixIcon></template>
          </a-range-picker>
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '2'">
        <a-form-item label="四合一气体检测仪" :colon="false" name="applicationUnit">
          <a-input disabled type="input" :maxLength="100" v-model:value="formState.gasDetectorsName" placeholder="请输入" />
          <!-- <a-select
            disabled
            v-model:value="formState.applicationUnit"
            :options="applicantCompany"
            :field-names="{ label: 'departName', value: 'orgCode', options: '' }"
            placeholder="请选择"
          /> -->
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '3'">
        <a-form-item label="是否需要分析" :colon="false" name="cardFlag">
          <a-radio-group disabled v-model:value="formState.cardFlag">
            <a-radio value="1">是</a-radio>
            <a-radio value="2">否</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '4'">
        <a-form-item label="吊车车牌号" :colon="false" name="hoistingCode">
          <a-input disabled type="input" :maxLength="100" v-model:value="formState.hoistingCode" placeholder="请输入" />
        </a-form-item>
      </a-col>
      <template v-if="formState.workType == '4'">
        <a-col :span="12">
          <a-form-item label="特殊工种作业证号" :colon="false" name="hoistingIdNumber">
            <a-input disabled readonly placeholder="请选择" v-model:value="formState.hoistingIdNumber" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="司索指挥人" :colon="false" name="commanderPriest">
            <JUserModal disabled type="checkbox" v-model:value="formState.commanderPriest" placeholder="请选择" />
          </a-form-item>
        </a-col>
      </template>
      <a-col :span="12" v-if="formState.workType == '5'">
        <a-form-item label="电工证号" :colon="false" name="operatorName">
          <a-input disabled readonly placeholder="请选择" v-model:value="formState.operator" @click="showSelectPerson" />
        </a-form-item>
        <a-form-item v-show="false" label="电工证号" :colon="false" name="operator">
          <a-input disabled placeholder="请选择" v-model:value="formState.operator" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="高危作业施工方案" :colon="false" name="annexUrl">
          <JUpload ref="uploadRef" :maxCount="5" v-model:value="formState.annexUrl" text="上传附件" />
        </a-form-item>
      </a-col>
      <a-col :span="24" v-if="possibleDangerList && possibleDangerList.length > 0">
        <a-form-item label="风险辨识" :labelCol="{ span: 4 }" :wrapper-col="{ span: 20 }" :colon="false" name="possibleDanger">
          <a-checkbox-group @change="possibleChange" v-model:value="formState.possibleDanger" :disabled="readonly" :options="getPossibleDangerList(formState.applicationTimeStr)" />
          <a-form-item
            name="possibleDangers"
            style="margin-top: 15px"
            :rules="{
              validator: otherTxtvalidator,
              message: '请输入',
            }"
          >
            <my-input
              :disabled="!formState.possibleDanger.includes('其他伤害')"
              :type="readonly ? 'readonly' : 'input'"
              v-model.lazy="possibleDangerInput"
              :max-length="50"
              placeholder="请输入"
            />
          </a-form-item>
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item label="安全措施" :labelCol="{ span: 4 }" :wrapper-col="{ flex: 1, offset: 3 }" :colon="false" name="securityMeasuresIds">
          <a-table
            :columns="colum"
            :dataSource="formState.securityMeasuresIdList"
            :pagination="false"
            rowKey="sort"
            bordered
            :row-selection="{
              columnTitle: '是否涉及',
              columnWidth: 100,
              selectedRowKeys: formState.securityMeasuresIds,
              fixed: false,
              onChange: checkChange,
              getCheckboxProps: () => {
                return disabled ? { disabled: true } : {};
              },
            }"
          >
            <template #bodyCell="{ column, index, record }">
              <template v-if="column.dataIndex == 'id'">
                {{ index + 1 }}
              </template>
              <template v-if="column.dataIndex == 'annex'">
                <div style="text-align: left; display: flex; align-items: center" v-if="record.annex">
                  <template v-if="splitFile(record.annex).image && splitFile(record.annex).image.length">
                    <a-badge :count="splitFile(record.annex).image.length">
                      <img
                        :src="fmtImg1(splitFile(record.annex).image[0])"
                        style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
                        @click="openImg1(splitFile(record.annex).image)"
                      />
                    </a-badge>
                  </template>
                  <template v-if="splitFile(record.annex).video">
                    <div class="video-icon" :style="{marginLeft: !splitFile(record.annex).image.length ? 0 : '10px'}" v-for="item in splitFile(record.annex).video" :key="item" @click="videoPreview(item)">
                      <caret-right-outlined style="font-size: 30px; color: #1890ff" />
                    </div>
                  </template>
                </div>
              </template>
            </template>
          </a-table>
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item
          label="其他安全措施"
          :labelCol="{ span: 4, offset: 1 }"
          :wrapper-col="{ flex: 1, offset: 3 }"
          :colon="false"
          :title="formState.otherSecurityMeasures + otherSecurityMeasures"
          name="otherSecurityMeasures"
        >
          <div class="text-raea">
            {{ formState.otherSecurityMeasures }}
            <a-input
              style="width: 500px; margin: 0"
              placeholder="请输入补充其他安全措施"
              :disabled="disabled || ['7'].includes(formState.workType)"
              v-model:value="otherSecurityMeasures"
            />
          </div>
        </a-form-item>
        <a-form-item
          v-if="formState.otherSecurityMeasures || otherSecurityMeasures"
          label="其他安全措施附件"
          :labelCol="{ span: 4, offset: 1 }"
          :wrapper-col="{ flex: 1, offset: 3 }"
          :colon="false"
          :rules="[{ required: formState.otherSecurityMeasures || otherSecurityMeasures, message: '请上传附件' }]"
          name="otherSecurityMeasuresAnnex"
        >
          <JUpload :buttonVisible="false" disabled v-model:value="formState.otherSecurityMeasuresAnnex" text="上传附件" />
        </a-form-item>
      </a-col>
      <a-col :span="24" v-if="['6', '7'].includes(formState.workType as string)">
        <a-form-item
          label="现场防护设施准备情况"
          :labelCol="{ span: 4 }"
          :wrapper-col="{ flex: 1, offset: 3 }"
          :colon="false"
          name="securityMeasuresIds"
        >
          <a-table
            :columns="colum2"
            :dataSource="formState.protectiveEquipment"
            :pagination="false"
            rowKey="index"
            bordered
            :row-selection="{
              columnTitle: '是否涉及',
              columnWidth: 100,
              selectedRowKeys: formState.protectiveEquipment.map((item) => (item.selected == 1 ? item.index : '')),
              fixed: false,
              getCheckboxProps: () => {
                return readonly ? { disabled: true } : {};
              },
            }"
          >
            <template #bodyCell="{ column, index, record }">
              <template v-if="column.dataIndex === 'index'">
                {{ index + 1 }}
              </template>
              <template v-if="column.dataIndex === 'count'">
                <a-input v-model:value="record.count" />
              </template>
            </template>
          </a-table>
        </a-form-item>
      </a-col>
      <a-col :span="24" v-if="['6', '7'].includes(formState.workType as string)">
        <a-form-item label="操作步骤" :labelCol="{ span: 4 }" :wrapper-col="{ flex: 1, offset: 3 }" :colon="false" name="procedureIds">
          <a-table
            v-if="formState.workType == '6'"
            :columns="colum3"
            :dataSource="dataSauce3"
            :pagination="false"
            rowKey="index"
            bordered
            :row-selection="{
              columnTitle: '是否涉及',
              columnWidth: 100,
              selectedRowKeys: formState.procedure.map((item) => (item.selected == 1 ? item.index : '')),
              fixed: false,
              getCheckboxProps: () => {
                return readonly ? { disabled: true } : {};
              },
            }"
          >
            <template #bodyCell="{ column, index, record }">
              <template v-if="column.dataIndex === 'index'">
                {{ index + 1 }}
              </template>
            </template>
          </a-table>
          <a-table
            v-if="formState.workType == '7'"
            :columns="colum3"
            :dataSource="dataSauce4"
            :pagination="false"
            rowKey="index"
            bordered
            :row-selection="{
              columnTitle: '是否涉及',
              columnWidth: 100,
              selectedRowKeys: formState.procedure.map((item) => (item.selected == 1 ? item.index : '')),
              fixed: false,
              getCheckboxProps: () => {
                return readonly ? { disabled: true } : {};
              },
            }"
          >
            <template #bodyCell="{ column, index, record }">
              <template v-if="column.dataIndex === 'index'">
                {{ index + 1 }}
              </template>
            </template>
          </a-table>
        </a-form-item>
      </a-col>
    </a-row>

    <markModal @register="registerModal" />
  </a-form>
</template>

<script setup lang="ts" name="JobMessageDetail">
  import { computed, ref } from 'vue';
  import { getLimitSpace, jnRiskBasePicture, getWorkSecurityMeasuresByType } from '../api';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import MyInput from '../components/MyInput.vue';
  import type { selectOption } from '../type';
  import { possibleDanger } from '../workRequisition/hazardIdentification';
  import markModal from '../components/markModal.vue';
  import { useModal } from '/@/components/Modal';
  import { useContent } from '/@/views/hazardousOperation/workRequisition/hooks/useContent';
  import { usePublicData } from '/@/views/hazardousOperation/workRequisition/hooks/usePublicData';
  import { CaretRightOutlined } from '@ant-design/icons-vue';
  import { JUserModal } from '/@/components/Form';
  import { useRoute } from 'vue-router';
  import { createImgPreview } from '/@/components/Preview/index';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import type { FormInstance } from 'ant-design-vue';
  import { previewFile } from '/@/api/common/api';
  const route: any = useRoute();

  const unhazardousWork = computed(() => ['UnhazardousWork-jobManagement', 'UnhazardousWork-WorkRequisition'].includes(route.name));

  const { levelList, workGradeList, colum, colum2, colum3, possibleDangerList, getPossibleDangerList, dataSauce3, dataSauce4 } = usePublicData();
  const [registerModal, { openModal: openMarkdownModal }] = useModal();
  const formRef = ref<FormInstance>();
  const loading = ref(false);
  // 施工所在车间
  let applicantCompany = ref<selectOption[]>([]);
  const readonly = ref<boolean>(true);
  const props = defineProps<{
    workIndex: number;
    formState: any;
  }>();

  const formState = computed(() => {
    return props.formState;
  });
  const disabled = ref(readonly.value);

  let limitSpaceName = ref<selectOption[]>([]);
  const applicationUnitList = ref<any[]>([]);
  // 补充其他安全措施
  const otherSecurityMeasures = ref('');

  const possibleDangerOptions = ref<any[]>(possibleDanger['1']);
  const dataSauce = ref<any[]>([]);
  const pageInit = async () => {
    if (!formState.value.workType) return;
    if (!formState.value.securityMeasuresIdList || formState.value.securityMeasuresIdList.length == 0) {
      formState.value.securityMeasuresIdList = await getWorkSecurityMeasuresByType({ workType: formState.value.workType });
    }

    loading.value = false;
    const { applicationUnitList: list } = await useContent();
    applicationUnitList.value = list.value;
    const res = await getLimitSpace({ orgCode: formState.value.applicationUnit });
    limitSpaceName.value = res.map((v) => {
      return { label: `${v.name} (${v.code})`, value: v.code, ...v };
    });

    // 安全措施回显
    let securityMeasuresSelection: string | Array<string> = [];
    if (formState.value.workSecurityMeasuresList && formState.value.workSecurityMeasuresList.length > 0) {
      formState.value.workSecurityMeasuresList.forEach((item) => {
        if (item.selected === '0') {
          securityMeasuresSelection.push(item.sort);
        }
      });
      formState.value.securityMeasuresIds = securityMeasuresSelection;
    }

    formState.value.start = [formState.value.startTimeStr, formState.value.endTimeStr];
    possibleDangerOptions.value = possibleDanger[formState.value.workType];
    if (formState.value.possibleDanger?.indexOf('其他伤害') > -1) {
      possibleDangerInput.value = formState.value.possibleDanger.split(',').pop().split('-')[1];
    }

    if (formState.value.workCheck && formState.value.workCheck.confirmResult) {
      let arr = formState.value.workCheck.confirmResult.split(',');
      safetyDataSauce.value.forEach((val) => {
        val.head = formState.value.workCheck.head;
        if (arr.includes(val.sort)) val.check = '1';
      });
    }
  };

  const safetyDataSauce = ref<any[]>([
    { sort: '1', name: '作业负责人对实施作业的全体人员进行了安全交底。', check: '0', user: '' },
    { sort: '2', name: '作业现场已封闭，并设置了有限空间作业安全告知牌。', check: '0', user: '' },
    { sort: '3', name: '作业现场已配置作业安全防护设备设施和应急教援设备设施，数量和种类符合要求，经检查安全、可靠。', check: '0', user: '' },
    { sort: '4', name: '出人口已安全开启进行自然通风', check: '0', user: '' },
    { sort: '5', name: '存在可能危及有限空间作业安全的物料、能量及设备设施的，已采取可篇的隔离(隔断)措施。', check: '0', user: '' },
    { sort: '6', name: '已在作业前对有限空间内盛装或残留的物料进行了清空、清洗或置换。', check: '0', user: '' },
    { sort: '7', name: '严格执行先通风、再检测、后作业的原则，气体检测结果(见气体检测记录)已符合要求。', check: '0', user: '' },
    { sort: '8', name: '作业人已佩戴符合要求的个体防护装备。', check: '0', user: '' },
    { sort: '9', name: '其他安全防护措施', check: '0', user: '' },
  ]);

  //危险辨识
  const possibleDangerInput = computed({
    get: () => {
      return formState.value.possibleDangers || '';
    },
    set: (value: string) => {
      //@ts-ignore
      formState.value.possibleDangers = value;
      formState.value.possibleDanger = formState.value.possibleDanger || [];
    },
  });

  //安全措施
  const checkChange = (selectedRowKeys: any) => {
    formState.value.securityMeasuresIds = selectedRowKeys;
  };

  //表单重置
  const reset = () => {
    formState.value.workExamineNodeList = [];
    formState.value.securityMeasuresIdList = [];
    formState.value.protectiveEquipment = [];
    formState.value.procedure = [];
    formState.value.securityMeasuresIds = [];
    formState.value.protectiveEquipmentIds = [];
    formState.value.procedureIds = [];
    formRef.value?.resetFields();
  };

  function fmtImg1(url: string) {
    return getFileAccessHttpUrl(url);
  }
  function openImg1(list: string[]) {
    let imageList = list.map((i) => getFileAccessHttpUrl(i));
    createImgPreview({
      imageList: imageList,
      defaultWidth: 380,
      rememberState: true,
      scaleStep: 10,
    });
  }
  function splitFile(annex: string) {
    const image = annex.split(',').filter((i) => i.includes('.jpg') || i.includes('.png') || i.includes('.jpeg'));
    const video = annex.split(',').filter((i) => i.includes('.mp4') || i.includes('.mov') || i.includes('.avi'));
    return { image, video };
  }
  const videoPreview = (url: string) => {
    previewFile(url).then((res) => {
      window.open(res, '_blank');
    });
  };

  //暴露方法
  defineExpose({
    //重置表单
    reset,
    //回填表单
    pageInit,
  });
</script>

<style scoped lang="less">
  .my-form-item {
    margin: 0 !important;
  }
  .step-wrap {
    width: 100%;
    overflow: auto;
    margin-bottom: 16px;
  }
  .text-raea {
    vertical-align: middle;
    input {
      width: 120px;
      height: 32px;
      margin: 0 10px;
    }
  }
  .visitsList {
    > div {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .k {
      display: inline-block;
      height: 38px;
      width: 280px;
      border: 1px solid #ccc;
      line-height: 36px;
      padding-left: 15px;
      &:nth-child(2) {
        margin-left: 15px;
        text-overflow: ellipsis;
        overflow: hidden;
        word-break: break-all;
        white-space: nowrap;
      }
    }
  }
  .my-table {
    width: 100%;
    border-right: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
    text-align: center;
    margin-top: 16px;

    tr {
      border-left: 1px solid #f0f0f0;
      border-top: 1px solid #f0f0f0;
      td:nth-child(3),
      td:nth-child(1) {
        width: 18%;
      }
    }

    td {
      height: 42px;
      padding: 0px 15px;
      border-left: 1px solid #f0f0f0;
      border-top: 1px solid #f0f0f0;
    }
  }
  .modal-body {
    height: 80vh;
    overflow-y: auto;
  }
  .sign {
    border-top: 1px solid #ffffff;
    padding-top: 3px;
    img {
      max-height: 55px;
      margin-left: 16px;
      margin-top: 3px;
    }
    span {
      margin-left: 16px;
    }
  }
  .t-left {
    text-align: left;
  }
  .tdw {
    width: 220px;
  }
  .tdw15 {
    width: 150px !important;
  }
  .video-icon {
    width: 40px;
    height: 40px;
    text-align: center;
    line-height: 40px;
    color: #1890ff;
    cursor: pointer;
    border-radius: 5px;
    border: 1px solid #1890ff;
    margin-left: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
