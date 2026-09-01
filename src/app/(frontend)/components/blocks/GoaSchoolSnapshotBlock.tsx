'use client'

import React from 'react'
import GoaSchoolSnapshotSection from './goa-school-snapshot/GoaSchoolSnapshotSection'
import type { GoaSchoolSnapshotBlockData } from './goa-school-snapshot/types'

export default function GoaSchoolSnapshotBlock(props: GoaSchoolSnapshotBlockData) {
  if (props.isEnabled === false) return null
  return <GoaSchoolSnapshotSection data={props} />
}
