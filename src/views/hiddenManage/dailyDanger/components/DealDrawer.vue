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
    <a-tabs v-model:activeKey="activeKey" type="card" :destroyInactiveTabPane="true">
      <a-tab-pane key="1" tab="基本信息" :forceRender="true">
        <div class="info-item">
          <div class="label">检查类别：</div>
          <div class="content">
            <!-- 1日常检查 2隐患上报 3综合检查 4季节性检查 5节假日检查 6专项检查 7重大事故隐患检查 8重大风险管控措施检查 9脱水器点检 -->
            <span v-if="recordItem.checkType == '1'">日常检查</span>
            <span v-if="recordItem.checkType == '2'">隐患上报</span>
            <span v-if="recordItem.checkType == '3'">综合检查</span>
            <span v-if="recordItem.checkType == '4'">季节性检查</span>
            <span v-if="recordItem.checkType == '5'">节假日检查</span>
            <span v-if="recordItem.checkType == '6'">专项检查</span>
            <span v-if="recordItem.checkType == '7'">重大事故隐患检查</span>
            <span v-if="recordItem.checkType == '8'">重大风险管控措施检查</span>
            <span v-if="recordItem.checkType == '9'">脱水器点检</span>
          </div>
        </div>
        <div class="info-item">
          <div class="label">隐患照片：</div>
          <div class="content"><JImageUpload :disabled="true" text="" v-model:value="recordItem.yhPicture" /> </div>
        </div>
        <div class="info-item">
          <div class="label">隐患描述：</div>
          <div class="content">{{ recordItem.yhDescription }}</div>
        </div>
        <div class="info-item">
          <div class="label"> 隐患等级：</div>
          <div class="content">
            <span v-if="recordItem.yhLevel == '1'">一般</span>
            <span v-if="recordItem.yhLevel == '2'">重大</span>
          </div>
        </div>
        <!-- 岗位工信息 -->
        <div v-if="ifPostPerson || recordItem.teamLeaderName">
          <div class="info-item">
            <div class="label">班组长：</div>
            <div class="content">{{ recordItem.teamLeaderName }}</div>
          </div>
        </div>
        <div v-if="!ifPostPerson">
          <div class="info-item">
            <div class="label"> 隐患类别：</div>
            <div class="content">{{ recordItem.yhType_dictText }}</div>
          </div>
          <div class="info-item">
            <div class="label"> 隐患子类别：</div>
            <div class="content">{{ recordItem.yhTypeSub_dictText }}</div>
          </div>
          <div class="info-item">
            <div class="label"> 完成时限：</div>
            <div class="content"> {{ recordItem.repairTimeLimit }}</div>
          </div>
        </div>
        <div class="info-item">
          <div class="label">关联风险点：</div>
          <div class="content"> {{ recordItem.riskName }}</div>
        </div>
        <div class="info-item">
          <div class="label">检查人：</div>
          <div class="content">{{ recordItem.checkPersonName }}</div>
        </div>
        <div class="info-item">
          <div class="label">检查时间：</div>
          <div class="content">{{ recordItem.checkTime }}</div>
        </div>
        <div class="info-item">
          <div class="label">检查层级：</div>
          <div class="content">
            <span v-if="recordItem.controlLevel == '1'">安全部</span>
            <span v-if="recordItem.controlLevel == '2'">厂部主要负责人</span>
            <span v-if="recordItem.controlLevel == '3'">厂部安全科</span>
            <span v-if="recordItem.controlLevel == '4'">车间负责人</span>
            <span v-if="recordItem.controlLevel == '5'">班组负责人</span>
            <span v-if="recordItem.controlLevel == '6'">岗位人员</span>
            <span v-if="recordItem.controlLevel == '7'">隐患上报</span>
            <span v-if="recordItem.controlLevel == '8'">专项检查</span>
          </div>
        </div>
        <div class="info-item" v-if="recordItem.repairPersonName">
          <div class="label">整改责任人：</div>
          <div class="content">{{ recordItem.repairPersonName }}</div>
        </div>
        <div class="info-item" v-if="recordItem.workshopDirectorName">
          <div class="label">车间主任：</div>
          <div class="content">{{ recordItem.workshopDirectorName }}</div>
        </div>
        <div class="info-item" v-if="recordItem.safetyChiefName">
          <div class="label">安全科长：</div>
          <div class="content">{{ recordItem.safetyChiefName }}</div>
        </div>
        <div class="info-item" v-if="recordItem.safetyDepartName">
          <div class="label">安全部：</div>
          <div class="content">{{ recordItem.safetyDepartName }}</div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="隐患确认" v-if="confirmTab">
        <!-- 表单 -->
        <a-form ref="formTab2Ref" :model="info" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" v-if="showFooter">
          <div v-if="currentNode == '121'">
            <a-form-item label="隐患确认：" name="confirmResult" :rules="[{ required: true, message: '请选择隐患确认！' }]">
              <a-radio-group v-model:value="info.confirmResult">
                <a-radio value="1">确认隐患</a-radio>
                <a-radio value="2">非隐患</a-radio>
              </a-radio-group>
            </a-form-item>
            <!-- 确认隐患 -->
            <div v-if="info.confirmResult == '1'">
              <a-form-item label="隐患等级：" name="yhLevel" :rules="[{ required: true, message: '请选择隐患等级！' }]">
                <a-radio-group v-model:value="info.yhLevel">
                  <a-radio value="1">一般</a-radio>
                  <a-radio value="2"> 重大</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item label="整改责任人：" name="repairPerson" :rules="[{ required: true, message: '请选择整改责任人！' }]">
                <JUserModal v-model:value="info.repairPerson" placeholder="请选择" @confirm="confirm" />
              </a-form-item>
              <a-form-item label="隐患类别：" name="yhType" :rules="[{ required: true, message: '请选择隐患类别！' }]">
                <JDictSelectTag
                  v-model:value="info.yhType"
                  :show-choose-option="false"
                  :allowClear="true"
                  placeholder="请选择"
                  dictCode="sk_yh_type"
                  @change="handleChangeYhType"
                />
              </a-form-item>
              <a-form-item label="隐患子类别：" name="yhTypeSub" :rules="[{ required: true, message: '请选择隐患子类别！' }]">
                <JDictSelectTag
                  v-model:value="info.yhTypeSub"
                  :show-choose-option="false"
                  :allowClear="true"
                  placeholder="请选择"
                  :dictCode="dictCodeSub"
                />
              </a-form-item>
              <a-form-item label="完成时限：" name="repairTimeLimit" :rules="[{ required: true, message: '请选择完成时限！' }]">
                <a-date-picker
                  :disabledDate="disabledDate"
                  v-model:value="info.repairTimeLimit"
                  style="width: 100%"
                  placeholder="请选择完成时限"
                  valueFormat="YYYY-MM-DD"
                />
              </a-form-item>
              <a-form-item
                v-if="info.yhLevel == '2'"
                label="车间主任："
                name="workshopDirector"
                :rules="[{ required: true, message: '请选择车间主任！' }]"
              >
                <JUserModal v-model:value="info.workshopDirector" placeholder="请选择" @confirm="confirmDirector" />
              </a-form-item>
            </div>
          </div>
          <div v-if="currentNode == '122' || currentNode == '221'">
            <a-form-item label="隐患等级：" name="yhLevel" :rules="[{ required: true, message: '请选择隐患等级！' }]">
              <a-radio-group v-model:value="info.yhLevel">
                <a-radio value="1">一般</a-radio>
                <a-radio value="2"> 重大</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item v-if="info.yhLevel == '2'" label="安全科长：" name="safetyChief" :rules="[{ required: true, message: '请选择安全科长！' }]">
              <JUserModal v-model:value="info.safetyChief" placeholder="请选择" @confirm="confirmSafetyChief" />
            </a-form-item>
          </div>
          <div v-if="currentNode == '123' || currentNode == '222'">
            <a-form-item label="隐患等级：" name="yhLevel" :rules="[{ required: true, message: '请选择隐患等级！' }]">
              <a-radio-group v-model:value="info.yhLevel">
                <a-radio value="1">一般</a-radio>
                <a-radio value="2"> 重大</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item v-if="info.yhLevel == '2'" label="安全部：" name="safetyDepart" :rules="[{ required: true, message: '请选择安全部！' }]">
              <JUserModal v-model:value="info.safetyDepart" placeholder="请选择" @confirm="confirmSafetyDepart" />
            </a-form-item>
          </div>
          <div v-if="currentNode == '124' || currentNode == '223'">
            <a-form-item label="隐患等级：" name="yhLevel" :rules="[{ required: true, message: '请选择隐患等级！' }]">
              <a-radio-group v-model:value="info.yhLevel">
                <a-radio value="1">一般</a-radio>
                <a-radio value="2"> 重大</a-radio>
              </a-radio-group>
            </a-form-item>
          </div>
          <div v-if="currentNode == '321'">
            <a-form-item label="治理措施：" name="handleMsr" :rules="[{ required: true, message: '请输入治理措施！' }]">
              <a-textarea placeholder="请输入" v-model:value="info.handleMsr" show-count :maxlength="200" :rows="4" />
            </a-form-item>
            <a-form-item label="完成时限：" name="repairTimeLimit" :rules="[{ required: true, message: '请选择完成时限！' }]">
              <a-date-picker
                :disabledDate="disabledDate"
                v-model:value="info.repairTimeLimit"
                style="width: 100%"
                placeholder="请选择完成时限"
                valueFormat="YYYY-MM-DD"
              />
            </a-form-item>
          </div>
        </a-form>

        <!-- 确认时间线 -->
        <div
          style="margin-top: 30px; margin-left: 110px; color: #1890ff; font-size: 16px"
          v-if="recordItem.confirmLogList && recordItem.confirmLogList.length > 0"
        >
          <div style="margin: 0px 0px 20px 0">确认记录：</div>
          <!-- 时间线 -->
          <a-timeline style="margin-top: 30px">
            <a-timeline-item v-for="(item, index) in recordItem.confirmLogList" :key="index">
              <div class="his-detail">
                <div class="his-time">
                  {{ item.nodeName }}
                </div>
                <div class="his-content">
                  <div v-if="item.confirmResult" style="margin-bottom: 10px">隐患确认：{{ item.confirmResult == '1' ? '确认隐患' : '非隐患' }}</div>
                  <div
                    v-if="
                      recordItem.currentNode == '321' ||
                      recordItem.currentNode == '331' ||
                      recordItem.currentNode == '341' ||
                      recordItem.currentNode == '342'
                    "
                  >
                    <div style="margin-bottom: 10px">治理措施：{{ item.handleMsr }}</div>
                    <div style="margin-bottom: 10px">完成时限：{{ item.repairTimeLimit }}</div>
                  </div>
                  <div v-else>
                    <div v-if="recordItem.yhStatus != '0'">
                      <span style="margin-bottom: 10px" v-if="item.yhLevel == '1'">隐患等级：一般隐患</span>
                      <span style="margin-bottom: 10px" v-if="item.yhLevel == '2'">隐患等级：重大隐患</span>
                    </div>
                  </div>
                  <div style="margin-bottom: 10px">处理人：{{ item.handlerName }} 处理时间：{{ item.handleTime }}</div>
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </a-tab-pane>
      <a-tab-pane key="3" tab="隐患整改" v-if="repairTab">
        <!-- 表单 -->
        <a-form ref="formTab3Ref" :model="info1" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" v-if="showFooter">
          <!-- 隐患整改 -->
          <div v-if="currentNode == '131' || currentNode == '231'">
            <div v-if="recordItem.yhLevel == '1'">
              <a-form-item label="治理措施：" name="handleMsr" :rules="[{ required: true, message: '请输入治理措施！' }]">
                <a-textarea placeholder="请输入" v-model:value="info1.handleMsr" show-count :maxlength="200" :rows="4" />
              </a-form-item>
              <a-form-item label="整改后照片：" name="repairPicture" :rules="[{ required: true, message: '请上传整改照片！' }]">
                <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info1.repairPicture" />
              </a-form-item>
            </div>
            <div v-if="recordItem.yhLevel == '2'">
              <div style="margin-top: 30px; margin-left: 110px; color: #1890ff; font-size: 16px">整改方案：</div>
              <div style="margin-top: 30px; margin-left: 80px" class="info-item">
                <div style="font-weight: 400" class="label">问题描述：</div>
                <div class="content">{{ recordItem.yhDescription }}</div>
              </div>
              <a-form-item label="整改措施：" name="repairMsr" :rules="[{ required: true, message: '请输入治理措施！' }]">
                <a-textarea
                  placeholder="请输入"
                  v-model:value="info1.repairMsr"
                  show-count
                  :maxlength="200"
                  :rows="4"
                  @change="confirmRepairPerson"
                />
              </a-form-item>
              <a-form-item label="整改责任人：" name="repairPerson" :rules="[{ required: true, message: '请选择整改责任人！' }]">
                <JUserModal v-model:value="info1.repairPerson" placeholder="请选择" @confirm="confirmRepairPerson" />
              </a-form-item>
              <a-form-item label="整改时间：" name="repairTime" :rules="[{ required: true, message: '请选择！' }]">
                <a-date-picker
                  v-model:value="info1.repairTime"
                  style="width: 100%"
                  placeholder="自动获取完成时限，可更改"
                  valueFormat="YYYY-MM-DD"
                  @change="confirmRepairPerson"
                />
              </a-form-item>
            </div>
            <div v-if="recordItem.yhLevel == '2'">
              <div style="margin-top: 30px; margin-left: 110px; color: #1890ff; font-size: 16px">整改计划：</div>
              <a-table
                style="margin-top: 10px; margin-left: 50px"
                :pagination="false"
                :scroll="{ x: 1100 }"
                :dataSource="dataSource"
                :columns="columns"
              />
            </div>
          </div>
          <div v-if="currentNode == '132' || currentNode == '232' || currentNode == '331'">
            <a-form-item label="治理措施：" name="handleMsr" :rules="[{ required: true, message: '请输入治理措施！' }]">
              <a-textarea placeholder="请输入" v-model:value="info1.handleMsr" show-count :maxlength="200" :rows="4" />
            </a-form-item>
            <a-form-item label="整改后照片：" name="repairPicture" :rules="[{ required: true, message: '请上传整改后照片！' }]">
              <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info1.repairPicture" />
            </a-form-item>
          </div>
          <!-- 隐患验收 -->
          <div
            v-if="
              currentNode == '141' ||
              currentNode == '142' ||
              currentNode == '143' ||
              currentNode == '241' ||
              currentNode == '242' ||
              currentNode == '243' ||
              currentNode == '341' ||
              currentNode == '342'
            "
          >
            <a-form-item label="验收情况" name="checkResult" :rules="[{ required: true, message: '请选择验收情况！' }]">
              <a-radio-group v-model:value="info1.checkResult">
                <a-radio value="1">验收通过</a-radio>
                <a-radio value="2">验收不通过</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="验收说明：" name="checkExplain" :rules="[{ required: true, message: '请输入验收说明！' }]">
              <a-textarea placeholder="请输入" v-model:value="info1.checkExplain" show-count :maxlength="200" :rows="4" />
            </a-form-item>
          </div>
        </a-form>
        <!-- 整改时间线 -->
        <div style="margin-top: 30px; margin-left: 110px" v-if="recordItem.repairLogList && recordItem.repairLogList.length > 0">
          <div style="margin: 0px 0px 20px 0; color: #1890ff; font-size: 16px">整改记录：</div>
          <!-- 时间线 -->
          <a-timeline style="margin-top: 30px">
            <a-timeline-item v-for="(item, index) in recordItem.repairLogList" :key="index">
              <div class="his-detail">
                <div class="his-time">{{ item.handleTime }}</div>
                <div class="his-content">
                  <p style="margin-left: 10px; font-weight: 500">{{ item.handlerName }} </p>
                  <div class="history-explain" v-if="item.handleMsr">
                    <div class="explain-label">治理措施： </div>
                    <div class="explain-text">
                      {{ item.handleMsr }}
                    </div>
                  </div>
                  <div class="history-explain" v-if="item.repairPictureList && item.repairPictureList.length > 0">
                    <div class="explain-label">整改后照片： </div>
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
                  <div class="history-explain" v-if="item.checkExplain">
                    <div class="explain-label">验收说明： </div>
                    <div class="explain-text">
                      {{ item.checkExplain }}
                    </div>
                  </div>

                  <div class="history-explain" v-if="item.repairPersonName">
                    <div style="color: #1890ff" class="explain-label">整改方案： </div>
                  </div>
                  <div class="history-explain" v-if="item.yhDescription">
                    <div class="explain-label">问题描述： </div>
                    <div class="explain-text">
                      {{ item.yhDescription }}
                    </div>
                  </div>
                  <div class="history-explain" v-if="item.repairMsr && item.repairPersonName">
                    <div class="explain-label">整改措施： </div>
                    <div class="explain-text">
                      {{ item.repairMsr }}
                    </div>
                  </div>
                  <div class="history-explain" v-if="item.repairPersonName">
                    <div class="explain-label">整改责任人： </div>
                    <div class="explain-text">
                      {{ item.repairPersonName }}
                    </div>
                  </div>
                  <div class="history-explain" v-if="item.repairTime">
                    <div class="explain-label">整改时间： </div>
                    <div class="explain-text">
                      {{ item.repairTime }}
                    </div>
                  </div>
                  <div class="history-explain" v-if="item.repairPersonName">
                    <div style="color: #1890ff" class="explain-label">整改计划： </div>
                  </div>
                  <div v-if="item.repairPersonName">
                    <!-- 隐患整改计划表格 -->
                    <table class="repair-plan-table">
                      <thead>
                        <tr>
                          <th>检查时间</th>
                          <th>责任单位</th>
                          <th>隐患名称（描述）</th>
                          <th>隐患等级</th>
                          <th>治理措施</th>
                          <th>完成时限</th>
                          <th>整改部门和责任人</th>
                          <th>备注</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{{ item.checkTime }}</td>
                          <td>{{ item.dutyOrgName }}</td>
                          <td>{{ item.yhDescription }}</td>
                          <td>
                            <span :class="item.yhLevel == '1' ? 'level-normal' : 'level-major'">
                              {{ item.yhLevel == '1' ? '一般' : '重大' }}
                            </span>
                          </td>
                          <td>{{ item.repairMsr }}</td>
                          <td>{{ item.repairTimeLimit }}</td>
                          <td>{{ item.repairDepartName }} {{ item.repairPersonName }}</td>
                          <td>{{ item.remark || '-' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </a-tab-pane>
    </a-tabs>
    <!-- 自定义按钮 -->
    <template #footer>
      <div class="drawer-footer" v-if="showFooter">
        <a-button type="primary" @click="handleSubmit" :loading="loading">提交</a-button>
      </div>
    </template>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import type { Dayjs } from 'dayjs';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/src/components/Drawer';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import { JImageUpload } from '/@/components/Form';
  import { getUserList, getIfPostPerson, getDangerDetail, dealDanger, getContractorList, getUserListByOrgAndRole } from '../account/account.api';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import type { UploadProps } from 'ant-design-vue';
  import { JUserModal } from '/@/components/Form';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import dayjs from 'dayjs';

  const emit = defineEmits(['register', 'success']);
  const destroyOnClose = ref(true);
  const activeKey = ref('1');
  const showFooter = ref(true);
  const repairPersonCode = ref(''); // 整改责任人组织编码
  const ifPostPerson = ref(false);
  const loading = ref(false);
  const formTab2Ref = ref<any>(null);
  const formTab3Ref = ref<any>(null);
  const recordItem = ref<any>({});
  const confirmTab = ref(false);
  const repairTab = ref(false);
  const currentNode = ref('');
  const previewVisible = ref(false);
  const previewImage = ref('');
  const dictCodeSub = ref('sk_yh_type_1');
  const info = ref({
    repairResult: '',
    confirmResult: '',
    yhLevel: '',
    repairPerson: '',
    yhType: '',
    yhTypeSub: '',
    handleMsr: '',
    repairTimeLimit: '',
    workshopDirector: '',
    safetyChief: '',
    safetyDepart: '',
  });
  const info1 = ref({
    handleMsr: '',
    repairTime: '',
    repairPerson: '',
    repairMsr: '',
    repairPicture: [],
    checkResult: '',
    checkExplain: '',
    repairPersonName: '',
  });
  const columns = [
    {
      title: '检查时间',
      dataIndex: 'checkTime',
      key: 'checkTime',
    },
    {
      title: '责任单位',
      dataIndex: 'dutyOrgName',
      key: 'dutyOrgName',
    },
    {
      title: '隐患名称（描述）',
      dataIndex: 'yhDescription',
      key: 'yhDescription',
    },
    {
      title: '隐患等级',
      dataIndex: 'yhLevel',
      key: 'yhLevel',
    },
    {
      title: '治理措施',
      dataIndex: 'repairMsr',
      key: 'repairMsr',
    },
    {
      title: '完成时限',
      dataIndex: 'repairTime',
      key: 'repairTime',
    },
    {
      title: '整改部门和责任人',
      dataIndex: 'departDutyInfo',
      key: 'departDutyInfo',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
  ];
  const dataSource = ref([]);
  function handleClose() {
    destroyOnClose.value = true;
    // resetSchema(schemas);
  }
  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };
  const filterOption = (input: string, option: any) => {
    // 兼容不同的 option 结构
    const text = option.children || option.label || '';
    return text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    setDrawerProps({ confirmLoading: false });
    showFooter.value = !!data?.showFooter;
    // 获取详情
    recordItem.value = await getDangerDetail({ id: data.record.id });
    currentNode.value = recordItem.value.currentNode;
    let org = '';
    if (recordItem.value.repairOrgCode && recordItem.value.repairOrgCode.length > 9) {
      org = recordItem.value.repairOrgCode.substring(0, 9);
    } else if (recordItem.value.repairOrgCode && recordItem.value.repairOrgCode.length > 6) {
      org = recordItem.value.repairOrgCode;
    } else {
      org = '';
    }
    if (org) {
      // 获取安全科长
      getSafetyChiefList(org);
      // 获取安全部
      getContractorList({ orgCode: org }).then((res) => {
        console.log('getContractorList res', res);
        if (res.length > 0) {
          info.value.safetyDepart = res[0].id;
        }
      });
    }
    getIfPostPerson().then((res) => {
      ifPostPerson.value = res;
    });
    if (
      recordItem.value.currentNode == '121' ||
      recordItem.value.currentNode == '122' ||
      recordItem.value.currentNode == '123' ||
      recordItem.value.currentNode == '124' ||
      recordItem.value.currentNode == '221' ||
      recordItem.value.currentNode == '222' ||
      recordItem.value.currentNode == '223' ||
      recordItem.value.currentNode == '221' ||
      recordItem.value.currentNode == '222' ||
      recordItem.value.currentNode == '223' ||
      recordItem.value.currentNode == '321' ||
      recordItem.value.currentNode == '25' ||
      recordItem.value.currentNode == '35'
    ) {
      confirmTab.value = true;
      repairTab.value = false;
      activeKey.value = '2';
    }
    if (
      recordItem.value.currentNode == '131' ||
      recordItem.value.currentNode == '132' ||
      recordItem.value.currentNode == '133' ||
      recordItem.value.currentNode == '141' ||
      recordItem.value.currentNode == '142' ||
      recordItem.value.currentNode == '143' ||
      recordItem.value.currentNode == '151' ||
      recordItem.value.currentNode == '152' ||
      recordItem.value.currentNode == '231' ||
      recordItem.value.currentNode == '232' ||
      recordItem.value.currentNode == '241' ||
      recordItem.value.currentNode == '242' ||
      recordItem.value.currentNode == '243' ||
      recordItem.value.currentNode == '331' ||
      recordItem.value.currentNode == '341' ||
      recordItem.value.currentNode == '342' ||
      recordItem.value.currentNode == '25' ||
      recordItem.value.currentNode == '35'
    ) {
      confirmTab.value = true;
      repairTab.value = true;
      activeKey.value = '3';
      if (recordItem.value.yhLevel == '2') {
        info1.value.repairTime = recordItem.value.repairTimeLimit;
        dataSource.value = [
          {
            checkTime: recordItem.value.checkTime,
            dutyOrgName: recordItem.value.departName,
            yhDescription: recordItem.value.yhDescription,
            yhLevel: recordItem.value.yhLevel == '1' ? '一般隐患' : '重大隐患',
            repairMsr: info1.value.repairMsr,
            repairTime: info1.value.repairTime,
            departDutyInfo:
              (recordItem.value.repairDepartName ? recordItem.value.repairDepartName : '') +
              ' ' +
              (info1.value.repairPersonName ? info1.value.repairPersonName : ''),
            remark: recordItem.value.remark,
          },
        ];
      }
      if (recordItem.value.repairLogList && recordItem.value.repairLogList.length > 0) {
        recordItem.value.repairLogList.forEach((item: any) => {
          if (item.repairPicture) {
            item.repairPictureList = item.repairPicture.split(',').map((item1) => {
              return {
                uid: item1,
                name: item1,
                status: 'done',
                url: getFileAccessHttpUrl(item1),
              };
            });
          }
        });
        console.log('recordItem.value.repairLogList', recordItem.value.repairLogList);
      }
    }
    if (!showFooter.value) {
      activeKey.value = '1';
    }
  });
  const getSafetyChiefList = (orgCode: string) => {
    getUserListByOrgAndRole({ orgCode: orgCode, roleCode: 'safety_chief' }).then((res) => {
      console.log('getUserListByOrgAndRole res', res);
      if (res.length > 0) {
        info.value.safetyChief = res[0].id;
      }
    });
  };
  const confirmRepairPerson = (userName: string, userValue: string, orgCode: string) => {
    formTab3Ref.value.clearValidate(['repairPerson']);
    info1.value.repairPersonName = userName;
    dataSource.value = [
      {
        checkTime: recordItem.value.checkTime,
        dutyOrgName: recordItem.value.dutyOrgName,
        yhDescription: recordItem.value.yhDescription,
        yhLevel: recordItem.value.yhLevel == '1' ? '一般隐患' : '重大隐患',
        repairMsr: info1.value.repairMsr,
        repairTime: info1.value.repairTime,
        departDutyInfo:
          (recordItem.value.repairDepartName ? recordItem.value.repairDepartName : '') +
          ' ' +
          (info1.value.repairPersonName ? info1.value.repairPersonName : ''),
        remark: recordItem.value.remark,
      },
    ];
  };
  const handlePreview = async (file: UploadProps['fileList'][number]) => {
    if (!file.url && !file.preview) {
      file.preview = (await getBase64(file.originFileObj)) as string;
    }
    previewImage.value = file.url || file.preview;
    previewVisible.value = true;
  };
  function getBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
  const confirm = (userName: string, userValue: string, orgCode: string) => {
    formTab2Ref.value.clearValidate(['repairPerson']);
    repairPersonCode.value = orgCode;
    //根据组织编码获取车间主任
    if (orgCode && orgCode.length > 9) {
      getUserListByOrgAndRole({ orgCode: orgCode, roleCode: 'workshop_director' }).then((res) => {
        console.log('getUserListByOrgAndRole res', res);
        if (res.length > 0) {
          info.value.workshopDirector = res[0].id;
        }
      });
    }
    //根据组织编码获取安全科长
    let org = '';
    if (orgCode && orgCode.length > 9) {
      org = orgCode.substring(0, 9);
    } else if (orgCode && orgCode.length > 6) {
      org = orgCode;
    } else {
      org = '';
    }
    if (org) {
      getSafetyChiefList(org);
      getContractorList({ orgCode: org }).then((res) => {
        console.log('getContractorList res', res);
        if (res.length > 0) {
          info.value.safetyDepart = res[0].id;
        }
      });
    }
  };
  const confirmSafetyDepart = () => {
    formTab2Ref.value.clearValidate(['safetyDepart']);
  };
  const confirmDirector = () => {
    formTab2Ref.value.clearValidate(['workshopDirector']);
  };
  const confirmSafetyChief = () => {
    formTab2Ref.value.clearValidate(['safetyChief']);
  };
  const handleCancel = () => {
    previewVisible.value = false;
  };
  const handleSubmit = async () => {
    loading.value = true;
    if (!repairTab.value) {
      // 隐患确认表单提交
      // 表单验证
      let values = await formTab2Ref.value.validate();
      // 表单提交
      let params: any = {};
      params = Object.assign(params, values);
      params.confirmId = recordItem.value.id;
      params.node = currentNode.value;
      // 表单提交
      await dealDanger(params).then(() => {
        closeDrawer();
        emit('success');
        resetInfo();
      });
    }
    if (repairTab.value) {
      // 隐患整改表单提交
      // 表单验证
      let values = await formTab3Ref.value.validate();
      // 表单提交
      let params: any = {};
      params = Object.assign(params, values);
      params.confirmId = recordItem.value.id;
      params.node = currentNode.value;
      // 表单提交
      await dealDanger(params).then(() => {
        closeDrawer();
        emit('success');
        resetInfo();
      });
    }
    loading.value = false;
    closeDrawer();
  };
  // 隐患类型改变时，隐患子类型重置
  const handleChangeYhType = (val: string) => {
    console.log('handleChangeYhType val', val);
    dictCodeSub.value = val;
    formTab3Ref.value.clearValidate(['yhTypeSub']);
  };
  // 重置info和info1
  const resetInfo = () => {
    info.value = {
      repairResult: '',
      confirmResult: '',
      yhLevel: '',
      repairPerson: '',
      yhType: '',
      yhTypeSub: '',
      handleMsr: '',
      repairTimeLimit: '',
      workshopDirector: '',
      safetyChief: '',
      safetyDepart: '',
    };
    info1.value = {
      handleMsr: '',
      repairTime: '',
      repairPerson: '',
      repairMsr: '',
      repairPicture: [],
      checkResult: '',
      checkExplain: '',
      repairPersonName: '',
    };
  };
</script>
<style lang="less" scoped>
  .info-item {
    display: flex;
    margin-bottom: 16px;
    margin-left: 16px;
    .label {
      width: 100px;
      font-weight: 500;
      text-align: right;
    }
    .content {
      flex: 1;
    }
  }
  .his-detail {
    display: flex;
    position: relative;
    .his-time {
      width: 95px;
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
        width: 90px;
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

  // 隐患整改计划表格样式
  .repair-plan-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
    margin-bottom: 16px;
    font-size: 14px;
    line-height: 1.5;
    background-color: #fff;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    // 表头样式
    thead {
      th {
        background-color: #fafafa;
        color: #262626;
        font-weight: 600;
        text-align: center;
        padding: 12px 8px;
        border: 1px solid #d9d9d9;
        white-space: nowrap;
        font-size: 13px;

        &:first-child {
          border-left: 1px solid #d9d9d9;
        }

        &:last-child {
          border-right: 1px solid #d9d9d9;
        }
      }
    }

    // 表体样式
    tbody {
      tr {
        &:hover {
          background-color: #f5f5f5;
        }

        td {
          padding: 12px 8px;
          border: 1px solid #d9d9d9;
          text-align: center;
          vertical-align: middle;
          color: #595959;
          font-size: 13px;
          word-break: break-word;

          &:first-child {
            border-left: 1px solid #d9d9d9;
          }

          &:last-child {
            border-right: 1px solid #d9d9d9;
          }

          // 隐患描述列左对齐
          &:nth-child(3) {
            text-align: left;
            max-width: 200px;
          }

          // 治理措施列左对齐
          &:nth-child(5) {
            text-align: left;
            max-width: 150px;
          }
        }
      }

      // 最后一行去掉底部边框
      tr:last-child {
        td {
          border-bottom: 1px solid #d9d9d9;
        }
      }
    }
  }

  // 隐患等级标签样式
  .level-normal {
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
    color: #52c41a;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .level-major {
    background-color: #fff2e8;
    border: 1px solid #ffbb96;
    color: #fa541c;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
</style>
