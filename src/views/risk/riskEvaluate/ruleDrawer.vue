<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    title="具体规则"
    :width="1200"
    show-footer
    :show-ok-btn="false"
    destroyOnClose
    :zIndex="1002"
  >
    <div class="nav">事故或危险情况发生可能性（L）判定标准</div>
    <a-table :columns="columnsL" :data-source="dataSourceL" :pagination="false" bordered />
    <div class="nav">人员暴露于危险环境的频繁程度（E）判别标准</div>
    <a-table :columns="columnsE" :data-source="dataSourceE" :pagination="false" bordered />
    <div class="nav">发生事故事件偏差产生的后果严重性（C）判定准则</div>
    <a-table :columns="columnsC" :data-source="dataSourceC" :pagination="false" bordered />
    <div class="nav">风险等级判定准则（D）及控制措施 （LEC法）</div>
    <a-table :columns="columnsD" :data-source="dataSourceD" :pagination="false" bordered />
  </BasicDrawer>
</template>
<script lang="ts" name="riskEvaluate-rule-drawer" setup>
  import { BasicDrawer, useDrawer } from '/@/components/Drawer';
  const [registerDrawer] = useDrawer();
  const columnsL = [
    { title: '分值', dataIndex: 'number', align: 'center', width: 80 },
    { title: '事故、事件或偏差发生的可能性', dataIndex: 'desc' },
  ];
  const dataSourceL = [
    { number: '10', desc: '完全可以预料。' },
    {
      number: '6',
      desc: '相当可能；或危害的发生不能被发现（没有监测系统）；或在现场没有采取防范、监测、保护、控制措施；或在正常情况下经常发生此类事故、事件或偏差',
    },
    {
      number: '3',
      desc: '可能，但不经常；或危害的发生不容易被发现；现场没有检测系统或保护措施（如没有保护罩盖、没有个人防护用品等），也未付过任何监测；或未严格按操作规程执行；或在现场有控制措施，但未有效执行或控制措施不当；或在现场措施执行不久失效',
    },
    {
      number: '1',
      desc: '可能性低，完全意外；或危害的发生容易被发现；现场有监测系统或曾经作过监测；或过去曾经发生类似事故、事件或偏差；或在异常情况下发生过类似事故、事件或偏差',
    },
    { number: '0.5', desc: '很不可能，可以设想；危害一旦发生能及时发现，并能定期进行监测' },
    { number: '0.2', desc: '极不可能：有充分、有效的防范、控制、监测、保护措施；或员工安全卫生意识相当高，严格执行操作规程' },
    { number: '0.1', desc: '实际上不可能' },
  ];
  const columnsE = [
    { title: '分值', dataIndex: 'number', align: 'center', width: 80 },
    { title: '频繁程度', dataIndex: 'desc' },
    { title: '分值', dataIndex: 'number2', align: 'center', width: 80 },
    { title: '频繁程度', dataIndex: 'desc2' },
  ];
  const dataSourceE = [
    { number: '10', desc: '连续暴露（t>5小时）', number2: '2', desc2: '每月一次暴露（0.5小时≤t<1小时）' },
    { number: '6', desc: '每天工作时间内暴露（2小时≤t≤5小时）', number2: '1', desc2: '每年几次暴露（10分钟≤t≤0.5小时）' },
    { number: '3', desc: '每周一次或偶然暴露（1小时≤t≤2小时）', number2: '0.5', desc2: '非常罕见地暴露（≤10分钟）' },
  ];
  const columnsC = [
    { title: '分值', dataIndex: 'number', align: 'center', width: 80 },
    { title: '法律法规及其他要求', dataIndex: 'law' },
    { title: '人员伤亡', dataIndex: 'injury' },
    { title: '直接经济损失', dataIndex: 'loss' },
    { title: '停工', dataIndex: 'stop' },
    { title: '公司形象', dataIndex: 'image' },
  ];
  const dataSourceC = [
    {
      number: '100',
      law: '严重违反法律法规和标准',
      injury: '2人及以上死亡，或3人及以上重伤',
      loss: '1000万元以上',
      stop: '公司停产',
      image: '重大国际、国内影响',
    },
    { number: '40', law: '违反法律法规和标准', injury: '1人死亡，或2-3人重伤', loss: '500万元以上', stop: '装置停工', image: '行业内、省内影响' },
    { number: '15', law: '潜在违反法律法规和标准', injury: '1人重伤，或2-3人轻伤', loss: '100万元以上', stop: '部分装置停工', image: '地区影响' },
    {
      number: '7',
      law: '不符合级或行业的安全方针、制度、规定等',
      injury: '人次受伤',
      loss: '10万元以上',
      stop: '部分设备停工',
      image: '公司及周边范围',
    },
    {
      number: '2',
      law: '不符合公司的安全操作程序、规定',
      injury: '轻微伤',
      loss: '1万元以上',
      stop: '1套设备停工',
      image: '引人关注，不利于基本的安全卫生要求',
    },
    { number: '1', law: '完全符合', injury: '需要救护', loss: '1万元以下', stop: '没有停工', image: '形象没有受损' },
  ];
  const columnsD = [
    { title: '风险值', dataIndex: 'value', align: 'center', width: 100 },
    {
      title: '风险等级',
      dataIndex: 'level',
    },
    { title: '应采取的行动/控制措施', dataIndex: 'action' },
    {
      title: '管控层级',
      align: 'center',
      children: [
        {
          title: '厂部',
          align: 'center',
          dataIndex: 'gs',
        },
        {
          title: '车间',
          align: 'center',
          dataIndex: 'fc',
        },
        {
          title: '班组',
          align: 'center',
          dataIndex: 'cj',
        },
        {
          title: '岗位',
          align: 'center',
          dataIndex: 'bz',
        },
      ],
    },
  ];
  const dataSourceD = [
    {
      value: '>320',
      level: '重大风险/极其危险',
      action: '在采取措施降低危险前，不能继续作业,对改进措施进行评估',
      gs: '√',
      fc: '√',
      cj: '√',
      bz: '√',
    },
    {
      value: '160~320',
      level: '较大风险/高度危险',
      action: '采取紧急措施降低危险，建议运行控制程序，定期检查，测量及评估',
      gs: '',
      fc: '√',
      cj: '√',
      bz: '√',
    },
    { value: '70~160', level: '一般风险/显著危险', action: '可考虑建立目标，建立操作规程，加强培训及沟通', gs: '', fc: '', cj: '√', bz: '√' },
    { value: '<70', level: '低风险/轻度危险', action: '可考虑建立操作规程，作业指导书，但需定期检查', gs: '', fc: '', cj: '', bz: '√' },
  ];
</script>
<style lang="less" scoped>
  .nav {
    cursor: pointer;
    line-height: 40px;
    color: #1890ff;
    margin: 15px 0;
    font-size: 18px;
  }
</style>
