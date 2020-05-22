//= ====================================
//  GENERAL
// -------------------------------------
export const WIKI_URL = 'https://ipfs.infura.io/ipfs/Qmf4wAJLhU7jWjKbgZ7F1fe6iLARtbuvsHZugGxutxwSuk/'
export const ITEMS_PER_LOAD = 500
export const PEER_LOGLIST_ADDRESS = '/PEER_LOGLIST_ADDRESS'
export const ALL_LOGLIST_ADDRESS = '/ALL_LOGLIST_ADDRESS'
export const LISTENS_TRACKLIST_ADDRESS = '/LISTENS_TRACKLIST_ADDRESS'

const PORT = process.env.NODE_ENV === 'development' ? 3001 : 3000
export const BASE_URL = `http://localhost:${PORT}`

//= ====================================
//  HELP
// -------------------------------------
export const HELP_STORAGE_KEY = 'HELP_STOAGE_KEY'
export const DEFAULT_HELP_SETTINGS = {
  isHomeHelpVisible: true,
  isTrackHelpVisible: true
}

//= ====================================
//  PLAYER
// -------------------------------------
export const PLAYER_INITIAL_VOLUME = 90
export const PLAYER_MAX_VOLUME = 100
export const PLAYER_VOLUME_INCREMENT = 5

export const PLAYER_STORAGE_KEY = 'PLAYER_STORAGE_KEY'
