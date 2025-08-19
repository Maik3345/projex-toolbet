import { Hook } from '@oclif/core';
import { Colors } from '@api';

const banner = `
██████╗ ██████╗  ██████╗      ██╗███████╗██╗  ██╗
██╔══██╗██╔══██╗██╔═══██╗     ██║██╔════╝╚██╗██╔╝
██████╔╝██████╔╝██║   ██║     ██║█████╗   ╚███╔╝ 
██╔═══╝ ██╔══██╗██║   ██║██   ██║██╔══╝   ██╔██╗ 
██║     ██║  ██║╚██████╔╝╚█████╔╝███████╗██╔╝ ██╗
╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚════╝ ╚══════╝╚═╝  ╚═╝
`;

const init: Hook.Init = async function () {
  const argv = process.argv.join(' ');
  if (argv.includes('help') || process.argv.length <= 2) {
    console.log(Colors.CYAN(banner));
  }
};

export default init;
