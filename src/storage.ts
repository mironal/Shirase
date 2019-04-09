import { State, DefaultGithubEndpoint } from "./store"

const makeKey = (key: string) => `SHIRASE_${key}`

const GithubPersonalTokenKey = makeKey("Github_personal_token")
const storeGithubPersonalToken = (configs: State["ghConfigs"] | null) => {
  if (configs && Object.keys(configs).length > 0) {
    localStorage.setItem(GithubPersonalTokenKey, JSON.stringify(configs))
  } else {
    localStorage.removeItem(GithubPersonalTokenKey)
  }
}

const restoreGithubConfig = () => {
  const str = localStorage.getItem(GithubPersonalTokenKey)
  if (str !== null) {
    return JSON.parse(str) as State["ghConfigs"]
  }

  return {
    [DefaultGithubEndpoint]: {
      url: DefaultGithubEndpoint,
      personalToken: "",
    },
  } as State["ghConfigs"]
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
