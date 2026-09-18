import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QuizProvider } from './context/QuizContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QuizProvider>
      <App />
    </QuizProvider>
  </StrictMode>,
);
