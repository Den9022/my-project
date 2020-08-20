import { UserVo } from "./user-vo";

export class SocketMessage {

    public static withSender(sender: UserVo): SocketMessage {
        const socketMessage = new SocketMessage();
        socketMessage.senderId = sender.id;
        socketMessage.senderName = sender.nickname;
        socketMessage.data = null;
        return socketMessage;
    }

    public static withData(data: any): SocketMessage {
        const socketMessage = new SocketMessage();
        socketMessage.data = data;
        return socketMessage;
    }

    public senderId: number;
    public senderName: string;
    public data: any;

}