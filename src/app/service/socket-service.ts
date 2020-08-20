import { Socket } from 'ngx-socket-io';
import { Injectable } from '@angular/core';
import { SocketMessage } from '../vo/socket-message';
import { RestService } from './rest-service';

@Injectable()
export class SocketService {

    private static readonly EVENT_JOIN_ROOM = 'join-room';
    private static readonly EVENT_LEAVE_ROOM = 'leave-room';
    private static readonly EVENT_CONNECT_USER = 'connect-user';

    public eventsOfRooms: Map<string, string[]>;

    constructor(private socket: Socket, private restService: RestService) {
        this.eventsOfRooms = new Map<string, string[]>();
        this.socket.connect();
        const connectMessage = SocketMessage.withSender(this.restService.getLoggedInUser());
        this.socket.emit(SocketService.EVENT_CONNECT_USER, connectMessage);
    }

    public addEventHandler(roomName: string, event: string, handler: (socketMessage: SocketMessage) => void): void {
        this.socket.on(roomName + '-' + event, handler);
        if (!this.eventsOfRooms.has(roomName)) {
            this.eventsOfRooms.set(roomName, []);
        }
        this.eventsOfRooms.get(roomName).push(event);
    }

    public emit(roomName: string, event: string, socketMessage: SocketMessage): void {
        console.log('--- emitting, room: ' + roomName + '  event: ' + event);
        this.socket.emit(roomName + '-' + event, socketMessage);
    }

    public joinRoom(roomName: string): void {
        const joinMessage = SocketMessage.withSender(this.restService.getLoggedInUser());
        joinMessage.data = {roomName};
        this.socket.emit(SocketService.EVENT_JOIN_ROOM, joinMessage);
    }

    public leaveRoom(roomName: string): void {
        const leaveMessage = SocketMessage.withSender(this.restService.getLoggedInUser());
        leaveMessage.data = {roomName};
        this.emit(roomName, SocketService.EVENT_LEAVE_ROOM, leaveMessage);
        this.eventsOfRooms.get(roomName).forEach(event => {
            const fullEventName = roomName + '-' + event;
            this.socket.removeListener(fullEventName);
        });
        this.eventsOfRooms.delete(roomName);
    }


}