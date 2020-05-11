
export const SignUpAsync = async (email, password, onOk, onConflict, onBadRequest, onInternalError) => {
    try {
        const response = await fetch('https://localhost:44331/auth/business', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            }),
        });

        if (response.status >= 200 && response.status <= 299) {
            let authenticatedUser = await response.json();
            if (onOk) {
                onOk(authenticatedUser);
            }
        }
        else if (response.status === 400) {
            let result = await response.json();
            if (onBadRequest) {
                let validationErrors = [];
                for (let field in result.errors) {
                    validationErrors.push(result.errors[field][0]);
                }
                onBadRequest(validationErrors);
            }
        }
        else if (response.status === 409) {
            if (onConflict) {
                onConflict();
            }
        }
        else {
            if (onInternalError) {
                onInternalError();
            }
        }
    } catch (err) {
        console.error("Unexpected registration error: " + err);
        if (onInternalError) {
            onInternalError();
        }
    }
}

export const SignInAsync = async (username, password, onOk, onUnathorized, onBadRequest, onInternalError) => {
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
            if (onOk) {
                onOk(authenticatedUser);
            }
        }
        else if (response.status === 400) {
            let result = await response.json();
            if (onBadRequest) {
                let validationErrors = [];
                for (let field in result.errors) {
                    validationErrors.push(result.errors[field][0]);
                }
                onBadRequest(validationErrors);
            }
        }
        else if (response.status === 401) {
            if (onUnathorized) {
                onUnathorized();
            }
        }
        else {
            if (onInternalError) {
                onInternalError();
            }
        }
    } catch (err) {
        console.error("Unexpected login error: " + err);
        if (onInternalError) {
            onInternalError();
        }
    }
}

export const SignOutAsync = async (jwt, onFinally) => {
    await fetch('https://localhost:44331/auth/sign-out', {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
        },
        body: null,
    });

    if (onFinally) {
        onFinally();
    }
}

export const RefreshJwtAsync = async (onSuccess, onFailure) => {
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
        if (onSuccess) {
            onSuccess(authenticatedUser);
        }
    }
    else {
        if (onFailure) {
            onFailure();
        }
    }
}