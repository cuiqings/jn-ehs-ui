<template>
  <div>
    <BasicDrawer
      v-bind="$attrs"
      style="top: 5px; right: 5px; position: absolute"
      :bodyStyle="{ padding: '4px 10px' }"
      :footer="null"
      :width="1300"
      :maskClosable="false"
      title="作业详情"
      :loading="loading"
      @close="close"
      @register="register"
      :zIndex="5000"
    >
      <a-tabs v-model:activeKey="activeKey" type="card" :destroyInactiveTabPane="false">
        <a-tab-pane key="1" tab="作业信息" forceRender>
          <JobMessage
            v-for="(item, index) in workList"
            :key="index"
            :work-index="index"
            :formState="item"
            ref="jobMessageRef"
            @close="close"
            @refresh="refresh"
          />
        </a-tab-pane>
        <a-tab-pane key="2" tab="审批流程" forceRender>
          <examine-and-approve
            ref="ExamineAndApprove"
            :readonly="true"
            :viewEditData="formData"
            v-model:value="activeKey"
            @close="close"
            :title="formData.workType"
            @refresh="refresh"
          />
        </a-tab-pane>
        <a-tab-pane key="3" tab="安全作业检查" forceRender v-if="workCheckList.length > 0">
          <div class="zrr">责任人：{{ workList[0].sceneHeadName }}</div>
          <CheckDetail ref="checkDetailRef" :workCheckList="workCheckList" />
        </a-tab-pane>
      </a-tabs>
      <template v-if="workList[0].examineInfoList && workList[0].examineInfoList.length > 1 && activeKey == '1'">
        <a-row :span="24" v-for="item in workList[0].examineInfoList" :key="item.id">
          <a-col :span="24" v-for="item2 in item.examineInfoItemList" :key="item2.id">
            <a-row :span="24" v-if="item.nodeName == '安全交底(作业负责人)'">
              <a-col :span="24">
                <a-col :span="3" align="right"><div style="color: #1890ff">安全交底</div></a-col>
              </a-col>
              <a-col :span="24">
                <a-form-item :labelCol="{ span: 3 }" :colon="false" :wrapper-col="{ span: 21 }" label=" " name="securityMeasuresIds">
                  <table class="table-form" style="width: 100%">
                    <tr>
                      <td style="width: 120px">作业地点</td>
                      <td>
                        {{ workList[0].workLocation }}
                      </td>
                      <td style="width: 120px">作业时间</td>
                      <td> {{ workList[0].startTimeStr }} - {{ workList[0].endTimeStr }} </td>
                    </tr>
                    <tr>
                      <td style="width: 120px">作业内容</td>
                      <td> {{ workList[0].workContent }}</td>
                      <td style="width: 120px">作业类别</td>
                      <td> {{ getWorkName(workList) }}</td>
                    </tr>
                    <tr>
                      <td style="width: 120px">辨识单位</td>
                      <td>
                        <a-form-item>
                          <a-tree-select
                            disabled
                            style="width: 190px"
                            v-model:value="jiaodiFormState.identifyUnit"
                            placeholder="请选择"
                            :tree-data="applicationUnitList"
                            showSearch
                            tree-node-filter-prop="departName"
                            :field-names="{ label: 'title', value: 'key', children: 'children' }"
                          /> </a-form-item
                      ></td>
                      <td style="width: 120px">辨识人</td>
                      <td>
                        <a-form-item>
                          <JUserModal type="checkbox" disabled v-model:value="jiaodiFormState.identifyPerson" placeholder="请选择" />
                        </a-form-item>
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 120px">交底人</td>
                      <td>
                        <a-form-item>
                          <JUserModal
                            disabled
                            style="width: 190px"
                            type="checkbox"
                            v-model:value="workList[0].sceneHead"
                            placeholder="请选择"
                          /> </a-form-item
                      ></td>
                      <td style="width: 120px">交底时间</td>
                      <td> {{ jiaodiFormState.disclosureTime }}</td>
                    </tr>
                    <tr>
                      <td style="width: 120px">作业负责人</td>
                      <td>
                        <a-form-item
                          ><JUserModal
                            disabled
                            style="width: 190px"
                            type="checkbox"
                            v-model:value="workList[0].sceneHead"
                            placeholder="请选择"
                          /> </a-form-item
                      ></td>
                      <td style="width: 120px">监护人</td>
                      <td>
                        <a-form-item>
                          <JUserModal
                            disabled
                            style="width: 190px"
                            type="checkbox"
                            v-model:value="workList[0].workUnitGuardian"
                            placeholder="请选择"
                          /> </a-form-item
                      ></td>
                    </tr>
                    <tr>
                      <td style="width: 120px">基本要求</td>
                      <td colspan="3" style="text-align: left">
                        作业前，属地单位车问负责人应对能工作业人员进行安全交底和风险告知内容包括作业及作业环境、作业风险、防范指施(工艺、设备、个体防护等)应急措施及其他注意事项。作业人员应按照风险告知内容，逐条对接确认，落实到位后方可作业。
                      </td>
                    </tr>
                    <tr>
                      <td rowspan="5" style="width: 120px">安全交底内容</td>
                      <td colspan="3" style="text-align: left"> 使用主要设备工具：{{ jiaodiFormState.tool }} </td>
                    </tr>
                    <tr>
                      <td colspan="4" style="text-align: left">
                        <div> 可能导致的伤害类型及存在主要风险：{{ jiaodiFormState.damageType }} </div>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="4" style="text-align: left">
                        防范措施：{{ jiaodiFormState.measure }}
                        <!-- <a-textarea
                          v-model:value="jiaodiFormState.measure"
                          autosize
                          placeholder="Autosize height based on content lines"
                          auto-size
                        /> -->
                      </td>
                    </tr>
                    <tr>
                      <td colspan="4" style="text-align: left"> 应急措施：{{ jiaodiFormState.emergencyMeasure }} </td>
                    </tr>
                    <tr>
                      <td colspan="4" style="text-align: left"> 其他注意事项：{{ jiaodiFormState.other }} </td>
                    </tr>
                    <tr>
                      <td>风险辨识情况及管控落实情况小结</td>
                      <td colspan="3" style="text-align: left">
                        <div> 已开展全面风险辨识，共辨识作业风险 {{ jiaodiFormState.identifyNumber }} 项；管控据施已全部落实。 </div>
                      </td>
                    </tr>
                    <tr>
                      <td>辨识时间</td>
                      <td colspan="3" style="text-align: left">
                        <div> 自 {{ jiaodiFormState.identifyStartTime }} 分始至 {{ jiaodiFormState.identifyEndTime }} 分止</div>
                      </td>
                    </tr>
                    <tr>
                      <td>风险及管控措施告知(被交底人签字)</td>
                      <td colspan="3" style="text-align: left"> 我已熟知此次作业存在的安全风险及管控指施，将严格道章作业，确保安全。 </td>
                    </tr>
                    <tr>
                      <td>上传附件</td>
                      <td colspan="3" style="text-align: left">
                        <JUpload ref="uploadRef" :maxCount="1" v-model:value="jiaodiFormState.annexUrl" text="上传附件" />
                      </td>
                    </tr>
                  </table>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item :labelCol="{ span: 3 }" :wrapper-col="{ span: 21 }" label="作业负责人">
                  <div class="flex sign">
                    {{ item2.operatorName }} <img :src="getFileAccessHttpUrl(item2.sign)" alt="" /> <span>{{ item2.createTime }}</span>
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row v-if="item.nodeName == '接受交底'">
              <a-col :span="24">
                <a-form-item :labelCol="{ span: 3 }" :wrapper-col="{ span: 21 }" label="作业人员">
                  <div class="flex sign"> {{ item2.operatorName }} <img :src="getFileAccessHttpUrl(item2.sign)" alt="" /> </div>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :span="24" v-if="item.nodeName == '作业前安全检查(现场监护人)'">
              <a-col :span="24">
                <a-col :span="3" align="right"><div style="color: #1890ff">安全检查</div></a-col>
                <a-form-item :labelCol="{ span: 3 }" :wrapper-col="{ span: 21, offset: 3 }">
                  <table class="my-table">
                    <tr
                      ><td>有限空间名称</td><td class="t-left">{{ workList.limitSpaceName }}</td
                      ><td class="tdw15">作业分级</td
                      ><td class="t-left tdw">{{ { 1: '一级', 2: '二级', 3: '三级', 4: '特级' }[workList.workGrade] }}</td></tr
                    >
                    <tr
                      ><td>作业车间</td><td class="t-left">{{ workList.workUnitName }}</td
                      ><td class="tdw15">作业班组</td><td class="t-left tdw">{{ workList.workTeamName }}</td></tr
                    >
                    <tr
                      ><td>作业内容</td><td class="t-left">{{ workList.workContent }}</td></tr
                    >
                    <tr
                      ><td>作业人员</td><td class="t-left">{{ workList.operatorName }}</td
                      ><td class="tdw15">作业负责人</td><td class="t-left tdw">{{ workList.sceneHeadName }}</td></tr
                    >
                    <tr
                      ><td>监护人员</td><td class="t-left">{{ workList.workUnitGuardianName }}</td
                      ><td class="tdw15">其他人员</td
                      ><td class="t-left">
                        <a-form-item style="margin: 0; padding: 0" :colon="false" name="otherHead">
                          <a-input disabled v-model:value="workList.workCheck.otherHead" />
                        </a-form-item> </td
                    ></tr>
                    <tr
                      ><td>实际实施作业时间</td><td class="t-left">{{ workList.workTime }}</td></tr
                    >
                  </table>
                  <a-table :columns="colum2" :dataSource="safetyDataSauce" :pagination="false" rowKey="sort" bordered>
                    <template #bodyCell="{ column, index, record }">
                      <template v-if="column.dataIndex === 'check'">
                        <a-radio-group disabled v-model:value="record.check">
                          <a-radio value="1">是</a-radio>
                          <a-radio value="0">否</a-radio>
                        </a-radio-group>
                      </template>
                      <template v-if="column.dataIndex === 'name' && index == 8">
                        <a-form-item
                          :labelCol="{ span: 5 }"
                          label-align="left"
                          style="margin: 0; padding: 0"
                          :label="record.name"
                          :colon="false"
                          name="operatorName"
                        >
                          <a-input disabled v-model:value="workList.workCheck.otherSecurityMeasures" />
                        </a-form-item>
                      </template>
                    </template>
                  </a-table>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item :labelCol="{ span: 3 }" :wrapper-col="{ span: 21 }" label="现场监护人">
                  <div class="flex sign">
                    {{ item2.operatorName }} <img :src="getFileAccessHttpUrl(item2.sign)" alt="" /> <span>{{ item2.createTime }}</span>
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
        <a-row :span="24">
          <a-col :span="24" v-if="kjList.length > 0">
            <a-col :span="3" align="right"><div style="color: #1890ff">气体检测分析</div></a-col>
            <a-form-item :labelCol="{ span: 3 }" :wrapper-col="{ span: 21, offset: 3 }">
              <a-table :columns="colum4" :dataSource="kjList" :pagination="false" rowKey="sort" bordered style="width: 100%">
                <template #bodyCell="{ column, index, record }">
                  <template v-if="column.dataIndex === 'index'">
                    {{ index + 1 }}
                  </template>
                  <template v-if="column.dataIndex === 'toxicHarmfulMedia'">
                    {{ record.toxicHarmfulMedia }}<span style="word-break: keep-all">(ppm)</span>
                  </template>
                  <template v-if="column.dataIndex === 'carbonMonoxide'">
                    {{ record.carbonMonoxide }}<span style="word-break: keep-all">(ppm)</span></template
                  >
                  <template v-if="column.dataIndex === 'otherGas'">
                    {{ record.otherGas }}<span style="word-break: keep-all">({{ record.otherGasUnit }})</span></template
                  >
                  <template v-if="column.dataIndex === 'oxygenContent'"
                    >{{ record.oxygenContent }}<span style="word-break: keep-all">(%)</span></template
                  >
                  <template v-if="column.dataIndex === 'gas'">{{ record.gas }}<span style="word-break: keep-all">(%LEL)</span></template>
                  <template v-if="column.dataIndex === 'analyst'">
                    <img v-if="record.sign" class="al-sign" :src="getFileAccessHttpUrl(record.sign)" />
                    <span v-else>{{ record.analyst }}</span>
                  </template>
                </template>
              </a-table>
            </a-form-item>
          </a-col>
          <a-col :span="24" v-if="dhList.length > 0">
            <a-col :span="3" align="right"><div style="color: #1890ff">动火分析</div></a-col>
            <a-form-item :labelCol="{ span: 3 }" :wrapper-col="{ span: 21, offset: 3 }">
              <a-table :columns="colum5" :dataSource="dhList" :pagination="false" rowKey="sort" bordered style="width: 100%">
                <template #bodyCell="{ column, index, record }">
                  <template v-if="column.dataIndex === 'toxicHarmfulMedia'">
                    {{ record.toxicHarmfulMedia }}<span style="word-break: keep-all">({{ record.toxicHarmfulMediaUnit }})</span>
                  </template>
                  <template v-if="column.dataIndex === 'carbonMonoxide'">
                    {{ record.carbonMonoxide }}<span style="word-break: keep-all">({{ record.carbonMonoxideUnit }})</span></template
                  >
                  <template v-if="column.dataIndex === 'otherGas'">
                    {{ record.otherGas }}<span style="word-break: keep-all">({{ record.otherGasUnit }})</span></template
                  >
                  <template v-if="column.dataIndex === 'oxygenContent'"
                    >{{ record.oxygenContent }}<span style="word-break: keep-all">(%)</span></template
                  >
                  <template v-if="column.dataIndex === 'gas'">{{ record.gas }}<span style="word-break: keep-all">(%LEL)</span></template>
                  <template v-if="column.dataIndex === 'analysisData'">{{ record.analysisData }}<span style="word-break: keep-all"> (ppm)</span></template>
                  <template v-if="column.dataIndex === 'analyst'">
                    <img v-if="record.sign" class="al-sign" :src="getFileAccessHttpUrl(record.sign)" />
                    <span v-else>{{ record.analyst }}</span>
                  </template>
                </template>
              </a-table>
            </a-form-item>
          </a-col>
          <a-col :span="24" v-if="workList[0].accessSpaceList && workList[0].accessSpaceList.length > 0">
            <a-col :span="3" align="right"><div style="color: #1890ff">进出有限空间作业登记表</div></a-col>
            <a-form-item :labelCol="{ span: 3 }" :wrapper-col="{ span: 21, offset: 3 }">
              <a-table :columns="colum6" :dataSource="workList[0].accessSpaceList" :pagination="false" rowKey="sort" bordered style="width: 100%">
                <template #bodyCell="{ column, index, record }">
                  <template v-if="column.dataIndex === 'index'">
                    {{ index + 1 }}
                  </template>
                  <template v-if="column.dataIndex === 'inSign'">
                    <img class="signimg" :src="getFileAccessHttpUrl(record.inSign)" alt="" />
                  </template>
                  <template v-if="column.dataIndex === 'outSign'">
                    <img class="signimg" :src="getFileAccessHttpUrl(record.outSign)" alt="" />
                  </template>
                  <template v-if="column.dataIndex === 'inSignConfirm'">
                    <img class="signimg" :src="getFileAccessHttpUrl(record.inSignConfirm)" alt="" />
                  </template>
                </template>
              </a-table>
            </a-form-item>
          </a-col>
          <a-col :span="24" v-if="workList[0].procedureList && workList[0].procedureList.length > 0">
            <a-col :span="3" align="right"><div style="color: #1890ff">操作步骤完成情况</div></a-col>
            <a-form-item :labelCol="{ span: 3 }" :wrapper-col="{ span: 21, offset: 3 }">
              <a-table :columns="colum7" :dataSource="workList[0].procedureList" :pagination="false" rowKey="sort" bordered style="width: 100%">
                <template #bodyCell="{ column, index, record }">
                  <template v-if="column.dataIndex === 'index'">
                    {{ index + 1 }}
                  </template>
                  <template v-if="column.dataIndex === 'finishStatus'"> 完成 </template>
                  <template v-if="column.dataIndex === 'outSign'">
                    <img class="signimg" :src="getFileAccessHttpUrl(record.outSign)" alt="" />
                  </template>
                  <template v-if="column.dataIndex === 'inSignConfirm'">
                    <img class="signimg" :src="getFileAccessHttpUrl(record.inSignConfirm)" alt="" />
                  </template>
                </template>
              </a-table>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :span="24" v-if="workList[0].workRecordList">
          <a-col :span="24">
            <a-col :span="3" align="right"><div style="color: #1890ff">作业记录</div></a-col>
            <a-form-item :labelCol="{ span: 3 }" :wrapper-col="{ span: 21, offset: 3 }">
              <a-steps progress-dot direction="vertical" size="default">
                <a-step v-for="(item, idx) in workList[0].workRecordList" :status="idx == 0 ? 'finish' : 'wait'" :key="item.sort">
                  <!-- <template #title>
                  <span :style="{ color: item.state == '0' ? 'blue' : '' }">{{ item.node }}</span>
                </template> -->
                  <!-- <template #subTitle>
                  <span :style="{ color: item.state == '0' ? 'blue' : '' }">{{ item.nodeOperator }}</span>
                </template> -->
                  <template #description>
                    <span :style="{ color: 'blue' }"> {{ item.operateHead }} {{ item.operateTime }} {{ item.content }} </span>
                  </template>
                </a-step>
              </a-steps>
            </a-form-item>
          </a-col>
        </a-row>
      </template>
    </BasicDrawer>
  </div>
</template>

<script setup lang="ts">
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { ref, computed, nextTick } from 'vue';
  import JobMessage from './JobMessage.vue';
  import examineAndApprove from './examineAndApprove.vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { getWorkDetail, getWorkJobWorkDetail, getWorkCheckList } from '../api';
  import { useWorkStore } from '/@/store/modules/dangerousWork';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useDepartList } from '../hooks/useDepartList';
  import CheckDetail from './checkDetail.vue';
  import { usePublicData } from './hooks/usePublicData';
  import { JUserModal } from '/@/components/Form';
  import { getWorkName } from '../utils';

  const workStore = useWorkStore();
  const workList = computed(() => workStore.getWorkList);
  const applicationUnitList = ref<any[]>([]);
  const emit = defineEmits(['renewal']);
  const loading = ref(false);
  const jobMessageRef = ref();
  const ExamineAndApprove = ref();
  const activeKey = ref('1');
  const readonly = ref(false);
  const pageType = ref('');
  const formData = ref<any>({});
  const workCheckList = ref<any[]>([]);
  const checkDetailRef = ref<any>();
  const { colum4, colum5, colum6, colum7 } = usePublicData();

  const jiaodiFormState = ref<any>({});
  const [register] = useDrawerInner(async (data) => {
    loading.value = true;
    readonly.value = data.readOnly;
    pageType.value = data.pageType;
    const res = await getWorkDetail(data.id);
    const workExamineInfo = await getWorkJobWorkDetail(data.id);
    formData.value = res;
    workStore.setWorkList([initItem(res)]);
    if (res.otherWorkApply && res.otherWorkApply.length > 0) {
      res.otherWorkApply.forEach((item) => {
        workStore.updateWorkList(initItem(item));
      });
    }
    analysisDataSplit(workList.value);
    jiaodiFormState.value = workList.value[0].safetyDisclosureContent;
    const { applicationUnitList: list } = await useDepartList();
    applicationUnitList.value = list.value;
    getWorkCheckList({ workApplyId: data.id }).then((res) => {
      workCheckList.value = res;
      nextTick(() => {
        if (res && res.length > 0) {
          checkDetailRef.value.pageInit(res);
        }
      });
    });
    loading.value = false;
    nextTick(() => {
      ExamineAndApprove.value.pageInit(res, workExamineInfo);
      jobMessageRef.value.map((item) => {
        item.pageInit();
      });
    });
  });
  const dhList = ref<any[]>([]);
  const kjList = ref<any[]>([]);
  // 多个作业处理分析逻辑
  function analysisDataSplit(data) {
    // if(data.length == 1) return;
    let donghuo: any[] = [];
    let kongjiian: any[] = [];
    if (data[0].workAnalysisList && data[0].workAnalysisList.length > 0) {
      data[0].workAnalysisList.forEach((item) => {
        if (item.analysisData) {
          donghuo.push(item);
        } else {
          kongjiian.push(item);
        }
      });
      dhList.value = donghuo;
      kjList.value = kongjiian;
    } else {
      dhList.value = [];
      kjList.value = [];
    }
  }

  const close = () => {
    activeKey.value = '1';
    workStore.resetWorkList();
    jobMessageRef.value.map((item) => {
      item.reset();
    });
  };

  function initItem(item) {
    let possibleDangers = '';
    const possibleDanger = item.possibleDanger?.split(',').map((item) => {
      if (item.includes('其他伤害')) {
        possibleDangers = item.split('-')[1];
        return item.split('-')[0];
      }
      if (item === '其他') {
        possibleDangers = item.split('-')[1];
        return item.split('-')[0];
      }
      return item;
    });
    item.possibleDanger = possibleDanger;
    item.possibleDangers = possibleDangers;
    item.start = [item.startTimeStr, item.endTimeStr];
    item.securityMeasuresIds = item.securityMeasuresIds?.split(',');
    item.workAnalysis = item.workAnalysisList;
    item.examineInfoList = item.examineInfoList && item.examineInfoList.length > 0 ? item.examineInfoList : [];
    item.reviewComments = '';
    item.operateMethod = item.operateMethod?.split(',');
    item.hoistingIdNumber = item.hoistingIdNumber?.split(',');
    item.hoistingCommander = item.hoistingCommander?.split(','); //@ts-ignore
    return item;
  }

  const refresh = () => {
    emit('renewal');
  };

  // 是否展示气体分析
  const showAnalysis = () => {
    let show = false;
    if (workList.value[0].workAnalysisList && workList.value[0].workAnalysisList.length > 0) {
      show = true;
    }
    return show;
  };
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
  .table-form {
    border: 1px solid #e5e7eb;
    border-collapse: collapse;
    text-align: center;
    tr {
      height: 40px;
      td:nth-child(1),
      td:nth-child(3) {
        width: 240px;
      }
    }
    td {
      padding: 0 10px;
      border: 1px solid #e5e7eb;
      div {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }
    :deep(.ant-form-item) {
      margin-bottom: 0;
    }
    :deep(.ant-row) {
    }
    :deep(.ant-input) {
      border-top: none;
      border-left: none;
      border-right: none;
    }
    :deep(.ant-input:focus) {
      border-top: none;
      border-left: none;
      border-right: none;
      box-shadow: none;
    }
  }
  .signimg {
    width: 90px;
    height: auto;
  }
  .al-sign{
    height: 45px !important;
    margin: auto;
  }
  .zrr{
    padding-left: 15px;
    font-weight: 500;
  }
</style>
