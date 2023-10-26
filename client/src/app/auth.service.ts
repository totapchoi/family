import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private signupUrl = '/api/signup';
  private signinUrl = '/api/auth/signin';

  constructor(private http: HttpClient) {}

  // Signup method
  signup(userData: any): Observable<any> {
    return this.http.post<any>(this.signupUrl, userData);
  }

  // Signin method
  signin(userData: any): Observable<any> {
    return this.http.post<any>(this.signinUrl, userData);
  }

  // Save JWT token to localStorage
  saveToken(token: string): void {
    localStorage.setItem('jwttoken', token);
  }

  // Get JWT token from localStorage
  getToken(): string | null {
    return localStorage.getItem('jwttoken');
  }

  // Remove JWT token from localStorage
  removeToken(): void {
    localStorage.removeItem('jwttoken');
  }
  isAuthenticated(): boolean {
   const token = this.getToken();
   return token !== null;
 }

}