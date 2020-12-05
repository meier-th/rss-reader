import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { FeedSource } from '../model/feedsource';
import { FeedEntry } from '../model/feed-entry';

@Component({
  selector: 'app-feed-paginator',
  templateUrl: './feed-paginator.component.html',
  styleUrls: ['./feed-paginator.component.css']
})
export class FeedPaginatorComponent implements OnInit {

  selectedFeed = new FeedSource();
  feeds = new Array<FeedSource>();
  entries : FeedEntry[];
  currentPage: number;
  pageSize : number;

  constructor(private http: HttpService) { }

  ngOnInit(): void {
    this.http.getFeedNames().subscribe(names=>{this.feeds = names});
    this.currentPage = 0;
    this.pageSize = 5;
    this.entries = [];
  }

  public changeFeed() {
    console.log(this.selectedFeed);
    this.entries = [];
    this.currentPage = 0;
    this.loadEntries();
  }

  loadEntries() {
    this.http.getPage(this.selectedFeed.feed, this.pageSize, this.currentPage).subscribe(data => {
      let oldLength = this.entries.length;
      this.entries = this.entries.concat(data);
      if (document.getElementById("rss-wrapper").offsetHeight < window.innerHeight && oldLength != this.entries.length) {
        this.currentPage++;
        this.loadEntries();
      }
    });
  }

  refresh() {
    if (this.selectedFeed.source !== undefined) {
      this.http.sendNewSource(this.selectedFeed.source).subscribe(reply=>{
        this.changeFeed();
      });
    } else {
      this.http.getFeedNames().subscribe(names=>{this.feeds = names});
    }
  }

  onScroll() {
    this.currentPage++;
    this.loadEntries();
  }

}
