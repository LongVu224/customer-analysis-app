import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import {legacy_createStore as createStore, applyMiddleware, compose, combineReducers} from 'redux';
import {thunk} from 'redux-thunk';
import history from './components/helper/History/history';
import App from './App';
import homeReducer from './routes/Home/Home.reducer';
import insightsReducer from './routes/Insights/Insights.reducer';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Combine reducer to 1 root reducer
const RootReducer = combineReducers({
    home: homeReducer,
    insights: insightsReducer
});

// Configure store with middleware and Redux DevTools
const store = createStore(RootReducer, composeEnhancers(
    applyMiddleware(thunk)
));

const app = (
    <Provider store={store}>
        <BrowserRouter history={history}>
          <Routes>
            <Route path="/" element={ <App /> }>
            <Route path="/Insights" element={ <App /> }></Route>
            </Route>
        </Routes>
        </BrowserRouter>
    </Provider>
)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(app);