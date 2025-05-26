import {connect} from 'react-redux';

import Insights from './Insights.component';
import { insightsServiceInstance } from '../../components/axios/axios';
import withErrorHandler from '../../components/helper/ErrorHandler/withErrorHandler';
import * as insightsActions from './actions/Insights.fetch';
import * as salesActions from './actions/Sales.fetch';

const mapStateToProps = state => {
  return {
    ...state
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onFetchInsights: () => dispatch(insightsActions.fetchInsights()),
    onFetchSalesData: () => dispatch(salesActions.fetchSalesData())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(Insights, insightsServiceInstance));