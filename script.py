# https://habrahabr.ru/rss/interesting/
import feedparser
from orator import DatabaseManager, Model
from http.server import BaseHTTPRequestHandler, HTTPServer
import datetime
import re
import urllib

config = {
    'sqlite': {
        'driver': 'sqlite',
        'database': 'pyth',
        'prefix': ''
    }
}

db = DatabaseManager(config)

class RssEntry(Model):
  __table__ = 'rss'
  __autoincrementing__ = False
  name = ''
  id = ''
  link = ''
  text = ''
  author = ''
  published = {}
  feed = ''
  tags = ''
  source = ''
  def __init__(self, name, id, link, text, author, published, feed, source, tags):
    super(RssEntry, self).__init__()
    self.name = name
    self.id = id
    self.link = link
    self.text = text
    self.author = author
    self.published = published
    self.feed = feed
    self.source = source
    self.tags = tags

class RequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

    def do_GET(self):
        self._set_headers()
        if self.path == '/feednames':
            self.wfile.write(get_all_feeds().to_json().encode('utf-8'))
        else:
            try:
                path = urllib.parse.unquote(self.path)
                feedname = re.search('feed=(.+?)&', path).group(1)
                pagesize = int(re.search('ps=(.+?)&', path).group(1))
                pagenum = int(re.search('pn=(.+?)$', path).group(1))
                self.wfile.write(get_feed_page(feedname, pagesize, pagenum).to_json().encode('utf-8'))
            except:
                self.wfile.write("Specify feedname, pg and ps params!".encode('utf-8'))

    def do_POST(self):
        self._set_headers()
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        feed = load_entries(re.search("'(.+?)'", str(post_data)).group(1))
        self.wfile.write(feed.encode('utf-8'))


def run(server_class=HTTPServer, handler_class=RequestHandler):
    server_address = ('', 8080)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()

def get_feed_page(feedname, pagesize, pagenum):
    query = db.table('rss').where('feed', '=', feedname).order_by('published', 'desc').skip(pagenum*pagesize).take(pagesize)
    return query.get()

def get_all_feeds():
    return db.table('rss').select('feed', 'source').distinct().get();

def load_entries(url):
    res = feedparser.parse(url)
    feed = res['feed']['title']
    for entry in res['entries']:
        title = entry['title']
        id = entry['id']
        link = entry['link']
        text = entry['summary']
        author = entry['author']
        published = datetime.datetime.strptime(entry['published'], '%a, %d %b %Y %H:%M:%S %Z')
        tags = ''
        print(entry['tags'])
        for tg in entry['tags']:
            tags = tags + ', ' + tg['term']
        ent = RssEntry(title, id, link, text, author, published, feed, url, tags[2:])
        try:
            ent.save()
        except:
            pass
    return feed

def main():
    Model.set_connection_resolver(db)
    run()

main()