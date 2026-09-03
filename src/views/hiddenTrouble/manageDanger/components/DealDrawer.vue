<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    title="隐患确认"
    ok-text="提交"
    width="900px"
    :show-footer="true"
    :destroyOnClose="destroyOnClose"
    @close="handleClose"
  >
    <div class="step-wrap">
      <div style="text-align: center" v-if="loading">
        <a-spin />
      </div>
      <a-steps labelPlacement="vertical" size="small">
        <a-step v-for="(item, index) in flowList" :key="index" :status="item.status == '1' ? 'finish' : item.state == '2' ? 'wait' : 'wait'">
          <template #title>
            <span :style="{ color: item.status == '1' ? '#1890ff' : '' }">{{ item.node }}</span>
          </template>
          <!-- <template #subTitle>
            <span :style="{ color: item.state == '0' ? 'blue' : '' }">{{ item.nodeOperator }}</span>
          </template> -->
          <template #description>
            <div
              :style="{ color: item.status == '1' ? '#1890ff' : '' }"
              style="font-size: 12px; display: inline-block"
              v-for="(handler, index1) in item.handlers"
              :key="index1"
            >
              <div>{{ handler.handler }}</div>
              <div>{{ handler.time }}</div>
            </div>
          </template>
        </a-step>
      </a-steps>
    </div>
    <a-tabs v-model:activeKey="activeKey" type="card" :destroyInactiveTabPane="true">
      <a-tab-pane key="1" tab="基本信息" :forceRender="true">
        <BasicForm @register="registerForm">
          <template #yhPicture>
            <JImageUpload
              v-model:value="fileList"
              :disabled="
                (detailData.currentNode !== '12' &&
                  detailData.currentNode !== '11' &&
                  !(detailData.flowType == '2' && detailData.currentNode == '21')) ||
                !showFooter
              "
              :isYhWatermark="true"
              :fileMax="10"
              text=""
              bizPath="hiddenTrouble"
            />
          </template>
          <template #repairPicture>
            <JImageUpload
              v-model:value="fileList1"
              :disabled="
                (detailData.currentNode !== '12' &&
                  detailData.currentNode !== '11' &&
                  !(detailData.flowType == '2' && detailData.currentNode == '21')) ||
                !showFooter
              "
              :isYhWatermark="true"
              :fileMax="10"
              text=""
              bizPath="hiddenTrouble"
            />
          </template>
          <template #repairRequire>
            <a-radio-group v-model:value="detailData.repairRequire" :disabled="true">
              <a-radio value="1">现场整改</a-radio>
              <a-radio value="2">限时整改</a-radio>
            </a-radio-group>
            <span style="position: absolute; top: 0; left: 170px" v-if="dangerRecordData.repairRequire == '2' && dangerRecordData.repairNotice"
              ><a-button type="link" @click="handleNoticeDetail(dangerRecordData.id)">{{ dangerRecordData.repairNotice }}</a-button></span
            >
          </template>
        </BasicForm>
      </a-tab-pane>
      <a-tab-pane
        key="2"
        tab="隐患确认"
        v-if="
          detailData.currentNode == '22' ||
          detailData.currentNode == '31' ||
          detailData.currentNode == '32' ||
          detailData.currentNode == '33' ||
          detailData.currentNode == '34' ||
          detailData.currentNode == '35' ||
          detailData.currentNode == '41' ||
          detailData.currentNode == '42' ||
          detailData.currentNode == '43' ||
          detailData.currentNode == '5' ||
          (detailData.confirmLogList && detailData.confirmLogList.length > 0 && !showFooter)
        "
      >
        <!-- 确认时间线 -->
        <div style="margin-top: 30px; margin-left: 40px" v-if="detailData.confirmLogList && detailData.confirmLogList.length > 0">
          <div style="margin: 0px 0px 20px 0">确认记录：</div>
          <!-- 时间线 -->
          <a-timeline style="margin-top: 30px">
            <a-timeline-item v-for="(item, index) in detailData.confirmLogList" :key="index">
              <div class="his-detail">
                <div class="his-time">{{ item.handleTime }}</div>
                <div class="his-content">
                  <p style="margin-left: 10px">{{ item.handlerOrgName }} > {{ item.handlerName }} </p>
                  <div class="history-explain">
                    <div class="explain-label">确认结果： </div>
                    <div class="explain-text">
                      <span v-if="item.confirmResult == '1'">确认下发</span>
                      <span v-if="item.confirmResult == '2'">退回</span>
                      <span v-if="item.confirmResult == '3'">加签</span>
                    </div>
                  </div>
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
        <a-empty v-else />
      </a-tab-pane>
      <a-tab-pane
        key="3"
        v-if="
          detailData.currentNode == '31' ||
          detailData.currentNode == '32' ||
          detailData.currentNode == '33' ||
          detailData.currentNode == '34' ||
          detailData.currentNode == '35' ||
          detailData.currentNode == '41' ||
          detailData.currentNode == '42' ||
          detailData.currentNode == '43' ||
          detailData.currentNode == '5' ||
          (detailData.repairLogList && detailData.repairLogList.length > 0 && !showFooter)
        "
        tab="隐患整改"
      >
        <div class="line-wrapper">
          <div v-if="!showFooter" style="margin-bottom: 10px"> 整改状态：{{ filterDictTextByCache('sk_yh_status', detailData.yhStatus) }} </div>
          <!-- 表单 -->
          <a-form ref="formRef" :model="info" :label-col="{ span: 7 }" :wrapper-col="{ span: 19 }" v-if="showFooter">
            <!-- 流程3-一般隐患-现场整改 31 -->
            <div v-if="detailData.flowType == '3' && detailData.yhLevel == '1' && detailData.repairRequire == '1' && detailData.currentNode == '31'">
              <a-form-item label="整改状态：" style="margin-left: -172px">
                {{ filterDictTextByCache('sk_yh_status', detailData.yhStatus) }}
              </a-form-item>
              <a-row :gutter="24">
                <a-col :span="12"
                  ><a-form-item label="车间责任人：" name="departDutyPerson" :rules="[{ required: true, message: '请选择车间责任人！' }]">
                    <a-select
                      v-model:value="info.departDutyPerson"
                      mode="multiple"
                      :filter-option="filterOption"
                      placeholder="请选择"
                      :max-tag-count="3"
                      @change="handleChangePerson"
                    >
                      <a-select-option v-for="(item, index) in personOptions" :key="index" :value="item.value">
                        {{ item.label }}
                      </a-select-option>
                    </a-select>
                  </a-form-item></a-col
                >
                <a-col :span="12"
                  ><a-form-item label="班组责任人：" name="teamDutyPerson">
                    <a-select
                      v-model:value="info.teamDutyPerson"
                      mode="multiple"
                      :filter-option="filterOption"
                      placeholder="请选择"
                      :max-tag-count="3"
                      @change="handleChangePerson"
                    >
                      <a-select-option v-for="(item, index) in teamPersonOptions" :key="index" :value="item.value">
                        {{ item.label }}
                      </a-select-option>
                    </a-select>
                  </a-form-item></a-col
                >
              </a-row>
              <a-row :gutter="24">
                <a-col :span="12"
                  ><a-form-item label="所属班组" name="team" :rules="[{ required: true, message: '请选择所属班组！' }]">
                    <a-select v-model:value="info.team" placeholder="请选择" @change="handleTeamSelectChange">
                      <a-select-option v-for="(item, index) in teamOptions" :key="index" :value="item.value">
                        {{ item.label }}
                      </a-select-option>
                    </a-select>
                  </a-form-item></a-col
                >
                <a-col :span="12"
                  ><a-form-item label="整改人" name="repairPerson" :rules="[{ required: true, message: '请选择整改人！' }]">
                    <a-select v-model:value="info.repairPerson" placeholder="请选择" :filter-option="filterOption" show-search>
                      <a-select-option v-for="(item, index) in repairPersonOptions" :key="index" :value="item.value">
                        {{ item.label }}
                      </a-select-option>
                    </a-select>
                  </a-form-item></a-col
                >
              </a-row>
              <a-form-item style="margin-left: -172px" label="整改措施：" name="repairMsr">
                <a-textarea placeholder="请输入" v-model:value="info.repairMsr" show-count :maxlength="200" :rows="4" />
              </a-form-item>
              <a-form-item
                style="margin-left: -172px"
                label="整改照片："
                name="repairPicture"
                :rules="[{ required: detailData.repairPicture ? false : true, message: '请上传整改照片！' }]"
              >
                <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.repairPicture" />
              </a-form-item>
            </div>
            <!-- 流程3-一般隐患-限时整改 31 -->
            <div v-if="detailData.flowType == '3' && detailData.yhLevel == '1' && detailData.repairRequire == '2' && detailData.currentNode == '31'">
              <div>
                <a-row :gutter="24">
                  <a-col :span="12"
                    ><a-form-item label="整改人" name="repairPerson" :rules="[{ required: true, message: '请选择整改人！' }]">
                      <a-select v-model:value="info.repairPerson" placeholder="请选择" :filter-option="filterOption" show-search>
                        <a-select-option v-for="(item, index) in repairPersonOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                </a-row>
              </div>
            </div>
            <!-- 流程3-一般隐患-限期整改 node=32、35 -->
            <div
              style="margin-left: -160px"
              v-if="
                detailData.flowType == '3' &&
                detailData.yhLevel == '1' &&
                detailData.repairRequire == '2' &&
                (detailData.currentNode == '32' || detailData.currentNode == '35')
              "
            >
              <a-form-item label="整改状态：">
                {{ filterDictTextByCache('sk_yh_status', detailData.yhStatus) }}
              </a-form-item>
              <a-form-item label="整改情况：" name="repairResult" :rules="[{ required: true, message: '请选择整改情况！' }]">
                <a-radio-group v-model:value="info.repairResult">
                  <a-radio value="1">整改完成</a-radio>
                  <a-radio value="2">整改中</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item label="整改措施：" name="repairMsr" :rules="[{ required: true, message: '请输入整改措施！' }]">
                <a-textarea placeholder="请输入" v-model:value="info.repairMsr" show-count :maxlength="200" :rows="4" />
              </a-form-item>
              <a-form-item
                label="整改照片："
                name="repairPicture"
                :rules="[{ required: detailData.repairPicture ? false : true, message: '请上传整改照片！' }]"
              >
                <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.repairPicture" />
              </a-form-item>
            </div>
            <!-- 流程1、3-重大隐患-2种整改 node=31 -->
            <div
              style="margin-left: -160px"
              v-if="
                (detailData.flowType == '3' || detailData.flowType == '1' || detailData.flowType == '2') &&
                detailData.yhLevel == '2' &&
                detailData.currentNode == '31'
              "
            >
              <a-form-item label="整改状态：">
                {{ filterDictTextByCache('sk_yh_status', detailData.yhStatus) }}
              </a-form-item>
              <a-form-item label="整改方案：" name="repairPlan" :rules="[{ required: true, message: '请上传整改方案！' }]">
                <JUpload ref="uploadRef" :maxCount="5" v-model:value="info.repairPlan" text="上传附件" />
              </a-form-item>
              <a-form-item label="临时措施：" name="tempMsr">
                <a-textarea placeholder="请输入" v-model:value="info.tempMsr" show-count :maxlength="200" :rows="4" />
              </a-form-item>
              <a-form-item
                label="整改照片："
                name="repairPicture"
                :rules="[{ required: detailData.repairPicture ? false : true, message: '请上传整改照片！' }]"
              >
                <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.repairPicture" />
              </a-form-item>
            </div>
            <!-- 流程1、3-重大隐患-2种整改 node=32 -->
            <div
              style="margin-left: -160px"
              v-if="
                (detailData.flowType == '3' || detailData.flowType == '1' || detailData.flowType == '2') &&
                detailData.yhLevel == '2' &&
                detailData.currentNode == '32'
              "
            >
              <a-form-item label="整改状态：">
                {{ filterDictTextByCache('sk_yh_status', detailData.yhStatus) }}
              </a-form-item>
              <a-form-item label="验收结果：" name="checkResult" :rules="[{ required: true, message: '请选择验收结果！' }]">
                <a-radio-group v-model:value="info.checkResult">
                  <a-radio value="1">验收通过</a-radio>
                  <a-radio value="2">验收不通过</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item label="处理说明：" name="handleExplain">
                <a-textarea placeholder="请输入" v-model:value="info.handleExplain" show-count :maxlength="200" :rows="4" />
              </a-form-item>
              <a-form-item label="" name="handlePicture">
                <div style="margin-left: 286px">
                  <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.handlePicture" />
                </div>
              </a-form-item>
            </div>
            <!-- 流程3-重大隐患-2种整改 node=33、35 -->
            <div
              v-if="
                (detailData.flowType == '3' || detailData.flowType == '2') &&
                detailData.yhLevel == '2' &&
                (detailData.currentNode == '33' || detailData.currentNode == '35')
              "
            >
              <a-form-item label="整改状态：" style="margin-left: -175px">
                {{ filterDictTextByCache('sk_yh_status', detailData.yhStatus) }}
              </a-form-item>
              <div>
                <a-row :gutter="24">
                  <a-col :span="12"
                    ><a-form-item label="车间责任人：" name="departDutyPerson" :rules="[{ required: true, message: '请选择车间责任人！' }]">
                      <a-select
                        v-model:value="info.departDutyPerson"
                        mode="multiple"
                        :filter-option="filterOption"
                        placeholder="请选择"
                        :max-tag-count="3"
                        @change="handleChangePerson"
                      >
                        <a-select-option v-for="(item, index) in personOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                  <a-col :span="12"
                    ><a-form-item label="班组责任人：" name="teamDutyPerson">
                      <a-select
                        v-model:value="info.teamDutyPerson"
                        mode="multiple"
                        :filter-option="filterOption"
                        placeholder="请选择"
                        :max-tag-count="3"
                        @change="handleChangePerson"
                      >
                        <a-select-option v-for="(item, index) in teamPersonOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                </a-row>
                <a-row :gutter="24">
                  <a-col :span="12"
                    ><a-form-item label="所属班组" name="team" :rules="[{ required: true, message: '请选择所属班组！' }]">
                      <a-select v-model:value="info.team" placeholder="请选择" @change="handleTeamSelectChange">
                        <a-select-option v-for="(item, index) in teamOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                </a-row>
              </div>
              <a-form-item
                style="margin-left: -175px"
                label="整改情况："
                name="repairResult"
                :rules="[{ required: true, message: '请选择整改情况！' }]"
              >
                <a-radio-group v-model:value="info.repairResult">
                  <a-radio value="1">整改完成</a-radio>
                  <a-radio value="2">整改中</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item style="margin-left: -175px" label="整改措施：" name="repairMsr" :rules="[{ required: true, message: '请输入整改措施！' }]">
                <a-textarea placeholder="请输入" v-model:value="info.repairMsr" show-count :maxlength="200" :rows="4" />
              </a-form-item>
              <a-form-item
                style="margin-left: -175px"
                label="整改照片："
                name="repairPicture"
                :rules="[{ required: detailData.repairPicture ? false : true, message: '请上传整改照片！' }]"
              >
                <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.repairPicture" />
              </a-form-item>
            </div>
            <!-- 流程1-一般隐患-现场整改 -->
            <div v-if="detailData.flowType == '1' && detailData.yhLevel == '1' && detailData.repairRequire == '1' && detailData.currentNode == '31'">
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item label="整改状态：">
                    {{ filterDictTextByCache('sk_yh_status', detailData.yhStatus) }}
                  </a-form-item>
                </a-col>
              </a-row>
              <div>
                <a-row :gutter="24">
                  <a-col :span="12"
                    ><a-form-item label="所属车间" name="depart" :rules="[{ required: true, message: '请选择所属车间！' }]">
                      <a-select v-model:value="info.depart" placeholder="请选择" @change="handleDepartSelectChange">
                        <a-select-option v-for="(item, index) in departOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                  <a-col :span="12"
                    ><a-form-item label="所属班组" name="team" :rules="[{ required: true, message: '请选择所属班组！' }]">
                      <a-select v-model:value="info.team" placeholder="请选择" @change="handleTeamSelectChange">
                        <a-select-option v-for="(item, index) in teamOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                </a-row>
                <a-row :gutter="24">
                  <a-col :span="12"
                    ><a-form-item label="车间责任人：" name="departDutyPerson" :rules="[{ required: true, message: '请选择车间责任人！' }]">
                      <a-select
                        v-model:value="info.departDutyPerson"
                        mode="multiple"
                        :filter-option="filterOption"
                        placeholder="请选择"
                        :max-tag-count="3"
                        @change="handleChangePerson"
                      >
                        <a-select-option v-for="(item, index) in personOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                  <a-col :span="12"
                    ><a-form-item label="班组责任人：" name="teamDutyPerson">
                      <a-select
                        v-model:value="info.teamDutyPerson"
                        mode="multiple"
                        :filter-option="filterOption"
                        placeholder="请选择"
                        :max-tag-count="3"
                        @change="handleChangePerson"
                      >
                        <a-select-option v-for="(item, index) in teamPersonOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                </a-row>
                <a-row :gutter="24">
                  <a-col :span="12"
                    ><a-form-item label="整改人" name="repairPerson" :rules="[{ required: true, message: '请选择整改人！' }]">
                      <a-select v-model:value="info.repairPerson" placeholder="请选择" :filter-option="filterOption" show-search>
                        <a-select-option v-for="(item, index) in repairPersonOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                </a-row>
                <a-form-item style="margin-left: -160px" label="处理说明：" name="handleExplain">
                  <a-textarea placeholder="请输入" v-model:value="info.handleExplain" show-count :maxlength="200" :rows="4" />
                </a-form-item>
                <a-form-item v-if="detailData.repairPicture" label="" name="handlePicture">
                  <div class="rectification-pic">
                    <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.handlePicture" />
                  </div>
                </a-form-item>
                <a-form-item
                  style="margin-left: -160px"
                  v-if="!detailData.repairPicture"
                  label="处理照片："
                  name="handlePicture"
                  :rules="[{ required: true, message: '请上传处理照片！' }]"
                >
                  <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.handlePicture" />
                </a-form-item>
                <!-- <a-form-item label="整改后照片：" name="picture" :rules="[{ required: true, message: '请上传整改后照片！' }]">
                <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.picture" />
              </a-form-item> -->
              </div>
            </div>
            <!-- 流程1-一般隐患-限时整改31 -->
            <div v-if="detailData.flowType == '1' && detailData.yhLevel == '1' && detailData.repairRequire == '2' && detailData.currentNode == '31'">
              <div>
                <a-row :gutter="24">
                  <a-col :span="12"
                    ><a-form-item label="所属车间" name="depart" :rules="[{ required: true, message: '请选择所属车间！' }]">
                      <a-select v-model:value="info.depart" placeholder="请选择" @change="handleDepartSelectChange">
                        <a-select-option v-for="(item, index) in departOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                  <a-col :span="12"
                    ><a-form-item label="所属班组" name="team" :rules="[{ required: true, message: '请选择所属班组！' }]">
                      <a-select v-model:value="info.team" placeholder="请选择" @change="handleTeamSelectChange">
                        <a-select-option v-for="(item, index) in teamOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                </a-row>
                <a-row :gutter="24">
                  <a-col :span="12"
                    ><a-form-item label="整改人" name="repairPerson" :rules="[{ required: true, message: '请选择整改人！' }]">
                      <a-select v-model:value="info.repairPerson" placeholder="请选择" :filter-option="filterOption" show-search>
                        <a-select-option v-for="(item, index) in repairPersonOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                </a-row>
              </div>
            </div>
            <!-- 流程1-一般隐患-限时整改32 -->
            <div
              style="margin-left: -160px"
              v-if="
                detailData.flowType == '1' &&
                detailData.yhLevel == '1' &&
                detailData.repairRequire == '2' &&
                (detailData.currentNode == '32' || detailData.currentNode == '33' || detailData.currentNode == '35')
              "
            >
              <a-form-item label="整改状态：">
                {{ filterDictTextByCache('sk_yh_status', detailData.yhStatus) }}
              </a-form-item>
              <a-form-item label="整改情况：" name="repairResult" :rules="[{ required: true, message: '请选择整改情况！' }]">
                <a-radio-group v-model:value="info.repairResult">
                  <a-radio value="1">整改完成</a-radio>
                  <a-radio value="2">整改中</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item label="整改措施：" name="repairMsr" :rules="[{ required: true, message: '请输入整改措施！' }]">
                <a-textarea placeholder="请输入" v-model:value="info.repairMsr" show-count :maxlength="200" :rows="4" />
              </a-form-item>
              <a-form-item
                label="整改照片："
                name="repairPicture"
                :rules="[{ required: detailData.repairPicture ? false : true, message: '请上传整改照片！' }]"
              >
                <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.repairPicture" />
              </a-form-item>
            </div>
            <!-- 流程1-重大隐患-33 -->
            <div v-if="detailData.flowType == '1' && detailData.yhLevel == '2' && detailData.currentNode == '33'">
              <div>
                <a-row :gutter="24">
                  <a-col :span="12"
                    ><a-form-item label="所属车间" name="depart" :rules="[{ required: true, message: '请选择所属车间！' }]">
                      <a-select v-model:value="info.depart" placeholder="请选择" @change="handleDepartSelectChange">
                        <a-select-option v-for="(item, index) in departOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                  <a-col :span="12"
                    ><a-form-item label="所属班组" name="team" :rules="[{ required: true, message: '请选择所属班组！' }]">
                      <a-select v-model:value="info.team" placeholder="请选择" @change="handleTeamSelectChange">
                        <a-select-option v-for="(item, index) in teamOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                </a-row>
                <a-row :gutter="24">
                  <a-col :span="12"
                    ><a-form-item label="整改人" name="repairPerson" :rules="[{ required: true, message: '请选择整改人！' }]">
                      <a-select v-model:value="info.repairPerson" placeholder="请选择" :filter-option="filterOption" show-search>
                        <a-select-option v-for="(item, index) in repairPersonOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                </a-row>
              </div>
            </div>
            <!-- 流程1-重大隐患-2种整改 node=34/35 -->
            <div v-if="detailData.flowType == '1' && detailData.yhLevel == '2' && (detailData.currentNode == '34' || detailData.currentNode == '35')">
              <a-form-item label="整改状态：" style="margin-left: -174px">
                {{ filterDictTextByCache('sk_yh_status', detailData.yhStatus) }}
              </a-form-item>
              <a-row :gutter="24">
                <a-col :span="12"
                  ><a-form-item label="车间责任人：" name="departDutyPerson" :rules="[{ required: true, message: '请选择车间责任人！' }]">
                    <a-select
                      v-model:value="info.departDutyPerson"
                      mode="multiple"
                      :filter-option="filterOption"
                      placeholder="请选择"
                      :max-tag-count="3"
                      @change="handleChangePerson"
                    >
                      <a-select-option v-for="(item, index) in personOptions" :key="index" :value="item.value">
                        {{ item.label }}
                      </a-select-option>
                    </a-select>
                  </a-form-item></a-col
                >
                <a-col :span="12"
                  ><a-form-item label="班组责任人：" name="teamDutyPerson">
                    <a-select
                      v-model:value="info.teamDutyPerson"
                      mode="multiple"
                      :filter-option="filterOption"
                      placeholder="请选择"
                      :max-tag-count="3"
                      @change="handleChangePerson"
                    >
                      <a-select-option v-for="(item, index) in teamPersonOptions" :key="index" :value="item.value">
                        {{ item.label }}
                      </a-select-option>
                    </a-select>
                  </a-form-item></a-col
                >
              </a-row>
              <a-form-item
                style="margin-left: -174px"
                label="整改情况："
                name="repairResult"
                :rules="[{ required: true, message: '请选择整改情况！' }]"
              >
                <a-radio-group v-model:value="info.repairResult">
                  <a-radio value="1">整改完成</a-radio>
                  <a-radio value="2">整改中</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item style="margin-left: -174px" label="整改措施：" name="repairMsr" :rules="[{ required: true, message: '请输入整改措施！' }]">
                <a-textarea placeholder="请输入" v-model:value="info.repairMsr" show-count :maxlength="200" :rows="4" />
              </a-form-item>
              <a-form-item
                style="margin-left: -174px"
                label="整改照片："
                name="repairPicture"
                :rules="[{ required: detailData.repairPicture ? false : true, message: '请上传整改照片！' }]"
              >
                <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.repairPicture" />
              </a-form-item>
            </div>
            <!-- 流程2-一般-限时整改 node=31 -->
            <div
              style="margin-left: -160px"
              v-if="
                detailData.flowType == '2' &&
                detailData.yhLevel == '1' &&
                detailData.repairRequire == '2' &&
                (detailData.currentNode == '31' || detailData.currentNode == '35')
              "
            >
              <a-form-item label="整改状态：">
                {{ filterDictTextByCache('sk_yh_status', detailData.yhStatus) }}
              </a-form-item>
              <a-form-item label="整改情况：" name="repairResult" :rules="[{ required: true, message: '请选择整改情况！' }]">
                <a-radio-group v-model:value="info.repairResult">
                  <a-radio value="1">整改完成</a-radio>
                  <a-radio value="2">整改中</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item label="整改措施：" name="repairMsr" :rules="[{ required: true, message: '请输入整改措施！' }]">
                <a-textarea placeholder="请输入" v-model:value="info.repairMsr" show-count :maxlength="200" :rows="4" />
              </a-form-item>
              <a-form-item
                label="整改照片："
                name="repairPicture"
                :rules="[{ required: detailData.repairPicture ? false : true, message: '请上传整改照片！' }]"
              >
                <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.repairPicture" />
              </a-form-item>
            </div>
            <!-- 验收审核 -->
            <div v-if="detailData.currentNode == '41' || detailData.currentNode == '42' || detailData.currentNode == '43'">
              <a-form-item label="整改状态：" style="margin-left: -160px">
                {{ filterDictTextByCache('sk_yh_status', detailData.yhStatus) }}
              </a-form-item>
              <div
                v-if="
                  (detailData.currentNode == '41' && detailData.flowType == '2' && detailData.yhLevel == '1' && detailData.repairRequire == '1') ||
                  (detailData.currentNode == '42' && detailData.flowType == '2' && detailData.yhLevel == '1' && detailData.repairRequire == '2')
                "
              >
                <!-- 下拉选择隐患等级 -->
                <a-row :gutter="24">
                  <a-col :span="12">
                    <a-form-item label="隐患等级：" name="yhLevelNew" :rules="[{ required: true, message: '请选择！' }]">
                      <a-select v-model:value="info.yhLevelNew" placeholder="请选择" @change="handleLevelNewChange">
                        <a-select-option value="1">一般隐患</a-select-option>
                        <a-select-option value="2">重大隐患</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="24">
                  <a-col :span="12"
                    ><a-form-item label="隐患分类：" name="yhType" :rules="[{ required: true, message: '请选择！' }]">
                      <JDictSelectTag v-model:value="info.yhType" placeholder="请选择" dictCode="sk_yh_type" /> </a-form-item
                  ></a-col>
                  <a-col :span="12"
                    ><a-form-item label="子类：" name="yhTypeSub" :rules="[{ required: true, message: '请选择！' }]">
                      <JDictSelectTag v-model:value="info.yhTypeSub" placeholder="请选择" dictCode="sk_yh_type_sub" /> </a-form-item
                  ></a-col>
                </a-row>
              </div>
              <div v-if="detailData.currentNode == '41' && detailData.flowType == '1' && detailData.repairRequire == '2'">
                <a-row :gutter="24">
                  <a-col :span="12"
                    ><a-form-item label="车间责任人：" name="departDutyPerson" :rules="[{ required: true, message: '请选择车间责任人！' }]">
                      <a-select
                        v-model:value="info.departDutyPerson"
                        mode="multiple"
                        :filter-option="filterOption"
                        placeholder="请选择"
                        :max-tag-count="3"
                        @change="handleChangePerson"
                      >
                        <a-select-option v-for="(item, index) in personOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                  <a-col :span="12"
                    ><a-form-item label="班组责任人：" name="teamDutyPerson">
                      <a-select
                        v-model:value="info.teamDutyPerson"
                        mode="multiple"
                        :filter-option="filterOption"
                        placeholder="请选择"
                        :max-tag-count="3"
                        @change="handleChangePerson"
                      >
                        <a-select-option v-for="(item, index) in teamPersonOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                </a-row>
              </div>
              <div
                v-if="detailData.currentNode == '41' && detailData.flowType == '3' && detailData.yhLevel == '1' && detailData.repairRequire == '2'"
              >
                <a-row :gutter="24">
                  <a-col :span="12"
                    ><a-form-item label="车间责任人：" name="departDutyPerson" :rules="[{ required: true, message: '请选择车间责任人！' }]">
                      <a-select
                        v-model:value="info.departDutyPerson"
                        mode="multiple"
                        :filter-option="filterOption"
                        placeholder="请选择"
                        :max-tag-count="3"
                        @change="handleChangePerson"
                      >
                        <a-select-option v-for="(item, index) in personOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                  <a-col :span="12"
                    ><a-form-item label="班组责任人：" name="teamDutyPerson">
                      <a-select
                        v-model:value="info.teamDutyPerson"
                        mode="multiple"
                        :filter-option="filterOption"
                        placeholder="请选择"
                        :max-tag-count="3"
                        @change="handleChangePerson"
                      >
                        <a-select-option v-for="(item, index) in teamPersonOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                </a-row>
                <a-row :gutter="24">
                  <a-col :span="12"
                    ><a-form-item label="所属班组" name="team" :rules="[{ required: true, message: '请选择所属班组！' }]">
                      <a-select v-model:value="info.team" placeholder="请选择" @change="handleTeamSelectChange">
                        <a-select-option v-for="(item, index) in teamOptions" :key="index" :value="item.value">
                          {{ item.label }}
                        </a-select-option>
                      </a-select>
                    </a-form-item></a-col
                  >
                </a-row>
              </div>
              <a-form-item style="margin-left: -160px" label="验收结果" name="checkResult" :rules="[{ required: true, message: '请选择验收结果！' }]">
                <a-radio-group v-model:value="info.checkResult">
                  <a-radio value="1">验收通过</a-radio>
                  <a-radio value="2">验收不通过</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item style="margin-left: -160px" label="处理说明：" name="handleExplain">
                <a-textarea placeholder="请输入" v-model:value="info.handleExplain" show-count :maxlength="200" :rows="4" />
              </a-form-item>
              <a-form-item label="" name="handlePicture">
                <div class="rectification-pic">
                  <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.handlePicture" />
                </div>
              </a-form-item>
            </div>
          </a-form>
          <!-- 整改时间线 -->
          <div
            style="margin-top: 30px; margin-left: 40px; border-top: 1px solid #e1e1e1"
            v-if="detailData.repairLogList && detailData.repairLogList.length > 0"
          >
            <!-- <div style="margin: 0px 0px 20px 0">确认记录：</div> -->
            <!-- 时间线 -->
            <a-timeline style="margin-top: 30px">
              <a-timeline-item v-for="(item, index) in detailData.repairLogList" :key="index">
                <div class="his-detail">
                  <div class="his-time">{{ item.handleTime }}</div>
                  <div class="his-content">
                    <p style="margin-left: 10px">{{ item.handlerOrgName }} > {{ item.handlerName }} </p>
                    <div class="history-explain" v-if="item.repairPlanList && item.repairPlanList.length > 0">
                      <div class="explain-label">整改方案： </div>
                      <div class="explain-text">
                        <div v-for="(filePath, index) in item.repairPlanList" :key="index">
                          <a :href="filePath" download> {{ filePath.split('/')[filePath.split('/').length - 1] }}</a>
                        </div>
                      </div>
                    </div>
                    <div class="history-explain" v-if="item.departDutyPersonName">
                      <div class="explain-label">车间责任人： </div>
                      <div class="explain-text">
                        {{ item.departDutyPersonName }}
                      </div>
                    </div>
                    <div class="history-explain" v-if="item.teamDutyPersonName">
                      <div class="explain-label">班组责任人： </div>
                      <div class="explain-text">
                        {{ item.teamDutyPersonName }}
                      </div>
                    </div>
                    <div class="history-explain" v-if="item.teamName">
                      <div class="explain-label">所属班组： </div>
                      <div class="explain-text">
                        {{ item.teamName }}
                      </div>
                    </div>
                    <div class="history-explain" v-if="item.repairPersonName">
                      <div class="explain-label">整改人： </div>
                      <div class="explain-text">
                        {{ item.repairPersonName }}
                      </div>
                    </div>
                    <div class="history-explain" v-if="item.yhLevel">
                      <div class="explain-label">隐患等级： </div>
                      <div class="explain-text">
                        <span>{{ item.yhLevel == '1' ? '一般隐患' : '重大隐患' }}</span>
                      </div>
                    </div>
                    <div class="history-explain" v-if="item.yhType">
                      <div class="explain-label">隐患分类： </div>
                      <div class="explain-text">
                        {{ item.yhType }}
                      </div>
                    </div>
                    <div class="history-explain" v-if="item.yhTypeSub">
                      <div class="explain-label">子类： </div>
                      <div class="explain-text">
                        {{ item.yhTypeSub }}
                      </div>
                    </div>
                    <div class="history-explain" v-if="item.tempMsr">
                      <div class="explain-label">临时措施： </div>
                      <div class="explain-text">
                        {{ item.tempMsr }}
                      </div>
                    </div>
                    <div class="history-explain" v-if="item.repairResult">
                      <div class="explain-label">整改情况： </div>
                      <div class="explain-text">
                        <span>{{ item.repairResult == '1' ? '整改完成' : '整改中' }}</span>
                      </div>
                    </div>
                    <div class="history-explain" v-if="item.repairMsr">
                      <div class="explain-label">整改措施： </div>
                      <div class="explain-text">
                        {{ item.repairMsr }}
                      </div>
                    </div>
                    <div class="history-explain" v-if="item.repairPictureList && item.repairPictureList.length > 0">
                      <div class="explain-label">整改照片： </div>
                      <div class="explain-text">
                        <a-upload
                          list-type="picture-card"
                          v-model:file-list="item.repairPictureList"
                          :max-count="10"
                          @preview="handlePreview"
                          :disabled="true"
                        >
                        </a-upload>
                        <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel(item)">
                          <img alt="example" style="width: 100%" :src="previewImage" />
                        </a-modal>
                      </div>
                    </div>
                    <div class="history-explain" v-if="item.checkResult">
                      <div class="explain-label">验收情况： </div>
                      <div class="explain-text">
                        <span>{{ item.checkResult == '1' ? '验收通过' : '验收不通过' }}</span>
                      </div>
                    </div>
                    <div class="history-explain" v-if="item.handleExplain">
                      <div class="explain-label">处理说明： </div>
                      <div class="explain-text">
                        {{ item.handleExplain }}
                      </div>
                    </div>
                    <div class="history-explain" v-if="item.handlePictureList && item.handlePictureList.length > 0">
                      <div class="explain-label">处理照片： </div>
                      <div class="explain-text">
                        <a-upload
                          style="width: 500px"
                          list-type="picture-card"
                          v-model:file-list="item.handlePictureList"
                          :max-count="10"
                          @preview="handlePreview"
                          :disabled="true"
                        >
                        </a-upload>
                        <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel(item)">
                          <img alt="example" style="width: 100%" :src="previewImage" />
                        </a-modal>
                      </div>
                    </div>
                  </div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
    <!-- 自定义按钮 -->
    <template #footer>
      <div class="drawer-footer" v-if="showFooter">
        <a-button
          v-if="
            (dangerRecordData.flowType == '1' && dangerRecordData.currentNode == '21') ||
            (dangerRecordData.flowType == '3' && (dangerRecordData.currentNode == '21' || dangerRecordData.currentNode == '22')) ||
            (dangerRecordData.flowType == '2' && (dangerRecordData.currentNode == '22' || dangerRecordData.currentNode == '23'))
          "
          style="background-color: orange; color: #fff; margin-right: 20px; border: 1px solid orange"
          @click="handleRejectBack"
        >
          退回
        </a-button>
        <a-button v-else @click="closeDrawer" style="margin-right: 20px">取消</a-button>
        <a-button
          style="margin-right: 20px"
          v-if="
            (dangerRecordData.flowType == '1' && dangerRecordData.yhLevel == '2' && dangerRecordData.currentNode == '22') ||
            (dangerRecordData.flowType == '2' && dangerRecordData.yhLevel == '2' && dangerRecordData.currentNode == '23')
          "
          type="primary"
          @click="handleAddSign"
          >加签</a-button
        >
        <a-button
          v-if="
            (dangerRecordData.flowType == '1' && dangerRecordData.currentNode == '21') ||
            (dangerRecordData.flowType == '3' && (dangerRecordData.currentNode == '21' || dangerRecordData.currentNode == '22')) ||
            (dangerRecordData.flowType == '2' && (dangerRecordData.currentNode == '22' || dangerRecordData.currentNode == '23')) ||
            (dangerRecordData.flowType == '1' &&
              dangerRecordData.yhLevel == '2' &&
              (dangerRecordData.currentNode == '22' || dangerRecordData.currentNode == '24')) ||
            (dangerRecordData.flowType == '2' &&
              dangerRecordData.yhLevel == '2' &&
              (dangerRecordData.currentNode == '23' || dangerRecordData.currentNode == '24'))
          "
          type="primary"
          @click="confirmPublish"
          >确认下发</a-button
        >
        <a-button v-if="dangerRecordData.flowType == '2' && dangerRecordData.currentNode == '21'" type="primary" @click="dutyPersonConfirm"
          >提交</a-button
        >
        <a-button
          v-if="
            detailData.currentNode == '31' ||
            detailData.currentNode == '32' ||
            detailData.currentNode == '33' ||
            detailData.currentNode == '34' ||
            detailData.currentNode == '35' ||
            detailData.currentNode == '41' ||
            detailData.currentNode == '42' ||
            detailData.currentNode == '43'
          "
          type="primary"
          @click="handleSubmitSure"
          >提交</a-button
        >
        <a-button v-if="dangerRecordData.currentNode == '12'" type="primary" @click="handleSubmitAgain">重新提交</a-button>
        <a-button v-if="dangerRecordData.currentNode == '11'" type="primary" @click="handleSubmitAgain">提交</a-button>
      </div>
    </template>
    <a-modal v-model:visible="visibleReject" title="确认退回" @ok="handleRejectOk">
      <!-- 表单-退回原因 -->
      <a-form ref="infoRef" :model="rejectInfo" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" autocomplete="off">
        <a-form-item label="退回原因" name="rejectReason" :rules="[{ required: true, message: '请输入退回原因！' }]">
          <a-textarea style="width: 80%" v-model:value="rejectInfo.rejectReason" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
    <RiskPointsModal @register="registerRiskPointsModal" @select="selectRiskPointsOk" />
    <SignUserModal @register="registerSignUserModal" @select="selectSignUserOk" />
    <NoticeDetailDrawer @register="registerNoticeDetailDrawer" />
    <a-modal v-model:visible="personVisible" title="下一节点处理人" @ok="handlePersonOk" width="600px">
      <a-form ref="personFormRef" :model="personInfo" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" autocomplete="off" style="margin: 20px 0">
        <a-form-item
          v-for="(itemAssignee, index) in nextAssignees"
          :key="index"
          :label="itemAssignee.name"
          :name="itemAssignee.field"
          :rules="[{ required: true, message: '请选择！' }]"
        >
          <a-select v-model:value="personInfo[itemAssignee.field]" placeholder="请选择" style="width: 200px">
            <a-select-option v-for="(item, index) in itemAssignee.users" :key="index" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import type { Dayjs } from 'dayjs';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/src/components/Drawer';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import type { UploadProps } from 'ant-design-vue';
  import { TreeSelect } from 'ant-design-vue';
  import { JImageUpload } from '/@/components/Form';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { defHttp } from '/@/utils/http/axios';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useMessage } from '/@/hooks/web/useMessage';
  import SignUserModal from './SignUserModal.vue';
  import NoticeDetailDrawer from './NoticeDetailDrawer.vue';

  const { createMessage } = useMessage();
  import {
    getUserList,
    dealDanger,
    getDangerDetail,
    getTeamUserList,
    getTeamList,
    getFlowType,
    getNextAssignee,
    getFlowList,
  } from '../account/account.api';
  import dayjs from 'dayjs';
  import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import RiskPointsModal from './RiskPointsModal.vue';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { up } from 'inquirer/lib/utils/readline';

  const [registerRiskPointsModal, { openModal: openRiskPointsModal }] = useModal();
  const [registerSignUserModal, { openModal: openSignUserModal }] = useModal();
  const [registerNoticeDetailDrawer, { openDrawer: openNoticeDetailDrawer }] = useDrawer();
  const { createConfirm } = useMessage();
  const userStore = useUserStore();
  const userinfo: any = computed(() => userStore.getUserInfo);
  console.log('userinfo', userinfo.value);
  const infoRef = ref<any>(null);
  const formRef = ref<any>(null);
  const personFormRef = ref<any>(null);
  const emit = defineEmits(['register', 'success']);
  const personVisible = ref(false);
  const previewVisible = ref(false);
  const previewImage = ref('');
  const dangerRecordData = ref({});
  const detailData = ref({});
  const visibleReject = ref(false);
  const activeKey = ref('1');
  const flowList = ref([]);
  const loading = ref(false);
  const info = ref<any>({
    departDutyPerson: [],
    teamDutyPerson: [],
    repairPerson: undefined,
    repairPlan: undefined,
    tempMsr: undefined,
    repairPicture: undefined,
    repairResult: undefined,
    repairMsr: undefined,
    checkResult: undefined,
    handleExplain: undefined,
    handlePicture: undefined,
    depart: undefined,
    team: undefined,
    yhLevelNew: undefined,
    yhType: undefined,
    yhTypeSub: undefined,
  });
  const rejectInfo = ref<any>({
    rejectReason: '',
  });
  const personInfo = ref<any>({
    // assignee1: undefined,
    // assignee2: undefined,
  });
  const SHOW_PARENT = TreeSelect.SHOW_PARENT;
  const treeData = ref<any[]>([]);
  const treeData1 = ref<any[]>([]);
  const personOptions = ref<any[]>([]);
  const fileList = ref('');
  const fileList1 = ref('');
  const riskIdEdit = ref([]);
  const sourceType = ref('');
  const riskDataSource: any = ref([]);
  const orgOptions = ref([]);
  const departOptions = ref([]);
  const isUpdate = ref(false);
  const teamOptions = ref([]);
  const flowType = ref('');
  const showFooter = ref(true);
  const submitType = ref('');
  const nextAssignees = ref([]);
  const repairPersonOptions = ref([]);
  const teamPersonOptions = ref([]);
  const destroyOnClose = ref(true);
  function handleClose() {
    destroyOnClose.value = true;
    resetSchema(schemas);
  }
  async function getOrgList() {
    await getOrgCodeList().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
  }
  getOrgList();
  getFlowTypeCode();
  // 获取当前登陆人的所属部门级别
  async function getFlowTypeCode() {
    await getFlowType({ userId: userinfo.value.id }).then((res) => {
      console.log('res', res);
      flowType.value = res;
    });
  }
  async function handleLevelNewChange(e) {
    console.log('e', e);
    let params: any = {};
    params.yhLevelNew = e;
    params.currentNode = dangerRecordData.value.currentNode;
    params.flowType = dangerRecordData.value.flowType;
    params.yhLevel = dangerRecordData.value.yhLevel;
    params.repairRequire = dangerRecordData.value.repairRequire;
    params.org = dangerRecordData.value.org;
    params.depart = dangerRecordData.value.depart;
    await getNextPerson(params);
  }
  async function handleLevelChange(e) {
    console.log('e', e);
    let params: any = {};
    params.currentNode = dangerRecordData.value.currentNode;
    params.flowType = dangerRecordData.value.flowType;
    params.yhLevel = e;
    params.repairRequire = dangerRecordData.value.repairRequire;
    params.org = dangerRecordData.value.org;
    params.depart = dangerRecordData.value.depart;
    await getNextPerson(params);
  }

  async function getNextPerson(params) {
    getNextAssignee(params).then((res) => {
      console.log('res', res);
      if (res && res.length > 0) {
        res.map((item) => {
          item.users = item.users.map((item1) => {
            return {
              label: item1.realname,
              value: item1.id,
            };
          });
        });
        nextAssignees.value = res;
      } else {
        nextAssignees.value = [];
      }
    });
  }
  const schemas: any = [
    {
      label: 'id',
      field: 'id',
      component: 'Input',
      show: false,
    },
    // {
    //   field: 'divider-basic',
    //   component: 'Divider',
    //   label: '基本信息',
    // },
    {
      label: '隐患来源',
      field: 'sourceType',
      required: true,
      component: 'JDictSelectTag',
      dynamicDisabled: true,
      componentProps: {
        dictCode: 'sk_yh_source',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      colProps: {
        style: 'margin-left: -100px',
      },
    },
    {
      label: '隐患照片',
      field: 'yhPicture',
      component: 'Input',
      slot: 'yhPicture',
      colProps: {
        style: 'margin-left: -100px',
      },
    },
    {
      label: '隐患描述',
      field: 'yhDescription',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        autoSize: false,
        rows: 3,
        maxlength: 300,
        showCount: true,
      },
      colProps: {
        style: 'margin-left: -100px',
      },
    },
    {
      label: '所属单位',
      field: 'org',
      component: 'Select',
      required: true,
      componentProps: ({ formModel, formActionType }) => {
        return {
          options: orgOptions,
          placeholder: '请选择',
          onChange: (e: any) => {
            departOptions.value = [];
            personOptions.value = [];
            teamOptions.value = [];
            teamPersonOptions.value = [];
            formModel.teamDutyPerson = undefined; //  reset city value
            formModel.depart = undefined; //  reset city value
            formModel.checkDutyPerson = undefined; //  reset city value
            formModel.executePerson = undefined; //  reset city value
            formModel.team = undefined; //  reset city value

            const { updateSchema } = formActionType;
            if (e) {
              let params: any = {};
              params.orgCode = e;
              params.pageSize = 9999;
              params.pageNo = 1;
              let params2: any = {};
              params2.workShopCode = e;
              getUserList(params).then((res) => {
                if (res) {
                  repairPersonOptions.value = res.map((item: any) => {
                    return {
                      label: item.realname,
                      value: item.id,
                    };
                  });
                  updateSchema({
                    field: 'repairPerson',
                    componentProps: {
                      options: repairPersonOptions.value,
                    },
                  });
                }
              });

              getTeamList(params2).then((res) => {
                if (res) {
                  teamOptions.value = res.map((item: any) => {
                    return {
                      label: item.sectionName,
                      value: item.id,
                    };
                  });
                  updateSchema({
                    field: 'team',
                    componentProps: ({ formModel, formActionType }) => {
                      return {
                        options: teamOptions.value,
                        placeholder: '请选择',
                        onChange: (e: any) => {
                          console.log('team', e);
                          formModel.teamDutyPerson = undefined;
                          let params: any = {};
                          params.orgCode = formModel.org;
                          params.teamId = e == 'all' ? '' : e;
                          getTeamUserList(params).then((res) => {
                            if (res) {
                              teamPersonOptions.value = res.map((item: any) => {
                                return {
                                  label: item.realname,
                                  value: item.id,
                                };
                              });
                              updateSchema({
                                field: 'teamDutyPerson',
                                componentProps: {
                                  options: teamPersonOptions.value,
                                },
                              });
                            }
                          });
                        },
                      };
                    },
                  });
                } else {
                  updateSchema({
                    field: 'team',
                    componentProps: {
                      options: [],
                    },
                  });
                }
              });
              getDepartmentList(params).then((res) => {
                if (res && res.length > 0) {
                  departOptions.value = res.map((item) => {
                    return {
                      label: item.departName,
                      value: item.orgCode,
                    };
                  });
                  updateSchema({
                    field: 'depart',
                    componentProps: ({ formModel, formActionType }) => {
                      return {
                        options: departOptions,
                        placeholder: '请选择',
                        onChange: (e: any) => {},
                      };
                    },
                  });
                } else {
                  updateSchema({
                    field: 'depart',
                    componentProps: ({ formModel, formActionType }) => {
                      return {
                        options: [],
                        placeholder: '请选择',
                        onChange: (e: any) => {
                        },
                      };
                    },
                  });
                }
              });
            } else {
              updateSchema({
                field: 'team',
                componentProps: {
                  options: [],
                },
              });
              updateSchema({
                field: 'depart',
                componentProps: ({ formModel, formActionType }) => {
                  return {
                    options: departOptions,
                    placeholder: '请选择',
                    onChange: (e: any) => {
                    },
                  };
                },
              });
            }
          },
        };
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '所属车间',
      field: 'depart',
      component: 'Select',
      required: () => {
        if (flowType.value == '1') {
          return false;
        } else {
          return true;
        }
      },
      componentProps: ({ formModel, formActionType }) => {
        return {
          options: departOptions,
          placeholder: '请选择',
          onChange: (e: any) => {
          },
        };
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '所属班组',
      field: 'team',
      component: 'Select',
      required: true,
      componentProps: ({ formModel, formActionType }) => {
        return {
          options: teamOptions.value,
          onChange: (e: any) => {
            console.log('team', e);
            formModel.teamDutyPerson = undefined;
            let params: any = {};
            params.orgCode = formModel.org;
            params.teamId = e == 'all' ? '' : e;
            getTeamUserList(params).then((res) => {
              if (res) {
                teamPersonOptions.value = res.map((item: any) => {
                  return {
                    label: item.realname,
                    value: item.id,
                  };
                });
                updateSchema({
                  field: 'teamDutyPerson',
                  componentProps: {
                    options: teamPersonOptions.value,
                  },
                });
              }
            });
          },
        };
      },
      ifShow: () => {
        if (flowType.value == '2') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '车间责任人',
      field: 'departDutyPerson',
      component: 'JSelectMultiple',
      required: true,
      ifShow: () => {
        if (flowType.value == '2' && dangerRecordData.value.currentNode != '11' && dangerRecordData.value.currentNode != '12') {
          return true;
        } else {
          return false;
        }
      },
      componentProps: () => {
        return {
          options: personOptions.value,
          placeholder: '请选择',
          mode: 'multiple',
          showSearch: true,
          onChange: (e: any) => {
            console.log('departDutyPerson multiple', e);
            // 最多不超过五个
            if (e && e.split(',').length > 5) {
              createMessage.error('最多选择五个责任人');
              e = e.split(',').slice(0, 5).join(',');
              setFieldsValue({ departDutyPerson: e });
            }
          },
        };
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '班组责任人',
      field: 'teamDutyPerson',
      component: 'JSelectMultiple',
      ifShow: () => {
        if (flowType.value == '2' && dangerRecordData.value.currentNode != '11' && dangerRecordData.value.currentNode != '12') {
          return true;
        } else {
          return false;
        }
      },
      componentProps: () => {
        return {
          options: personOptions.value,
          placeholder: '请选择',
          mode: 'multiple',
          showSearch: true,
          onChange: (e: any) => {
            console.log('teamDutyPerson multiple', e);
            // 最多不超过五个
            if (e && e.split(',').length > 5) {
              createMessage.error('最多选择五个责任人');
              e = e.split(',').slice(0, 5).join(',');
              setFieldsValue({ teamDutyPerson: e });
            }
          },
        };
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '隐患等级',
      field: 'yhLevel',
      component: 'Select',
      required: true,
      componentProps: () => {
        return {
          options: [
            { label: '一般', value: '1' },
            { label: '重大', value: '2' },
          ],
          placeholder: '请选择',
        };
      },
      colProps: {
        span: 12,
        style: 'margin-right:300px',
      },
    },
    {
      label: '检查日期',
      field: 'checkTime',
      component: 'DatePicker',
      required: true,
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: { width: '100%' },
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '检查人',
      field: 'checkPersonName',
      component: 'Input',
      // defaultValue: userinfo.value.realname,
      required: true,
      colProps: {
        span: 12,
      },
    },
    {
      label: '隐患分类',
      field: 'yhType',
      required: true,
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'sk_yh_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      ifShow: ({ values }) => {
        if (flowType.value == '2' && dangerRecordData.value.yhLevel == '1' && dangerRecordData.value.currentNode !== '5') {
          return false;
        } else if (flowType.value == '2' && dangerRecordData.value.yhLevel == '2' && dangerRecordData.value.currentNode == '21') {
          return false;
        } else {
          return true;
        }
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '子类',
      field: 'yhTypeSub',
      required: true,
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'sk_yh_type_sub',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      ifShow: ({ values }) => {
        if (flowType.value == '2' && dangerRecordData.value.yhLevel == '1' && dangerRecordData.value.currentNode !== '5') {
          return false;
        } else if (flowType.value == '2' && dangerRecordData.value.yhLevel == '2' && dangerRecordData.value.currentNode == '21') {
          return false;
        } else {
          return true;
        }
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '风险ID',
      field: 'riskId',
      component: 'InputTextArea',
      componentProps: ({ formModel, formActionType }) => {
        return {
          autoSize: true,
          placeholder: '请选择',
          readOnly: true,
          onClick: () => {
            openRiskPointsModal(true, { riskId: riskIdEdit.value, data: riskDataSource.value, orgCode: formModel.org, departCode: formModel.depart });
          },
          onChange: (val) => {
            if (!val.target.value || val.target.value === '') {
              riskIdEdit.value = [];
              riskDataSource.value = [];
            }
          },
        };
      },
      colProps: {
        span: 12,
      },
    },
    {
      field: 'remark',
      label: '备注',
      component: 'Input',
      componentProps: {
        maxlength: 100,
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '整改要求',
      field: 'repairRequire',
      component: 'RadioGroup',
      required: () => {
        if (!showFooter.value) {
          return false;
        } else {
          return true;
        }
      },
      componentProps: ({ formActionType, formModel }) => {
        return {
          options: [
            { label: '现场整改', value: '1' },
            { label: '限期整改', value: '2' },
          ],
        };
      },
      colProps: { span: 12 },
    },
    {
      label: '整改期限',
      field: 'repairTimeLimit',
      component: 'DatePicker',
      required: () => {
        if (!showFooter.value) {
          return false;
        } else {
          return true;
        }
      },
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: { width: '100%' },
        disabledDate: (currentDate) => {
          return currentDate < dayjs().startOf('day');
        },
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '整改后照片',
      field: 'repairPicture',
      component: 'JImageUpload',
      componentProps: {
        fileMax: 10,
        text: '',
        isYhWatermark: true,
      },
      ifShow: ({ values }) => {
        return values.repairRequire == '1' ? true : false;
      },
      required: () => {
        if (flowType.value == '2' && detailData.value.currentNode == '21' && detailData.value.repairRequire == '1') {
          return true;
        } else {
          return false;
        }
      },
      dynamicDisabled: () => {
        if (
          detailData.value.currentNode !== '12' &&
          detailData.value.currentNode !== '11' &&
          !(detailData.value.flowType == '2' && detailData.value.currentNode == '21')
        ) {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        style: 'margin-left: -95px',
      },
    },
    {
      label: '整改人',
      field: 'repairPerson',
      component: 'Select',
      required: true,
      componentProps: ({ formActionType, formModel }) => {
        return {
          options: repairPersonOptions.value,
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        };
      },
      ifShow: ({ values }) => {
        if (flowType.value == '2' && values.yhLevel == '1' && detailData.value.currentNode != '22') {
          return true;
        } else {
          return false;
        }
      },
      colProps: {
        span: 12,
      },
    },
    {
      label: '建议整改措施',
      field: 'sugRepairMsr',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        autoSize: false,
        rows: 3,
        maxlength: 300,
        showCount: true,
      },
      ifShow: ({ values }) => {
        return values.repairRequire == '2' ? true : false;
      },
      colProps: {
        style: 'margin-left: -95px',
      },
    },
  ];
  // 注册表单
  const [registerForm, { clearValidate, validate, setFieldsValue, resetSchema, resetFields, setProps, updateSchema }] = useForm({
    schemas: schemas,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 18 },
    },
  });

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    setDrawerProps({ confirmLoading: false });
    await resetSchema(schemas);
    await resetFields();
    flowList.value = [];
    loading.value = true;
    // 获取处理流程
    getFlowList({ id: data.record.id }).then((res) => {
      console.log('getFlowList', res);
      loading.value = false;
      flowList.value = res;
    });
    dangerRecordData.value = data.record;
    isUpdate.value = !!data?.isUpdate;
    showFooter.value = !!data?.showFooter;
    sourceType.value = dangerRecordData.value.sourceType;
    flowType.value = dangerRecordData.value.flowType;
    repairPersonOptions.value = [];
    detailData.value = {};
    rejectInfo.value.rejectReason = '';
    if (personInfo.value.assignee1) {
      personInfo.value.assignee1 = undefined;
    }
    if (personInfo.value.assignee2) {
      personInfo.value.assignee2 = undefined;
    }
    //如果node是以3或4开头的
    if ((data.record.currentNode.startsWith('3') || data.record.currentNode.startsWith('4')) && showFooter.value) {
      activeKey.value = '3';
    } else {
      activeKey.value = '1';
    }

    fileList.value = '';
    fileList1.value = '';
    nextAssignees.value = [];
    personInfo.value = {};
    teamOptions.value = [];
    if (data.record.yhLevel) {
      // 获取节点处理人列表
      let params: any = {};
      params.currentNode = data.record.currentNode;
      params.flowType = data.record.flowType;
      params.yhLevel = data.record.yhLevel;
      params.repairRequire = data.record.repairRequire;
      params.org = data.record.org;
      params.depart = data.record.depart;
      getNextPerson(params);
    }

    // 重置ino
    resetInfo();

    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      // 查询详情
      detailData.value = await getDangerDetail({ id: data.record.id });
      console.log('detailData', detailData.value);
      //表单赋值
      await setFieldsValue({
        ...detailData.value,
      });
      // 给info的车间负责人和班组责任人赋值
      if (detailData.value.departDutyPerson) {
        info.value.departDutyPerson = detailData.value.departDutyPerson.split(',');
      }
      if (detailData.value.teamDutyPerson) {
        info.value.teamDutyPerson = detailData.value.teamDutyPerson.split(',');
      }
      // 获取班组责任人
      let params3: any = {};
      params3.orgCode = detailData.value.org;
      params3.teamId = detailData.value.team == 'all' ? '' : detailData.value.team;
      getTeamUserList(params3).then((res) => {
        if (res) {
          teamPersonOptions.value = res.map((item: any) => {
            return {
              label: item.realname + item.workNo,
              value: item.id,
            };
          });
        }
      });

      if (detailData.value.flowType == '1' && detailData.value.yhLevel == '1') {
        if (detailData.value.depart) {
          info.value.depart = detailData.value.depart;
          handleDepartSelectChange(detailData.value.depart);
        }
      }
      // 车间下拉框
      if (detailData.value.org) {
        let params: any = {};
        params.orgCode = detailData.value.org;
        params.pageSize = 9999;
        params.pageNo = 1;
        getDepartmentList(params).then((res) => {
          if (res && res.length > 0) {
            departOptions.value = res.map((item) => {
              return {
                label: item.departName,
                value: item.orgCode,
              };
            });
          } else {
            departOptions.value = [];
          }
        });
      }
      // 隐患照片
      if (detailData.value.yhPicture) {
        fileList.value = detailData.value.yhPicture;
      } else {
        fileList.value = '';
      }
      console.log('fileList.value ', fileList.value, detailData.value.yhPicture);
      // 整改后照片
      if (detailData.value.repairPicture) {
        fileList1.value = detailData.value.repairPicture;
      } else {
        fileList1.value = '';
      }
      if (detailData.value.repairLogList && detailData.value.repairLogList.length > 0) {
        detailData.value.repairLogList.forEach((item) => {
          if (item.repairPlan) {
            item.repairPlanList = item.repairPlan.split(',').map((item1) => {
              return getFileAccessHttpUrl(item1);
            });
            console.log('item.repairPlanList', item.repairPlanList);
          }
          if (item.repairPicture) {
            item.repairPictureList = item.repairPicture.split(',').map((item1) => {
              return {
                uid: item1,
                name: item1,
                url: getFileAccessHttpUrl(item1),
              };
            });
          }
          if (item.handlePicture) {
            item.handlePictureList = item.handlePicture.split(',').map((item1) => {
              return {
                uid: item1,
                name: item1,
                url: getFileAccessHttpUrl(item1),
              };
            });
          }
        });
      }

      // 获取车间责任人列表
      let params: any = {};
      if (detailData.value.org) {
        params.orgCode = detailData.value.org;
      }
      params.pageSize = 9999;
      params.pageNo = 1;
      await getUserList(params).then((res) => {
        if (res) {
          personOptions.value = res.map((item: any) => {
            return {
              label: item.realname,
              value: item.id,
            };
          });
        }
      });
      let params1: any = {};
      if (detailData.value.org) {
        params1.workShopCode = detailData.value.org;
      } 
      getTeamList(params1).then((res) => {
        if (res) {
          teamOptions.value = res.map((item: any) => {
            return {
              label: item.sectionName,
              value: item.id,
            };
          });
          updateSchema({
            field: 'team',
            componentProps: ({ formModel, formActionType }) => {
              return {
                options: teamOptions.value,
                placeholder: '请选择',
                onChange: (e: any) => {
                  console.log('team', e);
                  formModel.teamDutyPerson = undefined;
                  let params: any = {};
                  params.orgCode = formModel.org;
                  params.teamId = e == 'all' ? '' : e;
                  getTeamUserList(params).then((res) => {
                    if (res) {
                      teamPersonOptions.value = res.map((item: any) => {
                        return {
                          label: item.realname,
                          value: item.id,
                        };
                      });
                      updateSchema({
                        field: 'teamDutyPerson',
                        componentProps: {
                          options: teamPersonOptions.value,
                        },
                      });
                    }
                  });
                },
              };
            },
          });
        } else {
          updateSchema({
            field: 'team',
            componentProps: {
              options: [],
            },
          });
        }
      });
      if (detailData.value.org) {
        let params2: any = {};
        params2.orgCode = detailData.value.org;
        params2.pageSize = 9999;
        params2.pageNo = 1;
        await getUserList(params2).then((res) => {
          if (res) {
            repairPersonOptions.value = res.map((item: any) => {
              return {
                label: item.realname,
                value: item.id,
              };
            });
          }
        });
      }
    }

    if (!showFooter.value) {
      console.log('查看信息', showFooter.value);
      // // 隐患等级可编辑
      // await updateSchema({
      //   field: 'yhLevel',
      //   dynamicDisabled: true,
      //   required: false,
      // });
      // await updateSchema({
      //   field: 'repairPerson',
      //   dynamicDisabled: true,
      //   required: false,
      //   ifShow: ({ values }) => {
      //     if (flowType.value == '2' && detailData.value.yhLevel == '1') {
      //       return true;
      //     } else {
      //       return false;
      //     }
      //   },
      // });
      // // 隐藏隐患分类和子类
      // await updateSchema({
      //   field: 'yhType',
      //   required: false,
      //   ifShow: true,
      //   dynamicDisabled: true,
      // });
      // await updateSchema({
      //   field: 'yhTypeSub',
      //   required: false,
      //   ifShow: true,
      //   dynamicDisabled: true,
      // });
      // //备注可编辑
      // await updateSchema({
      //   field: 'remark',
      //   dynamicDisabled: true,
      // });
      // // 隐患描述可编辑
      // await updateSchema({
      //   field: 'yhDescription',
      //   dynamicDisabled: true,
      // });
      // // 隐患照片可编辑
      // await updateSchema({
      //   field: 'yhPicture',
      //   dynamicDisabled: true,
      // });
      // // 整改期限可编辑
      // await updateSchema({
      //   field: 'repairTimeLimit',
      //   dynamicDisabled: true,
      //   required: false,
      // });
      // // 建议整改措施可编辑
      // await updateSchema({
      //   field: 'sugRepairMsr',
      //   dynamicDisabled: true,
      // });
      // // 整改要求可编辑
      // await updateSchema({
      //   field: 'repairRequire',
      //   defaultValue: '1',
      //   dynamicDisabled: true,
      // });
      // // 所属班组
      // await updateSchema({
      //   field: 'team',
      //   dynamicDisabled: true,
      // });
      // // 车间责任人
      // await updateSchema({
      //   field: 'departDutyPerson',
      //   dynamicDisabled: true,
      // });
      // // 班组责任人
      // await updateSchema({
      //   field: 'teamDutyPerson',
      //   dynamicDisabled: true,
      // });
      // //表单赋值
      // await setFieldsValue({
      //   ...detailData.value,
      // });

      await clearValidate();
      // 隐藏底部时禁用整个表单
      setProps({ disabled: !showFooter.value });
    } else {
      //表单赋值
      await setFieldsValue({
        ...detailData.value,
      });

      console.log('处理', showFooter.value);
      // 禁用整个表单-11\12节点除外
      setProps({ disabled: detailData.value.currentNode != '12' });
      // 隐藏底部时禁用整个表单
      if (flowType.value == '2' && dangerRecordData.value.currentNode == '21' && sourceType.value == '3') {
        setProps({ disabled: true });
        // 所属班组可修改
        await updateSchema({
          field: 'team',
          dynamicDisabled: false,
        });
        // 车间责任人可修改
        await updateSchema({
          field: 'departDutyPerson',
          dynamicDisabled: false,
        });
        // 班组责任人可修改
        await updateSchema({
          field: 'teamDutyPerson',
          dynamicDisabled: false,
        });
        // 整改人后照片可修改
        await updateSchema({
          field: 'repairPicture',
          dynamicDisabled: false,
        });
      }
      // 隐患来源-隐患排查产生的台账-填写必填表单
      if (dangerRecordData.value.sourceType !== '3') {
        if (dangerRecordData.value.currentNode == '11' && flowType.value !== '2') {
          // 隐患等级可编辑
          await updateSchema({
            field: 'yhLevel',
            dynamicDisabled: false,
            required: true,
          });
          // 隐藏隐患分类和子类
          await updateSchema({
            field: 'yhType',
            ifShow: true,
            dynamicDisabled: false,
            required: true,
          });
          await updateSchema({
            field: 'yhTypeSub',
            ifShow: true,
            dynamicDisabled: false,
            required: true,
          });
          //备注可编辑
          await updateSchema({
            field: 'remark',
            dynamicDisabled: false,
          });
          // 隐患描述可编辑
          await updateSchema({
            field: 'yhDescription',
            dynamicDisabled: false,
          });
          // 隐患照片可编辑
          await updateSchema({
            field: 'yhPicture',
            dynamicDisabled: false,
          });
          // 整改期限可编辑
          await updateSchema({
            field: 'repairTimeLimit',
            dynamicDisabled: false,
            required: true,
          });
          // 整改后照片可编辑
          // 所属班组可修改
          await updateSchema({
            field: 'team',
            dynamicDisabled: false,
          });
          // 建议整改措施可编辑
          await updateSchema({
            field: 'sugRepairMsr',
            dynamicDisabled: false,
          });
          // 整改要求可编辑
          await updateSchema({
            field: 'repairRequire',
            defaultValue: '1',
            dynamicDisabled: false,
          });
        }
        if (dangerRecordData.value.currentNode == '21' && flowType.value == '2') {
          // 整改照片可编辑
          await updateSchema({
            field: 'repairPicture',
            dynamicDisabled: false,
          });
          // 所属单位
          await updateSchema({
            field: 'org',
            dynamicDisabled: true,
          });
          // 车间
          await updateSchema({
            field: 'depart',
            dynamicDisabled: true,
          });
          // 风险ID
          await updateSchema({
            field: 'riskId',
            dynamicDisabled: true,
          });
          // 隐患等级可编辑
          await updateSchema({
            field: 'yhLevel',
            dynamicDisabled: false,
          });
          //隐患分类可编辑
          await updateSchema({
            field: 'yhType',
            ifShow: false,
          });
          //隐患分类子类可编辑
          await updateSchema({
            field: 'yhTypeSub',
            ifShow: false,
          });
          //备注可编辑
          await updateSchema({
            field: 'remark',
            dynamicDisabled: false,
          });
          // 隐患描述可编辑
          await updateSchema({
            field: 'yhDescription',
            dynamicDisabled: false,
          });
          // 隐患照片可编辑
          await updateSchema({
            field: 'yhPicture',
            dynamicDisabled: false,
          });
          // 整改期限可编辑
          await updateSchema({
            field: 'repairTimeLimit',
            dynamicDisabled: false,
          });

          // 建议整改措施可编辑
          await updateSchema({
            field: 'sugRepairMsr',
            dynamicDisabled: false,
          });
          // 整改要求可编辑
          await updateSchema({
            field: 'repairRequire',
            defaultValue: '1',
            dynamicDisabled: false,
          });
          // 检查日期
          await updateSchema({
            field: 'checkTime',
            dynamicDisabled: true,
          });
          // 整改后照片可编辑
          await updateSchema({
            field: 'repairPicture',
            dynamicDisabled: false,
          });
          // 所属班组可修改
          await updateSchema({
            field: 'team',
            dynamicDisabled: false,
          });
          // 车间责任人可修改
          await updateSchema({
            field: 'departDutyPerson',
            dynamicDisabled: false,
          });
          // 班组责任人可修改
          await updateSchema({
            field: 'teamDutyPerson',
            dynamicDisabled: false,
          });
          // 整改人可修改
          await updateSchema({
            field: 'repairPerson',
            dynamicDisabled: false,
          });
        }
      }
      if (dangerRecordData.value.flowType == '2' && dangerRecordData.value.yhLevel == '2' && dangerRecordData.value.currentNode == '22') {
        // 更新隐患等级
        await updateSchema({
          field: 'yhLevel',
          required: true,
          dynamicDisabled: false,
          // change 事件
          componentProps: () => {
            return {
              options: [
                { label: '一般', value: '1' },
                { label: '重大', value: '2' },
              ],
              placeholder: '请选择',
              onChange: (e) => {
                dangerRecordData.value.yhLevel = e;
                detailData.value.yhLevel = e;
                // if(e=='2'){
                //   handleLevelChange(e);
                //  }
              },
            };
          },
        });
        // 更新隐患分类
        await updateSchema({
          field: 'yhType',
          required: true,
          dynamicDisabled: false,
          ifShow: true,
        });
        // 更新隐患分类子类
        await updateSchema({
          field: 'yhTypeSub',
          required: true,
          dynamicDisabled: false,
          ifShow: true,
        });
        // 隐患描述不可修改
        await updateSchema({
          field: 'yhDescription',
          dynamicDisabled: true,
        });
        // 整改期限不可修改
        await updateSchema({
          field: 'repairTimeLimit',
          dynamicDisabled: true,
        });
        // 整改要求不可修改
        await updateSchema({
          field: 'repairRequire',
          dynamicDisabled: true,
        });
        // 整改建议措施不可修改
        await updateSchema({
          field: 'sugRepairMsr',
          dynamicDisabled: true,
        });
      }
      // 流程2-一般隐患- 隐患等级设置默认值
      if (
        (detailData.value.currentNode == '41' &&
          detailData.value.flowType == '2' &&
          detailData.value.yhLevel == '1' &&
          detailData.value.repairRequire == '1') ||
        (detailData.value.currentNode == '42' &&
          detailData.value.flowType == '2' &&
          detailData.value.yhLevel == '1' &&
          detailData.value.repairRequire == '2')
      ) {
        if (detailData.value.yhLevel) {
          info.value.yhLevelNew = detailData.value.yhLevel;
        }
        if (detailData.value.yhType) {
          info.value.yhType = detailData.value.yhType;
        }
        if (detailData.value.yhTypeSub) {
          info.value.yhTypeSub = detailData.value.yhTypeSub;
        }
      }
    }
  });

  // 加载部门数
  loadRoot();
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
  // 整改验收表单提交事件
  async function handleSubmitThree() {
    console.log('info', info.value);
    if (info.value.team) {
      // 遍历查询teamName
      for (let i of teamOptions.value) {
        if (i.value == info.value.team) {
          info.value.teamName = i.label;
          break;
        }
      }
    }
    // 流程3-一般隐患-现场整改
    if (
      detailData.value.flowType == '3' &&
      detailData.value.yhLevel == '1' &&
      detailData.value.repairRequire == '1' &&
      detailData.value.currentNode == '31'
    ) {
      await formRef.value.validate();
      let params = Object.assign({}, info.value);
      params.confirmId = dangerRecordData.value.id;
      params.departDutyPerson = params.departDutyPerson.join(',');
      params.teamDutyPerson = params.teamDutyPerson.join(',');
      params = Object.assign(params, personInfo.value);
      console.log('params', params);
      await dealDanger(params).then(() => {
        closeDrawer();
        personVisible.value = false;
        emit('success');
      });
    }
    // 流程3-一般隐患-限时整改
    if (
      detailData.value.flowType == '3' &&
      detailData.value.yhLevel == '1' &&
      detailData.value.repairRequire == '2' &&
      (detailData.value.currentNode == '31' || detailData.value.currentNode == '32' || detailData.value.currentNode == '35')
    ) {
      await formRef.value.validate();
      let params = Object.assign({}, info.value);
      params.confirmId = dangerRecordData.value.id;
      delete params.departDutyPerson;
      delete params.teamDutyPerson;
      params = Object.assign(params, personInfo.value);
      console.log('params', params);
      await dealDanger(params).then(() => {
        closeDrawer();
        personVisible.value = false;
        emit('success');
      });
    }
    // 流程3、1-重大隐患-整改
    if (
      (detailData.value.flowType == '3' || detailData.value.flowType == '1' || detailData.value.flowType == '2') &&
      detailData.value.yhLevel == '2' &&
      (detailData.value.currentNode == '31' ||
        detailData.value.currentNode == '32' ||
        detailData.value.currentNode == '33' ||
        detailData.value.currentNode == '34' ||
        detailData.value.currentNode == '35')
    ) {
      await formRef.value.validate();
      let params = Object.assign({}, info.value);
      params.confirmId = dangerRecordData.value.id;
      params.departDutyPerson = params.departDutyPerson.join(',');
      params.teamDutyPerson = params.teamDutyPerson.join(',');
      // if (params.checkResult) {
      //   // 处理说明和处理图片二选一填写
      //   if (!params.handleExplain && !params.handlePicture) {
      //     createMessage.error('处理说明和处理图片必须填写一项');
      //     return;
      //   }
      // }
      params = Object.assign(params, personInfo.value);
      console.log('params', params);
      await dealDanger(params).then(() => {
        closeDrawer();
        personVisible.value = false;
        emit('success');
      });
    }
    // 流程1-一般隐患-现场整改
    if (
      detailData.value.flowType == '1' &&
      detailData.value.yhLevel == '1' &&
      detailData.value.repairRequire == '1' &&
      detailData.value.currentNode == '31'
    ) {
      await formRef.value.validate();
      let params = Object.assign({}, info.value);
      params.confirmId = dangerRecordData.value.id;
      params.departDutyPerson = params.departDutyPerson.join(',');
      params.teamDutyPerson = params.teamDutyPerson.join(',');
      // 处理说明和处理图片二选一必填
      // if (!params.handleExplain && !params.handlePicture) {
      //   createMessage.error('处理说明和处理图片必须填写一项');
      //   return;
      // }
      params = Object.assign(params, personInfo.value);
      console.log('params', params);
      await dealDanger(params).then(() => {
        closeDrawer();
        personVisible.value = false;
        emit('success');
      });
    }
    // 流程1-一般隐患-限时整改31
    if (
      detailData.value.flowType == '1' &&
      detailData.value.yhLevel == '1' &&
      detailData.value.repairRequire == '2' &&
      detailData.value.currentNode == '31'
    ) {
      await formRef.value.validate();
      let params = Object.assign({}, info.value);
      params.confirmId = dangerRecordData.value.id;
      delete params.departDutyPerson;
      delete params.teamDutyPerson;
      params = Object.assign(params, personInfo.value);
      console.log('params', params);
      await dealDanger(params).then(() => {
        closeDrawer();
        personVisible.value = false;
        emit('success');
      });
    }
    // 流程1-一般隐患-限时整改32
    if (
      detailData.value.flowType == '1' &&
      detailData.value.repairRequire == '2' &&
      detailData.value.yhLevel == '1' &&
      (detailData.value.currentNode == '32' || detailData.value.currentNode == '33' || detailData.value.currentNode == '35')
    ) {
      await formRef.value.validate();
      let params = Object.assign({}, info.value);
      params.confirmId = dangerRecordData.value.id;
      delete params.departDutyPerson;
      delete params.teamDutyPerson;
      delete params.depart;
      params = Object.assign(params, personInfo.value);
      console.log('params', params);
      await dealDanger(params).then(() => {
        closeDrawer();
        personVisible.value = false;
        emit('success');
      });
    }
    // 流程-验收
    if (detailData.value.currentNode == '41' || detailData.value.currentNode == '42' || detailData.value.currentNode == '43') {
      await formRef.value.validate();
      let params = Object.assign({}, info.value);
      if (info.value.yhLevelNew) {
        params.yhLevel = info.value.yhLevelNew;
      }
      delete params.yhLevelNew;
      params.confirmId = dangerRecordData.value.id;
      // if (params.checkResult) {
      //   // 处理说明和处理图片二选一填写
      //   if (!params.handleExplain && !params.handlePicture) {
      //     createMessage.error('处理说明和处理图片必须填写一项');
      //     return;
      //   }
      // }
      if (params.departDutyPerson) {
        params.departDutyPerson = params.departDutyPerson.join(',');
      } else {
        delete params.departDutyPerson;
      }
      if (params.teamDutyPerson) {
        params.teamDutyPerson = params.teamDutyPerson.join(',');
      } else {
        delete params.teamDutyPerson;
      }
      params = Object.assign(params, personInfo.value);
      console.log('params', params);
      await dealDanger(params).then(() => {
        closeDrawer();
        personVisible.value = false;
        emit('success');
      });
    }
    // 流程2-一般隐患-限时整改31
    if (
      detailData.value.flowType == '2' &&
      detailData.value.yhLevel == '1' &&
      detailData.value.repairRequire == '2' &&
      (detailData.value.currentNode == '31' || detailData.value.currentNode == '35')
    ) {
      await formRef.value.validate();
      let params = Object.assign({}, info.value);
      params.confirmId = dangerRecordData.value.id;
      delete params.departDutyPerson;
      delete params.teamDutyPerson;
      params = Object.assign(params, personInfo.value);
      console.log('params', params);
      await dealDanger(params).then(() => {
        closeDrawer();
        personVisible.value = false;
        emit('success');
      });
    }
  }
  //整改验收 判断是否需要选择人员
  async function handleSubmitSure() {
    let values = await formRef.value.validate();
    // 安全部-一般隐患-限时整改
    if (
      detailData.value.flowType == '1' &&
      detailData.value.yhLevel == '1' &&
      detailData.value.repairRequire == '2' &&
      detailData.value.currentNode == '41'
    ) {
      // 验收不通过直接退回到整改人，不需要弹框
      if (values.checkResult == '2') {
        handleSubmitThree();
      } else {
        // 弹出选择人员弹框
        personVisible.value = true;
        submitType.value = 'three';
      }
    } else if (
      detailData.value.flowType == '1' &&
      detailData.value.yhLevel == '1' &&
      detailData.value.repairRequire == '1' &&
      detailData.value.currentNode == '41'
    ) {
      handleSubmitThree();
      return;
    }
    // 安全部-重大隐患
    else if (
      detailData.value.flowType == '1' &&
      detailData.value.yhLevel == '2' &&
      (detailData.value.currentNode == '31' || detailData.value.currentNode == '41')
    ) {
      // 弹出选择人员弹框
      personVisible.value = true;
      submitType.value = 'three';
    }
    // 分厂车间班组-一般隐患-现场整改-41
    else if (
      detailData.value.flowType == '2' &&
      detailData.value.yhLevel == '1' &&
      detailData.value.repairRequire == '1' &&
      detailData.value.currentNode == '41'
    ) {
      // 验收不通过直接退回到整改人，不需要弹框
      if (values.yhLevelNew == '2') {
        // 弹出选择人员弹框
        personVisible.value = true;
        submitType.value = 'three';
      } else {
        handleSubmitThree();
      }
    }
    // 分厂车间班组-一般隐患-限期整改-41
    else if (
      detailData.value.flowType == '2' &&
      detailData.value.yhLevel == '1' &&
      detailData.value.repairRequire == '2' &&
      detailData.value.currentNode == '41'
    ) {
      // 验收不通过直接退回到整改人，不需要弹框
      if (values.checkResult == '2') {
        handleSubmitThree();
      } else {
        // 弹出选择人员弹框
        personVisible.value = true;
        submitType.value = 'three';
      }
    }
    //分厂车间班组-重大隐患
    else if (
      detailData.value.flowType == '2' &&
      detailData.value.yhLevel == '2' &&
      (detailData.value.currentNode == '31' || detailData.value.currentNode == '41')
    ) {
      // 弹出选择人员弹框
      personVisible.value = true;
      submitType.value = 'three';
    }
    //分厂安全科-重大隐患
    else if (
      detailData.value.flowType == '3' &&
      detailData.value.yhLevel == '2' &&
      (detailData.value.currentNode == '31' || detailData.value.currentNode == '41')
    ) {
      // 弹出选择人员弹框
      personVisible.value = true;
      submitType.value = 'three';
    } else {
      handleSubmitThree();
    }
  }
  function resetInfo() {
    // 初始化info
    info.value = {
      departDutyPerson: [],
      teamDutyPerson: [],
      repairPerson: undefined,
      repairPlan: undefined,
      tempMsr: undefined,
      repairPicture: undefined,
      repairResult: undefined,
      repairMsr: undefined,
      checkResult: undefined,
      handleExplain: undefined,
      handlePicture: undefined,
    };
  }
  const disabledDate = (current: Dayjs) => {
    // Can not select days before today
    return current < dayjs().startOf('day');
  };
  //退回
  async function handleRejectBack() {
    visibleReject.value = true;
  }
  // 11、12节点
  async function handleSubmitOne() {
    const values = await validate();
    values.yhPicture = fileList.value;
    values.repairPicture = fileList1.value;
    let params = Object.assign({}, values);
    params.confirmId = dangerRecordData.value.id;
    params.sourceType = dangerRecordData.value.sourceType;
    delete params.id;
    params = Object.assign(params, personInfo.value);
    if (params.team) {
      // 遍历查询teamName
      for (let i of teamOptions.value) {
        if (i.value == params.team) {
          params.teamName = i.label;
          break;
        }
      }
    }
    console.log('params', params);
    dealDanger(params).then(() => {
      closeDrawer();
      personVisible.value = false;
      emit('success');
    });
  }
  // 重新提交
  async function handleSubmitAgain() {
    const values = await validate();
    let params: any = {};
    params.currentNode = dangerRecordData.value.currentNode;
    params.flowType = dangerRecordData.value.flowType;
    params.yhLevel = values.yhLevel;
    params.repairRequire = values.repairRequire;
    params.org = dangerRecordData.value.org;
    params.depart = dangerRecordData.value.depart;
    await getNextPerson(params);

    // 弹出选择人员弹框
    personVisible.value = true;
    submitType.value = 'one';
  }
  async function handleRejectOk() {
    await infoRef.value.validate();
    let params = {
      confirmId: dangerRecordData.value.id,
      confirmResult: '2', //（1确认下发 2退回 3加签）
      confirmExplain: rejectInfo.value.rejectReason,
    };
    console.log('params', params);
    dealDanger(params).then(() => {
      visibleReject.value = false;
      closeDrawer();
      emit('success');
    });
  }
  // 确认下发提交
  async function handleSubmitTwo() {
    const values = await validate();
    if (!values) return;
    if (detailData.value.flowType == '2' && detailData.value.currentNode == '21') {
      const values = await validate();
      if (!values) return;
      let params = {
        confirmId: dangerRecordData.value.id,
        confirmResult: '1', //（1确认下发 2退回 3加签）
      };
      values.yhPicture = fileList.value;
      values.repairPicture = fileList1.value;
      params = Object.assign(params, values);
      delete params.id;
      params = Object.assign(params, personInfo.value);
      if (params.team) {
        // 遍历查询teamName
        for (let i of teamOptions.value) {
          if (i.value == params.team) {
            params.teamName = i.label;
            break;
          }
        }
      }
      dealDanger(params).then(() => {
        closeDrawer();
        personVisible.value = false;
        emit('success');
      });
    } else {
      console.log('handleSubmitTwo values', values);
      createConfirm({
        iconType: 'warning',
        title: '确认下发',
        content: '确认下发后将无法再次修改，是否确认下发？',
        onOk: async () => {
          const values = await validate();
          if (!values) return;
          let params = {
            confirmId: dangerRecordData.value.id,
            confirmResult: '1', //（1确认下发 2退回 3加签）
          };
          values.yhPicture = fileList.value;
          values.repairPicture = fileList1.value;
          params = Object.assign(params, values);
          delete params.id;
          // if (detailData.value.flowType == '2' && detailData.value.yhLevel == '1' && detailData.value.repairRequire == '2') {
          //   params.repairPerson = values.repairPerson;
          // }
          // if (detailData.value.flowType == '2' && detailData.value.yhLevel == '2' && detailData.value.currentNode == '21') {
          //   params = Object.assign(params, values);
          // }
          params = Object.assign(params, personInfo.value);
          if (params.team) {
            // 遍历查询teamName
            for (let i of teamOptions.value) {
              if (i.value == params.team) {
                params.teamName = i.label;
                break;
              }
            }
          }
          dealDanger(params).then(() => {
            closeDrawer();
            personVisible.value = false;
            emit('success');
          });
        },
      });
    }
  }
  // 确认下发选不选人
  async function confirmPublish() {
    console.log('confirmPublish');
    const values = await validate();
    if (!values) return;
    console.log('confirmPublish values', values);
    if (flowType.value == '2' && (detailData.value.currentNode == '21' || detailData.value.currentNode == '22')) {
      detailData.value.yhLevel = values.yhLevel;
      detailData.value.repairRequire = values.repairRequire;
      dangerRecordData.value.yhLevel = values.yhLevel;
      dangerRecordData.value.repairRequire = values.repairRequire;
    }
    // 安全部-一般隐患-限时整改（第二次需求变更：领导不选人，挪到上一步）
    // if (
    //   detailData.value.flowType == '1' &&
    //   detailData.value.yhLevel == '1' &&
    //   detailData.value.repairRequire == '2' &&
    //   detailData.value.currentNode == '21'
    // ) {
    //   // 弹出选择人员弹框
    //   personVisible.value = true;
    //   submitType.value = 'two';
    // }
    // 安全部-重大隐患（去掉21节点）
    if (
      detailData.value.flowType == '1' &&
      detailData.value.yhLevel == '2' &&
      (detailData.value.currentNode == '22' || detailData.value.currentNode == '24')
    ) {
      // 弹出选择人员弹框
      personVisible.value = true;
      submitType.value = 'two';
    }
    // 分厂车间班组-一般隐患-现场整改
    // else if (
    //   detailData.value.flowType == '2' &&
    //   detailData.value.yhLevel == '1' &&
    //   detailData.value.repairRequire == '1' &&
    //   detailData.value.currentNode == '21'
    // ) {
    //   // 弹出选择人员弹框
    //   personVisible.value = true;
    //   submitType.value = 'two';
    //   if (sourceType.value == '1') {
    //     // 获取下一个节点的人员
    //     handleLevelChange(detailData.value.yhLevel);
    //   }
    // }
    //分厂车间班组-重大隐患
    else if (detailData.value.flowType == '2' && detailData.value.yhLevel == '2' && detailData.value.currentNode == '22') {
      // 弹出选择人员弹框
      personVisible.value = true;
      submitType.value = 'two';
      if (sourceType.value !== '3') {
        // 获取下一个节点的人员
        handleLevelChange(detailData.value.yhLevel);
      }
    }
    //分厂安全科-重大隐患
    else if (detailData.value.flowType == '3' && detailData.value.yhLevel == '2' && detailData.value.currentNode == '21') {
      // 弹出选择人员弹框
      personVisible.value = true;
      submitType.value = 'two';
    } else {
      handleSubmitTwo();
    }
  }
  // 2-1 车间负责人节点21 按钮显示提交
  async function dutyPersonConfirm() {
    const values = await validate();
    if (!values) return;
    if (
      flowType.value == '2' &&
      detailData.value.sourceType !== '3' &&
      (detailData.value.currentNode == '21' || detailData.value.currentNode == '22')
    ) {
      detailData.value.yhLevel = values.yhLevel;
      detailData.value.repairRequire = values.repairRequire;
      dangerRecordData.value.yhLevel = values.yhLevel;
      dangerRecordData.value.repairRequire = values.repairRequire;
    }
    // 分厂车间班组-一般隐患-现场整改
    if (
      detailData.value.flowType == '2' &&
      detailData.value.yhLevel == '1' &&
      detailData.value.repairRequire == '1' &&
      detailData.value.currentNode == '21'
    ) {
      // 弹出选择人员弹框
      personVisible.value = true;
      submitType.value = 'two';
      if (sourceType.value !== '3') {
        // 获取下一个节点的人员
        handleLevelChange(detailData.value.yhLevel);
      }
    }
    // 分厂车间班组-重大隐患
    else if (
      detailData.value.flowType == '2' &&
      detailData.value.yhLevel == '2' &&
      (detailData.value.currentNode == '21' || detailData.value.currentNode == '22')
    ) {
      // 弹出选择人员弹框
      personVisible.value = true;
      submitType.value = 'two';
      if (sourceType.value !== '3') {
        // 获取下一个节点的人员
        handleLevelChange(detailData.value.yhLevel);
      }
    } else {
      handleSubmitTwo();
    }
  }
  function selectRiskPointsOk(data) {
    console.log('selectRiskPointsOk data', data);
    if (data.dataSource.length > 0) {
      riskDataSource.value = data.dataSource;

      setFieldsValue({
        riskId: riskDataSource.value[0].uniqueCode,
      });
      riskIdEdit.value = data.selectedRowKeys;
    }
  }
  function handleDepartSelectChange(e) {
    console.log('handleDepartSelectChange', e);
    info.value.teamDutyPerson = [];
    info.value.departDutyPerson = [];
    info.value.repairPerson = undefined;
    info.value.team = undefined;
    personOptions.value = [];
    teamOptions.value = [];
    if (e) {
      let params1: any = {};
      params1.orgCode = e;
      params1.pageSize = 9999;
      params1.pageNo = 1;
      getUserList(params1).then((res) => {
        if (res) {
          // repairPersonOptions.value = res.map((item: any) => {
          //   return {
          //     label: item.realname,
          //     value: item.id,
          //   };
          // });
          personOptions.value = res.map((item: any) => {
            return {
              label: item.realname,
              value: item.id,
            };
          });
        }
      });
    }
  }
  function handleTeamSelectChange(e) {
    console.log('handleTeamSelectChange', e);
    info.value.teamDutyPerson = [];
    teamPersonOptions.value = [];
    if (e) {
      let params: any = {};
      params.teamId = e == 'all' ? '' : e;
      params.orgCode = detailData.value.org;
      getTeamUserList(params).then((res) => {
        if (res) {
          teamPersonOptions.value = res.map((item: any) => {
            return {
              label: item.realname,
              value: item.id,
            };
          });
        }
      });
    }
  }
  function handleAddSign() {
    openSignUserModal(true, {});
  }
  // 加签弹框返回
  function selectSignUserOk(data) {
    console.log('data', data);
    let params = {
      confirmId: dangerRecordData.value.id,
      confirmResult: '3', //（1确认下发 2退回 3加签）
      addPerson: data.selectedRowKeys[0],
    };
    console.log('params', params);
    dealDanger(params).then(() => {
      closeDrawer();
      emit('success');
    });
  }
  // 查看通知详情
  function handleNoticeDetail(confirmId) {
    console.log('handleNoticeDetail confirmId', confirmId);
    openNoticeDetailDrawer(true, {
      // showFooter: false,
      confirmId,
    });
  }
  async function handlePersonOk() {
    console.log('handlePersonOk');
    const values = await personFormRef.value.validate();
    console.log('handlePersonOk values', values);
    // 11、12节点
    if (submitType.value == 'one') {
      handleSubmitOne();
    }
    // 21、22节点
    if (submitType.value == 'two') {
      handleSubmitTwo();
    }
    // 31、32、33、34、35节点41、42、43
    if (submitType.value == 'three') {
      handleSubmitThree();
    }
  }
  function handleChangePerson(value) {
    console.log('handleChangePerson', value);
    if (value.length > 3) {
      createMessage.error('最多选择3个人');
      value.pop();
    }
  }
</script>
<style lang="less" scoped>
  .step-wrapper {
    padding: 20px 12px;
  }
  .step-wrap {
    width: 100%;
    overflow: auto;
    margin-bottom: 16px;
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
    width: 650px;
    .history-explain {
      width: 100%;
      margin-top: 10px;
      display: flex;
      .explain-label {
        width: 120px;
        text-align: right;
      }
      .explain-text {
        width: 500px;
        color: #666;
      }
    }
  }
  .rectification-pic {
    margin-left: 120px;
  }
</style>
