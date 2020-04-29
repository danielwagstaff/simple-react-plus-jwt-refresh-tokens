import React, { useState, useEffect, useCallback } from 'react';

const AuthContext = React.createContext();

const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    function login(username, password, callbackResult) {
        loginAsync(username, password)
            .then(loginResult => {
                if (loginResult.loginStatus.loginFailed() === false) {
                    setCurrentUser(loginResult.loggedInUser);
                }
                else {
                    setCurrentUser(null);
                }

                if (callbackResult) {
                    callbackResult(loginResult.loginStatus);
                }
            });
    };

    const logout = useCallback(() => {
        if (currentUser) {
            console.info("Log out requested - logging out current user");
            logoutAsync(currentUser.jwt, () => {
                setCurrentUser(null);
                window.localStorage.setItem('logout', Date.now());
            });
        }
        else {
            console.info("Log out requested - no user logged in");
        }
    }, [currentUser]);

    function register(firstName, lastName, email, password, phone, callbackResult) {
        registerAsync(firstName, lastName, email, password, phone)
            .then(registrationResult => {
                if (registrationResult.registrationStatus.registrationFailed() === false) {
                    setCurrentUser(registrationResult.loggedInUser);
                }
                else {
                    setCurrentUser(null);
                }

                if (callbackResult) {
                    callbackResult(registrationResult.registrationStatus);
                }
            });
    }

    useEffect(() => {
        window.addEventListener('storage', (event) => {
            console.info("Logout detected in local storage");
            if (event.key === 'logout') {
                setCurrentUser(null);
            }
        })
    }, []);

    useEffect(() => {
        if (currentUser) {
            console.info("Setting JWT refresh time");
            const oneMinute = 60000;
            const nextRefreshTime = Date.parse(currentUser.jwtExpires) - oneMinute;
            const nextRefreshMs = nextRefreshTime - Date.now();
            const jwtRefreshTimeout = setTimeout(async () => {
                if (currentUser) {
                    console.info("Refreshing JWT");
                    const refreshedJwt = await refreshJwt();
                    if (refreshedJwt) {
                        console.info("Refreshed JWT");
                        setCurrentUser(refreshedJwt);
                    }
                    else {
                        console.error("Refreshing JWT failed - logging out");
                        logout();
                    }
                }
                else {
                    console.info("User logged out before JWT refresh");
                }
            }, nextRefreshMs);

            return function cleanup() {
                clearTimeout(jwtRefreshTimeout);
            };
        }
        else {
            console.info("No current user logged in - attempting JWT refresh");
            (async () => {
                const refreshedJwt = await refreshJwt();
                if (refreshedJwt) {
                    console.info("Refreshed JWT");
                    setCurrentUser(refreshedJwt);
                }
                else {
                    console.info("Refreshing JWT failed - logging out");
                    logout();
                }
            })();
        }
    }, [logout, currentUser]);

    return (
        <AuthContext.Provider
            value={
                {
                    currentUser: currentUser,
                    login: login,
                    logout: logout,
                    register: register
                }
            }
        >
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContextProvider, AuthContext };

async function refreshJwt() {
    const response = await fetch('https://localhost:44331/auth/refresh', {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: null,
    });

    if (response.status >= 200 && response.status <= 299) {
        let authenticatedUser = await response.json();
        return getUserFromAuthenticatedUser(authenticatedUser);
    }
    else {
        return null;
    }
};

async function loginAsync(username, password) {
    let loggedInUser = null;
    let loginStatus = {
        isBadRequest: false,
        validationErrors: [],
        isUnathorized: false,
        isInternalError: false,
        loginFailed: () => loginStatus.isBadRequest || loginStatus.isUnathorized || loginStatus.isInternalError,
    };

    try {
        const response = await fetch('https://localhost:44331/auth/authenticate', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: username, password: password }),
        });

        if (response.status >= 200 && response.status <= 299) {
            let authenticatedUser = await response.json();
            loggedInUser = getUserFromAuthenticatedUser(authenticatedUser);
        }
        else if (response.status === 400) {
            loginStatus.isBadRequest = true;
            let result = await response.json();
            for (let field in result.errors) {
                loginStatus.validationErrors.push(result.errors[field][0]);
            }
        }
        else if (response.status === 401) {
            loginStatus.isUnathorized = true;
        }
        else {
            loginStatus.isInternalError = true;
        }
    } catch (err) {
        console.error("Unexpected login error: " + err);
        loginStatus.isInternalError = true;
    }

    return { loginStatus, loggedInUser };
}

async function logoutAsync(jwt, onFinally) {
    await fetch('https://localhost:44331/auth/logout', {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
        },
        body: null,
    });
    onFinally();
}

async function registerAsync(firstName, lastName, email, password, phone) {
    let loggedInUser = null;
    let registrationStatus = {
        isBadRequest: false,
        validationErrors: [],
        isConflict: false,
        isInternalError: false,
        registrationFailed: () => registrationStatus.isBadRequest || registrationStatus.isConflict || registrationStatus.isInternalError,
    };

    try {
        const response = await fetch('https://localhost:44331/auth', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                password: password
            }),
        });

        if (response.status >= 200 && response.status <= 299) {
            let authenticatedUser = await response.json();
            loggedInUser = getUserFromAuthenticatedUser(authenticatedUser);
        }
        else if (response.status === 400) {
            registrationStatus.isBadRequest = true;
            let result = await response.json();
            for (let field in result.errors) {
                registrationStatus.validationErrors.push(result.errors[field][0]);
            }
        }
        else if (response.status === 409) {
            registrationStatus.isConflict = true;
        }
        else {
            registrationStatus.isInternalError = true;
        }
    } catch (err) {
        console.error("Unexpected registration error: " + err);
        registrationStatus.isInternalError = true;
    }

    return { registrationStatus, loggedInUser };
}

function getUserFromAuthenticatedUser(authenticatedUser) {
    let jwt = JSON.parse(atob(authenticatedUser.jwt.split('.')[1]));
    return {
        id: jwt["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        firstName: jwt["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"],
        lastName: jwt["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"],
        email: jwt["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
        phone: jwt["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/otherphone"],
        jwt: authenticatedUser.jwt,
        jwtExpires: authenticatedUser.jwtExpiry
    };
}
