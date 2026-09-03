import { ref } from 'vue';
import { uploadFile } from '../../url/index';
interface paramsType {
  upload: any;
  upload_fullpath: string;
  action: string;
  target: string | number;
}
export const useFileModel = (emit?: any) => {
  const title = ref('上传');
  const visible = ref(false);
  const width = ref(600);
  const pstatus = ref('active');
  const pPercent = ref(0);
  const wasteList = ref<string[]>([]);
  const maxSize = ref(300);
  const wasteName = ref('');
  const fileList = ref<any[]>([]);
  const fileId = ref<string | number>('');
  const open = (files: any, id: string | number) => {
    visible.value = true;
    fileId.value = id;
    fileList.value = files;
    wasteList.value = [];
    wasteName.value = '';
    submit();
  };
  const handleCancel = () => {
    visible.value = false;
    emit('close');
  };
  // 整合formData数据
  const getFormDateVal = (data: paramsType) => {
    const formData = new FormData();
    const fd_keys = Object.keys(data);
    fd_keys.forEach((key) => {
      formData.set(key, data[key]);
    });
    return formData;
  };
  const submit = async () => {
    pstatus.value = 'active';
    pPercent.value = 0;
    let Ppercent_A1 = 0; // 成功的
    let Ppercent_A2 = 0; // 失败的
    const Ppercent_B = fileList.value.length;
    for (let i = 0; i < Ppercent_B; i++) {
      if (ifSize(fileList.value[i].size)) {
        Ppercent_A2 += 1;
        wasteList.value.push(fileList.value[i].name);
      } else {
        const data = {
          upload: fileList.value[i],
          upload_fullpath: fileList.value[i].name,
          action: 'upload',
          target: fileId.value,
        };
        const formData = getFormDateVal(data);
        await uploadFile(formData, fileId.value)
          .then(() => {
            Ppercent_A1 += 1;
          })
          .catch(() => {
            Ppercent_A2 += 1;
          });
        pPercent.value = ((Ppercent_A1 + Ppercent_A2) / Ppercent_B) * 100;
      }
    }
    wasteName.value = wasteList.value.join('、');
    const cleradata = setInterval(() => {
      if (Ppercent_A1 + Ppercent_A2 === Ppercent_B) {
        pPercent.value = 100;
        if (Ppercent_A1 === 0) {
          pstatus.value = 'exception';
        } else if (Ppercent_A2 === 0) {
          pstatus.value = 'success';
        } else {
          pstatus.value = 'normal';
        }
        emit('ok');
        clearInterval(cleradata);
      }
    }, 500);
  };
  const ifSize = (size: number) => {
    let r = false;
    if (size < 0.1 * 1024 * 1024 * 1024) {
      if (size / (1024 * 1024) > maxSize.value) {
        r = true;
      }
    } else {
      if (size / (1024 * 1024 * 1024) > maxSize.value / 1000) {
        r = true;
      }
    }
    return r;
  };
  return {
    title,
    visible,
    width,
    pstatus,
    pPercent,
    wasteList,
    maxSize,
    wasteName,
    handleCancel,
    open,
  };
};
export default useFileModel;
