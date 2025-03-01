import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginRegister from './Components/LoginRegister/LoginRegister';
import Weather from './Components/Weather/Weather'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/weather" element={<Weather />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
