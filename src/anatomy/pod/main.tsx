// Adapted from the user-selected L Pro Anatomy source; original snapshot retained in tools/.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { PodApp } from './PodApp';
export function mountAnatomy(element: HTMLElement) {
  const root = createRoot(element);
  root.render(<PodApp />);
  return () => root.unmount();
}
