import * as stylex from '@stylexjs/stylex'
import { breakpoints, colors } from '../../styles/tokens.stylex'

/** Column styles shared by the editor and guest screens. */
export const layoutStyles = stylex.create({
  stage: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
  },
  sidePanel: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    maxHeight: { default: null, [breakpoints.compact]: '45vh' },
    backgroundColor: colors.surface,
    borderWidth: 0,
    borderLeftWidth: { default: 1, [breakpoints.compact]: 0 },
    borderTopWidth: { default: 0, [breakpoints.compact]: 1 },
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  sidePanelBody: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: 16,
  },
  bar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    paddingBlock: 8,
    paddingInline: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
})
