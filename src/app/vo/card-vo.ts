export class CardVo {

    private static baseUrl = 'assets/images/cards';

    private static getImageSourceForCard(card: CardVo): string {
        return `${CardVo.baseUrl}/${card.color}-${card.value}.png`;
    }

    public static fromJsonVo(jsonVo: CardVo): CardVo {
        return new CardVo(jsonVo.value, jsonVo.color);
    }

    public static flipToBackside(card: CardVo): void {
        card.imgSrc = `${CardVo.baseUrl}/backside.png`;
    }

    public equals(otherCard: CardVo): boolean {
        return this.value === otherCard.value && this.color === otherCard.color;
    }

    public imgSrc: string;
    public selected: boolean;       // Csak megjelenítési célból

    constructor(public value: string, public color: string) {
        this.imgSrc = CardVo.getImageSourceForCard(this);
    }

}