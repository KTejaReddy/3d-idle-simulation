import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useGameStore, VERSES, getGeneratorsForVerse } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

export function GameUI() {
  const energy = useGameStore(s => s.energy);
  const premiumGems = useGameStore(s => s.premiumGems);
  const prestigePoints = useGameStore(s => s.prestigePoints);
  const currentVerse = useGameStore(s => s.currentVerse);
  const unlockedVerses = useGameStore(s => s.unlockedVerses);
  const rawGenerators = useGameStore(s => s.generators);
  const clickPowerLvl = useGameStore(s => s.clickPowerLvl);
  const managerUnlocked = useGameStore(s => s.managerUnlocked);

  const clickEnergy = useGameStore(s => s.clickEnergy);
  const buyGenerator = useGameStore(s => s.buyGenerator);
  const travelVerse = useGameStore(s => s.travelVerse);
  const prestige = useGameStore(s => s.prestige);
  const upgradeClick = useGameStore(s => s.upgradeClick);
  const unlockManager = useGameStore(s => s.unlockManager);
  const processOffline = useGameStore(s => s.processOffline);

  const [floatingTexts, setFloatingTexts] = useState([]);
  const [activeTab, setActiveTab] = useState('generators'); // generators, upgrades, verses, prestige
  const [offlineReport, setOfflineReport] = useState(0);

  const generators = useMemo(() => {
    return getGeneratorsForVerse(currentVerse).map(t => {
      const count = rawGenerators[t.id] || 0;
      const cost = Math.floor(t.baseCost * Math.pow(1.15, count));
      return { ...t, count, cost };
    });
  }, [currentVerse, rawGenerators]);

  const verseInfo = useMemo(() => VERSES.find(v => v.id === currentVerse), [currentVerse]);
  const totalProd = useMemo(() => {
    return generators.reduce((acc, g) => acc + (g.count * g.baseProd), 0) * verseInfo.multiplier * (1 + prestigePoints * 0.1);
  }, [generators, verseInfo.multiplier, prestigePoints]);

  useEffect(() => {
    const offlineDelta = processOffline();
    if (offlineDelta > 60 && totalProd > 0) {
      setOfflineReport(offlineDelta * totalProd);
    }
  }, []);

  const handleClick = useCallback((e) => {
    if(e.target.classList.contains('mobile-container') || e.target.classList.contains('ui-layer')) {
      clickEnergy();
      const earned = clickPowerLvl * verseInfo.multiplier * (1 + prestigePoints * 0.1);
      const newText = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY, value: earned };
      setFloatingTexts(prev => [...prev, newText]);
    }
  }, [clickEnergy, clickPowerLvl, verseInfo.multiplier, prestigePoints]);

  return (
    <div className="ui-layer" onClick={handleClick}>
      <AnimatePresence>
        {floatingTexts.map(t => (
          <motion.div 
            key={t.id} 
            className="floating-number"
            initial={{ opacity: 1, y: t.y, x: t.x, scale: 0.5 }}
            animate={{ opacity: 0, y: t.y - 150, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            +{Math.floor(t.value)}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="mobile-container mx-auto">
        <div className="top-hud">
          <div className="resource-bar">
            <div className="resource-icon" style={{color: verseInfo.color}}>⚡</div>
            <div className="resource-text">
              <div className="resource-amount">{Math.floor(energy).toLocaleString()}</div>
              <div className="resource-rate">+{totalProd.toFixed(1)} / sec</div>
            </div>
          </div>

          <div style={{display: 'flex', gap: '8px'}}>
            <div className="resource-bar premium" style={{flex: 1, padding: '4px 12px'}}>
              <div className="resource-icon" style={{width: 24, height: 24, fontSize: '1rem'}}>💎</div>
              <div className="resource-text">
                <div className="resource-amount" style={{fontSize: '1rem'}}>{premiumGems}</div>
              </div>
            </div>
            {prestigePoints > 0 && (
              <div className="resource-bar" style={{flex: 1, padding: '4px 12px', borderColor: '#a855f7'}}>
                <div className="resource-icon" style={{width: 24, height: 24, fontSize: '1rem'}}>✨</div>
                <div className="resource-text">
                  <div className="resource-amount" style={{fontSize: '1rem'}}>{prestigePoints}</div>
                </div>
              </div>
            )}
          </div>
          
          <div style={{textAlign: 'center', marginTop: '8px'}}>
            <h3 style={{fontWeight: 900, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
              {verseInfo.icon} {verseInfo.name.toUpperCase()}
            </h3>
          </div>
        </div>

        <div style={{flex: 1}} onClick={handleClick}></div>

        <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
          <div className="sheet-handle"></div>
          
          <div className="nav-tabs">
            {['generators', 'upgrades', 'verses', 'prestige'].map(tab => (
              <div 
                key={tab} 
                className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>

          <div className="sheet-content">
            {activeTab === 'generators' && (
              <div>
                {generators.map(gen => (
                  <div key={gen.id} className="generator-item">
                    <div className="gen-icon">{verseInfo.icon}</div>
                    <div className="gen-info">
                      <div className="gen-name">{gen.name} <span style={{color: 'var(--accent-primary)', fontSize: '0.9rem'}}>Lvl {gen.count}</span></div>
                      <div className="gen-prod">+{gen.baseProd * verseInfo.multiplier}/sec</div>
                    </div>
                    <button 
                      className="btn-buy" 
                      onClick={() => buyGenerator(gen.id, gen.cost)}
                      disabled={energy < gen.cost}
                    >
                      <span>BUY</span>
                      <span className="btn-cost">⚡ {gen.cost.toLocaleString()}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'upgrades' && (
              <div>
                <div className="generator-item">
                  <div className="gen-icon">👆</div>
                  <div className="gen-info">
                    <div className="gen-name">Click Power</div>
                    <div className="gen-prod">Level {clickPowerLvl}</div>
                  </div>
                  <button 
                    className="btn-buy" 
                    onClick={upgradeClick}
                    disabled={energy < Math.floor(50 * Math.pow(1.5, clickPowerLvl - 1))}
                  >
                    <span>UPGRADE</span>
                    <span className="btn-cost">⚡ {Math.floor(50 * Math.pow(1.5, clickPowerLvl - 1)).toLocaleString()}</span>
                  </button>
                </div>

                <div className="generator-item" style={{borderColor: 'var(--accent-premium)', background: '#faf5ff'}}>
                  <div className="gen-icon">💼</div>
                  <div className="gen-info">
                    <div className="gen-name">Auto Manager</div>
                    <div className="gen-prod">{managerUnlocked ? "Active" : "Collects while offline"}</div>
                  </div>
                  {!managerUnlocked ? (
                    <button 
                      className="btn-buy" 
                      style={{background: 'var(--accent-premium)', boxShadow: '0 4px 0 #7e22ce'}}
                      onClick={unlockManager}
                      disabled={premiumGems < 50}
                    >
                      <span>UNLOCK</span>
                      <span className="btn-cost">💎 50</span>
                    </button>
                  ) : (
                    <button className="btn-buy" disabled>HIRED</button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'verses' && (
              <div className="verse-grid">
                {VERSES.map(v => {
                  const isUnlocked = unlockedVerses.includes(v.id);
                  const isCurrent = currentVerse === v.id;
                  const vIndex = VERSES.findIndex(ver => ver.id === v.id);
                  const cost = 1000 * Math.pow(10, vIndex);
                  
                  return (
                    <div key={v.id} className="verse-card" style={{ borderColor: isCurrent ? v.color : 'var(--panel-border)' }}>
                      <div className="v-icon">{v.icon}</div>
                      <h4 style={{color: v.color}}>{v.name}</h4>
                      <p style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>x{v.multiplier} Boost</p>
                      
                      {isCurrent ? (
                        <button className="btn-travel" style={{background: '#cbd5e1', color: '#475569'}} disabled>ACTIVE</button>
                      ) : isUnlocked ? (
                        <button className="btn-travel" style={{background: v.color}} onClick={() => travelVerse(v.id)}>TRAVEL</button>
                      ) : (
                        <button 
                          className="btn-travel" 
                          style={{background: energy >= cost ? v.color : '#cbd5e1', color: energy >= cost ? 'white' : '#94a3b8'}}
                          disabled={energy < cost}
                          onClick={() => travelVerse(v.id)}
                        >
                          ⚡ {cost >= 1000000 ? (cost/1000000).toFixed(1)+'M' : cost}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'prestige' && (
              <div style={{textAlign: 'center', padding: '20px 0'}}>
                <div style={{fontSize: '3rem', marginBottom: '10px'}}>🌌</div>
                <h2 style={{fontWeight: 900, color: 'var(--accent-premium)', marginBottom: '10px'}}>MULTIVERSE RESET</h2>
                <p style={{color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem', padding: '0 20px'}}>
                  Reset your current progress to earn Prestige Points. Each point gives a permanent +10% boost to all verses!
                </p>
                <div style={{fontSize: '1.5rem', fontWeight: 900, marginBottom: '20px'}}>
                  Gain: +{Math.floor(Math.sqrt(energy / 1000000))} Points
                </div>
                <button 
                  className="btn-primary" 
                  style={{background: 'var(--accent-premium)', boxShadow: '0 4px 0 #7e22ce'}}
                  onClick={prestige}
                >
                  PRESTIGE NOW
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {offlineReport > 0 && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Welcome Back!</h2>
            <p>Your idle systems generated energy while you were away.</p>
            <h1 style={{color: 'var(--accent-success)', margin: '20px 0', fontSize: '2rem'}}>
              ⚡ {Math.floor(offlineReport).toLocaleString()}
            </h1>
            <button className="btn-primary" onClick={() => setOfflineReport(0)}>COLLECT</button>
          </div>
        </div>
      )}
    </div>
  );
}
