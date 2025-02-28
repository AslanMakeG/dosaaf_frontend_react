import logo from './logo.svg';
import './App.css';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/header';
import Footer from './components/Footer';


function App() {
  return (
    <div className='App'>
      <Header/>
      <Footer/>
    </div>
  );
}

export default App;
