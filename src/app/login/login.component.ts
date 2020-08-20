import { NgModule } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { UserVo } from '../vo/user-vo';
import { RestService } from '../service/rest-service';
import { NgForm } from '@angular/forms';
import { MessageService } from 'primeng/components/common/messageservice';
//import { ButtonModule } from 'primeng/components/button/button';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { GamePlayerVo } from '../vo/game-player-vo';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})


@NgModule({
  imports: [ButtonModule]
})

export class LoginComponent {

  public userVo: UserVo;

  public gamePlayers: GamePlayerVo[];

  @ViewChild('loginForm')
  loginForm: NgForm;

  constructor(private restService: RestService, private messageService: MessageService, private router: Router) {
    this.userVo = new UserVo();
    const message = {summary:'Service Message', detail:'Via MessageService', severity: 'error', key: 'main'};

    this.initGamePlayers();
  }

  public handleLoginClicked(): void {
    if (this.loginForm.form.valid) {
      this.login();
    } else {
      this.showLoginError();
    }
  }

  public goToRegistration(): void {
    this.router.navigate(['/register']);
  }

  private login(): void {
    this.restService.post('login', this.userVo)
      .then(response => {
        this.restService.setToken(response.token);
        this.restService.setLoggedInUser(response.user);
        this.router.navigate(['/main']);
      });
  }

  private showLoginError(): void {
    this.messageService.add({detail: 'Hibás a form!', severity: 'error'});
  }

  private initGamePlayers(): void {
    const responseObject = {"gamePlayers":[{"cards":[{"value":"VII","color":"makk"},{"value":"IX","color":"tök"},{"value":"KIRÁLY","color":"zöld"},{"value":"ÁSZ","color":"zöld"},{"value":"VII","color":"zöld"},{"value":"X","color":"tök"},{"value":"VIII","color":"zöld"}],"blindCardPairs":[],"id":18,"teammateId":1,"name":"a"},{"cards":[{"value":"VIII","color":"makk"},{"value":"KIRÁLY","color":"tök"},{"value":"VII","color":"tök"},{"value":"VIII","color":"tök"},{"value":"X","color":"piros"},{"value":"ALSÓ","color":"makk"},{"value":"VII","color":"piros"}],"blindCardPairs":[],"id":1,"teammateId":18,"name":"usy"},{"cards":[{"value":"KIRÁLY","color":"piros"},{"value":"ÁSZ","color":"piros"},{"value":"VIII","color":"piros"},{"value":"KIRÁLY","color":"makk"},{"value":"ALSÓ","color":"tök"},{"value":"ALSÓ","color":"zöld"},{"value":"IX","color":"zöld"}],"blindCardPairs":[],"id":19,"teammateId":17,"name":"qq"},{"cards":[{"value":"IX","color":"makk"},{"value":"ALSÓ","color":"piros"},{"value":"FELSŐ","color":"piros"},{"value":"FELSŐ","color":"tök"},{"value":"IX","color":"piros"},{"value":"FELSŐ","color":"zöld"},{"value":"X","color":"makk"}],"blindCardPairs":[],"id":17,"teammateId":19,"name":"fromui"}]};
    const jsonGamePlayers = responseObject.gamePlayers;
    this.gamePlayers = jsonGamePlayers.map(GamePlayerVo.fromJsonVo);
    console.log('--- gamePlayers ---\n', this.gamePlayers);
  }

}
