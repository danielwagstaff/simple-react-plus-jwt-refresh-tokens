import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Button, Collapse, CardBody, Card, Form, FormGroup, Label, Input, Spinner } from 'reactstrap';
import { AuthContext } from '../authentication/Authentication';
import Restaurant from '../restaurant/Restaurant';

export default function Business(props) {
    const authContext = useContext(AuthContext);
    const [userRestaurants, setUserRestaurants] = useState([]);
    const [fetchRestaurantsStatus, setFetchRestaurantsStatus] = useState("");
    const [isAddRestaurantFormOpen, setIsAddRestaurantFormOpen] = useState(false);
    const [mainStatus, setMainStatus] = useState("");

    function toggleAddRestaurantForm() {
        setIsAddRestaurantFormOpen(!isAddRestaurantFormOpen);
    }

    function handleLogout(e) {
        e.preventDefault();
        authContext.logout();
    }

    const getAllBusinessesForUser = useCallback(
        async () => {
            setFetchRestaurantsStatus("Retrieving your restaurants...");

            const currentUserId = authContext.currentUser.id;
            const paramOwnerId = currentUserId != null ? "ownerId=" + currentUserId : "";
            const response = await fetch('https://localhost:44305/restaurant?' + paramOwnerId, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: null,
            });

            if (response.status >= 200 && response.status <= 299) {
                const restaurants = await response.json();
                setUserRestaurants(restaurants);
                setFetchRestaurantsStatus("");
            }
            else if (response.status === 401 || response.status === 403) {
                authContext.logout();
            }
            else {
                setFetchRestaurantsStatus("Sorry, but we are unable to fetch your restaurants, due to a problem with the website");
            }
        }, [authContext],
    );

    useEffect(() => {
        getAllBusinessesForUser();
    }, [getAllBusinessesForUser]);

    let restaurants;
    if (userRestaurants.length > 0) {
        restaurants = userRestaurants.map(r =>
            <div className="py-2" key={r.businessName}>
                <Restaurant restaurant={r} />
                <DeleteRestaurant
                    restaurantId={r.id}
                    jwt={authContext.currentUser.jwt}
                    onRestaurantDeleted={() => {
                        getAllBusinessesForUser();
                        setMainStatus("Successfully deleted restaurant");
                        setTimeout(() => { setMainStatus(""); }, 3000);
                    }}
                    onError={(msg) => {
                        setMainStatus(msg);
                    }} />
            </div>
        );
    }
    else {
        restaurants = <div>You have no registered restaurants yet</div>
    }

    return (
        <div>
            <Button color="secondary" className="float-right" onClick={handleLogout}>Logout</Button>
            <h2>Hello, {props.currentUser.firstName} {props.currentUser.lastName}</h2>

            <h1>Your Restaurants</h1>
            <Button color="primary" onClick={toggleAddRestaurantForm} style={{ marginBottom: '1rem' }}>Add a business</Button>
            <MainStatus status={mainStatus} />
            <Collapse isOpen={isAddRestaurantFormOpen}>
                <Card>
                    <CardBody>
                        <AddRestaurant onRestaurantAdded={() => {
                            setIsAddRestaurantFormOpen(false);
                            getAllBusinessesForUser();
                            setMainStatus("Successfully added restaurant");
                            setTimeout(() => { setMainStatus(""); }, 3000);
                        }} jwt={authContext.currentUser.jwt} />
                    </CardBody>
                </Card>
                <hr />
            </Collapse>

            <FetchRestaurantsStatus status={fetchRestaurantsStatus} />
            {restaurants}
        </div>
    );
}

function MainStatus(props) {
    if (props.status) {
        return (
            <div className="p-2 my-2 bg-success text-white">
                {props.status}
            </div>
        );
    }
    else {
        return (<div></div>);
    }
}

function FetchRestaurantsStatus(props) {
    if (props.status) {
        return (
            <div className="p-2 my-2 bg-warning text-dark">
                {props.status}
            </div>
        );
    }
    else {
        return (<div></div>);
    }
}

function AddRestaurant(props) {
    const businessName = useFormInput("");
    const addressLine1 = useFormInput("");
    const addressLine2 = useFormInput("");
    const town = useFormInput("");
    const county = useFormInput("");
    const postCode = useFormInput("");
    const email = useFormInput("");
    const phone = useFormInput("", (val) => val.replace(" ", ""));
    const [addingStatus, setAddingStatus] = useState("");
    const [validationErrors, setValidationErrors] = useState([]);

    function handleAddNewRestaurant(e) {
        e.preventDefault();
        addNewRestaurant();
    }

    async function addNewRestaurant() {

        setAddingStatus("Adding restaurant...");

        const response = await fetch('https://localhost:44305/restaurant', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + props.jwt
            },
            body: JSON.stringify({
                businessName: businessName.value,
                addressLine1: addressLine1.value,
                addressLine2: addressLine2.value,
                town: town.value,
                county: county.value,
                postCode: postCode.value,
                email: email.value,
                phone: phone.value
            }),
        });

        if (response.status >= 200 && response.status <= 299) {
            props.onRestaurantAdded();
            setAddingStatus("");
        }
        else if (response.status === 400) {
            setAddingStatus("Unable to add new restaurant due to the below errors");
            let result = await response.json();
            let validationErrors = [];
            for (let field in result.errors) {
                validationErrors.push(result.errors[field][0]);
            }
            setValidationErrors(validationErrors);
        }
        else if (response.status === 401 || response.status === 403) {
            setAddingStatus("Unable to add new restaurant as your session has timed out. Please log in again.");
        }
        else if (response.status === 409) {
            setAddingStatus("Unable to add new restaurant as the same name and post code already exist.");
        }
        else {
            setAddingStatus("Sorry, but we are unable to add your restaurants, due to a problem with the website");
        }
    }

    return (
        <div>
            <Form>
                <FormGroup>
                    <Label for="businessname">Business name</Label>
                    <Input type="text" placeholder="business name" id="businessname" {...businessName} />
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
                    <Label for="email">Email</Label>
                    <Input type="email" placeholder="name@example.com" id="email" {...email} />
                </FormGroup>
                <FormGroup>
                    <Label for="phone">Phone</Label>
                    <Input type="text" placeholder="01483 487958" id="phone" {...phone} />
                </FormGroup>
                <Button color="primary" type="submit" onClick={handleAddNewRestaurant} disabled={false}>
                    Submit
            </Button>
            </Form>
            <Status status={addingStatus} />
            {validationErrors.map(ve => <ValidationError message={ve} key={ve} />)}
        </div>
    );
}

function ValidationError(props) {
    if (props.message) {
        return (
            <div className="text-danger">
                {props.message}
            </div>
        );
    }
    else {
        return (
            <div></div>
        );
    }
}

function DeleteRestaurant(props) {
    const [isDeleting, setIsDeleting] = useState(false)

    function handleDelete(e) {
        e.preventDefault();
        deleteRestaurant();
    }

    async function deleteRestaurant() {
        setIsDeleting(true);

        const response = await fetch('https://localhost:44305/restaurant/' + props.restaurantId, {
            credentials: 'include',
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + props.jwt
            },
            body: null,
        });

        if (response.status >= 200 && response.status <= 299) {
            props.onRestaurantDeleted();
        }
        else if (response.status === 401 || response.status === 403) {
            props.onError("Unable to add new restaurant as your session has timed out. Please log in again.");
        }
        else if (response.status === 409) {
            props.onError("Unable to add new restaurant as the same name and post code already exist.");
        }
        else {
            props.onError("Sorry, but we are unable to add your restaurants, due to a problem with the website");
        }

        setIsDeleting(false);
    }

    let button;
    if (!isDeleting) {
        button = (
            <Button color="danger" size="sm" onClick={handleDelete}>
                DELETE
            </Button>);
    }
    else {
        button = (
            <Button color="danger" size="sm" onClick={handleDelete} disabled>
                <Spinner color="light" size="sm" />
            </Button>);
    }

    return (
        <div className="text-right">
            {button}
        </div>
    );
}

function Status(props) {
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
