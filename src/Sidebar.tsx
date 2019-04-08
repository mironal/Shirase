import React, { useState } from "react"
import { Store, DefaultGithubEndpoint, GHConfig } from "./store"

const EnterpriseForm = ({
  setPersonalToken,
}: Pick<SidebarProps["ghConfigs"], "setPersonalToken">) => {
  const [token, setToken] = useState("")
  const [url, setUrl] = useState("")

  return (
    <div>
      <input
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
    <li onClick={() => current.set(config.url)}>
      {config.url.replace("https://", "")}
    </li>
  )
}

const ConfigList = ({ ghConfigs, current }: SidebarProps) => {
  return (
    <ul>
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
  )
}
