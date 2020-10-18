import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function (configPath = './config.json') {
  const fullConfigPath = path.resolve(__dirname, '../', configPath);
  if (!fs.existsSync(fullConfigPath)) throw new Error('配置文件不存在');
  const unparsedConfig = fs.readFileSync(fullConfigPath, 'utf8');

  // console.log(unparsedConfig)

  let parsedConfig;
  try {
    parsedConfig = JSON.parse(unparsedConfig);
  } catch (err) {
    throw new Error('无法解析配置文件');
  }

  return parsedConfig;
}
