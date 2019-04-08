import React, { useState, useEffect } from "react"
import "./App.css"
import Sidebar from "./Sidebar"
import Viewer from "./Viewer"
import { Store, DefaultGithubEndpoint } from "./store"
import storage from "./storage"
import Octokit, { ActivityListNotificationsResponseItem } from "@octokit/rest"

const token = storage.githubPersonalToken.get()

function App() {
  const [lastUpdates, setLastUpdates] = useState({} as { [url: string]: Date })
  const [currentConfig, setCurrentConfig] = useState(
    storage.currentConfig.get(),
  )
  const [configs, setConfigs] = useState(token)
  const [notifications, setNotifications] = useState({
    [DefaultGithubEndpoint]: [] as ActivityListNotificationsResponseItem[],
  })

  const [errors, setErrors] = useState({} as Store["notification"]["errors"])
  const store: Store = {
    current: {
      url: currentConfig,
      set: setCurrentConfig,
    },
    ghConfigs: {
      configs,
      setPersonalToken: (url: string, personalToken: string) => {
        setConfigs({ ...configs, ...{ [url]: { url, personalToken } } })
      },
      deletePersonalToken: (url: string) => {
        const cfgs = { ...configs }

        if (url === DefaultGithubEndpoint) {
          cfgs[url] = { url: DefaultGithubEndpoint, personalToken: "" }
        } else {
          delete cfgs[url]
        }

        setConfigs(cfgs)
      },
    },
    notification: {
      errors,
      setError: (url: string, error: Error | null) => {
        const errs = { ...errors }
        if (error) {
          errs[url] = error
        } else {
          delete errs[url]
        }
        setErrors(errs)
      },
      lastUpdates,
      setLastUpdates: (url: string, date: Date) => {
        setLastUpdates({
          ...lastUpdates,
          ...{ [url]: date },
        })
      },
      notifications,
      setNotifications: (
        url: string,
        ns: ActivityListNotificationsResponseItem[],
      ) => {
        setNotifications({
          ...notifications,
          ...{ [url]: ns },
        })
      },
    },
  }

  const fetchNotifications = async () => {
    const { url, personalToken } = configs[currentConfig]
    if (personalToken.length > 0) {
      const client = new Octokit({
        baseUrl: url,
        auth: personalToken,
      })

      const result = await client.activity
        .listNotifications({ all: true })
        .catch(error => {
          console.error("Error listNotifications", error)
          store.notification.setError(url, error)
        })
      if (result) {
        store.notification.setError(url, null)
        store.notification.setLastUpdates(url, new Date())
        if (result.status === 200) {
          store.notification.setNotifications(url, result.data)
        }
      }
    }
  }

  useEffect(() => {
    if (Object.keys(configs).length === 0) {
      storage.githubPersonalToken.set(null)
    } else {
      storage.githubPersonalToken.set(configs)
    }
  }, [configs])

  useEffect(() => {
    const id = setInterval(() => {
      fetchNotifications()
    }, 1000 * 60)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    storage.currentConfig.set(currentConfig)
    fetchNotifications()
  }, [currentConfig])

  return (
    <div className="App">
      <Sidebar {...store} />
      <Viewer {...store} />
    </div>
  )
}

export default App
