import { Grid } from "@mui/material";
import BasicItemCard from "./BasicItemCard";
import BasicItem from "../utils/BasicItem";
// 读取 data/items.json 文件
import itemsData from '../data/items.json';

export default function ListBasicItemCard({ n = 60, keyword = '', ascending = false}) {
    let dataList = itemsData.items;
    let forUseBasicItemList: BasicItem[] = [];
    let l = 0;
    let i = 0;
    let maxI = dataList.length

    console.log(keyword);

    dataList.sort((a, b) => {
        const priceA = a.avg24hPrice || 0;
        const priceB = b.avg24hPrice || 0;
        if (ascending == false)
        {return priceB - priceA;}
        return priceA - priceB
    });

    while (l < n) {
        let tempObject = dataList[i];
        i ++;

        if (i >= maxI - 1) {
            break;
        }

        if (tempObject.name.toLowerCase().includes(keyword.toLowerCase())) {
            let tempBasicItem: BasicItem = new BasicItem(
                tempObject.id,
                tempObject.name,
                tempObject.image8xLink,
                tempObject.avg24hPrice,
                tempObject.basePrice,
                tempObject.height,
                tempObject.width,
                tempObject.weight
            );
            forUseBasicItemList.push(tempBasicItem);
            l ++;
        }
    }

    console.log(forUseBasicItemList);

    return (
        <Grid container spacing={3}>
            {forUseBasicItemList.map((forUseBasicItem) => (
                <Grid 
                    item 
                    key={forUseBasicItem.itemId}
                    xs={12}      // 在超小屏幕上占满整行
                    sm={6}       // 在小屏幕上占 1/2
                    md={4}       // 在中等屏幕上占 1/3
                    lg={3}       // 在大屏幕上占 1/4
                    xl={2.4}     // 在超大屏幕上占 1/5 (2.4 = 12/5)
                >
                    <BasicItemCard x={forUseBasicItem} />
                </Grid>
            ))}
        </Grid>
    );
}