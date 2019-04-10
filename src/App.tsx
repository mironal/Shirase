import React, { useEffect, useReducer, useCallback, useRef } from "react"
import "./App.css"
import Sidebar from "./Sidebar"
import Viewer from "./Viewer"
import { reducer, initialState } from "./store"
import storage from "./storage"
import Octokit from "@octokit/rest"

const lastModified: { [url: string]: string } = {}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState())

  const fetchNotifications = async (url: string) => {
    const { personalToken } = state.ghConfigs[url]
    if (personalToken.length > 0) {
      const client = new Octokit({
        baseUrl: url,
        auth: personalToken,
      })

      let firstRequest = true
      if (lastModified[url]) {
        firstRequest = false
        client.hook.before("request", option => {
          option.headers["If-Modified-Since"] = lastModified[url]
        })

        client.hook.error("request", error => {
          if (error.status === 304) {
            return state.notifications
          }
          throw error
        })
      }

      const result = await client.activity
        .listNotifications({ all: true })
        .catch(error => {
          console.error("Error listNotifications", error)
          dispatch({ type: "setError", url, error })
        })
      if (result) {
        dispatch({ type: "clearError", url })
        dispatch({ type: "setLastUpdate", url, date: new Date() })
        // TODO 差分を表示 or 新しいものを強調表示
        if (result.status === 200) {
          lastModified[url] = result.headers["last-modified"]
          dispatch({ type: "setNotification", url, notifications: result.data })

          if (!firstRequest && Notification.permission === "granted") {
            new Notification(`New notification ${result.data[0].subject.title}`)
          }
        }
      }
    }
  }

  useEffect(() => {
    if (Object.keys(state.ghConfigs).length === 0) {
      storage.githubPersonalToken.set(null)
    } else {
      storage.githubPersonalToken.set(state.ghConfigs)
    }
  }, [state.ghConfigs])

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission(permission => {
        if (permission === "granted") {
          new Notification("Thank you ₍₍ (ง ˙ω˙)ว ⁾⁾")
        }
      })
    }
  }, [])

  useEffect(() => {
    storage.currentConfig.set(state.currentUrl)
    fetchNotifications(state.currentUrl)

    const id = setInterval(() => {
      fetchNotifications(state.currentUrl)
    }, 1000 * 60)
    return () => clearInterval(id)
  }, [state.currentUrl])

  return (
    <div className="App">
      <Sidebar
        {...state}
        setCurrentUrl={url => dispatch({ type: "setCurrentUrl", url })}
        setPersonalToken={(url, token) =>
          dispatch({ type: "setPersonalToken", url, token })
        }
        removePersonalToken={url =>
          dispatch({ type: "removePersonalToken", url })
        }
      />
      <Viewer {...state} />
    </div>
  )
}

export default App
