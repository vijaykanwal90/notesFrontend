
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Home from './pages/Home'
import NoteEditor from './pages/NoteEditor'
import Notes from './pages/Notes'
import { Toaster } from 'react-hot-toast'
function App() {
  

  return (
    <>
    <Toaster/>
 <div className=''>
        <BrowserRouter>
        <Routes>
        <Route path="/signup" element={<Signup/>} />
        <Route path="/login" element={<Login/>} />
         <Route path="/notes" element={<Notes/>} />
        <Route path="/note/:noteId" element={<NoteEditor/>} />
      
     
          
          <Route path="/" element={<Home/>} />

        </Routes>
        </BrowserRouter>
        
      </div>
    </>
  )
}

export default App
