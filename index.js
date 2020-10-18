import printLogo from 'core/utils/print-logo';
import buildSquadJS from 'factory';

printLogo();

buildSquadJS('config/1.json')
  .then((server)=>server.watch())
  .catch(console.log);

/*
buildSquadJS('config/2.json')
  .then((server)=>server.watch())
  .catch(console.log);
*/