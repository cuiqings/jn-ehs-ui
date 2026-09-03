<template>
  <div class="emergencyNew-rescueTeam">
    <a-spin :spinning="spinning">
      <div class="emergencyNew-rescueTeam-content" style="margin-bottom: 10px">
        <div class="plant-section">
          <div class="plant-header-layout">
            <div class="plant-title-vertical">
              <div class="plant-title">敬业集团</div>
            </div>
            <div class="plant-content-right">
              <div class="plant-header-top" :style="!listJtObj ? 'justify-content: end' : 'justify-content: space-between'">
                <div class="plant-contact" v-if="listJtObj">
                  <span class="label">应急负责人：</span>
                  <span class="member-name">{{ listJtObj.jyLeaderRealname }}（{{ listJtObj.jyLeaderUserneme }}）| {{ listJtObj.jyLeaderPhone }}</span>
                </div>
                <div class="plant-actions">
                  <a-button class="edit-btn" size="small" v-auth="'rescueTeam:jtEdit'" @click="handleJtEdit(listJtObj)">编辑</a-button>
                </div>
              </div>
              <div v-if="listJtObj && listJtObj.yjRescueTeamSubList && listJtObj.yjRescueTeamSubList.length > 0" class="team-members-content">
                <div class="all-members-grid">
                  <div
                    v-for="(item, index) in allMembersList"
                    :key="index"
                    class="member-item"
                    @mouseenter="showTooltipIndex = index"
                    @mouseleave="showTooltipIndex = null"
                  >
                    <div class="member-name">
                      {{ item.realname }} <span class="member-phone">{{ item.phone }}</span>
                      <span v-if="item.jyResponsibility" class="down-icon">▼</span>
                    </div>
                    <div v-if="item.jyResponsibility && showTooltipIndex === index" class="responsibility-tooltip">
                      <div class="tooltip-content">
                        <div class="tooltip-title">应急职责：</div>
                        <div class="tooltip-text">{{ item.jyResponsibility }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <a-empty
                v-else-if="!listJtObj || !listJtObj.yjRescueTeamSubList || listJtObj.yjRescueTeamSubList.length === 0"
                description="暂无数据"
                style="position: relative; margin: 0; background-color: #fff"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="emergencyNew-rescueTeam-search">
        <a-form
          :model="queryParams"
          :label-col="{
            xs: { span: 24 },
            sm: { span: 5 },
          }"
          :wrapper-col="{
            xs: { span: 24 },
            sm: { span: 19 },
          }"
        >
          <a-row :gutter="24">
            <a-col :md="6" :sm="12">
              <a-form-item label="所属单位">
                <a-select
                  v-model:value="queryParams.sysOrgCode"
                  :options="orgOptions"
                  placeholder="请选择"
                  showSearch
                  :disabled="orgOptions.length === 1"
                  :filterOption="(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                />
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="12">
              <a-button type="primary" preIcon="ant-design:search-outlined" @click="init">查询</a-button>
              <a-button preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div class="emergencyNew-rescueTeam-btn">
        <a-button type="primary" preIcon="ant-design:plus-outlined" v-auth="'rescueTeam:add'" style="margin-right: 10px" @click="openTeamModal"
          >创建队伍</a-button
        >
        <j-upload-button
          type="primary"
          preIcon="ant-design:import-outlined"
          v-auth="'rescueTeam:export'"
          style="margin-right: 10px"
          @click="onImportXls"
          >队伍成员配置导入</j-upload-button
        >
        <a-button type="primary" @click="downloadTemplate">下载模版</a-button>
      </div>
      <div class="emergencyNew-rescueTeam-content">
        <div class="plant-section" v-if="listObj.sysOrgName">
          <div class="plant-header">
            <div class="plant-title-wrapper">
              <div class="plant-title-bar"></div>
              <div class="plant-title">{{ listObj.sysOrgName }}</div>
            </div>
            <div class="plant-contact">
              <span style="margin-right: 6px; color: #1890ff">应急负责人：</span>
              <span>{{ listObj.jyLeaderRealname }} ({{ listObj.jyLeaderUserneme }}) | {{ listObj.jyLeaderPhone }}</span>
            </div>
            <div class="plant-actions">
              <a-button class="edit-btn" size="small" v-auth="'rescueTeam:edit'" @click="handleEdit(listObj)">编辑</a-button>
              <a-button class="delete-btn" size="small" v-auth="'rescueTeam:delete'" @click="handleDelete(listObj)">删除</a-button>
            </div>
          </div>
          <div class="department-cards" v-if="listObj.teamSubMap">
            <a-card v-for="(key, index) in Object.keys(listObj.teamSubMap)" :key="index" :title="key" class="department-card">
              <div v-if="listObj.teamSubMap && listObj.teamSubMap[key].length > 0" class="member-list">
                <div v-for="member in listObj.teamSubMap[key]" :key="member.id" class="member-item">
                  <div class="member-role">
                    <span>{{ render.renderDictText(member.role, 'jy_role') }}</span>
                    <div class="member-name">
                      <span class="member-name-text">{{ member.realname }}</span>
                      <span class="member-phone">{{ member.phone }}</span>
                    </div>
                  </div>
                  <div class="member-info">
                    <div class="member-responsibility">{{ member.jyResponsibility }}</div>
                  </div>
                </div>
              </div>
            </a-card>
          </div>
          <a-empty v-else description="暂无数据" style="position: relative; padding: 20px; margin: 0; background-color: #fff" />
        </div>
        <a-empty v-else description="暂无数据" style="position: relative; padding: 20px; margin: 0; background-color: #fff" />
      </div>
    </a-spin>
    <TeamModal @register="registerModal" @success="init" />
    <JtModal @register="registerJtModal" @success="initJt" />
  </div>
</template>
<script setup lang="ts" name="emergencyNew-rescueTeam">
  import { ref, onMounted, createVNode, computed } from 'vue';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import TeamModal from './teamModal.vue';
  import JtModal from './JtModal.vue';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { del, list, listJt } from './api';
  import { useUserStore } from '/@/store/modules/user';
  import { render } from '/@/utils/common/renderUtils';
  const userStore: any = useUserStore();
  const userInfo: any = computed(() => userStore.getUserInfo);
  const { handleImportXls, handleExportXlsx } = useMethods();
  const { createConfirm } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const [registerJtModal, { openModal: openJtModal }] = useModal();
  const queryParams = ref({
    sysOrgCode: undefined,
  });
  const orgOptions: any = ref([]);
  const spinning = ref(false);
  const listObj: any = ref({});
  const listJtObj: any = ref(null);
  // 集团当前
  const showTooltipIndex = ref<number | null>(null);
  // 分离应急队长和应急队员
  const captainList = computed(() => {
    if (!listJtObj.value || !listJtObj.value.yjRescueTeamSubList || !Array.isArray(listJtObj.value.yjRescueTeamSubList)) {
      return [];
    }
    return listJtObj.value.yjRescueTeamSubList.filter((item: any) => item.role === '1');
  });
  const memberList = computed(() => {
    if (!listJtObj.value || !listJtObj.value.yjRescueTeamSubList || !Array.isArray(listJtObj.value.yjRescueTeamSubList)) {
      return [];
    }
    return listJtObj.value.yjRescueTeamSubList.filter((item: any) => item.role !== '1');
  });
  // 合并应急队长和队员，队长在前
  const allMembersList = computed(() => {
    return [...captainList.value, ...memberList.value];
  });
  // 发包单位
  const initOrgOptions = () => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      queryParams.value.sysOrgCode = initOrgCode();
      init();
    });
  };
  onMounted(() => {
    initJt();
    initOrgOptions();
  });
  const initOrgCode = () => {
    if (userInfo.value.orgCode.length > 9) {
      return userInfo.value.orgCode.slice(0, 9);
    } else {
      if (userInfo.value.orgCode === 'A04') {
        return orgOptions.value[0].value;
      } else {
        return userInfo.value.orgCode;
      }
    }
  };
  const init = () => {
    spinning.value = true;
    list(queryParams.value)
      .then((res) => {
        listObj.value = res || {};
        spinning.value = false;
      })
      .catch(() => {
        listObj.value = {};
        spinning.value = false;
      });
  };
  const initJt = () => {
    listJt().then((res) => {
      listJtObj.value = res || null;
    });
  };
  const searchReset = () => {
    Object.assign(queryParams.value, {
      sysOrgCode: initOrgCode(),
      name: undefined,
    });
    init();
  };
  const openTeamModal = () => {
    openModal(true, {
      isUpdate: false,
    });
  };
  const handleEdit = (record: any) => {
    openModal(true, {
      isUpdate: true,
      record,
    });
  };
  const handleJtEdit = (record: any) => {
    openJtModal(true, {
      record,
    });
  };
  const handleDelete = (record: any) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        return new Promise<void>((resolve) => {
          del({ id: record.id })
            .then((res) => {
              if (res) {
                init();
                resolve();
              }
            })
            .finally(() => {
              resolve();
            });
        });
      },
    });
  };
  const onImportXls = (file) => {
    handleImportXls(file, '/yjRescueTeamMain/importExcel', init, { orgCode: queryParams.value.sysOrgCode });
  };
  const downloadTemplate = () => {
    handleExportXlsx('应急救援队伍模版下载', '/yjRescueTeamMain/importTemplate', {});
  };
</script>
<style scoped lang="less">
  .emergencyNew-rescueTeam {
    padding: 10px 15px;
    .emergencyNew-rescueTeam-search {
      background-color: #fff;
      padding: 12px 10px;
      :deep(.ant-form-item) {
        margin-bottom: 0;
      }
    }
    .member-role {
      font-weight: 600;
      color: #1890ff;
      margin-bottom: 6px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      .member-name-text {
        font-size: 14px;
        color: #262626;
        font-weight: normal;
        margin-right: 10px;
      }
    }
    .emergencyNew-rescueTeam-btn {
      margin-bottom: 10px;
      background-color: #fff;
      padding: 10px;
    }
    .emergencyNew-rescueTeam-content {
      background-color: #f5f5f5;
      :deep(.ant-card-body) {
        padding: 10px 20px;
      }
    }
    .plant-section {
      background-color: #fff;
      margin-bottom: 20px;
      border-radius: 4px;
      overflow: visible;
      &:last-child {
        margin-bottom: 0;
      }
      .plant-header {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        background-color: #fff;
        position: relative;
        .plant-title-wrapper {
          display: flex;
          align-items: center;
          margin-right: 24px;
          .plant-title-bar {
            width: 4px;
            height: 20px;
            background-color: #1890ff;
            margin-right: 12px;
            border-radius: 2px;
          }
          .plant-title {
            font-size: 18px;
            font-weight: 600;
            color: #262626;
          }
        }
        .plant-contact {
          flex: 1;
          color: #262626;
          font-size: 14px;
          font-weight: 500;
        }
        .plant-actions {
          display: flex;
          gap: 8px;
          .edit-btn {
            color: #1890ff;
            border-color: #91d5ff;
            background-color: #e6f7ff;
            &:hover {
              color: #40a9ff;
              border-color: #69c0ff;
            }
          }
          .delete-btn {
            color: #ff4d4f;
            border-color: #ffccc7;
            background-color: #fff1f0;
            &:hover {
              color: #ff7875;
              border-color: #ffa39e;
            }
          }
        }
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #1890ff;
        }
      }
      .department-cards {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        padding: 12px;
        .department-card {
          width: calc((100% - 48px) / 5);
          min-width: 280px;
          flex: 0 0 calc((100% - 48px) / 5);
          @media (max-width: 1600px) {
            width: calc((100% - 36px) / 4);
            flex: 0 0 calc((100% - 36px) / 4);
          }
          @media (max-width: 1400px) {
            width: calc((100% - 24px) / 3);
            flex: 0 0 calc((100% - 24px) / 3);
          }
          @media (max-width: 1200px) {
            width: calc((100% - 12px) / 2);
            flex: 0 0 calc((100% - 12px) / 2);
          }
          @media (max-width: 768px) {
            width: 100%;
            flex: 0 0 100%;
          }
          :deep(.ant-card-head) {
            background-color: #fafafa;
            border-bottom: 1px solid #f0f0f0;
            min-height: 48px;
            .ant-card-head-title {
              font-weight: 500;
              color: #262626;
            }
          }
          .member-list {
            .member-item {
              padding: 12px 0;
              border-bottom: 1px solid #f0f0f0;
              &:last-child {
                border-bottom: none;
              }
              .member-info {
                .member-responsibility {
                  font-size: 13px;
                  color: #8c8c8c;
                  line-height: 1.6;
                }
              }
            }
          }
          .empty-member {
            padding: 20px;
            text-align: center;
            color: #bfbfbf;
            font-size: 14px;
          }
        }
      }
      .plant-header-layout {
        display: flex;
        padding: 20px;
        background-color: #fff;
        .plant-title-vertical {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-right: 24px;
          padding-right: 24px;
          border-right: 2px solid #1890ff;
          .plant-title {
            writing-mode: vertical-rl;
            text-orientation: upright;
            font-size: 18px;
            font-weight: 600;
            color: #262626;
            letter-spacing: 8px;
            text-align: center;
          }
        }
        .plant-content-right {
          flex: 1;
          .plant-header-top {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #f0f0f0;
            .plant-contact {
              flex: 1;
              color: #262626;
              font-size: 14px;
              .label {
                font-weight: 600;
                color: #1890ff;
                margin-right: 8px;
              }
              .member-name {
                font-size: 14px;
                font-weight: 600;
              }
            }
            .plant-actions {
              .edit-btn {
                color: #1890ff;
                border-color: #91d5ff;
                background-color: #e6f7ff;
                &:hover {
                  color: #40a9ff;
                  border-color: #69c0ff;
                }
              }
            }
          }
        }
      }
      .team-members-content {
        .all-members-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 16px;
          .member-item {
            position: relative;
            padding: 10px 20px;
            background-color: #fff;
            border: 1px solid #f0f0f0;
            border-radius: 4px;
            .member-name {
              font-size: 14px;
              font-weight: 500;
              color: #262626;
              display: flex;
              align-items: center;
              .member-phone {
                font-size: 13px;
                color: #1890ff;
                margin-left: 10px;
              }
              .down-icon {
                font-size: 10px;
                color: #1890ff;
                margin-left: 6px;
                cursor: pointer;
              }
            }
            .responsibility-tooltip {
              position: absolute;
              top: 100%;
              left: 0;
              right: 0;
              z-index: 9999;
              margin-top: 8px;
              .tooltip-content {
                background-color: #fff;
                border: 1px solid #d9d9d9;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                padding: 12px;
                .tooltip-title {
                  font-size: 12px;
                  font-weight: 600;
                  color: #1890ff;
                  margin-bottom: 6px;
                }
                .tooltip-text {
                  font-size: 13px;
                  color: #262626;
                  line-height: 1.5;
                  word-break: break-word;
                }
              }
            }
            &:hover {
              z-index: 10;
            }
          }
        }
      }
    }
  }
</style>
