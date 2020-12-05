import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FeedSource } from '../model/feedsource';
import { FeedEntry } from '../model/feed-entry';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  public sendNewSource(url: string) : Observable<string> {
    return this.http.post<string>('http://localhost:8080', url, {responseType: 'text' as 'json'});
  }

  public getFeedNames(): Observable<Array<FeedSource>> {
    return this.http.get<Array<FeedSource>>('http://localhost:8080/feednames');
  }

  public getPage(feedname: string, pagesize: number, pagenumber: number) : Observable<Array<FeedEntry>> {
    let params = new HttpParams().set('feed', feedname).set('ps', pagesize.toString()).set('pn', pagenumber.toString());
    return this.http.get<Array<FeedEntry>>('http://localhost:8080', {params});
  }

}
