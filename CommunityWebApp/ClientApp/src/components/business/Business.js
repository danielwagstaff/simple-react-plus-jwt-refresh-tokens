import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Form, FormGroup, Input, Button, Collapse, CardBody, Card, Spinner, ButtonGroup } from 'reactstrap';
import { AuthContext } from '../authentication/Authentication';
import Restaurant from '../restaurant/Restaurant';
import AddRestaurant from '../restaurant/AddRestaurant';
import { GetUserRestaurantAsync, DeleteRestaurantAsync, UpdateNumberOfServingsAsync } from '../../services/restaurants/RestaurantsService';

export default function Business(props) {
    const authContext = useContext(AuthContext);
    const [restaurants, setRestaurants] = useState([]);
    const [isAddRestaurantFormOpen, setIsAddRestaurantFormOpen] = useState(false);
    const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
    const [okStatus, setOkStatus] = useState("");
    const [errorStatus, setErrorStatus] = useState("");

    function handleLogout(e) {
        e.preventDefault();
        authContext.signOut();
    }

    const getUserRestaurant = useCallback(
        async () => {
            setIsLoadingRestaurants(true);

            const onOk = (fetchedRestaurants) => {
                setIsLoadingRestaurants(false);
                setRestaurants(fetchedRestaurants);
            };

            const onInternalServerError = () => {
                setIsLoadingRestaurants(false);
                setErrorStatus("Sorry, but we are unable to fetch your restaurant, due to a problem with the website");
            };

            GetUserRestaurantAsync(authContext.currentUser.id, onOk, onInternalServerError
            );
        }, [authContext],
    );

    useEffect(() => {
        getUserRestaurant();
    }, [getUserRestaurant]);

    let displayRestaurants;
    if (restaurants.length === 0) {
        displayRestaurants =
            <div>
                <div>You have no registered restaurant yet</div>
                <Button
                    color="primary"
                    onClick={() => setIsAddRestaurantFormOpen(!isAddRestaurantFormOpen)}
                    style={{ marginBottom: '1rem' }}>
                    Add your restaurant
                </Button>
                <Collapse isOpen={isAddRestaurantFormOpen}>
                    <Card>
                        <CardBody>
                            <AddRestaurant
                                email={authContext.currentUser.email}
                                onAdded={() => {
                                    setIsAddRestaurantFormOpen(false);
                                    getUserRestaurant();
                                    setOkStatus("Restaurant successfully added");
                                    setTimeout(() => setOkStatus(""), 3000);
                                }} />
                        </CardBody>
                    </Card>
                </Collapse>
            </div>
    }
    else {
        displayRestaurants = restaurants.map(r =>
            <div className="py-2" key={r.businessName}>
                <Restaurant restaurant={r} />

                <hr />

                <UpdateNumberOfServings restaurantId={r.id} onSuccess={() => getUserRestaurant()} />

                <hr />

                <DeleteRestaurant
                    restaurantId={r.id}
                    onRestaurantDeleted={() => {
                        getUserRestaurant();
                        setOkStatus("Successfully removed restaurant");
                        setTimeout(() => { setOkStatus(""); }, 3000);
                    }}
                    onError={(msg) => {
                        setErrorStatus(msg);
                    }}
                />
            </div>);
    }

    return (
        <div>
            <Button color="secondary" className="float-right" onClick={handleLogout}>Logout</Button>
            <h2>Restaurant Details</h2>

            <Status status={errorStatus} isError={true} />
            <Status status={okStatus} />

            {displayRestaurants}

            <LoadingScreen show={isLoadingRestaurants} />
        </div>
    );
}

function Status({ status, isError }) {
    let bgColour;
    if (isError && isError === true) {
        bgColour = "bg-danger";
    }
    else{
        bgColour = "bg-success";
    };

    if (status) {
        return (
            <div className={`p-2 my-2 ${bgColour} text-white`}>
                {status}
            </div>
        );
    }
    else {
        return (<div></div>);
    }
}

function LoadingScreen({ show }) {
    if (show === true) {
        return (
            <div style={{
                backgroundColor: "rgba(112, 128, 144, 0.90)",
                position: "fixed",
                minHeight: "100vh",
                minWidth: "100vw",
                top: "0",
                left: "0",
                margin: "0"
            }}>
                <h1 style={{ padding: "10vw", color: "white", top: "50%", left: "50%", transform: "translate(-50%, -50%)", position: "absolute" }}>
                    Fetching your restaurant details...
                </h1>
            </div>);
    }
    else {
        return <div></div>;
    }
}

function DeleteRestaurant({ restaurantId, onRestaurantDeleted, onError }) {
    const authContext = useContext(AuthContext);
    const [isDeleteRequested, setIsDeleteRequested] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    function handleDelete(e) {
        e.preventDefault();

        const deleteRestaurant = () => {
            setIsDeleting(true);

            const onOk = () => {
                setIsDeleting(false);
                onRestaurantDeleted();
            };

            const onUnauthorized = () => {
                onError("Unable to remove restaurant as your session has timed out. Please log in again.");
            };

            const onForbidden = () => {
                onError("Unable to remove restaurant as you do not have permission to do this.");
            };

            const onNotFound = () => {
                onError("Sorry, but we are unable to remove your restaurant, due to a problem with the website");
            };

            const onInternalError = () => {
                onError("Sorry, but we are unable to remove your restaurant, due to a problem with the website");
            };

            DeleteRestaurantAsync(
                restaurantId,
                authContext.currentUser.jwt,
                onOk,
                onUnauthorized,
                onForbidden,
                onNotFound,
                onInternalError);
        };

        deleteRestaurant();
    }

    let displayButton;
    if (!isDeleting && !isDeleteRequested) {
        displayButton = (
            <Button color="danger" size="sm" onClick={() => setIsDeleteRequested(true)}>
                Remove restaurant?
            </Button>
        );
    }
    else if (isDeleteRequested) {
        displayButton = (
            <div>
                <div>Please confirm that you would like to remove your restaurant details - your restaurant will no longer participate.</div>
                <ButtonGroup>
                    <Button color="danger" size="sm" onClick={handleDelete}>Confirm</Button>
                    <Button color="secondary" size="sm" onClick={() => setIsDeleteRequested(false)}>Cancel</Button>
                </ButtonGroup>
            </div>
        );
    }
    else {
        displayButton = (
            <Button color="danger" size="sm" disabled>
                <Spinner color="light" size="sm" />
            </Button>
        );
    }

    return (
        <div>
            {displayButton}
        </div>
    );
}

function UpdateNumberOfServings({ restaurantId, onSuccess }) {
    const numberAvailableServingsDefaultValue = "enter number here";

    const authContext = useContext(AuthContext);
    const [errorStatus, setErrorStatus] = useState("");
    const [okStatus, setOkStatus] = useState("");
    const [numberAvailableServings, setNumberAvailableServings] = useState(numberAvailableServingsDefaultValue);

    function handleChange(e) {
        setNumberAvailableServings(e.target.value);
    }

    function handleUpdate(e) {
        e.preventDefault();

        setErrorStatus("");
        setOkStatus("");

        const onOk = () => {
            setNumberAvailableServings("");
            setOkStatus("Successfully updated number of available servings");
            setTimeout(() => setOkStatus(""), 3000);
            if (onSuccess) {
                onSuccess();
            }
        };

        const onBadRequest = () => {
            setErrorStatus("Please enter a valid number");
        };

        const onError = () => {
            setErrorStatus("Unable to update number of servings - please try again later");
        };

        UpdateNumberOfServingsAsync(
            restaurantId,
            numberAvailableServings,
            authContext.currentUser.jwt,
            onOk,
            onBadRequest,
            onError,
            onError,
            onError);
    }

    return (
        <div>
            <div>Number of available servings</div>
            <Form inline>
                <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                    <Input type="number" placeholder={numberAvailableServings} id="numberofservings" onChange={handleChange} />
                </FormGroup>
                <Button className="mb-2 mr-sm-2 mb-sm-0" color="primary" type="submit" onClick={handleUpdate} disabled={false}>
                    Update
                </Button>
            </Form>

            <Status className="mb-2 mr-sm-2 mb-sm-0" status={errorStatus} isError={true} />
            <Status className="mb-2 mr-sm-2 mb-sm-0" status={okStatus} />
        </div>
    );
}
