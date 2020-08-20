import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { RestService } from '../service/rest-service';
import { SocketMessage } from '../vo/socket-message';

@Component({
  selector: 'app-socket-test',
  templateUrl: './socket-test.component.html',
  styleUrls: ['./socket-test.component.scss']
})
export class SocketTestComponent {

  constructor(private socket: Socket, httpClient: HttpClient, private restService: RestService) {
    this.socket.connect();
    this.socket.on('disconnect', data => {
      console.log('disconneted with data:\n', data);
      this.socket.disconnect(true);
    });

    socket.on('chat', (socketMessage: SocketMessage) => {
      console.log('--- chat message from server ---\n', socketMessage);
    });

    const joinRoomMessage = SocketMessage.withData({roomName: 'room-129'});
    this.socket.emit('join-room', joinRoomMessage);
    const chatMessage = SocketMessage.withData({chatMessage: 'Chat üzenet vazze!!!'});


    setTimeout(() => {
      this.socket.emit('chat', chatMessage);
    }, 2000);


    // httpClient.get('http://localhost:4000/login').toPromise()
    //   .then((response: any) => {
    //     console.log('--- response ---\n', response);

    //     let headers = new HttpHeaders();
    //     headers = headers.set('authorization', response.token + 'jjjj');
    //     httpClient.get('http://localhost:4000/jwtTest', {headers: headers}).toPromise()
    //       .then(resp => {
    //         console.log('--- jwt response ---\n', resp);
    //       })
    //       .catch(err => {
    //         console.log('--- jwt error ---\n', err);
    //       });
    //   })
    //   .catch(err => {
    //     console.log('--- error ---\n', err);
    //   });
  }


}
