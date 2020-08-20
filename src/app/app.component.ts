import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RestService } from './service/rest-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  title = 'frontend';

  constructor(private router: Router) {
    this.router.navigate(['/login']);
  }

}
