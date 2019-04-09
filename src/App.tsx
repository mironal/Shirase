import React, { useEffect, useReducer } from "react"
import "./App.css"
import Sidebar from "./Sidebar"
import Viewer from "./Viewer"
import { reducer, initialState } from "./store"
import storage from "./storage"
import Octokit from "@octokit/rest"

function App() {
  const [state, dispatch] = useReducer(reducer, initialState())

  const fetchNotifications = async () => {
    const { url, personalToken } = state.ghConfigs[state.currentUrl]
    if (personalToken.length > 0) {
      const client = new Octokit({
        baseUrl: url,
        auth: personalToken,
      })

      const result = await client.activity
        .listNotifications({ all: true })
        .catch(error => {
          console.error("Error listNotifications", error)
          dispatch({ type: "setError", url, error })
        })
      if (result) {
        dispatch({ type: "clearError", url })
        dispatch({ type: "setLastUpdate", url, date: new Date() })
        if (result.status === 200) {
          dispatch({ type: "setNotification", url, notifications: result.data })
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
    const id = setInterval(() => {
      fetchNotifications()
    }, 1000 * 60)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    storage.currentConfig.set(state.currentUrl)
    fetchNotifications()
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
