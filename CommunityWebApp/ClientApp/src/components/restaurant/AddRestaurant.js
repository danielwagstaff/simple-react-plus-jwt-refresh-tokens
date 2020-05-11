import React, { useState, useContext } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { AuthContext } from '../authentication/Authentication';
import { AddNewRestaurantAsync } from '../../services/restaurants/RestaurantsService';

export default function AddRestaurant({ email, onAdded }) {
    const authContext = useContext(AuthContext);
    const businessName = useFormInput("");
    const addressLine1 = useFormInput("");
    const addressLine2 = useFormInput("");
    const town = useFormInput("");
    const county = useFormInput("");
    const postCode = useFormInput("");
    const phone = useFormInput("", (val) => val.replace(" ", ""));
    const [addingStatus, setAddingStatus] = useState("");
    const [validationErrors, setValidationErrors] = useState([]);

    function handleAddNewRestaurant(e) {
        e.preventDefault();

        const addNewRestaurant = async () => {
            setAddingStatus("Adding restaurant...");

            const onAddOk = () => {
                setAddingStatus("Added successfully");
                setValidationErrors([]);
                if (onAdded) {
                    onAdded();
                }
            };

            const onAddBadRequest = (validationErrors) => {
                setAddingStatus("Unable to add new restaurant due to the below errors");
                setValidationErrors(validationErrors);
            };

            const onAddUnauthorized = () => {
                setAddingStatus("Unable to add new restaurant as your session has timed out. Please log in again.");
                setValidationErrors([]);
            };

            const onAddForbidden = () => {
                setAddingStatus("Unable to add new restaurant as you are not authorized to perform that action.");
                setValidationErrors([]);
            };

            const onAddConflict = () => {
                setAddingStatus("Unable to add new restaurant as the same name and post code already exist.");
                setValidationErrors([]);
            };

            const onAddLocked = () => {
                setAddingStatus("Unable to add new restaurant because a restaurant is already assigned to this account.");
                setValidationErrors([]);
            };

            const onAddInternalError = () => {
                setAddingStatus("Sorry, but we are unable to add your restaurants, due to a problem with the website");
                setValidationErrors([]);
            };

            AddNewRestaurantAsync(
                authContext.currentUser.jwt,
                businessName.value,
                addressLine1.value,
                addressLine2.value,
                town.value,
                county.value,
                postCode.value,
                email,
                phone.value,
                onAddOk,
                onAddBadRequest,
                onAddUnauthorized,
                onAddForbidden,
                onAddConflict,
                onAddLocked,
                onAddInternalError
            );
        };

        addNewRestaurant();
    }

    return (
        <div>
            <Form>
                <FormGroup>
                    <Label for="businessname">Business name</Label>
                    <Input type="text" placeholder="business name" id="businessname" {...businessName} />
                </FormGroup>
                <FormGroup>
                    <Label for="email">Business email</Label>
                    <Input type="email" placeholder={email} id="email" disabled />
                </FormGroup>
                <FormGroup>
                    <Label for="addressline1">Address line 1</Label>
                    <Input type="text" placeholder="address line 1" id="addressline1" {...addressLine1} />
                </FormGroup>
                <FormGroup>
                    <Label for="addressline2">Address line 2</Label>
                    <Input type="text" placeholder="address line 2" id="addressline2" {...addressLine2} />
                </FormGroup>
                <FormGroup>
                    <Label for="town">Town</Label>
                    <Input type="text" placeholder="town" id="town" {...town} />
                </FormGroup>
                <FormGroup>
                    <Label for="county">County</Label>
                    <Input type="text" placeholder="county" id="county" {...county} />
                </FormGroup>
                <FormGroup>
                    <Label for="postcode">Post code</Label>
                    <Input type="text" placeholder="post code" id="postcode" {...postCode} />
                </FormGroup>
                <FormGroup>
                    <Label for="phone">Phone</Label>
                    <Input type="text" placeholder="01483 487958" id="phone" {...phone} />
                </FormGroup>
                <Status status={addingStatus} />
                <Button color="primary" type="submit" onClick={handleAddNewRestaurant} disabled={false}>
                    Submit
                </Button>
            </Form>
            {validationErrors.map(ve => <ValidationError message={ve} key={ve} />)}
        </div>
    );
}

function Status({ status }) {
    return (
        status
            ?
            <div className="p-2 my-2 bg-warning text-dark">
                {status}
            </div>
            :
            <div></div>
    );
}

function ValidationError({ message }) {
    if (message) {
        return (
            <div className="text-danger">
                {message}
            </div>
        );
    }
    else {
        return (
            <div></div>
        );
    }
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
