import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Room from './pages/Room';
import End from './pages/End';
import './App.css';

function App() {

  return (
    <Routes>
      <Route path='/' element={ <Home /> }></Route>
      <Route path='/lobby/:meetType' element={ <Lobby /> }></Route>
      <Route path='/room/:room' element={ <Room /> }></Route>
      <Route path='/callend' element={ <End /> }></Route>
    </Routes>
  )
}

export default App