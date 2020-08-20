import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { isNullOrUndefined } from "util";
import { MessageService } from "primeng/components/common/messageservice";
import { DataResponse } from "../vo/data-response";
import { UserVo } from "../vo/user-vo";

@Injectable()
export class RestService {

    private jwtToken: string;
    private loggedInUser: UserVo;

    private baseUrl = 'http://localhost:4000/';

    constructor(private httpClient: HttpClient, private messageService: MessageService) {
        const host = window.location.host;
    }

    public setToken(token: string) {
        if (isNullOrUndefined(token) || token === '') {
            throw new Error('Invalid jwtToken: ' + token);
        }
        this.jwtToken = token;
    }

    public setLoggedInUser(userVo: UserVo): void {
        if (isNullOrUndefined(userVo)) {
            throw new Error('Logged in user must not be null or undefined!');
        }
        this.loggedInUser = userVo;
    }

    public getLoggedInUser(): UserVo {
        return this.loggedInUser;
    }

    public clearUserData(): void {
        this.jwtToken = null;
        this.loggedInUser = null;
    }

    private createHeaders(): HttpHeaders {
        let headers = new HttpHeaders();
        if (!isNullOrUndefined(this.jwtToken)) {
            headers = headers.set('authorization', this.jwtToken);
        }
        return headers;
    }

    public get(url: string): Promise<any> {
        const headers = this.createHeaders();

        return new Promise<any>((resolve: any, reject: any) => {
            this.httpClient.get(this.baseUrl + url, { headers: headers }).toPromise()
                .then((dataResponse: DataResponse) => this.processResponse(dataResponse, resolve, reject))
                .catch(error => this.handleError(error, reject));
        });
        
    }

    public post(url: string, payload?: any): Promise<any> {
        const headers = this.createHeaders();
        return new Promise<any>((resolve: any, reject: any) => {
            this.httpClient.post(this.baseUrl + url, payload, { headers: headers }).toPromise()
                .then((dataResponse: DataResponse) => this.processResponse(dataResponse, resolve, reject))
                .catch(error => this.handleError(error, reject));
        });
    }

    private processResponse(dataResponse: DataResponse, resolve: any, reject: any): void {
        if (dataResponse.hasError) {
            console.error('--- DataResponse error ---\n', dataResponse.errorMessage);
            this.messageService.add({detail: dataResponse.errorMessage, severity: 'error'});
            reject({errorMessage: dataResponse.errorMessage});
        } else {
            resolve(dataResponse.data);
        }
    }

    private handleError(error: any, reject: any): void {
        console.error('--- other error ---\n', error);
        this.messageService.add({detail: error, severity: 'error'});
        reject({errorMessage: error});
    }

}