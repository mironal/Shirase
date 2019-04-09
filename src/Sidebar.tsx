import React, { useState } from "react"
import { DefaultGithubEndpoint, State } from "./store"
import classnames from "classnames"

const EnterpriseForm = ({
  setPersonalToken,
}: Pick<SidebarProps, "setPersonalToken">) => {
  const [token, setToken] = useState("")
  const [url, setUrl] = useState("")

  return (
    <div>
      <input
        type="text"
        placeholder="enterprise url"
        value={url}
        onChange={e => setUrl(e.target.value)}
      />
      <input
        type="password"
        placeholder="GitHub personal token"
        value={token}
        onChange={e => setToken(e.target.value)}
      />
      <p className="small">Enter: https://your.ghe.domain/api/v3</p>
      <button onClick={() => setPersonalToken(url, token)}>
        Add Enterprise
      </button>
    </div>
  )
}

export type SidebarProps = Pick<State, "currentUrl" | "ghConfigs"> & {
  setPersonalToken(url: string, token: string): void
  removePersonalToken(url: string): void
  setCurrentUrl(url: string): void
}

const Config = ({
  url,
  currentUrl,
  setCurrentUrl,
}: Pick<SidebarProps, "currentUrl" | "setCurrentUrl"> & { url: string }) => {
  return (
    <li
      className={classnames("Config", { active: currentUrl === url })}
      onClick={() => setCurrentUrl(url)}
    >
      {url.replace("https://", "").replace("/api/v3", "")}
    </li>
  )
}

const ConfigList = ({ ghConfigs, currentUrl, setCurrentUrl }: SidebarProps) => {
  return (
    <ul className="ConfigList">
      {Object.keys(ghConfigs).map(url => (
        <Config key={url} {...{ url, currentUrl, setCurrentUrl }} />
      ))}
    </ul>
  )
}

export default function(props: SidebarProps) {
  const { ghConfigs, removePersonalToken, setPersonalToken } = props

  const personalToken = ghConfigs[DefaultGithubEndpoint].personalToken
  const [token, setToken] = useState(personalToken)
  return (
    <div className="Sidebar">
      <ConfigList {...props} />
      <div>
        <input
          type="password"
          placeholder="GitHub personal token"
          value={token}
          onChange={e => setToken(e.target.value)}
        />
        {personalToken.length > 0 ? (
          <button onClick={() => removePersonalToken(DefaultGithubEndpoint)}>
            Delete token
          </button>
        ) : (
          <button
            onClick={() => setPersonalToken(DefaultGithubEndpoint, token)}
            disabled={token.length === 0}
          >
            Configure GitHub Token
          </button>
        )}
        {personalToken.length > 0 && <EnterpriseForm {...props} />}
      </div>
    </div>
  )
}
