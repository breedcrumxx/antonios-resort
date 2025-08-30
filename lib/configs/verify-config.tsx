import { ConfigType } from "./config-file"
import { loadConfig } from "./load-config"

export const verifyConfig = async <T,>(dataConfig: ConfigType | null | undefined, target: string, defaultConfig: T): Promise<T> => {

  let config: T;

  if (!dataConfig) { // check the existence
    // if no config, load the defaults
    config = defaultConfig

    // insert the default config
    if (typeof defaultConfig === 'string') {
      loadConfig(target, defaultConfig, false)
    } else {
      loadConfig(target, JSON.stringify(defaultConfig), false)
    }

  } else {
    if (dataConfig.config.length == 0) {
      // there's a config but no data
      config = defaultConfig

      // update the default config
      if (typeof defaultConfig === 'string') {
        loadConfig(target, defaultConfig, false)
      } else {
        loadConfig(target, JSON.stringify(defaultConfig), false)
      }
    } else { // there's a config
      if (typeof defaultConfig === 'string') { // but string
        config = dataConfig.config as unknown as T
      } else { // a typical Config object
        config = JSON.parse(dataConfig.config)
      }
    }
  }

  return config
}