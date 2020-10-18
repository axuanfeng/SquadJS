import {LAYERS_UPDATED, PLAYERS_UPDATED} from 'squad-server/events';
import http from "http";
import url from 'url';

const Map = [];
const Players = [];
const Password = [];

http.createServer(function(req, res){
  res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
  let data = url.parse(req.url, true);

  if (data['pathname']!=='/api') return;
  let $_ = JSON.parse(JSON.stringify(data['query']));

  let id = Number($_['id']);

  if (Players[id]){
    if (Password[id]===$_['password']){
      res.end(JSON.stringify({code:1, time:getFormatDate(), map: Map[id], players:Players[id]}));
    }else {
      res.end(JSON.stringify({code:0, time:getFormatDate(), msg:'ApiKey错误'}));
    }
    return;
  }
  res.end(JSON.stringify({code:0, time:getFormatDate(), msg:'ID不存在'}));
}).listen(3300);

export default {
  name: 'http-api',
  description: 'API接口',
  defaultEnabled: true,
  optionsSpec: {},

  init: async (server, options) => {

    Password[server.id] = server.rcon.password;

    server.on(PLAYERS_UPDATED, (data) => {
      Players[server.id] = data;
    });

    server.on(LAYERS_UPDATED, (data) => {
      Map[server.id] = data;
    });
  }
};

function getFormatDate() {
  let date = new Date();
  let month = date.getMonth() + 1;
  let strDate = date.getDate();
  let Hours = date.getHours();
  let Minutes = date.getMinutes();
  let Second = date.getSeconds();
  if (month >= 1 && month <= 9) month = "0" + month;
  if (strDate >= 0 && strDate <= 9) strDate = "0" + strDate;
  if (Hours >= 0 && Hours <= 9) Hours = "0" + Hours;
  if (Minutes >= 0 && Minutes <= 9) Minutes = "0" + Minutes;
  if (Second >= 0 && Second <= 9) Second = "0" + Second;
  return date.getFullYear() + "-" + month + "-" + strDate + " " + Hours + ":" + Minutes + ":" + Second;
}