import { CardVo } from "./card-vo";

export class GamePlayerVo {

    public static fromJsonVo(jsonVo: GamePlayerVo): GamePlayerVo {
        const newPlayer = new GamePlayerVo();
        newPlayer.id = jsonVo.id;
        newPlayer.name = jsonVo.name;
        newPlayer.teammateId = jsonVo.teammateId;
        newPlayer.teamId = jsonVo.teamId;

        newPlayer.cards = jsonVo.cards.map(CardVo.fromJsonVo);
        newPlayer.blindCardPairs = [];
        return newPlayer;
    }

    public amIOut(){        
   
        let values = this.cards.map(playerCard => playerCard.value);
        let duplicates = values.filter((item, index) => values.indexOf(item) != index)

        if(duplicates.length < 1 && this.blindCardPairs.length == 0){
           this.out = true 
        }
    }

    public id: number;
    public name: string;
    public cards: CardVo[];
    public blindCardPairs: CardVo[];
    public teammateId: number;
    public myTurn: boolean;
    public teamId: number;
    public out: boolean = false;

}