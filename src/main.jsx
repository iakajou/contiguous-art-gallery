import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/jetbrains-mono';
import 'katex/dist/katex.min.css';
import './styles.css';
import App from './App.jsx';

// ?shot in the URL: no entrance animations, scenes frozen on a representative frame (used for the PDF screenshots)
if (window.location.search.includes('shot')) document.documentElement.classList.add('no-anim');

createRoot(document.getElementById('root')).render(<App />);
