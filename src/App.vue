<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
@import './assets/styles/dark-mode.css';

/* 全局主题颜色覆盖 - 莫兰迪灰绿风格 (#6e9387) - 仅在非夜间模式下生效 */
:root:not(.dark-mode) {
  --primary-color: #6e9387;
  --primary-hover: #8ab6a8;
  --primary-active: #55766c;
}

/* 按钮覆盖 */
body:not(.dark-mode) .el-button--primary {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

body:not(.dark-mode) .el-button--primary:hover,
body:not(.dark-mode) .el-button--primary:focus {
  background-color: var(--primary-hover) !important;
  border-color: var(--primary-hover) !important;
}

body:not(.dark-mode) .el-button--primary:active {
  background-color: var(--primary-active) !important;
  border-color: var(--primary-active) !important;
}

body:not(.dark-mode) .el-button--text {
  color: var(--primary-color) !important;
}

body:not(.dark-mode) .el-button--text:hover {
  color: var(--primary-hover) !important;
}

body:not(.dark-mode) .el-button--text:active {
  color: var(--primary-active) !important;
}

/* 输入框聚焦 */
body:not(.dark-mode) .el-input__inner:focus,
body:not(.dark-mode) .el-textarea__inner:focus {
  border-color: var(--primary-color) !important;
}

/* 菜单项激活 (侧边栏除外，通用菜单) */
body:not(.dark-mode) .el-menu-item.is-active {
  color: var(--primary-color);
}

/* 分页 */
body:not(.dark-mode) .el-pagination.is-background .el-pager li:not(.disabled).active {
  background-color: var(--primary-color) !important;
}

body:not(.dark-mode) .el-pager li.active {
  color: var(--primary-color) !important;
}

/* 复选框 */
body:not(.dark-mode) .el-checkbox__input.is-checked .el-checkbox__inner,
body:not(.dark-mode) .el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

body:not(.dark-mode) .el-checkbox__input.is-checked + .el-checkbox__label {
  color: var(--primary-color) !important;
}

/* 单选框 */
body:not(.dark-mode) .el-radio__input.is-checked .el-radio__inner {
  border-color: var(--primary-color) !important;
  background: var(--primary-color) !important;
}

body:not(.dark-mode) .el-radio__input.is-checked + .el-radio__label {
  color: var(--primary-color) !important;
}

/* 开关 */
body:not(.dark-mode) .el-switch.is-checked .el-switch__core {
  border-color: var(--primary-color) !important;
  background-color: var(--primary-color) !important;
}

/* 标签页 */
body:not(.dark-mode) .el-tabs__item.is-active {
  color: var(--primary-color) !important;
}

body:not(.dark-mode) .el-tabs__active-bar {
  background-color: var(--primary-color) !important;
}

body:not(.dark-mode) .el-tabs__item:hover {
  color: var(--primary-hover) !important;
}

/* 下拉菜单 */
body:not(.dark-mode) .el-dropdown-menu__item:not(.is-disabled):hover,
body:not(.dark-mode) .el-dropdown-menu__item:focus {
  background-color: rgba(110, 147, 135, 0.1) !important;
  color: var(--primary-color) !important;
}

/* 消息提示图标颜色 */
body:not(.dark-mode) .el-message--success .el-message__content,
body:not(.dark-mode) .el-message .el-icon-success {
  color: var(--primary-color) !important;
}

/* 步骤条 */
body:not(.dark-mode) .el-step__head.is-finish {
  color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}
body:not(.dark-mode) .el-step__title.is-finish {
  color: var(--primary-color) !important;
}

/* 加载动画 */
body:not(.dark-mode) .el-loading-spinner .path {
  stroke: var(--primary-color) !important;
}

body:not(.dark-mode) .el-loading-spinner .el-loading-text {
  color: var(--primary-color) !important;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  width: 100%;
  transition: background-color 0.3s, color 0.3s;
}

body {
  margin: 0;
  padding: 0;
  transition: background-color 0.3s, color 0.3s;
}
</style>
