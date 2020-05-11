import React from 'react';
import { CardBody, Card } from 'reactstrap';

export default function Restaurant({ restaurant }) {
    if (restaurant) {
        return (
            <Card>
                <CardBody>
                    <div>
                        <h3>{restaurant.businessName}</h3>
                    </div>
                    <div>
                        {restaurant.addressLine1}, {restaurant.addressLine2}, {restaurant.town}, {restaurant.county}, {restaurant.postCode}
                    </div>
                    <div>
                        tel: {restaurant.phone}
                    </div>
                    <div>
                        email: {restaurant.email}
                    </div>
                    <div>
                        Verified? {restaurant.isVerified === true ? "Yes" : "No"}
                    </div>
                    <div>
                        Number of available servings: {restaurant.numberOfAvailableServings}
                    </div>
                </CardBody>
            </Card>
        );
    }
    else {
        return (<div>No restaurants found</div>);
    }
}
