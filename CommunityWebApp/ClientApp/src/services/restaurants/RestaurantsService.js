
export const AddNewRestaurantAsync = async (
    jwt,
    businessName,
    addressLine1,
    addressLine2,
    town,
    county,
    postCode,
    email,
    phone,
    onAddOk,
    onAddBadRequest,
    onAddUnauthorized,
    onAddForbidden,
    onAddConflict,
    onAddLocked,
    onAddInternalError) =>
{
    const response = await fetch('https://localhost:44305/restaurant', {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
        },
        body: JSON.stringify({
            businessName: businessName,
            addressLine1: addressLine1,
            addressLine2: addressLine2,
            town: town,
            county: county,
            postCode: postCode,
            email: email,
            phone: phone
        }),
    });

    if (response.status >= 200 && response.status <= 299) {
        if (onAddOk) {
            onAddOk();
        };
    }
    else if (response.status === 400) {
        if (onAddBadRequest) {
            let result = await response.json();
            let validationErrors = [];
            for (let field in result.errors) {
                validationErrors.push(result.errors[field][0]);
            }
            onAddBadRequest(validationErrors);
        };
    }
    else if (response.status === 401) {
        if (onAddUnauthorized) {
            onAddUnauthorized();
        };
    }
    else if (response.status === 403) {
        if (onAddForbidden) {
            onAddForbidden();
        };
    }
    else if (response.status === 409) {
        if (onAddConflict) {
            onAddConflict();
        };
    }
    else if (response.status === 423) {
        if (onAddLocked) {
            onAddLocked();
        }
    }
    else {
        if (onAddInternalError) {
            onAddInternalError();
        };
    }
}

export const UpdateNumberOfServingsAsync = async (restaurantId, numberAvailableServings, jwt, onOk, onBadRequest, onForbidden, onNotFound, onError) => {
    const response = await fetch('https://localhost:44305/restaurant/' + restaurantId + '/servings/' + numberAvailableServings, {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
        },
        body: null,
    });

    if (response.status >= 200 && response.status <= 299) {
        if (onOk) {
            onOk();
        }
    }
    else if (response.status === 400) {
        if (onOk) {
            onOk();
        }
    }
    else if (response.status === 401) {
        if (onBadRequest) {
            onBadRequest();
        };
    }
    else if (response.status === 403) {
        if (onForbidden) {
            onForbidden();
        };
    }
    else if (response.status === 404) {
        if (onNotFound) {
            onNotFound();
        };
    }
    else {
        if (onError) {
            onError();
        }
    }
};

export const GetAllRestaurantsAsync = async (onOk, onError) => {
    const response = await fetch('https://localhost:44305/restaurant', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        body: null,
    });

    if (response.status >= 200 && response.status <= 299) {
        if (onOk) {
            const restaurants = await response.json();
            onOk(restaurants);
        }
    }
    else {
        if (onError) {
            onError();
        }
    }
}

export const GetUserRestaurantAsync = async (currentUserId, onOk, onError) => {
    const paramOwnerId = currentUserId != null ? "ownerId=" + currentUserId : "";
    const response = await fetch('https://localhost:44305/restaurant?' + paramOwnerId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        body: null,
    });

    if (response.status >= 200 && response.status <= 299) {
        if (onOk) {
            const restaurants = await response.json();
            onOk(restaurants);
        }
    }
    else {
        if (onError) {
            onError();
        }
    }
}

export const DeleteRestaurantAsync = async (restaurantId, jwt, onOk, onUnauthorized, onForbidden, onNotFound, onInternalError) => {
    const response = await fetch('https://localhost:44305/restaurant/' + restaurantId, {
        credentials: 'include',
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
        },
        body: null,
    });

    if (response.status >= 200 && response.status <= 299) {
        if (onOk) {
            onOk();
        }
    }
    else if (response.status === 401) {
        if (onUnauthorized) {
            onUnauthorized();
        }
    }
    else if (response.status === 403) {
        if (onForbidden) {
            onForbidden();
        }
    }
    else if (response.status === 404) {
        if (onNotFound) {
            onNotFound();
        };
    }
    else {
        if (onInternalError) {
            onInternalError();
        }
    }
}