import { ActivityListNotificationsResponseItem } from "@octokit/rest"

export const DefaultGithubEndpoint = "https://api.github.com"

export interface GHConfig {
  url: string
  personalToken: string
}

export interface Store {
  current: {
    url: string
    set: (url: string) => void
  }
  ghConfigs: {
    configs: { [url: string]: GHConfig }
    setPersonalToken: (url: string, token: string) => void
    deletePersonalToken: (url: string) => void
  }
  notification: {
    errors: { [url: string]: Error }
    setError: (url: string, error: Error | null) => void
    lastUpdates: { [url: string]: Date }
    setLastUpdates: (url: string, date: Date) => void
    notifications: { [url: string]: ActivityListNotificationsResponseItem[] }
    setNotifications: (
      url: string,
      notifications: ActivityListNotificationsResponseItem[],
    ) => void
  }
}
