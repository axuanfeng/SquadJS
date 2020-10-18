import { CHAT_MESSAGE } from 'squad-server/events';

export default {
  name: 'team-randomizer',
  description: '这个快速打乱全部玩家阵营插件，可以在管理员频道输入 <code>/打乱全部阵营</code> 来进行打乱',
  defaultEnabled: true,
  optionsSpec: {
    command: {
      required: false,
      description: '打乱全部玩家阵营命令',
      default: '/打乱全部阵营'
    },
    msg: {
      required: false,
      description: '广播消息',
      default: '打乱全部玩家阵营'
    }
  },

  init: async (server, options) => {
    const commandRegex = new RegExp(`^${options.command}`, 'i');

    server.on(CHAT_MESSAGE, (info) => {
      if (info.chat !== 'ChatAdmin') return;

      const match = info.message.match(commandRegex);
      if (!match) return;

      const players = server.players.slice(0);

      let currentIndex = players.length;
      let temporaryValue;
      let randomIndex;

      // 打乱玩家顺序
      while (currentIndex !== 0) {
        // 随机玩家
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // 互换
        temporaryValue = players[currentIndex];
        players[currentIndex] = players[randomIndex];
        players[randomIndex] = temporaryValue;
      }

      let team = '1';

      for (const player of players) {
        if (player.teamID !== team) {
          server.rcon.execute(`AdminForceTeamChange "${player.steamID}"`);
        }
        team = team === '1' ? '2' : '1';
      }
      server.rcon.broadcast(options.msg);
    });
  }
};
