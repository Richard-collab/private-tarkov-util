export default class BasicItem {
    constructor(itemId, itemName, imageLink, priceMarket, priceBase, height, width, weight) {
        this.itemId = itemId;
        this.itemName = itemName;
        this.imageLink = imageLink;
        this.priceMarket = priceMarket;
        this.priceBase = priceBase;
        this.height = height;
        this.width = width;
        this.weight = weight;
        this.averageSlotPriceMarket = priceMarket / (height * width);
        this.averageSlotPriceBase = priceBase / (height * width);
    }
}