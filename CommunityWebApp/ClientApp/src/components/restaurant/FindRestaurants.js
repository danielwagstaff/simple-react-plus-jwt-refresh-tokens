import React, { useState, useEffect } from 'react';
import Restaurant from './Restaurant';

export default function FindRestaurants(props) {
    const [restaurants, setRestaurants] = useState([]);
    const [fetchRestaurantsStatus, setFetchRestaurantsStatus] = useState("");

    useEffect(() => {
        async function getAllRestaurants() {
            setFetchRestaurantsStatus("Retrieving restaurants...");

            const response = await fetch('https://localhost:44305/restaurant', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: null,
            });

            if (response.status >= 200 && response.status <= 299) {
                const restaurants = await response.json();
                setRestaurants(restaurants);
                setFetchRestaurantsStatus("");
            }
            else {
                setFetchRestaurantsStatus("Sorry, but we are unable to fetch the restaurants, due to a problem with the website");
            }
        };

        getAllRestaurants();
    }, [/* only runs once */]);

    function buildUi() {
        if (restaurants.length > 0) {
            return (
                <div>
                    {restaurants.map(r => <Restaurant restaurant={r} key={r.businessName} />)}
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
