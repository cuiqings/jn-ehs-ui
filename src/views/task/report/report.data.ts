import { FormSchema } from '/@/components/Table';
import { useMessage } from "/@/hooks/web/useMessage";
import { UploadTypeEnum } from '/@/components/Form/src/jeecg/components/JUpload';
const { createMessage } = useMessage();
import { message, Upload } from 'ant-design-vue';
export const formSchema: FormSchema[] = [
    {
        field: 'finishExplain',
        label: '汇报说明',
        component: 'InputTextArea',
        required: true,
        rules: [
            { required: true, message: '请输入汇报说明！' },
            { min: 0, max: 800, message: '长度不能超过 800 个字符', trigger: 'blur' },
        ],
    },
    {
        field: 'attachmentImg',
        label: '上传图片',
        component: 'JImageUpload',
        componentProps: {
            fileMax: 10,
            text: '',
            isYhWatermark: true,
            beforeUpload: (file: File) => {
                console.log('上传', file);
                const isLt300M = file.size / 1024 / 1024 < 10;
                if (!isLt300M) {
                    message.error('图片过大，请不要超过10M！');
                    return false || Upload.LIST_IGNORE;
                }
                return true;
            },
        },
    },
    {
        field: 'attachmentFile',
        component: 'JUpload',
        componentProps: {
            biz: 'eia',
            maxCount: 5,
            text: '上传',
            beforeUpload: (file: File) => {
                console.log('上传', file);
                const isLt300M = file.size / 1024 / 1024 < 300;
                const isPdf = file.type === 'application/pdf';
                const isDoc = file.type === 'application/msword' || file.type === 'application/wps-writer';
                const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                if (!isLt300M) {
                    message.error('文件过大，请不要超过300M！');
                    return false || Upload.LIST_IGNORE;
                } else if (!isPdf && !isDoc && !isDocx) {
                    message.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
                    return false || Upload.LIST_IGNORE;
                }
                return true;
            },
        },
        label: '附件',
    },
];
