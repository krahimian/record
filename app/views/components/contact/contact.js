import React from 'react'
import { Link, NavLink } from 'react-router-dom'

import history from '@core/history'
import Button from '@components/button'
import Icon from '@components/icon'
import IconButton from '@components/icon-button'
import Progress from '@components/progress'

import './contact.styl'

const Contact = ({
  connect,
  disconnect,
  contactName,
  contactLocation,
  contactBio,
  contact,
  type,
  remove,
  style
}) => {
  const peers = contact.peers.size
  const loading = contact.isBuildingIndex || contact.isProcessingIndex
  const showEdit = contact.isMe || contact.haveContact
  const noPropagation = e => e.stopPropagation()

  const handleSyncClick = (e) => {
    e.stopPropagation()
    contact.isReplicating
      ? disconnect(contact.address, contact.id)
      : connect(contact.address, contact.id)
  }

  const addAction = (
    <Link
      className='button'
      onClick={noPropagation}
      to={`/new-contact${contact.address}?alias=${contact.name || contact.alias || ''}`}>
      save
    </Link>
  )

  const removeAction = (
    <Button onClick={remove} isLoading={contact.isUpdating}>unsave</Button>
  )

  const editContact = (
    <Link
      className='button__icon button contact__edit-title'
      to={`/new-contact${contact.address}?haveContact=true&alias=${contact.alias || contact.name || ''}`}
      onClick={noPropagation}><Icon name='edit' /></Link>
  )

  const editSelf = (
    <Link
      className='button__icon button contact__edit-title' to='/edit-about'
      onClick={noPropagation}>
      <Icon name='edit' /></Link>
  )

  const contactAction = (contact.haveContact
    ? removeAction
    : addAction
  )

  const connectionStatusAction = (
    <IconButton
      label='status'
      isLoading={contact.isUpdating}
      className={`${contact.isReplicating ? 'spin' : ''}`}
      onClick={handleSyncClick}
      icon={contact.isReplicating ? 'sync' : 'sync-disabled'} />
  )

  const viewUser = () => {
    history.push(`/tracks${contact.address}`)
  }

  return (
    <article
      className={`contact contact__${type}`}
      style={style}
      onClick={type !== 'profile' ? viewUser : null}>
      <div className='contact__main'>
        <div className='contact__avatar'>
          <img src={contact.avatar} />
        </div>
        <div className={`contact__title ${(peers || contact.isMe) ? 'contact__connected' : 'contact__disconnected'}`}>
          {contactName}
          {contact.isMe && <small>Owner</small>}
        </div>
        <div className='contact__actions'>
          <div>
            {showEdit && (contact.isMe ? editSelf : editContact)}
          </div>
          <div>
            {!contact.isMe && connectionStatusAction}
          </div>
          {(!contact.isMe && type === 'profile') && <div>{contactAction}</div>}
        </div>
      </div>
      {type === 'profile' && <div className='contact__menu menu'>
        <NavLink activeClassName='active' to={`/tracks${contact.address}`}>Tracks</NavLink>
        <NavLink activeClassName='active' to={`/contacts${contact.address}`}>Libraries</NavLink>
      </div>}
      <div className='contact__side'>
        <div data-label='entries'>
          {contact.length !== contact.max && <Progress progress={(contact.length / contact.max) * 100} />}
          {contact.length === contact.max
            ? contact.max
            : (
              `${contact.length}/${contact.max}`
            )}
        </div>
        {type === 'profile' && <div className={loading ? 'blink' : ''} data-label='tracks'>{contact.trackCount}</div>}
        {type === 'profile' && <div className={loading ? 'blink' : ''} data-label='contacts'>{contact.contactCount}</div>}
      </div>
    </article>
  )
}

export default Contact
