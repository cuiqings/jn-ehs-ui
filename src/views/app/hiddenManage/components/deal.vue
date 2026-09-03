<!-- 随手拍处理 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <CurLoading v-if="loading" />
      <van-collapse v-model="activeNames">
        <van-form label-width="80px" ref="form">
          <van-collapse-item title="基本信息" name="1">
            <van-cell title="检查类别" :value="getCheckTypeText(recordItem.checkType)" />
            <van-field name="yhPicture" label="检查照片">
              <template #input>
                <div class="img-wrap">
                  <van-image
                    v-for="(item, index) in recordItem.yhPicture"
                    @click="preview(index, recordItem.yhPicture)"
                    :key="index"
                    width="80"
                    height="80"
                    :src="item"
                  />
                </div>
              </template>
            </van-field>
            <van-cell title="隐患描述">
              <template #value>
                <div style="display: inline-block; text-align: left !important"> {{ recordItem.yhDescription || formData.yhDescription }} </div>
              </template>
            </van-cell>
            <van-cell title="隐患等级" :value="recordItem.yhLevel == '1' ? '一般' : recordItem.yhLevel == '2' ? '重大' : ''" />
            <van-cell title="完成时限" :value="recordItem.repairTimeLimit" />

            <!-- 岗位工信息 -->
            <van-cell v-if="ifPost || recordItem.teamLeaderName" title="班组长" :value="recordItem.teamLeaderName" />

            <!-- 非岗位工信息 -->
            <template v-if="!ifPost">
              <van-cell v-if="recordItem.yhType_dictText" title="隐患类别" :value="recordItem.yhType_dictText" />
              <van-cell v-if="recordItem.yhTypeSub_dictText" title="隐患子类别" :value="recordItem.yhTypeSub_dictText" />
            </template>

            <van-cell v-if="recordItem.riskName" title="关联风险点" :value="recordItem.riskName" />
            <van-cell v-if="recordItem.checkPersonName" title="检查人" :value="recordItem.checkPersonName" />
            <van-cell v-if="recordItem.checkTime" title="检查时间" :value="recordItem.checkTime" />

            <van-cell title="检查层级" :value="getControlLevelText(recordItem.controlLevel)" />

            <van-cell v-if="recordItem.repairPersonName" title="整改责任人" :value="recordItem.repairPersonName" />
            <van-cell v-if="recordItem.workshopDirectorName" title="车间主任" :value="recordItem.workshopDirectorName" />
            <van-cell v-if="recordItem.safetyChiefName" title="安全科长" :value="recordItem.safetyChiefName" />
            <van-cell v-if="recordItem.safetyDepartName" title="安全部" :value="recordItem.safetyDepartName" />
          </van-collapse-item>
          <van-collapse-item title="隐患确认" name="2" v-if="confirmTab">
            <div v-if="pageType == 'deal'">
              <div v-if="currentNode == '121'">
                <van-field
                  required
                  v-model="info.confirmResult"
                  name="confirmResult"
                  label="隐患确认"
                  :rules="[{ required: true, message: '请选择隐患确认！' }]"
                >
                  <template #input>
                    <van-radio-group v-model="info.confirmResult" direction="horizontal">
                      <van-radio name="1">确认隐患</van-radio>
                      <van-radio name="2">非隐患</van-radio>
                    </van-radio-group>
                  </template>
                </van-field>

                <!-- 确认隐患 -->
                <div v-if="info.confirmResult == '1'">
                  <van-field
                    required
                    v-model="info.yhLevel"
                    name="yhLevel"
                    label="隐患等级"
                    :rules="[{ required: true, message: '请选择隐患等级！' }]"
                  >
                    <template #input>
                      <van-radio-group v-model="info.yhLevel" direction="horizontal">
                        <van-radio name="1">一般</van-radio>
                        <van-radio name="2">重大</van-radio>
                      </van-radio-group>
                    </template>
                  </van-field>
                  <van-field
                    required
                    v-model="info.repairPersonName"
                    name="repairPersonName"
                    label="整改责任人"
                    :rules="[{ required: true, message: '请选择整改责任人！' }]"
                  >
                    <template #input>
                      <JUserModal :userStyle="{ width: '100%' }" v-model:value="info.repairPerson" type="radio" @confirm="confirmPerson1" />
                    </template>
                  </van-field>
                  <van-field
                    required
                    readonly
                    v-model="info.yhTypeText"
                    is-link
                    name="yhTypeText"
                    label="隐患类别"
                    placeholder="请选择"
                    @click="showYhType = true"
                    :rules="[{ required: true, message: '请选择隐患类别' }]"
                  />
                  <van-popup v-model:show="showYhType" position="bottom">
                    <van-picker :columns="sk_yh_type" @confirm="onConfirm($event, 'showYhType', 'yhType')" @cancel="showYhType = false" />
                  </van-popup>
                  <van-field
                    required
                    readonly
                    v-model="info.yhTypeSubText"
                    is-link
                    name="yhTypeSubText"
                    label="隐患子类别"
                    placeholder="请选择"
                    @click="showYhTypeSub = true"
                    :rules="[{ required: true, message: '请选择隐患子类别' }]"
                  />
                  <van-popup v-model:show="showYhTypeSub" position="bottom">
                    <van-picker
                      :columns="sk_yh_type_sub"
                      @confirm="onConfirm($event, 'showYhTypeSub', 'yhTypeSub')"
                      @cancel="showYhTypeSub = false"
                    />
                  </van-popup>
                  <van-field
                    v-model="info.repairTimeLimit"
                    is-link
                    required
                    readonly
                    name="repairTimeLimit"
                    label="完成时限"
                    placeholder="点击选择"
                    @click="showCalendar1 = true"
                    :rules="[{ required: true, message: '请选择完成时限' }]"
                  >
                    <template #input>
                      <div style="width: 100%; display: flex; justify-content: space-between; align-items: center">
                        <span v-if="info.repairTimeLimit">{{ info.repairTimeLimit }}</span>
                        <span v-else style="color: #c8c9cc">请选择</span>
                        <van-icon
                          style="padding-right: 10px; opacity: 0.4"
                          v-if="info.repairTimeLimit"
                          @click.stop="info.repairTimeLimit = ''"
                          name="cross"
                        />
                      </div>
                    </template>
                  </van-field>
                  <van-calendar :min-date="minDate" v-model:show="showCalendar1" @confirm="endDtConfirm($event, 'repairTimeLimit')" />
                  <van-field
                    v-if="info.yhLevel == '2'"
                    v-model="info.workshopDirectorName"
                    name="workshopDirectorName"
                    label="车间主任"
                    required
                    readonly
                    :rules="[{ required: true, message: '请选择车间主任！' }]"
                  >
                    <template #input>
                      <JUserModal :userStyle="{ width: '100%' }" v-model:value="info.workshopDirector" type="radio" @confirm="confirmPerson2" />
                    </template>
                  </van-field>
                </div>
              </div>

              <div v-if="currentNode == '122' || currentNode == '221'">
                <van-field v-model="info.yhLevel" name="yhLevel" label="隐患等级" :rules="[{ required: true, message: '请选择隐患等级！' }]">
                  <template #input>
                    <van-radio-group v-model="info.yhLevel" direction="horizontal">
                      <van-radio name="1">一般</van-radio>
                      <van-radio name="2">重大</van-radio>
                    </van-radio-group>
                  </template>
                </van-field>

                <van-field
                  v-if="info.yhLevel == '2'"
                  v-model="info.safetyChiefName"
                  name="safetyChiefName"
                  label="安全科长"
                  :rules="[{ required: true, message: '请选择安全科长！' }]"
                >
                  <template #input>
                    <JUserModal :userStyle="{ width: '100%' }" v-model:value="info.safetyChief" type="radio" @confirm="confirmPerson3" />
                  </template>
                </van-field>
              </div>

              <div v-if="currentNode == '123' || currentNode == '222'">
                <van-field v-model="info.yhLevel" name="yhLevel" label="隐患等级" :rules="[{ required: true, message: '请选择隐患等级！' }]">
                  <template #input>
                    <van-radio-group v-model="info.yhLevel" direction="horizontal">
                      <van-radio name="1">一般</van-radio>
                      <van-radio name="2">重大</van-radio>
                    </van-radio-group>
                  </template>
                </van-field>

                <van-field
                  v-if="info.yhLevel == '2'"
                  v-model="info.safetyDepartName"
                  name="safetyDepartName"
                  label="安全部"
                  :rules="[{ required: true, message: '请选择安全部！' }]"
                >
                  <template #input>
                    <JUserModal :userStyle="{ width: '100%' }" v-model:value="info.safetyDepart" type="radio" @confirm="confirmPerson4" />
                  </template>
                </van-field>
              </div>
              <div v-if="currentNode == '124' || currentNode == '223'">
                <van-field required v-model="info.yhLevel" name="yhLevel" label="隐患等级" :rules="[{ required: true, message: '请选择隐患等级！' }]">
                  <template #input>
                    <van-radio-group v-model="info.yhLevel" direction="horizontal">
                      <van-radio name="1">一般</van-radio>
                      <van-radio name="2">重大</van-radio>
                    </van-radio-group>
                  </template>
                </van-field>
              </div>

              <div v-if="currentNode == '321'">
                <van-field
                  required
                  v-model="info.handleMsr"
                  name="handleMsr"
                  label="治理措施"
                  type="textarea"
                  placeholder="请输入治理措施"
                  show-word-limit
                  maxlength="200"
                  rows="4"
                  :rules="[{ required: true, message: '请输入治理措施！' }]"
                />
                <van-field
                  required
                  v-model="info.repairTimeLimit"
                  name="repairTimeLimit"
                  label="完成时限"
                  is-link
                  readonly
                  placeholder="点击选择完成时限"
                  @click="showCalendar2 = true"
                  :rules="[{ required: true, message: '请选择完成时限！' }]"
                >
                  <template #input>
                    <div style="width: 100%; display: flex; justify-content: space-between; align-items: center">
                      <span v-if="info.repairTimeLimit">{{ info.repairTimeLimit }}</span>
                      <span v-else style="color: #c8c9cc">请选择完成时限</span>
                      <van-icon
                        style="padding-right: 10px; opacity: 0.4"
                        v-if="info.repairTimeLimit"
                        @click.stop="info.repairTimeLimit = ''"
                        name="cross"
                      />
                    </div>
                  </template>
                </van-field>
                <van-calendar :min-date="minDate" v-model:show="showCalendar2" @confirm="endDtConfirm($event, 'repairTimeLimit')" />
              </div>
            </div>
            <van-steps direction="vertical" :active="1" v-if="recordItem.confirmLogList && recordItem.confirmLogList.length > 0">
              <template v-for="item in recordItem.confirmLogList">
                <van-step>
                  <h3>{{ item.nodeName }}</h3>
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
                  <div v-else style="margin-bottom: 10px">
                    <span v-if="item.confirmResult && item.confirmResult == '1'">
                      隐患等级：{{ item.yhLevel == '1' ? '一般隐患' : '重大隐患' }}
                    </span>
                  </div>
                  <div style="margin-bottom: 10px">处理人：{{ item.handlerName }} 处理时间：{{ item.handleTime }}</div>
                </van-step>
              </template>
            </van-steps>
          </van-collapse-item>
          <van-collapse-item title="隐患整改" name="3" v-if="repairTab">
            <div v-if="pageType == 'deal'">
              <!-- 隐患整改 -->
              <div style="padding-bottom: 200px" v-if="currentNode == '131' || currentNode == '231'">
                <van-field
                  required
                  v-model="info1.handleMsr"
                  name="handleMsr"
                  label="治理措施"
                  type="textarea"
                  placeholder="请输入治理措施"
                  show-word-limit
                  maxlength="200"
                  rows="4"
                  :rules="[{ required: true, message: '请输入治理措施！' }]"
                />
                <van-field name="repairPicture" label="整改后照片" required :rules="[{ required: true, message: '请选择整改后照片！' }]">
                  <template #input>
                    <AppUpload :watermarkText="watermarkText" v-model:fileList="info1.repairPicture" />
                  </template>
                </van-field>
                <div v-if="recordItem.yhLevel == '2'">
                  <div style="margin-top: 10px; margin-left: 20px">
                    <p style="color: #1890ff">整改方案：</p>
                    <p>问题描述：{{ recordItem.yhDescription }}</p>
                  </div>
                  <van-field
                    required
                    v-model="info1.repairMsr"
                    name="repairMsr"
                    label="整改措施"
                    type="textarea"
                    placeholder="请输入整改措施"
                    show-word-limit
                    maxlength="200"
                    rows="4"
                    :rules="[{ required: true, message: '请输入整改措施！' }]"
                  />
                  <van-field
                    required
                    v-model="info1.repairPersonName"
                    name="repairPersonName"
                    label="整改责任人"
                    :rules="[{ required: true, message: '请选择整改责任人！' }]"
                  >
                    <template #input>
                      <JUserModal :userStyle="{ width: '100%' }" v-model:value="info1.repairPerson" type="radio" @confirm="confirmPerson" />
                    </template>
                  </van-field>
                  <van-field
                    required
                    v-model="info1.repairTime"
                    name="repairTime"
                    label="整改时间"
                    is-link
                    readonly
                    placeholder="点击选择整改时间"
                    @click="showCalendar2 = true"
                    :rules="[{ required: true, message: '请选择整改时间！' }]"
                  >
                    <template #input>
                      <div style="width: 100%; display: flex; justify-content: space-between; align-items: center">
                        <span v-if="info1.repairTime">{{ info1.repairTime }}</span>
                        <span v-else style="color: #c8c9cc">请选择整改时间</span>
                        <van-icon
                          style="padding-right: 10px; opacity: 0.4"
                          v-if="info1.repairTime"
                          @click.stop="info1.repairTime = ''"
                          name="cross"
                        />
                      </div>
                    </template>
                  </van-field>
                  <van-calendar :min-date="minDate" v-model:show="showCalendar2" @confirm="endDtConfirm($event, 'repairTime')" />
                </div>
                <!-- <div v-if="recordItem.yhLevel == '2'">
                <div style="margin-top: 30px; margin-left: 20px; color: #1890ff;">整改计划：</div>
                <div style="margin-top: 10px">
                  <van-card v-for="(item, index) in dataSource" :key="index" :title="`计划 ${index + 1}`" style="margin-bottom: 10px">
                    <template #desc>
                      <div class="plan-item">
                        <div><strong>检查时间：</strong>{{ item.checkTime }}</div>
                        <div><strong>责任单位：</strong>{{ item.dutyOrgName }}</div>
                        <div><strong>隐患名称：</strong>{{ item.yhDescription }}</div>
                        <div><strong>隐患等级：</strong>{{ item.yhLevel == '1' ? '一般' : '重大' }}</div>
                        <div><strong>治理措施：</strong>{{ item.repairMsr }}</div>
                        <div><strong>完成时限：</strong>{{ item.repairTime }}</div>
                        <div><strong>整改责任人：</strong>{{ item.departDutyInfo }}</div>
                        <div v-if="item.remark"><strong>备注：</strong>{{ item.remark }}</div>
                      </div>
                    </template>
                  </van-card>
                </div>
              </div> -->
              </div>
              <div style="padding-bottom: 200px" v-if="currentNode == '132' || currentNode == '232' || currentNode == '331'">
                <van-field
                  required
                  v-model="info1.handleMsr"
                  name="handleMsr"
                  label="治理措施"
                  type="textarea"
                  placeholder="请输入治理措施"
                  show-word-limit
                  maxlength="200"
                  rows="4"
                  :rules="[{ required: true, message: '请输入治理措施！' }]"
                />
                <van-field name="repairPicture" label="整改后照片" required :rules="[{ required: true, message: '请上传整改照片！' }]">
                  <template #input>
                    <AppUpload :watermarkText="watermarkText" v-model:fileList="info1.repairPicture" />
                  </template>
                </van-field>
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
                <van-field
                  required
                  v-model="info1.checkResult"
                  name="checkResult"
                  label="验收情况"
                  :rules="[{ required: true, message: '请选择验收情况！' }]"
                >
                  <template #input>
                    <van-radio-group v-model="info1.checkResult" direction="horizontal">
                      <van-radio name="1">验收通过</van-radio>
                      <van-radio name="2">验收不通过</van-radio>
                    </van-radio-group>
                  </template>
                </van-field>

                <van-field
                  required
                  v-model="info1.checkExplain"
                  name="checkExplain"
                  label="验收说明"
                  type="textarea"
                  placeholder="请输入验收说明"
                  show-word-limit
                  maxlength="200"
                  rows="4"
                  :rules="[{ required: true, message: '请输入验收说明！' }]"
                />
              </div>
            </div>
            <!-- 整改时间线 -->
            <div style="margin-left: 20px" v-if="recordItem.repairLogList && recordItem.repairLogList.length > 0">
              <div style="color: #1890ff">整改记录：</div>
              <!-- 时间线 -->
              <van-steps :active="0" direction="vertical">
                <van-step v-for="(item, index) in recordItem.repairLogList" :key="index">
                  <h3>{{ item.handleTime }}</h3>
                  <p style="margin-left: 10px; font-weight: 500">{{ item.handlerName }} </p>
                  <p v-if="item.repairMsr">治理措施： {{ item.handleMsr }}</p>
                  <div style="margin-bottom: 10px" class="img-wrap" v-if="item.repairPictureList && item.repairPictureList.length > 0">
                    <p style="margin-bottom: 10px">整改后照片：</p>
                    <a-upload
                      list-type="picture-card"
                      v-model:file-list="item.repairPictureList"
                      :max-count="10"
                      @preview="handlePreview"
                      :disabled="true"
                    >
                    </a-upload>
                    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel()">
                      <img alt="example" style="width: 100%" :src="previewImage" />
                    </a-modal>
                  </div>
                  <p v-if="item.checkResult">验收情况： {{ item.checkResult == '1' ? '验收通过' : '验收不通过' }}</p>
                  <p v-if="item.handleExplain">处理说明： {{ item.handleExplain }}</p>
                  <p v-if="item.yhDescription">问题描述： {{ item.yhDescription }}</p>
                  <p v-if="item.repairMsr">整改措施： {{ item.repairMsr }}</p>
                  <p v-if="item.repairPersonName">整改责任人： {{ item.repairPersonName }}</p>
                  <p v-if="item.repairTime">整改时间： {{ item.repairTime }}</p>
                  <div v-if="item.repairTime">
                    <div style="color: #1890ff; margin: 10px 0">整改方案： </div>
                    <div style="margin-left: 10px">
                      <div>问题描述：{{ item.yhDescription }}</div>
                      <div>整改措施：{{ item.repairMsr }}</div>
                      <div>整改责任人：{{ item.repairPersonName }}</div>
                      <div>整改时间：{{ item.repairTime }}</div>
                      <div>整改部门和责任人：{{ item.repairDepartName }} {{ item.repairPersonName }}</div>
                      <div>备注：{{ item.remark }}</div>
                    </div>
                  </div>

                  <div v-if="item.repairPersonName">
                    <div style="color: #1890ff; margin: 10px 0">整改计划： </div>
                    <div style="margin-left: 10px">
                      <div>检查时间：{{ item.checkTime }}</div>
                      <div>责任单位：{{ item.dutyOrgName }}</div>
                      <div>隐患名称（描述）：{{ item.yhDescription }}</div>
                      <div>隐患等级：{{ item.yhLevel == '1' ? '一般' : '重大' }}</div>
                      <div>治理措施：{{ item.repairMsr }}</div>
                      <div>完成时限：{{ item.repairTimeLimit }}</div>
                      <div>整改部门和责任人：{{ item.repairDepartName }} {{ item.repairPersonName }}</div>
                      <div>备注：{{ item.remark }}</div>
                    </div>
                  </div>
                </van-step>
              </van-steps>
            </div>
          </van-collapse-item>
        </van-form>
      </van-collapse>
    </div>
    <div class="foot" v-if="pageType == 'deal'">
      <van-button v-if="recordItem.canChange" type="primary" @click="handleTransfer">转处理</van-button>
      <van-button :loading="submitIng" @click="submitFn" type="primary">提交</van-button>
    </div>
    <van-dialog v-model:show="showTransferDialog" title="转处理" show-cancel-button @confirm="confirmTransfer">
      <div style="padding: 20px 10px">
        <JUserModal
          :userStyle="{ width: '100%' }"
          v-model:value="transferPerson"
          type="radio"
          label="转处理人"
          placeholder="请选择转处理人"
          @confirm="onTransferPersonSelected"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
  import { showImagePreview, showFailToast, showToast } from 'vant';
  import { ref, reactive, watch, computed, onActivated } from 'vue';
  import AppUpload from '../../../../components/App/AppUpload.vue';
  import { useRouter, useRoute } from 'vue-router';
  import CurLoading from '../components/loading.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import {
    jnYhSspDetail,
    ifPostPerson,
    handleYh,
    getUserListByRole,
    getUserListByOrgAndRole,
    getContractorList,
    yhChangeHandler,
  } from '../index.api';
  import { useUserStore } from '/@/store/modules/user';
  import { dateFormat } from '/@/utils/common/compUtils';
  import JUserModal from '/@/components/App/JUserModal.vue';
  import { UploadProps } from 'ant-design-vue';

  const userStore = useUserStore();
  const form = ref();
  const recordItem = ref<any>({});
  const currentNode = ref('');
  const confirmTab = ref(false);
  const repairTab = ref(false);
  const sk_yh_type = userStore.getAllDictItems.sk_yh_type;
  const sk_yh_type_sub = ref(userStore.getAllDictItems.sk_yh_type_1);
  const watermarkText = ref(
    `${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} 上传`
  );
  const info = ref<any>({
    confirmResult: '',
    yhLevel: '',
    repairPerson: '',
    repairPersonName: '',
    yhType: '',
    yhTypeText: '',
    yhTypeSub: '',
    yhTypeSubText: '',
    repairTimeLimit: '',
    workshopDirector: '',
    workshopDirectorName: '',
    safetyChief: '',
    safetyChiefName: '',
    safetyDepart: '',
    safetyDepartName: '',
    handleMsr: '',
  });
  const info1 = ref<any>({
    handleMsr: '',
    repairTime: '',
    repairPerson: '',
    repairMsr: '',
    repairPicture: '',
    departDutyPerson: '',
    checkResult: '',
    repairPersonName: '',
    repairTimeLimit: '',
    checkExplain: '',
  });
  const dataSource = ref<any[]>([]);

  // 选择器状态
  const showRepairPersonPicker = ref(false);
  const showYhType = ref(false);
  const showYhTypeSub = ref(false);
  const showCalendar1 = ref(false);
  const showCalendar2 = ref(false);
  const showWorkshopDirectorPicker = ref(false);
  const showSafetyChiefPicker = ref(false);
  const showSafetyDepartPicker = ref(false);
  const previewVisible = ref(false);
  const previewImage = ref('');

  // 选项数据
  const personOptions = ref<any[]>([]);
  const activeNames = ref(['1', '2']);
  const route = useRoute();
  const router = useRouter();
  const loading = ref(false); // 页面加载动画
  const minDate = ref(new Date(dateFormat(new Date(), 'yyyy-MM-dd')));

  // 页面名称
  const submitIng = ref(false); // 提交按钮动画
  const formData = reactive<any>({
    confirm: {},
    yhPicture: '',
    repairPicture: '',
    yhDescription: '',
    repairExplain: '',
    reporterName: '',
    reporterPhone: '',
    depart: '',
    departName: '',
  });
  const personList = ref<any[]>([]);
  // 转处理
  const showTransferDialog = ref(false);
  const transferPerson = ref('');
  const transferUsername = ref('');

  const handleTransfer = () => {
    transferPerson.value = '';
    showTransferDialog.value = true;
  };
  const onTransferPersonSelected = (realNames, selectedNames, orgCode, resultList) => {
    console.log('onTransferPersonSelected', resultList);
    if (resultList && resultList.length > 0) {
      transferUsername.value = resultList[0].username;
    }
  };

  const confirmTransfer = () => {
    if (!transferPerson.value) {
      showToast('请选择转处理人');
      return;
    }
    let currentChangeIds: string[] = [];
    currentChangeIds.push(recordItem.value.id);
    yhChangeHandler({ confirmIdList: currentChangeIds, newUserName: transferUsername.value }).then(() => {
      showToast('转处理成功');
      showTransferDialog.value = false;
      router.back();
    });
  };

  const pageType = ref(route.query.pageType || 'detail'); // deal detail
  const checkName = ref(route.query.checkName || '');

  const ifPost = ref(false); // true是岗位工 false不是岗位工
  const getPostPerson = () => {
    ifPostPerson().then((res) => {
      ifPost.value = res;
    });
  };
  getPostPerson();
  pageInit();
  function pageInit() {
    loading.value = true;
    jnYhSspDetail({ id: route.query.id })
      .then((res) => {
        if (res.yhPicture) {
          let arr =
            res.yhPicture.indexOf(',') > -1
              ? res.yhPicture.split(',').map((item) => getFileAccessHttpUrl(item))
              : [getFileAccessHttpUrl(res.yhPicture)];
          res.yhPicture = arr;
        }

        recordItem.value = res;
        Object.assign(formData, res);
        loading.value = false;
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
            if (res && res.length > 0) {
              info.value.safetyDepart = res[0].id;
            }
          });
        }
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
          activeNames.value = ['1', '2'];
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
          activeNames.value = ['1', '2', '3'];
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
      })
      .catch(() => (loading.value = false));
  }
  const onConfirm = (value, show, key) => {
    console.log('value', value);
    switch (key) {
      case 'yhType':
        info.value.yhType = value.selectedOptions[0].value;
        info.value.yhTypeText = value.selectedOptions[0].text;
        showYhType.value = false;
        sk_yh_type_sub.value = userStore.getAllDictItems[info.value.yhType];
        info.value.yhTypeSub = '';
        info.value.yhTypeSubText = '';
        break;
      case 'yhTypeSub':
        info.value.yhTypeSub = value.selectedOptions[0].value;
        info.value.yhTypeSubText = value.selectedOptions[0].text;
        showYhTypeSub.value = false;
        break;
      case 'workshopDirector':
        showWorkshopDirectorPicker.value = false;
        info.value.workshopDirector = value.selectedOptions[0].id;
        info.value.workshopDirectorName = value.selectedOptions[0].sectionName;
        break;
      case 'repairPerson':
        showRepairPersonPicker.value = false;
        info.value.repairPerson = value.selectedOptions[0].id;
        info.value.repairPersonName = value.selectedOptions[0].realname;
        break;
      case 'safetyChief':
        showSafetyChiefPicker.value = false;
        info.value.safetyChief = value.selectedOptions[0].id;
        info.value.safetyChiefName = value.selectedOptions[0].realname;
        break;
      case 'safetyDepart':
        showSafetyDepartPicker.value = false;
        info.value.safetyDepart = value.selectedOptions[0].id;
        info.value.safetyDepartName = value.selectedOptions[0].realname;
        break;
      case 'repairPerson1':
        info1.value.repairPerson = value.selectedOptions[0].id;
        info1.value.repairPersonName = value.selectedOptions[0].realname;
        break;
    }
  };
  getUserListByRole({
    roleCode: 'branch_leader',
  }).then((res) => {
    personList.value = res;
  });

  onActivated(() => {
    console.log('进入了');
  });

  function splitImg(res) {
    if (!res.departName) res.departName = res.orgName;
    if (res.yhPicture) {
      res.yhPictureo = res.yhPicture;
      let arr =
        res.yhPicture.indexOf(',') > -1 ? res.yhPicture.split(',').map((item) => getFileAccessHttpUrl(item)) : [getFileAccessHttpUrl(res.yhPicture)];
      res.yhPicture = arr;
    }
    if (res.repairPicture) {
      res.repairPictureo = res.repairPicture;
      let arr =
        res.repairPicture.indexOf(',') > -1
          ? res.repairPicture.split(',').map((item) => getFileAccessHttpUrl(item))
          : [getFileAccessHttpUrl(res.repairPicture)];
      res.repairPicture = arr;
    }
  }

  // 处理提交
  const submitFn = async () => {
    // 表单校验
    await form.value?.validate();
    let params = {
      confirmId: route.query.id,
      node: currentNode.value,
    };
    if (!repairTab.value) {
      // 隐患确认
      // 如果是一般隐患，不传车间主任，安全部
      if (info.value.yhLevel == '1') {
        info.value.workshopDirector = '';
        info.value.workshopDirectorName = '';
        info.value.safetyChief = '';
        info.value.safetyChiefName = '';
        info.value.safetyDepart = '';
        info.value.safetyDepartName = '';
      }
      params = Object.assign(params, info.value);
    } else {
      // 隐患整改
      // 整改后照片校验，上传成功后才能提交
      if (
        currentNode.value == '131' ||
        currentNode.value == '231' ||
        currentNode.value == '132' ||
        currentNode.value == '232' ||
        currentNode.value == '331'
      ) {
        if (!info1.value.repairPicture || info1.value.repairPicture.length == 0) {
          showFailToast('请上传整改后照片');
          return;
        }
      }
      params = Object.assign(params, info1.value);
    }
    console.log('params', params);
    submitIng.value = true;
    handleYh(params)
      .then((res) => {
        submitIng.value = false;
        console.log(res);
        if (checkName.value == 'clapping') {
          router.replace({
            path: '/app/hiddenManage/randomClapping/list',
          });
        } else if (checkName.value == 'special') {
          router.replace({
            path: '/app/hiddenManage/specialDanger',
          });
        } else if (checkName.value == 'daily') {
          router.replace({
            path: '/app/hiddenManage/dailyDanger',
          });
        } else {
          router.replace({
            path: '/app/hiddenManage/dailyDanger',
          });
        }
      })
      .catch(() => {
        submitIng.value = false;
      });
  };
  const endDtConfirm = (value, key) => {
    console.log('value', value);
    info.value[key] = dateFormat(value, 'yyyy-MM-dd');
    info1.value[key] = dateFormat(value, 'yyyy-MM-dd');
    showCalendar1.value = false;
    showCalendar2.value = false;
  };

  // 图片预览
  const preview = (idx, list) => {
    showImagePreview({
      images: list,
      startPosition: idx,
    });
  };
  // 获取检查类别文本
  const getCheckTypeText = (checkType: string) => {
    const typeMap = {
      '1': '日常检查',
      '2': '隐患上报',
      '3': '综合检查',
      '4': '季节性检查',
      '5': '节假日检查',
      '6': '专项检查',
      '7': '重大事故隐患检查',
      '8': '重大风险管控措施检查',
      '9': '脱水器点检',
    };
    return typeMap[checkType] || '';
  };

  // 获取检查层级文本
  const getControlLevelText = (controlLevel: string) => {
    const levelMap = {
      '1': '安全部',
      '2': '厂部主要负责人',
      '3': '厂部安全科',
      '4': '车间负责人',
      '5': '班组负责人',
      '6': '岗位人员',
      '7': '隐患上报',
      '8': '专项检查',
    };
    return levelMap[controlLevel] || '';
  };
  const getSafetyChiefList = (orgCode: string) => {
    getUserListByOrgAndRole({ orgCode: orgCode, roleCode: 'safety_chief' }).then((res) => {
      console.log('getUserListByOrgAndRole res', res);
      if (res && res.length > 0) {
        info.value.safetyChief = res[0].id;
      }
    });
  };
  const confirmPerson = (userName: string, userValue: string) => {
    info1.value.repairPersonName = userValue;
  };
  const confirmPerson1 = (userName: string, userValue: string, orgCode: string) => {
    info.value.repairPersonName = userValue;
    //根据组织编码获取车间主任
    if (orgCode && orgCode.length > 9) {
      getUserListByOrgAndRole({ orgCode: orgCode, roleCode: 'workshop_director' }).then((res) => {
        console.log('getUserListByOrgAndRole res', res);
        if (res && res.length > 0) {
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
        if (res && res.length > 0) {
          info.value.safetyDepart = res[0].id;
        }
      });
    }
  };
  const confirmPerson2 = (userName: string, userValue: string) => {
    info.value.workshopDirectorName = userValue;
  };
  const confirmPerson3 = (userName: string, userValue: string) => {
    info.value.safetyChiefName = userValue;
  };
  const confirmPerson4 = (userName: string, userValue: string) => {
    info.value.safetyDepartName = userValue;
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
  const handleCancel = () => {
    previewVisible.value = false;
  };
</script>
<style scoped lang="less">
  .hd-edit {
    width: 100%;
    height: 100%;
    padding-bottom: 55px;

    .main {
      width: 100%;
      height: 100%;
      overflow-y: auto;
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
  :deep(.van-collapse-item) {
    .van-collapse-item__title {
      .van-cell__title {
        color: #1989fa !important;
      }
    }
  }
  :deep(.van-collapse-item__content) {
    padding: 0 !important;
  }
  .active-text {
    color: #1989fa;
  }
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
  .img-wrap {
    width: auto;
    height: auto;
    // display: flex;
    // overflow-y: hidden;
    // overflow-x: scroll;
    // padding-bottom: 20px;
    // box-sizing: content-box;
    .van-image {
      flex-shrink: 0;
      width: 100px;
      margin: 0px 5px;
    }
  }

  .plan-item {
    div {
      margin-bottom: 8px;
      line-height: 1.5;
      font-size: 14px;

      strong {
        color: #323233;
        margin-right: 8px;
      }
    }
  }
  .his-detail {
    // display: flex;
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
