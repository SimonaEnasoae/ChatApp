import {Component, OnDestroy, OnInit} from '@angular/core';
import {ItemService} from './item.service';
import {Router} from '@angular/router';
import {Message} from '../data/Message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {
  rooms: string[];
  private subscriptions = [];
  private groupedRooms = new Map();
  messages: Message[];
  room: string;
  message: string;


  constructor(private service: ItemService,
              private router: Router) {
    this.subscriptions.push(this.service.getAll().subscribe(res => {
      this.messages = res;
      this.createMap();
    }, err => {
      this.messages = JSON.parse(localStorage.getItem('messages'));
      this.createMap();
    }));
  }
   ngOnInit() {
     this.service.getMessages().subscribe();
  }
  ngOnDestroy() {
    this.subscriptions.forEach(subcription => subcription.unsubscribe());
  }

  logout() {
    this.groupedRooms.clear();
    this.service.logout();
    this.router.navigate(['home']);
  }

  private createMap() {
    this.groupedRooms.clear();

    const msgsGroupedByUser = this.messages.reduce((r, a) => {
      r[a.room] = r[a.room] || [];
      r[a.room].push(a);
      return r;
    }, Object.create(null));


    Object.keys(msgsGroupedByUser)
        .map(idx => msgsGroupedByUser[idx])
        .forEach(messageArray => {
              const first = messageArray[0];
              const sortedArr = messageArray.sort((m1, m2) => m1.created - m2.created);
              this.groupedRooms.set(first.room, sortedArr);
            }
        );
    this.rooms = [...this.groupedRooms.keys()];
  }

  showMessages(item: string) {
      this.room = item;
  }

  sendMesage() {
    this.service.sendMessage(this.message, this.room).subscribe();
  }

  sendMessAgain(item: Message) {
    this.service.sendMessage(item.text, item.room);
  }
}
