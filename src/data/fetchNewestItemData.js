import { request, gql } from 'graphql-request'
import fs from 'fs/promises'

const query = gql`
{
    items(lang: zh) {
        id
        name
        image8xLink
        avg24hPrice
        basePrice
        height
        width
        weight
    }
}
`

request('https://api.tarkov.dev/graphql', query)
    .then(async (data) => {
        console.log(data)
        
        // 将数据保存为 JSON 文件
        try {
            await fs.writeFile('items.json', JSON.stringify(data, null, 2))
            console.log('数据已保存到 items.json')
        } catch (error) {
            console.error('保存文件时出错:', error)
        }
    })
    .catch((error) => {
        console.error('请求失败:', error)
    })
