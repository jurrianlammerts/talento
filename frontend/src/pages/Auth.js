import React, { useState, useRef, useContext } from 'react';

import AuthContext from '../context/AuthContext';
import Button from '../components/Styles/Button';

import Form from '../components/Styles/Form';

function Auth() {
  const { login } = useContext(AuthContext);
  const [loginPage, setLoginPage] = useState(true);
  const emailInput = useRef(null);
  const passwordInput = useRef(null);

  const submitHandler = (e) => {
    e.preventDefault();
    const email = emailInput.current.value;
    const password = passwordInput.current.value;
    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }
    let requestBody = {
      query: `
        query {
          login(email: "${email}", password: "${password}") {
            userId
            token
            tokenExpiration
          }
        }
      `,
    };

    if (!loginPage) {
      requestBody = {
        query: `
          mutation {
            createUser(userInput: {email: "${email}", password: "${password}"}) {
              _id
              email
            }
          }
        `,
      };
    }

    fetch(process.env.REACT_APP_URL, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(
        ({
          data,
          data: {
            login: { token, userId, tokenExpiration },
          },
        }) => {
          console.log(data);
          if (data && token) {
            login(token, userId, tokenExpiration);
          }
        },
      )
      .catch((err) => {
        console.log(err);
      });
  };

  const switchModeHandler = () => {
    setLoginPage(!loginPage);
  };

  return (
    <Form onSubmit={submitHandler}>
      <div className="form-control">
        <label htmlFor="email">E-mail</label>
        <input type="email" id="email" ref={emailInput} />
      </div>
      <div className="form-control">
        <label htmlFor="password">Password</label>
        <input type="password" id="password" ref={passwordInput} />
      </div>
      <div className="form-actions">
        <Button type="submit">{!loginPage ? 'Register' : 'Login'}</Button>
        <Button type="button" onClick={switchModeHandler}>
          Switch to {loginPage ? 'Register' : 'Login'}
        </Button>
      </div>
    </Form>
  );
}

export default Auth;
