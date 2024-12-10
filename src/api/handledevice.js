//server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');


const app = express();
app.use(cors({ origin: 'http://localhost:8088' })); // 指定允许的前端地址
app.use(express.json());

// 连接MongoDB
mongoose.connect('mongodb://localhost:27017/deviceData', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

// 定义设备数据的Schema
const deviceSchema = new mongoose.Schema({
  model: String,
  satellite: String,
  longitude: String,
  latitude: String,
  elevation: String,
  syncStatus: String,
  LidarT: String,
  RTKstate: String,
  Duration: String,
  Controlpoints: String,
  Devicestorage: String,
  Licenseuntil: String,
  Version: String,
});

const Device = mongoose.model('Device', deviceSchema);

// 获取设备数据并保存到数据库
app.get('/api/fetch-device-data', async (req, res) => {
  const { port } = req.query;
  const browser = await puppeteer.launch({
    headless: false, // 打开浏览器窗口
    slowMo: 50,      // 添加延迟，便于调试
  });
  const page = await browser.newPage();
  const url = `http://47.96.137.124:${port}/html/index.html`;

  try {
    await page.setCacheEnabled(false);
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#product_model', { visible: true });

    const deviceInfo = await page.evaluate(() => {
      return {
        model: document.getElementById('product_model')?.textContent || '',
        satellite: document.getElementById('l_sat')?.textContent || '',
        longitude: document.getElementById('l_lon')?.textContent || '',
        latitude: document.getElementById('l_lat')?.textContent || '',
        elevation: document.getElementById('l_alt')?.textContent || '',
        syncStatus: document.getElementById('l_sync')?.textContent || '',
        LidarT: document.getElementById('hk_t_dev')?.textContent || '',
        RTKstate: document.getElementById('rtk')?.textContent || '',
        Duration: document.getElementById('TimeDifference')?.textContent || '',
        Controlpoints: document.getElementById('tri_tx_cnt')?.textContent || '',
        Devicestorage: `${document.getElementById('used_size1')?.textContent || ''} / ${document.getElementById('total_size1')?.textContent || ''} GB`,
        Licenseuntil: document.getElementById('License_until')?.textContent || '',
        Version: document.getElementById('Version')?.textContent || '',
      };
    });

    let device = await Device.findOne({ model: deviceInfo.model });
    if (device) {
      await Device.updateOne({ model: deviceInfo.model }, deviceInfo);
      res.json({ message: '设备数据已更新', device: deviceInfo });
    } else {
      device = new Device(deviceInfo);
      await device.save();
      res.json({ message: '设备数据已保存', device: deviceInfo });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await browser.close();
  }
});

// 获取所有设备数据
app.get('/api/get-all-devices', async (req, res) => {
  try {
    const devices = await Device.find();
    res.json({ devices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加设备
app.post('/api/add-device', async (req, res) => {
  try {
    const device = new Device(req.body);
    await device.save();
    res.json({ device });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除设备
app.post('/api/delete-devices', async (req, res) => {
  try {
    const { deviceIds } = req.body;
    await Device.deleteMany({ _id: { $in: deviceIds } });
    res.json({ message: '设备已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取文件夹列表
app.get('/api/get-folders', async (req, res) => {
  const { port } = req.query;
  const url = `http://47.96.137.124:${port}`;

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const folders = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => a.textContent);
    });

    await browser.close();

    res.json({ folders });
  } catch (error) {
    console.error('获取文件夹列表失败:', error);
    res.status(500).json({ error: '无法获取文件夹列表' });
  }
});


// 远程下载设备文件夹
// 导入 axios 模块
const axios = require('axios');

app.post('/api/download-folder', async (req, res) => {
  console.log('下载文件夹请求收到');

  const { port, folder } = req.body;
  const deviceUrl = `http://47.96.137.124:${port}/${folder}/`;

  console.log('请求的文件夹路径:', folder);

  try {
    // 获取文件列表
    const response = await axios.get(deviceUrl);
    const fileLinks = parseFileLinks(response.data);

    if (fileLinks.length === 0) {
      return res.status(404).json({ error: '文件夹为空或不存在' });
    }

    // 设置响应头，告诉浏览器这将是一个ZIP文件
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${folder}.zip`);

    // 创建压缩流
    const archive = archiver('zip', { zlib: { level: 9 } });

    // 当客户端断开连接时，终止压缩流
    req.on('close', () => {
      console.log('客户端断开');
      archive.abort();
    });

    // 当发生错误时，终止压缩并发送错误响应
    archive.on('error', err => {
      res.status(500).send({ error: err.message });
    });

    // 将压缩流连接到响应
    archive.pipe(res);

    // 下载文件并添加到压缩包
    for (const link of fileLinks) {
      const fileUrl = `${deviceUrl}${link}`;
      const fileResponse = await axios.get(fileUrl, { responseType: 'stream' });
      archive.append(fileResponse.data, { name: link });
    }

    // 结束并发送ZIP文件
    archive.finalize();
  } catch (error) {
    console.error('下载文件夹失败:', error);
    res.status(500).json({ error: '无法下载文件夹' });
  }
});

// 解析设备返回的HTML，提取文件链接
function parseFileLinks(html) {
  const regex = /<a href="([^"]+)">[^<]+<\/a>/g;
  const links = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const link = match[1];
    // 排除上级目录的链接
    if (link !== '../') {
      links.push(link);
    }
  }
  return links;
}











