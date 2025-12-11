import GameContainer from './components/GameContainer';

function App() {
  return (
    // Apply full-screen dimensions and prevent all scrolling
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#282828'
    }}>
      <GameContainer />
    </div>
  );
}

export default App;