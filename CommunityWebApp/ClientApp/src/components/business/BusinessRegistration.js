import React, { useState, useContext } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { AuthContext } from '../authentication/Authentication';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';

export default function BusinessRegistration(props) {
    const authContext = useContext(AuthContext);
    const firstName = useFormInput("");
    const lastName = useFormInput("");
    const email = useFormInput("");
    const password = useFormInput("");
    const businessPhone = useFormInput("", (val => val.replace(" ", "")));
    const [passwordBoxType, setPasswordBoxType] = useState("password");
    const [registrationStatus, setRegistrationStatus] = useState("");
    const [validationErrors, setValidationErrors] = useState([]);

    function handleRegister(event) {
        event.preventDefault();
        setRegistrationStatus("Registering...");
        authContext.register(
            firstName.value,
            lastName.value,
            email.value,
            password.value,
            businessPhone.value,
            (status) => {
                setRegistrationStatus(getRegistrationMessageFromStatus(status));
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
                <h1>Business Registration</h1>

                <Form>
                    <FormGroup>
                        <Label for="firstname">First name</Label>
                        <Input type="text" placeholder="first name" id="firstname" {...firstName} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="surname">Surname</Label>
                        <Input type="text" placeholder="surname" id="surname" {...lastName} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="phone">Business phone</Label>
                        <Input type="tel" placeholder="01483 487958" id="phone" {...businessPhone} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="email">Email address</Label>
                        <Input type="email" placeholder="name@example.com" id="email" {...email} />
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
                    <Button color="primary" type="submit" onClick={handleRegister}>
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

function useFormInput(initValue, validate) {
    const [value, setValue] = useState(initValue);

    function handleChange(e) {
        setValue(e.target.value);
    }

    function handleValidation(e) {
        if (validate) {
            setValue(validate(e.target.value));
        }
    }

    return {
        value,
        onChange: handleChange,
        onBlur: handleValidation,
    };
}

function getRegistrationMessageFromStatus({
    isBadRequest = false,
    isConflict = false,
    isInternalError = false,
    registrationFailed = false }) {
    if (!registrationFailed()) {
        return "Registered";
    }
    else if (isBadRequest) {
        return "Registration failed";
    }
    else if (isConflict) {
        return "Registration failed. That email address has already been registered";
    }
    else if (isInternalError) {
        return "Registration failed due to website error";
    }
    else {
        console.error("unhandled registration status");
        return "Registration failed due to website error";
    }
}
