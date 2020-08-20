import { Component, Input, OnDestroy } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { RestService } from '../service/rest-service';
import { SocketService } from '../service/socket-service';
import { SocketMessage } from '../vo/socket-message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnDestroy {

  private _room: any;

  public get room(): any {
    return this._room;
  }

  @Input()
  public set room(roomInput: any) {
    if (!isNullOrUndefined(this._room)) {
      throw new Error('Cannot change chat room on the fly!');
    }
    if (isNullOrUndefined(roomInput)) {
      return;
    }
    this._room = roomInput;
    this.init();
  }

  public messageInput: string;
  public messages: SocketMessage[];
  public loggedInUserId: number;

  constructor(private socketService: SocketService, private restService: RestService) {
    this.messages = [];
    this.loggedInUserId = this.restService.getLoggedInUser().id;
  }

  private init(): void {
    if (isNullOrUndefined(this.room)) {
      throw new Error('Chat room must not be null nor undefined!');
    }
    // this.readMessages();
    const roomName = `room-${this.room}`;
    this.socketService.joinRoom(roomName);
    this.socketService.addEventHandler(roomName, 'chat', (socketMessage: SocketMessage) => this.handleNewChatMessage(socketMessage));
  }

  public sendMessageOnEnter(event: KeyboardEvent): void {
    if (event.key.toLowerCase() === 'enter' && this.messageInput.length > 0) {
      this.sendMessage();
      this.messageInput = '';
    }
  }

  private handleNewChatMessage(socketMessage: SocketMessage): void {
    this.messages.push(socketMessage);
  }

  private sendMessage(): void {
    const userVo = this.restService.getLoggedInUser();
    const socketMessage = new SocketMessage();
    socketMessage.senderId = userVo.id;
    socketMessage.senderName = userVo.nickname;
    socketMessage.data = this.messageInput;

    this.socketService.emit(`room-${this.room}`, 'chat', socketMessage);
  }

  private async readMessages(): Promise<void> {
    const dataResponse = await this.restService.get(`chatMessages?room=${this.room}`);
    this.messages = dataResponse.data;
  }

  ngOnDestroy(): void {
    const roomName = `room-${this.room}`;
    //this.socketService.leaveRoom(roomName);
  }

}
