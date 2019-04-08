import React, { useState, SFC } from "react"
import { Store } from "./store"
import { ActivityListNotificationsResponseItem } from "@octokit/rest"
import classnames from "classnames"

export type ViewerProps = Pick<Store, "notification" | "current">

const htmlURLFromApiURL = (url: string): string => {
  return url
    .replace("https://api.github.com/repos/", "https://github.com/")
    .replace("/api/v3/repos/", "")
    .replace("/pulls/", "/pull/")
}

const Notification = (notification: ActivityListNotificationsResponseItem) => {
  const row = (
    <p key={notification.id}>
      <a target="_blank" href={htmlURLFromApiURL(notification.subject.url)}>
        {notification.subject.title}
      </a>
      <span>{notification.repository.full_name}</span>
      <span> </span>
      <span>{notification.reason}</span>
      {notification.unread && <button>Mark as Read</button>}
    </p>
  )

  if (notification.unread) {
    return row
  }
  return <s key={notification.id}>{row}</s>
}

const NotificationFilter = ({
  numOfFiltered,
  onlyUnread,
  onChangeOnlyUnread,
}: {
  numOfFiltered: number
  onlyUnread: boolean
  onChangeOnlyUnread(check: boolean): void
}) => {
  return (
    <div className="NotificationFilter">
      <input
        onChange={e => onChangeOnlyUnread(e.target.checked)}
        type="checkbox"
        value="unread"
        checked={onlyUnread}
      />{" "}
      Only Unread
      <span>Filtered {numOfFiltered} notifications</span>
    </div>
  )
}

const DIV: SFC = ({ children }) => <div className="Viewer">{children}</div>

export default ({ notification, current }: ViewerProps) => {
  const [onlyUnread, setOnlyUnread] = useState(true)

  if (notification.errors[current.url]) {
    return (
      <DIV>
        <p className="error">
          Error: {notification.errors[current.url].message}
        </p>
      </DIV>
    )
  }

  if (!notification.lastUpdates[current.url]) {
    return <DIV>Loading...</DIV>
  }
  const ns = notification.notifications[current.url] || []

  const filterd = ns.filter(n => {
    if (onlyUnread) {
      return n.unread
    }
    return true
  })

  const numOfFiltered = ns.length - filterd.length

  return (
    <DIV>
      <NotificationFilter
        {...{ numOfFiltered, onlyUnread, onChangeOnlyUnread: setOnlyUnread }}
      />
      {filterd.map(Notification)}
      <p>
        <span>
          Last updated at: {notification.lastUpdates[current.url].toUTCString()}
        </span>
      </p>
    </DIV>
  )
}
