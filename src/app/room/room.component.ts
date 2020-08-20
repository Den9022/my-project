import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RestService } from '../service/rest-service';
import { SocketService } from '../service/socket-service';
import { isNullOrUndefined } from 'util';
import { PlayerVo } from '../vo/player-vo';
import { SocketMessage } from '../vo/socket-message';
import { UserVo } from '../vo/user-vo';
import { MessageService } from 'primeng/components/common/messageservice';
import { GamePlayerVo } from '../vo/game-player-vo';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnDestroy {

  private static EVENT_PLAYER_JOINED = 'player-joined';
  private static EVENT_START_GAME = 'start-game';
  private static EVENT_LEAVE_ROOM = 'leave-room';
  private static EVENT_PLAYER_LIST = 'player-list';
  private static EVENT_HOST_ROLE_GRANTED = 'host-role-granted';
  private static EVENT_GAME_START_ERROR = 'game-start-error';

  public isHost: boolean;
  public roomId: number;
  public joinedPlayers: PlayerVo[];
  private myPlayerData: PlayerVo;

  private loggedInUser: UserVo;

  public gameStarted: boolean;
  public gamePlayers: GamePlayerVo[];
  public currentTeamId: number;

  constructor(private restService: RestService, private socketService: SocketService,
              private activatedRoute: ActivatedRoute, private router: Router, private messageService: MessageService) {
    this.joinedPlayers = [];
    this.gameStarted = false;
    this.loggedInUser = this.restService.getLoggedInUser();
    this.init();
  }

  private init(): void {
    this.activatedRoute.params.subscribe(params => {
      const idParamString = params['id'];
      if (isNullOrUndefined(idParamString)) {
        throw new Error('Room id is missing!');
      }
      const idParamNumber = Number.parseInt(idParamString);
      if (Number.isNaN(idParamNumber)) {
        throw new Error('Invalid room id: ' + idParamString);
      }

      this.roomId = idParamNumber;
      this.prepareRoom();
    });
  }

  private prepareRoom(): void {
    const roomName = `room-${this.roomId}`;
    this.socketService.joinRoom(roomName);
    this.socketService.addEventHandler(roomName, RoomComponent.EVENT_PLAYER_JOINED, this.handlePlayerJoined.bind(this));
    this.socketService.addEventHandler(roomName, RoomComponent.EVENT_PLAYER_LIST, this.handlePlayerList.bind(this));
    this.socketService.addEventHandler(roomName, RoomComponent.EVENT_LEAVE_ROOM, this.handlePlayerLeft.bind(this));
    this.socketService.addEventHandler(roomName, RoomComponent.EVENT_START_GAME, this.handleGameStart.bind(this));
    this.socketService.addEventHandler(roomName, RoomComponent.EVENT_GAME_START_ERROR, this.handleGameStartError.bind(this));
    this.socketService.addEventHandler(roomName, RoomComponent.EVENT_HOST_ROLE_GRANTED, () => this.isHost = true);

    const joinMessage = SocketMessage.withSender(this.loggedInUser);
    this.socketService.emit(roomName, RoomComponent.EVENT_PLAYER_JOINED, joinMessage);

  }

  private handlePlayerJoined(socketMessage: SocketMessage): void {
    if (socketMessage.senderId === this.loggedInUser.id) {
      this.myPlayerData = socketMessage.data;
      return;
    }
    const newPlayer = new PlayerVo();
    const userData = new UserVo();
    userData.id = socketMessage.senderId;
    userData.nickname = socketMessage.senderName;
    newPlayer.userData = userData;

    this.joinedPlayers.push(newPlayer);
  }

  private handlePlayerList(socketMessage: SocketMessage): void {
    this.joinedPlayers = socketMessage.data
      .filter(player => player.userData.id !== this.restService.getLoggedInUser().id)
      .map(this.processPlayerData.bind(this));
  }

  private handlePlayerLeft(socketMessage: SocketMessage): void {
    this.joinedPlayers = this.joinedPlayers.filter(player => player.userData.id === socketMessage.senderId);
  } 

  private processPlayerData(playerVo: PlayerVo): PlayerVo {
    const processedPlayerVo = new PlayerVo();
    Object.assign(processedPlayerVo, playerVo);

    return processedPlayerVo;
  }

  private handleGameStart(socketMessage: SocketMessage): void {
    console.log('--- game start message ---\n', socketMessage.data);
    const allJsonPlayerData = socketMessage.data.gamePlayers;
    this.gamePlayers = allJsonPlayerData.map(GamePlayerVo.fromJsonVo);
    this.gameStarted = true;
  }

  private handleGameStartError(socketMessage: SocketMessage): void {
    this.messageService.add({detail: socketMessage.data.errorMessage, severity: 'error'});
  }  

  public leaveRoom(): void {
    const roomName = `room-${this.roomId}`;
    const leaveMessage = SocketMessage.withSender(this.loggedInUser);
    this.socketService.emit(roomName, RoomComponent.EVENT_LEAVE_ROOM, leaveMessage);
    // this.router.navigate(['/main']);
  }

  public startGame(): void {
    this.socketService.emit(`room-${this.roomId}`, RoomComponent.EVENT_START_GAME, SocketMessage.withSender(this.restService.getLoggedInUser()));
  }

  ngOnDestroy(): void {
    const roomName = `room-${this.roomId}`;
    this.socketService.leaveRoom(roomName);
  }
}
