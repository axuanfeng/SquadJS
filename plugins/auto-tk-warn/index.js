import { TEAMKILL } from 'squad-server/events';

export default {
  name: 'auto-tk-warn',
  description: '当出现玩家TK时，使用 <code>AdminWarn</code> 命令警告',
  defaultEnabled: true,
  optionsSpec: {
    message: {
      required: false,
      description: '警告玩家的消息',
      default: '误伤友军请及时在公共频道(J)道歉！'
    }
  },

  init: async (server, options) => {
    server.on(TEAMKILL, (info) => {
      // 忽略自杀
      if (info.attacker.steamID === info.victim.steamID) return;
      server.rcon.warn(info.attacker.steamID, options.message);
    });
  }
};
