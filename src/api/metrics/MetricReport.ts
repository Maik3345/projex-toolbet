import * as pkg from "../../../package.json";
import { getPlatform } from "../../shared/utils/getPlatform";

export interface Metric {
  command: string;
  [metricName: string]: number | string;
}

export interface MetricReportObj {
  metric: Metric;
  env: MetricEnv;
}

interface MetricEnv {
  toolbeltVersion: string;
  nodeVersion: string;
  platform: string;
}

interface MetricReportArguments {
  metric: Metric;
  env: MetricEnv;
}

export class MetricReport {
  public static create(metric: Metric, env?: MetricEnv) {
    if (env) {
      return new MetricReport({ metric, env });
    }
    return new MetricReport({
      metric,
      env: {
        toolbeltVersion: pkg.version,
        nodeVersion: process.version,
        platform: getPlatform(),
      },
    });
  }

  constructor({ metric, env }: MetricReportArguments) {
    this.metric = metric;
    this.env = env;
  }

  public readonly env: MetricEnv;
  public metric: Metric;

  public addMetric(metricName: string, value: number | string) {
    this.metric[metricName] = value;
  }

  public addMetrics(metrics: Record<string, number | string>) {
    Object.entries(metrics).forEach(([metricName, metricValue]) => {
      this.metric[metricName] = metricValue;
    });
  }

  public toObject(): MetricReportObj {
    return {
      metric: this.metric,
      env: this.env,
    };
  }
}
