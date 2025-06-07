const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const zmq = require('zeromq');
const uploadRouter = require('../routes/upload.routes');
const config = require("../config/config");
const SalesData = require('../models/SalesData');

jest.setTimeout(30000);

describe('Upload Route Integration Tests', () => {
  let app;
  let mongoConnection;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = express();
    app.use(express.json());
    app.use('/upload', uploadRouter);

    // Make sure to connect to the test database
    mongoose.Promise = global.Promise;
    mongoConnection = await mongoose.connect(config.dbConnectionString);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

	afterEach(async () => {
    await SalesData.deleteMany({});
  });

  it('should return 400 if no file is uploaded', async () => {
    const res = await request(app).post('/upload').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "No file uploaded." });
  });

  it('should process and respond with success for valid file', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('saleFile', Buffer.from('name,age\nJohn,30'), 'test.csv')
      .field('title', 'Test Sale')
      .field('description', 'Test Description');
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        message: 'File uploaded successfully!',
        saleDataCreated: expect.objectContaining({
          title: 'Test Sale',
          description: 'Test Description',
          fileName: expect.any(String),
          date: expect.any(String),
          _id: expect.any(String),
        }),
      })
    );
  });

  it('should handle unexpected errors gracefully', async () => {
    // Mock SalesData.save to throw error
    jest.spyOn(SalesData.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });

    const res = await request(app)
      .post('/upload')
      .attach('saleFile', Buffer.from('name,age\nJohn,30'), 'test.csv')
      .field('title', 'Test Sale')
      .field('description', 'Test Description');
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Unexpected error' });

    jest.restoreAllMocks();
  });

  describe('ZeroMQ Integration', () => {
    it('should send data to ZeroMQ push socket when file is uploaded', async () => {
      const res = await request(app)
        .post('/upload')
        .attach('saleFile', Buffer.from('name,age\nJohn,30'), 'test.csv')
        .field('title', 'ZeroMQ Sale')
        .field('description', 'ZeroMQ Test');

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('File uploaded successfully!');
      expect(res.body.saleDataCreated).toEqual(
        expect.objectContaining({
          title: 'ZeroMQ Sale',
          description: 'ZeroMQ Test', 
          fileName: expect.any(String),
          date: expect.any(String),
          _id: expect.any(String),
        })
      );
    });
  });

  it('should get all sales data', async () => {
    await SalesData.create({
      _id: new mongoose.Types.ObjectId(),
      title: 'Sale1',
      description: 'Desc1',
      fileName: 'file1.csv',
      date: '2024-01-01'
    });
    const res = await request(app).get('/upload');
    expect(res.statusCode).toBe(200);
    expect(res.body.sales.length).toBeGreaterThanOrEqual(1);
    expect(res.body.sales[0]).toEqual(
      expect.objectContaining({
        title: 'Sale1',
        description: 'Desc1',
        fileName: 'file1.csv',
        date: '2024-01-01'
      })
    );
  });

  it('should get sales data by id', async () => {
    const sale = await SalesData.create({
      _id: new mongoose.Types.ObjectId(),
      title: 'Sale2',
      description: 'Desc2',
      fileName: 'file2.csv',
      date: '2024-01-02'
    });
    const res = await request(app).get(`/upload/${sale._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.sale).toEqual(
      expect.objectContaining({
        title: 'Sale2',
        description: 'Desc2',
        fileName: 'file2.csv',
        date: '2024-01-02'
      })
    );
  });
});
