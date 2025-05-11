import {connect} from 'react-redux';

import Home from './Home.component';
import axios from '../../components/axios/axios';
import withErrorHandler from '../../components/helper/ErrorHandler/withErrorHandler';
import * as actions from './actions/Home.upload';

const mapStateToProps = state => {
    return {
        ...state
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onUploadFile: (file) => dispatch(actions.uploadFile(file))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(Home, axios));