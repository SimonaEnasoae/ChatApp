import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Message} from '../data/Message';

declare var WebSocket: any;

const serverUrl = 'localhost:3000';
const httpServerUrl = `http://${serverUrl}`;
const wsServerUrl = `ws://${serverUrl}`;
const itemUrl = `${httpServerUrl}/message`;

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})
export class ItemService {
    private messagesSubject: BehaviorSubject<Message[]>;
    private created = 0;

    constructor(private http: HttpClient) {
        this.messagesSubject = new BehaviorSubject([]);

        const orders = localStorage.getItem('messages');
        if (orders != null) {
            this.messagesSubject.next(JSON.parse(orders));
        }

        const ws: any = new WebSocket(wsServerUrl);
        ws.onopen = () => {
            ws.send('send');
        };
        ws.onmessage = eventRecv => {
            const res = JSON.parse(eventRecv.data);
            this.messagesSubject.next(this.messagesSubject.value.concat([res]));
            localStorage.setItem('messages', JSON.stringify(this.messagesSubject.value));
        };

    }

    httpOptionsToken() {
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                token: `${localStorage.getItem('token')}`,
                Authorization: `Bearer ${localStorage.getItem('token')}`
            })
        };
    }
    
    identify(username: string) {
        return this.http.post<any>(`${httpServerUrl}/login`, {username}, httpOptions);
    }

    logout() {
        localStorage.setItem('token', null);
    }

    getAll(): Observable<any> {
        return this.messagesSubject.asObservable();
    }
    
    getMessages() {
         return this.http.get<any>(`${itemUrl}/?created=${this.created}`, this.httpOptionsToken()).pipe(tap(res => {
            this.messagesSubject.next(res);         
            localStorage.setItem('messages', JSON.stringify(this.messagesSubject.value));
        }));
    }
    /**
     * 
     * @param message the message to be sent
     * @param room the room where the message will be displayed
     * @returns 
     */
    sendMessage(message: string, room: string) {
        return this.http.post<Message>(`${httpServerUrl}/message`, {text: message, room: room}, this.httpOptionsToken())
            .pipe(tap(res => {
                const it = this.messagesSubject.value.filter(t => !t.mustSend || t.text !== message || t.room !== room);
                this.messagesSubject.next(it);
            }, err => {
                const mesg = new Message();
                mesg.room = room;
                mesg.text = message;
                mesg.mustSend = true;
                mesg.username = localStorage.getItem('token');
                this.messagesSubject.next(this.messagesSubject.value.concat([mesg]));
                localStorage.setItem('messages', JSON.stringify(this.messagesSubject.value));

            }));
    }
}

