import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ItemService} from '../chat/item.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  isShowError: boolean=false;
  username: string;

  constructor(private router: Router,
              private service: ItemService
              ) {}
    
    login() {
        this.service.identify(this.username).subscribe(res => {
            localStorage.setItem('token', res.token);
            this.isShowError = false;
            this.router.navigate(['chat']);
        }, err => {
            this.isShowError = true;
        });    }
}
