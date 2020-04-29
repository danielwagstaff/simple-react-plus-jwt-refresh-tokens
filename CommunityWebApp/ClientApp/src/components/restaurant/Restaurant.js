import React from 'react';
import { CardBody, Card } from 'reactstrap';

export default function Restaurant(props) {
    if (props.restaurant) {
        return (
            <Card>
                <CardBody>
                    <div>
                        <h3>{props.restaurant.businessName}</h3>
                    </div>
                    <div>
                        {props.restaurant.addressLine1}, {props.restaurant.addressLine2}, {props.restaurant.town}, {props.restaurant.county}, {props.restaurant.postCode}
                    </div>
                    <div>
                        tel: {props.restaurant.phone}
                    </div>
                    <div>
                        email: {props.restaurant.email}
                    </div>
                    <div>
                        Number of available servings: {props.restaurant.numberOfAvailableServings}
                    </div>
                </CardBody>
            </Card>
        );
    }
    else {
        return (<div>No restaurants found</div>);
    }
}
