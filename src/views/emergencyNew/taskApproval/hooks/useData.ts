export const useData = () => { 
    const yanlianmudi = [
        {
            sort: '1',
            checked: false,
            text: '已对有限空间作业进行风险评估，并制定了消除、控制危害的措施'
        }
    ]
    const yanlianmudiColumn = [
        {
            title: '序号',
            dataIndex: 'sort',
            width: 80,
            align: 'center',
            fixed: 'left',
        },
        {
            title: '演练目的',
            dataIndex: 'text',
            align: 'center',
            width: 500,
        },
    ]

    const yanlianjilu = [
        {
            sort: '1',
            checked: false,
            text: '已对有限空间作业进行风险评估，并制定了消除、控制危害的措施'
        }
    ]
    const yanlianjiluColumn = [
        {
            title: '序号',
            dataIndex: 'sort',
            width: 80,
            align: 'center',
            fixed: 'left',
        },
        {
            title: '演练记录',
            dataIndex: 'text',
            align: 'center',
            width: 500,
        },
    ]

    const jiangping = [
        {
            sort: '1',
            checked: false,
            text: '已对有限空间作业进行风险评估，并制定了消除、控制危害的措施'
        }
    ]
    const jiangpingColumn = [
        {
            title: '序号',
            dataIndex: 'sort',
            width: 80,
            align: 'center',
            fixed: 'left',
        },
        {
            title: '现场救援讲评',
            dataIndex: 'text',
            align: 'center',
            width: 500,
        },
    ]
    // 评审内容
    const pingshen = [
        {
            serialNumber: '1',
            isSelect: false,
            content: '已对有限空间作业进行风险评估，并制定了消除、控制危害的措施'
        }
    ]
    const pingshenColumn = [
        {
            title: '序号',
            dataIndex: 'serialNumber',
            width: 80,
            align: 'center',
            fixed: 'left',
        },
        {
            title: '演练目的',
            dataIndex: 'content',
            align: 'center',
            width: 500,
        },
    ]

    // 演练评价表
    const pingkjia = [
        {
            key: 'personArrival',
            text: '人员到位情况',
            items:  ['迅速准确、按时到位', '个别人员不到位', '重点部位人员不到位'],
        },
        {
            key: 'workMaterial',
            text: '现场物资',
            items:  ['充分、有效', '不充分', '严重缺乏'],
        },
        {
            key: 'personalProtection',
            text: '个人防护',
            items:  ['防护到位', '防护不到位', '部分防护不到位'],
        },
        {
            key: 'overallOrganization',
            text: '整体组织',
            items:  ['准确、高效、满足要求', '效率低，有待改进'],
        },
        {
            key: 'organizationDivision',
            text: '组织分工',
            items:  ['安全、快速', '基本完成任务', '效率低、未完成任务'],
        },
        {
            key: 'practicalEffect',
            text: '实战效果评价',
            items: ['达到预期目标', '基本达到目的，部分环节有待改进', '没有达到目标，须重新演练'],
        },
        {
            key: 'reportSuperior',
            text: '报告上级',
            items: ['报告及时', '联系不上'],
        },
        {
            key: 'safetyDepartment',
            text: '安全部门',
            items:  ['按要求协作', '行动迟缓'],
        },
        {
            key: 'rescueEffect',
            text: '救援效果',
            items:  ['按要求协作', '行动迟缓'],
        },
        {
            key: 'alertCooperation',
            text: '警戒配合',
            items:  ['按要求配合', '不配合']
        },
    ]

    return {
        yanlianmudi,
        yanlianmudiColumn,
        yanlianjilu,
        yanlianjiluColumn,
        jiangping,
        jiangpingColumn,
        pingshen,
        pingshenColumn,
        pingkjia
    }
};