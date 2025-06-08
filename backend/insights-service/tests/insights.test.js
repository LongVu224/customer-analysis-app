const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const zmq = require('zeromq');
const { insightsApi, insightsWorker } = require('../routes/insights.routes');
const config = require('../config/config');
const Insights = require('../models/Insights');

jest.setTimeout(30000);

describe('Insights Route Test', () => {
	let app;
	let mongoConnection;

	beforeAll(async () => {
		process.env.NODE_ENV = 'test';
		app = express();
		app.use(express.json());
		app.use('/insights', insightsApi);

		// Make sure to connect to the test database
		mongoose.Promise = global.Promise;
		mongoConnection = await mongoose.connect(config.dbConnectionString);
	});

	afterAll(async () => {
		await mongoose.connection.close();
	});

	afterEach(async () => {
		await Insights.deleteMany({});
	});

	it('should get all insights', async () => {
		await Insights.create({
			_id: new mongoose.Types.ObjectId(),
			salesId: 'sales1'
		});
		const res = await request(app).get('/insights');

		expect(res.statusCode).toBe(200);
		expect(Array.isArray(res.body.insights)).toBe(true);
		expect(res.body.insights[0].salesId).toBe('sales1');
	});

	it('should get insights by salesId', async () => {
		const mockSalesId = new mongoose.Types.ObjectId();
		await Insights.create({
			_id: new mongoose.Types.ObjectId(),
			salesId: mockSalesId.toString()
		});
		const res = await request(app).get(`/insights/${mockSalesId.toString()}`);

		expect(res.statusCode).toBe(200);
		expect(res.body.insights.salesId).toBe(mockSalesId.toString());
	});
});

describe("ZeroMQ Integration", () => {
	let pushSocket;
	let mongoConnection;

	beforeAll(async () => {
		process.env.NODE_ENV = 'test';

		// Connect to MongoDB
		mongoose.Promise = global.Promise;
		mongoConnection = await mongoose.connect(config.dbConnectionString);

		pushSocket = new zmq.Push();
		await pushSocket.connect("tcp://127.0.0.1:65439");
	});

	afterAll(async () => {
		await pushSocket.close();
		await Insights.deleteMany({});
		await mongoose.connection.close();
	});

  it("should process message and save insights", async () => {
		// Mock data to send
		const mockData = {
			_id: new mongoose.Types.ObjectId(),
			fileName: 'test-sales.csv'
		};
		await pushSocket.send(JSON.stringify(mockData));

		insightsWorker()

		// Wait for a short time to allow the worker to process the message
		await new Promise(resolve => setTimeout(resolve, 10000));
		const insights = await Insights.findOne({ salesId: mockData._id.toString() });

		expect(insights.salesId).toBe(mockData._id.toString());
		expect(insights.totalSales).toBe("1000");
	});
});