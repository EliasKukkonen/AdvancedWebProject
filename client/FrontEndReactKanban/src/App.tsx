//App.tsx file, for the front end.

import { useEffect, useState } from 'react';
import AuthPage from './AuthPage';
import KanbanBoard from './KanbanBoard';
import './App.css';


 //Main component, decides to show the auhtetntication screen

function App() {

  //State to save token
  const [token, setToken] = useState<string | null>(null);

  //Store authentication token
  useEffect(() => {
    // Check if a token is already in localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
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
