import { ActivityListNotificationsResponseItem } from "@octokit/rest"
import storage from "./storage"
import { Reducer } from "react"

export const DefaultGithubEndpoint = "https://api.github.com"

export interface GHConfig {
  url: string
  personalToken: string
}

export interface State {
  currentUrl: string
  ghConfigs: { [url: string]: GHConfig }
  lastUpdates: { [url: string]: Date }
  notifications: {
    [url: string]: ActivityListNotificationsResponseItem[]
  }
  errors: {
    [url: string]: Error
  }
}

export type Action =
  | { type: "setCurrentUrl"; url: string }
  | { type: "setPersonalToken"; url: string; token: string }
  | { type: "removePersonalToken"; url: string }
  | { type: "setError"; error: Error; url: string }
  | { type: "clearError"; url: string }
  | { type: "setLastUpdate"; url: string; date: Date }
  | {
      type: "setNotification"
      url: string
      notifications: ActivityListNotificationsResponseItem[]
    }

export const reducer: Reducer<State, Action> = (state, action) => {
  const next = r(state, action)
  if (process.env.NODE_ENV !== "production") {
    console.log("[Dispatch]", {
      action,
      prev: state,
      next,
    })
  }
  return next
}

const r: Reducer<State, Action> = (state: State, action: Action) => {
  switch (action.type) {
    case "setPersonalToken": {
      const ghConfigs = {
        ...state.ghConfigs,
        [action.url]: { personalToken: action.token, url: action.url },
      }
      return { ...state, ghConfigs }
    }
    case "removePersonalToken": {
      const ghConfigs = { ...state.ghConfigs }
      delete ghConfigs[action.url]
      return { ...state, ghConfigs }
    }
    case "setCurrentUrl": {
      return { ...state, currentUrl: action.url }
    }
    case "setError": {
      const errors = { ...state.errors, [action.url]: action.error }
      return { ...state, errors }
    }
    case "clearError": {
      const errors = { ...state.errors }
      delete errors[action.url]
      return { ...state, errors }
    }
    case "setLastUpdate": {
      const lastUpdates = { ...state.lastUpdates, [action.url]: action.date }
      return { ...state, lastUpdates }
    }
    case "setNotification": {
      const notifications = {
        ...state.notifications,
        [action.url]: action.notifications,
      }
      return { ...state, notifications }
    }
    default:
      throw new Error(`Unknown type: ${action}`)
  }
}

export const initialState = (): State => ({
  currentUrl: storage.currentConfig.get(),
  ghConfigs: storage.githubPersonalToken.get(),
  lastUpdates: {},
  notifications: {},
  errors: {},
})
