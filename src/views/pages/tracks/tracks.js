import React from 'react'
import { Link } from 'react-router-dom'

import Taglist from '@components/taglist'
import Tracklist from '@components/tracklist'
import PageLayout from '@layouts/page'

export default function () {
  const { logId } = this.props.match.params
  const head = (
    <div>
      <h1>Tracks</h1>
      {logId === 'me' && <Link className='button' to='/tracks/new'>Add Track</Link>}
    </div>
  )

  const body = (
    <div>
      <Taglist />
      <Tracklist />
    </div>
  )

  return (
    <PageLayout head={head} body={body} />
  )
}
