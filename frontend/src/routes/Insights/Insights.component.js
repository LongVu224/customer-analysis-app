import { useState, useEffect, useRef } from "react"
import { Spinner } from '../../components/Spinner'
import BarChart from '../../components/Charts/BarChart/bar'
import LineChart from '../../components/Charts/LineChart/line'
import AreaChart from '../../components/Charts/AreaChart/area'
import Dashboard from '../../components/Dashboard'
import { HiOutlineChartPie, HiOutlineChartBar } from 'react-icons/hi2'
import './Insights.scss';

const Insights = (props) => {
  const [ insights, setInsights ] = useState([]);
  const [ groupId, setGroupId ] = useState("");
  const [ selectedGroup, setSelectedGroup ] = useState({});
  const [ selectedChart, setSelectedChart ] = useState("");
  const [ activeTab, setActiveTab ] = useState("dashboard");

  const { onFetchInsights, onFetchSalesData } = props;

  useEffect(() => {
    onFetchInsights();
    onFetchSalesData();
  }, [onFetchInsights, onFetchSalesData]);

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
      {/* Animated background elements */}
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {props.insights.loading ? 
        <Spinner /> : 
        <div className="wrap container">
          <h1 className="insights-title"><span>Insights</span></h1>
          
          {/* View Mode Tabs */}
          <div className="view-mode-tabs">
            <button 
              className={`view-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <HiOutlineChartPie /> Dashboard
            </button>
            <button 
              className={`view-tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <HiOutlineChartBar /> Detailed Charts
            </button>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="insights-dashboard-section">
              <Dashboard insights={insights} selectedGroupId={groupId} />
              
              {/* Group selector for filtered dashboard view */}
              <div className="insights-group mb-3 insights-menu" style={{ marginTop: '2rem' }}>
                <select 
                  className="form-control" 
                  value={groupId}
                  onChange={(e) => {
                    setGroupId(e.target.value)
                    setSelectedGroup(insights.find(insight => insight._id === e.target.value) || {})
                  }}
                >
                  <option value="">All Data (Aggregated View)</option>
                  {insights && insights.filter(i => i.sale).map((insight, index) => ( 
                    <option key={index} value={insight._id}>
                      {insight.sale.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Detailed Charts Tab */}
          {activeTab === 'details' && (
            <>
              <div className="insights-chart-box mb-3">
                <h4>Group Revenue Overview</h4>
                <BarChart 
                  height={400}
                  xaxisKey="groupTitle" 
                  dataKey="totalSales" 
                  data={insights.filter(i => i.sale).map(insight => ({
                    groupTitle: insight.sale.title,
                    totalSales: Number(insight.totalSales || insight.kpis?.totalRevenue || 0)
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
                  <option value="">Select Data Group</option>
                  {insights && insights.filter(i => i.sale).map((insight, index) => ( 
                    <option key={index} value={insight._id}>
                      {insight.sale.title}
                    </option>
                  ))}
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
                    <option value="">Select Chart Type</option>
                    <option value="trend">📈 Daily Revenue Trend</option>
                    <option value="sales">🌍 Country Sales Quantity</option>
                    <option value="revenue">💰 Country Revenue</option>
                    <option value="topProduct">📦 Top Product Sales</option>
                  </select>
                </div>
              }
              
              { (groupId && selectedChart === "trend") &&
                <div className="insights-chart-box mb-3">
                  <h4>Daily Revenue Trend</h4>
                  <LineChart
                    height={350}
                    xaxisKey="date" 
                    dataKey="revenue" 
                    data={(selectedGroup.dailyTrends || []).map(d => ({
                      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      revenue: d.revenue
                    }))}
                  />
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
              
              { (groupId && selectedChart === "topProduct") &&
                <div className="insights-chart-box mb-3">
                  <h4>Top Product Sales</h4>
                  <AreaChart 
                    xaxisKey="productId" 
                    dataKey="amount" 
                    data={selectedGroup.topProduct || []}
                  />
                </div>
              }
            </>
          )}
        </div>
      }
    </div>
  );
}

export default Insights;