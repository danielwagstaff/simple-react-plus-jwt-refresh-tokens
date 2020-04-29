import React, { useContext } from 'react';
import { Route } from 'react-router';
import { Redirect } from 'react-router-dom';
import Layout from './shared/Layout';
import Home from './home/Home';
import FindRestaurants from './restaurant/FindRestaurants'
import Business from './business/Business';
import BusinessRegistration from './business/BusinessRegistration';
import BusinessLogin from './business/BusinessLogin';
import { AuthContext, AuthContextProvider } from './authentication/Authentication';

import './bootstrap.min.css';

export default function App(props) {
    return (
        <AuthContextProvider>
            <Layout>
                <Route exact path='/' component={Home} />
                <Route exact path='/restaurants' component={FindRestaurants} />
                <PrivateRoute exact path='/business' component={Business} />
                <Route exact path='/business/register' component={BusinessRegistration} />
                <Route exact path='/business/login' component={BusinessLogin} />
            </Layout>
        </AuthContextProvider>
    );
}

const PrivateRoute = ({ component: Component, ...rest }) => {
    const authContext = useContext(AuthContext);
    return (
        <Route {...rest} render={(props) => (
            authContext.currentUser != null
                ? <Component {...props} currentUser={authContext.currentUser} />
                : <Redirect to="/business/login" />
        )} />
    );
}
