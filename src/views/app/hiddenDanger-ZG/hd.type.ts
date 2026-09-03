export interface RcFormData {
    yhLevel: string | number, // 隐患等级
    yhLevelLabel?: string,
    checkHierarchy: string | number, // 检查层级
    yhType: string | number, // 隐患类型
    yhTypeLabel?: string,
    handleMeans: string, // 防控手段
    handleMeansLabel?: string,
    yhPlace: string, // 隐患地点编号
    yhPlaceName?: string, // 隐患地点名称
    riskPoint: string, // 风险点
    riskPointName?: string,
    repairResult: string, // 整改情况
    tempMeasure: string, // 临时措施
    repairDate: string, // 限定整改日期
    dutyDeptName?: string, // 责任部门
    dutyDept?: string, // 责任部门
    dutyPeopleName?: string, // 责任人
    dutyPeople: string, // 责任人
    recheckResult: string, // 复检结果
    recheckPicture: string // 复检图片
}