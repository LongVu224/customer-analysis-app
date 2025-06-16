import {connect} from 'react-redux';

import Monitor from './Monitor.component';
import { monitorServiceInstance } from '../../components/axios/axios';
import withErrorHandler from '../../components/helper/ErrorHandler/withErrorHandler';
import * as monitorActions from './actions/Monitor.fetch';

const mapStateToProps = state => {
  return {
    ...state
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onFetchProcessLog: (serviceName) => dispatch(monitorActions.fetchProcessLogs(serviceName))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(Monitor, monitorServiceInstance));