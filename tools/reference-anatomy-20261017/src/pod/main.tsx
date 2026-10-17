import React from 'react';
import ReactDOM from 'react-dom/client';
import { PodApp } from './PodApp';
import '../styles/index.css';
import './pod.css';

// 本页使用浅色主题（与主实验台的深色主题区分）
document.documentElement.classList.add('pod-page');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PodApp />
  </React.StrictMode>,
);
