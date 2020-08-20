import { Component, ViewChild } from '@angular/core';
import { RestService } from '../service/rest-service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { MessageService } from 'primeng/components/common/messageservice';
import { UserVo } from '../vo/user-vo';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class RegistrationComponent {

  @ViewChild('registrationForm')
  registrationForm: NgForm;

  public userVo: UserVo;

  constructor(private restService: RestService, private router: Router, private messageService: MessageService) {
    this.userVo = new UserVo();
  }

  public goToLogin(): void {
    this.router.navigate(['/login']);
  }

  public validateAndRegister(): void {
    if (!this.registrationForm.form.valid) {
      this.messageService.add({detail: 'Hibás a form!', severity: 'error'});
      return;
    }
    this.register();
  }

  private async register(): Promise<any> {
    await this.restService.post('register', this.userVo)
    this.messageService.add({detail: 'Sikeres regisztráció!', severity: 'success'})
  }


}
