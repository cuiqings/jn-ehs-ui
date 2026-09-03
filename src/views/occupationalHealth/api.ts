import { defHttp } from '/@/utils/http/axios';
enum Api {
  // 监护档案
  archivesPageList= '/archives/pageList',
  archivesDetail = '/archives/detail',
  archivesAdd = '/archives/add',
  archivesEdit = '/archives/edit',
  detectionEntry = '/archives/detectionEntry',
  addPhysicalExamination = '/archives/addPhysicalExamination',
  archivesDel = '/archives/delete',
  fileStatistics = '/archives/statistics',
  detectionEntryImport = '/archives/detectionEntryImport',
  detectionEntryUpd = '/archives/detectionEntryUpd',
  detectionEntryDel = '/archives/detectionEntryDel',
  updateStatusFc = '/archives/updateStatusFc',
  //职业健康体检
  physicalExaminationList = '/physicalExamination/pageList',
  physicalExaminationDetail = '/physicalExamination/detail',
  physicalExaminationInfo = '/physicalExamination/info',
  physicalExaminationDel = '/physicalExamination/delete',
  physicalExaminationEdit = '/physicalExamination/edit',
  physicalExaminationUpd = '/physicalExamination/upd',
  physicalExaminationSave = '/physicalExamination/save',
  physicalExaminationStatistics = '/physicalExamination/statistics',
  deleteReport = '/physicalExamination/deleteReport',
  updState = '/physicalExamination/updState',
  // 体检周期
  hazardFactors = '/hazardFactors/getList',
  // 检测文件
  fileList = '/detectFile/pageList',
  fileAdd = '/detectFile/add',
  fileEdit = '/detectFile/edit',
  fileDel = '/detectFile/delete',
  //评价报告
  evaluateList = '/evaluationReport/pageList',
  evaluateAdd = '/evaluationReport/add',
  evaluateEdit = '/evaluationReport/edit',
  evaluateDel = '/evaluationReport/delete',
  // 职业禁忌症
  tabooList = '/contraindications/pageList',
  tabooAdd = '/contraindications/add',
  tabooEdit = '/contraindications/edit',
  tabooDel = '/contraindications/delete',
  // 统计
  statisticsList = '/healthStatistics/pageList',
  statistics = '/healthStatistics/statistics'
}

// 物资管理
export const archivesPageList = (params) => {
  return defHttp.get({ url: Api.archivesPageList, params });
};
export const archivesDetail = (params) => {
  return defHttp.get({ url: Api.archivesDetail, params });
};
export const archivesAdd = (params) => {
  return defHttp.post({ url: Api.archivesAdd, params });
};
export const archivesEdit = (params) => {
  return defHttp.post({ url: Api.archivesEdit, params });
};
export const detectionEntry = (params) => {
  return defHttp.post({ url: Api.detectionEntry, params });
};
export const updateStatusFc = (params) => {
  return defHttp.post({ url: Api.updateStatusFc, params });
};
export const updState = (params) => {
  return defHttp.post({ url: Api.updState, params });
};
export const addPhysicalExamination = (params) => {
  return defHttp.post({ url: Api.addPhysicalExamination, params });
};
export const hazardFactors = () => {
  return defHttp.get({ url: Api.hazardFactors });
};
export const physicalExaminationList = (params) => {
  return defHttp.get({ url: Api.physicalExaminationList, params });
}
export const physicalExaminationDetail = (params) => {
  return defHttp.get({ url: Api.physicalExaminationDetail, params });
}
export const physicalExaminationDel = (params) => {
  return defHttp.post({ url: Api.physicalExaminationDel, params });
};
export const deleteReport = (params) => {
  return defHttp.get({ url: Api.deleteReport, params });
};
export const detectionEntryDel = (params) => {
  return defHttp.get({ url: Api.detectionEntryDel, params });
};
export const detectionEntryUpd = (params) => {
  return defHttp.post({ url: Api.detectionEntryUpd, params });
};
export const physicalExaminationEdit = (params) => {
  return defHttp.post({ url: Api.physicalExaminationEdit, params });
};
export const physicalExaminationUpd = (params) => {
  return defHttp.post({ url: Api.physicalExaminationUpd, params });
};
export const physicalExaminationSave = (params) => {
  return defHttp.post({ url: Api.physicalExaminationSave, params });
};
export const physicalExaminationInfo = (params) => {
  return defHttp.get({ url: Api.physicalExaminationInfo, params });
};
export const fileList = (params) => {
  return defHttp.get({ url: Api.fileList, params });
};
export const fileAdd = (params) => {
  return defHttp.post({ url: Api.fileAdd, params });
};
export const fileEdit = (params) => {
  return defHttp.post({ url: Api.fileEdit, params });
};
export const fileDel = (params) => {
  return defHttp.post({ url: Api.fileDel, params });
};
export const evaluateList = (params) => {
  return defHttp.get({ url: Api.evaluateList, params });
};
export const evaluateAdd = (params) => {
  return defHttp.post({ url: Api.evaluateAdd, params });
};
export const evaluateEdit = (params) => {
  return defHttp.post({ url: Api.evaluateEdit, params });
};
export const evaluateDel = (params) => {
  return defHttp.post({ url: Api.evaluateDel, params });
};
export const tabooList = (params) => {
  return defHttp.get({ url: Api.tabooList, params });
};
export const tabooAdd = (params) => {
  return defHttp.post({ url: Api.tabooAdd, params });
};

export const tabooEdit = (params) => {
  return defHttp.post({ url: Api.tabooEdit, params });
};
export const tabooDel = (params) => {
  return defHttp.post({ url: Api.tabooDel, params });
};

export const archivesDel = (params) => {
  return defHttp.post({ url: Api.archivesDel, params });
};

export const fileStatistics = (params) => {
  return defHttp.get({ url: Api.fileStatistics, params });
};
export const detectionEntryImport = (params) => {
  return defHttp.post({ url: Api.detectionEntryImport, params });
};
export const physicalExaminationStatistics = (params) => {
  return defHttp.get({ url: Api.physicalExaminationStatistics, params });
};
export const statisticsList = (params) => {
  return defHttp.get({ url: Api.statisticsList, params });
};
export const statistics = (params) => {
  return defHttp.get({ url: Api.statistics, params });
};
