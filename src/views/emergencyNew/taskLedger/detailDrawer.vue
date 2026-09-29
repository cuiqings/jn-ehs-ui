<template>
  <BasicDrawer v-bind="$attrs" @register="register" :title="title" width="1300px" style="padding-bottom: 60px">
    <plan-form ref="formElRef" :detail="detail" :disabled="disabled" @cancel="closeDrawer" @submit="closeDrawer"></plan-form>
    <div class="step-tit" style="display: flex; align-items: center; width: 100%; margin-bottom: 12px;">
      <span>演练记录</span>
      <a-button type="primary" :loading="downloadIng" @click="download" style="margin-left: auto">下载演练记录</a-button>
    </div>
    <a-form :model="formState" ref="contentFormElRef" name="basic" :label-col="{ span: 3 }" :wrapper-col="{ span: 16 }">
      <div class="form-main">
        <a-form-item label="1、演练方案" name="drillScheme">
          <JUpload
            ref="uploadRef"
            :disabled="title == '详情'"
            accept=".doc,.docx,.pdf,.xls,.xlsx"
            :maxCount="10"
            v-model:value="formState.drillScheme"
            text="上传附件"
          />
        </a-form-item>
        <a-form-item label="2、演练应急预案" name="drillEmergencyPlan">
          <JUpload
            accept=".doc,.docx,.pdf,.xls,.xlsx"
            :disabled="title == '详情'"
            ref="uploadRef"
            :maxCount="10"
            v-model:value="formState.drillEmergencyPlan"
            text="上传附件"
          />
        </a-form-item>
        <a-form-item label="3、演练脚本" name="drillScript">
          <JUpload
            accept=".doc,.docx,.pdf,.xls,.xlsx"
            :disabled="title == '详情'"
            ref="uploadRef"
            :maxCount="10"
            v-model:value="formState.drillScript"
            text="上传附件"
          />
        </a-form-item>
        <a-form-item label="4、演练记录">
          <div class="record-list">
            <div class="tit"> 动员培训:<span v-if="formState.drillRecord" @click="getHtml(1)">动员培训.pdf</span> </div>
            <div class="tit"> 演练记录:<span v-if="formState.drillRecord" @click="getHtml(2)">演练记录.pdf</span> </div>
            <div class="tit"> 评估报告:<span v-if="formState.drillRecord" @click="getHtml(3)">评估报告.pdf</span> </div>
            <!-- <div class="tit"> 应急救援队伍名单:<span v-if="formState.drillRecord" @click="getHtml(4)">应急救援队伍名单.pdf</span> </div> -->
            <div class="tit"> 演练评价表:<span v-if="formState.drillRecord" @click="getHtml(5)">演练评价表.pdf</span> </div>
          </div>
        </a-form-item>
        <a-form-item label="5、演练总结" name="drillSummary">
          <JUpload
            accept=".doc,.docx,.pdf,.xls,.xlsx"
            :disabled="title == '详情'"
            ref="uploadRef"
            :maxCount="10"
            v-model:value="formState.drillSummary"
            text="上传附件"
          />
        </a-form-item>
        <a-form-item :labelCol="{ span: 5 }" label="6、演练存在不足之处整改落实情况" name="drillCorrective">
          <JUpload
            accept=".doc,.docx,.pdf,.xls,.xlsx"
            :disabled="title == '详情'"
            ref="uploadRef"
            :maxCount="10"
            v-model:value="formState.drillCorrective"
            text="上传附件"
          />
        </a-form-item>
        <a-form-item label="7、演练影像资料" name="drillVideoData">
          <JUpload ref="uploadRef" :disabled="title == '详情'" accept="image/*, video/*" :maxCount="20" v-model:value="formState.drillVideoData" text="上传附件" />
        </a-form-item>
      </div>
    </a-form>
    <div class="exaime">
      <div class="tit">计划审批</div>
      <ul>
        <li v-for="item in detail.examineList">
          <div class="name">{{ item.nodeName }}</div>
          <div class="names">
            <span style="padding-right: 15px">{{ item.userName }}</span> <span>{{ item.finishTime }}</span>
          </div>
          <img v-if="item.sign" :src="getFileAccessHttpUrl(item.sign)" alt="" />
        </li>
      </ul>
    </div>
    <template v-if="title != '详情'" #footer>
      <div class="foot">
        <a-space>
          <a-button @click="backFn" :loading="submitIng">取消</a-button>
          <a-button type="primary" :loading="submitIng" @click="submitFn">提交</a-button>
        </a-space>
      </div>
    </template>
  </BasicDrawer>
  <a-modal v-model:visible="htmlShow" :footer="null" :title="htmlTitle" @cancel="htmlShow = false" width="960px">
    <div style="padding: 0 10px">
      <iframe ref="htmlRef" :srcdoc="htmlContent" frameborder="0" width="100%" height="680"></iframe>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { approvalDetail, drillTaskView, ledgerEdit2, downloadTrainRecord } from '../api';
  import planForm from './components/planForm.vue';
  import type { FormInstance } from 'ant-design-vue';
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  import JSZip from 'jszip';
  import { message } from 'ant-design-vue';

  const emits = defineEmits(['success']);
  const title = ref('详情');
  const disabled = ref(false);
  const detail = ref({});
  const formElRef = ref<InstanceType<typeof planForm> | null>(null);
  const contentFormElRef = ref<FormInstance | null>(null);
  const submitIng = ref(false);
  const downloadIng = ref(false);

  // 通过 URL fetch 成 blob
  const fetchBlob = async (url: string): Promise<Blob> => {
    const res = await fetch(url, { mode: 'cors' });
    return res.blob();
  };

  // 从逗号分隔字符串或数组里提取文件名和完整 URL
  const parseFiles = (str: string | string[] | null | undefined) => {
    if (!str) return [];
    const arr = Array.isArray(str) ? str : str.split(',');
    return arr.filter(Boolean).map(path => ({
      url: getFileAccessHttpUrl(path),
      name: path.split('/').pop() || path,
    }));
  };

  // drillTaskView 返回 HTML，转成 PDF blob
  const htmlToPdfBlob = async (htmlStr: string): Promise<Blob> => {
    const { default: html2canvas } = await import('html2canvas');
    const { jsPDF } = await import('jspdf');
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-99999px;top:-99999px;width:794px;background:#fff;padding:20px;visibility:hidden;pointer-events:none;z-index:-9999;';
    container.innerHTML = htmlStr;
    document.body.appendChild(container);
    const canvas = await html2canvas(container, { scale: 1.5, useCORS: true, logging: false });
    document.body.removeChild(container);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgW = 190;
    const imgH = (canvas.height * imgW) / canvas.width;
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.85), 'JPEG', 10, 10, imgW, imgH);
    return pdf.output('blob');
  };

  const download = async () => {
    downloadIng.value = true;
    message.loading({ content: '正在打包，请稍候...', key: 'drill-download', duration: 0 });
    try {
      const zip = new JSZip();
      const folder = zip.folder('演练资料')!;
      const d = detail.value as any;

      // 1~3、5~7 附件文件直接 fetch，全部平铺到根目录
      const attachGroups = [
        { str: d.drillScheme },
        { str: d.drillEmergencyPlan },
        { str: d.drillScript },
        { str: d.drillSummary },
        { str: d.drillCorrective },
        { str: d.drillVideoData },
      ];

      for (const group of attachGroups) {
        const files = parseFiles(group.str);
        for (const file of files) {
          try {
            const blob = await fetchBlob(file.url);
            folder.file(file.name, blob);
          } catch (e) {
            console.warn(`下载失败: ${file.url}`, e);
          }
        }
      }

      // 4、演练记录里的 PDF，平铺到根目录
      if (d.drillRecord) {
        const recordMap = [
          { type: 1, name: '动员培训.pdf' },
          { type: 2, name: '演练记录.pdf' },
          { type: 3, name: '评估报告.pdf' },
          { type: 5, name: '演练评价表.pdf' },
        ];
        for (const item of recordMap) {
          try {
            const html = await drillTaskView({ type: item.type, id: d.id });
            const pdfBlob = await htmlToPdfBlob(html);
            folder.file(item.name, pdfBlob);
          } catch (e) {
            console.warn(`PDF生成失败: ${item.name}`, e);
          }
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', `演练资料-${dayjs().format('YYYY-MM-DD')}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success({ content: '下载完成', key: 'drill-download' });
    } catch (e) {
      console.error(e);
      message.error({ content: '下载失败', key: 'drill-download' });
    } finally {
      downloadIng.value = false;
    }
  };
  const [register, { closeDrawer }] = useDrawerInner((data) => {
    title.value = data.title;
    if (data.id) {
      formState.value.id = data.id;
      formState.value.drillEmergencyPlan = data.drillEmergencyPlan;
      approvalDetail(data.id).then((res) => {
        detail.value = res;
        formElRef.value?.init(res);
        Object.assign(formState.value, res);
      });
    }
  });

  const formState = ref<any>({});
  const submitFn = async () => {
    await contentFormElRef.value?.validate();
    let params = JSON.parse(JSON.stringify(formState.value));
    Object.keys(params).forEach((key) => {
      if(key != 'id'){
        if (['drillCorrective', 'drillEmergencyPlan', 'drillScheme', 'drillScript', 'drillSummary', 'drillVideoData'].includes(key) && params[key] && typeof params[key] == 'string') {
          params[key] = params[key].split(',');
        }
      }
    })
    submitIng.value = true;
    ledgerEdit2(params).then(_ => {
      closeDrawer()
    }).finally(() => {
      setTimeout(() => {
        submitIng.value = false;
      }, 300)
    })
    // openSignModal(true, { id: getId() });
  };
  const backFn = () => {
    closeDrawer();
  }

  const htmlShow = ref(false);
  const htmlTitle = ref('');
  const htmlContent = ref('');
  const htmlRef = ref(null);
  const getHtml = (type) => {
    console.log(detail.value);
    const titmap = {
      1: '动员培训',
      2: '演练记录',
      3: '评估报告',
      4: '应急救援队伍名单',
      5: '演练评价表',
    };
    drillTaskView({ type: type, id: detail.value.id }).then((res) => {
      htmlContent.value = res;
      htmlTitle.value = titmap[type];
      htmlShow.value = true;
    });
  };
</script>
<style lang="less" scoped>
  .back-reson {
    height: 180px;
    padding: 16px;

    .main {
      display: flex;
    }

    span {
      width: 70px;

      &:before {
        display: inline-block;
        margin-right: 4px;
        color: #ff4d4f;
        font-size: 14px;
        font-family: SimSun, sans-serif;
        line-height: 1;
        content: '*';
      }
    }

    .hint {
      padding-left: 70px;
      color: #ff4d4f;
    }
  }

  .exaime {
    padding-bottom: 60px;

    .tit {
      font-size: 16px;
      font-weight: 600;
      color: #1890ff;
      padding: 16px 0;
    }

    .name {
      color: #1890ff;
    }

    img {
      height: 80px;
      margin-left: 58px;
    }

    ul {
      padding-left: 20px;

      li {
        margin-bottom: 20px;
      }
    }
  }

  .record-list {
    width: 500px;

    .tit {
      display: flex;
      align-items: center;
      justify-content: space-between;
      line-height: 36px;

      span {
        color: #1890ff;
      }
    }
  }
  .foot{
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
</style>
