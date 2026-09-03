<!-- 随手拍非隐患处理 -->
<template>
  <van-form ref="formRef" label-width="75px">
    <van-field readonly label="整改状态">
      <template #input>
        {{ { 1: '确认退回', 2: '确认中', 3: '整改中', 4: '待验收', 5: '验收中', 6: '验收通过' }[infoData.yhStatus] }}
      </template>
    </van-field>

    <template v-if="props.pageType == 3">
      <template v-if="['31'].includes(infoData.currentNode) && infoData.yhLevel == 2">
        <van-field label-width="80" required name="picture" label="整改方案" :rules="[{ required: true, message: '请上传整改方案' }]">
          <template #input>
            <AppCustomizeUpload :watermarkText="watermarkText" :maxCount="5" v-model:fileList="formData.repairPlan" />
          </template>
        </van-field>
        <van-field
          :rules="[{ validator: validator3, message: '请输入' }]"
          v-model="formData.tempMsr"
          name="tempMsr"
          autosize
          :maxlength="300"
          type="textarea"
          label="临时措施"
          placeholder="请输入"
        />
        <van-field :required="!infoData.repairPicture" label-width="80" name="repairPicture" label="整改后照片" :rules="[{ validator: validatorRepairPicture, message: '请输入' }]">
          <template #input>
            <AppUpload :watermarkText="watermarkText" v-model:fileList="formData.repairPicture" />
          </template>
        </van-field>
      </template>

      <template v-if="infoData.flowType == 3 && ['31'].includes(infoData.currentNode) && infoData.yhLevel == 1">
        <van-field
          v-if="infoData.repairRequire == 1"
          required
          v-model="formData.departDutyPersonName"
          is-link
          readonly
          label-width="80"
          name="departDutyPersonName"
          :rules="[{ required: true, message: '请选择' }]"
          label="车间责任人"
          placeholder="请选择"
          @click="
            getUser();
            departDutyPersonShow = true;
          "
        >
        </van-field>
        <van-field
          v-if="infoData.repairRequire == 1"
          v-model="formData.teamDutyPersonName"
          is-link
          readonly
          label-width="80"
          name="teamDutyPersonName"
          label="班组责任人"
          placeholder="请选择"
          @click="teamDutyPersonShow = true"
        >
        </van-field>
        <van-field
          required
          v-if="infoData.repairRequire == 1"
          v-model="formData.teamName"
          is-link
          :rules="[{ required: true, message: '请选择' }]"
          readonly
          name="teamName"
          label="所属班组"
          placeholder="请选择"
          @click="showArea = true"
        >
        </van-field>
        <van-field
          required
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

        <van-field
          v-model="formData.repairMsr"
          v-if="infoData.repairRequire == 1"
          name="repairMsr"
          autosize
          :maxlength="300"
          type="textarea"
          label="整改措施"
          placeholder="请输入"
          :rules="[{ validator, message: '请输入' }]"
        />
        <van-field
          v-if="infoData.repairRequire == 1"
          label-width="80"
          name="repairPicture"
          label="整改照片"
          :required="!infoData.repairPicture"
          :rules="[{ validator: validatorRepairPicture, message: '请输入' }]"
        >
          <template #input>
            <AppUpload :watermarkText="watermarkText" v-model:fileList="formData.repairPicture" />
          </template>
        </van-field>
      </template>
      <TreeSelect
        :value="formData.teamDutyPerson"
        :isRadio="true"
        :not-tree="true"
        value-key="id"
        title-key="realname"
        v-model:show="userShow"
        :items="userList"
        @change="onConfirm($event, 'repairPerson')"
      />

      <template v-if="infoData.flowType == 1 && ['31'].includes(infoData.currentNode) && infoData.yhLevel == 1">
        <van-field
          required
          v-model="formData.departName"
          is-link
          readonly
          name="depart"
          label="所属车间"
          placeholder="请选择"
          @click="showDepart = true"
          :rules="[{ required: true, message: '请选择' }]"
        />

        <van-field
          required
          v-model="formData.teamName"
          is-link
          :rules="[{ required: true, message: '请选择' }]"
          readonly
          name="teamName"
          label="所属班组"
          placeholder="请选择"
          @click="showArea = true"
        >
        </van-field>

        <van-field
          v-if="infoData.repairRequire == 1"
          required
          v-model="formData.departDutyPersonName"
          is-link
          readonly
          label-width="80"
          name="departDutyPersonName"
          :rules="[{ required: true, message: '请选择' }]"
          label="车间责任人"
          placeholder="请选择"
          @click="
            getUser();
            departDutyPersonShow = true;
          "
        >
        </van-field>
        <van-field
          v-if="infoData.repairRequire == 1"
          v-model="formData.teamDutyPersonName"
          is-link
          readonly
          label-width="80"
          name="teamDutyPersonName"
          label="班组责任人"
          placeholder="请选择"
          @click="teamDutyPersonShow = true"
        >
        </van-field>

        <van-field
          required
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
            @confirm="onConfirm($event, 'repairPerson')"
            @cancel="userShow = false"
          />
        </van-popup> -->

        <van-field
          v-if="infoData.repairRequire == 1"
          v-model="formData.handleExplain"
          name="handleExplain"
          autosize
          :maxlength="200"
          type="textarea"
          label="处理说明"
          :rules="[{ validator: validator2, message: '请输入' }]"
          placeholder="请填写处理说明"
        />
        <van-field name="picture" label=" " v-if="infoData.repairRequire == 1" :rules="[{ validator: validatorHandlePicture, message: '请输入' }]">
          <template #input>
            <AppUpload :watermarkText="watermarkText" v-model:fileList="formData.handlePicture" />
          </template>
        </van-field>
      </template>
      <template v-if="['1'].includes(infoData.flowType) && ['33'].includes(infoData.currentNode) && infoData.yhLevel == 2">
        <van-field
          required
          v-model="formData.departName"
          is-link
          readonly
          name="depart"
          label="所属车间"
          placeholder="请选择"
          @click="showDepart = true"
          :rules="[{ required: true, message: '请选择' }]"
        />

        <van-field v-model="formData.teamName" is-link readonly name="teamName" label="所属班组" placeholder="请选择" @click="showArea = true">
        </van-field>

        <van-field
          required
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
            @confirm="onConfirm($event, 'repairPerson')"
            @cancel="userShow = false"
          />
        </van-popup> -->
      </template>

      <template v-if="infoData.currentNode == 32 && infoData.yhLevel == 2">
        <van-field required name="radio" label="验收结果" :rules="[{ required: true, message: '请选择验收结果' }]">
          <template #input>
            <van-radio-group v-model="formData.checkResult" direction="horizontal">
              <van-radio name="1">验收通过</van-radio>
              <van-radio name="2">验收不通过</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          v-model="formData.handleExplain"
          name="handleExplain"
          autosize
          :maxlength="200"
          type="textarea"
          label="处理说明"
          :rules="[{ validator: validator4, message: '请输入' }]"
          placeholder="请填写处理说明"
        />
        <van-field name="picture" label=" " :rules="[{ validator: validator4, message: '请输入' }]">
          <template #input>
            <AppUpload :watermarkText="watermarkText" v-model:fileList="formData.handlePicture" />
          </template>
        </van-field>
      </template>
      <van-field
        v-if="['34'].includes(infoData.currentNode) && infoData.yhLevel == 2 && infoData.flowType == 1"
        required
        v-model="formData.departDutyPersonName"
        is-link
        readonly
        label-width="80"
        name="departDutyPersonName"
        :rules="[{ required: true, message: '请选择' }]"
        label="车间责任人"
        placeholder="请选择"
        @click="
          getUser();
          departDutyPersonShow = true;
        "
      >
      </van-field>
      <van-field
        v-if="['34'].includes(infoData.currentNode) && infoData.yhLevel == 2 && infoData.flowType == 1"
        v-model="formData.teamDutyPersonName"
        is-link
        readonly
        label-width="80"
        name="teamDutyPersonName"
        label="班组责任人"
        placeholder="请选择"
        @click="teamDutyPersonShow = true"
      >
      </van-field>
      <template v-if="['33'].includes(infoData.currentNode) && infoData.yhLevel == 2 && infoData.flowType == 3">
        <van-field
          required
          v-model="formData.departDutyPersonName"
          is-link
          readonly
          label-width="80"
          name="departDutyPersonName"
          :rules="[{ required: true, message: '请选择' }]"
          label="车间责任人"
          placeholder="请选择"
          @click="
            getUser();
            departDutyPersonShow = true;
          "
        >
        </van-field>
        <van-field
          v-model="formData.teamDutyPersonName"
          is-link
          readonly
          label-width="80"
          name="teamDutyPersonName"
          label="班组责任人"
          placeholder="请选择"
          @click="teamDutyPersonShow = true"
        >
        </van-field>
        <van-field
          required
          v-model="formData.teamName"
          is-link
          :rules="[{ required: true, message: '请选择' }]"
          readonly
          name="teamName"
          label="所属班组"
          placeholder="请选择"
          @click="showArea = true"
        >
        </van-field>
      </template>
      <template
        v-if="
          (['33'].includes(infoData.currentNode) && infoData.yhLevel == 2 && infoData.flowType == 2) ||
          (['33'].includes(infoData.currentNode) && infoData.yhLevel != 2) ||
          (['33'].includes(infoData.currentNode) && infoData.yhLevel == 2 && infoData.flowType == 3) ||
          (['32'].includes(infoData.currentNode) && infoData.yhLevel == 1) ||
          (['31'].includes(infoData.currentNode) && infoData.yhLevel == 1 && infoData.flowType == 2)
        "
      >
        <van-field required name="repairResult" label="整改情况" :rules="[{ required: true, message: '请选择' }]">
          <template #input>
            <van-radio-group v-model="formData.repairResult" direction="horizontal">
              <van-radio name="1">整改完成</van-radio>
              <van-radio name="2">整改中</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          required
          v-model="formData.repairMsr"
          :rules="[{ required: true, message: '请输入' }]"
          name="repairMsr"
          autosize
          :maxlength="300"
          type="textarea"
          label="整改措施"
          placeholder="请输入"
        />
        <van-field label-width="80" :required="!infoData.repairPicture" name="repairPicture" label="整改照片" :rules="[{ validator: validatorRepairPicture, message: '请输入' }]">
          <template #input>
            <AppUpload :watermarkText="watermarkText" v-model:fileList="formData.repairPicture" />
          </template>
        </van-field>
      </template>
      <template v-if="['34', '35'].includes(infoData.currentNode)">
        <van-field required name="repairResult" label="整改情况" :rules="[{ required: true, message: '请选择' }]">
          <template #input>
            <van-radio-group v-model="formData.repairResult" direction="horizontal">
              <van-radio name="1">整改完成</van-radio>
              <van-radio name="2">整改中</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          v-model="formData.repairMsr"
          name="repairMsr"
          autosize
          :maxlength="300"
          type="textarea"
          label="整改措施"
          placeholder="请输入"
          :rules="[{ validator, message: '请输入' }]"
        />
        <van-field :required="!infoData.repairPicture" label-width="80" name="repairPicture" label="整改照片" :rules="[{ validator: validatorRepairPicture, message: '请输入' }]">
          <template #input>
            <AppUpload :watermarkText="watermarkText" v-model:fileList="formData.repairPicture" />
          </template>
        </van-field>
      </template>

      <!-- <van-steps direction="vertical" :active="1">
        <template v-for="item in infoData.repairLogList">
          <van-step>
            <template v-if="item.checkResult">
              <h3>{{ item.handleTime }}</h3>
              <p class="active-text" v-if="item.node">{{ item.handlerOrgName }}>{{ item.handlerName }}</p>
              <p class="active-text" v-if="item.node">验收结果：{{ item.checkResult == '1' ? '验收通过' : '验收不通过' }}</p>
              <p class="active-text" v-if="item.node">处理说明：{{ item.handleExplain }}</p>
              <p class="active-text" v-if="item.node">
                <AppUpload :disabled="true" :watermarkText="watermarkText" v-model:fileList="item.handlePicture" />
              </p>
            </template>
            <template v-else-if="item.repairResult">
              <h3>{{ item.handleTime }}</h3>
              <p class="active-text" v-if="item.node">{{ item.handlerOrgName }}>{{ item.handlerName }}</p>
              <p class="active-text" v-if="item.node"
                >整改情况：
                {{ item.checkResult == '1' ? '整改完成' : '整改中' }}
              </p>
              <p class="active-text" v-if="item.node">整改措施：{{ item.repairMsr }}</p>
              <p class="active-text" v-if="item.node"
                >整改照片：
                <AppUpload :disabled="true" :watermarkText="watermarkText" v-model:fileList="item.repairPicture" />
              </p>
            </template>
            <template v-else>
              <h3>{{ item.handleTime }}</h3>
              <p class="active-text" v-if="item.node">{{ item.handlerOrgName }}>{{ item.handlerName }}</p>
              <p class="active-text" v-if="item.node"
                >整改方案：
                <AppCustomizeUpload :watermarkText="watermarkText" :disabled="true" :maxCount="10" v-model:fileList="item.repairPlan" />
              </p>
              <p class="active-text" v-if="item.node">临时措施：{{ item.tempMsr }}</p>
              <p class="active-text" v-if="item.node"
                >整改照片：
                <AppUpload :disabled="true" :watermarkText="watermarkText" v-model:fileList="item.repairPicture" />
              </p>
              <p class="active-text" v-if="item.node">处理说明：{{ item.handleExplain }}</p>
            </template>
          </van-step>
        </template>
      </van-steps> -->
    </template>
    <template v-if="props.pageType == 5">
      <div
        v-if="
          (infoData.flowType == 2 && infoData.currentNode == 41 && infoData.yhLevel == 1 && infoData.repairRequire == 1) ||
          (infoData.flowType == 2 && infoData.currentNode == 42 && infoData.yhLevel == 1 && infoData.repairRequire == 2)
        "
      >
        <van-field required readonly name="yhLevel" label="隐患等级" @click="yhLevelClick">
          <template #input>
            <span>{{ formData.yhLevelLabel ? formData.yhLevelLabel : infoData.yhLevel == 1 ? '一般' : '重大' }}</span>
          </template>
        </van-field>
        <van-field
          required
          readonly
          v-model="formData.yhType"
          :rules="[{ required: true, message: '请选择' }]"
          @click="yhTypeClick"
          name="sk_yh_type"
          label="隐患分类"
        >
          <template #input>
            <span :class="{ 'gary-text': !formData.yhTypeLabel && !formData.yhType }">
              {{ formData.yhTypeLabel ? formData.yhTypeLabel : formData.yhType ? filterDictTextByCache('sk_yh_type', formData.yhType) : '请选择' }}
            </span>
          </template>
        </van-field>
        <van-popup v-model:show="showyhType" position="bottom">
          <van-picker :columns="sk_yh_type" @confirm="onConfirm2($event, 'showyhType', 'yhType')" @cancel="showyhType = false" />
        </van-popup>

        <van-field
          readonly
          :rules="[{ required: true, message: '请选择' }]"
          required
          v-model="formData.yhTypeSub"
          @click="yhTypeSubClick"
          name="yhTypeSub"
          label="子类"
          placeholder="子类"
        >
          <template #input>
            <span :class="{ 'gary-text': !formData.yhTypeSubLabel && !formData.yhTypeSub }">
              {{
                formData.yhTypeSubLabel
                  ? formData.yhTypeSubLabel
                  : formData.yhTypeSub
                  ? filterDictTextByCache('sk_yh_type_sub', formData.yhTypeSub)
                  : '请选择'
              }}
            </span>
          </template>
        </van-field>

        <van-popup v-model:show="showyhTypeSub" position="bottom">
          <van-picker :columns="sk_yh_type_1" @confirm="onConfirm2($event, 'showyhTypeSub', 'yhTypeSub')" @cancel="showyhTypeSub = false" />
        </van-popup>
      </div>
      <van-field
        required
        v-if="
          (infoData.flowType == 1 && infoData.repairRequire == 2 && infoData.currentNode == 41) ||
          (infoData.flowType == 3 && infoData.repairRequire == 2 && infoData.currentNode == 41)
        "
        v-model="formData.departDutyPersonName"
        is-link
        readonly
        label-width="80"
        name="departDutyPersonName"
        :rules="[{ required: true, message: '请选择' }]"
        label="车间责任人"
        placeholder="请选择"
        @click="
          getUser();
          departDutyPersonShow = true;
        "
      >
      </van-field>
      <van-field
        v-if="
          (infoData.flowType == 1 && infoData.repairRequire == 2 && infoData.currentNode == 41) ||
          (infoData.flowType == 3 && infoData.repairRequire == 2 && infoData.currentNode == 41)
        "
        v-model="formData.teamDutyPersonName"
        is-link
        readonly
        label-width="80"
        name="teamDutyPersonName"
        label="班组责任人"
        placeholder="请选择"
        @click="teamDutyPersonShow = true"
      >
      </van-field>
      <van-field
          required
          v-if="
          (infoData.flowType == 3 && infoData.repairRequire == 2 && infoData.currentNode == 41)
        "
          v-model="formData.teamName"
          is-link
          :rules="[{ required: true, message: '请选择' }]"
          readonly
          name="teamName"
          label="所属班组"
          placeholder="请选择"
          @click="showArea = true"
        >
        </van-field>

      <!-- <template v-if="infoData.flowType == 3 && infoData.repairRequire == 1 && infoData.yhLevel == 1 && infoData.currentNode == 41">
        <van-field
          required
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
      </template> -->
      <TreeSelect
        :value="formData.teamDutyPerson"
        :isRadio="true"
        :not-tree="true"
        value-key="id"
        title-key="realname"
        v-model:show="userShow"
        :items="userList"
        @change="onConfirm($event, 'repairPerson')"
      />

      <van-field required name="radio" label="验收结果" :rules="[{ required: true, message: '请选择验收结果' }]">
        <template #input>
          <van-radio-group v-model="formData.checkResult" direction="horizontal">
            <van-radio name="1">验收通过</van-radio>
            <van-radio name="2">验收不通过</van-radio>
          </van-radio-group>
        </template>
      </van-field>

      <van-field
        v-model="formData.handleExplain"
        name="handleExplain"
        autosize
        :maxlength="200"
        type="textarea"
        label="处理说明"
        :rules="[{ validator: validator4, message: '请输入' }]"
        placeholder="请填写处理说明"
      />
      <van-field :rules="[{ validator: validator4, message: '请输入' }]" name="handlePicture" label=" ">
        <template #input>
          <AppUpload :watermarkText="watermarkText" v-model:fileList="formData.handlePicture" />
        </template>
      </van-field>
    </template>

    <van-popup v-model:show="showDepart" position="bottom">
      <van-picker
        :columns-field-names="{ value: 'orgCode', text: 'departName' }"
        @confirm="onConfirm($event, 'depart')"
        @cancel="showDepart = false"
        :columns="deptTree"
      />
    </van-popup>

    <van-popup v-model:show="showArea" position="bottom">
      <van-picker
        :columns-field-names="{ value: 'id', text: 'sectionName' }"
        @confirm="onConfirm($event, 'team')"
        @cancel="showArea = false"
        :columns="teamList"
      />
    </van-popup>

    <TreeSelect
      :value="formData.departDutyPerson"
      :maxLength="3"
      :not-tree="true"
      value-key="id"
      title-key="realname"
      v-model:show="departDutyPersonShow"
      :items="userList"
      @change="onConfirm($event, 'departDutyPerson')"
    />
    <TreeSelect
      :value="formData.teamDutyPerson"
      :maxLength="3"
      :not-tree="true"
      value-key="id"
      title-key="realname"
      v-model:show="teamDutyPersonShow"
      :items="teamDutyPersonList"
      @change="onConfirm($event, 'teamDutyPerson')"
    />
    <van-popup v-model:show="showYhLevel" position="bottom">
      <van-picker :columns="yh_hidden_levelList" @confirm="onConfirm2($event, 'showYhLevel', 'yhLevel')" @cancel="showYhLevel = false" />
    </van-popup>
  </van-form>
</template>

<script setup lang="ts">
  import { getUserInfo, getDepart3List, getTeamList, getUserListByTeam } from '../../index.api';
  import AppCustomizeUpload from '../../../components/AppCustomizeUpload.vue';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import AppUpload from '../../../../../components/App/AppUpload.vue';
  import TreeSelect from '../../../components/treeSelect.vue';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import { reactive, ref, watchEffect, watch } from 'vue';
  const props = withDefaults(defineProps<{ pageType: number | string; infoData: any }>(), { pageType: 3 });
  const formRef = ref<HTMLFormElement | null>(null);
  const formData = ref<any>({
    checkResult: '',
    handleExplain: '',
    picture: '',
    repairPersonName: '',
    repairPerson: '',
    departName: '',
  });
  const userStore: any = useUserStore();
  const userList = ref([]);
  const userShow = ref(false);

  const showArea = ref(false);
  const showDepart = ref(false);
  let teamList = reactive([]);
  let deptTree = reactive([]);

  const departDutyPersonShow = ref(false);
  const departDutyPersonList = ref([]);
  const teamDutyPersonShow = ref(false);
  const teamDutyPersonList = ref([]);

  const watermarkText = ref(
    `${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} 上传`
  );

  const getDepartTree = (code) => {
    getDepart3List({ orgCode: code }).then((res) => {
      deptTree = res;
    });
  };
  watch(
    () => props.infoData,
    (n) => {
      formData.value.depart = props.infoData.depart;
      formData.value.departName = props.infoData.departName;
      if (
        (props.infoData.flowType == 2 && props.infoData.yhLevel == 1 && props.infoData.currentNode == 41 && props.infoData.repairRequire == 1) ||
        (props.infoData.flowType == 2 && props.infoData.yhLevel == 1 && props.infoData.currentNode == 42 && props.infoData.repairRequire == 2)
      ) {
        formData.value.yhLevelNew = props.infoData.yhLevel;
        formData.value.yhType = props.infoData.yhType;
        formData.value.yhTypeSub = props.infoData.yhTypeSub;
        console.log(formData);
      }
    },
    { deep: true }
  );
  watchEffect(() => {
    if (props.infoData.depart || props.infoData.org) {
      getDepartTree(props.infoData.org);
      getUserListByT(props.infoData.team);
      getTem(props.infoData.depart);
    }
  });

  function getTem(depart) {
    getTeamList({ workShopCode: depart.slice(0, 6) }).then((res) => {
      teamList = res;
    });
  };

  const validator = () => {
    // if (!formData.value.repairMsr && !formData.value.repairPicture && !formData.value.handlePicture && !(props.infoData.flowType == 3 && props.infoData.yhLevel == 1 && props.infoData.currentNode == 41 && props.infoData.repairRequire == 1)) {
    //   return '整改措施/整改照片至少一个不为空！';
    // }
    return true;
  };
  const validator2 = () => {
    // if (['31'].includes(props.infoData.currentNode)) {
    //   if (!formData.value.handleExplain && !formData.value.handlePicture) {
    //     return '整改措施/整改照片至少一个不为空！';
    //   }
    // }
    return true;
  };
  const validatorRepairPicture = () => {
    console.log(formData.value.repairPicture);
    
    if(!props.infoData.repairPicture && !formData.value.repairPicture){
      return '整改照片不能为空！';
    }
    return true;
  };
  const validatorHandlePicture = () => {
    if (['31'].includes(props.infoData.currentNode) && 
      props.infoData.flowType == '1' && 
      props.infoData.repairRequire == '1' &&
      !props.infoData.repairPicture
    ) {
      if (!formData.value.handlePicture) {
        return '处理照片不能为空！';
      }
    }
    return true;
  };
  const validator3 = () => {
    // if (['31'].includes(props.infoData.currentNode)) {
    //   if (!formData.value.tempMsr && !formData.value.repairPicture) {
    //     return '临时措施/整改后照片至少一个不为空！';
    //   }
    // }
    return true;
  };
  const validator4 = () => {
    // if (!formData.value.handleExplain && !formData.value.handlePicture && !(props.infoData.flowType == 3 && props.infoData.yhLevel == 1 && props.infoData.currentNode == 41 && props.infoData.repairRequire == 1)) {
    //   return '处理说明与照片至少一个不空！';
    // }
    return true;
  };

  const submitForm = () => {
    return new Promise((resolve, reject) => {
      formRef.value
        ?.validate()
        .then(() => {
          resolve(formData);
        })
        .catch(() => {
          reject(false);
        });
    });
  };

  function getUser() {
    getUserInfo(props.infoData?.org).then((res) => {
      userList.value = res;
    });
  }

  function onConfirm(val, key) {
    switch (key) {
      case 'repairPerson':
        formData.value.repairPersonName = val.realname;
        formData.value.repairPerson = val.id;
        userShow.value = false;
        break;
      case 'depart':
        console.log(val.selectedOptions[0].departName);
        formData.value.departName = val.selectedOptions[0].departName;
        formData.value.depart = val.selectedOptions[0].orgCode;
        showDepart.value = false;
        getTem(formData.value.depart);
        break;
      case 'team':
        formData.value.teamName = val.selectedOptions[0].sectionName;
        formData.value.team = val.selectedOptions[0].id;
        showArea.value = false;
        getUserListByT(formData.value.team);
        break;
      case 'departDutyPerson':
        formData.value.departDutyPersonName = val.names;
        formData.value.departDutyPerson = val.ids;
        departDutyPersonShow.value = false;
        break;
      case 'teamDutyPerson':
        formData.value.teamDutyPersonName = val.names;
        formData.value.teamDutyPerson = val.ids;
        teamDutyPersonShow.value = false;
    }
  }

  function getUserListByT(id) {
    getUserListByTeam({ orgCode: props.infoData.org, teamId: id }).then((res) => {
      teamDutyPersonList.value = res;
    });
  };

  const yh_hidden_levelList = [
    { text: '一般', value: '1' },
    { text: '重大', value: '2' },
  ];
  const showYhLevel = ref(false);
  const yhLevelClick = () => {
    if (
      (props.infoData.flowType == 2 && props.infoData.yhLevel == 1 && props.infoData.currentNode == 41 && props.infoData.repairRequire == 1) ||
      (props.infoData.flowType == 2 && props.infoData.yhLevel == 1 && props.infoData.currentNode == 42 && props.infoData.repairRequire == 2)
    ) {
      showYhLevel.value = true;
    }
  };

  const showyhType = ref(false);
  const showyhTypeSub = ref(false);
  const sk_yh_type = userStore.getAllDictItems.sk_yh_type;
  const sk_yh_type_1 = ref(userStore.getAllDictItems.sk_yh_type_sub);

  const yhTypeClick = () => {
    if (
      (props.infoData.flowType == 2 && props.infoData.yhLevel == 1 && props.infoData.currentNode == 41 && props.infoData.repairRequire == 1) ||
      (props.infoData.flowType == 2 && props.infoData.yhLevel == 1 && props.infoData.currentNode == 42 && props.infoData.repairRequire == 2)
    ) {
      showyhType.value = true;
    }
  };

  const yhTypeSubClick = () => {
    if (
      (props.infoData.flowType == 2 && props.infoData.yhLevel == 1 && props.infoData.currentNode == 41 && props.infoData.repairRequire == 1) ||
      (props.infoData.flowType == 2 && props.infoData.yhLevel == 1 && props.infoData.currentNode == 42 && props.infoData.repairRequire == 2)
    ) {
      showyhTypeSub.value = true;
    }
  };

  const onConfirm2 = (value, show, key) => {
    switch (key) {
      case 'yhLevel':
        formData.value.yhLevelNew = value.selectedValues[0];
        formData.value.yhLevelLabel = value.selectedOptions[0].text;
        showYhLevel.value = false;
        break;
      case 'yhType':
        formData.value.yhType = value.selectedValues[0];
        formData.value.yhTypeLabel = value.selectedOptions[0].text;
        showyhType.value = false;
        break;
      case 'yhTypeSub':
        formData.value.yhTypeSub = value.selectedValues[0];
        formData.value.yhTypeSubLabel = value.selectedOptions[0].text;
        showyhTypeSub.value = false;
        break;
    }
  };

  defineExpose({ submitForm });
</script>

<style lang="less" scoped>
  .gary-text {
    color: #c8c9cc !important;
  }
</style>
