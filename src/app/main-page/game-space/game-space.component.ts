import { Component, Input, OnInit } from '@angular/core';
import { GamePlayerVo } from 'src/app/vo/game-player-vo';
import { RestService } from 'src/app/service/rest-service';
import { UserVo } from 'src/app/vo/user-vo';
import { CardVo } from 'src/app/vo/card-vo';
import { SocketMessage } from 'src/app/vo/socket-message';
import { SocketService } from 'src/app/service/socket-service';
import { MoveResultVo } from 'src/app/vo/move-result-vo';
import { MessageService } from 'primeng/components/common/messageservice';


@Component({
  selector: 'app-game-space',
  templateUrl: './game-space.component.html',
  styleUrls: ['./game-space.component.scss']
})
export class GameSpaceComponent implements OnInit {

  private static EVENT_MAKE_MOVE = 'make-move';
  private static EVENT_PASS = 'pass';
  private static EVENT_RESTART = 'restart';
  private static EVENT_GUESS = 'guess';

  private normalMove = 1;
  private blindMove = 2;

  public loggedInUserId: number;
  private currentTeamId: number;
  public cardsInCenter: CardVo[];

  public hostId: number;

  @Input() gamePlayers: GamePlayerVo[];
  @Input() roomId: number;
  @Input() restService: RestService;
  @Input() socketService: SocketService;
  @Input() messageService: MessageService;

  constructor() {
    this.gamePlayers = [];
    this.currentTeamId = 0;
    //this.init();
  }

  init(): void {
    

  }

  ngOnInit() {
    this.prepareGame();
    this.sortPlayers();
    this.flipOtherPlayerCardsToBackside();
    this.prepareNextTurn();
  } 

  private prepareGame(): void {
    const roomName = `room-${this.roomId}`;
    this.socketService.addEventHandler(roomName, GameSpaceComponent.EVENT_MAKE_MOVE, this.handleMakeMove.bind(this));
    this.socketService.addEventHandler(roomName, GameSpaceComponent.EVENT_RESTART, this.handleRestart.bind(this));
    this.socketService.addEventHandler(roomName, GameSpaceComponent.EVENT_GUESS, this.handleGuess.bind(this));

    this.loggedInUserId = this.restService.getLoggedInUser().id;
  }

  private sortPlayers(): void {
    this.gamePlayers.sort((playerA, playerB) => {
      if (playerA.id === this.loggedInUserId) {
        return -1;
      }
      if (playerB.id === this.loggedInUserId) {
        return 1;
      }
      if (playerA.teammateId === this.loggedInUserId) {
        return -1;
      }
      if (playerB.teammateId === this.loggedInUserId) {
        return 1;
      }
      return 0;
    });
    this.hostId = this.gamePlayers[0].id;
  }

  private flipOtherPlayerCardsToBackside(): void {
    this.gamePlayers.filter(player => player.id !== this.loggedInUserId)
      .forEach(player => player.cards.forEach(CardVo.flipToBackside));
  }

  public handleCardClick(player: GamePlayerVo, card: CardVo): void {
    console.log(this.gamePlayers);
    if (player.id === this.loggedInUserId) {
      card.selected = !card.selected;
    }
  }

  public prepareNextTurn(): void {  

    this.gamePlayers = this.gamePlayers.map(player => {

      player.amIOut();

      let teamMate =this.gamePlayers.find(teammate => teammate.id === player.teammateId);

      teamMate.amIOut();    
      
      if(player.teamId === this.currentTeamId )
      {
        if (!player.out || !teamMate.out) {
          player.myTurn = true;        
        }
        else {
          player.myTurn = false;

        }
      }
      else {
        player.myTurn = false;
      }     
      
      return player;  
      
    });
   
    let remained = this.gamePlayers.filter(player => player.out === false);

    if(remained.length == 2)
    {
      if(remained[0].teamId == remained[1].teamId)
      {
        console.log("Megvan a győztes");
        this.messageService.add({detail: "Megvan a győztes: " + remained[0].name + " és csapattársa.", severity: 'success'});
        console.log(remained);
      }
    }

    if(remained.length < 2)
    {     
      console.log("Megvan a győztes");
      this.messageService.add({detail: "Megvan a győztes: " + remained[0].name + " és csapattársa.", severity: 'success'});
      console.log(remained);
      
    }

  }

  private removeCardPairFromPlayer(playerId: number, cards: CardVo[]): void {

    const player = this.gamePlayers.find(player => player.id === playerId);

    player.cards = player.cards.filter(playerCard => !playerCard.equals(cards[0]) && !playerCard.equals(cards[1]));
  }

  public restartGame(): void {
    this.socketService.emit(`room-${this.roomId}`, GameSpaceComponent.EVENT_RESTART, SocketMessage.withSender(this.restService.getLoggedInUser()));
  }
  
  public makeMove(player: GamePlayerVo, moveId: number): void {
    console.log('elso');
    const roomName = `room-${this.roomId}`;
    const cards = player.cards.filter(card => card.selected === true);
    const moveMessage = SocketMessage.withSender(this.restService.getLoggedInUser() as UserVo);

    moveMessage.data = {playerId: player.id, cards: cards, moveId: moveId};
    this.socketService.emit(roomName, GameSpaceComponent.EVENT_MAKE_MOVE, moveMessage);
  }

  private handleMakeMove(socketMessage: SocketMessage): void {
    console.log('harmadik');

    const moveResult = socketMessage.data.moveResult as MoveResultVo;
    const cards = socketMessage.data.cards as CardVo[];
    const playerId =  socketMessage.data.playerId;
    const moveId = socketMessage.data.moveId;

    if( moveResult.valid ){

      console.log('valid move');
      
      this.removeCardPairFromPlayer(playerId,cards);

      const player = this.gamePlayers.find(player => player.id === playerId);

      if(moveId == this.normalMove){
        this.cardsInCenter = cards.slice();

        console.log(this.cardsInCenter);
      }

      if(moveId == this.blindMove){

        player.blindCardPairs = cards.slice();

      }

      this.currentTeamId = moveResult.nextTeamToMakeMove;
      this.prepareNextTurn();

    }else
    {
      console.log(moveResult);
      this.messageService.add({detail: moveResult.errorMessage, severity: 'error'});

    }
  }

  public guess(player: GamePlayerVo): void{

    const me = this.gamePlayers.find(player => player.id === this.loggedInUserId);

    if(!me.myTurn)
    {
      this.messageService.add({detail: "Mindenki csak a saját körében léphet.", severity: 'error'});
      return;
    }

    const roomName = `room-${this.roomId}`;    
    const moveMessage = SocketMessage.withSender(this.restService.getLoggedInUser() as UserVo);
    moveMessage.data = {playerId: player.id};

    this.socketService.emit(roomName, GameSpaceComponent.EVENT_GUESS, moveMessage);
    
  }

  public handleGuess(socketMessage: SocketMessage): void{

    const player = this.gamePlayers.find(player => player.id === socketMessage.data.playerId);
    const moveResult = socketMessage.data.moveResult as MoveResultVo;
    const me = this.gamePlayers.find(player => player.id === this.loggedInUserId);  

    if(player.blindCardPairs[0].value == player.blindCardPairs[1].value)
    {
        me.out = true;
        console.log(me);
        console.log(me.teammateId)
        var teamMate = this.gamePlayers.find(player => player.id == me.teammateId);
        console.log(teamMate)

        teamMate.out = true;
    }
    else
    {
      player.out = true;
      console.log(player);
      console.log(player.teammateId)

      var teamMate = this.gamePlayers.find(player => player.id == player.teammateId);
      console.log(teamMate)
  
      teamMate.out = true;
    }

    this.currentTeamId = moveResult.nextTeamToMakeMove;
    this.prepareNextTurn();
  }

  private handleRestart(socketMessage: SocketMessage): void {
    console.log('--- game restart ---\n', socketMessage.data);
    const allJsonPlayerData = socketMessage.data.gamePlayers;
    this.gamePlayers = allJsonPlayerData.map(GamePlayerVo.fromJsonVo);
    this.sortPlayers();
    this.flipOtherPlayerCardsToBackside();
    this.prepareNextTurn();
    this.messageService.add({detail: 'Új játék', severity: 'success'});

  }
}
