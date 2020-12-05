import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {

  url: string;

  constructor(private http: HttpService) { }

  ngOnInit(): void {
  }

  public addSource() {
    this.http.sendNewSource(this.url).subscribe(feedName => {
      this.url = ' ';
    });
  }

}
