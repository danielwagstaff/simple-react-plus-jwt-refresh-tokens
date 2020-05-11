import React, { useState, useEffect } from 'react';
import { SignUpAsync, SignInAsync, SignOutAsync, RefreshJwtAsync } from '../../services/signon/SignonService';

export const AuthContext = React.createContext();

export const AuthContextProvider = (props) => {
    const [currentUser, setCurrentUser] = useState(null);

    const signUp = (email, password, onOk, onConflict, onBadRequest, onInternalError) => {
        SignUpAsync(
            email,
            password,
            (authenticatedUser) => {
                setCurrentUser(getUserFromAuthenticatedUser(authenticatedUser));
                if (onOk) {
                    onOk();
                }
            },
            onConflict,
            onBadRequest,
            onInternalError);
    };

    const signIn = (username, password, onOk, onUnathorized, onBadRequest, onInternalError) => {
        SignInAsync(
            username,
            password,
            (authenticatedUser) => {
                setCurrentUser(getUserFromAuthenticatedUser(authenticatedUser));
                if (onOk) {
                    onOk();
                }
            },
            onUnathorized,
            onBadRequest,
            onInternalError);
    };

    const signOut = () => {
        if (currentUser) {
            SignOutAsync(
                currentUser.jwt,
                () => {
                    setCurrentUser(null);
                    signalSignOutOnAllTabs();
                }
            );
        }
    };

    useEffect(() => {
        listenForSignOutFromAnotherTab(() => { setCurrentUser(null); });
    }, []);

    useEffect(() => {
        const onJwtRefreshTimeout = () => {
            if (currentUser) {
                console.info("Refreshing JWT");
                RefreshJwtAsync(
                    (authenticatedUser) => {
                        console.info("Refreshed JWT");
                        setCurrentUser(getUserFromAuthenticatedUser(authenticatedUser));
                    },
                    () => {
                        console.error("Refreshing JWT failed - logging out");
                        setCurrentUser(null);
                    }
                )
            }
            else {
                console.info("User logged out before JWT refresh");
            }
        };

        const onJwtRefreshSuccess = (authenticatedUser) => {
            console.info("Refreshed JWT");
            setCurrentUser(getUserFromAuthenticatedUser(authenticatedUser));
        };

        const onJwtRefreshFailure = () => {
            console.error("Refreshing JWT failed - logging out");
            setCurrentUser(null);
        };

        if (currentUser) {
            const jwtRefreshTimeout = ConfigureJwtAutoRefresh(currentUser.jwtExpires, onJwtRefreshTimeout);
            console.info("Setting JWT refresh time");

            return function cleanup() {
                clearTimeout(jwtRefreshTimeout);
            };
        }
        else {
            console.info("No current user logged in - attempting JWT refresh");
            (async () => RefreshJwtAsync(onJwtRefreshSuccess, onJwtRefreshFailure))();
        }
    }, [currentUser]);

    return (
        <AuthContext.Provider value={
            {
                signUp: props.signUp || signUp,
                signIn: props.signIn || signIn,
                signOut: props.signOut || signOut,
                currentUser: props.currentUser || currentUser,
            }
        }>
            {props.children}
        </AuthContext.Provider>
    );
};

const signalSignOutOnAllTabs = () => {
    window.localStorage.setItem('logout', Date.now());
};

const listenForSignOutFromAnotherTab = (onSignoutDetected) => {
    window.addEventListener('storage', (event) => {
        if (event.key === 'logout') {
            console.info("Logout event detected in local storage");
            if (onSignoutDetected) {
                onSignoutDetected();
            }
        }
    });
}

const ConfigureJwtAutoRefresh = (jwtExpiry, onTimeout) => {
    const oneMinute = 60000;
    const nextRefreshTime = Date.parse(jwtExpiry) - oneMinute;
    const nextRefreshMs = nextRefreshTime - Date.now();
    return setTimeout(async () => {
        if (onTimeout) {
            onTimeout();
        }
    }, nextRefreshMs);
}

const getUserFromAuthenticatedUser = (authenticatedUser) => {
    let jwt = JSON.parse(atob(authenticatedUser.jwt.split('.')[1]));
    return {
        id: jwt["nameidentifier"],
        email: jwt["email"],
        role: jwt["role"],
        jwt: authenticatedUser.jwt,
        jwtExpires: authenticatedUser.jwtExpiry
    };
}
