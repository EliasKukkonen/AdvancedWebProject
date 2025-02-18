//AuthPage.tsx
import React, { useState, useEffect } from 'react';
import "./AuthPage.css";
import { useTranslation } from 'react-i18next';
import i18n from './i18n'; // Import the i18n instance
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for react-toastify

//Base URL for API calls
const BASE_URL = 'http://localhost:3000';


//Props interface for the AuthPage component
interface AuthPageProps {
  onLogin?: (token: string) => void;
}


//Component to handle user registration and login
const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const { t } = useTranslation(); //Language
  const [showRegister, setShowRegister] = useState(true);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regIsAdmin, setRegIsAdmin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  //Logout messages in the URL when component mounts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const logoutMessage = params.get('message');
    if (logoutMessage) {
      toast.info(logoutMessage);
    }
  }, []);



    //Registration form submission.
  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {

      //Call register endpoint
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          isAdmin: regIsAdmin, //Wasn't implemented, stays for future improvements.
        }),
      });

      //Check if there is issue with the responses
      if (!response.ok) {
        const errorData = await response.json();
        toast.info(t('registrationFailed', 'Registration failed: ') + errorData.message);
        return;
      }

      //Registration succesfull, notify user.
      toast.success(t('registrationSuccess', 'Registration successful! You can now log in.'));
      setRegEmail('');
      setRegPassword('');
      setRegIsAdmin(false);
      //Switch to login form
      setShowRegister(false);
    } catch (err) {
      console.error(err);
      toast.error(t('registrationError', 'An error occurred during registration.'));
    }
  };



  //Handle login form submission
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      //Call to the endpoint of the login
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      //Check if ok
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(t('loginFailed', 'Login failed: ') + errorData.message);
        return;
      }

      //Login successfull
      const data = await response.json();
      localStorage.setItem('token', data.token); //Store token

      //Redirect to the main (kanban) page.
      if (onLogin) {
        onLogin(data.token);
      }
      window.location.href = 'main.html';
    } catch (err) {
      console.error(err);
      toast.error(t('loginError', 'An error occurred during login.'));
    }
  };

  // Language switcher handler using imported i18n
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng).then(() => {
      console.log("Language changed to", lng);
    });
  };

  return (
    <div className="auth-page">
      {/* Language switcher buttons */}
      <div className="language-switcher">
        <button onClick={() => changeLanguage('en')}>English</button>
        <button onClick={() => changeLanguage('fi')}>Finnish</button>
      </div>
      <div className="auth-container">
        {/* Display welcome messages */}
        <h1>{t('welcomeMessage', 'Welcome to the Kanban Board')}</h1>
        <h2>{t('accessMessage', 'To Access Kanban, Register or Login')}</h2>
        <div className="auth-toggle">
           {/* Toggle buttons for switching between Register and Login */}
          <button onClick={() => setShowRegister(true)}>{t('register', 'Register')}</button>
          <button onClick={() => setShowRegister(false)}>{t('login', 'Login')}</button>
        </div>
        {showRegister ? (
          //Registration form 
          <section>
            <h2>{t('registerForm', 'Register Form')}</h2>
            <form onSubmit={handleRegisterSubmit}>
              <div>
                <label>{t('email', 'Email')}</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>{t('password', 'Password')}</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit">{t('register', 'Register')}</button>
            </form>
          </section>
        ) : (
          //Login form
          <section>
            <h2>{t('loginForm', 'Login Form')}</h2>
            <form onSubmit={handleLoginSubmit}>
              <div>
                <label>{t('email', 'Email')}</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>{t('password', 'Password')}</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit">{t('login', 'Login')}</button>
            </form>
          </section>
        )}
      </div>
       {/* ToastContainer displays notifications at the bottom of the screen */}
       <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default AuthPage;
