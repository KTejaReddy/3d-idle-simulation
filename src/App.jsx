import React, { Suspense } from 'react';
import { GameScene } from './components/GameScene';
import { GameUI } from './components/GameUI';
import './index.css';

function App() {
  return (
    <>
      <GameUI />
      <Suspense fallback={<div style={{color: 'white', position: 'absolute', top: '50%', left: '50%'}}>Loading Engine...</div>}>
        <GameScene />
      </Suspense>
    </>
  );
}

export default App;
