import { Select, Space, Flex } from 'antd';
const SelectList = [
    {
        placeholder: '剧本类型',
        valueList: [
            {
                value: 1,
                label: 1
            },
            {
                value: 2,
                label: 2
            },
            {
                value: 3,
                label: 4
            }
        ]
    },
    {
        placeholder: '镜头数量',
        valueList: [
            {
                value: 1,
                label: 1
            },
            {
                value: 2,
                label: 2
            },
            {
                value: 3,
                label: 4
            }
        ]
    },
    {
        placeholder: '单镜头时长',
        valueList: [
            {
                value: 1,
                label: 1
            },
            {
                value: 2,
                label: 2
            },
            {
                value: 3,
                label: 4
            }
        ]
    },

]

export default () => {
    return (
        <Flex justify="left" style={{ height: 48, paddingTop: 10, paddingBottom: 10}}>
            <Space wrap>
                {
                    SelectList.map(select => {
                        return (
                            <Select
                                key={select.placeholder}
                                style={{ width: 120 }}
                                placeholder={select.placeholder}
                                options={select.valueList}
                            />
                        )
                    })
                }


            </Space>
        </Flex>

    )
}
