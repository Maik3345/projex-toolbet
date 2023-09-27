import { ColorifyConstants, CustomCommand } from "../../api";
import { clone } from "../../modules";
import { TOOLBET_NAME } from "../../shared";

export default class Release extends CustomCommand {
  static description = "(Only for git users) Clone the passed repositories";

  static examples = [
    `${ColorifyConstants.COMMAND_OR_RELEASE_REF(
      `${TOOLBET_NAME} git clone 'https://Test@dev.azure.com/Team/Project/_git/' 'my-project-1, my-project-2'`
    )}`,
  ];

  static flags = {
    ...CustomCommand.globalFlags,
  };

  static args = [
    {
      name: "repositoryUrl",
      required: true,
      default: "",
      description: `Pass the base repository name url`,
    },
    {
      name: "repositoryList",
      required: true,
      default: "",
      description: `Pass the list of repositories to be released, this list must be separated by commas`,
    },
  ];

  async run() {
    const {
      args: { repositoryUrl, repositoryList },
    } = this.parse(Release);

    await clone(repositoryUrl, repositoryList);
  }
}
