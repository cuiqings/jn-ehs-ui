<template>
  <div class="dashboard-statistics">
    <div class="statistics-container">
      <!-- 新的 Tab 切换布局 -->
      <a-tabs v-model:activeKey="activeTab" style="flex: 1; margin-bottom: 8px" type="card" @change="handleTabChange">
        <a-tab-pane key="edu" tab="年度安全教育再培训">
          <div class="chart-card">
            <div class="card-header">
              <div class="header-top">
                <div class="title-with-detail">
                  <h3 class="card-title" style="margin-bottom: 5px">年度安全教育再培训</h3>
                  <a-button class="detail-btn" size="small" style="margin-top: -7px" type="link" @click="goDetail('1')"> 详情 </a-button>
                  <a-button
                    v-auth="'dashboardHome:mark'"
                    class="remark-btn"
                    size="small"
                    style="margin-top: -7px"
                    type="link"
                    @click="toggleRemark('edu')"
                    >备注
                  </a-button>
                </div>
                <div class="header-controls">
                  <!-- <span class="control-label">排序</span>
                    <a-button-group class="sort-buttons">
                      <a-button :type="sortType === '1' ? 'primary' : 'default'" size="small" @click="setSortType('1')"> 合格率 </a-button>
                      <a-button :type="sortType === '2' ? 'primary' : 'default'" size="small" @click="setSortType('2')"> 第一次考试合格率 </a-button>
                    </a-button-group> -->
                  <span class="control-label">选择事业部：</span>
                  <a-select
                    v-model:value="eduBusinessUnit"
                    placeholder="请选择"
                    style="width: 200px; margin-right: 10px"
                    size="small"
                    allowClear
                    @change="handleEduBusinessUnitChange"
                  >
                    <a-select-option v-for="item in eduBusinessUnitList" :key="item.orgCode" :value="item.orgCode">
                      {{ item.departName }}
                    </a-select-option>
                  </a-select>
                  <span class="control-label">选择时间：</span>
                  <a-range-picker
                    v-model:value="trainingDateRange"
                    :allowClear="false"
                    size="small"
                    style="width: 260px"
                    @change="handleDateRangeChange1"
                  />
                </div>
              </div>
            </div>
            <div style="margin: 10px 16px">
              <a-tabs v-model:activeKey="activeTabPane" @change="handleTabPaneChange">
                <a-tab-pane key="taskIssue" tab="任务下发率">
                  <!-- 任务下发统计 -->
                  <a-spin :spinning="spinningTask" tip="加载中...">
                    <div class="chart-content task-issue-chart-content">
                      <div ref="taskIssueChartRef" class="chart-wrapper" style="height: 460px; width: 100%"></div>
                    </div>
                  </a-spin>
                </a-tab-pane>

                <a-tab-pane key="trainFinishRate" tab="培训完成率" />
                <a-tab-pane key="qualified" tab="合格率" />
                <a-tab-pane key="firstExamQualified" tab="第一次考试合格率" />
              </a-tabs>
            </div>
            <div
              v-show="activeTabPane === 'firstExamQualified' || activeTabPane === 'qualified' || activeTabPane === 'trainFinishRate'"
              style="margin: 10px 16px"
            >
              <div class="statistics-summary">
                <div class="summary-item">
                  <span class="summary-label">单位人数</span>
                  <span class="summary-value">{{ trainingData.shouldTrainCount }}</span>
                  <span class="summary-unit">人</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">已完成</span>
                  <span class="summary-value">{{ trainingData.completedCount }}</span>
                  <span class="summary-unit">人</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">合格率</span>
                  <span class="summary-value highlight">{{ trainingData.qualifiedRate }}</span>
                  <span class="summary-unit">%</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">第一次考试合格率</span>
                  <span class="summary-value highlight">{{ trainingData.firstExamQualifiedRate }}</span>
                  <span class="summary-unit">%</span>
                </div>
              </div>
              <a-spin :spinning="spinning" tip="加载中...">
                <div class="chart-content training-chart-content">
                  <div ref="trainingChartRef" class="chart-wrapper"></div>
                </div>
              </a-spin>
            </div>
            <div v-if="showRemark.edu" class="remark-area">
              <JEditor v-model:value="remarkText.edu" class="remark-textarea" />
              <div style="margin-top: 12px; text-align: right">
                <a-button size="small" style="margin-right: 10px" @click="handleCancelRemark('edu')">取消</a-button>
                <a-button size="small" type="primary" @click="handleSaveRemark('edu')">保存</a-button>
              </div>
            </div>
            <div v-else class="remark-textarea" v-html="remarkText.edu"></div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="danger" tab="高危作业">
          <a-spin :spinning="spinning1" tip="加载中...">
            <div class="chart-card">
              <div class="card-header">
                <div class="header-top">
                  <div class="title-with-detail">
                    <h3 class="card-title">高危作业</h3>
                    <a-button class="detail-btn" size="small" style="margin-top: -8px" type="link" @click="goDetail('2')">详情 </a-button>
                    <a-button
                      v-auth="'dashboardHome:mark'"
                      class="remark-btn"
                      size="small"
                      style="margin-top: -8px"
                      type="link"
                      @click="toggleRemark('danger')"
                      >备注
                    </a-button>
                  </div>
                  <div class="header-controls">
                    <span class="control-label">选择时间：</span>
                    <a-range-picker
                      v-model:value="dangerousWorkDateRange"
                      :allowClear="false"
                      size="small"
                      style="width: 260px"
                      @change="handleDateRangeChange2"
                    />
                  </div>
                </div>
              </div>
              <div class="gw_tab">
                <HighRiskWorkPanel ref="highRiskWorkPanelRef" />
              </div>
              <div v-if="showRemark.danger" class="remark-area">
                <JEditor v-model:value="remarkText.danger" class="remark-textarea" />
                <div style="margin-top: 12px; text-align: right">
                  <a-button size="small" style="margin-right: 10px" @click="handleCancelRemark('danger')">取消 </a-button>
                  <a-button size="small" type="primary" @click="handleSaveRemark('danger')">保存</a-button>
                </div>
              </div>
              <div v-else class="remark-textarea" v-html="remarkText.danger"></div>
              <!-- END_REMOVE_INSPECTION_REMARK_IF -->
            </div>
          </a-spin>
        </a-tab-pane>

        <a-tab-pane key="rectification" tab="隐患排查治理">
          <a-spin :spinning="spinning3" tip="加载中...">
            <div class="chart-card">
              <div class="card-header">
                <div class="header-top">
                  <div class="title-with-detail">
                    <h3 class="card-title">隐患排查治理</h3>
                    <a-button class="detail-btn" size="small" style="margin-top: -7px" type="link" @click="goDetail('3')">详情 </a-button>
                    <a-button
                      v-auth="'dashboardHome:mark'"
                      class="remark-btn"
                      size="small"
                      style="margin-top: -7px"
                      type="link"
                      @click="toggleRemark('rectification')"
                      >备注
                    </a-button>
                    <a-button
                      v-auth="'dashboardHome:problemSetting'"
                      class="remark-btn"
                      size="small"
                      style="margin-top: -7px"
                      type="link"
                      @click="handleClick"
                      >指标设置
                    </a-button>
                    <!-- <setting-filled
                      v-auth="'dashboardHome:problemSetting'"
                      @click="handleClick"
                      :style="{ fontSize: '13px', color: '#1890ff', marginLeft: '2px', marginTop: '-5px' }"
                  /> -->
                  </div>
                  <div class="time-selector">
                    <span class="time-label">选择事业部：</span>
                    <a-select
                      v-model:value="rectificationBusinessUnit"
                      placeholder="请选择"
                      style="width: 200px; margin-right: 10px"
                      size="small"
                      allowClear
                      @change="handleRectificationBusinessUnitChange"
                    >
                      <a-select-option v-for="item in rectificationBusinessUnitList" :key="item.orgCode" :value="item.orgCode">
                        {{ item.departName }}
                      </a-select-option>
                    </a-select>
                    <span class="time-label">选择时间：</span>
                    <a-range-picker
                      v-model:value="rectificationDateRange"
                      :allowClear="false"
                      size="small"
                      style="width: 260px"
                      @change="handleDateRangeChange4"
                    />
                  </div>
                </div>
              </div>
              <!-- 总百分比显示 -->
              <div class="rectification-summary">
                <div class="summary-item">
                  <span class="summary-label">任务完成率</span>
                  <span class="summary-value">{{ rectificationData1.rate4 }}</span>
                  <span class="summary-unit">%</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">任务按时完成率</span>
                  <span class="summary-value">{{ rectificationData1.rate5 }}</span>
                  <span class="summary-unit">%</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">问题发现率</span>
                  <span class="summary-value">{{ rectificationData1.rate1 }}</span>
                  <div style="display: inline-block; position: relative" class="summary-unit"
                    >%<div class="summary-green">（{{ issueRateLower }}%～{{ issueRateUpper }}%）</div></div
                  >
                </div>
                <div class="summary-item">
                  <span class="summary-label">整改完成率</span>
                  <span class="summary-value">{{ rectificationData1.rate2 }}</span>
                  <span class="summary-unit">%</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">按时整改完成率</span>
                  <span class="summary-value">{{ rectificationData1.rate3 }}</span>
                  <span class="summary-unit">%</span>
                </div>
              </div>
              <div class="chart-content rectification-chart-content">
                <!-- 左侧：综合指标排序（模拟数据） -->
                <div class="rectification-ranking">
                  <div class="ranking-title"
                    >综合指标排序
                    <a-tooltip placement="right" :overlayStyle="{ width: 'max-content', maxWidth: 'none' }">
                      <Icon class="info-icon" icon="ant-design:info-circle-outlined" />
                      <template #title>
                        <div style="padding: 10px">
                          <p>
                            计算规则：（任务按时完成率*{{ (taskCompleteOnTime || 10) / 100 }} + 问题发现指数*{{ (problemRate || 40) / 100 }} +
                            整改完成率*{{ (repairComplete || 20) / 100 }} + 按时整改完成率*{{ (repairCompleteOnTime || 30) / 100 }}）*100
                          </p>
                          <p> 问题发现指数计算方法： </p>
                          <div>① 查看设定标准值：例如 {{ issueRateLower || 8 }}% – {{ issueRateUpper || 10 }}%（含边界值）</div>
                          <div>② 问题发现率在标准值区间或高于上限规则：问题发现指数为 100%</div>
                          <div>③ 问题发现率低于下限规则：</div>
                          <div class="bullet-list">
                            <div>每低于下限 1%，问题发现指数扣 10%；</div>
                            <div>不足 1% 的部分按 1% 计算（例如低 0.3%，则扣 10%）；</div>
                            <div>扣除上限为 80%；</div>
                            <div>问题发现率为 0 的直接扣 100%；</div>
                          </div>
                        </div>
                      </template>
                    </a-tooltip>
                  </div>
                  <div class="ranking-header">
                    <span class="header-org">单位</span>
                    <span class="header-index">综合指标</span>
                    <span class="header-rate">任务按时完成率</span>
                    <span class="header-rate">问题发现率</span>
                    <span class="header-rate">整改完成率</span>
                    <span class="header-rate">按时整改完成率</span>
                  </div>
                  <div class="ranking-list">
                    <div
                      v-for="(item, idx) in rectificationData2Chart"
                      :key="item.org"
                      :class="{ 'top-three-item': idx < 3, 'bottom-three-item': idx >= rectificationData2.length - 3 }"
                      class="ranking-item"
                    >
                      <span class="ranking-org">{{ item.org }}</span>
                      <span class="ranking-score">{{ formatRate(item.index, false) }}</span>
                      <span class="ranking-rate4">{{ formatRate(item.rate5) }}</span>
                      <span class="ranking-rate1">{{ formatRate(item.rate1) }}</span>
                      <span class="ranking-rate2">{{ formatRate(item.rate2) }}</span>
                      <span class="ranking-rate3">{{ formatRate(item.rate3) }}</span>
                    </div>
                  </div>
                </div>

                <!-- 右侧：上下两个图表（折线+柱状） -->
                <div class="chart-section">
                  <div ref="rectificationCombinedChartRef" class="chart-wrapper"></div>
                </div>
              </div>
              <!-- 累积整改情况 -->
              <div class="rectification-cumulative">
                <div class="cumulative-title"
                  >累积整改情况
                  <a-tooltip placement="top" title="查询数据自2025-11-01开始">
                    <Icon class="info-icon" icon="ant-design:info-circle-outlined" />
                  </a-tooltip>
                </div>
                <a-spin :spinning="spinning31" tip="加载中...">
                  <div class="cumulative-summary">
                    <div class="summary-item">
                      <span class="summary-label">问题发现率</span>
                      <span class="summary-value">{{ rectificationData3.rate1 }}</span>
                      <span class="summary-unit">%</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">整改完成率</span>
                      <span class="summary-value">{{ rectificationData3.rate2 }}</span>
                      <span class="summary-unit">%</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">按时整改完成率</span>
                      <span class="summary-value">{{ rectificationData3.rate3 }}</span>
                      <span class="summary-unit">%</span>
                    </div>
                  </div>
                  <div class="rectification-cumulative-charts">
                    <div class="chart-item">
                      <!-- <div class="chart-title">问题发现率</div> -->
                      <div ref="cumulativeDiscoveryRef" class="chart-box"></div>
                    </div>
                    <div class="chart-item">
                      <!-- <div class="chart-title">整改完成率</div> -->
                      <div ref="cumulativeRepairRef" class="chart-box"></div>
                    </div>
                    <div class="chart-item">
                      <!-- <div class="chart-title">按时整改完成率</div> -->
                      <div ref="cumulativeTimelyRef" class="chart-box"></div>
                    </div>
                  </div>
                </a-spin>
              </div>
              <!-- START_REMOVE_RECTIFICATION_REMARK_IF -->
              <div v-if="showRemark.rectification" class="remark-area">
                <JEditor v-model:value="remarkText.rectification" class="remark-textarea" />
                <div style="margin-top: 12px; text-align: right">
                  <a-button size="small" style="margin-right: 10px" @click="handleCancelRemark('rectification')">取消 </a-button>
                  <a-button size="small" type="primary" @click="handleSaveRemark('rectification')">保存</a-button>
                </div>
              </div>
              <div v-else class="remark-textarea" v-html="remarkText.rectification"></div>
              <!-- END_REMOVE_RECTIFICATION_REMARK_IF -->
            </div>
          </a-spin>
        </a-tab-pane>

        <!-- 人员资质证书 -->
        <a-tab-pane key="personnelCert" :tab="personnelCertTitle">
          <a-spin :spinning="spinningPersonnelCert" tip="加载中...">
            <div class="chart-card">
              <div class="card-header">
                <div class="header-top">
                  <div class="title-with-detail">
                    <h3 class="card-title" style="margin-bottom: 0">{{ personnelCertTitle }}</h3>
                    <a-button class="detail-btn" size="small" style="margin-top: 0" type="link" @click="goToPersonnelCertDetails"> 详情 </a-button>
                    <a-button
                      v-auth="'dashboardHome:mark'"
                      class="remark-btn"
                      size="small"
                      style="margin-left: 10px; margin-top: 0"
                      type="link"
                      @click="toggleRemark('personnelCert')"
                      >备注
                    </a-button>
                  </div>
                  <div class="header-controls">
                    <span class="control-label">选择时间：</span>
                    <a-range-picker
                      v-model:value="personnelCertDateRange"
                      :allowClear="false"
                      size="small"
                      style="width: 260px"
                      @change="handleDateRangeChangePersonnelCert"
                    />
                  </div>
                </div>
              </div>
              <div>
                <PersonnelCertificatePanel ref="personnelCertificatePanelRef" />
              </div>
              <div v-if="showRemark.personnelCert" class="remark-area">
                <JEditor v-model:value="remarkText.personnelCert" class="remark-textarea" />
                <div style="margin-top: 12px; text-align: right">
                  <a-button size="small" style="margin-right: 10px" @click="handleCancelRemark('personnelCert')">取消</a-button>
                  <a-button v-show="showRemark.personnelCert" size="small" type="primary" @click="handleSaveRemark('personnelCert')"> 保存 </a-button>
                </div>
              </div>
              <div v-else class="remark-textarea" v-html="remarkText.personnelCert"></div>
            </div>
          </a-spin>
        </a-tab-pane>

        <!-- 相关方管理 -->
        <a-tab-pane key="relatedParty" :tab="relatedPartyTitle">
          <a-spin :spinning="spinningRelatedParty" tip="加载中...">
            <div class="chart-card">
              <div class="card-header">
                <div class="header-top">
                  <div class="title-with-detail">
                    <h3 class="card-title" style="margin-bottom: 0">{{ relatedPartyTitle }}</h3>
                    <a-button class="detail-btn" size="small" style="margin-top: 0" type="link" @click="goToRelatedPartyDetails"> 详情 </a-button>
                    <a-button
                      v-auth="'dashboardHome:mark'"
                      class="remark-btn"
                      size="small"
                      style="margin-left: 10px; margin-top: 0"
                      type="link"
                      @click="toggleRemark('relatedParty')"
                      >备注
                    </a-button>
                  </div>
                  <div class="header-controls">
                    <span class="control-label">选择时间：</span>
                    <a-range-picker
                      v-model:value="relatedPartyDateRange"
                      :allowClear="false"
                      size="small"
                      style="width: 260px"
                      @change="handleDateRangeChangeRelatedParty"
                    />
                  </div>
                </div>
              </div>
              <div>
                <RelatedPartyPanel ref="relatedPartyPanelRef" />
              </div>
              <div v-if="showRemark.relatedParty" class="remark-area">
                <JEditor v-model:value="remarkText.relatedParty" class="remark-textarea" />
                <div style="margin-top: 12px; text-align: right">
                  <a-button size="small" style="margin-right: 10px" @click="handleCancelRemark('relatedParty')">取消</a-button>
                  <a-button v-show="showRemark.relatedParty" size="small" type="primary" @click="handleSaveRemark('relatedParty')"> 保存 </a-button>
                </div>
              </div>
              <div v-else class="remark-textarea" v-html="remarkText.relatedParty"></div>
            </div>
          </a-spin>
        </a-tab-pane>

        <!-- 职业健康 -->
        <a-tab-pane key="occupationalHealth" :tab="occupationalHealthTitle">
          <a-spin :spinning="spinningOccupationalHealth" tip="加载中...">
            <div class="chart-card">
              <div class="card-header">
                <div class="header-top">
                  <div class="title-with-detail">
                    <h3 class="card-title" style="margin-bottom: 0">{{ occupationalHealthTitle }}</h3>
                    <a-button class="detail-btn" size="small" style="margin-top: 0" type="link" @click="goToOccupationalHealthDetails">
                      详情
                    </a-button>
                    <a-button v-auth="'dashboardHome:mark'" class="remark-btn" size="small" type="link" @click="toggleRemark('occupationalHealth')"
                      >备注
                    </a-button>
                  </div>
                  <div class="header-controls">
                    <span class="control-label">选择事业部：</span>
                    <a-select
                      v-model:value="occupationalHealthOrgCode"
                      placeholder="请选择"
                      style="width: 200px; margin-right: 16px"
                      size="small"
                      allowClear
                      @change="handleOccupationalHealthOrgChange"
                    >
                      <a-select-option v-for="item in occupationalHealthOrgList" :key="item.orgCode" :value="item.orgCode">
                        {{ item.departName }}
                      </a-select-option>
                    </a-select>
                    <span class="control-label">选择时间：</span>
                    <a-range-picker
                      v-model:value="occupationalHealthDateRange"
                      :allowClear="false"
                      size="small"
                      style="width: 260px"
                      @change="handleDateRangeChangeOccupationalHealth"
                    />
                  </div>
                </div>
              </div>
              <div class="gw_tab">
                <OccupationalHealthPanel ref="occupationalHealthPanelRef" />
              </div>
              <div v-if="showRemark.occupationalHealth" class="remark-area">
                <JEditor v-model:value="remarkText.occupationalHealth" class="remark-textarea" />
                <div style="margin-top: 12px; text-align: right">
                  <a-button size="small" style="margin-right: 10px" @click="handleCancelRemark('occupationalHealth')">取消</a-button>
                  <a-button v-show="showRemark.occupationalHealth" size="small" type="primary" @click="handleSaveRemark('occupationalHealth')">
                    保存
                  </a-button>
                </div>
              </div>
              <div v-else class="remark-textarea" v-html="remarkText.occupationalHealth"></div>
            </div>
          </a-spin>
        </a-tab-pane>

        <!-- 安全生产标准化 -->
        <a-tab-pane key="safetyStandard" :tab="safetyStandardTitle">
          <a-spin :spinning="spinningSafetyStandard" tip="加载中...">
            <div class="chart-card">
              <div class="card-header">
                <div class="header-top">
                  <div class="title-with-detail">
                    <h3 class="card-title" style="margin-bottom: 0">{{ safetyStandardTitle }}</h3>
                    <a-button class="detail-btn" size="small" style="margin-top: 0" type="link" @click="goToSafetyStandardDetails"> 详情 </a-button>
                    <a-button v-auth="'dashboardHome:mark'" class="remark-btn" size="small" type="link" @click="toggleRemark('safetyStandard')"
                      >备注
                    </a-button>
                  </div>
                  <div class="header-controls">
                    <span class="control-label">选择时间：</span>
                    <a-range-picker
                      v-model:value="safetyStandardDateRange"
                      :allowClear="false"
                      size="small"
                      style="width: 260px"
                      @change="handleDateRangeChangeSafetyStandard"
                    />
                  </div>
                </div>
              </div>
              <div class="gw_tab">
                <SafetyStandardPanel ref="safetyStandardPanelRef" />
              </div>
              <div v-if="showRemark.safetyStandard" class="remark-area">
                <JEditor v-model:value="remarkText.safetyStandard" class="remark-textarea" />
                <div style="margin-top: 12px; text-align: right">
                  <a-button size="small" style="margin-right: 10px" @click="handleCancelRemark('safetyStandard')">取消</a-button>
                  <a-button v-show="showRemark.safetyStandard" size="small" type="primary" @click="handleSaveRemark('safetyStandard')">
                    保存
                  </a-button>
                </div>
              </div>
              <div v-else class="remark-textarea" v-html="remarkText.safetyStandard"></div>
            </div>
          </a-spin>
        </a-tab-pane>

        <a-tab-pane key="teamManagement" :tab="teamManagementTitle">
          <a-spin :spinning="spinningTeamManagement" tip="加载中...">
            <div class="chart-card">
              <div class="card-header">
                <div class="header-top">
                  <div class="title-with-detail">
                    <h3 class="card-title" style="margin-bottom: 0">{{ teamManagementTitle }}</h3>
                    <a-button class="detail-btn" size="small" style="margin-top: 0" type="link" @click="goToTeamManagementDetails"> 详情 </a-button>
                    <a-button v-auth="'dashboardHome:mark'" class="remark-btn" size="small" type="link" @click="toggleRemark('teamManagement')"
                      >备注
                    </a-button>
                  </div>
                  <div class="header-controls">
                    <span class="control-label">选择事业部：</span>
                    <a-select
                      v-model:value="teamManagementBusinessUnit"
                      placeholder="请选择"
                      style="width: 200px; margin-right: 16px"
                      size="small"
                      allowClear
                      @change="handleTeamManagementBusinessUnitChange"
                    >
                      <a-select-option v-for="item in teamManagementBusinessUnitList" :key="item.orgCode" :value="item.orgCode">
                        {{ item.departName }}
                      </a-select-option>
                    </a-select>
                    <span class="control-label">选择时间：</span>
                    <a-range-picker
                      v-model:value="teamManagementDateRange"
                      :allowClear="false"
                      size="small"
                      style="width: 260px"
                      @change="handleDateRangeChangeTeamManagement"
                    />
                  </div>
                </div>
              </div>
              <div class="gw_tab">
                <TeamPanel ref="teamPanelRef" />
              </div>
              <div v-if="showRemark.teamManagement" class="remark-area">
                <JEditor v-model:value="remarkText.teamManagement" class="remark-textarea" />
                <div style="margin-top: 12px; text-align: right">
                  <a-button size="small" style="margin-right: 10px" @click="handleCancelRemark('teamManagement')">取消</a-button>
                  <a-button v-show="showRemark.teamManagement" size="small" type="primary" @click="handleSaveRemark('teamManagement')">
                    保存
                  </a-button>
                </div>
              </div>
              <div v-else class="remark-textarea" v-html="remarkText.teamManagement"></div>
            </div>
          </a-spin>
        </a-tab-pane>

        <a-tab-pane key="facility" :tab="facilityTitle">
          <a-spin :spinning="spinningFacility" tip="加载中...">
            <div class="chart-card">
              <div class="card-header">
                <div class="header-top">
                  <div class="title-with-detail">
                    <h3 class="card-title" style="margin-bottom: 0">{{ facilityTitle }}</h3>
                    <a-button class="detail-btn" size="small" style="margin-top: 0" type="link" @click="goToFacilityManagementDetails"> 详情 </a-button>
                    <a-button v-auth="'dashboardHome:mark'" class="remark-btn" size="small" type="link" @click="toggleRemark('facility')"
                      >备注
                    </a-button>
                  </div>
                  <div class="header-controls">
                    <span class="control-label">选择事业部：</span>
                    <a-select
                      v-model:value="facilityBusinessUnit"
                      placeholder="请选择"
                      style="width: 200px; margin-right: 16px"
                      size="small"
                      allowClear
                      @change="handleFacilityBusinessUnitChange"
                    >
                      <a-select-option v-for="item in facilityBusinessUnitList" :key="item.orgCode" :value="item.orgCode">
                        {{ item.departName }}
                      </a-select-option>
                    </a-select>
                    <span class="control-label">选择时间：</span>
                    <a-range-picker
                      v-model:value="facilityDateRange"
                      :allowClear="false"
                      size="small"
                      style="width: 260px"
                      @change="handleDateRangeChangeFacility"
                    />
                  </div>
                </div>
              </div>
              <div class="gw_tab">
                <FacilityPanel ref="facilityPanelRef" />
              </div>
              <div v-if="showRemark.facility" class="remark-area">
                <JEditor v-model:value="remarkText.facility" class="remark-textarea" />
                <div style="margin-top: 12px; text-align: right">
                  <a-button size="small" style="margin-right: 10px" @click="handleCancelRemark('facility')">取消</a-button>
                  <a-button v-show="showRemark.facility" size="small" type="primary" @click="handleSaveRemark('facility')"> 保存 </a-button>
                </div>
              </div>
              <div v-else class="remark-textarea" v-html="remarkText.facility"></div>
            </div>
          </a-spin>
        </a-tab-pane>

        <a-tab-pane key="emergencyManagement" :tab="emergencyManagementTitle">
          <a-spin :spinning="spinningEmergencyManagement" tip="加载中...">
            <div class="chart-card">
              <div class="card-header">
                <div class="header-top">
                  <div class="title-with-detail">
                    <h3 class="card-title" style="margin-bottom: 0">{{ emergencyManagementTitle }}</h3>
                    <a-button class="detail-btn" size="small" style="margin-top: 0" type="link" @click="goToEmergencyManagementDetails"> 详情 </a-button>
                    <a-button v-auth="'dashboardHome:mark'" class="remark-btn" size="small" type="link" @click="toggleRemark('emergencyManagement')"
                      >备注
                    </a-button>
                  </div>
                  <div class="header-controls">
                    <span class="control-label">选择时间：</span>
                    <a-range-picker
                      v-model:value="emergencyManagementDateRange"
                      :allowClear="false"
                      size="small"
                      style="width: 260px"
                      @change="handleDateRangeChangeEmergencyManagement"
                    />
                  </div>
                </div>
              </div>
              <div class="gw_tab">
                <EmergencyPanel ref="emergencyPanelRef" />
              </div>
              <div v-if="showRemark.emergencyManagement" class="remark-area">
                <JEditor v-model:value="remarkText.emergencyManagement" class="remark-textarea" />
                <div style="margin-top: 12px; text-align: right">
                  <a-button size="small" style="margin-right: 10px" @click="handleCancelRemark('emergencyManagement')">取消</a-button>
                  <a-button v-show="showRemark.emergencyManagement" size="small" type="primary" @click="handleSaveRemark('emergencyManagement')">
                    保存
                  </a-button>
                </div>
              </div>
              <div v-else class="remark-textarea" v-html="remarkText.emergencyManagement"></div>
            </div>
          </a-spin>
        </a-tab-pane>

        <!-- 安全生产投入 -->
        <a-tab-pane key="safeProductionInvest" :tab="safeProductionInvestTitle">
          <a-spin :spinning="spinningSafeProductionInvest" tip="加载中...">
            <div class="chart-card">
              <div class="card-header">
                <div class="header-top">
                  <div class="title-with-detail">
                    <h3 class="card-title" style="margin-bottom: 0">{{ safeProductionInvestTitle }}</h3>
                    <a-button class="detail-btn" size="small" style="margin-top: 0" type="link" @click="goToSafeProductionInvestDetails"> 详情 </a-button>
                    <a-button v-auth="'dashboardHome:mark'" class="remark-btn" size="small" type="link" @click="toggleRemark('safeProductionInvest')"
                      >备注
                    </a-button>
                  </div>
                  <div class="header-controls">
                    <span class="control-label">选择时间：</span>
                    <a-range-picker
                      v-model:value="safeProductionInvestDateRange"
                      :allowClear="false"
                      size="small"
                      style="width: 260px"
                      @change="handleDateRangeChangeSafeProductionInvest"
                    />
                  </div>
                </div>
              </div>
              <div class="gw_tab">
                <SafeProductionInvestPanel ref="safeProductionInvestPanelRef" />
              </div>
              <div v-if="showRemark.safeProductionInvest" class="remark-area">
                <JEditor v-model:value="remarkText.safeProductionInvest" class="remark-textarea" />
                <div style="margin-top: 12px; text-align: right">
                  <a-button size="small" style="margin-right: 10px" @click="handleCancelRemark('safeProductionInvest')">取消</a-button>
                  <a-button v-show="showRemark.safeProductionInvest" size="small" type="primary" @click="handleSaveRemark('safeProductionInvest')">
                    保存
                  </a-button>
                </div>
              </div>
              <div v-else class="remark-textarea" v-html="remarkText.safeProductionInvest"></div>
            </div>
          </a-spin>
        </a-tab-pane>

        <!-- 安全生产责任制 -->
        <a-tab-pane key="safetyDuty" :tab="safetyDutyTitle">
          <a-spin :spinning="spinningSafetyDuty" tip="加载中...">
            <div class="chart-card">
              <div class="card-header">
                <div class="header-top">
                  <div class="title-with-detail">
                    <h3 class="card-title" style="margin-bottom: 0">{{ safetyDutyTitle }}</h3>
                    <a-button class="detail-btn" size="small" style="margin-top: 0" type="link" @click="goToSafeDutyDetails"> 详情 </a-button>
                    <a-button v-auth="'dashboardHome:mark'" class="remark-btn" size="small" type="link" @click="toggleRemark('safetyDuty')"
                      >备注
                    </a-button>
                  </div>
                  <div class="header-controls">
                    <span class="control-label">选择时间：</span>
                    <a-range-picker
                      v-model:value="safetyDutyDateRange"
                      :allowClear="false"
                      size="small"
                      style="width: 260px"
                      @change="handleDateRangeChangeSafetyDuty"
                    />
                  </div>
                </div>
              </div>
              <div class="gw_tab">
                <SafetyDutyPanel ref="safetyDutyPanelRef" />
              </div>
              <div v-if="showRemark.safetyDuty" class="remark-area">
                <JEditor v-model:value="remarkText.safetyDuty" class="remark-textarea" />
                <div style="margin-top: 12px; text-align: right">
                  <a-button size="small" style="margin-right: 10px" @click="handleCancelRemark('safetyDuty')">取消</a-button>
                  <a-button v-show="showRemark.safetyDuty" size="small" type="primary" @click="handleSaveRemark('safetyDuty')">
                    保存
                  </a-button>
                </div>
              </div>
              <div v-else class="remark-textarea" v-html="remarkText.safetyDuty"></div>
            </div>
          </a-spin>
        </a-tab-pane>

        <a-tab-pane key="gas" tab="煤气预警设备">
          <a-spin :spinning="spinning4" tip="加载中...">
            <div class="chart-card">
              <div class="card-header">
                <div class="header-top" style="margin-bottom: 5px">
                  <div class="title-with-detail">
                    <h3 class="card-title">煤气预警设备</h3>
                    <!-- <a-button class="detail-btn" size="small" type="link" @click="goDetail('3')">详情</a-button> -->
                    <a-button
                      v-auth="'dashboardHome:mark'"
                      class="remark-btn"
                      size="small"
                      style="margin-top: -7px"
                      type="link"
                      @click="toggleRemark('gas')"
                      >备注
                    </a-button>
                  </div>
                  <div class="header-controls">
                    <span class="control-label">选择时间：</span>
                    <a-range-picker
                      v-model:value="gasDateRange"
                      :allowClear="false"
                      size="small"
                      style="width: 260px"
                      @change="handleDateRangeChange5"
                    />
                  </div>
                </div>
              </div>
              <div class="gas-statistics">
                <div class="gas-module-card">
                  <div class="title">
                    <span>各厂区煤气预警设备状态统计</span>
                  </div>
                  <GasStatistics />
                </div>
                <GasPannel ref="gasPanelRef" :dateRange="gasDateRange" />
              </div>
              <div v-if="showRemark.gas" class="remark-area">
                <JEditor v-model:value="remarkText.gas" class="remark-textarea" />
                <div style="margin-top: 12px; text-align: right">
                  <a-button size="small" style="margin-right: 10px" @click="handleCancelRemark('gas')">取消</a-button>
                  <a-button size="small" type="primary" @click="handleSaveRemark('gas')">保存</a-button>
                </div>
              </div>
              <div v-else class="remark-textarea" v-html="remarkText.gas"></div>
            </div>
          </a-spin>
        </a-tab-pane>
        <a-tab-pane key="seven" :tab="sevenTitle">
          <a-spin :spinning="spinning5" tip="加载中...">
            <div class="chart-card">
              <div class="card-header">
                <div class="header-top">
                  <div class="title-with-detail">
                    <div v-show="!isTitleEditing7">
                      <h3 class="card-title" style="display: inline-block; margin-right: 5px">{{ sevenTitle }}</h3>
                      <EditTwoTone v-auth="'dashboardHome:edit'" style="font-size: 18px" @click="editTitle7" />
                    </div>
                    <div v-show="isTitleEditing7">
                      <a-input
                        v-model:value="sevenTitle"
                        :maxlength="20"
                        placeholder="请输入"
                        style="display: inline-block; margin-right: 5px; width: 150px"
                      />
                      <SaveTwoTone style="font-size: 18px" @click="saveTitle7" />
                    </div>
                    <a-button
                      v-auth="'dashboardHome:mark'"
                      class="remark-btn"
                      size="small"
                      style="margin-left: 10px; margin-top: -7px"
                      type="link"
                      @click="toggleRemark('seven')"
                      >备注
                    </a-button>
                  </div>
                  <div class="header-controls">
                    <span class="control-label">选择时间：</span>
                    <a-range-picker
                      v-model:value="sevenDateRange"
                      :allowClear="false"
                      size="small"
                      style="width: 260px"
                      @change="handleDateRangeChange6"
                    />
                  </div>
                </div>
              </div>
              <div>
                <div v-if="isTitleEditing7" class="remark-area">
                  <JEditor v-model:value="richTextSeven" />
                </div>
                <div v-else class="remark-area" v-html="richTextSeven"></div>
              </div>
              <div v-if="showRemark.seven" class="remark-area">
                <JEditor v-model:value="remarkText.seven" class="remark-textarea" />
                <div style="margin-top: 12px; text-align: right">
                  <a-button size="small" style="margin-right: 10px" @click="handleCancelRemark('seven')">取消</a-button>
                  <a-button v-show="showRemark.seven" size="small" type="primary" @click="handleSaveRemark('seven')"> 保存 </a-button>
                </div>
              </div>
              <div v-else class="remark-textarea" v-html="remarkText.seven"></div>
            </div>
          </a-spin>
        </a-tab-pane>
        <a-tab-pane key="eight" :tab="eightTitle">
          <a-spin :spinning="spinning5" tip="加载中...">
            <div class="chart-card">
              <div class="card-header">
                <div class="header-top">
                  <div class="title-with-detail">
                    <div v-show="!isTitleEditing8">
                      <h3 class="card-title" style="display: inline-block; margin-right: 5px">{{ eightTitle }}</h3>
                      <EditTwoTone v-auth="'dashboardHome:edit'" style="font-size: 18px" @click="editTitle8" />
                    </div>
                    <div v-show="isTitleEditing8">
                      <a-input
                        v-model:value="eightTitle"
                        :maxlength="20"
                        placeholder="请输入"
                        style="display: inline-block; margin-right: 5px; width: 150px"
                      />
                      <SaveTwoTone style="font-size: 18px" @click="saveTitle8" />
                    </div>
                    <a-button
                      v-auth="'dashboardHome:mark'"
                      class="remark-btn"
                      size="small"
                      style="margin-left: 10px; margin-top: -7px"
                      type="link"
                      @click="toggleRemark('eight')"
                      >备注
                    </a-button>
                  </div>
                  <div class="header-controls">
                    <span class="control-label">选择时间：</span>
                    <a-range-picker
                      v-model:value="eightDateRange"
                      :allowClear="false"
                      size="small"
                      style="width: 260px"
                      @change="handleDateRangeChange8"
                    />
                  </div>
                </div>
              </div>
              <div>
                <div v-if="isTitleEditing8" class="remark-area">
                  <JEditor v-model:value="richTextEight" />
                </div>
                <div v-else class="remark-area" v-html="richTextEight"></div>
              </div>
              <div v-if="showRemark.eight" class="remark-area">
                <JEditor v-model:value="remarkText.eight" class="remark-textarea" />
                <div style="margin-top: 12px; text-align: right">
                  <a-button size="small" style="margin-right: 10px" @click="handleCancelRemark('eight')">取消</a-button>
                  <a-button v-show="showRemark.eight" size="small" type="primary" @click="handleSaveRemark('eight')"> 保存 </a-button>
                </div>
              </div>
              <div v-else class="remark-textarea" v-html="remarkText.eight"></div>
            </div>
          </a-spin>
        </a-tab-pane>
      </a-tabs>
    </div>
    <a-modal v-model:visible="rateRangeModalVisible" title="指标设置" ok-text="确定" cancel-text="取消" @ok="onRateRangeOk" width="600px">
      <div style="padding: 20px">
        <div style="font-weight: bold; margin-bottom: 10px">问题发现率标准值设置</div>
        <a-form layout="vertical">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="下限">
                <a-input-number
                  v-model:value="issueRateLower"
                  :min="0"
                  :step="1"
                  :precision="0"
                  style="width: 100%"
                  placeholder="请输入"
                  :formatter="(value) => `${value}%`"
                  :parser="(value) => value.replace('%', '')"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="上限">
                <a-input-number
                  v-model:value="issueRateUpper"
                  :min="0"
                  :step="1"
                  :precision="0"
                  style="width: 100%"
                  placeholder="请输入"
                  :formatter="(value) => `${value}%`"
                  :parser="(value) => value.replace('%', '')"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
        <a-divider style="margin: 12px 0" />
        <div style="font-weight: bold; margin-bottom: 10px">综合指标排序占比设置</div>
        <a-form layout="vertical">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="任务按时完成率">
                <a-input-number
                  v-model:value="taskCompleteOnTime"
                  :min="0"
                  :step="1"
                  :precision="0"
                  style="width: 100%"
                  placeholder="请输入占比"
                  :formatter="(value) => `${value}%`"
                  :parser="(value) => value.replace('%', '')"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="问题发现指数">
                <a-input-number
                  v-model:value="problemRate"
                  :min="0"
                  :step="1"
                  :precision="0"
                  style="width: 100%"
                  placeholder="请输入占比"
                  :formatter="(value) => `${value}%`"
                  :parser="(value) => value.replace('%', '')"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="整改完成率">
                <a-input-number
                  v-model:value="repairComplete"
                  :min="0"
                  :step="1"
                  :precision="0"
                  style="width: 100%"
                  placeholder="请输入占比"
                  :formatter="(value) => `${value}%`"
                  :parser="(value) => value.replace('%', '')"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="按时整改完成率">
                <a-input-number
                  v-model:value="repairCompleteOnTime"
                  :min="0"
                  :step="1"
                  :precision="0"
                  style="width: 100%"
                  placeholder="请输入占比"
                  :formatter="(value) => `${value}%`"
                  :parser="(value) => value.replace('%', '')"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" name="dashboard-analysis" setup>
  import { ref, onMounted, nextTick } from 'vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import type { Dayjs } from 'dayjs';
  import dayjs from 'dayjs';
  import { useRouter } from 'vue-router';
  import { JEditor } from '/@/components/Form';
  import { EditTwoTone, SaveTwoTone, SettingFilled } from '@ant-design/icons-vue';
  import HighRiskWorkPanel from './components/HighRiskWorkPanel.vue';
  import PersonnelCertificatePanel from './components/PersonnelCertificatePanel.vue';
  import RelatedPartyPanel from './components/RelatedPartyPanel.vue';
  import OccupationalHealthPanel from './components/OccupationalHealthPanel.vue';
  import SafetyStandardPanel from './components/SafetyStandardPanel.vue';
  import TeamPanel from './components/TeamPanel.vue';
  import FacilityPanel from './components/FacilityPanel.vue';
  import GasStatistics from '/@/views/gasWarinig/statistics/index.vue';
  import GasPannel from './components/GasPannel.vue';
  import EmergencyPanel from './components/EmergencyPanel.vue';
  import SafeProductionInvestPanel from './components/SafeProductionInvestPanel.vue';
  import SafetyDutyPanel from './components/SafetyDutyPanel.vue';

  const router = useRouter();
  import {
    getTrainingStatistics,
    getTaskIssueStatistics,
    getInspectionStatistics,
    getRectificationStatistics1,
    getRectificationStatistics2,
    getRectificationStatistics3,
    saveHomeRemark,
    getHomeTypeRemark,
    saveIssueRateRange,
    getIssueRateRange,
    getSafetyStandardOrgCodeList,
    getFactorOrgCodeList,
  } from './api';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { createMessage } = useMessage();
  const sevenTitle = ref('专项检查');
  const isTitleEditing7 = ref(false);
  const richTextSeven = ref('');
  const eightTitle = ref('下周重点工作计划');
  const isTitleEditing8 = ref(false);
  const richTextEight = ref('');
  const personnelCertTitle = ref('人员资质证书');
  const occupationalHealthTitle = ref('职业健康');
  const safetyStandardTitle = ref('安全生产标准化');
  const teamManagementTitle = ref('班组管理');
  const facilityTitle = ref('设备设施管理');
  const relatedPartyTitle = ref('相关方管理');
  const gasPanelRef = ref();
  const rectificationData1: any = ref({
    rate1: '0',
    rate2: '0',
    rate3: '0',
    rate4: '0',
    rate5: '0',
  });
  const rectificationData2: any = ref([]);
  const rectificationData2Chart: any = ref([]);
  const rectificationData3: any = ref({
    rate1: 0,
    rate2: 0,
    rate3: 0,
    list1: [],
    list2: [],
    list3: [],
  });
  /**
   * @function formatRate
   * @description 格式化展示值为带有百分号的字符串；当 `withPercent` 为 false 时不追加百分号。可接受字符串（含或不含`%`）、数字或空值。
   * @param val 输入值
   * @param withPercent 是否追加百分号，默认 true
   * @returns 格式化后的字符串
   */
  function formatRate(val: unknown, withPercent: boolean = true): string {
    if (val == null) return withPercent ? '0%' : '0';
    if (typeof val === 'number') return withPercent ? `${val}%` : `${val}`;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return withPercent ? '0%' : '0';
      const hasPercent = /%$/.test(trimmed);
      if (withPercent) return hasPercent ? trimmed : `${trimmed}%`;
      return hasPercent ? trimmed.replace(/%$/, '') : trimmed;
    }
    return withPercent ? '0%' : '0';
  }
  const rateRangeModalVisible = ref(false);
  const issueRateLower = ref<number | undefined>(8);
  const issueRateUpper = ref<number | undefined>(10);
  const taskCompleteOnTime = ref<number | undefined>(10);
  const problemRate = ref<number | undefined>(40);
  const repairComplete = ref<number | undefined>(20);
  const repairCompleteOnTime = ref<number | undefined>(30);
  const issueRateRange = ref<{ lower: number; upper: number }>({ lower: 8, upper: 10 });

  const handleClick = () => {
    rateRangeModalVisible.value = true;
  };

  const onRateRangeOk = async () => {
    const lower = Number(issueRateLower.value ?? 0);
    const upper = Number(issueRateUpper.value ?? 0);
    const wTaskTimely = Number(taskCompleteOnTime.value ?? 0);
    const wIssueIndex = Number(problemRate.value ?? 0);
    const wRectification = Number(repairComplete.value ?? 0);
    const wRectificationTimely = Number(repairCompleteOnTime.value ?? 0);

    if (Number.isNaN(lower) || Number.isNaN(upper)) {
      createMessage.warning('请输入有效的数值');
      return;
    }
    if (lower > upper) {
      createMessage.warning('下限不能大于上限');
      return;
    }
    if (wTaskTimely + wIssueIndex + wRectification + wRectificationTimely !== 100) {
      createMessage.warning('综合指标排序占比之和必须为100%');
      return;
    }

    try {
      await saveIssueRateRange({
        issueRateLower: lower,
        issueRateUpper: upper,
        taskCompleteOnTime: wTaskTimely,
        problemRate: wIssueIndex,
        repairComplete: wRectification,
        repairCompleteOnTime: wRectificationTimely,
      });
      rateRangeModalVisible.value = false;
      loadIssueRateRange();
      loadDataYh();
    } catch (e) {
      createMessage.error('保存失败，请稍后重试');
    }
  };

  interface TrainingXItem {
    name: string;
    qualifiedRate?: number | string;
    completionRate?: number | string;
  }

  interface TrainingData {
    completedCount: number;
    firstExamQualifiedRate: string;
    firstRate: string;
    passRate: string;
    qualifiedRate: string;
    shouldTrainCount: number;
    xdata: TrainingXItem[];
  }

  interface InspectionItem {
    org: string;
    rate: number | string;
  }

  /**
   * @description: 获取上个月的第一天和最后一天
   */
  const getLastMonthRange = () => {
    const lastMonth = dayjs().subtract(1, 'month');
    const startOfLastMonth = lastMonth.startOf('month');
    const endOfLastMonth = lastMonth.endOf('month');
    return {
      start: startOfLastMonth,
      end: endOfLastMonth,
    };
  };

  /**
   * @description: 获取默认时间范围（按当前星期几动态计算）
   * 规则：
   * - 周一至周四：查上上周六到上周五
   * - 周五、周六、周日：查上周六到本周五
   * @returns { start: Dayjs, end: Dayjs }
   */
  const getPrevSunToLastSatRange = (): { start: Dayjs; end: Dayjs } => {
    const today = dayjs();
    const weekday = today.day(); // 0=周日, 1=周一, ..., 6=周六
    if (weekday === 1 || weekday === 2 || weekday === 3 || weekday === 4 || weekday === 0) {
      // 周一至周四：上上周六 -> 上周五
      const start = today.day(6).subtract(2, 'week');
      const end = today.day(5).subtract(1, 'week');
      return { start, end };
    } else {
      // 周五、周六、周日：上周六 -> 本周五
      const start = today.day(6).subtract(1, 'week');
      const end = today.day(5);
      return { start, end };
    }
  };
  const spinning = ref(false);
  const spinning1 = ref(false);
  const spinning2 = ref(false);
  const spinning3 = ref(false);
  const spinning4 = ref(false);
  const spinning5 = ref(false);
  const spinning31 = ref(false);
  const spinningTask = ref(false);
  const spinningPersonnelCert = ref(false);
  const spinningOccupationalHealth = ref(false);
  const spinningSafetyStandard = ref(false);
  const spinningTeamManagement = ref(false);
  // 响应式变量
  const sortType = ref<'1' | '2'>('1');
  const lastMonthRange = getLastMonthRange();

  // 培训图表时间选择器
  const trainingDateRange = ref<[Dayjs, Dayjs]>([lastMonthRange.start, lastMonthRange.end]);
  const eduBusinessUnitList = ref<any[]>([]);
  const eduBusinessUnit = ref<string | undefined>(undefined);

  // 高危作业时间选择器
  const prevSunToLastSatRange = getPrevSunToLastSatRange();
  const dangerousWorkDateRange = ref<[Dayjs, Dayjs]>([prevSunToLastSatRange.start, prevSunToLastSatRange.end]);

  // 隐患排查时间选择器
  const inspectionDateRange = ref<[Dayjs, Dayjs]>([getPrevSunToLastSatRange().start, getPrevSunToLastSatRange().end]);
  const inspectionBusinessUnitList = ref<any[]>([]);
  const inspectionBusinessUnit = ref<string | undefined>(undefined);

  // 隐患整改时间选择器
  const rectificationDateRange = ref<[Dayjs, Dayjs]>([getPrevSunToLastSatRange().start, getPrevSunToLastSatRange().end]);
  const rectificationBusinessUnitList = ref<any[]>([]);
  const rectificationBusinessUnit = ref<string | undefined>(undefined);

  // 煤气预警设备时间选择器
  const gasDateRange = ref<[Dayjs, Dayjs]>([getPrevSunToLastSatRange().start, getPrevSunToLastSatRange().end]);
  // 专项检查时间选择器
  const sevenDateRange = ref<[Dayjs, Dayjs]>([getPrevSunToLastSatRange().start, getPrevSunToLastSatRange().end]);
  // 下周重点工作计划时间选择器
  const eightDateRange = ref<[Dayjs, Dayjs]>([getPrevSunToLastSatRange().start, getPrevSunToLastSatRange().end]);
  // 人员资质证书时间选择器
  const personnelCertDateRange = ref<[Dayjs, Dayjs]>([getPrevSunToLastSatRange().start, getPrevSunToLastSatRange().end]);
  // 职业健康时间选择器
  const occupationalHealthDateRange = ref<[Dayjs, Dayjs]>([getPrevSunToLastSatRange().start, getPrevSunToLastSatRange().end]);
  const occupationalHealthOrgList = ref<any[]>([]);
  const occupationalHealthOrgCode = ref(undefined);
  // 安全生产标准化时间选择器
  const safetyStandardDateRange = ref<[Dayjs, Dayjs]>([getPrevSunToLastSatRange().start, getPrevSunToLastSatRange().end]);
  // 班组管理时间选择器
  const teamManagementDateRange = ref<[Dayjs, Dayjs]>([getPrevSunToLastSatRange().start, getPrevSunToLastSatRange().end]);
  const teamManagementBusinessUnitList = ref<any[]>([]);
  const teamManagementBusinessUnit = ref<string | undefined>(undefined);
  // 相关方管理时间选择器
  const relatedPartyDateRange = ref<[Dayjs, Dayjs]>([getPrevSunToLastSatRange().start, getPrevSunToLastSatRange().end]);
  const spinningRelatedParty = ref(false);
  // 设备设施管理时间选择器
  const facilityDateRange = ref<[Dayjs, Dayjs]>([getPrevSunToLastSatRange().start, getPrevSunToLastSatRange().end]);
  const facilityBusinessUnitList = ref<any[]>([]);
  const facilityBusinessUnit = ref<string | undefined>(undefined);
  const spinningFacility = ref(false);

  // 应急管理
  const emergencyManagementTitle = ref('应急管理');
  const emergencyManagementDateRange = ref<[Dayjs, Dayjs]>([getPrevSunToLastSatRange().start, getPrevSunToLastSatRange().end]);
  const spinningEmergencyManagement = ref(false);

  // 安全生产投入
  const safeProductionInvestTitle = ref('安全生产投入');
  const safeProductionInvestDateRange = ref<[Dayjs, Dayjs]>([getPrevSunToLastSatRange().start, getPrevSunToLastSatRange().end]);
  const spinningSafeProductionInvest = ref(false);

  // 安全生产责任制
  const safetyDutyTitle = ref('安全生产责任制');
  const safetyDutyDateRange = ref<[Dayjs, Dayjs]>([getPrevSunToLastSatRange().start, getPrevSunToLastSatRange().end]);
  const spinningSafetyDuty = ref(false);

  // 响应式数据
  const trainingData = ref<TrainingData>({
    completedCount: 0,
    firstExamQualifiedRate: '0',
    firstRate: '0',
    passRate: '0',
    qualifiedRate: '0',
    shouldTrainCount: 0,
    xdata: [] as TrainingXItem[],
  });
  const taskIssueData: any = ref({});
  const highRiskWorkPanelRef = ref();
  const personnelCertificatePanelRef = ref();
  const occupationalHealthPanelRef = ref();
  const safetyStandardPanelRef = ref();
  const teamPanelRef = ref();
  const facilityPanelRef = ref();
  const relatedPartyPanelRef = ref();
  const emergencyPanelRef = ref();
  const safeProductionInvestPanelRef = ref();
  const safetyDutyPanelRef = ref();
  // 增加 Tab 切换状态
  const activeTab = ref<
    | 'edu'
    | 'danger'
    | 'inspection'
    | 'rectification'
    | 'gas'
    | 'seven'
    | 'eight'
    | 'personnelCert'
    | 'relatedParty'
    | 'occupationalHealth'
    | 'safetyStandard'
    | 'teamManagement'
    | 'facility'
    | 'emergencyManagement'
    | 'safeProductionInvest'
    | 'safetyDuty'
  >('edu');
  const activeTabPane = ref('taskIssue');

  const fetchOccupationalHealthOrgList = async () => {
    const res = await getFactorOrgCodeList();
    occupationalHealthOrgList.value = res || [];
  };

  const handleOccupationalHealthOrgChange = (val: any) => {
    nextTick(() => {
      occupationalHealthPanelRef.value?.updateOrgCode(val);
    });
  };

  const handleTeamManagementBusinessUnitChange = () => {
    nextTick(() => {
      teamPanelRef.value?.init(teamManagementDateRange.value, teamManagementBusinessUnit.value);
    });
  };

  const handleFacilityBusinessUnitChange = () => {
    nextTick(() => {
      facilityPanelRef.value?.init(facilityDateRange.value, facilityBusinessUnit.value);
    });
  };

  /**
   * @description 处理 Tab 切换，更新当前激活模块并加载对应数据（扩展支持 gas/seven/eight/personnelCert）
   * @param key 模块标识：'edu' | 'danger' | 'inspection' | 'rectification' | 'gas' | 'seven' | 'eight' | 'personnelCert' | 'relatedParty' | 'occupationalHealth' | 'teamManagement' | 'facility'
   */
  const handleTabChange = async (
    key:
      | 'edu'
      | 'danger'
      | 'inspection'
      | 'rectification'
      | 'gas'
      | 'seven'
      | 'eight'
      | 'personnelCert'
      | 'relatedParty'
      | 'occupationalHealth'
      | 'safetyStandard'
      | 'teamManagement'
      | 'facility'
      | 'emergencyManagement'
      | 'safeProductionInvest'
      | 'safetyDuty'
  ) => {
    activeTab.value = key;

    switch (key) {
      case 'edu':
        // trainingDateRange.value = [lastMonthRange.start, lastMonthRange.end];
        initTrainingStatistics();
        initTaskIssueChart();
        // 延迟调整图表大小，确保DOM更新完成
        resizeAllCharts();
        break;
      case 'danger':
        nextTick(() => {
          highRiskWorkPanelRef.value.init(dangerousWorkDateRange.value);
        });
        break;
      case 'inspection':
        // inspectionDateRange.value = [prevSunToLastSatRange.start, prevSunToLastSatRange.end];
        loadDataDayJob();
        resizeAllCharts();
        break;
      case 'rectification':
        // rectificationDateRange.value = [prevSunToLastSatRange.start, prevSunToLastSatRange.end];
        loadDataYh();
        loadIssueRateRange();
        loadDataYhThree();
        resizeAllCharts();
        break;
      case 'gas':
        // gasDateRange.value = [prevSunToLastSatRange.start, prevSunToLastSatRange.end];
        resizeAllCharts();
        nextTick(() => {
          gasPanelRef.value.init();
        });
        break;
      case 'seven':
        // sevenDateRange.value = [prevSunToLastSatRange.start, prevSunToLastSatRange.end];
        resizeAllCharts();
        break;
      case 'eight':
        // eightDateRange.value = [prevSunToLastSatRange.start, prevSunToLastSatRange.end];
        break;
      case 'personnelCert':
        nextTick(() => {
          personnelCertificatePanelRef.value.init(personnelCertDateRange.value);
        });
        break;
      case 'occupationalHealth':
        nextTick(() => {
          occupationalHealthPanelRef.value.init();
          resizeAllCharts();
        });
        break;
      case 'safetyStandard':
        nextTick(() => {
          safetyStandardPanelRef.value.init(safetyStandardDateRange.value);
          safetyStandardPanelRef.value?.resize();
        });
        break;
      case 'safeProductionInvest':
        nextTick(() => {
          safeProductionInvestPanelRef.value?.init(safeProductionInvestDateRange.value);
          safeProductionInvestPanelRef.value?.resize();
        });
        break;
      case 'teamManagement':
        nextTick(() => {
          teamPanelRef.value?.init(teamManagementDateRange.value, teamManagementBusinessUnit.value);
          teamPanelRef.value?.resize();
        });
        break;
      case 'facility':
        nextTick(() => {
          facilityPanelRef.value?.init(facilityDateRange.value, facilityBusinessUnit.value);
          facilityPanelRef.value?.resize();
        });
        break;
      case 'relatedParty':
        nextTick(() => {
          relatedPartyPanelRef.value.init(relatedPartyDateRange.value);
        });
        break;
      case 'safetyDuty':
        nextTick(() => {
          safetyDutyPanelRef.value?.init(safetyDutyDateRange.value);
          safetyDutyPanelRef.value?.resize();
        });
        break;
    }
    // 切换 Tab 时查询对应模块的备注
    getHomeRemark(key);
  };
  /**
   * @description 处理 TabPane 切换，更新当前激活模块并加载对应数据（扩展支持 gas/seven/eight）
   * @param key 模块标识：'edu' | 'danger' | 'inspection' | 'rectification' | 'gas' | 'seven' | 'eight'
   */
  const handleTabPaneChange = (key) => {
    activeTabPane.value = key;
    if (key === 'taskIssue') {
      initTaskIssueChart();
    }
    if (key === 'qualified') {
      setSortType('1');
    }
    if (key === 'firstExamQualified') {
      setSortType('2');
    }
    if (key === 'trainFinishRate') {
      setSortType('3');
    }
    // 延迟调整图表大小，确保DOM更新完成
    resizeAllCharts();
  };

  // 新增：备注显示与内容状态
  const showRemark = ref<{
    edu: boolean;
    danger: boolean;
    inspection: boolean;
    rectification: boolean;
    gas: boolean;
    seven: boolean;
    eight: boolean;
    personnelCert: boolean;
    relatedParty: boolean;
    occupationalHealth: boolean;
    safetyStandard: boolean;
    teamManagement: boolean;
    facility: boolean;
    emergencyManagement: boolean;
    safeProductionInvest: boolean;
    safetyDuty: boolean;
  }>({
    edu: false,
    danger: false,
    inspection: false,
    rectification: false,
    gas: false,
    seven: false,
    eight: false,
    personnelCert: false,
    relatedParty: false,
    occupationalHealth: false,
    safetyStandard: false,
    teamManagement: false,
    facility: false,
    emergencyManagement: false,
    safeProductionInvest: false,
    safetyDuty: false,
  });
  const remarkText = ref<{
    edu: string;
    danger: string;
    inspection: string;
    rectification: string;
    gas: string;
    seven: string;
    eight: string;
    personnelCert: string;
    relatedParty: string;
    occupationalHealth: string;
    safetyStandard: string;
    teamManagement: string;
    facility: string;
    emergencyManagement: string;
    safeProductionInvest: string;
    safetyDuty: string;
  }>({
    edu: '',
    danger: '',
    inspection: '',
    rectification: '',
    gas: '',
    seven: '',
    eight: '',
    personnelCert: '',
    relatedParty: '',
    occupationalHealth: '',
    safetyStandard: '',
    teamManagement: '',
    facility: '',
    emergencyManagement: '',
    safeProductionInvest: '',
    safetyDuty: '',
  });

  /**
   * @description 切换备注输入区域的显示状态（扩展支持 gas/seven/eight/personnelCert/relatedParty/occupationalHealth/facility）
   * @param key 模块标识：'edu' | 'danger' | 'inspection' | 'rectification' | 'gas' | 'seven' | 'eight' | 'personnelCert' | 'relatedParty' | 'occupationalHealth' | 'teamManagement' | 'facility'
   */
  const toggleRemark = (
    key:
      | 'edu'
      | 'danger'
      | 'inspection'
      | 'rectification'
      | 'gas'
      | 'seven'
      | 'eight'
      | 'personnelCert'
      | 'relatedParty'
      | 'occupationalHealth'
      | 'safetyStandard'
      | 'teamManagement'
      | 'facility'
      | 'emergencyManagement'
      | 'safeProductionInvest'
      | 'safetyDuty'
  ) => {
    console.log('toggleRemark', key);
    showRemark.value[key] = true;
  };

  /**
   * @description 保存首页备注（扩展支持 gas/seven/eight/personnelCert/relatedParty/occupationalHealth）
   * @param key 模块标识：'edu' | 'danger' | 'inspection' | 'rectification' | 'gas' | 'seven' | 'eight' | 'personnelCert' | 'relatedParty' | 'occupationalHealth'
   */
  const handleSaveRemark = async (
    key:
      | 'edu'
      | 'danger'
      | 'inspection'
      | 'rectification'
      | 'gas'
      | 'seven'
      | 'eight'
      | 'personnelCert'
      | 'relatedParty'
      | 'occupationalHealth'
      | 'safetyStandard'
      | 'teamManagement'
      | 'facility'
      | 'emergencyManagement'
      | 'safeProductionInvest'
      | 'safetyDuty'
  ) => {
    const content = remarkText.value[key]?.trim();
    if (
      !content &&
      key !== 'seven' &&
      key !== 'eight' &&
      key !== 'personnelCert' &&
      key !== 'relatedParty' &&
      key !== 'occupationalHealth' &&
      key !== 'safetyStandard' &&
      key !== 'teamManagement' &&
      key !== 'emergencyManagement' &&
      key !== 'safeProductionInvest'
    ) {
      return;
    }
    // 根据模块类型选择对应的时间范围
    let range: [Dayjs, Dayjs] | undefined;
    if (key === 'edu') range = trainingDateRange.value;
    if (key === 'danger') range = dangerousWorkDateRange.value;
    if (key === 'inspection') range = inspectionDateRange.value;
    if (key === 'rectification') range = rectificationDateRange.value;
    if (key === 'gas') range = gasDateRange.value;
    if (key === 'seven') range = sevenDateRange.value;
    if (key === 'eight') range = eightDateRange.value;
    if (key === 'personnelCert') range = personnelCertDateRange.value;
    if (key === 'relatedParty') range = relatedPartyDateRange.value;
    if (key === 'safetyStandard') range = safetyStandardDateRange.value;
    if (key === 'teamManagement') range = teamManagementDateRange.value;
    if (key === 'facility') range = facilityDateRange.value;
    if (key === 'emergencyManagement') range = emergencyManagementDateRange.value;
    if (key === 'safeProductionInvest') range = safeProductionInvestDateRange.value;
    if (key === 'safetyDuty') range = safetyDutyDateRange.value;

    let params: any = {
      moduleType: key,
      startTime: range?.[0]?.format('YYYY-MM-DD'),
      endTime: range?.[1]?.format('YYYY-MM-DD'),
      content: content,
    };
    if (key === 'seven') {
      params.moduleName = sevenTitle.value;
      params.richText = richTextSeven.value;
    }
    if (key === 'eight') {
      params.moduleName = eightTitle.value;
      params.richText = richTextEight.value;
    }
    if (key === 'personnelCert') {
    }
    if (key === 'relatedParty') {
      params.moduleName = relatedPartyTitle.value;
    }
    if (key === 'occupationalHealth') {
      params.moduleName = occupationalHealthTitle.value;
    }
    if (key === 'safetyStandard') {
      params.moduleName = safetyStandardTitle.value;
    }
    if (key === 'teamManagement') {
      params.moduleName = teamManagementTitle.value;
    }
    if (key === 'facility') {
      params.moduleName = facilityTitle.value;
    }
    if (key === 'emergencyManagement') {
      params.moduleName = emergencyManagementTitle.value;
    }
    try {
      await saveHomeRemark(params);
      createMessage.success('保存成功！');
      showRemark.value[key] = false;
    } catch (e) {
      createMessage.error('保存失败，请稍后重试');
      showRemark.value[key] = false;
      // 刷新备注内容
      remarkText.value[key] = '';
    }
    getHomeRemark(key);
  };
  // 响应式数据
  const inspectionData = ref<InspectionItem[]>([]);
  // 图表引用
  const trainingChartRef = ref<HTMLDivElement>();
  const inspectionChartRef = ref<HTMLDivElement>();
  const rectificationCombinedChartRef = ref<HTMLDivElement>();
  const taskIssueChartRef = ref<HTMLDivElement>();

  // ECharts 实例
  const { setOptions: setTrainingOptions, getInstance: getTrainingInstance } = useECharts(trainingChartRef as any);
  const { setOptions: setInspectionOptions, getInstance: getInspectionInstance } = useECharts(inspectionChartRef as any);
  const { setOptions: setRectificationCombinedOptions, getInstance: getRectificationCombinedInstance } = useECharts(
    rectificationCombinedChartRef as any
  );
  const { setOptions: setTaskIssueOptions, getInstance: getTaskIssueInstance } = useECharts(taskIssueChartRef as any);
  // 累积整改情况：三个横向柱状图的容器引用
  const cumulativeDiscoveryRef = ref<HTMLDivElement | null>(null);
  const cumulativeRepairRef = ref<HTMLDivElement | null>(null);
  const cumulativeTimelyRef = ref<HTMLDivElement | null>(null);
  const { setOptions: setCumulativeDiscoveryOptions, getInstance: getCumulativeDiscoveryInstance } = useECharts(cumulativeDiscoveryRef as any);
  const { setOptions: setCumulativeRepairOptions, getInstance: getCumulativeRepairInstance } = useECharts(cumulativeRepairRef as any);
  const { setOptions: setCumulativeTimelyOptions, getInstance: getCumulativeTimelyInstance } = useECharts(cumulativeTimelyRef as any);

  /**
   * @description: 重新调整所有图表大小
   */
  const resizeAllCharts = () => {
    // 延迟执行，确保DOM更新完成
    setTimeout(() => {
      // 获取所有图表实例并调用resize
      const trainingInstance = getTrainingInstance();
      const inspectionInstance = getInspectionInstance();
      const rectificationCombinedInstance = getRectificationCombinedInstance();
      const taskIssueInstance = getTaskIssueInstance();
      const cumulativeDiscoveryInstance = getCumulativeDiscoveryInstance();
      const cumulativeRepairInstance = getCumulativeRepairInstance();
      const cumulativeTimelyInstance = getCumulativeTimelyInstance();

      // 调用每个图表的resize方法
      trainingInstance?.resize();
      inspectionInstance?.resize();
      rectificationCombinedInstance?.resize();
      taskIssueInstance?.resize();
      cumulativeDiscoveryInstance?.resize();
      cumulativeRepairInstance?.resize();
      cumulativeTimelyInstance?.resize();
      occupationalHealthPanelRef.value?.resize();
      safetyStandardPanelRef.value?.resize();
      gasPanelRef.value?.resize();
    }, 100);
  };

  /**
   * @description: 初始 化年度安全教育再培训图表
   */
  const initTrainingChart = (type) => {
    let typeName = '';
    if(type === '1') {
      typeName = '合格率';
    } else if(type === '2') {
      typeName = '第一次考试合格率';
    } else if(type === '3') {
      typeName = '培训完成率';
    }

    const option = {
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: {
          type: 'shadow' as const,
        },
        formatter: function (params: any) {
          let result = params[0].name + '<br/>';
          params.forEach((item: any) => {
            if (item.value !== null && item.value !== undefined && item.value !== '0') {
              result += item.marker + item.seriesName + ': ' + item.value + '%';
            } else {
              result += item.marker + item.seriesName + ': ' + '0%';
            }
          });
          return result;
        },
      },

      grid: {
        left: '3%',
        right: '10%',
        top: '2%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'value' as const,
        max: 100,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          formatter: '{value}%',
          fontSize: 10,
          color: '#666',
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#e6e6e6',
            type: 'solid' as const,
          },
        },
      },
      yAxis: {
        type: 'category' as const,
        data: trainingData.value.xdata && trainingData.value.xdata.map((item) => item.name),
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontSize: 11,
          color: '#333',
          margin: 8,
        },
        inverse: true,
      },
      series: [
        {
          name: typeName,
          type: 'bar' as const,
          data:
            trainingData.value.xdata &&
            trainingData.value.xdata.map((item, index) => ({
              value: type === '1' ? item.qualifiedRate : item.completionRate,
              itemStyle: {
                // 颜色规则：前三名绿色，中间蓝色，后三名橙色
                color: index < 3 ? '#32CD32' : index >= trainingData.value.xdata.length - 3 ? '#FFA500' : '#1890ff',
                borderRadius: [0, 2, 2, 0],
              },
            })),
          itemStyle: {
            color: '#FFA500',
            borderRadius: [0, 2, 2, 0],
          },
          barWidth: '55%',
          label: {
            show: true,
            position: 'right' as const,
            formatter: '{c}%',
            fontSize: 10,
            color: '#666',
            offset: [5, 0],
          },
        },
      ],
    };
    setTrainingOptions(option);
  };
  function computedMax(...data: number[]) {
    let isolationMax = data.flat(Infinity).length > 0 ? Math.max(...data.flat(Infinity)) : 10;
    if (isolationMax === 0) isolationMax = 10;
    isolationMax = Math.ceil(isolationMax / 10) * 10;
    isolationMax = isolationMax + isolationMax / 5;
    return (isolationMax / 5) * 10;
  }

  /**
   * @function initTaskIssueChart
   * @description 任务下发统计图表初始化（柱状图：单位人数/下发人数 + 折线图：下发率）。使用常量模拟数据，不请求后端接口；左右双坐标轴，左侧为数量，右侧为下发率百分比。
   */
  const initTaskIssueChart = () => {
    let total = [];
    total = total.concat(taskIssueData.value.count);
    total = total.concat(taskIssueData.value.qualifiedCount);
    total = total.concat(taskIssueData.value.finishRate);
    const lMax = computedMax(...total);
    const option: any = {
      legend: {
        data: ['单位人数', '下发人数', '下发率'],
        bottom: 3,
      },
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: { type: 'shadow' as const },
        formatter: (params: any) => {
          const name = params?.[0]?.name || '';
          const unit = params.find((p: any) => p.seriesName === '单位人数');
          const issued = params.find((p: any) => p.seriesName === '下发人数');
          const rate = params.find((p: any) => p.seriesName === '下发率');
          const unitStr = unit ? `${unit.marker}${unit.seriesName}: ${unit.value}` : '';
          const issuedStr = issued ? `${issued.marker}${issued.seriesName}: ${issued.value}` : '';
          const rateStr = rate ? `${rate.marker}${rate.seriesName}: ${rate.value}%` : '';
          return `${name}<br/>${unitStr}<br/>${issuedStr}<br/>${rateStr}`;
        },
      },
      grid: { left: '3%', right: '6%', top: '6%', bottom: 30, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: taskIssueData.value.xdata,
        axisLabel: { interval: 0, fontSize: 11, rotate: 30 },
      },
      yAxis: [
        {
          type: 'value',
          alignTicks: true,
          max: lMax,
          interval: lMax / 10,
          splitNumber: 10,
          axisLabel: {
            show: false,
          },
        },
        {
          type: 'value',
          min: -100,
          max: 100,
          interval: 20,
          axisLabel: {
            show: false,
            formatter: '{value} %',
          },
        },
      ],
      series: [
        {
          name: '单位人数',
          type: 'bar' as const,
          data: taskIssueData.value.count as unknown as number[],
          barMaxWidth: 22,
          itemStyle: { color: '#f2c94c' },
          label: { show: true, position: 'top' as const, fontSize: 11, color: '#666' },
        },
        {
          name: '下发人数',
          type: 'bar' as const,
          data: taskIssueData.value.qualifiedCount as unknown as number[],
          barMaxWidth: 22,
          itemStyle: { color: '#52c41a' },
          label: { show: true, position: 'top' as const, fontSize: 11, color: '#666' },
        },
        {
          name: '下发率',
          type: 'line' as const,
          yAxisIndex: 1,
          data: taskIssueData.value.finishRate as unknown as number[],
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          lineStyle: { color: '#1890ff', width: 2 },
          itemStyle: { color: '#1890ff' },
          label: { show: true, formatter: '{c}%', position: 'top' as const, color: '#1890ff', fontSize: 11 },
        },
      ],
    };
    setTaskIssueOptions(option);
  };

  const initRectificationCombinedChart = () => {
    const xOrgs = rectificationData2.value.map((m) => m.org);
    const option = {
      tooltip: {
        trigger: 'axis' as const,
        formatter: (params: any) => {
          const first = Array.isArray(params) ? params[0] : params;
          const name = first?.axisValueLabel || first?.name || '';
          const lines = [name];
          (Array.isArray(params) ? params : [params]).forEach((p: any) => {
            const isPercentSeries = p.seriesName !== '超时未整改数量';
            const unit = isPercentSeries ? '%' : '';
            const val = Array.isArray(p.value) ? p.value[1] : p.value;
            lines.push(`${p.marker}${p.seriesName}: ${val !== undefined ? val : '0.00'}${unit}`);
          });
          return lines.join('<br/>');
        },
      },
      legend: { data: ['任务完成率', '任务按时完成率', '问题发现率', '整改完成率', '按时整改完成率', '超时未整改数量'], top: '2%' },
      xAxis: [{ type: 'category' as const, data: xOrgs, axisLabel: { rotate: 45 } }],
      // 底部的横坐标留些空间 不要遮挡
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      yAxis: [
        { type: 'value' as const, min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
        { type: 'value' as const, min: 0, max: 100 },
      ],
      series: [
        {
          name: '任务完成率',
          type: 'line' as const,
          smooth: true,
          symbol: 'circle',
          color: '#d613d6',
          data: rectificationData2.value.map((m) => m.rate4),
          xAxisIndex: 0,
          yAxisIndex: 0,
        },
        {
          name: '任务按时完成率',
          type: 'line' as const,
          smooth: true,
          symbol: 'circle',
          color: '#fadb14',
          data: rectificationData2.value.map((m) => m.rate5),
          xAxisIndex: 0,
          yAxisIndex: 0,
        },
        {
          name: '问题发现率',
          type: 'line' as const,
          smooth: true,
          symbol: 'circle',
          color: '#1890ff',
          data: rectificationData2.value.map((m) => m.rate1),
          xAxisIndex: 0,
          yAxisIndex: 0,
        },
        {
          name: '整改完成率',
          type: 'line' as const,
          smooth: true,
          symbol: 'circle',
          color: '#52c41a',
          data: rectificationData2.value.map((m) => m.rate2),
          xAxisIndex: 0,
          yAxisIndex: 0,
        },
        {
          name: '按时整改完成率',
          type: 'line' as const,
          smooth: true,
          symbol: 'circle',
          color: '#fa8c16',
          data: rectificationData2.value.map((m) => m.rate3),
          xAxisIndex: 0,
          yAxisIndex: 0,
        },
        {
          name: '超时未整改数量',
          type: 'bar' as const,
          itemStyle: { color: '#de0e0e' },
          barWidth: '42%',
          label: { show: true, position: 'top' as const },
          data: rectificationData2.value.map((m) => m.uncompleteCount),
          xAxisIndex: 0,
          yAxisIndex: 1,
        },
      ],
    };
    setRectificationCombinedOptions(option);
  };

  /**
   * @function buildColoredBarData
   * @description 根据排序结果为前三名、末三名和中间数据分别赋予绿色、橙色和蓝色，以便在横向柱状图中区分档位。
   * @param values 每个组织的数值列表（百分比或数量）
   * @returns 带 itemStyle 的数据项数组
   */
  function buildColoredBarData(values: number[] | string[]) {
    const n = values.length;
    return values.map((v, idx) => {
      let color = '#1890ff'; // 中间：蓝色
      if (idx < 3) color = '#fa8c16'; // 前三：绿色
      else if (idx >= n - 3) color = '#52c41a'; // 末三：橙色
      return { value: v, itemStyle: { color } };
    });
  }

  /**
   * @function initRectificationCumulativeCharts
   * @description 初始化“累积整改情况”模块的三个横向柱状图（问题发现率/整改完成率/按时整改完成率）。
   *              每个图表按该指标对组织进行降序排序，前三条绿色、末三条橙色、中间蓝色；不影响其他页面样式。
   */
  function initRectificationCumulativeCharts() {
    setCumulativeDiscoveryOptions({
      tooltip: { trigger: 'item', formatter: '{b} : {c}%' },
      grid: { left: 40, right: '13%', top: 30, bottom: 10, containLabel: true },
      xAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
      yAxis: { type: 'category', data: rectificationData3.value.list1.map((m) => m.org) },
      series: [
        {
          type: 'bar',
          barWidth: 12,
          itemStyle: { borderRadius: [0, 2, 2, 0] },
          label: { show: true, position: 'right', formatter: '{c}%' },
          data: buildColoredBarData(rectificationData3.value.list1.map((m) => m.rate1)),
        },
      ],
    });

    // 整改完成率
    setCumulativeRepairOptions({
      tooltip: { trigger: 'item', formatter: '{b} : {c}%' },
      grid: { left: 40, right: '13%', top: 30, bottom: 10, containLabel: true },
      xAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
      yAxis: { type: 'category', data: rectificationData3.value.list2.map((m) => m.org) },
      series: [
        {
          type: 'bar',
          barWidth: 12,
          itemStyle: { borderRadius: [0, 2, 2, 0] },
          label: { show: true, position: 'right', formatter: '{c}%' },
          data: buildColoredBarData(rectificationData3.value.list2.map((m) => m.rate2)),
        },
      ],
    });

    // 按时整改完成率j
    setCumulativeTimelyOptions({
      tooltip: { trigger: 'item', formatter: '{b} : {c}%' },
      grid: { left: 40, right: '13%', top: 30, bottom: 10, containLabel: true },
      xAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
      yAxis: { type: 'category', data: rectificationData3.value.list3.map((m) => m.org) },
      series: [
        {
          type: 'bar',
          barWidth: 12,
          itemStyle: { borderRadius: [0, 2, 2, 0] },
          label: { show: true, position: 'right', formatter: '{c}%' },
          data: buildColoredBarData(rectificationData3.value.list3.map((m) => m.rate3)),
        },
      ],
    });
  }

  const handleEduBusinessUnitChange = () => {
    initTrainingStatistics();
    initTaskIssueStatistics();
  };

  /**
   * @description: 加载年度安全教育再培训统计数据并渲染图表
   * @returns void
   */
  const initTrainingStatistics = () => {
    spinning.value = true;
    getTrainingStatistics({
      startDate: trainingDateRange.value[0].format('YYYY-MM-DD'),
      endDate: trainingDateRange.value[1].format('YYYY-MM-DD'),
      type: sortType.value,
      orgCode: eduBusinessUnit.value,
    })
      .then(async (res) => {
        spinning.value = false;
        trainingData.value = res.result;
        // 初始化所有图表
        await initTrainingChart(sortType.value);
      })
      .catch(() => {
        spinning.value = false;
      });
  };
  /**
   * @description: 加载任务下发统计数据并渲染图表
   * @returns void
   */
  const initTaskIssueStatistics = () => {
    spinningTask.value = true;
    getTaskIssueStatistics({
      startDate: trainingDateRange.value[0].format('YYYY-MM-DD'),
      endDate: trainingDateRange.value[1].format('YYYY-MM-DD'),
      orgCode: eduBusinessUnit.value,
    })
      .then(async (res) => {
        console.log('getTaskIssueStatistics', res);
        taskIssueData.value = res;
        // 初始化所有图表
        await initTaskIssueChart();
        spinningTask.value = false;
      })
      .catch((error) => {
        console.error('加载数据失败:', error);
        spinningTask.value = false;
      });
  };
  /**
   * @description: 加载日常排查任务完成情况数据并渲染排行图
   * @returns Promise<void>
   */
  const getInspectionBusinessUnitList = () => {
    getSafetyStandardOrgCodeList().then((res) => {
      inspectionBusinessUnitList.value = res;
    });
  };

  const handleInspectionBusinessUnitChange = () => {
    loadDataDayJob();
  };

  const loadDataDayJob = async () => {
    spinning2.value = true;
    try {
      await getInspectionStatistics({
        startDate: inspectionDateRange.value[0].format('YYYY-MM-DD'),
        endDate: inspectionDateRange.value[1].format('YYYY-MM-DD'),
        orgCode: inspectionBusinessUnit.value,
      }).then((res) => {
        spinning2.value = false;
        console.log('inspectionData', res);
        inspectionData.value = res.result;
      });
    } catch (error) {
      spinning2.value = false;
      console.error('加载数据失败:', error);
    }
  };

  /**
   * @description 加载问题发现率范围及综合指标权重配置
   */
  const loadIssueRateRange = () => {
    spinning.value = true;
    try {
      getIssueRateRange().then((res) => {
        issueRateLower.value = res.issueRateLower;
        issueRateUpper.value = res.issueRateUpper;
        taskCompleteOnTime.value = res.taskCompleteOnTime ?? 10;
        problemRate.value = res.problemRate ?? 40;
        repairComplete.value = res.repairComplete ?? 20;
        repairCompleteOnTime.value = res.repairCompleteOnTime ?? 30;
        spinning.value = false;
      });
    } catch (error) {
      spinning.value = false;
    }
  };
  const handleRectificationBusinessUnitChange = () => {
    loadDataYh();
    loadDataYhThree();
  };

  /**
   * @description: 加载隐患排查治理数据并渲染排行图
   * @returns Promise<void>
   */
  const loadDataYh = () => {
    spinning3.value = true;
    try {
      getRectificationStatistics1({
        startDate: rectificationDateRange.value[0].format('YYYY-MM-DD'),
        endDate: rectificationDateRange.value[1].format('YYYY-MM-DD'),
        orgCode: rectificationBusinessUnit.value,
      }).then((res) => {
        rectificationData1.value = res;
      });
      getRectificationStatistics2({
        startDate: rectificationDateRange.value[0].format('YYYY-MM-DD'),
        endDate: rectificationDateRange.value[1].format('YYYY-MM-DD'),
        orgCode: rectificationBusinessUnit.value,
      }).then((res) => {
        rectificationData2.value = res;
        const toNum = (v: any) => {
          if (v == null) return 0;
          if (typeof v === 'string') return parseFloat(String(v).replace('%', '')) || 0;
          return Number(v) || 0;
        };
        rectificationData2Chart.value = (Array.isArray(res) ? res.slice() : []).sort((a: any, b: any) => toNum(a.index) - toNum(b.index));
        rectificationData2Chart.value = rectificationData2Chart.value.reverse();
        initRectificationCombinedChart();
        spinning3.value = false;
      });
    } catch (error) {
      spinning3.value = false;
    }
  };
  const loadDataYhThree = () => {
    spinning31.value = true;
    try {
      getRectificationStatistics3({orgCode: rectificationBusinessUnit.value}).then((res) => {
        console.log('rectificationData3', res);
        rectificationData3.value = res;
        const parseRate = (val: unknown): number => {
          if (val == null) return 0;
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const m = val.match(/-?\d+(?:\.\d+)?/);
            return m ? Number(m[0]) : 0;
          }
          return 0;
        };

        // list1 按 rate1 升序排序（不改变原始 rate1 字符串/数值）
        if (Array.isArray(rectificationData3.value?.list1)) {
          rectificationData3.value.list1 = rectificationData3.value.list1.slice().sort((a, b) => {
            return parseRate(a?.rate1) - parseRate(b?.rate1);
          });
        }
        // list2 按 rate2 升序排序（不改变原始 rate2 字符串/数值）
        if (Array.isArray(rectificationData3.value?.list2)) {
          rectificationData3.value.list2 = rectificationData3.value.list2.slice().sort((a, b) => {
            return parseRate(a?.rate2) - parseRate(b?.rate2);
          });
        }
        // list3 按 rate3 升序排序（不改变原始 rate3 字符串/数值）
        if (Array.isArray(rectificationData3.value?.list3)) {
          rectificationData3.value.list3 = rectificationData3.value.list3.slice().sort((a, b) => {
            return parseRate(a?.rate3) - parseRate(b?.rate3);
          });
        }
        initRectificationCumulativeCharts();
        spinning31.value = false;
      });
      console.log('rectificationData3eeee3333333======', rectificationData3.value);
    } catch (error) {
      spinning31.value = false;
      console.error('加载数据失败:', error);
    }
  };
  /**
   * @description: 设置排序类型
   */
  const setSortType = async (type) => {
    sortType.value = type;
    initTrainingStatistics();
  };

  // 组件挂载时加载数据
  onMounted(() => {
    // setSortType('1');
    getInspectionBusinessUnitList();
    getSafetyStandardOrgCodeList().then((res) => {
      rectificationBusinessUnitList.value = res;
      teamManagementBusinessUnitList.value = res;
      facilityBusinessUnitList.value = res;
      eduBusinessUnitList.value = res;
    });
    fetchOccupationalHealthOrgList();
    initTaskIssueStatistics();
    loadDataDayJob();
    initTaskIssueChart();
    // loadDataYh();
    getHomeRemark('edu');
    getHomeRemark('seven');
    getHomeRemark('eight');
  });

  /**
   * @description: 处理时间范围变化1（年度安全教育）
   */
  const handleDateRangeChange1 = async (dateRange: any) => {
    let params: any = {};
    if (dateRange && dateRange.length > 0) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    initTrainingStatistics();
    getHomeRemark('edu');
  };

  /**
   * @description: 处理时间范围变化2（高危作业）
   */
  const handleDateRangeChange2 = () => {
    nextTick(() => {
      highRiskWorkPanelRef.value.init(dangerousWorkDateRange.value);
    });
    getHomeRemark('danger');
  };
  /**
   * @description: 处理时间范围变化4（隐患整改）
   */
  const handleDateRangeChange4 = async () => {
    loadDataYh();
    getHomeRemark('rectification');
  };
  /**
   * @description: 处理时间范围变化5（煤气预警设备）
   */
  const handleDateRangeChange5 = async (dateRange: any) => {
    //请求煤气预警设备统计数据
    let params: { startDate?: string; endDate?: string } = {};
    if (dateRange && dateRange.length > 0) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    getHomeRemark('gas');
  };
  /**
   * @description: 处理时间范围变化6（专项检查）
   */
  const handleDateRangeChange6 = async (dateRange: any) => {
    let params: { startDate?: string; endDate?: string } = {};
    if (dateRange && dateRange.length > 0) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    getHomeRemark('seven');
  };

  /**
   * @description: 跳转详情页
   */
  const goDetail = (type: string) => {
    if (type == '1') {
      router.push({
        path: '/statistics/edu',
      });
    }
    if (type == '2') {
      router.push({
        path: '/statistics/dangerWork',
      });
    }
    if (type == '3') {
      router.push({
        path: '/statistics/dualControl',
      });
    }
  };
  const getHomeRemark = async (
    moduleType:
      | 'edu'
      | 'danger'
      | 'inspection'
      | 'rectification'
      | 'gas'
      | 'seven'
      | 'eight'
      | 'personnelCert'
      | 'relatedParty'
      | 'occupationalHealth'
      | 'safetyStandard'
      | 'teamManagement'
      | 'facility'
      | 'emergencyManagement'
      | 'safeProductionInvest'
      | 'safetyDuty'
  ) => {
    let params: { type: string; startTime?: string; endTime?: string } = {
      type: moduleType,
    };
    // 根据不同的类型传不同的时间
    if (moduleType == 'edu') {
      params.startTime = trainingDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = trainingDateRange.value[1].format('YYYY-MM-DD');
    } else if (moduleType == 'danger') {
      params.startTime = dangerousWorkDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = dangerousWorkDateRange.value[1].format('YYYY-MM-DD');
    } else if (moduleType == 'inspection') {
      params.startTime = inspectionDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = inspectionDateRange.value[1].format('YYYY-MM-DD');
    } else if (moduleType == 'rectification') {
      params.startTime = rectificationDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = rectificationDateRange.value[1].format('YYYY-MM-DD');
      params.startTime = gasDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = gasDateRange.value[1].format('YYYY-MM-DD');
    } else if (moduleType == 'seven') {
      params.startTime = sevenDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = sevenDateRange.value[1].format('YYYY-MM-DD');
    } else if (moduleType == 'eight') {
      params.startTime = eightDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = eightDateRange.value[1].format('YYYY-MM-DD');
    } else if (moduleType == 'personnelCert') {
      params.startTime = personnelCertDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = personnelCertDateRange.value[1].format('YYYY-MM-DD');
    } else if (moduleType == 'relatedParty') {
      params.startTime = relatedPartyDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = relatedPartyDateRange.value[1].format('YYYY-MM-DD');
    } else if (moduleType == 'occupationalHealth') {
      params.startTime = occupationalHealthDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = occupationalHealthDateRange.value[1].format('YYYY-MM-DD');
    } else if (moduleType == 'safetyStandard') {
      params.startTime = safetyStandardDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = safetyStandardDateRange.value[1].format('YYYY-MM-DD');
    } else if (moduleType == 'teamManagement') {
      params.startTime = teamManagementDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = teamManagementDateRange.value[1].format('YYYY-MM-DD');
    } else if (moduleType == 'facility') {
      params.startTime = facilityDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = facilityDateRange.value[1].format('YYYY-MM-DD');
    }
    else if (moduleType == 'emergencyManagement') {
      params.startTime = emergencyManagementDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = emergencyManagementDateRange.value[1].format('YYYY-MM-DD');
    }
    else if (moduleType == 'safeProductionInvest') {
      params.startTime = safeProductionInvestDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = safeProductionInvestDateRange.value[1].format('YYYY-MM-DD');
    } else if (moduleType == 'safetyDuty') {
      params.startTime = safetyDutyDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = safetyDutyDateRange.value[1].format('YYYY-MM-DD');
    }else if (moduleType == 'gas') {
      params.startTime = gasDateRange.value[0].format('YYYY-MM-DD');
      params.endTime = gasDateRange.value[1].format('YYYY-MM-DD');
    }
    await getHomeTypeRemark(params).then((res) => {
      console.log('remark', res);
      switch (moduleType) {
        case 'edu':
          remarkText.value.edu = res?.content || '';
          break;
        case 'danger':
          remarkText.value.danger = res?.content || '';
          break;
        case 'inspection':
          remarkText.value.inspection = res?.content || '';
          break;
        case 'rectification':
          remarkText.value.rectification = res?.content || '';
          break;
        case 'gas':
          remarkText.value.gas = res?.content || '';
          break;
          break;
        case 'eight':
          remarkText.value.eight = res?.content || '';
          eightTitle.value = res?.moduleName || '下周重点工作计划';
          richTextEight.value = res?.richText || '';
          break;
        case 'personnelCert':
          remarkText.value.personnelCert = res?.content || '';
          personnelCertTitle.value = res?.moduleName || '人员资质证书';
          break;
        case 'relatedParty':
          remarkText.value.relatedParty = res?.content || '';
          relatedPartyTitle.value = res?.moduleName || '相关方管理';
          break;
        case 'occupationalHealth':
          remarkText.value.occupationalHealth = res?.content || '';
          occupationalHealthTitle.value = res?.moduleName || '职业健康';
          break;
        case 'safetyStandard':
          remarkText.value.safetyStandard = res?.content || '';
          safetyStandardTitle.value = res?.moduleName || '安全生产标准化';
          break;
        case 'teamManagement':
          remarkText.value.teamManagement = res?.content || '';
          teamManagementTitle.value = res?.moduleName || '班组管理';
          break;
        case 'facility':
          remarkText.value.facility = res?.content || '';
          facilityTitle.value = res?.moduleName || '设备设施管理';
          break;
        case 'emergencyManagement':
          remarkText.value.emergencyManagement = res?.content || '';
          emergencyManagementTitle.value = res?.moduleName || '应急管理';
          break;
        case 'safeProductionInvest':
          remarkText.value.safeProductionInvest = res?.content || '';
          safeProductionInvestTitle.value = res?.moduleName || '安全生产投入';
          break;
        case 'safetyDuty':
          remarkText.value.safetyDuty = res?.content || '';
          safetyDutyTitle.value = res?.moduleName || '安全生产责任制';
          break;
        default:
          break;
      }
    });
  };
  /**
   * @description 取消备注输入，隐藏输入区域（扩展支持 gas/seven/eight）
   * @param key 模块标识：'edu' | 'danger' | 'inspection' | 'rectification' | 'gas' | 'seven' | 'eight'
   */
  const handleCancelRemark = (
    key:
      | 'edu'
      | 'danger'
      | 'inspection'
      | 'rectification'
      | 'gas'
      | 'seven'
      | 'eight'
      | 'personnelCert'
      | 'relatedParty'
      | 'occupationalHealth'
      | 'safetyStandard'
      | 'teamManagement'
      | 'facility'
      | 'emergencyManagement'
      | 'safeProductionInvest'
      | 'safetyDuty'
  ) => {
    showRemark.value[key] = false;
    // 重置备注内容
    remarkText.value[key] = '';
    getHomeRemark(key);
  };

  const editTitle7 = () => {
    isTitleEditing7.value = true;
  };
  /**
   * @description: 保存标题（扩展支持 gas/seven/eight）
   */
  const saveTitle7 = () => {
    // 标题不能为空
    if (!sevenTitle.value.trim()) {
      createMessage.warning('请输入标题');
      return;
    }
    handleSaveRemark('seven');
    isTitleEditing7.value = false;
  };
  /**
   * @description: 处理时间范围变化8（下周重点工作计划）
   */
  const handleDateRangeChange8 = async (dateRange: any) => {
    let params: { startDate?: string; endDate?: string } = {};
    if (dateRange && dateRange.length > 0) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    getHomeRemark('eight');
  };
  const editTitle8 = () => {
    isTitleEditing8.value = true;
  };
  /**
   * @description: 保存标题8（扩展支持 gas/seven/eight）
   */
  const saveTitle8 = () => {
    // 标题不能为空
    if (!eightTitle.value.trim()) {
      createMessage.warning('请输入标题');
      return;
    }
    handleSaveRemark('eight');
    isTitleEditing8.value = false;
  };
  /**
   * @description: 处理时间范围变化 PersonnelCert
   */
  const handleDateRangeChangePersonnelCert = async (dateRange: any) => {
    let params: { startDate?: string; endDate?: string } = {};
    if (dateRange && dateRange.length > 0) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    // Refresh chart
    nextTick(() => {
      personnelCertificatePanelRef.value?.init(personnelCertDateRange.value);
    });
    getHomeRemark('personnelCert');
  };

  const goToPersonnelCertDetails = () => {
    router.push('/safetyProductionSystem/certificate');
  };

  /**
   * @description: 处理时间范围变化 OccupationalHealth
   */
  const handleDateRangeChangeOccupationalHealth = async (dateRange: any) => {
    let params: { startDate?: string; endDate?: string } = {};
    if (dateRange && dateRange.length > 0) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    // Refresh chart
    nextTick(() => {
      // occupationalHealthPanelRef.value?.init(occupationalHealthDateRange.value);
    });
    getHomeRemark('occupationalHealth');
  };
  const goToOccupationalHealthDetails = () => {
    // TODO: 设置职业健康详情页面的路由
    router.push('/occupationalHealth/files');
  };

  /**
   * @description: 处理时间范围变化 SafetyStandard
   */
  const handleDateRangeChangeSafetyStandard = async (dateRange: any) => {
    let params: { startDate?: string; endDate?: string } = {};
    if (dateRange && dateRange.length > 0) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    // Refresh chart
    nextTick(() => {
      safetyStandardPanelRef.value?.init(safetyStandardDateRange.value);
    });
    getHomeRemark('safetyStandard');
  };
  const goToSafetyStandardDetails = () => {
    router.push('/safetyStandardization/safetyReviewForm');
  };

  /**
   * @description: 处理时间范围变化 TeamManagement
   */
  const handleDateRangeChangeTeamManagement = async (dateRange: any) => {
    let params: { startDate?: string; endDate?: string } = {};
    if (dateRange && dateRange.length > 0) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    // Refresh chart
    nextTick(() => {
      teamPanelRef.value?.init(teamManagementDateRange.value);
    });
    getHomeRemark('teamManagement');
  };

  const goToTeamManagementDetails = () => {
    router.push('/teamManagement/meetingBeforeClass');
  };

  /**
   * @description: 处理时间范围变化 Facility
   */
  const handleDateRangeChangeFacility = async (dateRange: any) => {
    let params: { startDate?: string; endDate?: string } = {};
    if (dateRange && dateRange.length > 0) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    // Refresh chart
    nextTick(() => {
      facilityPanelRef.value?.init(facilityDateRange.value);
    });
    getHomeRemark('facility');
  };

  const goToFacilityManagementDetails = () => {
    router.push('/socialFacilitiesManage/ledger');
  };

  /**
   * @description: 处理时间范围变化 RelatedParty
   */
  const handleDateRangeChangeRelatedParty = async (dateRange: any) => {
    let params: { startDate?: string; endDate?: string } = {};
    if (dateRange && dateRange.length > 0) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    // Refresh chart
    nextTick(() => {
      relatedPartyPanelRef.value?.init(relatedPartyDateRange.value);
    });
    getHomeRemark('relatedParty');
  };

  const goToRelatedPartyDetails = () => {
    router.push('/statistics/correlation');
  };

  /**
   * @description: 处理时间范围变化 EmergencyManagement
   */
  const handleDateRangeChangeEmergencyManagement = async (dateRange: any) => {
    let params: { startDate?: string; endDate?: string } = {};
    if (dateRange && dateRange.length > 0) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    // Refresh chart
    nextTick(() => {
      emergencyPanelRef.value?.init(emergencyManagementDateRange.value);
    });
    getHomeRemark('emergencyManagement');
  };

  const goToEmergencyManagementDetails = () => {
    router.push('/emergency/ledger');
  };

  /**
   * @description: 处理时间范围变化 SafeProductionInvest
   */
  const handleDateRangeChangeSafeProductionInvest = async (dateRange: any) => {
    let params: { startDate?: string; endDate?: string } = {};
    if (dateRange && dateRange.length > 0) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    // Refresh chart
    nextTick(() => {
      safeProductionInvestPanelRef.value?.init(safeProductionInvestDateRange.value);
    });
    getHomeRemark('safeProductionInvest');
  };
  /**
   * @description: 处理时间范围变化 SafetyDuty
   */
  const handleDateRangeChangeSafetyDuty = async (dateRange: any) => {
    let params: { startDate?: string; endDate?: string } = {};
    if (dateRange && dateRange.length > 0) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    // Refresh chart
    nextTick(() => {
      safetyDutyPanelRef.value?.init(safetyDutyDateRange.value);
    });
    getHomeRemark('safetyDuty');
  };

  const goToSafeProductionInvestDetails = () => {
    router.push('/inSafetyProduction/inputRecord');
  };
  const goToSafeDutyDetails = () => {
    router.push('/safetyResponsibility/dutyCompare');
  };
</script>

<style lang="less" scoped>
  .dashboard-statistics {
    padding: 20px;
    background-color: #fff;
    height: 100%;
    overflow: hidden;

    .statistics-container {
      margin: 0 auto;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .chart-card {
      background: white;
      // border-radius: 8px;
      // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      padding: 10px;

      /* 新增：隐患整改总百分比展示区域（独立类名，不影响原有样式） */
  .rectification-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #e6f7ff;
        border: 1px solid #f0f0f0;
        border-radius: 2px;
        padding: 12px 16px;
        margin: 10px 0;
      }

      .rectification-summary .summary-item {
        flex: 1;
        text-align: center;
        padding: 6px 8px;
      }

      .rectification-summary .summary-item:not(:last-child) {
        border-right: 1px solid #e8e8e8;
      }

      .rectification-summary .summary-label {
        display: block;
        font-size: 14px;
        color: #666;
        margin-bottom: 6px;
      }

      .rectification-summary .summary-value {
        font-size: 18px;
        font-weight: 700;
        color: #333;
      }

      .rectification-summary .summary-unit {
        font-size: 14px;
        color: #666;
        margin-left: 2px;
      }
      .rectification-summary .summary-green {
        position: absolute;
        top: -1px;
        left: 0;
        font-size: 14px;
        color: #52c41a;
        width: 120px;
      }

      /* 累积整改情况模块（独立样式，不影响其他页面） */

      .rectification-cumulative {
        margin-top: 8px;
        background: #fff;
        // border: 1px solid #f0f0f0;
        // border-radius: 2px;
        // padding: 8px 8px 12px;
      }

      .rectification-cumulative .cumulative-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 12px;
      }

      .rectification-cumulative .cumulative-title .info-icon {
        margin-top: -2px;
        color: rgba(0, 0, 0, 0.65);
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        vertical-align: middle;
      }

      .rectification-cumulative .cumulative-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f6ffed;
        border: 1px dashed #e8e8e8;
        border-radius: 2px;
        padding: 10px 12px;
        margin-bottom: 10px;
      }

      .rectification-cumulative .cumulative-summary .summary-item {
        flex: 1;
        text-align: center;
      }

      .rectification-cumulative .cumulative-summary .summary-item:not(:last-child) {
        border-right: 1px dashed #e8e8e8;
      }

      .rectification-cumulative .cumulative-summary .summary-title {
        font-size: 14px;
        color: #666;
        margin-bottom: 6px;
      }

      .rectification-cumulative .cumulative-summary .summary-value {
        font-size: 18px;
        font-weight: 700;
        color: #333;
      }

      .rectification-cumulative .rectification-cumulative-charts {
        display: flex;
        width: 100%;
        gap: 12px;
      }

      .rectification-cumulative .rectification-cumulative-charts .chart-item {
        flex: 1;
      }

      .rectification-cumulative .rectification-cumulative-charts .chart-box {
        background: #ffffff;
        height: 400px;
        border-radius: 2px;
        padding: 8px;
      }

      .rectification-cumulative .rectification-cumulative-charts .chart-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 6px;
      }

      .rectification-cumulative .rectification-cumulative-charts .cumulative-chart {
        width: 100%;
        height: 300px;
      }

      .card-header {
        padding: 12px 16px 1px;
        //   border-bottom: 1px solid #f0f0f0;

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .card-title {
            margin: 0 0 6px 0;
            font-size: 18px;
            font-weight: 600;
          }

          .title-with-detail {
            display: flex;
            align-items: center;
            gap: 8px;

            .detail-btn {
              padding: 0;
              height: auto;
              font-size: 14px;
              color: #1890ff;

              &:hover {
                color: #40a9ff;
              }
            }

            .remark-btn {
              padding: 0;
              height: auto;
              font-size: 14px;
              color: #1890ff;
            }
          }

          .header-controls {
            display: flex;
            align-items: center;
            gap: 20px;
            font-size: 14px;

            .control-label {
              // color: rgba(255, 255, 255, 0.9);
              white-space: nowrap;
              margin-right: -15px;
            }

            .sort-buttons {
              :deep(.ant-btn) {
                height: 28px;
                padding: 0 12px;
                font-size: 12px;
              }
            }

            .date-picker {
              width: 120px;
            }

            .date-separator {
              // color: rgba(255, 255, 255, 0.8);
              margin: 0 4px;
            }

            .query-btn {
              height: 28px;
              padding: 0 12px;
              font-size: 12px;
              background: #ffd700;
              border-color: #ffd700;
              color: #333;

              &:hover {
                background: #ffed4e;
                border-color: #ffed4e;
              }
            }
          }
        }

        .card-title {
          margin: 0 0 6px 0;
          font-size: 18px;
          font-weight: 600;
        }
      }

      .chart-content {
        position: relative;
        flex: 1;
        padding: 10px;
        display: flex;
        // align-items: center;
        // justify-content: center;
        .chart-wrapper {
          width: 100%;
          height: 100%;
          // height: calc(100vh - 500px);
        }
      }

      // 针对培训图表、隐患排查图表和隐患整改图表的排名标签样式
      .training-chart-content,
      .inspection-chart-content,
      .rectification-chart-content {
        // 给图表容器添加左边距，为排名标签腾出空间
        .chart-wrapper {
          margin-left: 10px;
          height: 460px;
        }

        .rectification-ranking {
          width: 600px;
          flex: 0 0 600px;

          .ranking-title {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;

            .info-icon {
              margin-top: -2px;
              color: rgba(0, 0, 0, 0.65);
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
              vertical-align: middle;
            }
          }

          .ranking-header {
            display: grid;
            grid-template-columns: 1fr 0.8fr 0.8fr 0.8fr 0.8fr 0.9fr;
            column-gap: 8px;
            font-size: 12px;
            font-weight: 600;
            color: #666;
            margin: 4px 0 8px;
            .header-org {
              text-align: left;
            }
            .header-index,
            .header-rate {
              text-align: center;
            }
          }

          .ranking-list {
            width: 100%;
            .ranking-item {
              display: grid;
              grid-template-columns: 1fr 0.8fr 0.8fr 0.8fr 0.8fr 0.9fr;
              column-gap: 8px;
              align-items: center;
              padding: 5px 0;
              font-size: 12px;
              .ranking-org {
                color: #333;
                text-align: left;
              }
              .ranking-score,
              .ranking-rate1,
              .ranking-rate2,
              .ranking-rate3,
              .ranking-rate4 {
                color: #333;
                text-align: center;
              }
              &.top-three-item {
                .ranking-org,
                .ranking-score,
                .ranking-rate1,
                .ranking-rate2,
                .ranking-rate3,
                .ranking-rate4 {
                  color: #52c41a;
                }
              }
              &.bottom-three-item {
                .ranking-org,
                .ranking-score,
                .ranking-rate1,
                .ranking-rate2,
                .ranking-rate3,
                .ranking-rate4 {
                  color: #fa8c16;
                }
              }
            }
          }
        }
      }

      // 高危作业图表的左右布局样式
      .dangerous-work-content {
        display: flex;
        align-items: stretch;
        padding: 0;

        .dangerous-work-stats {
          flex: 0 0 240px;
          padding: 8px 12px;
          background: #f8f9fa;
          border-right: 1px solid #e8e8e8;
          display: flex;
          flex-direction: column;
          justify-content: center;

          .stat-section {
            margin-bottom: 15px;

            &:last-child {
              margin-bottom: 0;
            }

            .stat-title {
              font-size: 14px;
              font-weight: 600;
              color: #333;
              margin-bottom: 5%;

              .stat-count {
                color: #1890ff;
                font-size: 16px;
                font-weight: 700;
              }
            }

            .stat-row {
              display: flex;
              align-items: center;
              margin-bottom: 4px;

              .stat-label {
                font-size: 13px;
                color: #666;
                margin-right: 8px;
              }

              .stat-value {
                font-size: 16px;
                font-weight: 600;
                color: #333;
                margin-right: 4px;
              }

              .stat-unit {
                font-size: 12px;
                color: #999;
              }
            }

            .completion-info {
              display: flex;
              align-items: center;
              font-size: 12px;

              .completion-label {
                color: #666;
                margin-right: 8px;
              }

              .completion-rate {
                font-size: 14px;
                font-weight: 600;
                color: #52c41a;
                margin-right: 2px;
              }

              .completion-unit {
                color: #999;
              }
            }

            .problem-stats {
              .problem-item {
                display: flex;
                align-items: center;
                margin-bottom: 4px;

                .problem-label {
                  font-size: 13px;
                  color: #666;
                  margin-right: 8px;
                }

                .problem-value {
                  font-size: 16px;
                  font-weight: 600;
                  color: #333;
                  margin-right: 4px;
                }

                .problem-unit {
                  font-size: 12px;
                  color: #999;
                }
              }

              .problem-completion {
                display: flex;
                align-items: center;
                font-size: 12px;
                margin-top: 8px;

                .problem-completion-label {
                  color: #666;
                  margin-right: 8px;
                }

                .problem-completion-rate {
                  font-size: 14px;
                  font-weight: 600;
                  color: #52c41a;
                  margin-right: 2px;
                }

                .problem-completion-unit {
                  color: #999;
                }
              }
            }
          }
        }

        .dangerous-work-chart {
          flex: 1;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;

          .chart-wrapper {
            width: 100%;
            // height: 100%;
            height: 460px;
          }
        }
      }

      // 隐患排查治理的左右布局样式
      .rectification-chart-content {
        display: flex;
        align-items: stretch;
        padding: 0;
        height: 450px;

        .rectification-stats {
          flex: 0 0 240px;
          padding: 4px 12px;
          background: #f8f9fa;
          border-right: 1px solid #e8e8e8;
          display: flex;
          flex-direction: column;

          .stat-section {
            margin-bottom: 1px;

            &:last-child {
              margin-bottom: 0;
            }

            .stat-title {
              font-size: 14px;
              font-weight: 600;
              color: #333;
              margin-bottom: 5%;

              .stat-count {
                color: #1890ff;
                font-size: 16px;
                font-weight: 700;
              }
            }

            .stat-row {
              display: flex;
              align-items: center;

              .stat-label {
                font-size: 12px;
                color: #666;
                margin-right: 8px;
              }

              .stat-value {
                font-size: 16px;
                font-weight: 600;
                color: #1890ff;
                margin-right: 4px;
              }

              .stat-unit {
                font-size: 12px;
                color: #999;
                margin-right: 10px;
              }

              .stat-rate {
                font-size: 14px;
                font-weight: 600;
                color: #52c41a;
              }
            }

            .completion-info {
              display: flex;
              align-items: center;
              font-size: 12px;

              .completion-label {
                color: #666;
                margin-right: 8px;
              }

              .completion-rate {
                font-size: 14px;
                font-weight: 600;
                color: #52c41a;
                margin-right: 2px;
              }

              .completion-unit {
                color: #999;
              }
            }

            .problem-stats {
              .problem-item {
                display: flex;
                align-items: center;
                margin-bottom: 4px;

                .problem-label {
                  font-size: 13px;
                  color: #666;
                  margin-right: 8px;
                }

                .problem-value {
                  font-size: 16px;
                  font-weight: 600;
                  color: #333;
                  margin-right: 4px;
                }

                .problem-unit {
                  font-size: 12px;
                  color: #999;
                }
              }
            }
          }
        }

        .chart-section {
          height: 450px;
          flex: 1;
          position: relative;
          padding: 0 15px;

          .chart-wrapper {
            height: 100%;
          }
        }
      }
    }
  }

  // 隐患统计信息样式
  .hazard-summary {
    line-height: 1.6;
    font-size: 14px;
    color: #333;

    .hazard-text {
      color: #666;
      margin-right: 8px;
    }

    .category-info {
      color: #555;
      margin-right: 8px;
    }

    .rectification-info {
      color: #555;
    }

    .highlight-number {
      color: #1890ff;
      font-weight: 600;
      font-size: 15px;
      margin: 0 2px;
    }

    .highlight-percent {
      color: #52c41a;
      font-weight: 600;
      font-size: 15px;
      margin: 0 2px;
    }
  }

  .level-container {
    position: relative;

    .level-num {
      width: 10px;
      position: absolute;
      top: 20px;
      left: 20px;
    }
  }

  .remark-area {
    margin-top: 20px;
    // height: 100px;
    width: 100%;
  }

  .remark-textarea {
    font-size: 20px;
    font-weight: 600;
    margin-left: 15px;
    margin-top: 15px;
  }

  .task-issue-chart-content {
    margin: 20px 0;
  }

  .statistics-summary {
    display: flex;
    gap: 24px;
    align-items: center;

    .summary-item {
      display: flex;
      align-items: baseline;
      gap: 4px;

      .summary-label {
        font-size: 14px;
        color: #333;
      }

      .summary-value {
        font-size: 18px;
        font-weight: bold;

        &.highlight {
          color: #ffd700;
          font-size: 20px;
        }
      }

      .summary-unit {
        font-size: 14px;
        color: #666;
      }
    }
  }

  .statistics-info {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;

    .stats-row {
      display: flex;
      align-items: center;
      font-size: 14px;

      .stat-value.highlight {
        font-size: 14px;
      }
    }
  }
  .bullet-list {
    > * {
      margin: 0 0 6px 0;
      white-space: nowrap;
    }
    > *::before {
      content: '•';
      display: inline-block;
      margin-right: 6px;
      margin-left: 5px;
      color: #fff;
      font-weight: 700;
    }
  }
  .gas-statistics {
    .gas-module-card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
      border: 1px solid #ebebeb;
      padding: 20px;
      margin: 20px 0;
    }
    .title {
      font-size: 16px;
      font-weight: bold;
      margin: 15px 0;
      padding-left: 10px;
      border-left: 4px solid #1890ff;
    }
  }
  :deep(.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab, .ant-tabs-card > div > .ant-tabs-nav .ant-tabs-tab) {
    padding: 8px 6px !important;
  }
</style>
