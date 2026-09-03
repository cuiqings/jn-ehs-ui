export const timeValid = (val, formData, workType) => {
  // 判断时间是否合法
  if (val === '') {
    return false;
  }
  return workTimeValidation(workType, formData);
};

const workTimeValidation = (workType: string, data: any) => {
    const time = [data.startTime, data.endTime];
    const value = data.workGrade;
    if (workType === '1') {
        if (new Date(time[1]).getTime() - new Date(time[0]).getTime() > 7 * 24 * 60 * 60 * 1000) {
            return '高处作业的作业实施时间最长为7天！';
        } else {
            return true;
        }
    } else if (workType === '2') {
        if (new Date(time[1]).getTime() - new Date(time[0]).getTime() > 24 * 60 * 60 * 1000 + 3000) {
            return '有限空间的作业实施时间最长为24小时！';
        } else {
            return true;
        }
    } else if (workType === '3') {
        if (value == '特级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 24 * 60 * 60 * 1000) {
            return '特级动火的动火期限最长为24小时！';
        } else if (value == '一级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 3 * 24 * 60 * 60 * 1000) {
            return '一级动火的动火期限最长为72小时！';
        } else if (value == '二级' && new Date(time[1]).getTime() - new Date(time[0]).getTime() > 7 * 24 * 60 * 60 * 1000) {
            return '二级动火的动火期限最长为7天！';
        } else {
            return true;
        }
    } else if (workType === '4') {
        if (time.length > 0) {
        return Promise.resolve();
        } else {
        return '请输入作业实施时间！';
        }
    } else {
        if (time.length > 0) {
        return Promise.resolve();
        } else {
        return '请输入作业实施时间！';
        }
    }
  };
