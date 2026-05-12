import { create } from 'zustand'

export type View =
  | 'dashboard'
  | 'projects'
  | 'project-new'
  | 'project-detail'
  | 'evaluations'
  | 'evaluation-detail'
  | 'evaluators'
  | 'reports'
  | 'users'
  | 'settings'
  | 'notifications'

interface HistoryEntry {
  view: View
  params: Record<string, string>
}

interface NavState {
  currentView: View
  viewParams: Record<string, string>
  history: HistoryEntry[]
  navigate: (view: View, params?: Record<string, string>) => void
  goBack: () => void
}

export const useNavStore = create<NavState>((set, get) => ({
  currentView: 'dashboard',
  viewParams: {},
  history: [],

  navigate: (view: View, params: Record<string, string> = {}) => {
    const { currentView, viewParams } = get()
    set((state) => ({
      history: [...state.history, { view: currentView, params: viewParams }],
      currentView: view,
      viewParams: params,
    }))
  },

  goBack: () => {
    const { history } = get()
    if (history.length === 0) return
    const last = history[history.length - 1]
    set((state) => ({
      currentView: last.view,
      viewParams: last.params,
      history: state.history.slice(0, -1),
    }))
  },
}))
