// 主题管理模块
const state = {
  isDarkMode: localStorage.getItem('isDarkMode') === 'true' || false
}

const getters = {
  isDarkMode: state => state.isDarkMode
}

const mutations = {
  TOGGLE_THEME(state) {
    state.isDarkMode = !state.isDarkMode
    localStorage.setItem('isDarkMode', state.isDarkMode)
    // 更新 body 类名
    if (state.isDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  },
  SET_THEME(state, isDark) {
    state.isDarkMode = isDark
    localStorage.setItem('isDarkMode', state.isDarkMode)
    if (state.isDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }
}

const actions = {
  toggleTheme({ commit }) {
    commit('TOGGLE_THEME')
  },
  initTheme({ state }) {
    // 初始化主题
    if (state.isDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

