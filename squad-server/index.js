import EventEmitter from 'events';

import Gamedig from 'gamedig';

import LogParser from './log-parser/index.js';
import Rcon from './rcon/index.js';

import {
  LAYER_CHANGE,
  PLAYERS_UPDATED,
  LAYERS_UPDATED,
  A2S_INFO_UPDATED,
  NEW_GAME
} from './events.js';

export default class Server extends EventEmitter {
  constructor(options = {}) {
    super();

    // console.log(options)

    // 检查服务器配置
    if (!('id' in options)) throw new Error('服务器ID不能为空');
    this.id = options.id;

    if (!('host' in options)) throw new Error('服务器Host不能为空');
    this.host = options.host;

    if (!('queryPort' in options)) throw new Error('服务器查询端口不能为空');
    this.queryPort = options.queryPort;

    // 服务器信息更新时间 默认：30秒
    this.updateInterval = options.updateInterval || 30 * 1000;

    // 设置类
    this.rcon = new Rcon(options, this);
    this.logParser = new LogParser(options, this);

    // 设置内部储存
    this.layerHistory = options.layerHistory || [];
    this.layerHistoryMaxLength = options.layerHistoryMaxLength || 20;

    this.players = [];

    // 设置玩家内存储存变量
    this.suffixStore = {};

    // 设置内部监听器
    this.on(NEW_GAME, this.onLayerChange.bind(this));

    // 设置时间更新
    this.updatePlayers = this.updatePlayers.bind(this);
    this.updatePlayerTimeout = setTimeout(this.updatePlayers, this.updateInterval);


    setTimeout(async () => {
      const data = await this.rcon.getMapInfo();
      // console.log(data);
      this.currentLayer = data.currentLayer;
      this.nextLayer = data.nextLayer;
      this.emit(LAYERS_UPDATED, data);

      this.players = await this.rcon.listPlayers();
      for (let i = 0; i < this.players.length; i++) {
        this.players[i].suffix = this.suffixStore[this.players[i].steamID];
      }
      this.emit(PLAYERS_UPDATED, this.players);
    }, 1000)





    // 更新服务器地图
    setInterval(async () => {
      const data = await this.rcon.getMapInfo();
      // console.log(data);
      this.currentLayer = data.currentLayer;
      this.nextLayer = data.nextLayer;
      this.emit(LAYERS_UPDATED, data);
    }, this.updateInterval);

    setInterval(async () => {
      const data = await Gamedig.query({
        type: 'squad',
        host: this.host,
        port: this.queryPort
      });

      this.serverName = data.name;

      this.maxPlayers = parseInt(data.maxplayers);
      this.publicSlots = parseInt(data.raw.rules.NUMPUBCONN);
      this.reserveSlots = parseInt(data.raw.rules.NUMPRIVCONN);

      this.playerCount = parseInt(data.raw.rules.PlayerCount_i);
      this.publicQueue = parseInt(data.raw.rules.PublicQueue_i);
      this.reserveQueue = parseInt(data.raw.rules.ReservedQueue_i);

      this.matchTimeout = parseFloat(data.raw.rules.MatchTimeout_f);
      this.gameVersion = data.raw.version;

      this.emit(A2S_INFO_UPDATED, {
        serverName: this.serverName,
        maxPlayers: this.maxPlayers,
        publicSlots: this.publicSlots,
        reserveSlots: this.reserveSlots,
        playerCount: this.playerCount,
        publicQueue: this.publicQueue,
        reserveQueue: this.reserveQueue,
        matchTimeout: this.matchTimeout,
        gameVersion: this.gameVersion
      });
    }, this.updateInterval);
  }

  async watch() {
    if (this.logParser) await this.logParser.watch();
    if (this.rcon) await this.rcon.watch();
    console.log(`[系统消息] 开始监听服务器 ${this.id}`);
  }

  async unwatch() {
    if (this.logParser) await this.logParser.unwatch();
    if (this.rcon) await this.rcon.unwatch();
    console.log(`[系统消息] 取消监听服务器 ${this.id}`);
  }

  async updatePlayers() {
    clearTimeout(this.updatePlayerTimeout);

    this.players = await this.rcon.listPlayers();

    // console.log(this.players);

    // 存储玩家信息
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].suffix = this.suffixStore[this.players[i].steamID];
    }

    // 创建下一次延迟更新
    this.updatePlayerTimeout = setTimeout(this.updatePlayers, this.updateInterval);

    this.emit(PLAYERS_UPDATED, this.players);
  }

  async getPlayerByName(name, suffix = false) {
    let matchingPlayers;

    matchingPlayers = [];
    for (const player of this.players) {
      if (player[suffix ? 'suffix' : 'name'] !== name) continue;
      matchingPlayers.push(player);
    }

    if (matchingPlayers.length === 0 && suffix === false) {
      await this.updatePlayers();

      matchingPlayers = [];
      for (const player of this.players) {
        if (player[suffix ? 'suffix' : 'name'] !== name) continue;
        matchingPlayers.push(player);
      }
    }

    if (matchingPlayers.length === 1) return matchingPlayers[0];
    else return null;
  }

  async getPlayerBySteamID(steamID) {
    let matchingPlayers;

    matchingPlayers = [];
    for (const player of this.players) {
      if (player.steamID !== steamID) continue;
      matchingPlayers.push(player);
    }

    if (matchingPlayers.length === 0) {
      await this.updatePlayers();

      matchingPlayers = [];
      for (const player of this.players) {
        if (player.steamID !== steamID) continue;
        matchingPlayers.push(player);
      }
    }

    return matchingPlayers[0];
  }

  onLayerChange(info) {
    this.layerHistory.unshift(info);
    this.layerHistory = this.layerHistory.slice(0, this.layerHistoryMaxLength);
    this.emit(LAYER_CHANGE, info);
  }
}
