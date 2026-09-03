<template>
  <div>
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="年份">
              <a-date-picker v-model:value="queryParam.yearDate" :format="monthFormat" picker="year" valueFormat="YYYY" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="月份/季度">
              <a-select v-model:value="queryParam.date" allowClear placeholder="请选择月份/季度">
                <template v-for="item in monthOptions" :key="`${item.value}`">
                  <a-select-option :value="item.value">{{ item.label }}</a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="12">
            <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
            <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <BasicTable @register="registerTable" size="small" :searchInfo="queryParam" />
  </div>
</template>
<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { BasicColumn, BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { defHttp } from '/@/utils/http/axios';
  import dayjs, { Dayjs } from 'dayjs';
  const monthFormat = 'YYYY';
  /**
   * 自定义查询条件相关配置
   */
  const labelCol = {
    xs: { span: 24 },
    sm: { span: 5 },
  };

  const wrapperCol = {
    xs: { span: 24 },
    sm: { span: 19 },
  };
  const getList = (params) => {
    return defHttp.get({ url: '/evaluationResultsStatistics/list', params });
  };
  const columns: BasicColumn[] = [
    {
      title: '单位',
      dataIndex: 'orgCode',
      width: 150,
      fixed: 'left',
    },
    {
      title: '厂部级',
      dataIndex: 'deptName',
      width: 100,
      children: [
        {
          title: '人数',
          dataIndex: 'cbNum',
          width: 100,
        },
        {
          title: '合格人数' + '(86分及以上)',
          dataIndex: 'postName',
          width: 100,
          children: [
            {
              title: '≥90分	',
              dataIndex: 'cbScoreOutweigh90',
              width: 100,
            },
            {
              title: '<90分',
              dataIndex: 'cbScoreOutweigh86',
              width: 100,
            },
          ],
        },
        {
          title: '基本合格人数\n(76-85分)',
          dataIndex: 'cbScoreOutweigh76',
          width: 100,
        },
        {
          title: '不合格人数' + '(75分以下)',
          dataIndex: 'cbScoreOutweigh85',
          width: 100,
          children: [
            {
              title: '一次',
              dataIndex: 'cbNotQualifiedNum',
              width: 100,
            },
            {
              title: '连续两次',
              dataIndex: 'cbNotQualifiedNumTwo',
              width: 100,
            },
          ],
        },
        {
          title: '合格率',
          dataIndex: 'cbQualifiedRate',
          width: 100,
        },
      ],
    },
    {
      title: '科级',
      dataIndex: 'deptName',
      width: 100,
      children: [
        {
          title: '人数',
          dataIndex: 'kjNum',
          width: 100,
        },
        {
          title: '合格人数' + '(86分及以上)',
          dataIndex: 'postName',
          width: 100,
          children: [
            {
              title: '≥90分	',
              dataIndex: 'kjScoreOutweigh90',
              width: 100,
            },
            {
              title: '<90分',
              dataIndex: 'kjScoreOutweigh86',
              width: 100,
            },
          ],
        },
        {
          title: '基本合格人数(76-85分)',
          dataIndex: 'kjScoreOutweigh76',
          width: 100,
        },
        {
          title: '不合格人数' + '(75分以下)',
          dataIndex: 'kjScoreOutweigh85',
          width: 100,
          children: [
            {
              title: '一次',
              dataIndex: 'kjNotQualifiedNum',
              width: 100,
            },
            {
              title: '连续两次',
              dataIndex: 'kjNotQualifiedNumTwo',
              width: 100,
            },
          ],
        },
        {
          title: '合格率',
          dataIndex: 'kjQualifiedRate',
          width: 100,
        },
      ],
    },
    {
      title: '班组级',
      dataIndex: 'deptName',
      width: 100,
      children: [
        {
          title: '人数',
          dataIndex: 'bzjNum',
          width: 100,
        },
        {
          title: '合格人数' + '(86分及以上)',
          dataIndex: 'postName',
          width: 100,
          children: [
            {
              title: '≥90分	',
              dataIndex: 'bzjScoreOutweigh90',
              width: 100,
            },
            {
              title: '<90分',
              dataIndex: 'bzjScoreOutweigh86',
              width: 100,
            },
          ],
        },
        {
          title: '基本合格人数(76-85分)',
          dataIndex: 'bzjScoreOutweigh76',
          width: 100,
        },
        {
          title: '不合格人数' + '(75分以下)',
          dataIndex: 'bzjScoreOutweigh85',
          width: 150,
          children: [
            {
              title: '一次',
              dataIndex: 'bzjNotQualifiedNum',
              width: 150,
            },
            {
              title: '连续两次',
              dataIndex: 'bzjNotQualifiedNumTwo',
              width: 150,
            },
          ],
        },
        {
          title: '合格率',
          dataIndex: 'bzjQualifiedRate',
          width: 100,
        },
      ],
    },
    {
      title: '岗位级',
      dataIndex: 'deptName',
      width: 100,
      children: [
        {
          title: '人数',
          dataIndex: 'gwjNum',
          width: 100,
        },
        {
          title: '合格人数' + '(86分及以上)',
          dataIndex: 'postName',
          width: 100,
          children: [
            {
              title: '≥90分	',
              dataIndex: 'gwjScoreOutweigh90',
              width: 100,
            },
            {
              title: '<90分',
              dataIndex: 'gwjScoreOutweigh86',
              width: 100,
            },
          ],
        },
        {
          title: '基本合格人数(76-85分)',
          dataIndex: 'gwjScoreOutweigh76',
          width: 100,
        },
        {
          title: '不合格人数' + '(75分以下)',
          dataIndex: 'gwjScoreOutweigh85',
          width: 100,
          children: [
            {
              title: '一次',
              dataIndex: 'gwjNotQualifiedNum',
              width: 100,
            },
            {
              title: '连续两次',
              dataIndex: 'gwjNotQualifiedNumTwo',
              width: 100,
            },
          ],
        },
        {
          title: '合格率',
          dataIndex: 'gwjQualifiedRate',
          width: 100,
        },
      ],
    },
    {
      title: '合计',
      dataIndex: 'deptName',
      width: 100,
      children: [
        {
          title: '人数',
          dataIndex: 'hjNum',
          width: 100,
        },
        {
          title: '合格人数' + '(86分及以上)',
          dataIndex: 'postName',
          width: 100,
          children: [
            {
              title: '≥90分	',
              dataIndex: 'hjScoreOutweigh90',
              width: 100,
            },
            {
              title: '<90分',
              dataIndex: 'hjScoreOutweigh86',
              width: 100,
            },
          ],
        },
        {
          title: '基本合格人数(76-85分)',
          dataIndex: 'hjScoreOutweigh76',
          width: 100,
        },
        {
          title: '不合格人数' + '(75分以下)',
          dataIndex: 'hjScoreOutweigh85',
          width: 100,
          children: [
            {
              title: '一次',
              dataIndex: 'hjNotQualifiedNum',
              width: 100,
            },
            {
              title: '连续两次',
              dataIndex: 'hjNotQualifiedNumTwo',
              width: 100,
            },
          ],
        },
        {
          title: '合格率',
          dataIndex: 'hjQualifiedRate',
          width: 100,
        },
      ],
    },
  ];
  const { tableContext } = useListPage({
    designScope: 'dual-statistics-list',
    tableProps: {
      title: '',
      api: getList,
      columns: columns,
      pagination: false,
      useSearchForm: false, // 禁用默认搜索表单
      showIndexColumn: true, // 已在columns中定义序号列
      showActionColumn: false,
    },
  });

  const [registerTable, { reload }] = tableContext;
  const queryParam = reactive({
    //默认今年
    yearDate: ref<Dayjs>(dayjs()),
    year: 0,
    date: '1月',
  });

  /**
   * 执行查询
   */
  function searchQuery() {
    if (queryParam.yearDate && typeof queryParam.yearDate.year === 'function') {
      queryParam.year = Number(String(queryParam.yearDate.year()));
    } else {
      // 如果没有选择年份，可以设置为当前年份或者提示用户选择
      queryParam.year = Number(queryParam.yearDate);
    }
    reload();
  }
  function searchReset() {
    queryParam.yearDate = dayjs(); // 重置为当前日期
    queryParam.year = dayjs().year();
    queryParam.date = '1月';
  }
  const monthOptions = [
    {
      label: '1月',
      value: '1月',
    },
    {
      label: '2月',
      value: '2月',
    },
    {
      label: '3月',
      value: '3月',
    },
    {
      label: '4月',
      value: '4月',
    },
    {
      label: '5月',
      value: '5月',
    },
    {
      label: '6月',
      value: '6月',
    },
    {
      label: '7月',
      value: '7月',
    },
    {
      label: '8月',
      value: '8月',
    },
    {
      label: '9月',
      value: '9月',
    },
    {
      label: '10月',
      value: '10月',
    },
    {
      label: '11月',
      value: '11月',
    },
    {
      label: '12月',
      value: '12月',
    },
    {
      label: '第一季度',
      value: '第一季度',
    },
    {
      label: '第二季度',
      value: '第二季度',
    },
    {
      label: '第三季度',
      value: '第三季度',
    },
    {
      label: '第四季度',
      value: '第四季度',
    },
  ];
</script>
<style scoped lang="less"></style>
