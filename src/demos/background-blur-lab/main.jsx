import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BlurLab from './BlurLab.jsx';
import './blurLab.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BlurLab />
  </StrictMode>,
);
