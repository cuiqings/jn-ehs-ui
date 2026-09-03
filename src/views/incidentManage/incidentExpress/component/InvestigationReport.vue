<template>
  <div class="investigationReport" v-if="type !== 'view'">
    <a-radio-group v-model:value="radioValue" name="radioGroup" v-if="type !== 'view'">
      <a-radio value="1">在线填写</a-radio>
      <a-radio value="2">报告上传</a-radio>
    </a-radio-group>
    <div class="investigationReport-content" v-if="radioValue === '1'">
      <div style="text-align: center; font-size: 18px">
        <a-input
          v-model:value="reviewInfo.name"
          style="width: 300px; text-align: right; font-size: 18px"
          :maxlength="50"
          placeholder="请输入"
        />事故调查报告
      </div>
      <h3>一、事故基本情况</h3>
      <a-row type="flex" :gutter="[0, 24]" class="investigationReport-content-row">
        <a-col :sm="3" align="left" class="investigationReport-content_label">事故发生单位： </a-col>
        <a-col :sm="21">
          <api-select
            v-model:value="reviewInfo.orgCode"
            style="width: 100%"
            :api="getOrganizationNew"
            label-field="departName"
            value-field="orgCode"
            placeholder="请选择"
          />
        </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]" class="investigationReport-content-row">
        <a-col :sm="3" align="left" class="investigationReport-content_label">事故发生地点： </a-col>
        <a-col :sm="21">
          <a-input v-model:value="reviewInfo.address" :maxlength="100" placeholder="请输入" />
        </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]" class="investigationReport-content-row">
        <a-col :sm="3" align="left" class="investigationReport-content_label">事故发生时间： </a-col>
        <a-col :sm="21">
          <a-date-picker
            v-model:value="reviewInfo.eventTime"
            :show-time="{ format: 'HH:mm' }"
            style="width: 100%"
            valueFormat="YYYY-MM-DD HH:mm"
            :disabledDate="disabledDate"
            placeholder="请选择"
          />
        </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]" class="investigationReport-content-row">
        <a-col :sm="3" align="left" class="investigationReport-content_label">事件类型： </a-col>
        <a-col :sm="21">
          <j-dict-select-tag
            v-model:value="reviewInfo.type"
            style="width: 100%"
            dictCode="event_type"
            :show-choose-option="false"
            placeholder="请选择"
            :string-to-number="false"
          />
        </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]" class="investigationReport-content-row">
        <a-col :sm="3" align="left" class="investigationReport-content_label">事件原因： </a-col>
        <a-col :sm="21">
          <a-textarea v-model:value="reviewInfo.reason" placeholder="请输入" :maxlength="500" :rows="5" />
        </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]" class="investigationReport-content-row">
        <a-col :sm="3" align="left" class="investigationReport-content_label">事故伤害程度： </a-col>
        <a-col :sm="21">
          <a-input v-model:value="reviewInfo.injurySeverity" placeholder="请输入" :maxlength="50" />
        </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]" class="investigationReport-content-row">
        <a-col :sm="3" align="left" class="investigationReport-content_label">伤亡人员情况： </a-col>
        <a-col :sm="21">
          <a-table bordered :pagination="false" :data-source="reviewInfo.peopleInfo" :columns="columns">
            <template #name="{ record }">
              <a-input v-model:value="record.name" placeholder="请输入" :maxlength="10" />
            </template>
            <template #sex="{ record }">
              <j-dict-select-tag
                v-model:value="record.sex"
                style="width: 100%"
                dictCode="sex"
                :show-choose-option="false"
                placeholder="请选择"
                :string-to-number="false"
              />
            </template>
            <template #age="{ record }">
              <a-input-number v-model:value="record.age" :min="1" :precision="0" :max="999" placeholder="请输入" />
            </template>
            <template #lengthOfService="{ record }">
              <a-input-number v-model:value="record.lengthOfService" :min="1" :precision="0" :max="999" placeholder="请输入" />
            </template>
            <template #post="{ record }">
              <a-input v-model:value="record.post" placeholder="请输入" :maxlength="10" />
            </template>
            <template #days="{ record }">
              <a-input-number v-model:value="record.days" :min="0" :precision="1" :max="9999" placeholder="请输入" @blur="onBlur" />
            </template>
            <template #nature="{ record }">
              <a-input v-model:value="record.nature" placeholder="请输入" :maxlength="10" />
            </template>
            <template #operation="{ index }">
              <span style="color: #1890ff; padding: 5px; cursor: pointer; font-size: 16px" @click="handleAdd(index)">+</span>
              <span style="color: red; padding: 5px; cursor: pointer; font-size: 16px" v-if="index !== 0" @click="onDelete(index)">-</span>
            </template>
          </a-table>
        </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]" class="investigationReport-content-row">
        <a-col :sm="3" align="left" class="investigationReport-content_label">损失工作日总数： </a-col>
        <a-col :sm="21">
          <a-input-number v-model:value="reviewInfo.lostWorkday" disabled :min="0" :precision="1" style="width: 100%" placeholder="请输入">
            <template #addonAfter>天</template>
          </a-input-number>
        </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]" class="investigationReport-content-row">
        <a-col :sm="3" align="left" class="investigationReport-content_label">事故经济损失： </a-col>
        <a-col :sm="21">
          <a-input-number
            v-model:value="reviewInfo.economicLosses"
            :min="0"
            :precision="2"
            :max="9999999999"
            style="width: 100%"
            placeholder="请输入"
          >
            <template #addonAfter>元</template>
          </a-input-number>
        </a-col>
      </a-row>
      <h3>二、事故详细经过</h3>
      <a-row type="flex" :gutter="[0, 24]" class="investigationReport-content-row">
        <a-col :sm="3" align="left" class="investigationReport-content_label" />
        <a-col :sm="21">
          <a-textarea v-model:value="reviewInfo.detailedPassage" placeholder="请输入" :maxlength="500" :rows="5" />
        </a-col>
      </a-row>
      <h3>三、事故原因分析</h3>
      <a-row type="flex" :gutter="[0, 24]" class="investigationReport-content-row">
        <a-col :sm="3" align="left" class="investigationReport-content_label">直接原因： </a-col>
        <a-col :sm="21">
          <JEditor v-model:value="reviewInfo.directReason" />
        </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]" class="investigationReport-content-row">
        <a-col :sm="3" align="left" class="investigationReport-content_label">间接原因： </a-col>
        <a-col :sm="21">
          <JEditor v-model:value="reviewInfo.indirectReason" />
        </a-col>
      </a-row>
      <a-row type="flex" :gutter="[0, 24]" class="investigationReport-content-row">
        <a-col :sm="3" align="left" class="investigationReport-content_label">风险研判： </a-col>
        <a-col :sm="21">
          <a-table bordered :pagination="false" :data-source="reviewInfo.riskJudge" :columns="columns1">
            <template #riskType="{ record }">
              <a-input v-model:value="record.riskType" placeholder="请输入" />
              <!-- <j-dict-select-tag v-model:value="record.name" style="width: 100%" dictCode="sex" placeholder="请选择" :string-to-number="false" /> -->
            </template>
            <template #area="{ record }">
              <a-input v-model:value="record.area" :maxlength="50" placeholder="请输入" />
              <!-- <j-dict-select-tag v-model:value="record.name2" style="width: 100%" dictCode="sex" placeholder="请选择" :string-to-number="false" /> -->
            </template>
            <template #activity="{ record }">
              <a-input v-model:value="record.activity" :maxlength="200" placeholder="请输入" />
              <!-- <j-dict-select-tag v-model:value="record.name3" style="width: 100%" dictCode="sex" placeholder="请选择" :string-to-number="false" /> -->
            </template>
            <template #step="{ record }">
              <a-input v-model:value="record.step" :maxlength="200" placeholder="请输入" />
              <!-- <j-dict-select-tag v-model:value="record.name4" style="width: 100%" dictCode="sex" placeholder="请选择" :string-to-number="false" /> -->
            </template>
            <template #dangerousEvent="{ record }">
              <a-input v-model:value="record.dangerousEvent" :maxlength="200" placeholder="请输入" />
            </template>
            <template #operation="{ index }">
              <span style="color: #1890ff; padding: 5px; cursor: pointer; font-size: 16px" @click="handleAdd1(index)">+</span>
              <span style="color: red; padding: 5px; cursor: pointer; font-size: 16px" v-if="index !== 0" @click="onDelete1(index)">-</span>
            </template>
          </a-table>
        </a-col>
      </a-row>
      <h3>四、事故责任处置</h3>
      <a-row type="flex" :gutter="[0, 24]" class="investigationReport-content-row">
        <a-col :sm="3" align="left" class="investigationReport-content_label" />
        <a-col :sm="21">
          <a-table bordered :pagination="false" :data-source="reviewInfo.dutyDispose" :columns="columns2">
            <template #accidentRespPeople="{ record }">
              <a-input v-model:value="record.accidentRespPeople" placeholder="请输入" :maxlength="10" />
            </template>
            <template #resp="{ record }">
              <j-dict-select-tag
                v-model:value="record.resp"
                style="width: 100%"
                dictCode="event_resp_type"
                placeholder="请选择"
                :string-to-number="false"
                :show-choose-option="false"
              />
            </template>
            <template #disposalOpinions="{ record }">
              <a-input v-model:value="record.disposalOpinions" placeholder="请输入" :maxlength="500" />
            </template>
            <template #operation="{ index }">
              <span style="color: #1890ff; padding: 5px; cursor: pointer; font-size: 16px" @click="handleAdd2(index)">+</span>
              <span style="color: red; padding: 5px; cursor: pointer; font-size: 16px" v-if="index !== 0" @click="onDelete2(index)">-</span>
            </template>
          </a-table>
        </a-col>
      </a-row>
      <h3>五、预防事故重复发生的措施</h3>
      <a-row type="flex" :gutter="[0, 24]" class="investigationReport-content-row">
        <a-col :sm="3" align="left" class="investigationReport-content_label" />
        <a-col :sm="21">
          <a-textarea v-model:value="reviewInfo.precaution" placeholder="请输入" :maxlength="800" :rows="5" />
        </a-col>
      </a-row>
    </div>
    <div class="investigationReport-content" v-if="radioValue === '2'">
      <div>
        <a-row type="flex" :gutter="[0, 24]">
          <a-col :sm="20" align="left" class="investigationReport-content_label">
            <customize-upload lable="调查报告" v-model:value="reviewInfo.reportFile" text-require :max-count="1" accept=".pdf,.docx,.doc,.xls,.xlsx"
          /></a-col>
          <a-col :sm="4" align="right" class="investigationReport-content_label">
            <span style="color: #02a7f0; text-decoration: underline; cursor: pointer; line-height: 35px" @click="download">调查报告模板下载</span>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
  <div :class="menuType !== 'query' ? 'investigationReport' : ''" :id="id" v-else>
    <div :class="isType === 'pc' ? 'investigationReport-content' : ''" v-if="radioValue === '1'">
      <div style="text-align: center; font-size: 18px" v-if="menuType !== 'query'"> {{ reviewInfo.name }}事故调查报告 </div>
      <div style="text-align: center; font-size: 18px" v-else> {{ reviewInfo.name + '事件' }} </div>
      <h3>一、事故基本情况</h3>
      <div class="report_text">事故发生单位：{{ reviewInfo.orgCode_dictText }}</div>
      <div class="report_text">事故发生地点：{{ reviewInfo.address }}</div>
      <div class="report_text">事故发生时间：{{ reviewInfo.eventTime }}</div>
      <div class="report_text">事件类型：{{ renderDict(reviewInfo.type, 'event_type') }}</div>
      <div class="report_text">事件原因：{{ reviewInfo.reason }}</div>
      <div class="report_text">事故伤害程度：{{ reviewInfo.injurySeverity }}</div>
      <div class="report_text">
        伤亡人员情况：
        <div class="report_text">
          <a-table v-if="isType === 'pc'" bordered :pagination="false" :data-source="reviewInfo.peopleInfo" :columns="columns">
            <template #sex="{ record }">
              {{ renderDict(record.sex, 'sex') }}
            </template>
          </a-table>
          <template v-else>
            <div v-for="(item, index) in reviewInfo.peopleInfo" :key="index" class="peopleInfo">
              <span>{{ item.name }}</span
              ><span>，{{ renderDict(item.sex, 'sex') }}</span
              ><span v-if="item.age !== ''">，{{ item.age }}</span
              ><span v-if="item.lengthOfService !== ''">，工龄{{ item.lengthOfService }}年</span><span v-if="item.post !== ''">，{{ item.post }}</span
              ><span v-if="item.days !== ''">，歇工{{ item.days }}天</span><span v-if="item.nature !== ''">，{{ item.nature }}</span>
            </div>
          </template>
        </div>
      </div>
      <div class="report_text">损失工作日总数：{{ reviewInfo.lostWorkday }}日</div>
      <div class="report_text">事故经济损失：{{ reviewInfo.economicLosses }}元</div>
      <h3>二、事故详细经过</h3>
      <div class="report_text">{{ reviewInfo.detailedPassage }}</div>
      <div class="whole-node">
        <h3>三、事故原因分析</h3>
        <div class="report_text"
          >直接原因：
          <div v-html="reviewInfo.directReason" class="html_css"></div>
        </div>
      </div>
      <div class="report_text whole-node"
        >间接原因：
        <div v-html="reviewInfo.indirectReason" class="html_css"></div>
      </div>
      <div class="report_text whole-node">
        风险研判：
        <div class="report_text">
          <div v-for="(item, index) in reviewInfo.riskJudge" :key="index" class="peopleInfo">
            {{ item.riskType }}&nbsp;>&nbsp;{{ item.area }}&nbsp;>&nbsp;{{ item.activity }}&nbsp;>&nbsp;{{ item.step }}&nbsp;>&nbsp;{{
              item.dangerousEvent
            }}
          </div>
        </div>
      </div>
      <div class="whole-node">
        <h3>四、事故责任处置</h3>
        <div class="report_text">
          <a-table v-if="isType === 'pc'" bordered :pagination="false" :data-source="reviewInfo.dutyDispose" :columns="columns2">
            <template #resp="{ record }">
              {{ renderDict(record.resp, 'event_resp_type') }}
            </template>
          </a-table>
          <template v-else>
            <div v-for="(item, index) in reviewInfo.dutyDispose" :key="index" class="peopleInfo">
              <div style="display: flex; justify-content: space-between"
                ><span>事故责任人：{{ item.accidentRespPeople }}</span
                ><span style="padding-right: 10px">{{ renderDict(item.resp, 'event_resp_type') }}</span></div
              >
              <div>处理意见：</div>
              <div>{{ item.disposalOpinions }}</div>
            </div>
          </template>
        </div>
      </div>
      <div class="whole-node">
        <h3>五、预防事故重复发生的措施</h3>
        <div class="report_text">{{ reviewInfo.precaution }}</div>
      </div>
    </div>
    <div :class="isType === 'pc' ? 'investigationReport-content' : ''" v-if="radioValue === '2'">
      <customize-upload lable="调查报告" v-model:value="reviewInfo.reportFile" type="view" :max-count="1" accept=".pdf,.docx" />
    </div>
  </div>
</template>
<script lang="ts" name="Investigation-report" setup>
  import CustomizeUpload from './CustomizeUpload.vue';
  import { JDictSelectTag, ApiSelect, JEditor } from '/@/components/Form';
  import { ref, watch, reactive, watchEffect } from 'vue';
  import { getOrganizationNew } from '../url/index';
  import { getDictItemsByCode } from '/@/utils/dict/index';
  import { useGlobSetting } from '/@/hooks/setting';
  const globSetting = useGlobSetting();
  const baseApiUrl = globSetting.domainUrl;
  const props = defineProps({
    type: {
      type: String,
      default: 'add',
    },
    id: {
      type: String,
      default: '',
    },
    cardObject: {
      type: Object,
      required: true,
    },
    isType: {
      type: String,
      default: 'pc',
    },
    menuType: {
      type: String,
      default: '',
    },
  });
  const emit = defineEmits(['dataObj']);
  const reviewInfo = reactive({
    eventId: '',
    reportFile: '', // 事件报告file
    name: '',
    orgCode: undefined,
    orgCode_dictText: '',
    address: '',
    eventTime: undefined,
    type: undefined,
    reason: '',
    injurySeverity: '',
    peopleInfo: [
      {
        name: '',
        sex: undefined,
        age: '',
        lengthOfService: '',
        post: '',
        days: '',
        nature: '',
      },
    ], // 伤亡人员情况
    lostWorkday: '',
    economicLosses: '',
    detailedPassage: '',
    directReason: '',
    indirectReason: '',
    riskJudge: [
      {
        riskType: '',
        area: '',
        activity: '',
        step: '',
        dangerousEvent: '',
      },
    ], // 风险研判
    dutyDispose: [
      {
        accidentRespPeople: '',
        resp: '1',
        disposalOpinions: '',
      },
    ], // 事故责任处置
    precaution: '',
  });
  const radioValue = ref('1');
  const columns = ref([
    {
      title: '姓名',
      dataIndex: 'name',
      align: 'center',
      slots: { customRender: 'name' },
    },
    {
      title: '性别',
      dataIndex: 'sex',
      align: 'center',
      width: 65,
      slots: { customRender: 'sex' },
    },
    {
      title: '年龄',
      dataIndex: 'age',
      align: 'center',
      slots: { customRender: 'age' },
    },
    {
      title: '工龄',
      dataIndex: 'lengthOfService',
      align: 'center',
      slots: { customRender: 'lengthOfService' },
    },
    {
      title: '岗位',
      dataIndex: 'post',
      align: 'center',
      slots: { customRender: 'post' },
    },
    {
      title: '歇工天数',
      dataIndex: 'days',
      align: 'center',
      slots: { customRender: 'days' },
    },
    {
      title: '用工性质',
      dataIndex: 'nature',
      align: 'center',
      slots: { customRender: 'nature' },
    },
    {
      title: '',
      dataIndex: 'operation',
      width: 65,
      slots: { customRender: 'operation' },
      align: 'center',
    },
  ]);
  const columns1 = ref([
    {
      title: '风险类型',
      dataIndex: 'riskType',
      align: 'center',
      width: '20%',
      slots: { customRender: 'riskType' },
    },
    {
      title: '工段/作业区域',
      align: 'center',
      width: '20%',
      dataIndex: 'area',
      slots: { customRender: 'area' },
    },
    {
      title: '设备设施/作业活动',
      align: 'center',
      width: '20%',
      dataIndex: 'activity',
      slots: { customRender: 'activity' },
    },
    {
      title: '检查项目/作业步骤',
      align: 'center',
      dataIndex: 'step',
      slots: { customRender: 'step' },
    },
    {
      title: '危险或潜在事件',
      align: 'center',
      dataIndex: 'dangerousEvent',
      slots: { customRender: 'dangerousEvent' },
    },
    {
      title: '',
      dataIndex: 'operation',
      width: 65,
      slots: { customRender: 'operation' },
      align: 'center',
    },
  ]);
  const columns2 = ref([
    {
      title: '事故责任人',
      dataIndex: 'accidentRespPeople',
      align: 'center',
      width: '30%',
      slots: { customRender: 'accidentRespPeople' },
    },
    {
      title: '责任类型',
      align: 'center',
      dataIndex: 'resp',
      width: '25%',
      slots: { customRender: 'resp' },
    },
    {
      title: '处置意见',
      dataIndex: 'disposalOpinions',
      align: 'center',
      slots: { customRender: 'disposalOpinions' },
    },
    {
      title: '',
      dataIndex: 'operation',
      width: 65,
      slots: { customRender: 'operation' },
      align: 'center',
    },
  ]);
  watch(
    [() => reviewInfo, () => radioValue.value],
    () => {
      emit('dataObj', reviewInfo, radioValue.value);
    },
    {
      deep: true,
    }
  );
  watch(
    () => props.type,
    (v: any) => {
      if (v === 'view') {
        columns.value.splice(columns.value.length - 1, 1);
        columns1.value.splice(columns1.value.length - 1, 1);
        columns2.value.splice(columns2.value.length - 1, 1);
      }
    },
    {
      immediate: true,
    }
  );
  watchEffect(() => {
    if (props.type !== 'add') {
      if (props.cardObject.reportFile !== '') {
        radioValue.value = '2';
      } else {
        radioValue.value = '1';
      }
      Object.assign(reviewInfo, props.cardObject);
      if (reviewInfo.directReason?.length > 0) {
        reviewInfo.directReason = props.cardObject.directReason.replace(/\.\.\/jnboot\/sys\/common\/static/g, `${baseApiUrl}/sys/common/static`);
      }
      if (reviewInfo.indirectReason?.length > 0) {
        reviewInfo.indirectReason = props.cardObject.indirectReason.replace(/\.\.\/jnboot\/sys\/common\/static/g, `${baseApiUrl}/sys/common/static`);
      }
    } else {
      reviewInfo.name =
        props.cardObject.name && props.cardObject.name.length > 0 ? props.cardObject.name.substring(0, props.cardObject.name.length - 2) : '';
      reviewInfo.orgCode = props.cardObject.orgCode;
      reviewInfo.address = props.cardObject.address;
      reviewInfo.eventTime = props.cardObject.eventTime;
      reviewInfo.type = props.cardObject.type;
    }
  });
  const disabledDate = (current) => {
    const today = new Date();
    const todayTimestamp = today.getTime();
    const currentTimestamp = current.valueOf();
    return currentTimestamp > todayTimestamp;
  };
  const renderDict = (v, code) => {
    let text = '';
    let array = getDictItemsByCode(code) || [];
    let obj = array.filter((item) => item.value == v);
    if (obj.length > 0) {
      text = obj[0].text;
    }
    return text;
  };
  const onDelete = (key: number) => {
    reviewInfo.peopleInfo.splice(key, 1);
    onBlur();
  };
  const handleAdd = (key: number) => {
    const newData = {
      name: '',
      sex: undefined,
      age: '',
      lengthOfService: '',
      post: '',
      days: '',
      nature: '',
    };
    reviewInfo.peopleInfo.splice(key + 1, 0, newData);
  };
  const onBlur = () => {
    let number = 0;
    reviewInfo.peopleInfo.forEach((item) => {
      if (item.days !== '' && item.days) {
        number += Number(item.days);
      }
    });
    reviewInfo.lostWorkday = String(number.toFixed(1));
  };
  const onDelete1 = (key: number) => {
    reviewInfo.riskJudge.splice(key, 1);
  };
  const handleAdd1 = (key: number) => {
    const newData = {
      riskType: '',
      area: '',
      activity: '',
      step: '',
      dangerousEvent: '',
    };
    reviewInfo.riskJudge.splice(key + 1, 0, newData);
  };
  const onDelete2 = (key: number) => {
    reviewInfo.dutyDispose.splice(key, 1);
  };
  const handleAdd2 = (key: number) => {
    const newData = {
      accidentRespPeople: '',
      resp: '1',
      disposalOpinions: '',
    };
    reviewInfo.dutyDispose.splice(key + 1, 0, newData);
  };
  const download = () => {
    const link: any = document.createElement('a');
    link.href = '/files/accidentInvestigationReport.docx';
    link.download = '事故调查报告-模板.docx';
    link.style.display = 'none';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
</script>
<style lang="less" scoped>
  /*覆盖ant-design-vue 样式**/
  /deep/.ant-input[disabled],
  /deep/.ant-input-affix-wrapper-disabled,
  /deep/.ant-select-disabled,
  /deep/.ant-select-selector,
  /deep/.ant-input-number-disabled,
  /deep/.ant-input-number-input,
  /deep/.ant-picker-disabled {
    color: rgba(0, 0, 0, 0.6);
    background: #ffffff !important;
    // cursor: not-allowed;
  }
  .investigationReport {
    margin: 10px 0 10px 20px;
    border-radius: 5px;
  }
  .investigationReport-content {
    background-color: #ffffff;
    margin-top: 5px;
    padding: 15px;
    h3 {
      font-weight: bold;
    }
    .investigationReport-content-row {
      margin-bottom: 20px;
      .investigationReport-content_label {
        line-height: 30px;
      }
    }
    .report_text {
      margin: 10px 0;
      padding: 0 20px;
      .html_css {
        margin: 10px 0;
      }
    }
  }
  .report_text {
    word-break: break-all;
  }
  /deep/ .ant-radio-wrapper-checked {
    color: #1890ff;
  }
  /deep/.ant-table-thead > tr > th,
  /deep/.ant-table-tbody > tr > td,
  /deep/.ant-table tfoot > tr > th,
  /deep/.ant-table tfoot > tr > td {
    padding: 5px !important;
  }
  .peopleInfo {
    border: 1px solid #999;
    border-radius: 5px;
    padding: 5px;
    margin: 5px;
    span {
      word-break: break-all;
    }
    div {
      word-break: break-all;
    }
  }
</style>
