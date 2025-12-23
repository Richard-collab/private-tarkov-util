import { Grid } from "@mui/material";
import BasicItemCard from "./BasicItemCard";
import BasicItem from "../utils/BasicItem";
import { useData } from "../context/DataContext";

export default function ListBasicItemCard({ n = 60, keyword = '', ascending = false}) {
    const { items } = useData();
    // Create a copy to sort
    let dataList = [...items];
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
                    key={forUseBasicItem.itemId}
                    size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}
                >
                    <BasicItemCard x={forUseBasicItem} />
                </Grid>
            ))}
        </Grid>
    );
}