import React, { useState } from "react"
import { Store } from "./store"
import { ActivityListNotificationsResponseItem } from "@octokit/rest"

export type ViewerProps = Pick<Store, "notification" | "current">

const Notification = (notification: ActivityListNotificationsResponseItem) => {
  const row = (
    <p key={notification.id}>
      <a href={notification.subject.url}>{notification.subject.title}</a>
      {notification.repository.full_name}
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

export default ({ notification, current }: ViewerProps) => {
  const [onlyUnread, setOnlyUnread] = useState(true)

  if (!notification.lastUpdates[current.url]) {
    return <div className="Viewer">Loading...</div>
  }

  const filterd = notification.notifications[current.url].filter(n => {
    if (onlyUnread) {
      return n.unread
    }
    return true
  })

  const numOfFiltered =
    notification.notifications[current.url].length - filterd.length

  return (
    <div className="Viewer">
      <NotificationFilter
        {...{ numOfFiltered, onlyUnread, onChangeOnlyUnread: setOnlyUnread }}
      />
      {filterd.map(Notification)}
      <p>
        <span>
          Last updated at:{" "}
          {notification.lastUpdates[current.url].toDateString()}
        </span>
      </p>
    </div>
  )
}
