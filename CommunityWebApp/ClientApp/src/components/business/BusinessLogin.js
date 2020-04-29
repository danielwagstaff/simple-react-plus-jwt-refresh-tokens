import React, { useState, useContext } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { AuthContext } from '../authentication/Authentication';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';

export default function BusinessLogin(props) {
    const authContext = useContext(AuthContext);
    const email = useFormInput("");
    const password = useFormInput("");
    const [passwordBoxType, setPasswordBoxType] = useState("password");
    const [loginStatus, setLoginStatus] = useState("");
    const [validationErrors, setValidationErrors] = useState([]);

    function handleLogin(e) {
        e.preventDefault();
        setLoginStatus("Logging in...");
        authContext.login(
            email.value,
            password.value,
            (status) => {
                setLoginStatus(getLoginMessageFromStatus(status));
                setValidationErrors(Object.values(status.validationErrors));
            });
    }

    function handlePasswordVisibility(e) {
        if (e.target.checked) {
            setPasswordBoxType("text");
        }
        else {
            setPasswordBoxType("password");
        }
    }

    if (authContext.currentUser == null) {
        return (
            <div >
                <h1>Login</h1>

                <Form>
                    <FormGroup>
                        <Label for="email">Email address</Label>
                        <Input type="email" placeholder="name@example.com" name="username" id="email" {...email} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="password">Password</Label>
                        <Input type={passwordBoxType} placeholder="password" {...password} id="password" />
                    </FormGroup>
                    <FormGroup check>
                        <Label check>
                            <Input type="checkbox" onChange={handlePasswordVisibility} />
                                    Show password?
                                </Label>
                    </FormGroup>
                    <Button color="primary" type="submit" onClick={handleLogin}>
                        Submit
                            </Button>
                </Form>

                <LoginStatus status={loginStatus} />
                <span>{validationErrors.map(ve => <ValidationError message={ve} key={ve} />)}</span>

                <hr />

                <Link to={"/business/register"}>
                    <Button color="secondary">Register</Button>
                </Link>
            </div>
        );
    }
    else {
        return (
            <Redirect to='/business' />
        );
    }
}

function LoginStatus(props) {
    return (
        props.status
            ?
            <div className="p-2 my-2 bg-warning text-dark">
                {props.status}
            </div>
            :
            <div></div>
    );
}

function ValidationError(props) {
    return (
        props.message
            ?
            <div className="text-danger">
                {props.message}
            </div>
            :
            <div></div>
    );
}

function useFormInput(initValue) {
    const [value, setValue] = useState(initValue);

    function handleChange(e) {
        setValue(e.target.value);
    }

    return {
        value,
        onChange: handleChange
    };
}

function getLoginMessageFromStatus({ loginFailed = false, isBadRequest = false, isUnathorized = false, isInternalError = false }) {
    if (!loginFailed()) {
        return "Logged in";
    }
    else if (isBadRequest) {
        return "Login failed";
    }
    else if (isUnathorized) {
        return "Login failed. Wrong username or password";
    }
    else if (isInternalError) {
        return "Login failed, due to website error";
    }
    else {
        console.error("unhandled login status");
        return "Login failed due to website error";
    }
}
