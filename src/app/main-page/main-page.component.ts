import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { RestService } from '../service/rest-service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import { DataResponse } from '../vo/data-response';
import { SocketService } from '../service/socket-service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {

  @ViewChild('newRoomForm')
  newRoomForm: NgForm

  public newRoomName: string;

  constructor(private restService: RestService, private router: Router, private messageService: MessageService, private socketService: SocketService) {
    
  }

  public validateAndCreateNewRoom(): void {
    if (!this.newRoomForm.form.valid) {
      this.messageService.add({detail: 'Adjon meg egye nevet a játékszobának!', severity: 'error'});
      return;
    }
    this.saveNewRoom();
  }

  private async saveNewRoom(): Promise<void> {
    const newRoom = await this.restService.post('createRoom', {name: this.newRoomName});
    console.log('--- new room ---\n', newRoom);
    this.messageService.add({detail: `Szoba létrehozva: ${this.newRoomName}`, severity: 'success'});
    this.router.navigate([`/room/${newRoom.id}`]);
  }

}
