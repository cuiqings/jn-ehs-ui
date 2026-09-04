<template>
  <div class="dangerWork">
    <div class="header">
      <BasicForm @register="registerForm" @submit="onSearch" @reset="resetForm" />
    </div>
    <div class="inner">
      <div class="chart" v-loading="loading1">
        <div class="tit">高危作业统计</div>
        <div class="hd">
          <div class="left">
            <div class="item">
              <div class="label">作业类型：</div>
              <div class="value">
                <a-space>
                  <a-button
                    shape="round"
                    :size="queryParams.workType == '' ? 'default' : 'small'"
                    :type="queryParams.workType == '' ? 'primary' : 'default'"
                    @click="btnClick('workType', '')"
                    >全部</a-button
                  >
                  <a-button
                    shape="round"
                    :size="item.value == queryParams.workType ? 'default' : 'small'"
                    :type="item.value == queryParams.workType ? 'primary' : 'default'"
                    v-for="item in work_typeList"
                    @click="btnClick('workType', item.value)"
                    >{{ item.text }}</a-button
                  >
                </a-space>
              </div>
            </div>
            <div class="item">
              <div class="label">作业状态：</div>
              <div class="value">
                <a-space>
                  <a-button
                    shape="round"
                    :size="item.value == queryParams.workStatus ? 'default' : 'small'"
                    :type="item.value == queryParams.workStatus ? 'primary' : 'default'"
                    v-for="item in workStatusList"
                    @click="btnClick('workStatus', item.value)"
                    >{{ item.text }}</a-button
                  >
                </a-space>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="table">
              <div class="r-l">
                <span>{{ oneData.total }}</span>
                <div>总数</div>
              </div>
              <ul>
                <li>
                  <span>{{ oneData.totalOne }}</span
                  ><span>{{ oneData.totalTwo }}</span
                  ><span>{{ oneData.totalThree }}</span>
                </li>
                <li> <span>一级</span><span>二级</span><span>三级</span> </li>
              </ul>
            </div>
          </div>
        </div>
        <LineBar ref="lineBarRef1" />
      </div>
      <div class="chart">
        <div class="hd">
          <div class="left">
            <div class="item">
              <div class="label">申请单位：</div>
              <div class="value">
                <a-space>
                  <a-button
                    shape="round"
                    :size="item.orgCode == queryParams.orgCode ? 'default' : 'small'"
                    :type="item.orgCode == queryParams.orgCode ? 'primary' : 'default'"
                    v-for="item in departList"
                    @click="btnClickTable('orgCode', item.orgCode)"
                    >{{ item.departName }}</a-button
                  >
                </a-space>
              </div>
            </div>
            <div class="item">
              <div class="label">高危作业等级：</div>
              <div class="value">
                <a-space>
                  <a-button
                    shape="round"
                    :size="item.value == queryParams.level ? 'default' : 'small'"
                    :type="item.value == queryParams.level ? 'primary' : 'default'"
                    v-for="item in gradeList"
                    @click="btnClickTable('level', item.value)"
                    >{{ item.text }}</a-button
                  >
                  <a-button type="primary" shape="round" @click="exportPlanExcel">导出</a-button>
                </a-space>
              </div>
            </div>
          </div>
        </div>
        <div class="table-d">
          <a-table
            height="380px"
            :dataSource="riskLevelWorkList"
            :pagination="riskLevelpagination"
            :loading="tableLoading"
            :columns="columns"
            :scroll="{ x: 1600 }"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-space :size="24">
                  <!-- <a-button type="link" link @click="onView(record)">查看</a-button> -->
                  <FolderViewOutlined style="cursor: pointer; color: #1890ff; font-size: 18px" title="查看" @click="onView(record)" />
                  <!-- <a-button :loading="downloading" v-if="record.workState == '已验收'" type="link" link @click="onExportWork(record)">导出作业票</a-button> -->
                  <CloudDownloadOutlined
                    style="cursor: pointer; color: #1890ff; font-size: 18px"
                    title="导出作业票"
                    v-if="record.workState == '已验收'"
                    :loading="downloading"
                    @click="onExportWork(record)"
                  />
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </div>
      <div class="chart">
        <div class="tit">各单位危险作业总数统计</div>
        <div class="numbers">
          <div v-for="item in totalData" :key="item.orgCode">
            <h1>{{ item.num }}</h1>
            <span>{{ item.orgName }}</span>
          </div>
        </div>
      </div>
      <div class="chart gary" v-loading="loading2"> <LineBar ref="lineBarRef2" /></div>
      <div class="chart" v-loading="loading3">
        <LineBar ref="lineBarRef3" />
      </div>
      <div class="chart">
        <div class="hd-table">
          <div class="tit">一级高危作业</div>
          <div class="right">
            所属单位：
            <a-select style="width: 220px" v-model:value="orgCode1" @change="handleChange1" placeholder="请选择" allowClear>
              <a-select-option v-for="item in orgList" :key="item.orgCode">{{ item.departName }}</a-select-option>
            </a-select>
          </div>
        </div>

        <a-table :loading="loading" :columns="columns2" :data-source="levelData1" :pagination="false" bordered>
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'index' && record.departName != '合计'">
              {{ index + 1 }}
            </template>

            <template v-if="column.key === 'shouldCheckNum'">
              <span>{{ record.shouldCheckNum }}</span>
            </template>
            <template v-if="column.key === 'checkNum'">
              <span :style="{ color: record.checkRatio != '100%' && record.shouldCheckNum > 0 ? '#ff4d4f' : '' }">{{ record.checkNum }}</span>
            </template>
            <template v-if="column.key === 'checkRatio'">
              <span :style="{ color: record.checkRatio != '100%' && record.shouldCheckNum > 0 ? '#ff4d4f' : '' }">{{
                record.shouldCheckNum > 0 ? record.checkRatio : '-'
              }}</span>
            </template>
            <template v-if="column.key === 'aqkzCheckNum'">
              <span :style="{ color: record.aqkzCheckRatio != '100%' && record.aqkzShouldCheckNum > 0 ? '#ff4d4f' : '' }">{{
                record.aqkzCheckNum
              }}</span>
            </template>
            <template v-if="column.key === 'aqkzCheckRatio'">
              <span :style="{ color: record.aqkzCheckRatio != '100%' && record.aqkzShouldCheckNum > 0 ? '#ff4d4f' : '' }">{{
                record.aqkzShouldCheckNum > 0 ? record.aqkzCheckRatio : '-'
              }}</span>
            </template>
            <template v-if="column.key === 'fbzCheckNum'">
              <span :style="{ color: parseFloat(record.fbzCheckRatio) < 50 && record.fbzShouldCheckNum > 0 ? '#ff4d4f' : '' }">{{
                record.fbzCheckNum
              }}</span>
            </template>
            <template v-if="column.key === 'fbzCheckRatio'">
              <span :style="{ color: parseFloat(record.fbzCheckRatio) < 50 && record.fbzShouldCheckNum > 0 ? '#ff4d4f' : '' }">{{
                record.fbzShouldCheckNum > 0 ? record.fbzCheckRatio : '-'
              }}</span>
            </template>

            <template v-if="column.key === 'aqkCheckNum'">
              <span :style="{ color: record.aqkCheckRatio != '100%' && record.aqkShouldCheckNum > 0 ? '#ff4d4f' : '' }">{{
                record.aqkCheckNum
              }}</span>
            </template>
            <template v-if="column.key === 'aqkCheckRatio'">
              <span :style="{ color: record.aqkCheckRatio != '100%' && record.aqkShouldCheckNum > 0 ? '#ff4d4f' : '' }">{{
                record.aqkShouldCheckNum > 0 ? record.aqkCheckRatio : '-'
              }}</span>
            </template>

            <template v-if="column.key === 'cjZrCheckNum'">
              <span :style="{ color: record.cjZrCheckRatio != '100%' && record.cjZrShouldCheckNum > 0 ? '#ff4d4f' : '' }">{{
                record.cjZrCheckNum
              }}</span>
            </template>
            <template v-if="column.key === 'cjZrCheckRatio'">
              <span :style="{ color: record.cjZrCheckRatio != '100%' && record.cjZrShouldCheckNum > 0 ? '#ff4d4f' : '' }">{{
                record.cjZrShouldCheckNum > 0 && record.cjZrCheckRatio ? record.cjZrCheckRatio : '-'
              }}</span>
            </template>
          </template>
          <template #summary>
            <a-table-summary fixed>
              <a-table-summary-row :row-span="2">
                <a-table-summary-cell :index="0">备注</a-table-summary-cell>
                <a-table-summary-cell :col-span="21">
                  <a-typography-text type="danger">
                    <div>{{ remark }}</div>
                  </a-typography-text>
                </a-table-summary-cell>
              </a-table-summary-row>
            </a-table-summary>
          </template>
        </a-table>
      </div>
      <div class="chart">
        <div class="hd-table">
          <div class="tit">二级高危作业</div>
          <div class="right">
            所属单位：
            <a-select style="width: 220px" v-model:value="orgCode2" @change="handleChange2" placeholder="请选择" allowClear>
              <a-select-option v-for="item in orgList" :key="item.orgCode">{{ item.departName }}</a-select-option>
            </a-select>
          </div>
        </div>
        <a-table :loading="loading" :columns="columns21" :data-source="levelData2" :pagination="false" bordered>
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'index' && record.departName != '合计'">
              {{ index + 1 }}
            </template>

            <template v-if="column.key === 'shouldCheckNumTwo'">
              <span>{{ record.shouldCheckNumTwo }}</span>
            </template>
            <template v-if="column.key === 'checkNumTwo'">
              <span :style="{ color: comparePercent(record.checkRatioTwo, '60%') == -1 && record.shouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.checkNumTwo
              }}</span>
            </template>
            <template v-if="column.key === 'checkRatioTwo'">
              <span :style="{ color: comparePercent(record.checkRatioTwo, '60%') == -1 && record.shouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.shouldCheckNumTwo > 0 ? record.checkRatioTwo : '-'
              }}</span>
            </template>

            <template v-if="column.key === 'fbzShouldCheckNumTwo'">
              <span :style="{ color: parseFloat(record.fbzCheckRatioTwo) < 40 && record.fbzShouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.fbzShouldCheckNumTwo
              }}</span>
            </template>
            <template v-if="column.key === 'fbzCheckNumTwo'">
              <span :style="{ color: parseFloat(record.fbzCheckRatioTwo) < 40 && record.fbzShouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.fbzCheckNumTwo
              }}</span>
            </template>
            <template v-if="column.key === 'fbzCheckRatioTwo'">
              <span :style="{ color: parseFloat(record.fbzCheckRatioTwo) < 40 && record.fbzShouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.fbzShouldCheckNumTwo > 0 ? record.fbzCheckRatioTwo : '-'
              }}</span>
            </template>
            <template v-if="column.key === 'aqkShouldCheckNumTwo'">
              <span :style="{ color: comparePercent(record.aqkCheckRatioTwo, '60%') == -1 && record.aqkShouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.aqkShouldCheckNumTwo
              }}</span>
            </template>
            <template v-if="column.key === 'aqkCheckNumTwo'">
              <span :style="{ color: comparePercent(record.aqkCheckRatioTwo, '60%') == -1 && record.aqkShouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.aqkCheckNumTwo
              }}</span>
            </template>
            <template v-if="column.key === 'aqkCheckRatioTwo'">
              <span :style="{ color: comparePercent(record.aqkCheckRatioTwo, '60%') == -1 && record.aqkShouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.aqkShouldCheckNumTwo > 0 ? record.aqkCheckRatioTwo : '-'
              }}</span>
            </template>
            <template v-if="column.key === 'aqkzShouldCheckNumTwo'">
              <span :style="{ color: comparePercent(record.aqkzCheckRatioTwo, '60%') == -1 && record.aqkzShouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.aqkzShouldCheckNumTwo
              }}</span>
            </template>
            <template v-if="column.key === 'aqkzCheckNumTwo'">
              <span :style="{ color: comparePercent(record.aqkzCheckRatioTwo, '60%') == -1 && record.aqkzShouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.aqkCheckNumTwo
              }}</span>
            </template>
            <template v-if="column.key === 'aqkzCheckRatioTwo'">
              <span :style="{ color: comparePercent(record.aqkzCheckRatioTwo, '60%') == -1 && record.aqkzShouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.aqkzShouldCheckNumTwo > 0 ? record.aqkzCheckRatioTwo : '-'
              }}</span>
            </template>

            <template v-if="column.key === 'cjZrShouldCheckNumTwo'">
              <span :style="{ color: comparePercent(record.cjZrCheckRatioTwo, '60%') == -1 && record.cjZrShouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.cjZrShouldCheckNumTwo
              }}</span>
            </template>
            <template v-if="column.key === 'cjZrCheckNumTwo'">
              <span :style="{ color: comparePercent(record.cjZrCheckRatioTwo, '60%') == -1 && record.cjZrShouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.cjZrCheckNumTwo
              }}</span>
            </template>
            <template v-if="column.key === 'cjZrCheckRatioTwo'">
              <span :style="{ color: comparePercent(record.cjZrCheckRatioTwo, '60%') == -1 && record.cjZrShouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.cjZrShouldCheckNumTwo > 0 ? record.cjZrCheckRatioTwo : '-'
              }}</span>
            </template>
            <template v-if="column.key === 'bzzShouldCheckNumTwo'">
              <span :style="{ color: comparePercent(record.bzzCheckRatioTwo, '100%') == -1 && record.bzzShouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.bzzShouldCheckNumTwo
              }}</span>
            </template>
            <template v-if="column.key === 'bzzCheckNumTwo'">
              <span :style="{ color: comparePercent(record.bzzCheckRatioTwo, '100%') == -1 && record.bzzShouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.bzzCheckNumTwo
              }}</span>
            </template>
            <template v-if="column.key === 'bzzCheckRatioTwo'">
              <span :style="{ color: comparePercent(record.bzzCheckRatioTwo, '100%') == -1 && record.bzzShouldCheckNumTwo > 0 ? '#ff4d4f' : '' }">{{
                record.bzzShouldCheckNumTwo > 0 ? record.bzzCheckRatioTwo : '-'
              }}</span>
            </template>
          </template>
          <template #summary>
            <a-table-summary fixed>
              <a-table-summary-row :row-span="2" fixed>
                <a-table-summary-cell :index="0">备注</a-table-summary-cell>
                <a-table-summary-cell :col-span="21">
                  <a-typography-text type="danger">
                    <div>{{ remartTwo }}</div>
                  </a-typography-text>
                </a-table-summary-cell>
              </a-table-summary-row>
            </a-table-summary>
          </template>
        </a-table>
      </div>
      <div class="chart">
        <div class="hd-table">
          <div class="tit">三级高危作业</div>
          <div class="right">
            所属单位：
            <a-select style="width: 220px" v-model:value="orgCode4" @change="handleChange4" placeholder="请选择" allowClear>
              <a-select-option v-for="item in orgList" :key="item.orgCode">{{ item.departName }}</a-select-option>
            </a-select>
          </div>
        </div>
        <a-table :loading="loading" :columns="columns22" :data-source="levelData3" :pagination="false" bordered>
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'index' && record.departName != '合计'">
              {{ index + 1 }}
            </template>

            <template v-if="column.key === 'shouldCheckNumThree'">
              <span>{{ record.shouldCheckNumThree }}</span>
            </template>
            <template v-if="column.key === 'checkNumThree'">
              <span :style="{ color: comparePercent(record.checkRatioThree, '60%') == -1 && record.shouldCheckNumThree > 0 ? '#ff4d4f' : '' }">{{
                record.checkNumThree
              }}</span>
            </template>
            <template v-if="column.key === 'checkRatioThree'">
              <span :style="{ color: comparePercent(record.checkRatioThree, '60%') == -1 && record.shouldCheckNumThree > 0 ? '#ff4d4f' : '' }">{{
                record.shouldCheckNumThree > 0 ? record.checkRatioThree : '-'
              }}</span>
            </template>

            <template v-if="column.key === 'fbzShouldCheckNumThree'">
              <span :style="{ color: parseFloat(record.fbzCheckRatioThree) < 40 && record.fbzShouldCheckNumThree > 0 ? '#ff4d4f' : '' }">{{
                record.fbzShouldCheckNumThree
              }}</span>
            </template>
            <template v-if="column.key === 'fbzCheckNumThree'">
              <span :style="{ color: parseFloat(record.fbzCheckRatioThree) < 40 && record.fbzShouldCheckNumThree > 0 ? '#ff4d4f' : '' }">{{
                record.fbzCheckNumThree
              }}</span>
            </template>
            <template v-if="column.key === 'fbzCheckRatioThree'">
              <span :style="{ color: parseFloat(record.fbzCheckRatioThree) < 40 && record.fbzShouldCheckNumThree > 0 ? '#ff4d4f' : '' }">{{
                record.fbzShouldCheckNumThree > 0 ? record.fbzCheckRatioThree : '-'
              }}</span>
            </template>
            <template v-if="column.key === 'aqkShouldCheckNumThree'">
              <span
                :style="{ color: comparePercent(record.aqkCheckRatioThree, '60%') == -1 && record.aqkShouldCheckNumThree > 0 ? '#ff4d4f' : '' }"
                >{{ record.aqkShouldCheckNumThree }}</span
              >
            </template>
            <template v-if="column.key === 'aqkCheckNumThree'">
              <span
                :style="{ color: comparePercent(record.aqkCheckRatioThree, '60%') == -1 && record.aqkShouldCheckNumThree > 0 ? '#ff4d4f' : '' }"
                >{{ record.aqkCheckNumThree }}</span
              >
            </template>
            <template v-if="column.key === 'aqkCheckRatioThree'">
              <span
                :style="{ color: comparePercent(record.aqkCheckRatioThree, '60%') == -1 && record.aqkShouldCheckNumThree > 0 ? '#ff4d4f' : '' }"
                >{{ record.aqkShouldCheckNumThree > 0 ? record.aqkCheckRatioThree : '-' }}</span
              >
            </template>
            <template v-if="column.key === 'aqkzShouldCheckNumThree'">
              <span
                :style="{ color: comparePercent(record.aqkzCheckRatioThree, '60%') == -1 && record.aqkzShouldCheckNumThree > 0 ? '#ff4d4f' : '' }"
                >{{ record.aqkzShouldCheckNumThree }}</span
              >
            </template>
            <template v-if="column.key === 'aqkzCheckNumThree'">
              <span
                :style="{ color: comparePercent(record.aqkzCheckRatioThree, '60%') == -1 && record.aqkzShouldCheckNumThree > 0 ? '#ff4d4f' : '' }"
                >{{ record.aqkCheckNumThree }}</span
              >
            </template>
            <template v-if="column.key === 'aqkzCheckRatioThree'">
              <span
                :style="{ color: comparePercent(record.aqkzCheckRatioThree, '60%') == -1 && record.aqkzShouldCheckNumThree > 0 ? '#ff4d4f' : '' }"
                >{{ record.aqkzShouldCheckNumThree > 0 ? record.aqkzCheckRatioThree : '-' }}</span
              >
            </template>

            <template v-if="column.key === 'cjZrShouldCheckNumThree'">
              <span
                :style="{ color: comparePercent(record.cjZrCheckRatioThree, '60%') == -1 && record.cjZrShouldCheckNumThree > 0 ? '#ff4d4f' : '' }"
                >{{ record.cjZrShouldCheckNumThree }}</span
              >
            </template>
            <template v-if="column.key === 'cjZrCheckNumThree'">
              <span
                :style="{ color: comparePercent(record.cjZrCheckRatioThree, '60%') == -1 && record.cjZrShouldCheckNumThree > 0 ? '#ff4d4f' : '' }"
                >{{ record.cjZrCheckNumThree }}</span
              >
            </template>
            <template v-if="column.key === 'cjZrCheckRatioThree'">
              <span
                :style="{ color: comparePercent(record.cjZrCheckRatioThree, '60%') == -1 && record.cjZrShouldCheckNumThree > 0 ? '#ff4d4f' : '' }"
                >{{ record.cjZrShouldCheckNumThree > 0 ? record.cjZrCheckRatioThree : '-' }}</span
              >
            </template>
            <template v-if="column.key === 'bzzShouldCheckNumThree'">
              <span
                :style="{ color: comparePercent(record.bzzCheckRatioThree, '100%') == -1 && record.bzzShouldCheckNumThree > 0 ? '#ff4d4f' : '' }"
                >{{ record.bzzShouldCheckNumThree }}</span
              >
            </template>
            <template v-if="column.key === 'bzzCheckNumThree'">
              <span
                :style="{ color: comparePercent(record.bzzCheckRatioThree, '100%') == -1 && record.bzzShouldCheckNumThree > 0 ? '#ff4d4f' : '' }"
                >{{ record.bzzCheckNumThree }}</span
              >
            </template>
            <template v-if="column.key === 'bzzCheckRatioThree'">
              <span
                :style="{ color: comparePercent(record.bzzCheckRatioThree, '100%') == -1 && record.bzzShouldCheckNumThree > 0 ? '#ff4d4f' : '' }"
                >{{ record.bzzShouldCheckNumThree > 0 ? record.bzzCheckRatioThree : '-' }}</span
              >
            </template>
          </template>
          <template #summary>
            <a-table-summary fixed>
              <a-table-summary-row :row-span="2" fixed>
                <a-table-summary-cell :index="0">备注</a-table-summary-cell>
                <a-table-summary-cell :col-span="21">
                  <a-typography-text type="danger">
                    <div>{{ remartThree }}</div>
                  </a-typography-text>
                </a-table-summary-cell>
              </a-table-summary-row>
            </a-table-summary>
          </template>
        </a-table>
      </div>
      <div class="chart">
        <div class="hd-table">
          <div class="tit">整改情况</div>
          <div class="right">
            检查单位：
            <a-select style="width: 220px" v-model:value="orgCode3" @change="handleChange3" placeholder="请选择" allowClear>
              <a-select-option v-for="item in orgList" :key="item.orgCode">{{ item.departName }}</a-select-option>
            </a-select>
            <a-button style="margin-left: 8px" type="primary" :loading="exportIng" @click="handleExport">导出</a-button>
          </div>
        </div>
        <a-table :loading="loading9" :columns="columns3" :data-source="listDesc" :pagination="false" bordered>
          <template #bodyCell="{ column, index }">
            <template v-if="column.key === 'index'">
              {{ index + 1 }}
            </template>
          </template>
          <template #summary>
            <a-table-summary-row :row-span="2">
              <a-table-summary-cell>备注</a-table-summary-cell>
              <a-table-summary-cell :col-span="13">
                <a-typography-text type="danger">
                  <div>{{ desc1 }}</div>
                  <div>{{ desc2 }}</div>
                  <div>{{ desc3 }}</div>
                </a-typography-text>
              </a-table-summary-cell>
            </a-table-summary-row>
          </template>
        </a-table>
      </div>
    </div>
    <workDetail ref="workDetailRef" @register="register" />
  </div>
</template>
<script lang="ts" name="statistics-dangerWork" setup>
  import { onMounted, ref } from 'vue';
  import { useForm, BasicForm, FormSchema } from '/@/components/Form';
  import {
    getDangerousData,
    getRiskWorkData,
    getRiskWorkList,
    getDangerousDataNum,
    getWorkTypeData,
    getWorkStatusData,
    getDangerousDesc,
  } from './api';
  import workDetail from '../../hazardousOperation/detail/detailDaver.vue';
  import { CloudDownloadOutlined, FolderViewOutlined } from '@ant-design/icons-vue';
  import { downloadFileAll, getDepart3ListWithSecurity } from '/@/api/common/api';
  import { useContent } from './hooks/useContent';
  import LineBar from '../components/lineBar.vue';
  import dayjs from 'dayjs';
  const {
    work_typeList,
    workStatusList,
    departList,
    gradeList,
    columns,
    columns2,
    columns21,
    columns22,
    columns3,
    onView,
    onExportWork,
    register,
    downloading,
  } = useContent();
  //自定义表单字段
  const formSchemas: FormSchema[] = [
    {
      label: '选择时间',
      field: 'time',
      component: 'RangeDate',
      componentProps: {
        allowClear: false,
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
      },
    },
  ];

  const [registerForm, { getFieldsValue, resetFields, setFieldsValue }] = useForm({
    //注册表单列
    schemas: formSchemas,
    submitButtonOptions: { text: '查询' },
    resetButtonOptions: { text: '重置' },
    fieldMapToTime: [['start', ['startTime', 'endTime'], 'YYYY-MM-DD']],
    showAdvancedButton: true,
    resetFunc: resetForm,
    labelWidth: 130,
    baseColProps: { span: 6 },
    labelAlign: 'right',
    submitOnReset: true,
  });

  const queryParams = ref({
    workType: '',
    workStatus: '',
    startTime: '',
    endTime: '',
    time: [],
    orgCode: '',
    level: '',
  });

  const onSearch = () => {
    initData();
  };
  async function resetForm() {
    await setFieldsValue({
      time: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')].join(','),
    });
    queryParams.value = {
      workType: '',
      workStatus: '',
      startTime: '',
      endTime: '',
      orgCode: '',
      level: '',
      time: [],
    };
    riskLevelpagination.value.current = 1;
    riskLevelpagination.value.pageSize = 10;
    initData();
  }

  // 图表
  const lineBarRef1 = ref<any>(null);
  const loading1 = ref(false);
  const lineBarRef2 = ref<any>(null);
  const loading2 = ref(false);
  const lineBarRef3 = ref<any>(null);
  const loading3 = ref(false);
  async function pageInit() {
    await setFieldsValue({
      time: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')].join(','),
    });
    initData();
  }

  const orgList = ref<any[]>([]);
  const initData = async () => {
    queryParams.value.startTime = getFieldsValue().time.split(',')[0];
    queryParams.value.endTime = getFieldsValue().time.split(',')[1];
    await lineBarInit1();
    await getTotalData();
    await lineBarInit2();
    await lineBarInit3();
    getData();
    getData2();
    getData3();
    getData4();
    getDepart3ListWithSecurity().then((res) => {
      orgList.value = res;
    });
  };
  const orgCode1 = ref(undefined);
  const orgCode2 = ref(undefined);
  const orgCode4 = ref(undefined);
  const orgCode3 = ref(undefined);
  // 所属单位 change事件
  const handleChange1 = () => {
    getData();
  };
  const handleChange2 = () => {
    getData2();
  };
  const handleChange3 = () => {
    getData3();
  };
  const handleChange4 = () => {
    getData4();
  };

  // 图表1按钮
  const btnClick = async (type, value) => {
    queryParams.value[type] = value;
    await lineBarInit1();
  };
  // 表格1按钮
  const btnClickTable = async (type, value) => {
    queryParams.value[type] = value;
    await getRiskWorkListData();
  };
  const oneData = ref<any>({});
  const riskLevelWorkList = ref<any[]>([]);
  const riskLevelpagination = ref<any>({
    total: 0,
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条数据`,
    pageSizeOptions: ['5', '10', '20', '50', '100'],
  });
  async function lineBarInit1() {
    loading1.value = true;
    let res = await getRiskWorkData(queryParams.value).finally(() => {
      loading1.value = false;
    });
    res.total = (res.totalOne || 0) + (res.totalTwo || 0) + (res.totalThree || 0);
    oneData.value = res;
    let max = computedMax(res.barData.levelOne, res.barData.levelTwo, res.barData.levelThree);
    lineBarRef1.value.initCharts({
      barWidth: 10,
      grid: {
        top: 40,
        left: 50,
        bottom: 70,
        right: 30,
      },
      xAxis: [
        {
          type: 'category',
          data: res.barData.orgCode,
          axisPointer: {
            type: 'shadow',
          },
          axisLabel: {
            interval: 0,
            rotate: 45,
            formatter: (params) => {
              var val = '';
              if (params.length > 4) {
                val = params.substr(0, 4) + '...';
                return val;
              } else {
                return params;
              }
            },
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: max,
          interval: max / 10,
        },
      ],
      series: [
        {
          name: '一级',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.barData.levelOne,
          color: '#ff4500',
        },
        {
          name: '二级',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.barData.levelTwo,
          color: '#ffa500',
        },
        {
          name: '三级',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.barData.levelThree,
          color: '#1890ff',
        },
      ],
    });
    await getRiskWorkListData();
  }
  const exportPlanExcel = () => {
    const fileName = '高危作业统计' + dayjs(new Date()).format('YYYY年MM月DD日') + '.xlsx';
    downloadFileAll('/workStatistics/getRiskWorkListExport', fileName, queryParams.value);
  };
  // 表格1数据
  const tableLoading = ref(false);
  async function getRiskWorkListData() {
    tableLoading.value = true;
    await getRiskWorkList({ ...queryParams.value, pageNo: riskLevelpagination.value.current, pageSize: riskLevelpagination.value.pageSize })
      .then((res) => {
        riskLevelWorkList.value = res.records;
        riskLevelpagination.value.total = res.total;
      })
      .finally(() => {
        tableLoading.value = false;
      });
  }
  // 表格1分页 change
  const handleTableChange = (pagination) => {
    riskLevelpagination.value.current = pagination.current;
    riskLevelpagination.value.pageSize = pagination.pageSize;
    getRiskWorkListData();
  };
  // 各单位危险作业总数统计
  const totalData = ref<any>({});
  const getTotalData = async () => {
    let res = await getDangerousDataNum({ startDate: queryParams.value.startTime, endDate: queryParams.value.endTime });
    totalData.value = res;
  };
  const color = ['#E53935', '#FB8C00', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0'];
  // 各单位危险作业类型统计
  async function lineBarInit2() {
    loading2.value = true;
    let res = await getWorkTypeData(queryParams.value).finally(() => {
      loading2.value = false;
    });
    let max = computedMax(res.levelOne, res.levelTwo, res.levelThree, res.levelFour, res.levelFive, res.levelSix, res.levelSeven, res.levelNine);
    lineBarRef2.value.initCharts({
      title: '各单位危险作业类型统计',
      barWidth: 10,
      xAxis: [
        {
          type: 'category',
          data: res.orgCode,
          axisPointer: {
            type: 'shadow',
          },
          axisLabel: {
            interval: 0,
            rotate: 45,
            formatter: (params) => {
              var val = '';
              if (params.length > 4) {
                val = params.substr(0, 4) + '...';
                return val;
              } else {
                return params;
              }
            },
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: max,
          interval: max / 10,
        },
      ],
      grid: {
        bottom: 80,
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 46,
          bottom: 40,
        },
        {
          type: 'inside',
          xAxisIndex: [0],
        },
      ],
      series: [
        {
          name: '高处作业',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.levelOne,
          color: '#2196F3',
        },
        {
          name: '有限空间作业',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.levelTwo,
          color: '#ed7d31',
        },
        {
          name: '动火作业',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.levelThree,
          color: '#E53935',
        },
        {
          name: '吊装作业',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.levelFour,
          color: '#4CAF50',
        },
        {
          name: '临时用电作业',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.levelFive,
          color: '#9C27B0',
        },
        {
          name: '停煤气作业',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.levelSix,
          color: '#FFC107',
        },
        {
          name: '送煤气作业',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.levelSeven,
          color: '#255e91',
        },
        {
          name: '其他',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.levelNine,
          color: '#607D8B',
        },
      ],
    });
  }
  async function lineBarInit3() {
    loading3.value = true;
    let res = await getWorkStatusData(queryParams.value).finally(() => {
      loading3.value = false;
    });
    let max = computedMax(res.levelOne, res.levelTwo, res.levelThree, res.levelFour, res.levelFive);
    lineBarRef3.value.initCharts({
      title: '各单位危险作业状态统计',
      barWidth: 10,
      xAxis: [
        {
          type: 'category',
          data: res.orgCode,
          axisPointer: {
            type: 'shadow',
          },
          axisLabel: {
            interval: 0,
            rotate: 45,
            formatter: (params) => {
              var val = '';
              if (params.length > 4) {
                val = params.substr(0, 4) + '...';
                return val;
              } else {
                return params;
              }
            },
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: max,
          interval: max / 10,
        },
      ],
      grid: {
        bottom: 80,
      },
      series: [
        {
          name: '审批中',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.levelOne,
          color: '#FFC107',
        },
        {
          name: '待作业',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.levelTwo,
          color: '#FB8C00',
        },
        {
          name: '作业中',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.levelThree,

          color: '#4CAF50',
        },
        {
          name: '作业中断',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.levelFour,

          color: '#E53935',
        },
        {
          name: '已验收',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
          },
          data: res.levelFive,
          color: '#2196F3',
        },
      ],
    });
  }

  const loading = ref(false);
  const levelData1 = ref([]);
  const levelData2 = ref([]);
  const levelData3 = ref([]);
  const listDesc = ref<any[]>([]);
  const desc1 = ref('');
  const desc2 = ref('');
  const desc3 = ref('');

  const remark = ref('');
  const remartTwo = ref('');
  const remartThree = ref('');
  // 一级高危
  async function getData() {
    loading.value = true;
    let res = await getDangerousData({
      startDate: queryParams.value.startTime,
      endDate: queryParams.value.endTime,
      orgCode: orgCode1.value,
    }).finally(() => {
      loading.value = false;
    });
    remark.value = res.remark;
    levelData1.value = res.list;
  }
  // 二级高危
  async function getData2() {
    loading.value = true;
    let res = await getDangerousData({
      startDate: queryParams.value.startTime,
      endDate: queryParams.value.endTime,
      orgCode: orgCode2.value,
    }).finally(() => {
      loading.value = false;
    });
    remartTwo.value = res.remarkTwo;
    levelData2.value = res.list;
  }
  // 三级高危
  async function getData4() {
    loading.value = true;
    let res = await getDangerousData({
      startDate: queryParams.value.startTime,
      endDate: queryParams.value.endTime,
      orgCode: orgCode4.value,
    }).finally(() => {
      loading.value = false;
    });
    remartThree.value = res.remarkThree;
    levelData3.value = res.list;
    console.log(levelData3.value,'22222');
  }
  const loading9 = ref(false);
  // 整改情况
  async function getData3() {
    loading9.value = true;
    let res = await getDangerousDesc({
      startDate: queryParams.value.startTime,
      endDate: queryParams.value.endTime,
      orgCode: orgCode3.value,
    }).finally(() => {
      loading9.value = false;
    });
    listDesc.value = res.listDesc;
    desc1.value = res.desc1;
    desc2.value = res.desc2;
    desc3.value = res.desc3;
  }
  /**
   * 比较两个百分数的大小
   * @param {string} percent1 第一个百分数（如 '30%'、'50.5%'）
   * @param {string} percent2 第二个百分数
   * @returns {number} 1（percent1大）、-1（percent2大）、0（相等）
   */
  function comparePercent(percent1, percent2) {
    // 提取数值并转换为数字（移除%，转为浮点数）
    if (!percent1) percent1 = '0%';
    const num1 = parseFloat(percent1.replace('%', ''));
    const num2 = parseFloat(percent2.replace('%', ''));

    // 处理无效值（如非百分数格式）
    if (isNaN(num1) || isNaN(num2)) {
      throw new Error('请输入有效的百分数（如 "30%"、"50.5%"）');
    }

    // 比较数值
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
    return 0;
  }
  function computedMax(...data: number[]) {
    let isolationMax = data.flat(Infinity).length > 0 ? Math.max(...data.flat(Infinity)) : 10;
    if (isolationMax === 0) isolationMax = 10;
    isolationMax = Math.ceil(isolationMax / 10) * 10;
    return isolationMax;
  }
  const exportIng = ref(false);
  const handleExport = async () => {
    const fileName = '高危作业-整改情况' + dayjs(new Date()).format('YYYY年MM月DD日') + '.xlsx';
    exportIng.value = true;
    await downloadFileAll('/workStatistics/exportDescData', fileName, queryParams.value);
    setTimeout(() => {
      exportIng.value = false;
    }, 300);
  };

  onMounted(() => {
    pageInit();
  });
</script>

<style lang="less" scoped>
  .dangerWork {
    height: 100%;
    padding: 10px;
    .header {
      padding-top: 16px;
      background-color: #fff;
    }
    .inner {
      margin-top: 16px;
      padding: 16px;
      background-color: #fff;
    }
    .chart {
      width: 100%;
      height: auto;
      position: relative;
      padding: 16px 0;
      border-bottom: 1px solid #bbbbbb;
      :deep(td) {
        padding: 5px 16px;
      }
      .tit {
        text-align: center;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 10px;
      }
      .hd {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .back-btn {
          margin-left: 10px;
          img {
            width: 25px;
          }
        }
        .left {
          height: 90px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .item {
          display: flex;
          height: 35px;
          align-items: center;
          .label {
            width: 80px;
            text-align: left;
          }
          .value {
            flex: 1;
          }
        }
        .table {
          border: 1px solid #e5e5e5;
          display: flex;
          height: 90px;
          align-items: center;
          justify-content: center;
          text-align: center;
          border-radius: 8px;
          .r-l {
            width: 80px;
            height: 90px;
            display: flex;
            flex-direction: column;
            span {
              height: 44px;
              line-height: 44px;
              color: #1890ff;
              font-size: 18px;
              font-weight: 600;
            }
            div {
              height: 45px;
              line-height: 45px;
              font-size: 18px;
              font-weight: 600;
              border-top: 1px solid #e5e5e5;
            }
          }

          ul {
            flex: auto;
            margin: 0;
            padding: 0;
            li {
              display: flex;
              height: 45px;
              line-height: 45px;
              span {
                width: 80px;
                flex: 1;
                border-left: 1px solid #e5e5e5;
              }
              span:nth-child(1) {
                color: orangered;
              }
              span:nth-child(2) {
                color: orange;
              }
              span:nth-child(3) {
                color: #1890ff;
              }
            }
            li:nth-child(1) {
              border-bottom: 1px solid #e5e5e5;
              span {
                font-size: 16px;
                font-weight: 600;
              }
            }
          }
        }
      }
      .table-d {
        width: 100%;
        margin-top: 10px;
      }
      .numbers {
        display: flex;
        justify-content: space-around;
        text-align: center;
        background-color: #ebf8fe;
        padding: 22px;
        border-radius: 8px;
        margin-bottom: 10px;
        h1 {
          font-size: 24px;
          font-weight: 600;
          color: #d9001b;
        }
        span {
          font-size: 14px;
          color: #666;
          margin-top: 10px;
        }
      }
      .hd-table {
        display: flex;
        justify-content: space-between;
        height: 55px;
        align-items: center;
        padding: 0 16px;
      }
    }
    .chart:nth-child(2) {
      .label {
        width: 100px !important;
      }
    }
    .gary {
    }
    .two-chart {
      display: flex;
      .left {
        width: 50%;
      }
      .right {
        width: 50%;
      }
    }
  }
  :deep(.shouldCheckNum) {
    background-color: rgba(255, 199, 199, 0.2);
  }
  :deep(.aqkShouldCheckNum) {
    background-color: rgba(167, 253, 218, 0.2);
  }
  :deep(.cjZrShouldCheckNum) {
    background-color: rgba(255, 221, 126, 0.2);
  }
  :deep(.aqkzShouldCheckNum) {
    background-color: rgba(83, 172, 249, 0.2);
  }
  :deep(.fbzShouldCheckNum) {
    background-color: rgba(186, 209, 96, 0.2);
  }
  :deep(.bzzShouldCheckNum) {
    background-color: rgba(186, 232, 204, 0.2);
  }
</style>
