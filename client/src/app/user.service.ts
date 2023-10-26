import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<any[]>('/api/users'); 
  }

  search(query: string) {
    const params = new HttpParams().set('query', query);
    return this.http.get<any[]>('/api/user/search', { params });
  }

  getCurrentUser() {
    return this.http.get<any>('/api/currentUser');
  }
}