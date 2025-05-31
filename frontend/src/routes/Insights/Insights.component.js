import { useState, useEffect, useRef } from "react"
import { Spinner } from '../../components/Spinner'
import BarChart from '../../components/Charts/BarChart/bar'
import LineChart from '../../components/Charts/LineChart/line'
import './Insights.scss';

const Insights = (props) => {
  const [ insights, setInsights ] = useState([]);
  const [ groupId, setGroupId ] = useState("");
  const [ selectedGroup, setSelectedGroup ] = useState({});
  const [ selectedChart, setSelectedChart ] = useState("");

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

  // Ref to reset chart select
  const chartSelectRef = useRef(null);

  return (
    <div className="insights-root">
      {props.insights.loading ? 
        <Spinner /> : 
        <div className="wrap container">
          <h1 className="insights-title"><span>Insights Collection</span></h1>
          <div className="insights-chart-box mb-3">
            <h4>Group revenue</h4>
            <BarChart 
              height={400}
              xaxisKey="groupTitle" 
              dataKey="totalSales" 
              data={insights.map(insight => ({
                groupTitle: insight.sale.title,
                totalSales: Number(insight.totalSales)
              }))}
            />
          </div>
          <div className="insights-group mb-3 insights-menu">
            <select 
              className="form-control" 
              onChange={(e) => {
                setGroupId(e.target.value)
                setSelectedGroup(insights.find(insight => insight._id === e.target.value) || {})
                setSelectedChart("")
                if (chartSelectRef.current) {
                  chartSelectRef.current.selectedIndex = 0;
                }
              }}
            >
              <option value="">Select Insights Group</option>
              {insights ? insights.map((insight, index) => ( 
                <option key={index} value={insight._id}>
                  {insight.sale.title}
                </option>
              )) : null}
            </select>
          </div>
          { groupId &&
            <div className="insights-group mb-3 insights-menu">
              <select
                className="form-control"
                ref={chartSelectRef}
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
              >
                <option value="">Select Insights Chart</option>
                <option value="sales">Country Sales Quantity</option>
                <option value="revenue">Country Revenue</option>
                <option value="topProduct">Top Product Sales</option>
              </select>
            </div>
          }
          { (groupId && selectedChart === "sales") &&
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
          { (groupId && selectedChart === "revenue") &&
            <div className="insights-chart-box mb-3">
              <h4>Revenue by Country</h4>
              <LineChart
                xaxisKey="country" 
                dataKey="revenue" 
                data={Object.entries(selectedGroup.countrySales || {}).map(([country, value]) => ({
                  country,
                  revenue: value,
                }))}
              />
            </div>
          }
          {
            (groupId && selectedChart === "topProduct") &&
            <div className="insights-chart-box mb-3">
              <h4>Top Product Sales</h4>
              <BarChart 
                xaxisKey="productId" 
                dataKey="amount" 
                data={selectedGroup.topProduct || []}
              />
            </div>
          }
        </div>
      }
    </div>
  );
}

export default Insights;