<template>
  <div style="padding-bottom: 40px">
    <a-form ref="infoForm" :label-col="{ span: 24 }" :model="info" :wrapper-col="{ span: 24 }" style="padding: 20px">
      <div class="nav"> 基本信息</div>
      <a-row :gutter="24">
        <a-col :span="24" class="gutter-row">
          <a-form-item label="所属单位：" name="orgName">
            <a-input v-model:value="info.orgName" disabled />
          </a-form-item>
        </a-col>
        <a-col :span="24" class="gutter-row">
          <a-form-item label="所属车间：" name="departName">
            <a-input v-model:value="info.departName" disabled />
          </a-form-item>
        </a-col>
        <template v-if="isTeamData">
          <a-col :span="24" class="gutter-row">
            <a-form-item label="班组名称" name="teamName">
              <a-input v-model:value="info.teamName" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="24" class="gutter-row">
            <a-form-item label="上班方式" name="workType">
              <a-input :value="info.workType === '1' ? '三班倒' : info.workType === '2' ? '两班倒' : info.workType === '3' ? '长白班' : ''" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="24" class="gutter-row">
            <a-form-item :rules="[{ required: showOkBtn, message: '请选择班次!' }]" label="班次：" name="teamOrder">
              <a-select v-model:value="info.teamOrder" :disabled="!showOkBtn" :options="teamOrderOption" placeholder="请选择" />
            </a-form-item>
          </a-col>
        </template>
        <a-col :span="24" class="gutter-row">
          <a-form-item :rules="[{ required: showOkBtn, message: '请输入应到人数!' }]" label="应到人数：" name="expectedNumber">
            <a-input-number
              v-model:value="info.expectedNumber"
              :controls="false"
              :disabled="!showOkBtn"
              :min="0"
              :precision="0"
              placeholder="请输入"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24" class="gutter-row">
          <a-form-item :rules="[{ required: showOkBtn, message: '请输实到人数!' }]" label="实到人数：" name="actualNumber">
            <a-input-number
              v-model:value="info.actualNumber"
              :controls="false"
              :disabled="!showOkBtn"
              :min="0"
              :precision="0"
              placeholder="请输入"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col v-if="!isTeamData" :span="24" class="gutter-row">
          <a-form-item :rules="[{ required: showOkBtn, message: '请选择参加人员!' }]" label="参加人员：" name="joinPerson">
            <JUserModal
              v-model:value="info.joinPerson"
              :disabled="!showOkBtn"
              :orgCode="info.depart"
              type="checkbox"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24" class="gutter-row">
          <a-form-item label="请假人员：" name="leavePerson">
            <JUserModal
              v-model:value="info.leavePerson"
              :disabled="!showOkBtn"
              :orgCode="info.depart"
              type="checkbox"
              @confirm="confirmLeavePersonName"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24" class="gutter-row">
          <a-form-item label="班前会时间：" name="preShiftTime">
            <a-input v-model:value="info.preShiftTime" disabled />
          </a-form-item>
        </a-col>
        <template v-if="isTeamData">
          <a-col :span="24" class="gutter-row">
            <a-form-item label="临时互保对子：" name="userId">
              <div v-for="(item, index) in info.pairsList" :key="index" class="info-list" style="margin-bottom: 10px">
                <div v-if="showOkBtn">
                  <JUserModal
                    v-model:value="item.userId"
                    :orgCode="info.depart"
                    :userStyle="{ width: 'calc(100% - 96px)' }"
                    type="checkbox"
                    @confirm="(name, userName) => userConfirm(name, userName, index)"
                    @click-user="(cb) => handleUserIds(cb)"
                  />
                  <span style="color: #4498f0; margin-left: 20px; cursor: pointer" @click="add(index)">添加</span>
                  <span v-if="info.pairsList.length > 1" style="color: red; margin-left: 20px; cursor: pointer" @click="remove(index)">删除</span>
                </div>
                <div v-else style="margin-top: 6px">
                  {{ item.userName.replace(/,/g, '\u00A0\u00A0\u00A0↔\u00A0\u00A0\u00A0') }}
                </div>
              </div>
            </a-form-item>
          </a-col>
        </template>
      </a-row>
      <template v-if="isTeamData">
        <div class="nav"> 班前会记录</div>
        <div class="nav" style="font-size: 15px; margin-left: 15px"> 班前准备</div>
        <div v-for="item in info.dataSource" :key="item.rowKey" class="zb-list">
          <h3>{{ '流程' + item.rowKey }}：{{ item.lc }}</h3>
          <div style="text-align: left; margin-bottom: 10px">
            准备状态：
            <a-radio-group v-model:value="item.status" :disabled="!showOkBtn">
              <a-radio value="1">准备好</a-radio>
              <a-radio value="2">未准备好</a-radio>
            </a-radio-group>
          </div>
          <div>
            <span style="display: block; margin-bottom: 8px">说明（必填）：</span>
            <InputTextArea v-model:value="item.illustrate" :disabled="!showOkBtn" auto-size placeholder="请输入" />
          </div>
        </div>
      </template>
      <div class="nav" style="margin: 15px 0 15px 15px; font-size: 15px"> 流程记录</div>
      <div v-for="(item, idx) in displayDataSource1" :key="item.rowKey" class="zb-list">
        <h3>{{ '流程' + (isTeamData ? item.rowKey : idx + 1) }}：{{ item.lc }}</h3>
        <div style="text-align: left; margin-bottom: 10px"> 标准：<span style="color: #666666" v-html="item.standard"></span></div>
        <div v-if="item.rowKey !== '5'">
          <VideoOrImgUpload v-model:value="item.file" :disabled="!showOkBtn" style="text-align: left" :text="item.rowKey === '7' ? '上传图片' : '上传（必填）'" />
          <div>
            <span style="display: block; margin-bottom: 8px">{{ item.rowKey === '7' ? '会议纪要（必填）：' : '说明（必填）：' }}</span>
            <InputTextArea v-model:value="item.illustrate" :disabled="!showOkBtn" auto-size placeholder="请输入" />
          </div>
        </div>
        <div v-else>
          <div class="nav" style="font-size: 14px; text-align: left; margin-left: 0; margin-top: 10px"> 手指口述</div>
          <VideoOrImgUpload v-model:value="item.file1" :disabled="!showOkBtn" style="text-align: left" text="上传（必填）" />
          <div>
            <span style="display: block; margin-bottom: 8px">说明（必填）：</span>
            <InputTextArea v-model:value="item.illustrate1" :disabled="!showOkBtn" auto-size placeholder="请输入" />
          </div>
          <div class="nav" style="font-size: 14px; text-align: left; margin-left: 0; margin-top: 10px"> 吓一跳</div>
          <VideoOrImgUpload v-model:value="item.file2" :disabled="!showOkBtn" style="text-align: left" text="上传（必填）" />
          <div>
            <span style="display: block; margin-bottom: 8px">说明（必填）：</span>
            <InputTextArea v-model:value="item.illustrate2" :disabled="!showOkBtn" auto-size placeholder="请输入" />
          </div>
          <div class="nav" style="font-size: 14px; text-align: left; margin-left: 0; margin-top: 10px"> 一口清</div>
          <VideoOrImgUpload v-model:value="item.file3" :disabled="!showOkBtn" style="text-align: left" text="上传（必填）" />
          <div>
            <span style="display: block; margin-bottom: 8px">说明（必填）：</span>
            <InputTextArea v-model:value="item.illustrate3" :disabled="!showOkBtn" auto-size placeholder="请输入" />
          </div>
          <div class="nav" style="font-size: 14px; text-align: left; margin-left: 0; margin-top: 10px"> 安全分享</div>
          <VideoOrImgUpload v-model:value="item.file4" :disabled="!showOkBtn" style="text-align: left" text="上传（必填）" />
          <div>
            <span style="display: block; margin-bottom: 8px">说明（必填）：</span>
            <InputTextArea v-model:value="item.illustrate4" :disabled="!showOkBtn" auto-size placeholder="请输入" />
          </div>
        </div>
      </div>
      <template v-if="info.bzkTime">
        <div class="nav" style="margin: 15px 0 15px 15px; font-size: 15px"> 本次不召开</div>
        <div class="zb-list">
          <div style="margin-bottom: 8px"><span style="color: #666">原因：</span>{{ info.bzkReason }}</div>
          <div style="margin-bottom: 8px"><span style="color: #666">当班工作及安全措施：</span>{{ info.bzkMsr }}</div>
          <div v-if="info.bzkPicture" style="margin-bottom: 8px">
            <span style="color: #666">照片：</span>
            <VideoOrImgUpload v-model:value="info.bzkPicture" disabled />
          </div>
          <div><span style="color: #666">提交时间：</span>{{ info.bzkTime }}</div>
        </div>
      </template>
    </a-form>
  </div>
  <div class="bottom">
    <div>
      <van-button v-if="isTeamData && showOkBtn" style="margin-right: 15px; width: 118px; height: 40px" type="danger" @click="bzkVisible = true">本次不召开</van-button>
      <van-button style="margin-right: 15px; width: 118px; height: 40px" @click="router.go(-1)">取消</van-button>
      <van-button v-if="showOkBtn" :loading="loading" style="margin-right: 15px; width: 118px; height: 40px" type="primary" @click="handleSubmit"
        >提交
      </van-button>
    </div>
  </div>
  <!-- 本次不召开弹窗 -->
  <van-dialog v-model:show="bzkVisible" title="本次不召开" show-cancel-button :before-close="handleBzkBeforeClose">
    <div style="padding: 16px">
      <div style="margin-bottom: 12px">
        <div style="margin-bottom: 4px"><span style="color: red">*</span> 班次：</div>
        <a-select v-model:value="bzkForm.teamOrder" :options="teamOrderOption" placeholder="请选择班次" style="width: 100%" :getPopupContainer="(node) => node.parentNode" />
      </div>
      <div style="margin-bottom: 12px">
        <div style="margin-bottom: 4px"><span style="color: red">*</span> 原因：</div>
        <InputTextArea v-model:value="bzkForm.bzkReason" :rows="3" placeholder="请输入原因" />
      </div>
      <div style="margin-bottom: 12px">
        <div style="margin-bottom: 4px"><span style="color: red">*</span> 当班工作及安全措施：</div>
        <InputTextArea v-model:value="bzkForm.bzkMsr" :rows="3" placeholder="请输入当班工作及安全措施" />
      </div>
      <div>
        <div style="margin-bottom: 4px">上传照片：</div>
        <VideoOrImgUpload v-model:value="bzkForm.bzkPicture" />
      </div>
    </div>
  </van-dialog>
</template>
<script lang="ts" setup>
  import { useRoute, useRouter } from 'vue-router';
  import { ref, computed, onMounted, reactive } from 'vue';
  import JUserModal from '/@/components/App/JUserModal.vue';
  import { Input, message } from 'ant-design-vue';
  import VideoOrImgUpload from '../../meetingBeforeClass/VideoOrImgUpload.vue';
  import { edit, queryById, bzk } from '../../meetingBeforeClass/url/index';
  import { showConfirmDialog } from 'vant';
  const route: any = useRoute();
  const router = useRouter();
  const showOkBtn = ref(true);
  const infoForm = ref();
  const loading = ref(false);
  const InputTextArea = Input.TextArea;
  // 类型定义
  interface Pair {
    userId: string;
    userName: string;
  }

  interface DataSourceItem {
    rowKey: string;
    lc: string;
    status: string;
    illustrate: string;
  }

  interface DataSource1Item {
    rowKey: string;
    lc: string;
    standard: string;

    [key: string]: string;
  }

  interface Info {
    id: string;
    orgName: string;
    departName: string;
    depart: string;
    teamName: string;
    workType: string;
    teamOrder: string;
    expectedNumber: number;
    actualNumber: number;
    leavePersonName: string;
    leavePerson: string;
    joinPerson: string;
    preShiftTime: string;
    pairsList: Pair[];
    dataSource: DataSourceItem[];
    dataSource1: DataSource1Item[];
    bzkReason: string;
    bzkMsr: string;
    bzkPicture: string;
    bzkTime: string;
  }

  // 初始数据常量
  const INIT_PAIRS_LIST: Pair[] = [{ userId: '', userName: '' }];
  const INIT_DATA_SOURCE: DataSourceItem[] = [
    { rowKey: '1', lc: '巡视作业现场', status: '1', illustrate: '' },
    { rowKey: '2', lc: '了解上班情况', status: '1', illustrate: '' },
    { rowKey: '3', lc: '熟悉上级要求', status: '1', illustrate: '' },
    { rowKey: '4', lc: '准备班前会要点', status: '1', illustrate: '' },
  ];
  const INIT_DATA_SOURCE1: DataSource1Item[] = [
    {
      rowKey: '1',
      lc: '点名，互查劳保急救药盒',
      standard: '班组长点名，确定当班上班人数；联保人员互查劳保穿戴情况、精神状况、急救药品佩戴（建议互保人员坐在一起，便于互查）；',
      file: '',
      illustrate: '',
      file1: '',
      illustrate1: '',
      file2: '',
      illustrate2: '',
      file3: '',
      illustrate3: '',
      file4: '',
      illustrate4: '',
    },
    {
      rowKey: '2',
      lc: '背诵安全誓词',
      standard: '班组长带领全员背诵安全誓词；',
      file: '',
      illustrate: '',
      file1: '',
      illustrate1: '',
      file2: '',
      illustrate2: '',
      file3: '',
      illustrate3: '',
      file4: '',
      illustrate4: '',
    },
    {
      rowKey: '3',
      lc: '观看安全警示教育视频',
      standard: '每周组织一次交通安全警示视频，其它时间可选择与生产、检维修等相关的事故警示视频；',
      file: '',
      illustrate: '',
      file1: '',
      illustrate1: '',
      file2: '',
      illustrate2: '',
      file3: '',
      illustrate3: '',
      file4: '',
      illustrate4: '',
    },
    {
      rowKey: '4',
      lc: '贯彻学习',
      standard: '传达集团、厂部、车间安全相关方案、通报及其他文件；',
      file: '',
      illustrate: '',
      file1: '',
      illustrate1: '',
      file2: '',
      illustrate2: '',
      file3: '',
      illustrate3: '',
      file4: '',
      illustrate4: '',
    },
    {
      rowKey: '5',
      lc: '安全活动',
      standard: '开展一项安全活动：手指口述、"吓一跳"、我的一次不安全经历；抽查安全操作规程、应知应会等；',
      file: '',
      illustrate: '',
      file1: '',
      illustrate1: '',
      file2: '',
      illustrate2: '',
      file3: '',
      illustrate3: '',
      file4: '',
      illustrate4: '',
    },
    {
      rowKey: '6',
      lc: '布置当班工作情况',
      standard:
        '1、讲解上班生产情况及存在问题，针对问题部署改进措施；<br>2、布置本班生产工作及安全事项（布置工作任务、分析存在风险辨识、制定防范措施等）；',
      file: '',
      illustrate: '',
      file1: '',
      illustrate1: '',
      file2: '',
      illustrate2: '',
      file3: '',
      illustrate3: '',
      file4: '',
      illustrate4: '',
    },
    {
      rowKey: '7',
      lc: '周例会',
      standard: '',
      file: '',
      illustrate: '',
      file1: '',
      illustrate1: '',
      file2: '',
      illustrate2: '',
      file3: '',
      illustrate3: '',
      file4: '',
      illustrate4: '',
    },
  ];

  // 工具函数
  function getInitInfo(): Info {
    return {
      id: '',
      orgName: '',
      depart: '',
      departName: '',
      teamName: '',
      workType: '',
      teamOrder: '',
      expectedNumber: 0,
      actualNumber: 0,
      leavePersonName: '',
      leavePerson: '',
      joinPerson: '',
      preShiftTime: '',
      pairsList: JSON.parse(JSON.stringify(INIT_PAIRS_LIST)),
      dataSource: JSON.parse(JSON.stringify(INIT_DATA_SOURCE)),
      dataSource1: JSON.parse(JSON.stringify(INIT_DATA_SOURCE1)),
      bzkReason: '',
      bzkMsr: '',
      bzkPicture: '',
      bzkTime: '',
    };
  }

  const teamOrderOption = ref([
    { label: '甲', value: '甲' },
    { label: '乙', value: '乙' },
    { label: '丙', value: '丙' },
  ]);
  const info = ref<Info>(getInitInfo());

  // 班组/车间区分
  const isTeamData = computed(() => !!info.value.teamName);
  // 车间数据只显示周例会
  const displayDataSource1 = computed(() => {
    if (isTeamData.value) {
      return info.value.dataSource1;
    }
    return info.value.dataSource1.filter(item => item.rowKey === '7');
  });

  // 本次不召开
  const bzkVisible = ref(false);
  const bzkForm = reactive({ teamOrder: undefined as any, bzkReason: '', bzkMsr: '', bzkPicture: '' });
  const handleBzkBeforeClose = async (action) => {
    if (action === 'confirm') {
      if (!bzkForm.teamOrder) {
        message.warning('请选择班次');
        return false;
      }
      if (!bzkForm.bzkReason) {
        message.warning('请输入原因');
        return false;
      }
      if (!bzkForm.bzkMsr) {
        message.warning('请输入当班工作及安全措施');
        return false;
      }
      try {
        await bzk({ id: info.value.id, ...bzkForm });
        message.success('提交成功');
        router.push({ path: '/app/meetingBeforeClass/list' });
      } catch (e) {
        return false;
      }
    }
    return true;
  };

  onMounted(async () => {
    showOkBtn.value = route.query?.type === 'edit';
    const res = await queryById({ id: route.query.id });
    if (res.workType === '1') {
      teamOrderOption.value = [
        { label: '甲', value: '甲' },
        { label: '乙', value: '乙' },
        { label: '丙', value: '丙' },
      ];
    } else if (res.workType === '2') {
      teamOrderOption.value = [
        { label: '甲', value: '甲' },
        { label: '乙', value: '乙' },
      ];
    } else if (res.workType === '3') {
      teamOrderOption.value = [{ label: '常白班', value: '常白班' }];
    }
    if (res) {
      if(res.dataSource1 && res.dataSource1.length > 6) {
        res.dataSource1.splice(1, 1);
      }
      let initDataSource1 = JSON.parse(JSON.stringify(INIT_DATA_SOURCE1));
      // 合并数据，避免直接赋值
      info.value = {
        ...info.value,
        ...res,
        dataSource: info.value.dataSource.map((item, idx) => ({
          ...item,
          status: res.dataSource?.[idx]?.status ?? item.status,
          illustrate: res.dataSource?.[idx]?.illustrate ?? item.illustrate,
        })),
        dataSource1: initDataSource1.map((item, idx) => ({
          ...item,
          ...['file', 'illustrate', 'file1', 'illustrate1', 'file2', 'illustrate2', 'file3', 'illustrate3', 'file4', 'illustrate4'].reduce(
            (acc, key) => ({ ...acc, [key]: res.dataSource1?.[idx]?.[key] ?? item[key] }),
            {}
          ),
        })),
        pairsList: res.pairsList?.length ? res.pairsList : showOkBtn.value ? getInitInfo().pairsList : [],
      };
    }
  });
  const add = (index: number) => info.value.pairsList.splice(index + 1, 0, { userId: '', userName: '' });
  const remove = (index: number) => info.value.pairsList.splice(index, 1);
  const handleUserIds = (cb: (userIds: string[]) => void) => {
    let list = info.value.pairsList.filter((item) => item.userId);
    if (info.value.leavePerson && info.value.leavePerson.trim() !== '') {
      list = list.concat({ userId: info.value.leavePerson, userName: '' });
    }
    const userIds = list.flatMap((item) => item.userId.split(','));
    cb(userIds);
  };

  const userConfirm = (_name: string, userName: string, index: number) => {
    info.value.pairsList[index].userName = userName;
  };
  const confirmLeavePersonName = (_name, userName) => {
    info.value.leavePersonName = userName;
    removeLeavePersonFromPairsList();
  };
  // 移除临时互保对子中存在的请假人员
  const removeLeavePersonFromPairsList = () => {
    if (!info.value.leavePerson || info.value.leavePerson === '') return;
    const leaveIds = info.value.leavePerson
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    info.value.pairsList = info.value.pairsList.map((item) => {
      const ids = item.userId.split(',').map((id) => id.trim());
      const names = item.userName.split(',').map((name) => name.trim());
      const filtered = ids
        .map((id, idx) => ({
          id,
          name: names[idx] || '',
        }))
        .filter((pair) => pair.id && !leaveIds.includes(pair.id));
      return {
        ...item,
        userId: filtered.map((pair) => pair.id).join(','),
        userName: filtered.map((pair) => pair.name).join(','),
      };
    });
  };
  const handleSubmit = async () => {
    await infoForm.value.validate();
    let flag = false;
    if (isTeamData.value) {
      // 班组数据：验证班前准备 + 流程记录（跳过观看安全警示教育视频3、安全活动5、周例会7）
      for (let i = 0; i < info.value.dataSource.length; i++) {
        if (!info.value.dataSource[i].illustrate || info.value.dataSource[i].illustrate === '') {
          flag = true;
          break;
        }
      }
      const skipRowKeys = ['3', '5', '7'];
      for (let i = 0; i < info.value.dataSource1.length; i++) {
        const row = info.value.dataSource1[i];
        if (skipRowKeys.includes(row.rowKey)) continue;
        if (!row.illustrate || row.illustrate === '') {
          flag = true;
          break;
        }
        if (!row.file || row.file === '') {
          flag = true;
          break;
        }
      }
    } else {
      // 车间数据：不验证周例会，直接提交
    }
    if (flag) {
      showConfirmDialog({
        title: '提示',
        message: '有必填项未完成，是否继续提交？',
      }).then(() => {
          submitFinally();
      });
    } else {
      submitFinally();
    }
  };
  const submitFinally = async () => {
    loading.value = true;
    try {
      const paramas = JSON.parse(JSON.stringify(info.value));
      paramas.dataSource1.splice(1, 0, {
        rowKey: '2',
        lc: '互查劳保急救药盒',
        standard: '联保人员互查劳保穿戴情况、精神状况、急救药品佩戴（建议互保人员坐在一起，便于互查）；',
        file: '',
        illustrate: '',
        file1: '',
        illustrate1: '',
        file2: '',
        illustrate2: '',
        file3: '',
        illustrate3: '',
        file4: '',
        illustrate4: '',
      })
      await edit(paramas);
      router.push({
        path: '/app/meetingBeforeClass/list',
      });
    } finally {
      loading.value = false;
    }
  };
</script>
<style lang="less" scoped>
  .nav {
    color: #1890ff;
    margin-bottom: 10px;
    font-size: 16px;
  }

  .zb-list {
    background-image: url('../../../../assets/images/certificate/bg.png');
    background-size: 100% 100%;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 8px;
    box-shadow: -4px 6px 16px 0 rgba(0, 0, 0, 0.12);
  }

  :deep(.ant-form-item) {
    margin-bottom: 15px !important;
  }

  :deep(.ant-upload),
  :deep(.ant-upload-list-item),
  :deep(.ant-upload-list-picture-card-container) {
    height: 100px;
    width: 100px;
  }

  .bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08); /* 顶部阴影 */
    display: flex;
    align-items: center; /* 垂直居中 */
    z-index: 10; /* 保证浮在上层 */

    & > div {
      margin: 0 auto;
    }
  }
</style>
