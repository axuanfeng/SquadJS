import autoTKWarn from './auto-tk-warn/index.js';
import intervalledBroadcasts from './intervalled-broadcasts/index.js';
import mapvote123 from './mapvote/mapvote-123.js';
import mapvoteDidYouMean from './mapvote/mapvote-did-you-mean.js';
import mysqlLog from './mysql-log/index.js';
import seedingMessage from './seeding-message/index.js';
import skipMap from './skipmap/index.js';
import teamRandomizer from './team-randomizer/index.js';
import clanRandomizer from './clan-randomizer/index.js';
import httpApi from './http-api/index.js';
import chatCommands from './chat-commands/index.js';

export {
  autoTKWarn,
  chatCommands,
  intervalledBroadcasts,
  mapvote123,
  mapvoteDidYouMean,
  mysqlLog,
  seedingMessage,
  skipMap,
  httpApi,
  teamRandomizer,
  clanRandomizer
};

const plugins = [
  autoTKWarn,
  chatCommands,
  intervalledBroadcasts,
  mapvote123,
  mapvoteDidYouMean,
  mysqlLog,
  seedingMessage,
  skipMap,
  httpApi,
  teamRandomizer,
  clanRandomizer
];

const namedPlugins = {};
for (const plugin of plugins) {
  namedPlugins[plugin.name] = plugin;
}
export default namedPlugins;
