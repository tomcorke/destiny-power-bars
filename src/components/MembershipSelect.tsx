import React from 'react'
import { UserInfoCard, BungieMembershipType } from 'bungie-api-ts/user';
import classnames from 'classnames'

import STYLES from './MembershipSelect.module.scss'
import { getDestinyMemberships } from '../services/bungie-auth';

interface MembershipSelectProps {
  onMembershipSelect: (membership: UserInfoCard) => any
}

const MembershipSelect = ({ onMembershipSelect }: MembershipSelectProps) => {

  const destinyMemberships = getDestinyMemberships()

  if (!destinyMemberships) return null

  if (destinyMemberships.length === 1) return null

  if (destinyMemberships.length === 0) {
    return <div>No destiny memberships!</div>
  }

  const PLATFORMS: { [key: number]: string } = {
    1: 'xbox',
    2: 'psn',
    4: 'blizzardx'
  }

  return (
    <div className={STYLES.membershipSelect}>
      {destinyMemberships.map(m => {
        return (
          <div
            key={m.membershipId}
            className={classnames(STYLES.membership, STYLES[`platform_${PLATFORMS[m.membershipType]}`])}
            onClick={() => onMembershipSelect(m)}>
            {m.displayName}
          </div>
        )
      })}
    </div>
  )

}

export default MembershipSelect