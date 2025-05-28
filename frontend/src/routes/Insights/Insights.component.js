import { useState, useEffect } from "react"
import { Spinner } from '../../components/Spinner'
import BarChart from '../../components/Charts/BarChart/bar'
import './Insights.scss';

const Insights = (props) => {
  const [ insights, setInsights ] = useState([]);
  const [ groupId, setGroupId ] = useState("");
  const [ selectedGroup, setSelectedGroup ] = useState({});

  console.log("Insights props ", props)

  useEffect(() => {
    props.onFetchInsights()
    props.onFetchSalesData()
  }, [props.onFetchInsights, props.onFetchSalesData])

  // Merge insights with sales data
  useEffect(() => {
    if (props.insights.insights && props.insights.salesData) {
      // Ensure both are arrays
      const insightsArr = Array.isArray(props.insights.insights) ? props.insights.insights : [props.insights.insights];
      const salesArr = Array.isArray(props.insights.salesData) ? props.insights.salesData : [props.insights.salesData];

      // Map sales by _id for quick lookup
      const salesMap = {};
      salesArr.forEach(sale => {
      salesMap[sale._id] = sale;
      });

      // Merge
      const merged = insightsArr.map(insight => {
        const sale = salesMap[insight.salesId];
        return {
          ...insight,
          sale: sale || null
        };
      });

      setInsights(merged);
    }
  }, [props.insights.insights, props.insights.salesData]);

  return (
    <div className="insights-root">
      {props.insights.loading ? 
        <Spinner /> : 
        <div className="wrap container">
          <h1 class="insights-title"><span>Insights Collection</span></h1>
          <div className="insights-group mb-3 insights-menu">
            <select className="form-control" onChange={(e) => {setGroupId(e.target.value); setSelectedGroup(insights.find(insight => insight._id === e.target.value) || {})}}>
              <option value="">Select Insights Group</option>
              {insights ? insights.map((insight, index) => ( 
                <option key={index} value={insight._id}>
                  {insight.sale.title}
                </option>
              )) : null}
            </select>
          </div>
          { groupId &&
            <div className="insights-chart-box mb-3">
              <h4>Sales Quantity by Country</h4>
              <BarChart 
                xaxisKey="country" 
                dataKey="sales" 
                data={Object.entries(selectedGroup.countryQuantitySales || {}).map(([country, value]) => ({
                  country,
                  sales: value,
                }))}
              />
            </div>
          }
        </div>
      }
    </div>
  );
}

export default Insights;