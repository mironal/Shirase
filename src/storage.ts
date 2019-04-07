import { Store, DefaultGithubEndpoint } from "./store"

const makeKey = (key: string) => `SHIRASE_${key}`

const GithubPersonalTokenKey = makeKey("Github_personal_token")
const storeGithubPersonalToken = (
  configs: Store["ghConfigs"]["configs"] | null,
) => {
  if (configs && Object.keys(configs).length > 0) {
    localStorage.setItem(GithubPersonalTokenKey, JSON.stringify(configs))
  } else {
    localStorage.removeItem(GithubPersonalTokenKey)
  }
}

const restoreGithubConfig = () => {
  const str = localStorage.getItem(GithubPersonalTokenKey)
  if (str !== null) {
    return JSON.parse(str) as Store["ghConfigs"]["configs"]
  }

  return {
    [DefaultGithubEndpoint]: {
      url: DefaultGithubEndpoint,
      personalToken: "",
    },
  } as Store["ghConfigs"]["configs"]
}

const GithubCurrentConfigKey = makeKey("Github_Current_Config")

export default {
  githubPersonalToken: {
    set: storeGithubPersonalToken,
    get: restoreGithubConfig,
  },
  currentConfig: {
    set: (value: string) => localStorage.setItem(GithubCurrentConfigKey, value),
    get: () =>
      localStorage.getItem(GithubCurrentConfigKey) || DefaultGithubEndpoint,
  },
}
