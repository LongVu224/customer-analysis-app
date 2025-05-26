import { useState, useEffect } from "react"
import { Spinner } from '../../components/Spinner'
import './Insights.scss';

const Insights = (props) => {

  console.log("Insights props ", props)

  useEffect(() => {
    props.onFetchInsights()
    props.onFetchSalesData()
  }, [props.onFetchInsights, props.onFetchSalesData])

  return (
    <div className="blog-root">
      {props.insights.loading ? 
          <Spinner /> : 
          <div className="wrap container">
          <h1 class="background"><span>Cabbage Collections</span></h1>

        </div>
      }
    </div>
  );
}

export default Insights;