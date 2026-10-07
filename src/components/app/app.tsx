import * as stylex from '@stylexjs/stylex'
import { useSyncExternalStore, type ReactNode } from 'react'
import { useSeating } from '../../seating/seating-store'
import { colors } from '../../styles/tokens.stylex'
import { Editor } from '../editor/editor'
import { GuestView } from '../guest-view/guest-view'
import { segmentedStyles } from '../segmented/segmented.styles'
import type { AppView } from './app.types'

const styles = stylex.create({
  root: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    height: '100%',
    backgroundColor: colors.bg,
    color: colors.text,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingBlock: 10,
    paddingInline: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    color: colors.accent,
    fontSize: 18,
  },
  venue: {
    color: colors.muted,
  },
})

function viewFromHash(): AppView {
  return window.location.hash === '#/guest' ? 'guest' : 'editor'
}

function subscribeToHash(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** Application shell that switches between the map editor and the guest booking view. */
export function App(): ReactNode {
  const { map } = useSeating()
  const view = useSyncExternalStore(subscribeToHash, viewFromHash)

  const tab = (target: AppView, label: string): ReactNode => (
    <a
      href={`#/${target}`}
      aria-current={view === target ? 'page' : undefined}
      {...stylex.props(segmentedStyles.item, view === target && segmentedStyles.active)}
    >
      {label}
    </a>
  )

  return (
    <div {...stylex.props(styles.root)}>
      <header {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.title)}>
          <span aria-hidden {...stylex.props(styles.logo)}>
            ◉
          </span>
          <strong>Reserved Seats</strong>
          <span {...stylex.props(styles.venue)}>{map.name}</span>
        </div>
        <nav aria-label="View" {...stylex.props(segmentedStyles.root)}>
          {tab('editor', 'Seating map editor')}
          {tab('guest', 'Guest booking')}
        </nav>
      </header>
      {view === 'editor' ? <Editor /> : <GuestView />}
    </div>
  )
}
