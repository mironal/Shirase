import React, { useState } from "react"
import { Store, DefaultGithubEndpoint, GHConfig } from "./store"
import classnames from "classnames"

const EnterpriseForm = ({
  setPersonalToken,
}: Pick<SidebarProps["ghConfigs"], "setPersonalToken">) => {
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

export type SidebarProps = Pick<Store, "ghConfigs" | "current">

const Config = ({
  config,
  current,
}: {
  config: GHConfig
  current: SidebarProps["current"]
}) => {
  return (
    <li
      className={classnames("Config", { active: current.url === config.url })}
      onClick={() => current.set(config.url)}
    >
      {config.url.replace("https://", "").replace("/api/v3", "")}
    </li>
  )
}

const ConfigList = ({ ghConfigs, current }: SidebarProps) => {
  return (
    <ul className="ConfigList">
      {Object.values(ghConfigs.configs).map(config => (
        <Config key={config.url} {...{ config, current }} />
      ))}
    </ul>
  )
}

export default function({ ghConfigs, current }: SidebarProps) {
  const { configs, setPersonalToken, deletePersonalToken } = ghConfigs
  const personalToken = configs[DefaultGithubEndpoint].personalToken
  const [token, setToken] = useState(personalToken)

  return (
    <div className="Sidebar">
      <ConfigList {...{ ghConfigs, current }} />
      <div>
        <input
          type="password"
          placeholder="GitHub personal token"
          value={token}
          onChange={e => setToken(e.target.value)}
        />
        {personalToken.length > 0 ? (
          <button onClick={() => deletePersonalToken(DefaultGithubEndpoint)}>
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
        {personalToken.length > 0 && <EnterpriseForm {...ghConfigs} />}
      </div>
    </div>
  )
}
