import { CHAT_MESSAGE } from 'squad-server/events';

export default {
  name: 'clan-randomizer',
  description: '这个快速打乱战队玩家阵营插件，可以在管理员频道输入 <code>/打乱战队阵营</code> 来进行打乱',
  defaultEnabled: true,
  optionsSpec: {
    command: {
      required: false,
      description: '打乱战队玩家阵营命令',
      default: '/打乱战队阵营'
    },
    teams: {
      required: false,
      description: '战队前缀列表',
      default: ['E.M.A.N','G.S.G.9','O.W.L.S','大山猫','A小组','OWL','GSG9','EMAN','UNSC','SAGA','USA','KSK','TAG','GRU','OMC','OCD','近卫','皇家','武装','偷鷄','狼群','邮差','部落','81','[F]','160','101','NN']
    },
    msg: {
      required: false,
      description: '广播消息',
      default: '打乱战队玩家阵营'
    }
  },

  init: async (server, options) => {
    const commandRegex = new RegExp(`^${options.command}`, 'i');

    server.on(CHAT_MESSAGE, (info) => {
      if (info.chat !== 'ChatAdmin') return;

      const match = info.message.match(commandRegex);
      if (!match) return;

      const players = server.players.slice(0);
      let TeamPlayers = [];

      for (const player of players){
        for (const team of options.teams){
          if (player.name.indexOf(team)!==-1){
            TeamPlayers.push(player.steamID)
            break;
          }
        }
      }

      if (!Array.prototype.derangedArray) {
        Array.prototype.derangedArray = function() {
          for(let j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
          let s1 = new Set(this);
          return Array.from(s1);
        };
      }

      TeamPlayers = TeamPlayers.derangedArray();
      let L = TeamPlayers.length/2;
      let i = 0;
      while (i<L){
        server.rcon.execute(`AdminForceTeamChange "${TeamPlayers[i]}"`);
      }
      server.rcon.broadcast(options.msg);
    });
  }
};