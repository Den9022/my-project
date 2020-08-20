import { Component } from '@angular/core';
import { RestService } from 'src/app/service/rest-service';
import { RoomListVo } from 'src/app/vo/room-list-vo';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent {

  public availableRooms: RoomListVo[];

  constructor(private restService: RestService, private router: Router) {
    this.availableRooms = [];
    this.loadAvailableRooms();
  }

  public async loadAvailableRooms(): Promise<any> {
    this.availableRooms = await this.restService.get('listAvailableRooms');
  }

  public joinRoom(selectedRoom: RoomListVo): void {
    this.router.navigate([`/room/${selectedRoom.id}`]);
  }

}
