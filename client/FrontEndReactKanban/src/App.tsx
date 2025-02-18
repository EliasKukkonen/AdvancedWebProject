//App.tsx file, for the front end.

import { useEffect, useState } from 'react';
import AuthPage from './AuthPage';
import KanbanBoard from './KanbanBoard';
import './App.css';
import {jwtDecode} from 'jwt-decode';


 //Main component, decides to show the auhtetntication screen

 interface JwtPayload {
  exp: number;
  // Add other properties if needed.
}

function App() {

  //State to save token
  const [token, setToken] = useState<string | null>(null);

  //Store authentication token
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(storedToken);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setToken(null);
        } else {
          setToken(storedToken);
        }
      } catch (error) {
        // If token is invalid, remove it
        localStorage.removeItem('token');
        setToken(null);
      }
    }
  }, []);

  return (
    <div>
      
      {token ? (
        // If token exists render the kanban board
        <KanbanBoard />
      ) : (
        //Otherwise render the auth page
        <AuthPage
          onLogin={(newToken) => {
            //Save the token in localstorage
            localStorage.setItem('token', newToken);
            setToken(newToken);
          }}
        />
      )}
    </div>
  );
}

export default App;
