import React, { useState, useContext } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { AuthContext } from '../authentication/Authentication';
import { Button, Form, FormGroup, FormText, Label, Input } from 'reactstrap';

export default function BusinessRegistration(props) {
    const authContext = useContext(AuthContext);
    const email = useFormInput("");
    const password = useFormInput("");
    const [passwordBoxType, setPasswordBoxType] = useState("password");
    const [registrationStatus, setRegistrationStatus] = useState("");
    const [validationErrors, setValidationErrors] = useState([]);

    function handleSubmit(event) {
        event.preventDefault();

        const onRegistrationConflict = () => {
            setRegistrationStatus("Registration failed. That email address has already been registered");
            setValidationErrors([]);
        };

        const onRegistrationBadRequest = (invalidParams) => {
            setRegistrationStatus("Registration failed");
            setValidationErrors(invalidParams);
        };

        const onRegistrationInternalError = () => {
            setRegistrationStatus("Registration failed due to website error");
            setValidationErrors([]);
        };

        setRegistrationStatus("Registering...");
        authContext.signUp(
            email.value,
            password.value,
            null, /* Do nothing for success, as once user is signed in, will be redirected */
            onRegistrationConflict,
            onRegistrationBadRequest,
            onRegistrationInternalError,
        );
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
                <h1>Business Registration</h1>

                <Form>
                    <FormGroup>
                        <Label for="email">Business email</Label>
                        <Input type="email" placeholder="name@example.com" id="email" {...email} />
                        <FormText>your publicly visible business contact email</FormText>
                    </FormGroup>
                    <FormGroup>
                        <Label for="password">Password</Label>
                        <Input type={passwordBoxType} placeholder="password" id="password" {...password} />
                    </FormGroup>
                    <FormGroup check>
                        <Label check>
                            <Input type="checkbox" onChange={handlePasswordVisibility} />
                            Show password?
                        </Label>
                    </FormGroup>
                    <Button color="primary" type="submit" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Form>

                <RegistrationStatus status={registrationStatus} />
                <span>{validationErrors.map(ve => <ValidationError message={ve} key={ve} />)}</span>

                <hr />

                <Link to={"/business/login"}>
                    <Button color="secondary">Login</Button>
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

function RegistrationStatus(props) {
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
