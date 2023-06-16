import { ParsingToken } from "@oclif/parser/lib/parse";
import { TraceConfig } from "../../shared/globalConfigs/traceConfig";
import * as Parser from "@oclif/parser";
import OclifCommand, { flags as oclifFlags } from "@oclif/command";

export abstract class CustomCommand extends OclifCommand {
  public static globalFlags = {
    verbose: oclifFlags.boolean({
      char: "v",
      description: "Shows debug level logs.",
      default: false,
    }),
    help: oclifFlags.help({
      char: "h",
      description: "Shows this help message.",
    }),
  };

  getAllArgs(rawParse: ParsingToken[]) {
    return rawParse
      .filter((token) => token.type === "arg")
      .map((token) => token.input);
  }

  protected parse<
    F,
    A extends {
      [name: string]: any;
    }
  >(options?: Parser.Input<F>, argv?: string[]): Parser.Output<F, A> {
    const result = super.parse<F, A>(options, argv);
    TraceConfig.setupTraceConfig((result.flags as any).trace);
    return result;
  }

  async _run<T>(): Promise<T | undefined> {
    let err: Error | undefined;
    try {
      // remove redirected env var to allow subsessions to run autoupdated client
      delete process.env[this.config.scopedEnvVarKey("REDIRECTED")];
      await this.init();
      const result = await this.run();
      return result;
    } catch (error) {
      err = error;
      await this.catch(error);
    } finally {
      await this.finally(err);
    }
  }

  async finally(err: any): Promise<any> {
    try {
      if (err && err.oclif === undefined) console.log(err);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { config } = require("@oclif/errors");
      if (config.errorLogger) await config.errorLogger.flush();
    } catch (error) {
      console.error(error);
    }
  }
}
