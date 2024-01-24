import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  getDepartmentData(url: string, department: string): Observable<any[]> {
    return this.http
      .get<any[]>(url)
      .pipe(
        map((data) => data.filter((item) => item.Department === department))
      );
  }
  getData(url: string): Observable<any[]> {
    return this.http.get<any[]>(url);
  }
}
