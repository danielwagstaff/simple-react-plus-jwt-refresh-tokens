import React, { useState, useEffect } from 'react';
import Restaurant from './Restaurant';
import { GetAllRestaurantsAsync } from '../../services/restaurants/RestaurantsService';

export default function FindRestaurants(props) {
    const [restaurants, setRestaurants] = useState([]);
    const [fetchRestaurantsStatus, setFetchRestaurantsStatus] = useState("");

    useEffect(() => {
        const onOk = (restaurants) => {
            setRestaurants(restaurants);
            setFetchRestaurantsStatus("");
        };

        const onError = () => {
            setFetchRestaurantsStatus("Sorry, but we are unable to fetch the restaurants, due to a problem with the website");
        };

        setFetchRestaurantsStatus("Retrieving restaurants...");

        GetAllRestaurantsAsync(onOk, onError);
    }, [/* only runs once */]);

    function buildUi() {
        if (restaurants.length > 0) {
            return (
                <div>
                    {
                        restaurants.sort((a, b) => b.numberOfAvailableServings - a.numberOfAvailableServings)
                            .map(r =>
                                <Restaurant restaurant={r} key={r.businessName + "-" + r.postCode} />
                            )
                    }
                </div>
            );
        }
        else if (fetchRestaurantsStatus.length === 0) {
            return (
                <div>No restaurants currently available</div>
            );
        }
        else {
            return (
                <div>{fetchRestaurantsStatus}</div>
            );
        }
    }

    return (
        <div>
            <h1>Participating restaurants</h1>
            {buildUi()}
        </div>
    );
}
