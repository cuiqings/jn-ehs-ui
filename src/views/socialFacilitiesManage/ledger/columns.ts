// 灭火器
export const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '所属单位', dataIndex: 'orgName', key: 'orgName', width: 150, align: 'center', ellipsis: true },
  { title: '所属车间', dataIndex: 'departName', key: 'departName', width: 150, align: 'center', ellipsis: true },
  { title: '岗位', dataIndex: 'post', key: 'post', width: 150, align: 'center', ellipsis: true },
  { title: '灭火器型号', dataIndex: 'model', key: 'model', width: 150, align: 'center', ellipsis: true },
  { title: '数量（具）', dataIndex: 'quantity', key: 'quantity', width: 150, align: 'center', ellipsis: true },
  { title: '状况', dataIndex: 'status', key: 'status', width: 150, align: 'center', ellipsis: true },
  {
    title: '下次检验日期',
    dataIndex: 'maintenanceDate',
    key: 'maintenanceDate',
    width: 150,
    align: 'center',
    ellipsis: true,
  },
  { title: '责任人', dataIndex: 'principalName', key: 'principalName', width: 200, align: 'center', ellipsis: true },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 200, align: 'center', ellipsis: true },
  {
    title: '检验状态',
    dataIndex: 'checkStatus',
    key: 'checkStatus',
    width: 150,
    align: 'center',
  },
  { title: '操作', key: 'action', width: 200, align: 'center', fixed: 'right' },
];
// 消防栓
export const columns1 = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '所属单位', dataIndex: 'orgName', key: 'orgName', width: 150, align: 'center', ellipsis: true },
  { title: '所属车间', dataIndex: 'departName', key: 'departName', width: 150, align: 'center', ellipsis: true },
  { title: '岗位', dataIndex: 'post', key: 'post', width: 150, align: 'center', ellipsis: true },
  { title: '名称', dataIndex: 'name', key: 'name', width: 150, align: 'center', ellipsis: true },
  { title: '型号', dataIndex: 'model', key: 'model', width: 150, align: 'center', ellipsis: true },
  { title: '数量（具）', dataIndex: 'quantity', key: 'quantity', width: 150, align: 'center', ellipsis: true },
  { title: '存放地点', dataIndex: 'location', key: 'location', width: 150, align: 'center', ellipsis: true },
  { title: '状况', dataIndex: 'status', key: 'status', width: 150, align: 'center', ellipsis: true },
  { title: '责任人', dataIndex: 'principalName', key: 'principalName', width: 200, align: 'center', ellipsis: true },
  {
    title: '室内/室外',
    dataIndex: 'indoorOrOutdoor',
    key: 'indoorOrOutdoor',
    width: 150,
    align: 'center',
    ellipsis: true,
  },
  { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right' },
];
// 消防泵
export const columns2 = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '所属单位', dataIndex: 'orgName', key: 'orgName', width: 150, align: 'center', ellipsis: true },
  { title: '所属车间', dataIndex: 'departName', key: 'departName', width: 150, align: 'center', ellipsis: true },
  { title: '岗位', dataIndex: 'post', key: 'post', width: 150, align: 'center', ellipsis: true },
  { title: '消防设施名称', dataIndex: 'name', key: 'name', width: 150, align: 'center', ellipsis: true },
  { title: '规格型号', dataIndex: 'model', key: 'model', width: 150, align: 'center', ellipsis: true },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 150, align: 'center', ellipsis: true },
  { title: '存放地点', dataIndex: 'location', key: 'location', width: 150, align: 'center', ellipsis: true },
  { title: '所在位置', dataIndex: 'position', key: 'position', width: 150, align: 'center', ellipsis: true },
  { title: '责任人', dataIndex: 'principalName', key: 'principalName', width: 200, align: 'center', ellipsis: true },
  { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right' },
];
// 绝缘工具
export const columns3 = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '所属单位', dataIndex: 'orgName', key: 'orgName', width: 150, align: 'center', ellipsis: true },
  { title: '所属车间', dataIndex: 'departName', key: 'departName', width: 150, align: 'center', ellipsis: true },
  { title: '工具名称', dataIndex: 'name', key: 'name', width: 150, align: 'center', ellipsis: true },
  { title: '单位', dataIndex: 'unit', key: 'unit', width: 150, align: 'center', ellipsis: true },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 150, align: 'center', ellipsis: true },
  { title: '存放地点', dataIndex: 'location', key: 'location', width: 150, align: 'center', ellipsis: true },
  {
    title: '检验到期时间',
    dataIndex: 'maintenanceDate',
    key: 'maintenanceDate',
    width: 150,
    align: 'center',
    ellipsis: true,
  },
  {
    title: '检验状态',
    dataIndex: 'checkStatus',
    key: 'checkStatus',
    width: 150,
    align: 'center',
  },
  { title: '操作', key: 'action', width: 200, align: 'center', fixed: 'right' },
];
// 防雷检测点位台账
export const columns4 = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '所属单位', dataIndex: 'orgName', key: 'orgName', width: 150, align: 'center', ellipsis: true },
  { title: '所属车间', dataIndex: 'departName', key: 'departName', width: 150, align: 'center', ellipsis: true },
  { title: '检测地点', dataIndex: 'position', key: 'position', width: 150, align: 'center', ellipsis: true },
  {
    title: '设备设施',
    dataIndex: 'equipmentFacilities',
    key: 'equipmentFacilities',
    width: 150,
    align: 'center',
    ellipsis: true,
  },
  { title: '点位数量', dataIndex: 'quantity', key: 'quantity', width: 150, align: 'center', ellipsis: true },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 200, align: 'center', ellipsis: true },
  { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right' },
];
// 煤气设施切割装置台账
export const columns5 = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '所属单位', dataIndex: 'orgName', key: 'orgName', align: 'center', ellipsis: true },
  { title: '所属车间', dataIndex: 'departName', key: 'departName', align: 'center', ellipsis: true },
  { title: '设备设施', dataIndex: 'equipmentFacilities', key: 'equipmentFacilities', align: 'center', ellipsis: true },
  {
    title: '一级切断阀位置',
    dataIndex: 'shutOffValvePosition1',
    key: 'shutOffValvePosition1',
    align: 'center',
    ellipsis: true,
  },
  {
    title: '二级切断阀位置',
    dataIndex: 'shutOffValvePosition2',
    key: 'shutOffValvePosition2',
    align: 'center',
    ellipsis: true,
  },
  { title: '切断阀编号', dataIndex: 'code', key: 'code', align: 'center', ellipsis: true },
  { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right' },
];
// 能源隔离点位台账
export const columns6 = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '所属单位', dataIndex: 'orgName', key: 'orgName', align: 'center', width: 150, ellipsis: true },
  { title: '所属车间', dataIndex: 'departName', key: 'departName', align: 'center', width: 150, ellipsis: true },
  { title: '区域', dataIndex: 'region', key: 'region', align: 'center', width: 150, ellipsis: true },
  {
    title: '设备设施',
    dataIndex: 'equipmentFacilities',
    key: 'equipmentFacilities',
    align: 'center',
    width: 150,
    ellipsis: true,
  },
  {
    title: '作业指导书',
    dataIndex: 'workingInstruction',
    key: 'workingInstruction',
    align: 'center',
    width: 150,
    ellipsis: true,
  },
  {
    title: '隔离点位名称',
    dataIndex: 'quarantineSiteName',
    key: 'quarantineSiteName',
    align: 'center',
    width: 150,
    ellipsis: true,
  },
  {
    title: '能源介质类型',
    dataIndex: 'energyMediumType_dictText',
    key: 'energyMediumType_dictText',
    align: 'center',
    width: 150,
    ellipsis: true,
  },
  { title: '位置', dataIndex: 'position', key: 'position', align: 'center', width: 150, ellipsis: true },
  { title: '能源隔离点编号', dataIndex: 'code', key: 'code', align: 'center', width: 150, ellipsis: true },
  { title: '备注', dataIndex: 'remark', key: 'remark', align: 'center', width: 200, ellipsis: true },
  { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right' },
];
// 空气呼吸器|苏生器台账
export const columns7 = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '所属单位', dataIndex: 'orgName', key: 'orgName', align: 'center', width: 150, ellipsis: true },
  { title: '所属车间', dataIndex: 'departName', key: 'departName', align: 'center', width: 150, ellipsis: true },
  { title: '名称', dataIndex: 'name', key: 'name', align: 'center', width: 150, ellipsis: true },
  { title: '型号', dataIndex: 'model', key: 'model', align: 'center', width: 150, ellipsis: true },
  { title: '生产厂家', dataIndex: 'manufacturer', key: 'manufacturer', align: 'center', width: 150, ellipsis: true },
  { title: '配置时间', dataIndex: 'configTime', key: 'configTime', align: 'center', width: 150, ellipsis: true },
  { title: '放置岗位', dataIndex: 'post', key: 'post', align: 'center', width: 150, ellipsis: true },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', align: 'center', width: 150, ellipsis: true },
  { title: '责任人', dataIndex: 'principalName', key: 'principalName', width: 200, align: 'center', ellipsis: true },
  { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right' },
];
// 长管呼吸器
export const columns8 = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '所属单位', dataIndex: 'orgName', key: 'orgName', align: 'center', width: 150, ellipsis: true },
  { title: '所属车间', dataIndex: 'departName', key: 'departName', align: 'center', width: 150, ellipsis: true },
  { title: '名称', dataIndex: 'name', key: 'name', align: 'center', width: 150, ellipsis: true },
  { title: '型号', dataIndex: 'model', key: 'model', align: 'center', width: 150, ellipsis: true },
  { title: '生产厂家', dataIndex: 'manufacturer', key: 'manufacturer', align: 'center', width: 150, ellipsis: true },
  { title: '放置位置', dataIndex: 'location', key: 'location', align: 'center', width: 150, ellipsis: true },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', align: 'center', width: 150, ellipsis: true },
  { title: '责任人', dataIndex: 'principalName', key: 'principalName', width: 200, align: 'center', ellipsis: true },
  { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right' },
];
// 担架台账
export const columns10 = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '所属单位', dataIndex: 'orgName', key: 'orgName', align: 'center', width: 150, ellipsis: true },
  { title: '所属车间', dataIndex: 'departName', key: 'departName', align: 'center', width: 150, ellipsis: true },
  { title: '名称', dataIndex: 'name', key: 'name', align: 'center', width: 150, ellipsis: true },
  { title: '型号', dataIndex: 'model', key: 'model', align: 'center', width: 150, ellipsis: true },
  { title: '配置时间', dataIndex: 'configTime', key: 'configTime', align: 'center', width: 150, ellipsis: true },
  { title: '放置岗位', dataIndex: 'post', key: 'post', align: 'center', width: 150, ellipsis: true },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', align: 'center', width: 150, ellipsis: true },
  { title: '责任人', dataIndex: 'principalName', key: 'principalName', width: 200, align: 'center', ellipsis: true },
  { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right' },
];
// 空气充填泵|防爆手电|模拟人
export const columns11 = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '所属单位', dataIndex: 'orgName', key: 'orgName', align: 'center', width: 150, ellipsis: true },
  { title: '所属车间', dataIndex: 'departName', key: 'departName', align: 'center', width: 150, ellipsis: true },
  { title: '名称', dataIndex: 'name', key: 'name', align: 'center', width: 150, ellipsis: true },
  { title: '型号', dataIndex: 'model', key: 'model', align: 'center', width: 150, ellipsis: true },
  { title: '生产厂家', dataIndex: 'manufacturer', key: 'manufacturer', align: 'center', width: 150, ellipsis: true },
  { title: '配置时间', dataIndex: 'configTime', key: 'configTime', align: 'center', width: 150, ellipsis: true },
  { title: '放置岗位', dataIndex: 'post', key: 'post', align: 'center', width: 150, ellipsis: true },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', align: 'center', width: 150, ellipsis: true },
  { title: '责任人', dataIndex: 'principalName', key: 'principalName', width: 200, align: 'center', ellipsis: true },
  { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right' },
];
// 煤气脱水器台账
export const columns12 = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '所属单位', dataIndex: 'orgName', key: 'orgName', align: 'center', width: 150, ellipsis: true },
  { title: '所属车间', dataIndex: 'departName', key: 'departName', align: 'center', width: 150, ellipsis: true },
  { title: '脱水器编号', dataIndex: 'code', key: 'code', align: 'center', width: 150, ellipsis: true },
  { title: '安装位置', dataIndex: 'position', key: 'position', align: 'center', width: 150, ellipsis: true },
  { title: '安装时间', dataIndex: 'configTime', key: 'configTime', align: 'center', width: 150, ellipsis: true },
  { title: '生产厂家', dataIndex: 'manufacturer', key: 'manufacturer', align: 'center', width: 150, ellipsis: true },
  {
    title: '介质管道',
    dataIndex: 'mediumPipeline',
    key: 'mediumPipeline',
    align: 'center',
    width: 150,
    ellipsis: true,
  },
  {
    title: '伴热',
    dataIndex: 'tracing_dictText',
    key: 'tracing_dictText',
    align: 'center',
    width: 150,
    ellipsis: true,
  },
  { title: '操作', key: 'action', width: 120, align: 'center', fixed: 'right' },
];
// 三同时台账
export const columns13 = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '建设单位', dataIndex: 'orgName', key: 'orgName', align: 'center', ellipsis: true },
  { title: '建设项目', dataIndex: 'constructProject', key: 'constructProject', align: 'center', ellipsis: true },
  { title: '预评价编写单位', dataIndex: 'preEvaluateUnit', key: 'preEvaluateUnit', align: 'center', ellipsis: true },
  { title: '设计单位', dataIndex: 'designUnit', key: 'designUnit', align: 'center', ellipsis: true },
  { title: '验收单位', dataIndex: 'checkUnit', key: 'checkUnit', align: 'center', ellipsis: true },
  { title: '操作', key: 'action', width: 200, align: 'center', fixed: 'right' },
];
// 设备设施检维修计划
export const columns15 = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '所属单位', dataIndex: 'orgName', key: 'orgName', align: 'center', ellipsis: true },
  { title: '所属车间', dataIndex: 'departName', key: 'departName', align: 'center', ellipsis: true },
  { title: '设备设施', dataIndex: 'equipmentFacilities', key: 'equipmentFacilities', align: 'center', ellipsis: true },
  { title: '检维修计划', dataIndex: 'attachment', key: 'attachment', align: 'center', ellipsis: true },
  { title: '操作', key: 'action', width: 160, align: 'center', fixed: 'right' },
];
// 设备设施检验合格资料
export const columns18 = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '所属单位', dataIndex: 'orgName', key: 'orgName', align: 'center', ellipsis: true },
  { title: '所属车间', dataIndex: 'departName', key: 'departName', align: 'center', ellipsis: true },
  { title: '设备设施', dataIndex: 'equipmentFacilities', key: 'equipmentFacilities', align: 'center', ellipsis: true },
  { title: '检验合格资料', dataIndex: 'attachment', key: 'attachment', align: 'center', ellipsis: true },
  { title: '操作', key: 'action', width: 160, align: 'center', fixed: 'right' },
];
// 设备设施拆除报废记录
export const columns19 = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center', fixed: 'left' },
  { title: '所属单位', dataIndex: 'orgName', key: 'orgName', align: 'center', ellipsis: true },
  { title: '所属车间', dataIndex: 'departName', key: 'departName', align: 'center', ellipsis: true },
  { title: '设备设施', dataIndex: 'equipmentFacilities', key: 'equipmentFacilities', align: 'center', ellipsis: true },
  { title: '拆除报废记录', dataIndex: 'attachment', key: 'attachment', align: 'center', ellipsis: true },
  { title: '操作', key: 'action', width: 160, align: 'center', fixed: 'right' },
];
