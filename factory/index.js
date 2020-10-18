import readConfig from './read-config.js';
import buildSquadServer from './build-squad-server.js';
import buildConnectors from './build-connectors.js';

import plugins from 'plugins';

export default async function (configPath) {
  console.log('[系统消息] 初始化 SquadJS');

  console.log('[系统消息] 获取配置文件');
  const config = readConfig(configPath);

  console.log('[系统消息] 构建Squad服务器');
  const server = buildSquadServer(config);

  console.log('[系统消息] 初始化连接');
  const connectors = await buildConnectors(config);

  console.log('[系统消息] 加载插件...');
  for (const pluginConfig of config.plugins) {
    if (!pluginConfig.enabled) continue;

    console.log(`[系统消息] 插件 ${pluginConfig.plugin} 加载成功`);
    const plugin = plugins[pluginConfig.plugin];

    const options = {};
    for (const optionName of Object.keys(plugin.optionsSpec)) {
      const option = plugin.optionsSpec[optionName];

      if (['discordClient', 'mysqlPool', 'layerFilter'].includes(optionName)) {
        options[optionName] = connectors[pluginConfig[optionName]];
      } else {
        if (option.required) {
          if (!(optionName in pluginConfig))
            throw new Error(`${plugin.name}: ${optionName} is required but missing.`);
          if (option.default === pluginConfig[optionName])
            throw new Error(`${plugin.name}: ${optionName} is required but is the default value.`);
        }

        options[optionName] = pluginConfig[optionName] || option.default;
      }
    }

    await plugin.init(server, options);
  }

  return server;
}
