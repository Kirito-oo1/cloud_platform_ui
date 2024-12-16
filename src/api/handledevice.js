// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const axios = require('axios');

const app = express();
//app.use(cors({ origin: 'http://localhost:8088' })); // 指定允许的前端地址
app.use(cors({ origin: '*' }));

app.use(express.json());
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

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
    headless: true, // 打开无头浏览器
    slowMo: 50,      // 添加延迟
    args: ['--no-sandbox', '--disable-setuid-sandbox']
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

// 解析设备返回的HTML，提取文件链接
function parseFileLinks(html) {
  const regex = /<a\s+href="([^"]+)">([^<]+)<\/a>/gi;
  const links = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const link = match[1].trim();
    // 排除上级目录的链接
    if (link !== '../') {
      links.push(link);
    }
  }
  return links;
}

/**
 * 递归获取目录下所有文件和其相对路径，并在遇到子目录时加入一个目录占位条目
 * @param {string} baseUrl 当前目录的URL（必须以/结尾）
 * @param {string} baseRelPath 当前目录的相对路径（ZIP中要保持的路径层级），以/结尾
 * @returns {Promise<{url: string|null, relativePath: string, isDirectory?: boolean}[]>}
 */
async function getAllFilesInDirectory(baseUrl, baseRelPath = '') {
  const response = await axios.get(baseUrl);
  const contentType = response.headers['content-type'] || '';

  // 如果不是HTML，说明是文件
  if (!contentType.includes('text/html')) {
    return [{
      url: baseUrl,
      relativePath: baseRelPath + path.basename(decodeURIComponent(baseUrl))
    }];
  }

  const fileLinks = parseFileLinks(response.data);
  let allEntries = [];

  for (const link of fileLinks) {
    const encodedLink = encodeURIComponent(link).replace(/%2F/g, '/');
    const fullUrl = `${baseUrl}${encodedLink}`;

    if (link.endsWith('/')) {
      // 子目录
      const newRelPath = baseRelPath + link; // 目录路径以/结尾
      // 先添加一个目录占位条目
      allEntries.push({
        url: null,
        relativePath: newRelPath,
        isDirectory: true
      });
      // 再递归获取子目录内容
      const subFiles = await getAllFilesInDirectory(fullUrl, newRelPath);
      allEntries = allEntries.concat(subFiles);
    } else {
      // 文件
      const filename = decodeURIComponent(link);
      allEntries.push({
        url: fullUrl,
        relativePath: baseRelPath + filename
      });
    }
  }

  return allEntries;
}

app.post('/api/download-folder', async (req, res) => {
  console.log('下载文件夹请求收到');
  let { port, folder } = req.body;

  // 去掉末尾多余的斜杠
  folder = folder.replace(/\/+$/, '');
  const deviceUrl = `http://47.96.137.124:${port}/${folder}/`;

  console.log('请求的文件夹路径:', folder);
  console.log('请求的deviceUrl:', deviceUrl);

  try {
    const allFiles = await getAllFilesInDirectory(deviceUrl, `${path.basename(folder)}/`);
    console.log('递归获取到的文件列表:', allFiles);

    if (allFiles.length === 0) {
      return res.status(404).json({ error: '文件夹为空或不存在' });
    }

    // 不设置Content-Length，只使用分块传输
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${path.basename(folder)}.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    req.on('close', () => {
      console.log('客户端断开连接，中止压缩');
      archive.abort();
    });

    archive.on('error', err => {
      console.error('压缩出错:', err);
      res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    for (const entry of allFiles) {
      console.log('Processing entry:', entry);
      if (entry.isDirectory) {
        // 添加空目录
        archive.append('', { name: entry.relativePath, mode: 0o755 });
      } else {
        // 文件
        const fileResponse = await axios.get(entry.url, { responseType: 'arraybuffer' });
        archive.append(Buffer.from(fileResponse.data), { name: entry.relativePath });
      }
    }

    await archive.finalize();
    console.log('文件打包完成并已发送');
  } catch (error) {
    console.error('下载文件夹失败:', error);
    res.status(500).json({ error: '无法下载文件夹' });
  }
});